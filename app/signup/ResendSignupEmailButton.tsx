"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Props = {
  email: string;
};

export default function ResendSignupEmailButton({ email }: Props) {
  const supabase = createClient();

  const [message, setMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleResend = async () => {
    setMessage("");
    setErrorMessage("");
    setIsSending(true);

    const { error } = await supabase.auth.resend({
      type: "signup",
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });

    if (error) {
      setErrorMessage("인증 이메일 재전송에 실패했습니다.");
      setIsSending(false);
      return;
    }

    setMessage("인증 이메일을 다시 보냈습니다.");
    setIsSending(false);
  };

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleResend}
        disabled={isSending}
        className="text-sm text-blue-600 hover:underline disabled:opacity-60"
      >
        {isSending ? "재전송 중..." : "인증 이메일 다시 보내기"}
      </button>

      {message ? <p className="mt-2 text-sm text-green-600">{message}</p> : null}
      {errorMessage ? (
        <p className="mt-2 text-sm text-red-500">{errorMessage}</p>
      ) : null}
    </div>
  );
}