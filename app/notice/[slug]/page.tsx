// app/notice/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { createNoticeContainer } from "@/container/notice.container";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export default async function NoticeDetailPage({ params }: PageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const { getNoticeDetailUseCase } = await createNoticeContainer();
  const notice = await getNoticeDetailUseCase.execute(slug);

  if (!notice) {
    notFound();
  }

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="mb-6">
        <Link href="/notice" className="text-sm text-gray-500 hover:underline">
          ← 공지사항으로 돌아가기
        </Link>
      </div>

      <div className="mb-6">
        <div className="mb-3 flex items-center gap-2">
          {notice.pinned ? (
            <span className="rounded-full bg-black px-2 py-1 text-xs text-white">
              고정
            </span>
          ) : null}
          <h1 className="text-3xl font-bold tracking-tight">{notice.title}</h1>
        </div>

        <p className="text-sm text-gray-500">
          작성일 {new Date(notice.created_at).toLocaleString("ko-KR")}
        </p>
      </div>

      <article className="whitespace-pre-wrap rounded-2xl border border-gray-200 p-6">
        {notice.content}
      </article>
    </main>
  );
}