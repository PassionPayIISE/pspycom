import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type RouteContext = {
  params: Promise<{
    slug: string;
  }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  const formData = await request.formData();

  const postId = String(formData.get("postId") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const content = String(formData.get("content") ?? "").trim();

  if (!postId || !title || !content) {
    return NextResponse.redirect(new URL(`/board/${slug}/edit`, request.url));
  }

  const { data: post, error: postError } = await supabase
    .from("board_posts")
    .select("id, slug, author_id")
    .eq("id", postId)
    .eq("slug", slug)
    .maybeSingle();

  if (postError || !post) {
    console.error("게시글 조회 실패:", postError?.message);
    return NextResponse.redirect(new URL("/board", request.url));
  }

  if (post.author_id !== user.id) {
    return NextResponse.redirect(new URL(`/board/${slug}`, request.url));
  }

  const { error: updateError } = await supabase
    .from("board_posts")
    .update({
      title,
      content,
    })
    .eq("id", postId)
    .eq("author_id", user.id);

  if (updateError) {
    console.error("게시글 수정 실패:", updateError.message);
    return NextResponse.redirect(new URL(`/board/${slug}/edit`, request.url));
  }

  return NextResponse.redirect(new URL(`/board/${slug}`, request.url));
}