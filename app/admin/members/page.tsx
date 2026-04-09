import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  approveMember,
  revokeApproval,
  deactivateMember,
  activateMember,
} from "./actions";

type MemberRow = {
  id: string;
  email: string | null;
  name: string | null;
  student_id: string | null;
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

  // 내 정보는 일반 RLS로 조회
  const { data: me, error: meError } = await supabase
    .from("profiles")
    .select("id, role, approved, is_active")
    .eq("id", user.id)
    .single();

  if (meError || !me) {
    redirect("/");
  }

  if (me.role !== "admin" || me.approved !== true || me.is_active === false) {
    redirect("/");
  }

  // 전체 회원 목록은 service role로 서버에서만 조회
  const admin = createAdminClient();

  const { data: members, error } = await admin
    .from("profiles")
    .select("id, email, name, student_id, role, approved, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`회원 목록 조회 실패: ${error.message}`);
  }

  const rows = (members ?? []) as MemberRow[];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">회원 관리</h1>
        <p className="mt-2 text-sm text-gray-600">
          이메일 인증 여부는 Supabase Auth에서, 관리자 승인 여부는 profiles에서 관리합니다.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">이름</th>
              <th className="px-4 py-3">학번</th>
              <th className="px-4 py-3">이메일</th>
              <th className="px-4 py-3">역할</th>
              <th className="px-4 py-3">승인</th>
              <th className="px-4 py-3">활성</th>
              <th className="px-4 py-3">가입일</th>
              <th className="px-4 py-3">관리</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((member) => (
              <tr key={member.id} className="border-t border-gray-100">
                <td className="px-4 py-3">{member.name || "-"}</td>
                <td className="px-4 py-3">{member.student_id || "-"}</td>
                <td className="px-4 py-3">{member.email || "-"}</td>
                <td className="px-4 py-3">{member.role}</td>
                <td className="px-4 py-3">{member.approved ? "승인" : "대기"}</td>
                <td className="px-4 py-3">
                  {member.is_active === false ? "비활성" : "활성"}
                </td>
                <td className="px-4 py-3">
                  {new Date(member.created_at).toLocaleString("ko-KR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {!member.approved && member.role !== "admin" && (
                      <form action={approveMember}>
                        <input type="hidden" name="userId" value={member.id} />
                        <button
                          type="submit"
                          className="rounded-lg bg-black px-3 py-2 text-white"
                        >
                          승인
                        </button>
                      </form>
                    )}

                    {member.approved && member.role !== "admin" && (
                      <form action={revokeApproval}>
                        <input type="hidden" name="userId" value={member.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-gray-300 px-3 py-2"
                        >
                          승인취소
                        </button>
                      </form>
                    )}

                    {member.is_active !== false && member.role !== "admin" && (
                      <form action={deactivateMember}>
                        <input type="hidden" name="userId" value={member.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-red-300 px-3 py-2 text-red-600"
                        >
                          비활성화
                        </button>
                      </form>
                    )}

                    {member.is_active === false && member.role !== "admin" && (
                      <form action={activateMember}>
                        <input type="hidden" name="userId" value={member.id} />
                        <button
                          type="submit"
                          className="rounded-lg border border-green-300 px-3 py-2 text-green-700"
                        >
                          복구
                        </button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}

            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-gray-500">
                  회원이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}