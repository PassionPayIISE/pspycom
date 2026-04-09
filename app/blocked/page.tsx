export default function BlockedPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-24">
      <section className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Blocked
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          탈퇴된 회원입니다.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-600">
          이 계정은 현재 사이트 이용이 제한되어 있습니다.
          문의가 필요하면 관리자에게 연락하세요.
        </p>
      </section>
    </main>
  );
}