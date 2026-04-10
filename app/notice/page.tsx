// app/notice/page.tsx
import Link from "next/link";
import { createNoticeContainer } from "@/container/notice.container";

export default async function NoticePage() {
  const { getPublishedNoticesUseCase } = await createNoticeContainer();
  const notices = await getPublishedNoticesUseCase.execute();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">공지사항</h1>
        <p className="mt-2 text-sm text-gray-600">
          동아리 공지사항을 확인할 수 있습니다.
        </p>
      </div>

      {notices.length === 0 ? (
        <p className="text-sm text-gray-500">등록된 공지사항이 없습니다.</p>
      ) : (
        <div className="space-y-4">
          {notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/notice/${encodeURIComponent(notice.slug)}`}
              className="block rounded-2xl border border-gray-200 p-5 transition hover:bg-gray-50"
            >
              <div className="flex items-center gap-2">
                {notice.pinned ? (
                  <span className="rounded-full bg-black px-2 py-1 text-xs text-white">
                    고정
                  </span>
                ) : null}
                <h2 className="text-lg font-semibold">{notice.title}</h2>
              </div>

              <p className="mt-3 text-xs text-gray-400">
                {new Date(notice.created_at).toLocaleString("ko-KR")}
              </p>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}