# 🌐 PRD_SEO_URL_Guide_v1.1  
Start Marketing – Global SEO-friendly URL Architecture

---

## 1. Overview

**문서명:** SEO URL Guide  
**버전:** 1.1  
**작성일:** 2025-11-15  
**작성자:** Start Marketing Product Team  

**목적:**  
Start Marketing 글로벌 서비스의 URL, 라우팅, SEO 메타데이터(i18n, canonical, hreflang, sitemap, redirect)를 통일된 규칙으로 정의하여 검색엔진 인덱싱 품질을 극대화한다.

**대상:**  
Next.js App Router 기반 서비스 전체 (`utm.startmktg.com`)

---

## 2. Problem Statement

| 문제 | 영향 |
|------|-------|
| 언어별 URL 규칙 없음 | 글로벌 SEO 평가 하락, 인덱싱 오류 |
| canonical/hreflang 미적용 | 중복 콘텐츠 패널티, 국가 노출 오류 |
| sitemap 구조 미정 | 인덱싱 지연 |
| 리다이렉트 정책 혼재 | 크롤러 오판, 루프 발생 |
| 폴더 구조 불명확 | 개발 비용 증가, 유지보수 어려움 |

---

## 3. Goals & Metrics

### ✔ 목표
- `/en`, `/ko`, `/jp` 기반 글로벌 URL 표준화  
- canonical/hreflang 100% 적용  
- 언어 자동 감지 및 locale 초기 리다이렉트 안정화  
- 신규 언어 추가 시 24시간 이내 확장 가능한 구조 확보  

### ✔ 성공지표

| 항목 | 목표 |
|------|-------|
| hreflang 오류 | 0 |
| 글로벌 CTR | +15% |
| 다국어 인덱스 등록 | 100% |
| 신규 언어 추가 리드타임 | < 24시간 |

---

## 4. Scope

### 포함
- locale 기반 폴더 구조
- Next.js i18n 설정
- canonical / hreflang / og 메타데이터 생성
- Accept-Language middleware
- locale switcher
- sitemap / robots 생성

### 제외
- 번역 품질
- 블로그/CMS 연동

---

## 5. URL Architecture

### ✔ 5.1 최종 URL 패턴

```
/[locale]/[page]
/[locale]/tools/utm-checker
/[locale]/tools/utm-generator
/[locale]/docs/utm-guide
```

### ✔ 5.2 허용 locale
- en (기본)
- ko
- jp

### ✔ 5.3 실제 폴더 구조(필수 – Cursor용)

```
src/
  app/
    [locale]/
      layout.tsx
      page.tsx
      tools/
        utm-checker/
          page.tsx
        utm-generator/
          page.tsx
      docs/
        utm-guide/
          page.tsx
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

## 6. Redirect Rules

| 요청 | 처리 | 코드 |
|------|--------|-------|
| `/` | `/[detected_locale]`로 이동 | 302 |
| `/ko` | `/ko/`로 변환 | 308 |
| 미지원 locale(`/fr/...`) | `/en/...`으로 변경 | 302 |
| `/api/*` | redirect 비활성 | — |
| `/_next/*` | 비활성 | — |
| `/assets/*` | 비활성 | — |

---

## 7. Locale Detection Middleware

### ✔ 조건
- 최초 접속 + locale 쿠키 없는 경우만 실행  
- API, 정적 경로 제외  
- 이미 `/xx/` 경로이면 감지 비활성  
- 브라우저 언어 매핑  
  - ja-JP → jp  
  - ko-KR → ko  
  - 기타 → en  

### ✔ 구현 예시

```ts
export function middleware(request) {
  const { pathname } = request.nextUrl;

  // 예외 처리
  const skip =
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/assets') ||
    pathname === '/favicon.ico';

  if (skip) return;

  // 이미 locale 세그먼트 존재하면 패스
  const hasLocale = ['en', 'ko', 'jp'].some(
    l => pathname.startsWith(`/${l}/`)
  );
  if (hasLocale) return;

  // locale 감지
  const detected = detectLocale(request);

  // redirect
  request.nextUrl.pathname = `/${detected}${pathname}`;
  return Response.redirect(request.nextUrl, 302);
}
```

---

## 8. Metadata Requirements

### ✔ 8.1 canonical + hreflang 규칙
- 각 페이지는 자신의 canonical 보유  
- 3개 언어 + x-default 포함

### ✔ 8.2 generateMetadata 예시

```ts
export async function generateMetadata({ params }) {
  const locale = params.locale;
  const base = 'https://utm.startmktg.com';

  return {
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        en: `${base}/en`,
      ko: `${base}/ko`,
      jp: `${base}/jp`,
      'x-default': `${base}/en`,
      }
    },
    openGraph: {
      url: `${base}/${locale}`,
      locale: locale,
    }
  };
}
```

---

## 9. Locale Switcher

### ✔ 요구사항
- 현재 URL에서 locale만 치환  
- query 유지  
- hash 유지  
- 미지원 locale 비활성  

### ✔ 로직 예시

```ts
export function switchLocale(pathname, newLocale) {
  const parts = pathname.split('/');
  parts[1] = newLocale;
  return parts.join('/');
}
```

---

## 10. Sitemap & Robots

### ✔ sitemap 구성
- `/sitemap.xml`  
- `/sitemap-en.xml`  
- `/sitemap-ko.xml`  
- `/sitemap-jp.xml`  

### ✔ 코드 템플릿

```ts
export async function GET() {
  const urls = [
    'https://utm.startmktg.com/en',
    'https://utm.startmktg.com/en/tools/utm-checker'
  ];

  const xml = generateSitemap(urls);

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml' }
  });
}
```

---

## 11. Non-Functional Requirements

| 카테고리 | 요구사항 |
|----------|-----------|
| 성능 | middleware ≤ 20ms |
| 접근성 | locale switcher 키보드 지원 |
| 유지보수 | locale 추가 시 딕셔너리 + 폴더만 생성 |
| SEO | canonical/hreflang 100% 적용 |

---

## 12. Risks & Mitigations

| 리스크 | 대응 |
|--------|--------|
| redirect loop | 예외 경로 + locale 존재 검사 |
| sitemap 누락 | CI에서 sitemap 생성 검증 |
| 언어 미번역 | en 기준 fallback |

---

## 13. Rollout Plan

### W1–W2
- i18n config  
- middleware 구현  
- 폴더 구조 생성  

### W3
- canonical/hreflang 자동화  
- locale switcher 완성  

### W4
- sitemap/robots 적용  
- SEO 테스트  

### W5
- 영어/한국어 런칭  
- GSC 제출  

### W6
- 일본어 추가  
- 글로벌 릴리스  

---

**Maintainer:** BK Choi  

**Revision History:**  
- v1.0 – 최초 작성  
- v1.1 – 구조 명확화, 예시 코드 추가, redirect 규칙 확정
