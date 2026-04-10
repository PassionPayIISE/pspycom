"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";

export default function VerifyEmailPageClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  // 기존 page.tsx에 있던 state / effect / handler / JSX 전부 여기로 이동
  // searchParams.get(...) 쓰던 것도 그대로 여기서 사용

  return (
    <main>
      {/* 기존 JSX 그대로 */}
    </main>
  );
}