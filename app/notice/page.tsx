import Link from "next/link";
import { getAllNotices } from "@/lib/notices";

export default async function NoticePage() {
  const notices = await getAllNotices();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">공지사항</h1>
        <p className="mt-2 text-sm text-gray-600">
          동아리 공지와 운영 관련 소식을 확인할 수 있습니다.
        </p>
      </div>

      <div className="space-y-4">
        {notices.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 p-8 text-sm text-gray-500">
            등록된 공지사항이 없습니다.
          </div>
        ) : (
          notices.map((notice) => (
            <Link
              key={notice.id}
              href={`/notice/${notice.slug}`}
              className="block rounded-2xl border border-gray-200 p-5 transition hover:bg-gray-50"
            >
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold">{notice.title}</h2>
                <span className="shrink-0 text-xs text-gray-500">
                  {new Date(notice.created_at).toLocaleDateString("ko-KR")}
                </span>
              </div>

              <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                {notice.pinned && (
                  <span className="rounded-full bg-black px-2 py-1 text-white">
                    고정
                  </span>
                )}
                <span className="rounded-full border px-2 py-1">
                  {notice.visibility === "public" && "전체공개"}
                  {notice.visibility === "member" && "회원공개"}
                  {notice.visibility === "private" && "비공개"}
                </span>
              </div>

              <p className="mt-3 line-clamp-2 text-sm text-gray-700">
                {notice.content}
              </p>
            </Link>
          ))
        )}
      </div>
    </main>
  );
}