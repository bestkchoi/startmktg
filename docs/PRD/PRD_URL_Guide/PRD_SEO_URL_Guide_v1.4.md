# 🌐 PRD_SEO_URL_Guide_v1.4  
Start Marketing – Global SEO-friendly URL Architecture (Finalized Version)

---

## 1. Overview

**문서명:** SEO URL Guide  
**버전:** 1.4  
**작성일:** 2025-11-15  
**작성자:** Start Marketing Product Team  

**목적:**  
StartMKTG의 글로벌 서비스(`startmktg.com`)에 대해  
URL 구조, 라우팅, canonical/hreflang, sitemap, redirect, i18n 정책을 표준화하여  
검색엔진 인덱싱 품질과 사용자 경험을 동시에 극대화한다.

이번 버전(v1.4)은 기존 1.0~1.3의 모든 요구사항을 정리하고  
**canonical base를 startmktg.com으로 통일한 최종 완성형 PRD**이다.

---

## 2. Problem Statement

| 문제 | 영향 |
|------|------|
| 서브도메인 기반 확장 위험 | SEO authority 분산, 인덱싱 지연 |
| canonical URL의 서비스 단독 도메인 설정 오류 | 도메인 일관성 붕괴 |
| 언어별 URL 규칙 미확립 | hreflang 충돌, 국가 노출 오류 |
| sitemap/robots 부재 | 글로벌 인덱싱 저하 |
| redirect·middleware 불일관 | 크롤러 혼란 |

---

## 3. Goals & Success Metrics

### 목표
1. canonical base를 **startmktg.com**으로 통일  
2. path-based 글로벌 URL 정규화  
3. locale 기반 국제 SEO 최적화  
4. 모든 서비스(Tools/Docs/Guides)를 **startmktg.com 하위 경로로 관리**  
5. 신규 서비스·언어 추가 리드타임 24시간 이내

### 성공지표

| 지표 | 목표 |
|------|------|
| hreflang 오류 | 0 |
| 글로벌 CTR | +15% |
| 다국어 인덱스 등록률 | 100% |
| 신규 언어 추가 리드타임 | < 24시간 |

---

## 4. Scope

### 포함 범위
- URL 구조 및 locale 기반 라우팅
- canonical / hreflang / og metadata
- locale switcher
- Accept-Language detection middleware
- sitemap / robots 설계
- Next.js App Router + i18n config

### 제외
- 번역 품질
- CMS·블로그
- 광고 랜딩 페이지 자동 생성 로직

---

## 5. Global URL Architecture

StartMKTG의 **정답 구조**는 Path 기반 글로벌 구조이다.

### 5.1 URL 패턴 (최종)

```
https://startmktg.com/[locale]
https://startmktg.com/[locale]/tools/utm-checker
https://startmktg.com/[locale]/tools/utm-optimizer
https://startmktg.com/[locale]/tools/landing-parser
https://startmktg.com/[locale]/docs/utm-guide
https://startmktg.com/[locale]/campaigns/[id]
```

### 5.2 허용 locale
- en (기본)
- ko
- jp

### 5.3 root redirect behavior

```
/ → /[detected_locale]  (감지 실패 시 /en)
```

---

## 6. Folder Structure (실행 표준)

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

## 7. Redirect Rules

| 요청 | 처리 | 코드 |
|------|------|------|
| `/` | `/[detected_locale]` | 302 |
| `/ko` | `/ko/` | 308 |
| 미지원 locale(`/fr/...`) | `/en/...` | 302 |
| `/api/*`, `/_next/*`, `/assets/*`, `/favicon.ico` | redirect 제외 | — |

---

## 8. Locale Detection Middleware

### 요구사항
- Accept-Language 기반 감지  
- locale 쿠키 우선  
- 예외 경로 제외  
- fallback → `en`

### detectLocale
```ts
export function detectLocale(request: NextRequest) {
  const lang = request.headers.get("Accept-Language") || "";
  if (lang.includes("ko")) return "ko";
  if (lang.includes("ja")) return "jp";
  return "en";
}
```

### middleware
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

  const detected = detectLocale(request);
  const locale = supported.includes(detected) ? detected : "en";

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl, 302);
}
```

---

## 9. Metadata Requirements (canonical / hreflang)

### canonical base (핵심 업데이트)
📌 **반드시 `https://startmktg.com` 사용**

### canonical + hreflang 코드 (v1.4 개선)

```ts
export async function generateMetadata({ params }) {
  const { locale, slug } = params;
  const base = "https://startmktg.com";

  const path = slug ? slug.join("/") : "";
  const fullPath = path ? `/${locale}/${path}` : `/${locale}`;

  return {
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

## 10. Locale Switcher

### 요구사항
- querystring, hash 유지
- locale segment만 변경

### 코드 (v1.4)
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

## 11. Sitemap & Robots

### Sitemap 규칙
- `/sitemap.xml` (index)
- `/sitemap-en.xml`
- `/sitemap-ko.xml`
- `/sitemap-jp.xml`
- 모든 URL은 `https://startmktg.com/...` 기준

### Sitemap 생성기 명세
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
      </url>`
      )
      .join("")}
  </urlset>`;
}
```

### Robots 정책
- production: allow all  
- preview/staging: noindex + disallow  

---

## 12. Non-Functional Requirements

| 항목 | 요구사항 |
|------|-----------|
| 성능 | middleware ≤ 20ms |
| SEO | canonical/hreflang 100% 적용 |
| 운영 | locale 추가 시 폴더 + 딕셔너리 + sitemap만 변경 |
| 접근성 | locale switcher 키보드 네비게이션 지원 |

---

## 13. Rollout Plan

1. W1–W2: i18n config / middleware / folder 구조  
2. W3: canonical/hreflang 자동화  
3. W4: sitemap/robots / SEO QA  
4. W5: ko/en Beta → GSC 제출  
5. W6: jp 추가 → 글로벌 릴리스

---

## Maintainer
BK Choi

## Revision History
- v1.0 – 전략  
- v1.1 – 구현 포함  
- v1.2 – 통합  
- v1.3 – canonical 개선  
- **v1.4 – base URL을 startmktg.com으로 통일 (최종 표준)**