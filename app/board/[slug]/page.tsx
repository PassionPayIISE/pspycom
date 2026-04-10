import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/server";
import { createBoardContainer } from "@/container/board.container";
import { createCommentContainer } from "@/container/comment.container";
import CommentForm from "./CommentForm";
import DeleteCommentButton from "./DeleteCommentButton";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

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

  const currentUserId = user!.id;

  const { getBoardPostDetailUseCase } = await createBoardContainer();
  const post = await getBoardPostDetailUseCase.execute(slug);

  if (!post) {
    notFound();
  }

  const isAuthor = post.canEdit(currentUserId);

  const { getCommentsByPostIdUseCase } = await createCommentContainer();
  const comments = await getCommentsByPostIdUseCase.execute(post.id);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="mt-2 text-sm text-gray-500">
            작성일 {new Date(post.createdAt).toLocaleString("ko-KR")}
          </p>
        </div>

        {isAuthor ? (
          <Link
            href={`/board/${post.slug}/edit`}
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium"
          >
            수정하기
          </Link>
        ) : null}
      </div>

      <article className="whitespace-pre-wrap rounded-2xl border border-gray-200 p-6">
        {post.content}
      </article>

      <div className="mt-10">
        <h2 className="mb-4 text-xl font-semibold">댓글</h2>

        <CommentForm slug={post.slug} />

        <div className="mt-6 space-y-3">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>
          ) : (
            comments.map((comment) => (
              <div key={comment.id} className="rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">
                      {comment.author_name ?? "이름 없음"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {comment.author_email ?? ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-xs text-gray-400">
                      {new Date(comment.created_at).toLocaleString("ko-KR")}
                    </p>

                    {comment.author_id === currentUserId ? (
                      <DeleteCommentButton
                        commentId={comment.id}
                        slug={post.slug}
                      />
                    ) : null}
                  </div>
                </div>

                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
                  {comment.content}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}