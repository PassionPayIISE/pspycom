import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import {
  approveMemberAction,
  rejectMemberAction,
  makeAdminAction,
  revokeToMemberAction,
} from "./actions";

type ProfileRow = {
  id: string;
  email: string | null;
  name: string | null;
  role: "pending" | "member" | "admin";
  approved: boolean;
  created_at: string;
  updated_at: string | null;
};

function formatDate(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleDateString("ko-KR");
}

function Badge({
  children,
  tone = "default",
}: {
  children: React.ReactNode;
  tone?: "default" | "green" | "red" | "black";
}) {
  const className =
    tone === "green"
      ? "rounded-full border border-green-200 bg-green-50 px-2 py-1 text-xs text-green-700"
      : tone === "red"
      ? "rounded-full border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700"
      : tone === "black"
      ? "rounded-full bg-black px-2 py-1 text-xs text-white"
      : "rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs text-gray-700";

  return <span className={className}>{children}</span>;
}

function UserCard({
  member,
  showApproveButtons = false,
  showAdminButtons = false,
  canRevokeAdmin = false,
}: {
  member: ProfileRow;
  showApproveButtons?: boolean;
  showAdminButtons?: boolean;
  canRevokeAdmin?: boolean;
}) {
  return (
    <div className="rounded-2xl border border-gray-200 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold">
              {member.name?.trim() ? member.name : "이름 없음"}
            </h2>

            <Badge tone={member.role === "admin" ? "black" : member.role === "member" ? "green" : "red"}>
              {member.role === "admin" && "관리자"}
              {member.role === "member" && "승인회원"}
              {member.role === "pending" && "대기중"}
            </Badge>

            <Badge tone={member.approved ? "green" : "red"}>
              {member.approved ? "승인됨" : "미승인"}
            </Badge>
          </div>

          <div className="mt-3 space-y-1 text-sm text-gray-600">
            <p>
              <span className="font-medium text-gray-800">이메일:</span>{" "}
              {member.email ?? "-"}
            </p>
            <p>
              <span className="font-medium text-gray-800">가입일:</span>{" "}
              {formatDate(member.created_at)}
            </p>
            <p className="break-all text-xs text-gray-500">
              <span className="font-medium text-gray-700">ID:</span> {member.id}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {showApproveButtons && (
            <>
              <form action={approveMemberAction}>
                <input type="hidden" name="id" value={member.id} />
                <button
                  type="submit"
                  className="rounded-xl bg-black px-4 py-2 text-sm text-white"
                >
                  승인
                </button>
              </form>

              <form action={rejectMemberAction}>
                <input type="hidden" name="id" value={member.id} />
                <button
                  type="submit"
                  className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-600"
                >
                  대기 유지
                </button>
              </form>
            </>
          )}

          {showAdminButtons && member.role === "member" && (
            <form action={makeAdminAction}>
              <input type="hidden" name="id" value={member.id} />
              <button
                type="submit"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
              >
                관리자로 승격
              </button>
            </form>
          )}

          {canRevokeAdmin && member.role === "admin" && (
            <form action={revokeToMemberAction}>
              <input type="hidden" name="id" value={member.id} />
              <button
                type="submit"
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
              >
                일반회원으로 변경
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: myProfile } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  if (!myProfile || myProfile.role !== "admin" || myProfile.approved !== true) {
    redirect("/");
  }

  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("id, email, name, role, approved, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const allProfiles = ((profiles ?? []) as ProfileRow[]);

  const pendingMembers = allProfiles.filter((p) => p.approved === false || p.role === "pending");
  const approvedMembers = allProfiles.filter((p) => p.role === "member" && p.approved === true);
  const adminMembers = allProfiles.filter((p) => p.role === "admin" && p.approved === true);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">회원 관리</h1>
          <p className="mt-2 text-sm text-gray-600">
            가입 대기 회원 승인 및 권한 변경
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/notices"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
          >
            공지 관리
          </Link>
          <Link
            href="/admin/notices/new"
            className="rounded-xl bg-black px-4 py-2 text-sm text-white"
          >
            새 공지 작성
          </Link>
        </div>
      </div>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-2xl font-semibold">가입 대기</h2>
          <Badge tone="red">{pendingMembers.length}명</Badge>
        </div>

        <div className="space-y-4">
          {pendingMembers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 p-8 text-sm text-gray-500">
              승인 대기 중인 회원이 없습니다.
            </div>
          ) : (
            pendingMembers.map((member) => (
              <UserCard
                key={member.id}
                member={member}
                showApproveButtons
              />
            ))
          )}
        </div>
      </section>

      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-2xl font-semibold">승인된 일반 회원</h2>
          <Badge tone="green">{approvedMembers.length}명</Badge>
        </div>

        <div className="space-y-4">
          {approvedMembers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 p-8 text-sm text-gray-500">
              승인된 일반 회원이 없습니다.
            </div>
          ) : (
            approvedMembers.map((member) => (
              <UserCard
                key={member.id}
                member={member}
                showAdminButtons
              />
            ))
          )}
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center gap-2">
          <h2 className="text-2xl font-semibold">관리자</h2>
          <Badge tone="black">{adminMembers.length}명</Badge>
        </div>

        <div className="space-y-4">
          {adminMembers.length === 0 ? (
            <div className="rounded-2xl border border-gray-200 p-8 text-sm text-gray-500">
              관리자 계정이 없습니다.
            </div>
          ) : (
            adminMembers.map((member) => (
              <UserCard
                key={member.id}
                member={member}
                canRevokeAdmin={member.id !== user.id}
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}