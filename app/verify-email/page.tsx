"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const supabase = createClient();
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialEmail = useMemo(() => searchParams.get("email") ?? "", [searchParams]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const normalizedEmail = email.trim();
    const normalizedCode = code.trim();

    if (!normalizedEmail) {
      setErrorMessage("이메일을 입력하세요.");
      setLoading(false);
      return;
    }

    if (!/^\d{6}$/.test(normalizedCode)) {
      setErrorMessage("6자리 인증 코드를 입력하세요.");
      setLoading(false);
      return;
    }

    const { error } = await supabase.auth.verifyOtp({
      email: normalizedEmail,
      token: normalizedCode,
      type: "email",
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("이메일 인증이 완료되었습니다. 이제 로그인할 수 있습니다.");
    setLoading(false);

    router.push("/login");
  };

  const handleResend = async () => {
    setResending(true);
    setMessage("");
    setErrorMessage("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail) {
      setErrorMessage("이메일을 입력하세요.");
      setResending(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: normalizedEmail,
    });

    if (error) {
      setErrorMessage(error.message);
      setResending(false);
      return;
    }

    setMessage("인증 코드를 다시 보냈습니다. 메일함을 확인하세요.");
    setResending(false);
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">이메일 인증</h1>
        <p className="mt-2 text-sm text-gray-600">
          가입한 이메일로 받은 6자리 코드를 입력하세요.
        </p>
      </div>

      <form
        onSubmit={handleVerify}
        className="space-y-4 rounded-2xl border border-gray-200 p-6"
      >
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-800">
            이메일
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="example@school.ac.kr"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="block text-sm font-medium text-gray-800">
            인증 코드
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            required
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black tracking-[0.3em]"
            placeholder="123456"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "인증 중..." : "이메일 인증 완료"}
        </button>

        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="w-full rounded-xl border border-gray-300 px-4 py-3 disabled:opacity-50"
        >
          {resending ? "재전송 중..." : "인증 코드 다시 보내기"}
        </button>

        {message && (
          <p className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </p>
        )}

        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="pt-2 text-sm text-gray-600">
          로그인 페이지로 돌아가기{" "}
          <Link href="/login" className="font-medium text-black underline">
            로그인
          </Link>
        </div>
      </form>
    </main>
  );
}