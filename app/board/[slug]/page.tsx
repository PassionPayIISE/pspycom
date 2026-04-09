import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import CommentForm from "./CommentForm";
import DeleteCommentButton from "./DeleteCommentButton";

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
  profiles: {
    display_name: string | null;
  }[];
};

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles: {
    display_name: string | null;
  }[];
};

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

  const { data: post, error: postError } = await supabase
    .from("board_posts")
    .select(`
      id,
      slug,
      title,
      content,
      author_id,
      created_at,
      updated_at,
      profiles:profiles!board_posts_author_id_fkey (
        display_name
      )
    `)
    .eq("slug", slug)
    .single();

  if (postError || !post) {
    console.error("[post fetch error]", postError);
    notFound();
  }

  const { data: comments, error: commentsError } = await supabase
    .from("comments")
    .select(`
      id,
      post_id,
      author_id,
      content,
      created_at,
      profiles:profiles!comments_author_id_fkey (
        display_name
      )
    `)
    .eq("post_id", post.id)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("[comments fetch error]", commentsError);
  }

  const typedPost = post as PostRow;
  const commentList = (comments ?? []) as CommentRow[];

  const postAuthorName = typedPost.profiles?.[0]?.display_name ?? "이름없음";

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <article className="rounded-3xl border border-gray-200 bg-white p-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900">
          {typedPost.title}
        </h1>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-500">
          <span>작성자: {postAuthorName}</span>
          <span>
            작성일:{" "}
            {new Date(typedPost.created_at).toLocaleString("ko-KR", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {typedPost.updated_at !== typedPost.created_at ? (
            <span>
              수정일:{" "}
              {new Date(typedPost.updated_at).toLocaleString("ko-KR", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          ) : null}
        </div>

        <div className="mt-8 whitespace-pre-wrap break-words text-base leading-7 text-gray-900">
          {typedPost.content}
        </div>
      </article>

      <CommentForm postId={typedPost.id} />

      <section className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900">
          댓글 {commentList.length}개
        </h2>

        <div className="mt-4 space-y-4">
          {commentList.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-300 px-6 py-10 text-center text-sm text-gray-500">
              아직 댓글이 없습니다.
            </div>
          ) : (
            commentList.map((comment) => {
              const isMine = comment.author_id === user.id;
              const commentAuthorName =
                comment.profiles?.[0]?.display_name ?? "이름없음";

              return (
                <div
                  key={comment.id}
                  className="rounded-2xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500">
                      <span className="font-medium text-gray-800">
                        {commentAuthorName}
                      </span>
                      <span>
                        {new Date(comment.created_at).toLocaleString("ko-KR", {
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {isMine ? (
                      <DeleteCommentButton commentId={comment.id} />
                    ) : null}
                  </div>

                  <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-6 text-gray-900">
                    {comment.content}
                  </p>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}