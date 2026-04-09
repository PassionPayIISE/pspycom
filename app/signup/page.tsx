"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const supabase = createClient();
  const router = useRouter();

  const [name, setName] = useState("");
  const [studentId, setStudentId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const validate = () => {
    if (!name.trim()) {
      setErrorMessage("이름을 입력하세요.");
      return false;
    }

    if (!studentId.trim()) {
      setErrorMessage("학번을 입력하세요.");
      return false;
    }

    if (!email.trim()) {
      setErrorMessage("이메일을 입력하세요.");
      return false;
    }

    if (!password.trim()) {
      setErrorMessage("비밀번호를 입력하세요.");
      return false;
    }

    if (password.length < 6) {
      setErrorMessage("비밀번호는 6자 이상이어야 합니다.");
      return false;
    }

    return true;
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    if (!validate()) {
      setLoading(false);
      return;
    }

    const normalizedEmail = email.trim();

    const { error } = await supabase.auth.signUp({
      email: normalizedEmail,
      password,
      options: {
        data: {
          name: name.trim(),
          student_id: studentId.trim(),
        },
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setLoading(false);
      return;
    }

    setMessage("인증 코드를 이메일로 보냈습니다.");
    setLoading(false);

    router.push(`/verify-email?email=${encodeURIComponent(normalizedEmail)}`);
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">회원가입</h1>
        <p className="mt-2 text-sm text-gray-600">
          이름, 학번, 이메일, 비밀번호를 입력하세요.
        </p>
      </div>

      <form
        onSubmit={handleSignup}
        className="space-y-4 rounded-2xl border border-gray-200 p-6"
      >
        <div className="space-y-2">
          <label htmlFor="name" className="block text-sm font-medium text-gray-800">
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
          <label htmlFor="studentId" className="block text-sm font-medium text-gray-800">
            학번
          </label>
          <input
            id="studentId"
            type="text"
            required
            value={studentId}
            onChange={(e) => setStudentId(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-black"
            placeholder="20231234"
          />
        </div>

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
          <label htmlFor="password" className="block text-sm font-medium text-gray-800">
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={6}
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
          {loading ? "가입 중..." : "회원가입"}
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
          이미 계정이 있으면{" "}
          <Link href="/login" className="font-medium text-black underline">
            로그인
          </Link>
        </div>
      </form>
    </main>
  );
}