# 📘 Start Marketing – Project Structure Guide

## 🎯 목적 (Purpose)
이 문서는 Start Marketing 프로젝트에서 **GPT(기획자)** 와 **Cursor(개발자)** 간의 협업을 명확히 하기 위한 구조 가이드입니다.  
Cursor는 외주 개발자 역할을 하며, GPT와 사용자가 정의한 기획/PRD/SPEC 문서를 기반으로 개발합니다.

---

## 🏗️ 프로젝트 폴더 구조 (Overview)

```
251109_startmktg/
├─ docs/                     # 문서 전용 폴더 (기획, 명세, 구조, 로그 등)
│  ├─ PRD/                   # Product Requirement Documents (제품 요구사항)
│  │   └─ PRD_UTM_Checker_v1.0.md
│  ├─ SPEC/                  # 기술 명세 및 API, ERD 정의
│  │   ├─ start_marketing_cursor_spec.md
│  │   ├─ supabase-db-prd-v1.md
│  │   └─ README_URL_Guide.md
│  ├─ STRUCTURE/             # 프로젝트 구조 설명 (Cursor 개발 가이드)
│  │   └─ README_STRUCTURE.md ← (현재 문서)
│  └─ CHANGELOG/             # 버전별 변경 내역 (추가 예정)
│
├─ src/                      # 실제 코드 (Next.js App Router 구조)
│  ├─ app/                   # 페이지 및 API 라우트
│  │   ├─ api/
│  │   │   ├─ ping/route.ts                 # Supabase 헬스체크
│  │   │   └─ utm-checker/route.ts          # UTM 생성/저장 API (Step 2에서 추가)
│  │   ├─ history/page.tsx                  # 최근 생성 이력 페이지 (Step 3에서 추가)
│  │   ├─ layout.tsx                        # 전역 레이아웃
│  │   └─ page.tsx                          # 메인 페이지 (UTM 입력 및 생성)
│  │
│  ├─ components/            # UI 컴포넌트 (폼, 미리보기 등)
│  │   ├─ utm-form.tsx
│  │   ├─ url-preview.tsx
│  │   ├─ platform-badges.tsx
│  │   └─ ui/ (기초 UI 요소)
│  │
│  ├─ libs/                  # 라이브러리 및 클라이언트 설정
│  │   └─ supabase/
│  │       ├─ client.ts                      # 브라우저용 Supabase
│  │       └─ server.ts                      # 서버용 Supabase
│  │
│  ├─ utils/                 # 공통 유틸리티 (로직, 파싱, 조합)
│  │   ├─ buildUtmUrl.ts
│  │   └─ detectPlatformParams.ts
│  │
│  └─ styles/                # 전역 스타일 및 Tailwind 초기화
│      └─ globals.css
│
├─ .env.local                # 환경 변수 (Supabase 연결 정보)
├─ next.config.ts            # Next.js 설정 파일
├─ tailwind.config.ts        # Tailwind 설정 파일
├─ tsconfig.json             # TypeScript 설정 파일
├─ package.json              # 프로젝트 의존성 관리
└─ README.md                 # 실행 및 배포 가이드
```

---

## 🧩 역할 정의 (Responsibility Split)

| 역할 | 담당자 | 설명 |
|------|---------|------|
| **기획 및 기능 정의** | GPT + 사용자 | PRD 작성, 서비스 목적·기능 정의 |
| **데이터베이스 구조 정의** | GPT + 사용자 | Supabase 스키마 정의, ERD 작성 |
| **기술 명세 (SPEC)** | GPT | API 규격, 함수 시그니처, 코드 규칙 작성 |
| **개발 구현** | Cursor | GPT와 사용자 문서 기반으로 코드 구현 |
| **리뷰 및 개선 피드백** | GPT + 사용자 | 코드 리뷰 및 개선 요청 |

---

## 📁 폴더별 역할 상세

### 📂 docs/
- **PRD/** → 제품 요구사항 정의서. 기능, 데이터, 화면 설명이 포함됨.
- **SPEC/** → 기술 명세 문서. API, 데이터 흐름, ERD, 함수 설계 등.
- **STRUCTURE/** → Cursor 개발자가 폴더 역할을 혼동하지 않도록 구조 가이드 제공.
- **CHANGELOG/** → 버전별 수정 이력. 이후 단계에서 추가 예정.

### 📂 src/
- **app/** → Next.js App Router 루트. 모든 페이지와 API 라우트를 포함.
- **components/** → 재사용 가능한 UI 요소.
- **libs/** → 외부 SDK, 클라이언트 설정, 헬퍼 함수.
- **utils/** → 비즈니스 로직, 데이터 처리 유틸리티.
- **styles/** → 전역 CSS 및 Tailwind 설정.

### ⚙️ 환경 변수 규칙
| 변수명 | 설명 |
|--------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트 URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase 공개 키 (익명 접근용) |
| `SUPABASE_SERVICE_ROLE_KEY` | 서버 전용 역할 키 (선택사항, RLS 미사용 시) |

> ⚠️ `.env.local` 은 Git에 커밋하지 않는다.

---

## 🔖 코드 네이밍 규칙
| 유형 | 규칙 |
|------|------|
| 폴더명 | 모두 소문자, 단어 구분은 하이픈(-) |
| 파일명 | 소문자, 단어 구분은 하이픈(-), 예: `build-utm-url.ts` |
| 컴포넌트명 | PascalCase, 예: `UtmForm.tsx` |
| 인터페이스명 | PascalCase + `I` 접두어 지양 (TS 관례대로 유지) |
| 환경변수 | 대문자 + 언더스코어 `_` |

---

## 🔧 개발 워크플로 (GPT ↔ Cursor 협업 흐름)

1️⃣ **기획 (GPT & 사용자)**
- PRD 문서 생성 → 서비스 목적, 기능 정의

2️⃣ **명세 (GPT)**
- SPEC 문서 생성 → 데이터 구조, API 시그니처, 예시 응답 작성

3️⃣ **개발 (Cursor)**
- PRD + SPEC 기반으로 코드 구현
- src 내부 파일만 수정 (docs는 절대 수정 금지)

4️⃣ **검증 (사용자)**
- 로컬 테스트 → 정상 동작 확인 후 다음 Step 진행

5️⃣ **피드백 (GPT)**
- 코드 리뷰, 개선 포인트 정리 → Cursor에게 새 프롬프트 제공

---

## 🧱 향후 확장 계획
| 폴더 | 예정 기능 |
|-------|-------------|
| `docs/CHANGELOG` | 버전별 릴리즈 노트 자동 관리 |
| `docs/DB` | Supabase ERD, SQL DDL 정리 |
| `src/tests` | Jest 기반 단위 테스트 추가 |
| `src/hooks` | React custom hooks 관리 (Auth, Query 등) |

---

## ✅ 요약
- `src/` = 코드 전용 구역, Cursor의 작업 영역
- `docs/` = 문서 전용 구역, GPT와 사용자의 설계 영역
- Cursor는 오직 **PRD/SPEC에 정의된 내용만 개발**
- GPT는 PRD와 SPEC을 지속적으로 업데이트해 Cursor가 정확히 인식하도록 유지

