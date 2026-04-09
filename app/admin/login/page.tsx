"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setLoading(false);
      setMessage(`로그인 실패: ${error.message}`);
      return;
    }

    setLoading(false);
    window.location.href = "/admin/notices";
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6">
      <h1 className="mb-6 text-3xl font-bold text-[#1f1f1f]">Admin Login</h1>

      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="mb-3 rounded-xl border border-[#e7e5df] px-4 py-3"
      />

      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="mb-4 rounded-xl border border-[#e7e5df] px-4 py-3"
      />

      <button
        onClick={handleSignIn}
        disabled={loading}
        className="rounded-xl bg-[#fbaf45] px-4 py-3 font-semibold text-[#1f1f1f] disabled:opacity-60"
      >
        {loading ? "로그인 중..." : "로그인"}
      </button>

      {message && (
        <p className="mt-4 whitespace-pre-wrap text-sm text-red-600">
          {message}
        </p>
      )}
    </main>
  );
}