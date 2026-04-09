"use client";

import { useState } from "react";

const GOOGLE_FORM_ACTION =
  "https://docs.google.com/forms/d/e/1FAIpQLSc_Fazr1FHHUkY1GExHPJP0yI5bSAhZrP6Q7_gCT_DPbpfeyw/formResponse";

const EMAIL_ENTRY_NAME = "entry.200498716";

export default function RecruitPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setErrorMessage("");

    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      setErrorMessage("이메일을 입력하세요.");
      setLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append(EMAIL_ENTRY_NAME, trimmedEmail);

      await fetch(GOOGLE_FORM_ACTION, {
        method: "POST",
        mode: "no-cors",
        body: formData,
      });

      setMessage("모집 시작 시 입력한 이메일로 안내 메일을 보내드리겠습니다.");
      setEmail("");
    } catch {
      setErrorMessage("제출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-[1600px] px-8 py-20">
      <section className="rounded-[36px] border border-gray-200 bg-[#f7f7f5] px-12 py-24">
        <div className="max-w-3xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-500">
            Recruit
          </p>

          <h1 className="mt-6 text-6xl font-bold tracking-tight">
            모집 알림 신청
          </h1>

          <p className="mt-8 text-[17px] leading-8 text-gray-600">
            이메일을 남겨주시면 지원 기간이 시작될 때 안내 메일을 보내드립니다.
            실제 지원은 모집 기간에 별도 링크로 진행됩니다.
          </p>

          <form onSubmit={handleSubmit} className="mt-12 max-w-xl space-y-5">
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
                placeholder="example@email.com"
                className="w-full rounded-2xl border border-gray-300 bg-white px-5 py-4 outline-none focus:border-black"
              />
            </div>

            <p className="text-sm text-gray-500">
              입력한 이메일은 모집 안내 메일 발송 목적으로만 사용됩니다.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-black px-6 py-4 text-sm font-medium text-white disabled:opacity-50"
            >
              {loading ? "제출 중..." : "알림 신청"}
            </button>

            {message && (
              <p className="rounded-2xl border border-green-200 bg-green-50 px-5 py-4 text-sm text-green-700">
                {message}
              </p>
            )}

            {errorMessage && (
              <p className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}