/**
 * Locale 관련 유틸리티 함수
 */

const SUPPORTED_LOCALES = ["en", "ko", "jp"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];

/**
 * 현재 URL에서 locale 추출
 */
export function getLocaleFromPath(pathname: string): Locale | null {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;
  
  let firstSegment = segments[0];
  // kr을 ko로 매핑 (한국어 코드)
  if (firstSegment === "kr") {
    firstSegment = "ko";
  }
  // en을 ko로 매핑 (영어는 개발 대상이 아님)
  if (firstSegment === "en") {
    firstSegment = "ko";
  }
  
  if (SUPPORTED_LOCALES.includes(firstSegment as Locale)) {
    return firstSegment as Locale;
  }
  
  return null;
}

/**
 * 경로에 locale 추가
 */
export function addLocaleToPath(path: string, locale: Locale): string {
  // 이미 locale이 있으면 그대로 반환
  const existingLocale = getLocaleFromPath(path);
  if (existingLocale) {
    return path;
  }
  
  // 경로가 "/"로 시작하지 않으면 "/" 추가
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  
  // "/"만 있으면 locale만 반환
  if (normalizedPath === "/") {
    return `/${locale}`;
  }
  
  // locale이 이미 포함되어 있는지 다시 확인 (중복 방지)
  const segments = normalizedPath.split("/").filter(Boolean);
  if (segments.length > 0 && SUPPORTED_LOCALES.includes(segments[0] as Locale)) {
    return normalizedPath;
  }
  
  return `/${locale}${normalizedPath}`;
}

/**
 * 브라우저에서 locale 감지 (클라이언트 사이드)
 */
export function detectBrowserLocale(): Locale {
  if (typeof window === "undefined") return "en";
  
  const languages = navigator.languages || [navigator.language];
  
  for (const lang of languages) {
    const langCode = lang.split("-")[0].toLowerCase();
    if (SUPPORTED_LOCALES.includes(langCode as Locale)) {
      return langCode as Locale;
    }
  }
  
  return "ko"; // 기본값은 한국어
}

/**
 * 쿠키에서 locale 가져오기
 */
export function getLocaleFromCookie(): Locale | null {
  if (typeof document === "undefined") return null;
  
  const cookies = document.cookie.split(";");
  const localeCookie = cookies.find((cookie) => 
    cookie.trim().startsWith("NEXT_LOCALE=")
  );
  
  if (localeCookie) {
    const locale = localeCookie.split("=")[1]?.trim();
    if (SUPPORTED_LOCALES.includes(locale as Locale)) {
      return locale as Locale;
    }
  }
  
  return null;
}

