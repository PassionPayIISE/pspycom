"use client";

import { useState } from "react";
import { CommentTreeItem } from "@/shared/utils/comment-tree";
import CommentForm from "./CommentForm";
import DeleteCommentButton from "./DeleteCommentButton";

type Props = {
  comment: CommentTreeItem;
  slug: string;
  currentUserId: string;
};

export default function CommentItem({
  comment,
  slug,
  currentUserId,
}: Props) {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const isOwner = comment.author_id === currentUserId;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {comment.author_name ?? "이름 없음"}
            </p>
            <p className="text-xs text-gray-500">{comment.author_email ?? ""}</p>
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {new Date(comment.created_at).toLocaleString("ko-KR")}
            </p>

            {isOwner ? (
              <DeleteCommentButton commentId={comment.id} slug={slug} />
            ) : null}
          </div>
        </div>

        <p className="mt-3 whitespace-pre-wrap text-sm text-gray-800">
          {comment.content}
        </p>

        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowReplyForm((prev) => !prev)}
            className="text-xs text-gray-600 hover:text-black"
          >
            {showReplyForm ? "답댓 닫기" : "답댓 달기"}
          </button>
        </div>

        {showReplyForm ? (
          <div className="mt-3">
            <CommentForm
              slug={slug}
              parentId={comment.id}
              placeholder="답댓을 입력하세요."
              submitLabel="답댓 등록"
              rows={3}
            />
          </div>
        ) : null}
      </div>

      {comment.children.length > 0 ? (
        <div className="ml-4 border-l-2 border-gray-200 pl-4 space-y-3">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              slug={slug}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}