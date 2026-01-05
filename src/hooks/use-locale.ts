"use client";

import { usePathname, useParams } from "next/navigation";
import { getLocaleFromPath, addLocaleToPath, type Locale } from "@/lib/locale-utils";

/**
 * 현재 경로에서 locale을 가져오는 훅
 */
export function useLocale(): Locale {
  // useParams에서 locale을 먼저 시도
  const params = useParams();
  if (params?.locale && typeof params.locale === "string") {
    let locale = params.locale.toLowerCase();
    // kr을 ko로 매핑 (한국어 코드)
    if (locale === "kr") {
      locale = "ko";
    }
    // en을 ko로 매핑 (영어는 개발 대상이 아님)
    if (locale === "en") {
      locale = "ko";
    }
    if (locale === "ko" || locale === "jp") {
      return locale as Locale;
    }
  }
  
  // fallback: pathname에서 추출
  const pathname = usePathname();
  let locale = getLocaleFromPath(pathname);
  // en을 ko로 매핑 (영어는 개발 대상이 아님)
  if (locale === "en") {
    locale = "ko";
  }
  // kr을 ko로 매핑
  if (locale === null) {
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length > 0 && segments[0] === "kr") {
      locale = "ko";
    }
    if (segments.length > 0 && segments[0] === "en") {
      locale = "ko";
    }
  }
  return locale || "ko"; // 기본값은 한국어
}

/**
 * 경로에 현재 locale을 추가하는 훅
 */
export function useLocalizedPath() {
  const locale = useLocale();
  
  return (path: string): string => {
    return addLocaleToPath(path, locale);
  };
}

