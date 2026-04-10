"use client";

import { useActionState } from "react";
import { createCommentAction } from "./actions";

type Props = {
  slug: string;
  parentId?: string | null;
  placeholder?: string;
  submitLabel?: string;
  rows?: number;
};

const initialState = { error: "" };

async function actionHandler(
  _prevState: typeof initialState,
  formData: FormData
) {
  try {
    await createCommentAction(formData);
    return { error: "" };
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "댓글 작성 중 오류가 발생했습니다.",
    };
  }
}

export default function CommentForm({
  slug,
  parentId = null,
  placeholder = "댓글을 입력하세요.",
  submitLabel = "댓글 등록",
  rows = 4,
}: Props) {
  const [state, formAction, isPending] = useActionState(
    actionHandler,
    initialState
  );

  return (
    <form action={formAction} className="mt-6 space-y-3">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="parentId" value={parentId ?? ""} />

      <textarea
        name="content"
        placeholder={placeholder}
        rows={rows}
        className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
        required
      />

      {state.error ? <p className="text-sm text-red-600">{state.error}</p> : null}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {isPending ? "등록 중..." : submitLabel}
        </button>
      </div>
    </form>
  );
}