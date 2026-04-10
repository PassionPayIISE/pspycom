// app/board/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createBoardContainer } from "@/container/board.container";


export default async function BoardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { getBoardPostsUseCase } = await createBoardContainer();
  const posts = await getBoardPostsUseCase.execute();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">자유게시판</h1>
          <p className="mt-2 text-sm text-gray-600">
            가입한 회원이 자유롭게 글을 작성할 수 있습니다.
          </p>
        </div>

        <Link
          href="/board/new"
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          글쓰기
        </Link>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/board/${post.slug}`}
            className="block rounded-2xl border border-gray-200 p-5 transition hover:bg-gray-50"
          >
            <h2 className="text-lg font-semibold">{post.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-gray-600">
              {post.content}
            </p>
            <p className="mt-3 text-xs text-gray-400">
              {new Date(post.createdAt).toLocaleString("ko-KR")}
            </p>
          </Link>
        ))}
      </div>
    </main>
  );
}