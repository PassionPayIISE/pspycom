"use client";

import { useMemo, useState } from "react";
import CommentForm from "@/components/board/CommentForm";
import DeleteCommentButton from "@/components/board/DeleteCommentButton";
import type { CommentItem } from "@/lib/comments";

type Props = {
  comments: CommentItem[];
  currentUserId: string;
  postSlug: string;
  postId: string;
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

export default function CommentList({
  comments,
  currentUserId,
  postSlug,
  postId,
}: Props) {
  const [replyOpenId, setReplyOpenId] = useState<string | null>(null);

  const { parentComments, childMap } = useMemo(() => {
    const parents = comments.filter((comment) => comment.parent_id === null);
    const children = comments.filter((comment) => comment.parent_id !== null);

    const mappedChildren: Record<string, CommentItem[]> = {};

    for (const child of children) {
      const parentId = child.parent_id as string;
      if (!mappedChildren[parentId]) {
        mappedChildren[parentId] = [];
      }
      mappedChildren[parentId].push(child);
    }

    return {
      parentComments: parents,
      childMap: mappedChildren,
    };
  }, [comments]);

  if (comments.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-200 p-6 text-sm text-gray-500">
        아직 댓글이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {parentComments.map((comment) => {
        const replies = childMap[comment.id] ?? [];
        const isAuthor = currentUserId === comment.author_id;

        return (
          <div key={comment.id} className="rounded-2xl border border-gray-200 p-4">
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-black">
                    {comment.author_name?.trim() || "익명"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {comment.author_email?.trim() || "이메일 없음"}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-3">
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.created_at)}
                  </p>
                  {isAuthor && (
                    <DeleteCommentButton
                      commentId={comment.id}
                      postSlug={postSlug}
                    />
                  )}
                </div>
              </div>

              <div className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                {comment.content}
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() =>
                    setReplyOpenId((prev) => (prev === comment.id ? null : comment.id))
                  }
                  className="text-sm text-gray-500 hover:text-black"
                >
                  {replyOpenId === comment.id ? "답글 작성 취소" : "답글 달기"}
                </button>
              </div>

              {replyOpenId === comment.id && (
                <div className="mt-3 rounded-2xl bg-gray-50 p-3">
                  <CommentForm
                    postId={postId}
                    postSlug={postSlug}
                    parentId={comment.id}
                    placeholder="답글을 입력하세요."
                    submitLabel="답글 등록"
                    compact
                    onSuccess={() => setReplyOpenId(null)}
                  />
                </div>
              )}
            </div>

            {replies.length > 0 && (
              <div className="mt-4 space-y-3 border-t pt-4">
                {replies.map((reply) => {
                  const isReplyAuthor = currentUserId === reply.author_id;

                  return (
                    <div
                      key={reply.id}
                      className="ml-6 rounded-2xl border border-gray-100 bg-gray-50 p-4"
                    >
                      <div className="mb-2 flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-black">
                            ↳ {reply.author_name?.trim() || "익명"}
                          </p>
                          <p className="text-xs text-gray-500">
                            {reply.author_email?.trim() || "이메일 없음"}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <p className="text-xs text-gray-500">
                            {formatDate(reply.created_at)}
                          </p>
                          {isReplyAuthor && (
                            <DeleteCommentButton
                              commentId={reply.id}
                              postSlug={postSlug}
                            />
                          )}
                        </div>
                      </div>

                      <div className="whitespace-pre-wrap text-sm leading-6 text-gray-800">
                        {reply.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}