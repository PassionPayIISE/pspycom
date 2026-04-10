import { redirect, notFound } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { updateNoticeAction } from "./actions";

interface EditNoticePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditNoticePage({ params }: EditNoticePageProps) {
  const { id } = await params;
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

  const { data: notice, error } = await supabase
    .from("notices")
    .select("id, title, slug, content, visibility, published, pinned")
    .eq("id", id)
    .single();

  if (error || !notice) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">공지 수정</h1>
        <p className="mt-2 text-sm text-gray-600">공지 내용을 수정합니다.</p>
      </div>

      <form action={updateNoticeAction} className="space-y-6 rounded-2xl border border-gray-200 p-6">
        <input type="hidden" name="id" value={String(notice.id)} />

        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-800">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={notice.title}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">현재 slug</label>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {notice.slug}
          </div>
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
            defaultValue={notice.content}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="visibility" className="block text-sm font-medium text-gray-800">
            공개 범위
          </label>
          <select
            id="visibility"
            name="visibility"
            defaultValue={notice.visibility}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          >
            <option value="public">전체공개</option>
            <option value="member">회원공개</option>
            <option value="private">비공개</option>
          </select>
        </div>

        <div className="flex flex-col gap-3">
          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="published" defaultChecked={notice.published} />
            게시 상태
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="pinned" defaultChecked={notice.pinned} />
            상단 고정
          </label>

          <label className="flex items-center gap-2 text-sm text-gray-800">
            <input type="checkbox" name="regenerateSlug" />
            제목 기준으로 slug 다시 생성
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            수정 저장
          </button>

          <a
            href="/admin/notices"
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
          >
            취소
          </a>
        </div>
      </form>
    </main>
  );
}