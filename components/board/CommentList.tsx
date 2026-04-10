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
        const profile = comment.profiles?.[0];
        const authorName = profile?.name || profile?.email || "익명";

        return (
          <div key={comment.id} className="rounded-2xl border p-4">
            <div className="mb-2 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold">{authorName}</p>
                <p className="text-xs text-gray-500">{formatDate(comment.created_at)}</p>
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