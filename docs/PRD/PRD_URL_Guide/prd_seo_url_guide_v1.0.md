# 🌐 PRD_SEO_URL_Guide_v1.0

## 1. Overview

**문서명:** SEO URL Guide  
**버전:** 1.0  
**작성일:** 2025-11-15  
**작성자:** Start Marketing Product Team

**문서 목적:**  
Start Marketing 글로벌 서비스의 URL 체계를 통일하고, SEO 친화적 다국어 라우팅·메타데이터 정책을 제품 요구사항으로 명문화한다. i18n 라우팅, canonical/hreflang, 리다이렉션, 사이트맵 전략을 정의해 검색엔진 노출 품질과 사용자의 언어 경험을 동시에 높인다.

**대상 범위:**  
- Next.js App Router 기반 `utm.startmktg.com` 웹 서비스  
- `/api.startmktg.com` API는 간접 영향(도메인 일관성)만 다룸  
- 사내 CMS·블로그는 후속 연동 범위에서 제외

---

## 2. Problem Statement

| 문제 | 영향 | 비고 |
|------|------|------|
| 언어별 URL 규칙 부재 | 검색엔진이 언어 버전을 구분하지 못해 노출 품질 저하 | 현재 `/ko`, `/en` 경로가 없음 |
| hreflang/canonical 미구현 | 중복 콘텐츠 페널티, 잘못된 지역 결과 노출 | 글로벌 확장 시 치명적 |
| 302/자바스크립트 리다이렉트 의존 | 크롤러가 최종 경로 인식 실패 가능 | SEO 스코어 하락 |
| 사이트맵/robots 정책 미정 | 로컬라이즈된 URL 제출 불가 | 인덱싱 지연 |

---

## 3. Goals & Success Metrics

### 3.1 목표
1. **언어별 명확한 URL 계층화**: `/en`, `/ko`, `/jp` 1차 디렉터리 고정.
2. **검색엔진 신뢰도 향상**: canonical·hreflang·sitemap을 완비해 중복 페이지를 제거.
3. **사용자 경험 향상**: `Accept-Language` 기반 초기 진입 리다이렉트, locale 전환 토글 제공.
4. **운영 효율성 확보**: 신규 언어 추가 시 1일 이내 라우트/메타 설정 가능.

### 3.2 성공 지표
| 지표 | 목표값 | 측정 방법 |
|------|--------|-----------|
| 국제 검색 노출 CTR | 15% ↑ (국문 대비) | GSC 국가별 CTR |
| 다국어 페이지 인덱스 수 | 100% (등록 대비) | GSC Index Coverage |
| hreflang 오류 수 | 0 | GSC hreflang 리포트 |
| 신규 언어 롤아웃 리드타임 | 1영업일 이내 | 운영 로그 |

---

## 4. Scope

### 포함
- URL 패턴, locale 디렉터리 구조, 파일 배치
- Next.js `i18n` 설정, locale middleware
- SEO 메타데이터(canonical, hreflang, meta og)
- Sitemap/robots/redirect 정책
- Locale 전환 UX 컴포넌트 요구사항

### 제외
- 콘텐츠 번역 품질, L10N 워크플로
- 블로그, 문서 CMS 라우팅
- 앱 내 딥링크, 모바일 전용 URL
- 광고 랜딩 URL 자동 생성 규칙(타 PRD)

---

## 5. URL Architecture Requirements

### 5.1 기본 원칙
| 항목 | 요구사항 | 우선순위 |
|------|----------|----------|
| 언어 경로 | `/[locale]/[page]` 패턴. 루트 `/` 접근 시 기본 언어로 302 리다이렉트 | P0 |
| 허용 locale | `['en','ko','jp']` (추후 확장 가능) | P0 |
| 기본 언어 | `en` | P0 |
| 정적 경로 | `src/app/[locale]/...` 디렉터리로 분리 | P0 |
| Dynamic route | `[locale]/campaigns/[id]` 등 locale 우선 세그먼트 유지 | P1 |

### 5.2 리다이렉션
- `/` 접근 시 middleware가 `Accept-Language` -> 지원 locale 매핑 후 `/en` 등으로 302 (캐시 가능) 리다이렉트.
- 미지원 언어는 `en`으로 폴백.
- `/ko` → `/ko/utm-builder` 등 trailing slash 규칙 통일(서버단 308).

### 5.3 Locale 선택 UX
- 글로벌 네비게이션에 Locale Switcher 배치.
- 현재 언어 표시 + 드롭다운(국기 아이콘 Optional).
- 전환 시 동일 페이지 slug 유지 (예: `/en/utm-builder` → `/ko/utm-builder`).

---

## 6. SEO Metadata Requirements

| 항목 | 요구사항 | 구현 포인트 |
|------|----------|-------------|
| Canonical | 각 언어 페이지별 고유 canonical. 파라미터 제거. | App Router `generateMetadata` |
| hreflang | `x-default`, `en`, `ko`, `ja` 상호 연결 | `<link rel="alternate">` |
| Meta Title/Desc | 언어별 변환 텍스트 관리(문서/locale JSON) | i18n 딕셔너리 |
| Open Graph | `og:url` 언어별, `og:locale` 세팅 | 공유 일관성 |
| Structured Data | BreadCrumbList/Organization locale 값 포함 | JSON-LD |

---

## 7. Sitemap & Robots

### 7.1 Sitemap
- `/sitemap.xml` 루트 파일에서 언어별 sitemap 인덱스:
  - `/sitemap-en.xml`, `/sitemap-ko.xml`, `/sitemap-jp.xml`
- 각 sitemap에는 해당 언어 URL만 수록, `<xhtml:link rel="alternate">` 포함.
- 빌드 시 SSG로 생성, 매 배포마다 갱신.

### 7.2 Robots
- `User-agent: *` 허용, `Disallow` 는 staging 경로만.
- 언어별 서브 디렉터리는 공통 규칙 적용.
- 캐노니컬 도메인 `utm.startmktg.com`만 인덱싱, 기타 환경은 `noindex`.

---

## 8. Functional Requirements

### FR-1: Locale-aware Routing
- **설명:** Next.js `i18n` + App Router 구조로 locale segment 자동 처리.
- **우선순위:** P0
- **Acceptance Criteria:**  
  - `/en/utm-builder`, `/ko/utm-builder` 모두 빌드/배포 시 존재  
  - `Link` 컴포넌트 사용 시 locale automatiquement 유지

### FR-2: Middleware Locale Detection
- Accept-Language 파싱 → 지원 locale 변환 테이블 (예: `ja-JP` -> `jp`).
- 최초 세션에 locale cookie 저장, 이후 cookie 우선.
- 테스트: 브라우저 언어 조합 5가지.

### FR-3: Metadata Generator
- 페이지별 `generateMetadata`가 canonical, hreflang, og 태그 생성.
- 텍스트는 `src/lib/i18n/meta.ts` 등에서 관리.

### FR-4: Sitemap Builder CLI
- `pnpm sitemap:build` 명령으로 다국어 sitemap 생성.
- Edge Function 또는 Node script (ts-node) 기반.

### FR-5: Locale Switcher Component
- `src/components/app-bar.tsx` 내 스위처 삽입.
- URL 전환 시 기존 query string 유지.

---

## 9. Non-Functional Requirements

| 카테고리 | 요구사항 |
|----------|----------|
| 성능 | locale middleware < 20ms, SSG 우선 |
| 접근성 | Locale Switcher 키보드/스크린리더 지원 |
| 보안 | locale 쿠키는 HttpOnly 아님, 단 tamper-safe 기본 값 |
| 운영 | 신규 언어 추가 시 config + 콘텐츠 파일만 수정 |

---

## 10. Dependencies & Risks

| 구분 | 세부 내용 | 대응 |
|------|-----------|------|
| 번역 리소스 | 언어별 JSON 미준비 | Localization 팀 일정 확보 |
| 기술 부채 | 기존 라우트 리팩터링 필요 | 스프린트 2주 배정 |
| SEO 검증 | GSC 등록/검증 시간 | 단계적 롤아웃 |
| 분석 태그 | GA4 locale별 스트림 필요 | Analytics 팀 협업 |

---

## 11. Rollout Plan

1. **Phase 1 (주차 1-2)**: Next.js i18n 설정, locale 디렉터리 리팩터링.
2. **Phase 2 (주차 3)**: Metadata Generator, hreflang, canonical 적용.
3. **Phase 3 (주차 4)**: Sitemap/robots, locale switcher UI.
4. **Phase 4 (주차 5)**: Beta 릴리스 (ko/en), GSC 제출.
5. **Phase 5 (주차 6)**: jp 페이지 추가, 모니터링 후 GA.

---

## 12. Appendix

- 참조 문서: `docs/SPEC/README_URL_Guide.md`
- API 영향: `/api/v1/config/locale` (사용자 선호 저장) – 별도 API PRD 참조
- 용어:  
  - `Locale`: 언어/지역 코드 (`en`, `ko`, `jp`)  
  - `Canonical`: 검색엔진 기준 원본 URL  
  - `hreflang`: 다국어 페이지 상호 참조 태그

---

**Maintainer:** BK Choi  
**Revision History:**  
- v1.0 (2025-11-15) 최초 작성

