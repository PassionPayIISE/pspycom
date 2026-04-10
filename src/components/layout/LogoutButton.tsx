"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/infrastructure/supabase/client";

export default function LogoutButton() {
  const router = useRouter();

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  return (
    <button onClick={handleLogout} className="transition hover:text-black">
      logout
    </button>
  );
}