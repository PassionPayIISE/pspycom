"use client";

import { useActionState, useEffect, useRef } from "react";
import { createComment, type CommentActionState } from "@/app/board/[slug]/actions";

type Props = {
  postId: string;
};

const initialState: CommentActionState = {};

export default function CommentForm({ postId }: Props) {
  const [state, formAction, pending] = useActionState(createComment, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form action={formAction} ref={formRef} className="space-y-3 rounded-2xl border p-4">
      <input type="hidden" name="postId" value={postId} />

      <textarea
        name="content"
        placeholder="댓글을 입력하세요"
        rows={4}
        maxLength={1000}
        className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-black"
        required
      />

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={pending}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "등록 중..." : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}