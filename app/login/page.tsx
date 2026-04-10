import { Suspense } from "react";
import LoginPageClient from "./LoginPageClient";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-md px-6 py-16">로딩 중...</div>}>
      <LoginPageClient />
    </Suspense>
  );
}