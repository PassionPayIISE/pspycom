"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  commentId: string;
};

export default function DeleteCommentButton({ commentId }: Props) {
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const supabase = createClient();

  const handleDelete = async () => {
    setErrorMessage("");

    const ok = window.confirm("댓글을 삭제하시겠습니까?");
    if (!ok) return;

    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) {
      console.error("[comment delete error]", error);
      setErrorMessage("댓글 삭제에 실패했습니다.");
      return;
    }

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        type="button"
        onClick={handleDelete}
        disabled={isPending}
        className="text-xs text-red-500 hover:underline disabled:opacity-60"
      >
        {isPending ? "삭제 중..." : "삭제"}
      </button>

      {errorMessage ? (
        <p className="text-xs text-red-500">{errorMessage}</p>
      ) : null}
    </div>
  );
}