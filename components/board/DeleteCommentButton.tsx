"use client";

import { useTransition } from "react";
import { deleteComment } from "@/app/board/actions";

type Props = {
  commentId: string;
  postSlug: string;
};

export default function DeleteCommentButton({ commentId, postSlug }: Props) {
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    const ok = window.confirm("댓글을 삭제하시겠습니까?");
    if (!ok) return;

    startTransition(async () => {
      try {
        await deleteComment(commentId, postSlug);
      } catch (error) {
        alert(error instanceof Error ? error.message : "댓글 삭제에 실패했습니다.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      className="text-sm text-red-500 hover:underline disabled:opacity-50"
    >
      {isPending ? "삭제 중..." : "삭제"}
    </button>
  );
}