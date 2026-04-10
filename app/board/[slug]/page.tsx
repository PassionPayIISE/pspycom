import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCommentsByPostId } from "@/lib/comments";
import CommentForm from "@/components/board/CommentForm";
import CommentList from "@/components/board/CommentList";

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

type ProfileRow = {
  id: string;
  name: string | null;
  email: string | null;
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

  const { data: post, error: postError } = await supabase
    .from("board_posts")
    .select("id, slug, title, content, author_id, created_at, updated_at")
    .eq("slug", slug)
    .maybeSingle<PostRow>();

  if (postError) {
    console.error("게시글 조회 실패:", postError.message);
    notFound();
  }

  if (!post) {
    notFound();
  }

  const { data: authorProfile, error: authorError } = await supabase
    .from("profiles")
    .select("id, name, email")
    .eq("id", post.author_id)
    .maybeSingle<ProfileRow>();

  if (authorError) {
    console.error("작성자 조회 실패:", authorError.message);
  }

  const authorName = authorProfile?.name?.trim() || "익명";
  const authorEmail = authorProfile?.email?.trim() || "이메일 없음";
  const isAuthor = user.id === post.author_id;

  const comments = await getCommentsByPostId(post.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="mb-6 flex items-center justify-between gap-4">
        <Link href="/board" className="text-sm text-gray-500 hover:underline">
          ← 게시판으로 돌아가기
        </Link>

        {isAuthor && (
          <Link
            href={`/board/${post.slug}/edit`}
            className="rounded-xl border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            수정하기
          </Link>
        )}
      </div>

      <article className="rounded-3xl border p-8">
        <div className="mb-6 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>

          <div className="mt-4 space-y-2 text-sm text-gray-500">
            <details className="group">
              <summary className="cursor-pointer list-none select-none">
                작성자 <span className="font-medium text-black">{authorName}</span>
              </summary>
              <div className="mt-2 rounded-xl bg-gray-50 px-3 py-2 text-xs text-gray-600">
                <p>이름: {authorName}</p>
                <p>이메일: {authorEmail}</p>
              </div>
            </details>

            <p>작성일 {formatDate(post.created_at)}</p>
          </div>
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