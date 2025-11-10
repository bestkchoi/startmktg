# Start Marketing — Cursor 개발 사양서 v1.0

최종 업데이트일: 2025-11-09, 담당: BK, 협업: Start Marketing 팀

---

## 0. TL,DR
- 목표: UTM Checker를 2주 내 MVP로 출시, 이후 UTM Builder, Media Mix Planner 순차 확장.
- 권장 스택: Next.js 15 App Router, TypeScript, Supabase Postgres, Vercel, Edge Functions, Drizzle ORM, Zod, Playwright, Vitest.
- 대안 스택: 기존 계획 유지 시 Express, EJS, Prisma, Render 또는 Fly.io, PlanetScale 또는 Supabase.
- 핵심 KPI: 첫달 200 MAU, 자동 점검 성공률 95% 이상, URL 검사 평균 300ms 이하, 오류율 0.1% 이하.

---

## 1. 제품 개요
- 제품명: Start Marketing
- 핵심 가치: 마케터가 데이터 정확도를 보장하면서 빠르게 캠페인 링크를 생성, 점검, 배포할 수 있도록 돕는 SaaS.
- 1차 타겟: 인하우스 퍼포먼스 마케터, 에이전시 AE, 데이터 애널리스트.

## 2. 목표와 KPI
- 비즈니스 목표: 무료 UTM Checker로 유입, 유료 프로 플랜으로 전환.
- 제품 KPI: DAU, 검사 성공률, 검사당 소요시간, 리텐션 D7, 전환율.
- 품질 KPI: P95 응답시간 500ms 이하, 오류율 0.1% 이하, 가용성 99.9%.

## 3. 사용자와 시나리오
- 역할
  - Owner, Admin, Member, Viewer.
- 주요 시나리오
  1) 링크 붙여넣기, 자동 파싱, GA4 자동수집 파라미터 검증, 누락 알림.
  2) 규칙 기반 정책 검증, 예: source, medium, campaign 네이밍 룰.
  3) 결과 공유, 복사, CSV 내보내기.
  4) 팀 정책 템플릿 관리.

## 4. 기능 요구사항 — UTM Checker MVP
- 입력: 단일 URL, 다중 URL, 파일 업로드 CSV.
- 파싱: URL, 쿼리스트링, 해시, 리다이렉션 추적 옵션.
- 검증 규칙
  - 필수 파라미터 존재: utm_source, utm_medium, utm_campaign.
  - 권장 파라미터: utm_content, utm_term.
  - GA4 자동수집 충돌 감지: gclid, wbraid, gbraid, msclkid, gbraid 규칙.
  - 금지 문자, 대소문자, 공백, 한글 인코딩 검사.
  - 도메인 화이트리스트, 랜딩 URI 패턴.
- 결과
  - Pass, Warning, Fail 등급, 사유, 자동 수정 제안, 복사 버튼.
  - 배치 검사 리포트, 다운로드 CSV.
- 정책 템플릿
  - 팀별 네이밍 룰, 키 밸류 프리셋, 정규식 검사, 예외 리스트.
- 권한
  - 워크스페이스, 프로젝트, 템플릿 편집 권한 분리.

## 5. 비기능 요구사항
- 성능: 단일 URL 검사 300ms 평균, 50 동시 요청에서도 P95 500ms 유지.
- 보안: JWT, RLS, HTTPS 강제, 비공개 워크스페이스.
- 접근성: WCAG 2.1 AA, 키보드 네비게이션, 스크린리더 라벨.
- 국제화: ko-KR, en-US 지원, dayjs 또는 temporal 사용.

## 6. 시스템 아키텍처
- 프런트엔드: Next.js 15 App Router, React Server Components, Server Actions.
- 백엔드: Next API Route 또는 Supabase Edge Functions. 향후 큐 처리에 Upstash Redis.
- 데이터: Supabase Postgres, Drizzle ORM 마이그레이션, RLS.
- 배포: Vercel. 환경 변수는 Vercel 환경별로 분리.
- 관측: Vercel Analytics, Sentry, Logtail.

```
[Client] — HTTP — [Next.js App Router] — [Route Handler, Server Actions]
                                     ├— Supabase Postgres
                                     ├— Edge Functions (검사 엔진)
                                     └— Redis Queue (배치 검사)
```

## 7. 데이터 모델 초안
- tables
  - users: id, email, name, role, created_at.
  - workspaces: id, name, plan, created_at.
  - workspace_members: id, workspace_id, user_id, role.
  - projects: id, workspace_id, name, key, created_at.
  - policies: id, workspace_id, name, json_schema, version, is_default.
  - checks: id, project_id, requested_by, mode, status, created_at.
  - check_items: id, check_id, url, result, grade, messages jsonb, fixed_url.
  - utm_templates: id, workspace_id, name, fields jsonb.
  - audit_logs: id, workspace_id, actor_id, action, entity, payload, created_at.

- 인덱스와 제약
  - checks(project_id, created_at desc), check_items(check_id), policies(workspace_id).
  - URL 최대 길이 2,048, 파라미터 키 64, 값 512.

## 8. API 설계 초안
- 인증: Supabase Auth, JWT Bearer, RLS.
- 엔드포인트 예시
  - POST /api/checks — 본문: { projectId, urls[], options }, 응답: checkId.
  - GET  /api/checks/:id — 검사 요약, 항목 페이지네이션.
  - POST /api/policies — 정책 생성, json_schema 업로드.
  - GET  /api/policies/:id — 정책 상세.

- 검사 엔진 규칙 스키마 예시
```json
{
  "requiredParams": ["utm_source", "utm_medium", "utm_campaign"],
  "forbiddenChars": [" ", "..", "?utm_utm"],
  "case": { "utm_source": "lower" },
  "domainWhitelist": ["example.com", "shop.example.com"],
  "regexRules": [
    {"key":"utm_medium", "pattern":"^(cpc|email|display|social)$"}
  ]
}
```

## 9. 프런트엔드 설계
- UI 프레임워크: Tailwind CSS, shadcn/ui, Radix.
- 페이지
  - /, /login, /workspace, /project/:id/check, /project/:id/results, /settings/policies.
- 컴포넌트
  - UrlPasteBox, CheckResultTable, RuleBadge, FixSuggestion, PolicyEditor(JSON, Form).
- 상태관리: React Query, Server Actions, Optimistic UI for policy save.

## 10. SEO, 분석, 로깅
- SEO: App Router 메타, OG 이미지 자동, sitemap, robots.
- 분석: Vercel Analytics, 자체 events 테이블.
- 로깅: Sentry error, Logtail request log, P95 지표 수집.

## 11. 배포, 환경변수, CI/CD
- 브랜치 전략: trunk based, main 보호, PR 필수.
- CI: GitHub Actions, 타입체크, 린트, 테스트, 프리뷰 배포.
- CD: main 머지 시 Vercel 프로덕션 배포.
- ENV 키
  - NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SENTRY_DSN, REDIS_URL.

## 12. 테스트 전략
- 단위: Vitest, 규칙 검증, 파서 함수.
- 통합: Playwright, URL 검사 플로우, 파일 업로드.
- 컨트랙트: Zod로 요청, 응답 스키마 검증.
- 퍼포먼스: k6 또는 Artillery로 배치 검사 1,000 URL.

## 13. 운영, 알림, SLO
- SLO
  - 가용성 99.9, P95 응답시간 500ms, 오류율 0.1.
- 알림: Sentry PagerDuty 또는 Slack, 월간 리포트 자동 메일.

## 14. 로드맵
- v1.0 UTM Checker MVP
  - 단일, 다중, CSV 업로드, 정책 1개, 결과 다운로드.
- v1.1 UTM Builder
  - 폼 기반 생성, 팀 프리셋, 네이밍 가이드, 단축링크 연동.
- v1.2 Media Mix Planner
  - 채널별 입력표, KPI 시뮬레이터, 내보내기.
- v1.3 Tracking QA
  - 실시간 페이지 스니펫 설치 검사, GA4 DebugView 보조.

## 15. Cursor 워크플로우, 템플릿
- 폴더 구조
```
start-mktg/
  apps/web/         # Next.js
  packages/ui/      # 공유 UI 컴포넌트
  packages/config/  # eslint, tsconfig, tailwind
  infra/            # IaC, GitHub Actions
```

- .cursorrules 초안
```
You are a senior full-stack engineer. Always output TypeScript. Prefer Next.js App Router, Server Actions, Drizzle ORM. Use Zod for all schemas. Write tests with Vitest and Playwright. Follow Conventional Commits. Provide minimal, production ready code with error handling and optimistic UI where relevant.
```

- Cursor 프롬프트 예시
  1) "UTM 검사 엔진 모듈 작성. 입력은 URL 문자열, 출력은 규칙 위반 목록과 자동 수정 제안. Zod 스키마 포함, Vitest 추가."
  2) "Next.js App Router로 /project/:id/check 페이지 구현. 드래그 앤 드롭 CSV 업로드, React Query 사용."
  3) "Drizzle 스키마와 마이그레이션 생성. 테이블은 checks, check_items, policies."

## 16. 코드 규칙
- TypeScript strict, ESLint, Prettier, Husky pre-commit, lint-staged.
- commitlint, Conventional Commits, semantic-release 준비.

## 17. 초기 백로그 티켓
1) URL 파서와 쿼리 파라미터 유효성 검사 유틸 작성.
2) 규칙 스키마 정의와 Zod 유효성 검증 추가.
3) 단일 URL 검사 API, 배치 검사 API 구현.
4) CSV 업로드 처리, 20,000행 제한, 스트리밍 파싱.
5) 결과 테이블 UI, Pass, Warning, Fail 배지 표시.
6) 정책 편집기 MVP, JSON 로우 에디터, 샘플 템플릿 제공.
7) Supabase 프로젝트 셋업, RLS 정책, 서비스 키 분리.
8) Sentry, Logtail, Vercel Analytics 연결.
9) E2E 시나리오 테스트 3건, 회귀 스모크 추가.
10) 문서화, 온보딩 가이드, 릴리즈 노트 v1.0.

## 18. 명명 규칙, URL 규칙
- 파라미터 키는 소문자, 언더스코어 금지, 하이픈 허용.
- utm_campaign 네이밍: crm_text_lms_<campaign-name> 권장, 공백 대신 하이픈.
- 앱 라우트는 영어 소문자, 단수형 리소스 우선.

## 19. 데이터 익스포트 포맷
- CSV 헤더: url, status, grade, issues, fixed_url, checked_at.
- JSON 스키마는 버전 포함, 예: schema_version, rules[].

## 20. 보안, 컴플라이언스
- 개인정보 미수집 원칙, 링크 로그에 개인정보가 포함되지 않도록 해시 처리.
- 감사로그, 관리자 접근 이중 확인.

---

### 부록 A. Express 대안 설계 요약
- 기존 Express, EJS 유지 시
  - 서버: Fastify 또는 Express, View는 EJS 또는 Nunjucks.
  - ORM: Prisma, DB는 Supabase 또는 RDS.
  - 프런트: 최소 Alpine 또는 React SPA.
  - 배포: Render, Fly.io, Railway.
  - 장점: 기존 흐름 유지. 단점: SEO, 확장 비용.

### 부록 B. 샘플 드리즐 스키마 스니펫
```ts
export const checks = pgTable('checks', {
  id: uuid('id').primaryKey().defaultRandom(),
  projectId: uuid('project_id').notNull(),
  mode: varchar('mode', { length: 16 }).notNull(),
  status: varchar('status', { length: 16 }).notNull(),
  createdAt: timestamp('created_at').defaultNow(),
});
```

### 부록 C. 규칙 템플릿 샘플
```json
{
  "name": "Default UTM Policy",
  "requiredParams": ["utm_source", "utm_medium", "utm_campaign"],
  "case": {"utm_source":"lower","utm_medium":"lower","utm_campaign":"lower"},
  "regexRules": [
    {"key":"utm_medium","pattern":"^(cpc|email|display|social|kakao|sms)$"}
  ],
  "forbiddenChars": [" ", ".."],
  "domainWhitelist": []
}
```

