"use client";

import { useState } from "react";
import { CommentTreeItem } from "@/shared/utils/comment-tree";
import { formatKoreanDateTime } from "@/shared/utils/date";
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

  const isDeleted = comment.deleted_at !== null;
  const isOwner = comment.author_id === currentUserId;

  return (
    <div className="space-y-3">
      <div className="rounded-xl border border-gray-200 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium">
              {isDeleted ? "삭제된 댓글" : comment.author_name ?? "이름 없음"}
            </p>

            {!isDeleted ? (
              <p className="text-xs text-gray-500">{comment.author_email ?? ""}</p>
            ) : null}
          </div>

          <div className="flex items-center gap-3">
            <p className="text-xs text-gray-400">
              {formatKoreanDateTime(comment.created_at)}
            </p>

            {isOwner && !isDeleted ? (
              <DeleteCommentButton commentId={comment.id} slug={slug} />
            ) : null}
          </div>
        </div>

        <p
          className={`mt-3 whitespace-pre-wrap text-sm ${
            isDeleted ? "italic text-gray-400" : "text-gray-800"
          }`}
        >
          {comment.content}
        </p>

        {!isDeleted ? (
          <div className="mt-3">
            <button
              type="button"
              onClick={() => setShowReplyForm((prev) => !prev)}
              className="text-xs font-medium text-gray-500 hover:text-black"
            >
              {showReplyForm ? "답댓 닫기" : "답댓 달기"}
            </button>
          </div>
        ) : null}

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
        <div className="ml-4 space-y-3 border-l-2 border-gray-200 pl-4">
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