# pspycom

PassionPayIISE 동아리 운영 목적에 맞춰 직접 확장 중인 프로젝트입니다.

---

## 🚀 Getting Started / 시작하기

### 1. 저장소 클론

```bash
git clone https://github.com/PassionPayIISE/pspycom.git
cd pspycom
```

### 2. 패키지 설치

```bash
npm install
```

### 3. 환경변수 파일 생성

프로젝트 루트에 `.env.local` 파일을 만들고 아래 값을 입력합니다.

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

> 실제 사용 중인 키 이름은 프로젝트 코드 기준으로 맞추면 됩니다.

### 4. 개발 서버 실행

```bash
npm run dev
```

### 5. 브라우저 접속

```
http://localhost:3000
```

---

## 🧪 Running the Tests / 테스트 실행

현재 이 프로젝트는 별도의 자동 테스트 프레임워크보다 타입 체크와 실제 기능 동작 확인을 중심으로 점검합니다.

### 타입 체크

```bash
npx tsc --noEmit
```

### 확인 권장 항목

- 로그인 / 회원가입 정상 동작 여부
- 이메일 인증 흐름
- 관리자 승인 여부
- 게시글 작성 / 수정 / 삭제
- 댓글 / 답글 작성 / 삭제
- 공지사항 조회 및 관리 기능
- 회원 상태별 접근 제한 처리

### 기능 수정 후 점검 순서

```bash
npm run dev
npx tsc --noEmit
```

이후 브라우저에서 직접 기능을 검증합니다.

1. 수정한 페이지 진입
2. 관련 액션 실행
3. Supabase 데이터 반영 여부 확인
4. 권한 처리 확인
5. 배포 전 최종 타입 체크

---

## 📦 Deployment / 배포

이 프로젝트는 GitHub와 Vercel을 기준으로 배포합니다.

### 기본 배포 흐름

```bash
git add .
git commit -m "커밋 메시지"
git push origin main
```

GitHub에 push하면 Vercel이 최신 커밋을 자동으로 배포합니다.

### 배포 시 확인할 것

- GitHub에 실제로 push 되었는지
- Vercel이 최신 커밋으로 빌드했는지
- Vercel 환경변수가 로컬과 동일하게 설정되어 있는지
- Supabase URL / Key가 올바르게 연결되어 있는지

---

## 🗂️ Project Structure / 프로젝트 구조

```
.
├── app/                     # Next.js App Router 페이지
│   ├── admin/              # 관리자 페이지 (회원 관리, 공지 관리, 초대)
│   ├── api/                # API 라우트
│   ├── auth/               # 인증 처리 라우트
│   ├── board/              # 자유게시판 페이지
│   ├── login/              # 로그인 페이지
│   ├── signup/             # 회원가입 페이지
│   ├── notice/             # 공지사항 페이지
│   ├── members/            # 회원 목록 페이지
│   └── ...                 # 기타 정적/안내 페이지
│
├── public/                 # 이미지, 아이콘 등 정적 파일
│
├── src/                    # 실제 애플리케이션 코드
│   ├── application/        # 유스케이스, DTO, 서비스
│   │   ├── dto/            # 화면/응답 전달용 데이터 구조
│   │   └── use-cases/      # 기능 단위 비즈니스 로직
│   │
│   ├── components/         # 재사용 UI 컴포넌트
│   │   ├── common/         # 공통 버튼, 입력창, 로딩 UI
│   │   ├── layout/         # 헤더 등 레이아웃 컴포넌트
│   │   ├── member/         # 회원 관련 UI 컴포넌트
│   │   └── notice/         # 공지 관련 UI 컴포넌트
│   │
│   ├── container/          # 의존성 조립
│   │
│   ├── domain/             # 핵심 도메인 계층
│   │   ├── entities/       # 엔티티
│   │   ├── repositories/   # 레포지토리 인터페이스
│   │   ├── services/       # 도메인 서비스
│   │   └── value-objects/  # 값 객체
│   │
│   ├── infrastructure/     # 외부 시스템 구현
│   │   ├── repositories/   # Supabase 레포지토리 구현체
│   │   ├── supabase/       # Supabase 클라이언트 설정
│   │   └── email/          # 이메일 관련 구현
│   │
│   ├── shared/             # 공용 유틸, 에러, 상수, 타입
│   ├── lib/                # 보조 라이브러리성 코드
│   └── types/              # 전역 타입 정의
│
├── package.json            # 의존성 및 npm 스크립트
├── next.config.ts          # Next.js 설정
├── tsconfig.json           # TypeScript 설정
├── postcss.config.mjs      # PostCSS 설정
├── .env.local              # 로컬 환경변수
└── README.md               # 프로젝트 설명서
```

### 구조 요약

| 디렉토리 | 역할 |
|---|---|
| `app/` | 페이지와 라우팅 담당 |
| `src/application/` | 유스케이스 중심의 비즈니스 로직 |
| `src/domain/` | 핵심 엔티티와 규칙 정의 |
| `src/infrastructure/` | Supabase 등 외부 시스템 연결 구현 |
| `src/components/` | 재사용 가능한 UI 컴포넌트 |
| `src/container/` | 유스케이스와 레포지토리 의존성 조립 |
| `src/shared/` | 공용 유틸, 에러, 상수 관리 |

---

## 🛠️ Built With / 사용 기술

| 기술 | 설명 |
|---|---|
| [Next.js](https://nextjs.org/) | React 기반 프레임워크 |
| [TypeScript](https://www.typescriptlang.org/) | 정적 타입 기반 개발 |
| [Tailwind CSS](https://tailwindcss.com/) | 유틸리티 기반 스타일링 |
| [Supabase](https://supabase.com/) | 인증, 데이터베이스, 백엔드 기능 |
| [Vercel](https://vercel.com/) | 배포 플랫폼 |

---

## 🤝 Contribution / 기여

### 기본 원칙

- UI만 수정하는지, 로직까지 수정하는지 먼저 구분합니다.
- 엔티티 생성자를 바꾸면 사용하는 모든 코드를 함께 수정해야 합니다.
- 수정 후에는 반드시 타입 체크를 실행합니다.
- 기능 단위로 작은 커밋을 남기는 것이 좋습니다.

### 작업 전 확인

예를 들어 `BoardPost` 생성자를 수정했다면 아래 명령어로 영향 범위를 확인할 수 있습니다.

```bash
grep -R "new BoardPost(" -n src app
```

수정 후에는 반드시 아래를 실행합니다.

```bash
npx tsc --noEmit
```

### 커밋 메시지 예시

```bash
git commit -m "feat: 게시글 작성자 이름 표시 추가"
git commit -m "fix: 답글 삭제 시 하위 댓글 처리 수정"
git commit -m "docs: README 개발 가이드 정리"
```

---

## 📄 License / 라이센스

현재 이 프로젝트의 라이센스는 별도로 명시되어 있지 않습니다.  
시간 되시는 분 부탁해용~

---

## 📝 Acknowledgments / 비고

- 기능을 추가할 때는 UI 수정인지, 도메인 로직 수정인지 먼저 구분하는 것이 중요합니다.
- Supabase 스키마 변경이 발생하면 관련 문서와 README도 함께 업데이트하는 것을 권장합니다.
