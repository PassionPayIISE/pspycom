import { notFound } from "next/navigation";
import { getNoticeBySlug } from "@/lib/notices";

interface NoticeDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NoticeDetailPage({
  params,
}: NoticeDetailPageProps) {
  const { slug } = await params;
  const notice = await getNoticeBySlug(slug);

  if (!notice) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <article className="rounded-2xl border border-gray-200 p-8">
        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2 text-xs text-gray-500">
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

          <h1 className="text-3xl font-bold tracking-tight">{notice.title}</h1>

          <p className="mt-3 text-sm text-gray-500">
            {new Date(notice.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>

        <div className="whitespace-pre-wrap leading-7 text-gray-800">
          {notice.content}
        </div>
      </article>
    </main>
  );
}