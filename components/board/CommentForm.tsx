"use client";

import { useState, useTransition } from "react";
import { createComment } from "@/app/board/actions";

type Props = {
  postId: string;
  postSlug: string;
  parentId?: string | null;
  placeholder?: string;
  submitLabel?: string;
  compact?: boolean;
  onSuccess?: () => void;
};

export default function CommentForm({
  postId,
  postSlug,
  parentId = null,
  placeholder = "댓글을 입력하세요.",
  submitLabel = "등록",
  compact = false,
  onSuccess,
}: Props) {
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    startTransition(async () => {
      try {
        await createComment({
          postId,
          postSlug,
          content,
          parentId,
        });
        setContent("");
        onSuccess?.();
      } catch (error) {
        setErrorMessage(
          error instanceof Error ? error.message : "댓글 작성에 실패했습니다."
        );
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "space-y-2" : "space-y-3"}>
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={compact ? 3 : 4}
        maxLength={1000}
        className="w-full rounded-2xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
      />

      {errorMessage && <p className="text-sm text-red-600">{errorMessage}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "처리 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}