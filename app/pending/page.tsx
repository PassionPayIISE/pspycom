export default function PendingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-24">
      <section className="text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-gray-500">
          Pending
        </p>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight">
          가입 승인을 기다리는 중입니다.
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-sm leading-7 text-gray-600">
          관리자 승인 후 사이트의 기능을 이용할 수 있습니다.
          승인 완료 전까지는 페이지 접근이 제한될 수 있습니다.
        </p>
      </section>
    </main>
  );
}