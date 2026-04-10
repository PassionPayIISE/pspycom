// app/members/page.tsx
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createMemberContainer } from "@/container/member.container";

export default async function MembersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { getApprovedMembersUseCase } = await createMemberContainer();
  const members = await getApprovedMembersUseCase.execute();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">멤버</h1>
        <p className="mt-2 text-sm text-gray-600">
          현재 활동 중인 동아리 멤버 목록입니다.
        </p>
      </div>

      {members.length === 0 ? (
        <p className="text-sm text-gray-500">표시할 멤버가 없습니다.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div
              key={member.id}
              className="rounded-2xl border border-gray-200 p-5"
            >
              <div className="mb-3 h-28 w-28 overflow-hidden rounded-full bg-gray-100" />
              <h2 className="text-lg font-semibold">{member.name}</h2>
              <p className="mt-1 text-sm text-gray-500">{member.role ?? ""}</p>
              <p className="mt-1 text-sm text-gray-500">{member.team ?? ""}</p>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}