"use client";

import { useActionState } from "react";
import { deleteCommentAction } from "./actions";

type Props = {
  commentId: string;
  slug: string;
};

const initialState = { error: "" };

async function actionHandler(
  _prevState: typeof initialState,
  formData: FormData
) {
  try {
    await deleteCommentAction(formData);
    return { error: "" };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "댓글 삭제 중 오류가 발생했습니다.",
    };
  }
}

export default function DeleteCommentButton({ commentId, slug }: Props) {
  const [state, formAction, isPending] = useActionState(actionHandler, initialState);

  return (
    <form action={formAction}>
      <input type="hidden" name="commentId" value={commentId} />
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        disabled={isPending}
        className="text-xs text-red-600 disabled:opacity-50"
      >
        {isPending ? "삭제 중..." : "삭제"}
      </button>
      {state.error ? <p className="mt-1 text-xs text-red-600">{state.error}</p> : null}
    </form>
  );
}
