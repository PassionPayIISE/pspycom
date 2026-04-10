import { deleteComment } from "@/app/board/[slug]/actions";
import type { BoardComment } from "@/lib/comments";

type Props = {
  comments: BoardComment[];
  currentUserId: string;
  postSlug: string;
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

export default function CommentList({ comments, currentUserId, postSlug }: Props) {
  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border p-6 text-sm text-gray-500">
        아직 댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {comments.map((comment) => {
        const isMine = comment.author_id === currentUserId;
        const authorName = comment.author_profile?.name?.trim() || "익명";
        const authorEmail = comment.author_profile?.email?.trim() || "이메일 없음";

        return (
          <div key={comment.id} className="rounded-2xl border p-4">
            <div className="mb-2 flex items-start justify-between gap-4">
              <div>
                <details className="group">
                  <summary className="cursor-pointer list-none text-sm font-semibold select-none">
                    {authorName}
                  </summary>
                  <div className="mt-1 text-xs text-gray-500">
                    <p>이름: {authorName}</p>
                    <p>이메일: {authorEmail}</p>
                  </div>
                </details>

                <p className="mt-1 text-xs text-gray-500">
                  {formatDate(comment.created_at)}
                </p>
              </div>

              {isMine && (
                <form action={deleteComment}>
                  <input type="hidden" name="commentId" value={comment.id} />
                  <input type="hidden" name="postSlug" value={postSlug} />
                  <button
                    type="submit"
                    className="text-xs text-red-600 hover:underline"
                  >
                    삭제
                  </button>
                </form>
              )}
            </div>

            <p className="whitespace-pre-wrap text-sm leading-6">{comment.content}</p>
          </div>
        );
      })}
    </div>
  );
}