import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "./LogoutButton";

export default async function Header() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let isAdmin = false;

  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="w-full border-b border-gray-200 bg-[#f7f7f5]">
      <div className="relative mx-auto flex h-24 w-full max-w-[1600px] items-center px-8">
        {/* left: logo */}
        <div className="absolute left-8 top-1/2 -translate-y-1/2">
          <Link href="/" className="flex items-center">
            <Image
              src="/pspylogo.png"
              alt="PSPY logo"
              width={64}
              height={64}
              className="h-14 w-auto object-contain"
              priority
            />
          </Link>
        </div>

        {/* center: main menu */}
        <nav className="mx-auto flex items-center gap-14 text-[17px] font-medium text-gray-800">
          <Link href="/" className="transition hover:text-black">
            Home
          </Link>

          <Link href="/vision" className="transition hover:text-black">
            Our vision
          </Link>

          <Link href="/notice" className="transition hover:text-black">
            notice
          </Link>

          <Link href="/board" className="transition hover:text-black">
            community
          </Link>

          <Link href="/recruit" className="transition hover:text-black">
            recruit
          </Link>
        </nav>

        {/* right: auth */}
        <div className="absolute right-8 top-1/2 flex -translate-y-1/2 items-center gap-4 text-[15px] font-medium text-gray-800">
          {user ? (
            <>
              {isAdmin && (
                <>
                  <Link href="/admin/notices" className="transition hover:text-black">
                    공지관리
                  </Link>
                  <Link href="/admin/members" className="transition hover:text-black">
                    회원관리
                  </Link>
                </>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/signup" className="transition hover:text-black">
                sign up
              </Link>
              <span className="text-gray-300">|</span>
              <Link href="/login" className="transition hover:text-black">
                login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}