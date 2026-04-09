"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { toSlug } from "@/lib/slug";

export default function NewBoardPostPage() {
  const supabase = createClient();
  const router = useRouter();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setErrorMessage("");

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setErrorMessage("로그인이 필요합니다.");
      setLoading(false);
      return;
    }

    const baseSlug = toSlug(title) || "post";
    const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

    const { error } = await supabase.from("board_posts").insert({
      title: title.trim(),
      content: content.trim(),
      slug,
      author_id: user.id,
    });

    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    router.push(`/board/${slug}`);
    router.refresh();
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">글쓰기</h1>
        <p className="mt-2 text-sm text-gray-600">
          자유게시판에 새 글을 작성합니다.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="space-y-5 rounded-2xl border border-gray-200 p-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-800"
          >
            제목
          </label>
          <input
            id="title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="제목을 입력하세요"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-800"
          >
            내용
          </label>
          <textarea
            id="content"
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={12}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="내용을 입력하세요"
          />
        </div>

        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => router.push("/board")}
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
          >
            취소
          </button>

          <button
            type="submit"
            disabled={loading}
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white disabled:opacity-50"
          >
            {loading ? "작성 중..." : "작성 완료"}
          </button>
        </div>
      </form>
    </main>
  );
}