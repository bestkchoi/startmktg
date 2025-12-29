# 🌐 PRD_SEO_URL_Guide_v1.2  
Start Marketing – Global SEO-friendly URL Architecture

---

## 1. Overview

**문서명:** SEO URL Guide  
**버전:** 1.2  
**작성일:** 2025-11-15  
**작성자:** Start Marketing Product Team  

**목적:**  
Start Marketing 글로벌 서비스(`utm.startmktg.com`)의 URL, 라우팅, SEO 메타데이터(i18n, canonical, hreflang, sitemap, redirect)를 통일된 규칙으로 정의해 검색엔진 인덱싱 품질과 사용자 경험을 동시에 극대화한다. 본 문서는 전략적 배경과 상세 구현 지침을 한 곳에서 제공한다.

**대상 범위:**  
- Next.js App Router 기반 메인 서비스(웹)  
- `/api.startmktg.com`은 도메인 일관성/redirect 정책만 간접 영향  
- 사내 CMS·블로그·광고 랜딩 자동화는 후속 범위

---

## 2. Problem Statement

| 문제 | 영향 | 비고 |
|------|------|------|
| 언어별 URL 규칙 부재 | 검색엔진이 언어 버전을 구분하지 못해 노출 품질 저하 | `/ko`, `/en` 경로 미구현 |
| canonical/hreflang 미적용 | 중복 콘텐츠 패널티, 국가 노출 오류 | 글로벌 확장 차단 요인 |
| sitemap/robots 정책 미정 | 다국어 URL 제출 실패 → 인덱싱 지연 | |
| 리다이렉트 정책 혼재 | 크롤러 오판, 루프 가능성 | 자바스크립트 의존 |
| 폴더 구조 불명확 | 개발 효율 저하, 유지보수 비용 증가 | locale 확장 어려움 |

---

## 3. Goals & Success Metrics

### 3.1 목표
1. `/en`, `/ko`, `/jp` 기반 1차 디렉터리 정규화.
2. canonical·hreflang·sitemap 100% 적용으로 중복 제거.
3. `Accept-Language` 감지 + locale switcher로 사용자 경험 개선.
4. 신규 언어 추가 시 24시간 이내 확장 가능한 구조 확보.

### 3.2 성공 지표
| 지표 | 목표값 | 측정 방법 |
|------|--------|-----------|
| 국제 검색 CTR | +15% (국문 대비) | GSC 국가별 CTR |
| 다국어 인덱스 등록률 | 100% | GSC Index Coverage |
| hreflang 오류 | 0 | GSC hreflang 리포트 |
| 신규 언어 롤아웃 리드타임 | < 24시간 | 운영 로그 |

---

## 4. Scope

### 포함
- URL 패턴 및 locale 기반 폴더 구조
- Next.js `i18n` 설정, Accept-Language middleware
- canonical / hreflang / og 메타데이터 생성 로직
- locale switcher UX
- sitemap / robots / redirect 정책

### 제외
- 번역 품질 및 Localization 워크플로
- 블로그·문서 CMS 라우팅
- 앱 내 딥링크, 모바일 전용 URL
- 광고 랜딩 URL 생성 규칙(별도 PRD)

---

## 5. URL Architecture & Folder Structure

### 5.1 URL 패턴
```
/[locale]/[page]
/[locale]/tools/utm-checker
/[locale]/tools/utm-generator
/[locale]/docs/utm-guide
/[locale]/campaigns/[id]
```

### 5.2 기본 원칙
| 항목 | 요구사항 | 우선순위 |
|------|----------|----------|
| 허용 locale | `['en','ko','jp']` (추후 확장 가능) | P0 |
| 기본 언어 | `en` | P0 |
| 루트 접근 | `/` → `/[detected_locale]` (미지원 시 `/en`) | P0 |
| 정적 경로 | `src/app/[locale]/...` 구조로 분리 | P0 |
| Dynamic route | locale 세그먼트 최우선(`[locale]/campaigns/[id]`) | P1 |
| Trailing slash | `/ko` 요청 시 `/ko/` 308 리다이렉트 | P1 |

### 5.3 폴더 구조(실행 가이드)
```
src/
  app/
    [locale]/
      layout.tsx
      page.tsx
      tools/
        utm-checker/page.tsx
        utm-generator/page.tsx
      docs/
        utm-guide/page.tsx
    sitemap.xml/route.ts
    sitemap-en.xml/route.ts
    sitemap-ko.xml/route.ts
    sitemap-jp.xml/route.ts
  middleware.ts

lib/
  i18n/
    config.ts
    detectLocale.ts
    dictionaries/
      en.json
      ko.json
      jp.json

components/
  locale-switcher.tsx
```

---

## 6. Redirect & Locale Detection

### 6.1 Redirect Rules
| 요청 | 처리 | 코드 |
|------|------|------|
| `/` | `/[detected_locale]` | 302 |
| `/ko` | `/ko/` | 308 |
| 미지원 locale(`/fr/...`) | `/en/...` | 302 |
| `/api/*`, `/_next/*`, `/assets/*`, `/favicon.ico` | redirect 비활성 | — |

### 6.2 Middleware 요구사항
- 최초 접속 + locale 쿠키 없는 경우만 감지.
- 이미 `/xx/` 세그먼트가 있으면 통과.
- `ja-JP → jp`, `ko-KR → ko`, 기타 → `en`.
- locale 쿠키 저장, 이후 쿠키 우선.
- 응답 시간 20ms 이하.

```ts
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const skip =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico";
  if (skip) return NextResponse.next();

  const supported = ["en", "ko", "jp"];
  const hasLocale = supported.some((l) => pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const detected = detectLocale(request); // Accept-Language + cookie
  const locale = supported.includes(detected) ? detected : "en";

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl, 302);
}
```

---

## 7. SEO Metadata Requirements

| 항목 | 요구사항 | 구현 포인트 |
|------|----------|-------------|
| Canonical | 각 언어 페이지별 고유 canonical, 파라미터 제거 | `generateMetadata` |
| hreflang | `en`, `ko`, `jp`, `x-default` 상호 연결 | `<link rel="alternate">` |
| Meta Title/Desc | locale dictionary 관리, fallback `en` | `lib/i18n/dictionaries` |
| Open Graph | `og:url`, `og:locale` 언어별 지정 | 공유 일관성 |
| Structured Data | JSON-LD 내 `inLanguage` 필드 설정 | BreadCrumbList/Organization |

```ts
export async function generateMetadata({ params }: { params: { locale: string } }) {
  const locale = params.locale;
  const base = "https://utm.startmktg.com";

  return {
    title: getMetaTitle(locale),
    description: getMetaDescription(locale),
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        en: `${base}/en`,
        ko: `${base}/ko`,
        jp: `${base}/jp`,
        "x-default": `${base}/en`,
      },
    },
    openGraph: {
      url: `${base}/${locale}`,
      locale,
    },
  };
}
```

---

## 8. Sitemap & Robots

### 8.1 Sitemap 구성
- `/sitemap.xml` (index)
- `/sitemap-en.xml`
- `/sitemap-ko.xml`
- `/sitemap-jp.xml`
- 각 sitemap은 해당 언어 URL만 포함하며 `<xhtml:link rel="alternate">`를 포함.
- `pnpm sitemap:build` 스크립트로 생성, CI에서 검증.

```ts
export async function GET() {
  const urls = [
    "https://utm.startmktg.com/en",
    "https://utm.startmktg.com/en/tools/utm-checker",
  ];

  const xml = generateSitemap(urls);
  return new Response(xml, {
    headers: { "Content-Type": "application/xml" },
  });
}
```

### 8.2 Robots 정책
- `User-agent: *`, 기본 Allow.
- Staging/preview 도메인은 `Disallow: /` + `X-Robots-Tag: noindex`.
- 언어별 디렉터리는 동일 정책 적용.

---

## 9. Functional Requirements

| ID | 설명 | 우선순위 | Acceptance Criteria |
|----|------|----------|---------------------|
| FR-1 | Locale-aware Routing (`/[locale]/...`) | P0 | 빌드/배포 시 모든 언어 페이지 생성, `Link` 사용 시 locale 유지 |
| FR-2 | Middleware Locale Detection | P0 | `Accept-Language` 기반 초기 리다이렉트, 테스트 브라우저 5종 통과 |
| FR-3 | Metadata Generator | P0 | canonical, hreflang, og 태그 자동화 |
| FR-4 | Sitemap Builder CLI | P1 | `pnpm sitemap:build` 성공, CI 검증 |
| FR-5 | Locale Switcher Component | P1 | 동일 페이지 slug + query/hash 유지 |

### Locale Switcher 로직 예시
```ts
export function switchLocale(pathname: string, newLocale: string) {
  const parts = pathname.split("/");
  parts[1] = newLocale;
  return parts.join("/");
}
```

---

## 10. Non-Functional Requirements

| 카테고리 | 요구사항 |
|----------|----------|
| 성능 | middleware 처리 시간 ≤ 20ms, 가능한 SSG |
| 접근성 | locale switcher 키보드/스크린리더 지원 |
| 보안 | locale 쿠키는 HttpOnly 아님, tamper-safe default 필요 |
| 운영 | 신규 언어 추가 시 config + 딕셔너리 + 폴더 추가만으로 완료 |

---

## 11. Dependencies & Risks

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 번역 리소스 부족 | 론칭 지연 | Localization 일정 선확보, `en` fallback |
| Redirect loop | 접근 불가 | 예외 경로 정의, locale 세그먼트 검사 |
| Sitemap 누락 | 인덱싱 오류 | CI에서 sitemap 생성/검증 파이프라인 |
| GA4 locale 스트림 미분리 | 데이터 혼선 | Analytics 팀 협업, 스트림 분리 |

---

## 12. Rollout Plan

1. **Phase 1 (주차 1-2)** – Next.js `i18n` 설정, locale 디렉터리 리팩터링.  
2. **Phase 2 (주차 3)** – Middleware, metadata generator, canonical/hreflang 적용.  
3. **Phase 3 (주차 4)** – Locale switcher, sitemap/robots 구현, SEO QA.  
4. **Phase 4 (주차 5)** – ko/en Beta 릴리스, GSC 제출, 모니터링.  
5. **Phase 5 (주차 6)** – jp 페이지 추가, 글로벌 GA 릴리스.  

---

## 13. Appendix

- 참조 문서: `docs/SPEC/README_URL_Guide.md`
- API 영향: `/api/v1/config/locale` (사용자 선호 저장)
- 용어
  - `Locale`: 언어/지역 코드 (`en`, `ko`, `jp`)
  - `Canonical`: 검색엔진 기준 원본 URL
  - `hreflang`: 다국어 페이지 상호 참조 태그

---

**Maintainer:** BK Choi  
**Revision History:**  
- v1.0 – 전략·요구사항 중심 초안  
- v1.1 – 구조/코드 예시 추가  
- v1.2 – v1.0+v1.1 통합, 전략+실행 가이드 일체화

