// app/api/admin/invite/route.ts
import { NextResponse } from "next/server";
import { createAuthContainer } from "@/container/auth.container";
import { createAdminContainer } from "@/container/admin.container";

export async function POST(request: Request) {
  try {
    const { requireAdminUserUseCase } = await createAuthContainer();
    const authResult = await requireAdminUserUseCase.execute();

    if (!authResult.ok) {
      if (authResult.redirectTo === "/login") {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const email = String(body.email ?? "").trim().toLowerCase();

    if (!email) {
      return NextResponse.json(
        { error: "이메일이 필요합니다." },
        { status: 400 }
      );
    }

    const redirectTo =
      process.env.NODE_ENV === "development"
        ? "http://localhost:3000/admin/login"
        : `${process.env.NEXT_PUBLIC_SITE_URL}/admin/login`;

    const { inviteMemberUseCase } = await createAdminContainer();
    await inviteMemberUseCase.execute({
      email,
      redirectTo,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("invite route error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "초대 처리 중 오류가 발생했습니다.",
      },
      { status: 500 }
    );
  }
}