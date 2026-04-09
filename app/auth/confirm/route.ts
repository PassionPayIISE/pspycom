import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);

  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");

  if (token_hash && type) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as
        | "signup"
        | "invite"
        | "magiclink"
        | "recovery"
        | "email_change"
        | "email",
    });

    if (!error) {
      return NextResponse.redirect(
        `${origin}/login?message=${encodeURIComponent("이메일 인증이 완료되었습니다. 로그인해 주세요.")}`
      );
    }
  }

  return NextResponse.redirect(
    `${origin}/login?message=${encodeURIComponent("인증에 실패했습니다. 다시 시도해 주세요.")}`
  );
}