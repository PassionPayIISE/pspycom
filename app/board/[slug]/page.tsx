import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: {
    slug: string;
  };
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
};

export default async function BoardDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug);
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/login");
  }

  const { data: post, error } = await supabase
    .from("board_posts")
    .select("id, slug, title, content, created_at")
    .eq("slug", slug)
    .maybeSingle<PostRow>();

  if (error) {
    throw new Error(`게시글 조회 실패: ${error.message}`);
  }

  if (!post) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/board"
          className="text-sm text-gray-600 underline underline-offset-4"
        >
          목록으로 돌아가기
        </Link>

        <Link
          href={`/board/${post.slug}/edit`}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          수정하기
        </Link>
      </div>

      <article className="rounded-2xl border border-gray-200 bg-white p-8">
        <header className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-gray-500">
            작성일 {new Date(post.created_at).toLocaleString("ko-KR")}
          </p>
        </header>

        <div className="mt-8 whitespace-pre-wrap text-gray-800">
          {post.content}
        </div>
      </article>
    </main>
  );
}