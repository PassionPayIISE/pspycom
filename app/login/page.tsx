"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type ProfileRow = {
  id: string;
  role: "pending" | "member" | "admin" | "banned";
  approved: boolean;
  is_active?: boolean | null;
};

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error || !data.user) {
      setErrorMessage(error?.message ?? "로그인에 실패했습니다.");
      setLoading(false);
      return;
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id, role, approved, is_active")
      .eq("id", data.user.id)
      .single<ProfileRow>();

    if (profileError || !profile) {
      await supabase.auth.signOut();
      setErrorMessage("회원 정보를 확인할 수 없습니다.");
      setLoading(false);
      return;
    }

    if (profile.role === "banned" || profile.is_active === false) {
      await supabase.auth.signOut();
      setErrorMessage("탈퇴된 회원입니다.");
      setLoading(false);
      return;
    }

    if (profile.approved !== true) {
      await supabase.auth.signOut();
      setErrorMessage("아직 관리자 승인이 완료되지 않았습니다.");
      setLoading(false);
      return;
    }

    setMessage("로그인되었습니다.");
    setLoading(false);

    if (profile.role === "admin") {
      router.push("/admin/members");
      return;
    }

    router.push("/");
  };

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">로그인</h1>
        <p className="mt-2 text-sm text-gray-600">
          이메일과 비밀번호를 입력하세요.
        </p>
      </div>

      <form
        onSubmit={handleLogin}
        className="space-y-4 rounded-2xl border border-gray-200 p-6"
      >
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
          {loading ? "로그인 중..." : "로그인"}
        </button>

        <div className="flex justify-end">
          <Link
            href="/forgot-password"
            className="text-sm text-gray-600 underline underline-offset-4"
          >
            비밀번호를 잊으셨나요?
          </Link>
        </div>

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
          계정이 없으면{" "}
          <Link href="/signup" className="font-medium text-black underline">
            회원가입
          </Link>
        </div>
      </form>
    </main>
  );
}