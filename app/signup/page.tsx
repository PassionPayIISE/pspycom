"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [showResendButton, setShowResendButton] = useState(false);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");
    setErrorMessage("");
    setShowResendButton(false);

    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setErrorMessage("이름을 입력하세요.");
      setLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
        data: {
          display_name: trimmedName,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    if (!data.user) {
      setErrorMessage("회원가입 처리에 실패했습니다.");
      setLoading(false);
      return;
    }

    const { error: profileError } = await supabase.from("profiles").upsert({
      id: data.user.id,
      display_name: trimmedName,
      role: "pending",
      approved: false,
      is_active: true,
    });

    if (profileError) {
      setErrorMessage("프로필 저장에 실패했습니다.");
      setLoading(false);
      return;
    }

    setMessage(
      `회원가입 신청이 완료되었습니다.\n${trimmedEmail}로 인증 이메일을 보냈습니다.\n메일함에서 인증 링크를 눌러 이메일 인증을 완료한 뒤, 관리자 승인을 기다려주세요.`
    );
    setShowResendButton(true);
    setLoading(false);
  };

  const handleResendSignupEmail = async () => {
    const trimmedEmail = email.trim();

    setResending(true);
    setMessage("");
    setErrorMessage("");

    if (!trimmedEmail) {
      setErrorMessage("이메일을 먼저 입력하세요.");
      setResending(false);
      return;
    }

    const { error } = await supabase.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setErrorMessage("인증 이메일 재전송에 실패했습니다.");
      setResending(false);
      return;
    }

    setMessage(
      `인증 이메일을 다시 보냈습니다.\n${trimmedEmail} 메일함에서 인증 링크를 확인하세요.`
    );
    setShowResendButton(true);
    setResending(false);
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">회원가입</h1>
        <p className="mt-2 text-sm text-gray-600">
          가입 후 이메일 인증과 관리자 승인이 필요합니다.
        </p>
      </div>

      <form
        onSubmit={handleSignup}
        className="space-y-4 rounded-2xl border border-gray-200 p-6"
      >
        <div className="space-y-2">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-800"
          >
            이름
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="홍길동"
          />
        </div>

        <div className="space-y-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-800"
          >
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
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-800"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="비밀번호 입력"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-white disabled:opacity-50"
        >
          {loading ? "처리 중..." : "회원가입 신청"}
        </button>

        {message && (
          <div className="space-y-3 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <p className="whitespace-pre-line">{message}</p>

            {showResendButton ? (
              <button
                type="button"
                onClick={handleResendSignupEmail}
                disabled={resending}
                className="font-medium underline underline-offset-4 disabled:opacity-50"
              >
                {resending ? "인증 메일 재전송 중..." : "인증 이메일 다시 보내기"}
              </button>
            ) : null}
          </div>
        )}

        {errorMessage && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {errorMessage}
          </p>
        )}

        <div className="pt-2 text-sm text-gray-600">
          이미 계정이 있으면{" "}
          <Link href="/login" className="font-medium text-black underline">
            로그인
          </Link>
        </div>
      </form>
    </main>
  );
}