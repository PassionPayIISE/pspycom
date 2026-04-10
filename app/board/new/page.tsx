// app/board/new/page.tsx
import Link from "next/link";
import { createBoardPostAction } from "./actions";

export default function NewBoardPostPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">글쓰기</h1>
        <p className="mt-2 text-sm text-gray-600">
          자유게시판에 새 글을 작성합니다.
        </p>
      </div>

      <form
        action={createBoardPostAction}
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
            name="title"
            type="text"
            required
            maxLength={120}
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
            name="content"
            required
            rows={12}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="내용을 입력하세요"
          />
        </div>

        <div className="flex items-center justify-end gap-3">
          <Link
            href="/board"
            className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-medium text-gray-700"
          >
            취소
          </Link>

          <button
            type="submit"
            className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
          >
            작성 완료
          </button>
        </div>
      </form>
    </main>
  );
}