import { Suspense } from "react";
import VerifyEmailPageClient from "./VerifyEmailPageClient";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="mx-auto w-full max-w-md px-6 py-16">로딩 중...</div>}>
      <VerifyEmailPageClient />
    </Suspense>
  );
}