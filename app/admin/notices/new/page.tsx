import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createNoticeAction } from "./actions";

export default async function NewNoticePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.approved !== true) {
    redirect("/");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">공지 작성</h1>
        <p className="mt-2 text-sm text-gray-600">
          관리자만 공지사항을 등록할 수 있습니다.
        </p>
      </div>

      <form action={createNoticeAction} className="space-y-6 rounded-2xl border border-gray-200 p-6">
        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-800">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="공지 제목을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="content" className="block text-sm font-medium text-gray-800">
            내용
          </label>
          <textarea
            id="content"
            name="content"
            required
            rows={12}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="공지 내용을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-800">
            공개 범위
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue="public"
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          >
            <option value="public">전체공개</option>
            <option value="member">회원공개</option>
            <option value="private">비공개</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="published" defaultChecked />
            게시 상태
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="pinned" />
            상단 고정
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
          >
            공지 등록
          </button>

          <a
            href="/notice"
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            취소
          </a>
        </div>
      </form>
    </main>
  );
}