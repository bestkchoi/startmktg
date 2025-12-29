# 🌐 PRD_SEO_URL_Guide_v1.5  
Start Marketing – Global SEO-friendly URL Architecture (Path Strategy Final)

---

## 1. Overview

**문서명:** SEO URL Guide  
**버전:** 1.5  
**작성일:** 2025-11-15  
**작성자:** Start Marketing Product Team  

**목적:**  
StartMKTG의 모든 글로벌 서비스(UTM Tools, Docs, Guides 등)를 **단일 도메인 `https://startmktg.com`의 경로(path) 구조**로 통합하고, canonical/hreflang/sitemap/redirect/i18n 정책을 표준화하여 SEO authority와 사용자 경험을 동시에 극대화한다.

**배경:**  
v1.4에서 정의한 path-first 전략을 고도화하여, 언어·서비스 확장 시 요구되는 정보 구조, KPI, 구현 표준, 운영 절차를 한 문서에 정리한다.

---

## 2. Problem Statement

| 문제 | 영향 | 비고 |
|------|------|------|
| 서브도메인 남용 | 도메인 권위 분산, 인덱싱 지연 | `utm.startmktg.com` 등 |
| canonical base 불일치 | 검색엔진이 원본 URL을 혼동 | 서비스별 개별 도메인 사용 |
| 언어별 URL 규칙 부재 | hreflang 충돌, 국가 노출 오류 | `/ko` 디렉터리 미정 |
| sitemap/robots 부재 | 글로벌 인덱싱 저하 | |
| redirect/middleware 혼재 | 크롤러 혼란, 루프 위험 | JS 리다이렉트 의존 |

---

## 3. Goals & Success Metrics

### 3.1 목표
1. **Canonical Base 통일:** `https://startmktg.com` + path 구조 고정.
2. **Locale-first URL:** `/[locale]/[service]/...` 패턴 표준화.
3. **글로벌 SEO 강화:** canonical/hreflang/sitemap 자동화.
4. **운영 효율:** 신규 언어/서비스 추가 리드타임 24h 이내.

### 3.2 성공 지표
| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| hreflang 오류 | 0 | GSC hreflang Report |
| 글로벌 CTR | +15% | GSC CTR by country |
| 다국어 인덱스 등록률 | 100% | Index Coverage |
| 신규 언어/서비스 롤아웃 | < 24h | 운영 로그 |

---

## 4. Scope

### 포함
- Path 기반 URL 설계, locale 디렉터리 구조
- Next.js `i18n` 설정 및 middleware
- canonical / hreflang / OG metadata
- Locale switcher UX
- Sitemap & Robots (path 버전)
- Rollout & 운영 절차

### 제외
- 번역 콘텐츠 품질 / Localization 워크플로
- CMS·블로그 라우팅
- 광고 랜딩 자동 생성 로직

---

## 5. Path-first Global URL Architecture

### 5.1 URL 패턴 (최종)
```
https://startmktg.com/[locale]
https://startmktg.com/[locale]/utmchecker
https://startmktg.com/[locale]/tools/utm-optimizer
https://startmktg.com/[locale]/tools/landing-parser
https://startmktg.com/[locale]/docs/utm-guide
https://startmktg.com/[locale]/campaigns/[id]
https://startmktg.com/[locale]/campaigns/new
```

### 5.2 원칙
| 항목 | 기준 | 설명 |
|------|------|------|
| Locale 세그먼트 | `en`, `ko`, `jp` (확장 가능) | 첫 경로 고정 |
| 기본 언어 | `en` | 감지 실패/미지원 fallback |
| 서비스 구분 | locale 다음 세그먼트 | `tools`, `docs`, `campaigns` 등 |
| 루트 접근 | `/` → `/[detected_locale]` | middleware 302 |
| 미지원 언어 | `/en/...` | 자동 리다이렉트 |
| Trailing slash | `/ko` → `/ko/` (308) | 일관 canonical |

### 5.3 폴더 구조
```
src/
  app/
    [locale]/
      layout.tsx
      page.tsx
      tools/
        utm-checker/page.tsx
        utm-optimizer/page.tsx
        landing-parser/page.tsx
      docs/
        utm-guide/page.tsx
      campaigns/
        [id]/page.tsx
    sitemap.xml/route.ts
    sitemap-en.xml/route.ts
    sitemap-ko.xml/route.ts
    sitemap-jp.xml/route.ts
  middleware.ts

lib/
  i18n/
    config.ts
    detectLocale.ts
    dictionaries/{en,ko,jp}.json

components/
  locale-switcher.tsx
```

---

## 6. Redirect & Middleware Requirements

### 6.1 Redirect Rules
| 요청 | 처리 | 코드 |
|------|------|------|
| `/` | `/[detected_locale]` | 302 |
| `/ko` | `/ko/` | 308 |
| `/fr/...` 등 미지원 | `/en/...` | 302 |
| `/api/*`, `/_next/*`, `/assets/*`, `/favicon.ico` | redirect 제외 | — |

### 6.2 Locale Detection Middleware

```ts
export function detectLocale(request: NextRequest) {
  const lang = request.headers.get("Accept-Language") || "";
  if (lang.includes("ko")) return "ko";
  if (lang.includes("ja")) return "jp";
  return "en";
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const skip =
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/assets") ||
    pathname === "/favicon.ico";
  if (skip) return NextResponse.next();

  const locales = ["en", "ko", "jp"];
  const hasLocale = locales.some((l) => pathname.startsWith(`/${l}/`));
  if (hasLocale) return NextResponse.next();

  const detected = detectLocale(request);
  const locale = locales.includes(detected) ? detected : "en";

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl, 302);
}
```

---

## 7. Metadata (Canonical / Hreflang / OG)

### 7.1 기준
- Canonical base: **`https://startmktg.com`**
- Canonical 경로: `/[locale]/[slug...]`
- Hreflang: `en`, `ko`, `jp`, `x-default`
- Meta Title/Desc: locale dictionary 관리, `en` fallback

### 7.2 코드
```ts
export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const base = "https://startmktg.com";
  const path = slug ? slug.join("/") : "";
  const fullPath = path ? `/${locale}/${path}` : `/${locale}`;

  return {
    title: getMetaTitle(locale, slug),
    description: getMetaDescription(locale, slug),
    alternates: {
      canonical: `${base}${fullPath}`,
      languages: {
        en: `${base}${fullPath.replace(`/${locale}`, "/en")}`,
        ko: `${base}${fullPath.replace(`/${locale}`, "/ko")}`,
        jp: `${base}${fullPath.replace(`/${locale}`, "/jp")}`,
        "x-default": `${base}/en`,
      },
    },
    openGraph: {
      url: `${base}${fullPath}`,
      locale,
    },
  };
}
```

---

## 8. Locale Switcher

### 요구사항
- Query string / hash 유지
- Locale segment만 교체
- 미지원 언어 선택 불가 (disabled)

```ts
export function switchLocale(url: string, newLocale: string) {
  const u = new URL(url);
  const parts = u.pathname.split("/");
  parts[1] = newLocale;
  u.pathname = parts.join("/");
  return u.toString();
}
```

---

## 9. Sitemap & Robots

### 9.1 Sitemap
- `/sitemap.xml` (index)
- `/sitemap-en.xml`, `/sitemap-ko.xml`, `/sitemap-jp.xml`
- 모든 `<loc>`은 `https://startmktg.com/...`
- `<xhtml:link>`로 다국어 링크 포함
- `pnpm sitemap:build` 스크립트 → CI 검증

```ts
export function generateSitemap(urls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
          xmlns:xhtml="http://www.w3.org/1999/xhtml">
    ${urls
      .map(
        (url) => `
      <url>
        <loc>${url}</loc>
        <xhtml:link rel="alternate" hreflang="en" href="${url.replace(
          /(en|ko|jp)/,
          "en"
        )}"/>
        <xhtml:link rel="alternate" hreflang="ko" href="${url.replace(
          /(en|ko|jp)/,
          "ko"
        )}"/>
        <xhtml:link rel="alternate" hreflang="jp" href="${url.replace(
          /(en|ko|jp)/,
          "jp"
        )}"/>
        <xhtml:link rel="alternate" hreflang="x-default" href="${url.replace(
          /(en|ko|jp)/,
          "en"
        )}"/>
      </url>`
      )
      .join("")}
  </urlset>`;
}
```

### 9.2 Robots
- Production: `User-agent: *` / Allow all
- Preview/Staging: `Disallow: /`, `X-Robots-Tag: noindex`
- `/ko/`, `/en/`, `/jp/`에 동일 정책 적용

---

## 10. Functional Requirements

| ID | 기능 | 우선순위 | Acceptance Criteria |
|----|------|----------|---------------------|
| FR-1 | Locale-aware Routing | P0 | `/en`, `/ko`, `/jp` 페이지 빌드/배포, Link locale 유지 |
| FR-2 | Locale Detection Middleware | P0 | Accept-Language 테스트 5종 통과, 루프 없음 |
| FR-3 | Metadata Generator | P0 | canonical/hreflang 100% 적용, QA 자동화 |
| FR-4 | Sitemap Builder | P1 | `pnpm sitemap:build` 성공, CI 체크 |
| FR-5 | Locale Switcher | P1 | 동일 페이지에서 locale 전환 시 query/hash 유지 |
| FR-6 | Redirect Policy | P1 | `/`, `/ko`, 미지원 언어 케이스 자동 테스트 |

---

## 11. Non-Functional Requirements

| 카테고리 | 요구사항 |
|----------|----------|
| 성능 | middleware < 20ms, SSG 우선 |
| 접근성 | locale switcher 키보드/스크린리더 지원 |
| 운영 | 신규 locale/service 추가 시 config+폴더+dict+sitemap만 수정 |
| 보안 | locale 쿠키 tamper-safe, HttpOnly 아님 |

---

## 12. Dependencies & Risks

| 리스크 | 영향 | 대응 |
|--------|------|------|
| 번역 리소스 부족 | 릴리스 지연 | `en` fallback, Localization 일정 확보 |
| Redirect loop | 접근 불가 | 예외 경로 정의, 테스트 자동화 |
| Sitemap 누락 | 인덱싱 실패 | CI에서 sitemap 빌드/검증 |
| GA4 locale 스트림 미분리 | 데이터 혼선 | Analytics 팀 협업 |

---

## 13. Rollout Plan

1. **W1–W2:** i18n config, 폴더 리팩터링, middleware 구축  
2. **W3:** Metadata generator, canonical/hreflang, redirect 테스트  
3. **W4:** Locale switcher, sitemap/robots, SEO QA  
4. **W5:** en/ko Beta 릴리스, GSC 제출, 모니터링  
5. **W6:** jp 추가, 글로벌 GA 릴리스  

---

## Maintainer
BK Choi

## Revision History
- v1.0 – 전략 중심 초안  
- v1.1 – 구현 세부 추가  
- v1.2 – 전략+구현 통합  
- v1.3 – canonical 계산 개선  
- v1.4 – base URL `startmktg.com` 통일  
- **v1.5 – Path-first 구조 최종 정리 + Acceptance/운영 절차 강화**

