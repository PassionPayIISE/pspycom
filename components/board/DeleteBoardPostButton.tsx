"use client";

export default function DeleteBoardPostButton() {
  return (
    <button
      type="submit"
      onClick={(e) => {
        const ok = window.confirm("정말 이 글을 삭제할까요?");
        if (!ok) {
          e.preventDefault();
        }
      }}
      className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-600"
    >
      삭제
    </button>
  );
}