// app/board/[slug]/edit/page.tsx
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createBoardContainer } from "@/container/board.container";
import { updateBoardPostAction } from "./actions";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function BoardEditPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { getBoardPostDetailUseCase } = await createBoardContainer();
  const post = await getBoardPostDetailUseCase.execute(slug);

  if (!post) {
    notFound();
  }

  if (!post.canEdit(user.id)) {
    redirect(`/board/${encodeURIComponent(post.slug)}`);
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-6">
        <Link
          href={`/board/${encodeURIComponent(post.slug)}`}
          className="text-sm text-gray-500 hover:underline"
        >
          ← 게시글로 돌아가기
        </Link>
      </div>

      <div className="rounded-3xl border p-8">
        <h1 className="mb-6 text-3xl font-bold tracking-tight">게시글 수정</h1>

        <form action={updateBoardPostAction} className="space-y-5">
          <input type="hidden" name="slug" value={post.slug} />

          <div className="space-y-2">
            <label htmlFor="title" className="block text-sm font-medium">
              제목
            </label>
            <input
              id="title"
              name="title"
              defaultValue={post.title}
              required
              maxLength={120}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="block text-sm font-medium">
              내용
            </label>
            <textarea
              id="content"
              name="content"
              defaultValue={post.content}
              required
              rows={12}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link
              href={`/board/${encodeURIComponent(post.slug)}`}
              className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              취소
            </Link>
            <button
              type="submit"
              className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white"
            >
              수정 완료
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}