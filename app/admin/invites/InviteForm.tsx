"use client";

import { useState } from "react";

export default function InviteForm() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleInvite = async () => {
    setLoading(true);
    setMessage("");

    const res = await fetch("/api/admin/invite", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });

    const data = await res.json();

    setLoading(false);

    if (!res.ok) {
      setMessage(data.error || "초대 발송 실패");
      return;
    }

    setMessage("초대 메일 발송 완료");
    setEmail("");
  };

  return (
    <section className="rounded-3xl border border-[#e7e5df] bg-white p-6">
      <h2 className="text-xl font-semibold text-[#1f1f1f]">
        승인된 이메일 초대
      </h2>
      <p className="mt-2 text-sm leading-7 text-[#6b7280]">
        공개 회원가입은 막고, 승인된 이메일에만 초대 메일을 보낸다.
      </p>

      <div className="mt-6 grid gap-4">
        <input
          type="email"
          placeholder="초대할 이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-[#e7e5df] px-4 py-3"
        />

        <button
          onClick={handleInvite}
          disabled={loading}
          className="w-fit rounded-xl bg-[#fbaf45] px-5 py-3 font-semibold text-[#1f1f1f] disabled:opacity-60"
        >
          {loading ? "발송 중..." : "초대 메일 보내기"}
        </button>

        {message && <p className="text-sm text-[#6b7280]">{message}</p>}
      </div>
    </section>
  );
}