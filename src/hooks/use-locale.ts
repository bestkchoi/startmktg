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
    const locale = params.locale.toLowerCase();
    if (locale === "ko" || locale === "en" || locale === "jp") {
      return locale as Locale;
    }
  }
  
  // fallback: pathname에서 추출
  const pathname = usePathname();
  const locale = getLocaleFromPath(pathname);
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

