export default function VisionPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-96px)] w-full max-w-[1600px] items-center justify-center px-8 py-20">
      <section className="w-full max-w-4xl rounded-[36px] border border-gray-200 bg-[#f7f7f5] px-12 py-24 text-center">
        <p className="text-sm font-medium uppercase tracking-[0.24em] text-gray-500">
          Our vision
        </p>

        <h1 className="mt-6 text-5xl font-bold tracking-tight">
          PSPY
        </h1>

        <p className="mx-auto mt-8 max-w-3xl text-[17px] leading-8 text-gray-600">
          산업공학적 사고를 바탕으로 실제 문제를 정의하고,
          데이터를 활용해 해결책을 설계하는 학술적 훈련
        </p>

        <p className="mx-auto mt-6 max-w-3xl text-[17px] leading-8 text-gray-600">
          단순한 스터디에 머무르지 않고, 프로젝트 협업을 통해
          구성원 각자가 실질적인 성장과 실행력을 갖출 수 있는 커뮤니티
        </p>
      </section>
    </main>
  );
}