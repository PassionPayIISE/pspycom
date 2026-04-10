import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCommentsByPostId } from "@/lib/comments";
import CommentForm from "@/components/board/comment-form";
import CommentList from "@/components/board/comment-list";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  author_id: string;
  created_at: string;
  updated_at: string;
};

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function BoardDetailPage({ params }: PageProps) {
  const { slug } = await params;
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
    .select("id, slug, title, content, author_id, created_at, updated_at")
    .eq("slug", slug)
    .single<PostRow>();

  if (error || !post) {
    notFound();
  }

  const comments = await getCommentsByPostId(post.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link href="/board" className="text-sm text-gray-500 hover:underline">
          ← 게시판으로 돌아가기
        </Link>
      </div>

      <article className="rounded-3xl border p-8">
        <div className="mb-6 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-gray-500">
            작성일 {formatDate(post.created_at)}
          </p>
        </div>

        <div className="whitespace-pre-wrap text-[15px] leading-7">
          {post.content}
        </div>
      </article>

      <section className="mt-10 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold">댓글 {comments.length}개</h2>
        </div>

        <CommentForm postId={post.id} />

        <CommentList
          comments={comments}
          currentUserId={user.id}
          postSlug={post.slug}
        />
      </section>
    </main>
  );
}