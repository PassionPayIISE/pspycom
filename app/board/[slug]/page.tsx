import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: {
    slug: string;
  };
};

type PostRow = {
  id: string;
  slug: string;
  title: string;
  content: string;
  created_at: string;
};

export default async function BoardDetailPage({ params }: PageProps) {
  const slug = decodeURIComponent(params.slug);
  const supabase = await createClient();

  const authResult = await supabase.auth.getUser();
  const user = authResult.data.user;
  const userError = authResult.error;

  if (userError) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <pre className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 whitespace-pre-wrap">
{`auth.getUser() 에러
message: ${userError.message}
slug: ${slug}`}
        </pre>
      </main>
    );
  }

  if (!user) {
    redirect("/login");
  }

  const queryResult = await supabase
    .from("board_posts")
    .select("id, slug, title, content, created_at")
    .eq("slug", slug);

  if (queryResult.error) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <pre className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 whitespace-pre-wrap">
{`board_posts 조회 에러
slug: ${slug}
message: ${queryResult.error.message}
details: ${queryResult.error.details ?? ""}
hint: ${queryResult.error.hint ?? ""}
code: ${queryResult.error.code ?? ""}`}
        </pre>
      </main>
    );
  }

  const rows = (queryResult.data ?? []) as PostRow[];

  if (rows.length === 0) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50 p-6">
          <p className="text-sm font-medium text-yellow-800">
            게시글을 찾지 못했습니다.
          </p>
          <pre className="mt-4 text-sm text-yellow-900 whitespace-pre-wrap">
{`slug: ${slug}
rows.length: 0`}
          </pre>
          <div className="mt-4">
            <Link
              href="/board"
              className="text-sm underline underline-offset-4"
            >
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (rows.length > 1) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <p className="text-sm font-medium text-red-800">
            동일한 slug를 가진 게시글이 여러 개 있습니다.
          </p>
          <pre className="mt-4 text-sm text-red-900 whitespace-pre-wrap">
{JSON.stringify(
  {
    slug,
    count: rows.length,
    rows: rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      created_at: row.created_at,
    })),
  },
  null,
  2
)}
          </pre>
        </div>
      </main>
    );
  }

  const post = rows[0];

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/board"
          className="text-sm text-gray-600 underline underline-offset-4"
        >
          목록으로 돌아가기
        </Link>

        <Link
          href={`/board/${post.slug}/edit`}
          className="rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700"
        >
          수정하기
        </Link>
      </div>

      <article className="rounded-2xl border border-gray-200 bg-white p-8">
        <header className="border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>
          <p className="mt-3 text-sm text-gray-500">
            작성일 {new Date(post.created_at).toLocaleString("ko-KR")}
          </p>
        </header>

        <div className="mt-8 whitespace-pre-wrap text-gray-800">
          {post.content}
        </div>
      </article>
    </main>
  );
}