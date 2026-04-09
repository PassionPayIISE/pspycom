import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateBoardPostAction } from "./actions";

interface EditBoardPostPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditBoardPostPage({ params }: EditBoardPostPageProps) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: post, error: postError } = await supabase
    .from("board_posts")
    .select("id, title, slug, content, author_id")
    .eq("id", id)
    .single();

  if (postError || !post) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isAuthor = user.id === post.author_id;

  if (!isAdmin && !isAuthor) {
    redirect(`/board/${post.slug}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">게시글 수정</h1>
        <p className="mt-2 text-sm text-gray-600">내용을 수정합니다.</p>
      </div>

      <form
        action={updateBoardPostAction}
        className="space-y-6 rounded-2xl border border-gray-200 p-6"
      >
        <input type="hidden" name="id" value={post.id} />

        <div className="space-y-2">
          <label htmlFor="title" className="block text-sm font-medium text-gray-800">
            제목
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={post.title}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-800">현재 slug</label>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            {post.slug}
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
            defaultValue={post.content}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
          />
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-800">
          <input type="checkbox" name="regenerateSlug" />
          제목 기준으로 slug 다시 생성
        </label>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            수정 저장
          </button>

          <a
            href={`/board/${post.slug}`}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
          >
            취소
          </a>
        </div>
      </form>
    </main>
  );
}