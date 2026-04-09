"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Props = {
  postId: string;
};

export default function CommentForm({ postId }: Props) {
  const [content, setContent] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmed = content.trim();

    if (!trimmed) {
      setErrorMessage("댓글 내용을 입력하세요.");
      return;
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("로그인이 필요합니다.");
      return;
    }

    const { error } = await supabase.from("comments").insert({
      post_id: postId,
      author_id: user.id,
      content: trimmed,
    });

    if (error) {
      console.error("[comment insert error]", error);
      setErrorMessage("댓글 등록에 실패했습니다.");
      return;
    }

    setContent("");

    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-8 rounded-2xl border border-gray-200 bg-white p-5"
    >
      <h2 className="text-lg font-semibold text-gray-900">댓글 작성</h2>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="댓글을 입력하세요."
        rows={4}
        className="mt-4 w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none placeholder:text-gray-400 focus:border-black"
      />

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-500">{errorMessage}</p>
      ) : null}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-xl bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {isPending ? "등록 중..." : "댓글 등록"}
        </button>
      </div>
    </form>
  );
}