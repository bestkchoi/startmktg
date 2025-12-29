# 🌐 PRD_SEO_URL_Guide_v1.3  
Start Marketing – Global SEO-friendly URL Architecture (Finalized Version)

---

## 1. Overview

**문서명:** SEO URL Guide  
**버전:** 1.3  
**작성일:** 2025-11-15  
**작성자:** Start Marketing Product Team  

**목적:**  
Start Marketing 글로벌 서비스(`startmktg.com`)의 URL 구조, 라우팅, SEO 메타데이터(i18n, canonical, hreflang, sitemap, redirect)를 표준화하여 검색엔진 인덱싱 품질을 극대화한다.  
본 버전(v1.3)은 v1.0(전략 중심) + v1.1(구현 중심) + v1.2(통합본) 개선사항을 모두 반영한 완성형 PRD이다.

---

## 2. Problem Statement

| 문제 | 영향 |
|------|------|
| 언어별 URL 규칙 부재 | 인덱싱 오류, 국가별 검색 품질 저하 |
| canonical/hreflang 미적용 | 중복 콘텐츠 패널티 발생 |
| sitemap/robots 정책 미정 | 페이지 인덱싱 지연 |
| redirect 불일관성 | 크롤러 혼란, 루프 발생 가능 |
| 폴더 구조 불명확 | 유지보수 비용 증가, 언어 확장 어려움 |

---

## 3. Goals & Success Metrics

### 목표
1. `/en`, `/ko`, `/jp` 기반 글로벌 URL 규칙 확립  
2. canonical·hreflang 완전 적용  
3. locale 자동 감지 + locale switcher 제공  
4. 신규 언어 추가 리드타임 24시간 이내

### 성공지표

| 지표 | 목표 |
|------|-------|
| 다국어 인덱스 등록률 | 100% |
| hreflang 오류 | 0 |
| 글로벌 CTR | +15% |
| 신규 언어 추가 리드타임 | < 24시간 |

---

## 4. Scope

### 포함
- URL 패턴, locale 디렉터리 구조
- Next.js i18n 설정
- Accept-Language middleware
- canonical / hreflang / og metadata
- sitemap, robots
- locale switcher UX

### 제외
- 번역 품질
- CMS/블로그 라우팅
- 광고 랜딩 URL 생성 로직

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
| 항목 | 내용 |
|------|------|
| 허용 locale | `['en','ko','jp']` |
| 기본 언어 | `en` |
| `/` 접근 | 감지된 locale → `/[locale]` |
| 미지원 locale | `/en/...`으로 fallback |
| `/ko` → `/ko/` | 308 redirect |

### 5.3 실제 폴더 구조
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
| `/api/*`, `/_next/*`, `/assets/*`, `/favicon.ico` | redirect 제외 | — |

---

## 7. Middleware Specification

### 요구사항
- 최초 진입 시 `Accept-Language` 기반 locale 감지  
- locale 쿠키 우선  
- 예외 경로 제외  
- 감지 실패 시 fallback: `en`

### detectLocale 예시 코드 (명확화)
```ts
export function detectLocale(request: NextRequest) {
  const lang = request.headers.get("Accept-Language") || "";
  if (lang.includes("ko")) return "ko";
  if (lang.includes("ja")) return "jp";
  return "en";
}
```

### middleware 전체 예시
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
  const hasLocale = supported.some(locale => pathname.startsWith(`/${locale}/`));
  if (hasLocale) return NextResponse.next();

  const detected = detectLocale(request);
  const locale = supported.includes(detected) ? detected : "en";

  request.nextUrl.pathname = `/${locale}${pathname}`;
  return NextResponse.redirect(request.nextUrl, 302);
}
```

---

## 8. SEO Metadata Requirements

### 8.1 canonical / hreflang 규칙  
- canonical은 **현재 페이지 전체 경로** 기준  
- hreflang: `en`, `ko`, `jp`, `x-default`

### 8.2 canonical 개선 버전 (v1.3 업데이트)
```ts
export async function generateMetadata({ params }) {
  const locale = params.locale;
  const base = "https://utm.startmktg.com";

  const path = params?.slug ? params.slug.join("/") : "";
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
    }
  };
}
```

---

## 9. Locale Switcher (v1.3 개선)

### 요구사항
- pathname + query + hash 모두 유지
- locale segment만 변경

### 코드 (개선됨)
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

## 10. Sitemap & Robots

### Sitemap 규칙
- `/sitemap.xml` → index  
- 언어별 sitemap 3개  
- 다국어 alternate 링크 포함  
- 자동 URL 수집 기반 동적 생성 (v1.3 명시)

### Sitemap 생성기 함수 명세 추가 (v1.3 업데이트)
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

---

## 11. Non-Functional Requirements

| 항목 | 요구사항 |
|------|-----------|
| 성능 | middleware ≤ 20ms |
| 접근성 | locale switcher 키보드/스크린리더 지원 |
| 유지보수 | locale 추가 시 폴더 + 딕셔너리 추가만으로 확장 |
| 보안 | locale 쿠키 tamper-safe |

---

## 12. Risks & Mitigations

| 리스크 | 대응 |
|--------|--------|
| redirect loop | 예외 경로 + locale 검사 |
| sitemap 누락 | CI에서 sitemap 생성 자동 검증 |
| 번역 부족 | `en` fallback 적용 |
| GA4 데이터 혼선 | locale별 GA4 스트림 분리 |

---

## 13. Rollout Plan

1. **W1–W2**  
   - i18n config  
   - middleware 구현  
   - 폴더 구조 생성  

2. **W3**  
   - canonical/hreflang 자동화  
   - locale switcher 구현  

3. **W4**  
   - sitemap + robots 적용  
   - SEO QA  

4. **W5**  
   - ko/en Beta 릴리스  
   - GSC 제출  

5. **W6**  
   - jp 추가  
   - 글로벌 릴리스  

---

## Maintainer
BK Choi

## Revision History
- v1.0 – 전략 중심  
- v1.1 – 코드/구조 반영  
- v1.2 – 전략+구현 통합  
- **v1.3 – canonical 개선, locale switcher 강화, sitemap 자동화 명시**
