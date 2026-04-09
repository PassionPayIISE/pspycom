import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  approveMember,
  rejectMember,
  promoteToAdmin,
  demoteAdminToMember,
} from "./actions";

type ProfileRow = {
  id: string;
  email: string | null;
  role: "pending" | "member" | "admin" | "banned";
  approved: boolean;
  is_active: boolean | null;
  created_at: string;
};

export default async function AdminMembersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("id, role, approved, is_active")
    .eq("id", user.id)
    .single();

  if (
    meError ||
    !me ||
    me.role !== "admin" ||
    me.approved !== true ||
    me.is_active === false
  ) {
    redirect("/");
  }

  const adminSupabase = createAdminClient();

  const { data: profiles, error: profilesError } = await adminSupabase
    .from("profiles")
    .select("id, email, role, approved, is_active, created_at")
    .order("created_at", { ascending: false });

  if (profilesError) {
    throw new Error(`회원 목록 조회 실패: ${profilesError.message}`);
  }

  const allProfiles = (profiles ?? []) as ProfileRow[];

  const pendingMembers = allProfiles.filter(
    (p) => p.role === "pending" && p.approved === false && p.is_active === true
  );

  const approvedMembers = allProfiles.filter(
    (p) => p.role === "member" && p.approved === true && p.is_active === true
  );

  const admins = allProfiles.filter(
    (p) => p.role === "admin" && p.approved === true && p.is_active === true
  );

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="mb-10 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">회원 관리</h1>
          <p className="mt-3 text-sm text-gray-600">
            가입 대기 회원 승인, 권한 변경, 추방 관리
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/notices"
            className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-medium text-gray-700"
          >
            공지 관리
          </Link>
          <Link
            href="/admin/notices/new"
            className="rounded-xl bg-black px-4 py-3 text-sm font-medium text-white"
          >
            새 공지 작성
          </Link>
        </div>
      </div>

      <section className="mb-14">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">가입 대기</h2>
          <span className="rounded-full border border-red-200 bg-red-50 px-3 py-1 text-sm font-medium text-red-600">
            {pendingMembers.length}명
          </span>
        </div>

        {pendingMembers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 px-8 py-10 text-sm text-gray-500">
            승인 대기 중인 회원이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {pendingMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-tight">
                        {member.email?.split("@")[0] ?? "이름 없음"}
                      </h3>
                      <span className="rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                        가입 대기
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-medium text-black">이메일:</span>{" "}
                        {member.email ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium text-black">가입일:</span>{" "}
                        {new Date(member.created_at).toLocaleString("ko-KR")}
                      </p>
                      <p>
                        <span className="font-medium text-black">상태:</span>{" "}
                        승인 대기
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await approveMember(member.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-xl bg-black px-4 py-2.5 text-sm font-medium text-white"
                      >
                        승인
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await rejectMember(member.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600"
                      >
                        거절
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="mb-14">
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">승인된 일반 회원</h2>
          <span className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-sm font-medium text-green-600">
            {approvedMembers.length}명
          </span>
        </div>

        {approvedMembers.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 px-8 py-10 text-sm text-gray-500">
            승인된 일반 회원이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {approvedMembers.map((member) => (
              <div
                key={member.id}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-tight">
                        {member.email?.split("@")[0] ?? "이름 없음"}
                      </h3>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                        승인됨
                      </span>
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        일반회원
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-medium text-black">이메일:</span>{" "}
                        {member.email ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium text-black">가입일:</span>{" "}
                        {new Date(member.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <form
                      action={async () => {
                        "use server";
                        await promoteToAdmin(member.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-xl border border-black px-4 py-2.5 text-sm font-medium text-black"
                      >
                        관리자 승격
                      </button>
                    </form>

                    <form
                      action={async () => {
                        "use server";
                        await rejectMember(member.id);
                      }}
                    >
                      <button
                        type="submit"
                        className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600"
                      >
                        추방
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <div className="mb-5 flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">관리자</h2>
          <span className="rounded-full bg-black px-3 py-1 text-sm font-medium text-white">
            {admins.length}명
          </span>
        </div>

        {admins.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 px-8 py-10 text-sm text-gray-500">
            관리자 계정이 없습니다.
          </div>
        ) : (
          <div className="space-y-4">
            {admins.map((admin) => (
              <div
                key={admin.id}
                className="rounded-2xl border border-gray-200 bg-white p-6"
              >
                <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold tracking-tight">
                        {admin.email?.split("@")[0] ?? "이름 없음"}
                      </h3>
                      <span className="rounded-full bg-black px-3 py-1 text-xs font-medium text-white">
                        관리자
                      </span>
                      <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-600">
                        승인됨
                      </span>
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-gray-700">
                      <p>
                        <span className="font-medium text-black">이메일:</span>{" "}
                        {admin.email ?? "-"}
                      </p>
                      <p>
                        <span className="font-medium text-black">가입일:</span>{" "}
                        {new Date(admin.created_at).toLocaleString("ko-KR")}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {admin.id !== user.id ? (
                      <>
                        <form
                          action={async () => {
                            "use server";
                            await demoteAdminToMember(admin.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-xl border border-gray-300 px-4 py-2.5 text-sm font-medium text-gray-700"
                          >
                            관리자 해제
                          </button>
                        </form>

                        <form
                          action={async () => {
                            "use server";
                            await rejectMember(admin.id);
                          }}
                        >
                          <button
                            type="submit"
                            className="rounded-xl border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600"
                          >
                            추방
                          </button>
                        </form>
                      </>
                    ) : (
                      <span className="text-sm text-gray-500">
                        현재 로그인한 관리자 계정
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}