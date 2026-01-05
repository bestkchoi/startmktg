"use client";

import { useLocale } from "@/hooks/use-locale";
import { usePathname, useRouter } from "next/navigation";
import { type Locale } from "@/lib/locale-utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const LOCALE_LABELS: Record<Locale, Record<Locale, string>> = {
  ko: {
    ko: "한국어",
    en: "English",
    jp: "한국어",
  },
  en: {
    ko: "Korean",
    en: "English",
    jp: "Korean",
  },
  jp: {
    ko: "한국어",
    en: "English",
    jp: "한국어",
  },
};

export function SiteFooter() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  // 언어 전환 함수
  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;
    // English는 disabled이므로 선택 불가
    if (newLocale === "en") return;

    // 현재 경로에서 locale 부분만 교체
    const segments = pathname.split("/").filter(Boolean);
    
    // 첫 번째 세그먼트가 locale인 경우 교체
    if (segments.length > 0 && ["ko", "en", "jp", "kr"].includes(segments[0])) {
      segments[0] = newLocale;
    } else {
      // locale이 없는 경우 앞에 추가
      segments.unshift(newLocale);
    }

    const newPath = `/${segments.join("/")}`;
    
    // 쿠키에 저장
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
    
    router.push(newPath as any);
  };

  const labelTexts: Record<Locale, string> = {
    ko: "언어",
    en: "Language",
    jp: "언어",
  };

  // 현재 locale이 jp인 경우 ko로 표시 (jp는 선택지에서 제외)
  const displayLocale = locale === "jp" ? "ko" : locale;

  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      <div className="mx-auto max-w-6xl px-4 py-4">
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* 왼쪽: 저작권 */}
          <div className="text-sm text-neutral-600">
            ©{new Date().getFullYear()} Start MKTG
          </div>

          {/* 오른쪽: 언어 선택 */}
          <div className="flex items-center gap-4">
            {/* 언어 선택 (한국어, 영어만) */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-neutral-500">{labelTexts[displayLocale]}</label>
              <Select value={displayLocale} onValueChange={(value) => switchLocale(value as Locale)}>
                <SelectTrigger className="w-[140px] h-9 border-neutral-300 bg-white text-neutral-700 text-sm">
                  <SelectValue>
                    {LOCALE_LABELS[displayLocale][displayLocale]}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {(["ko", "en"] as Locale[]).map((loc) => (
                    <SelectItem 
                      key={loc} 
                      value={loc}
                      disabled={loc === "en"}
                    >
                      <span className="flex items-center justify-between w-full">
                        <span>{LOCALE_LABELS[displayLocale][loc]}</span>
                        {loc === "en" && (
                          <span className="ml-2 text-xs text-neutral-400">Coming soon</span>
                        )}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

