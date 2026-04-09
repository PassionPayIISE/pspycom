import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import InviteForm from "./InviteForm";

export default async function AdminInvitesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    redirect("/admin/login");
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold text-[#1f1f1f]">초대 관리</h1>

        <Link
          href="/admin/notices"
          className="rounded-xl border border-[#e7e5df] bg-white px-4 py-3 text-sm font-semibold text-[#1f1f1f]"
        >
          공지 관리로 돌아가기
        </Link>
      </div>

      <InviteForm />
    </main>
  );
}