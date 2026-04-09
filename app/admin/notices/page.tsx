import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { deleteNoticeAction } from "./actions";

export default async function AdminNoticesPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, approved")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin" || profile.approved !== true) {
    redirect("/");
  }

  const { data: notices, error } = await supabase
    .from("notices")
    .select("id, title, slug, visibility, published, pinned, created_at")
    .order("pinned", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">공지 관리</h1>
          <p className="mt-2 text-sm text-gray-600">공지 수정, 삭제, 상태 확인</p>
        </div>

        <Link
          href="/admin/notices/new"
          className="rounded-xl bg-black px-5 py-3 text-sm font-medium text-white"
        >
          새 공지 작성
        </Link>
      </div>

      <div className="space-y-4">
        {!notices || notices.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 p-8 text-sm text-gray-500">
            등록된 공지가 없습니다.
          </div>
        ) : (
          notices.map((notice) => (
            <div key={notice.id} className="rounded-2xl border border-gray-200 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold">{notice.title}</h2>

                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
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

                    <span className="rounded-full border px-2 py-1">
                      {notice.published ? "게시중" : "비게시"}
                    </span>

                    <span>{new Date(notice.created_at).toLocaleDateString("ko-KR")}</span>
                  </div>

                  <p className="mt-2 truncate text-sm text-gray-500">{notice.slug}</p>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/notice/${notice.slug}`}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
                  >
                    보기
                  </Link>

                  <Link
                    href={`/admin/notices/${notice.id}/edit`}
                    className="rounded-xl border border-gray-300 px-4 py-2 text-sm"
                  >
                    수정
                  </Link>

                  <form action={deleteNoticeAction}>
                    <input type="hidden" name="id" value={String(notice.id)} />
                    <button
                      type="submit"
                      className="rounded-xl border border-red-300 px-4 py-2 text-sm text-red-600"
                    >
                      삭제
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}