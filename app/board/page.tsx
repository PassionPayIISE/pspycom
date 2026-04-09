import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PostRow = {
  id: string;
  slug: string | null;
  title: string;
  content: string | null;
  created_at: string;
};

export default async function BoardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: posts, error } = await supabase
    .from("board_posts")
    .select("id, slug, title, content, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(`게시글 목록 조회 실패: ${error.message}`);
  }

  const postList = (posts ?? []) as PostRow[];

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">자유게시판</h1>
          <p className="mt-2 text-sm text-gray-600">
            가입한 회원이 자유롭게 글을 작성할 수 있습니다.
          </p>
        </div>

        <Link
          href="/board/new"
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          글쓰기
        </Link>
      </div>

      {postList.length === 0 ? (
        <div className="rounded-2xl border border-gray-200 p-8 text-sm text-gray-500">
          아직 작성된 글이 없습니다.
        </div>
      ) : (
        <div className="space-y-4">
          {postList.map((post) => (
            <Link
              key={post.id}
              href={`/board/${post.slug ?? post.id}`}
              className="block rounded-2xl border border-gray-200 p-6 transition hover:bg-gray-50"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="truncate text-2xl font-semibold tracking-tight">
                    {post.title}
                  </h2>
                  <p className="mt-3 line-clamp-2 text-sm text-gray-700">
                    {post.content ?? ""}
                  </p>
                </div>

                <div className="shrink-0 text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString("ko-KR")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}