import type { Metadata } from "next";
import "./globals.css";
import Header from "@/src/components/layout/Header";

export const metadata: Metadata = {
  title: "PSPY",
  description: "PassionPayIISE Club Homepage",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-[#f7f7f5] text-black">
        <Header />
        {children}
      </body>
    </html>
  );
}