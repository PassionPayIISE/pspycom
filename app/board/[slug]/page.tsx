import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBoardPostBySlug } from "@/lib/board";
import { deleteBoardPostByIdAction } from "@/app/board/[id]/edit/actions";
import DeleteBoardPostButton from "@/components/board/DeleteBoardPostButton";

interface BoardDetailPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BoardDetailPage({ params }: BoardDetailPageProps) {
  const { slug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const post = await getBoardPostBySlug(slug);

  if (!post) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isAdmin = profile?.role === "admin";
  const isAuthor = user.id === post.author_id;
  const canEdit = isAdmin || isAuthor;

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <article className="rounded-2xl border border-gray-200 p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">{post.title}</h1>

          <p className="mt-3 text-sm text-gray-500">
            작성일: {new Date(post.created_at).toLocaleDateString("ko-KR")}
          </p>
        </div>

        <div className="whitespace-pre-wrap leading-7 text-gray-800">
          {post.content}
        </div>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/board"
            className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
          >
            목록
          </Link>

          {canEdit && (
            <>
              <Link
                href={`/board/${post.id}/edit`}
                className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
              >
                수정
              </Link>

              <form action={deleteBoardPostByIdAction}>
                <input type="hidden" name="id" value={post.id} />
                <DeleteBoardPostButton />
              </form>
            </>
          )}
        </div>
      </article>
    </main>
  );
}