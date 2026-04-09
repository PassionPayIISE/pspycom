"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    const trimmedName = name.trim();

    if (!trimmedName) {
      setErrorMessage("이름을 입력하세요.");
      setIsSubmitting(false);
      return;
    }

    const redirectTo = `${window.location.origin}/auth/confirm`;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectTo,
        data: {
          display_name: trimmedName,
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsSubmitting(false);
      return;
    }

    if (!data.user) {
      setErrorMessage("회원가입 처리에 실패했습니다.");
      setIsSubmitting(false);
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
      setIsSubmitting(false);
      return;
    }

    setSuccessMessage(
      "인증 이메일을 보냈습니다. 메일함에서 링크를 눌러 인증을 완료하세요."
    );
    setIsSubmitting(false);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-6">
      <form
        onSubmit={handleSignup}
        className="w-full rounded-2xl border border-gray-200 bg-white p-8"
      >
        <h1 className="text-2xl font-bold">회원가입</h1>

        <div className="mt-6 space-y-4">
          <input
            type="text"
            placeholder="이름"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
          <input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
          <input
            type="password"
            placeholder="비밀번호"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 text-sm outline-none focus:border-black"
          />
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-500">{errorMessage}</p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 text-sm text-green-600">{successMessage}</p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-medium text-white disabled:opacity-60"
        >
          {isSubmitting ? "처리 중..." : "회원가입"}
        </button>
      </form>
    </main>
  );
}