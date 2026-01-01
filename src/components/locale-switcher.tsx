"use client";

import { usePathname, useRouter } from "next/navigation";
import { useLocale } from "@/hooks/use-locale";
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
    jp: "日本語",
  },
  en: {
    ko: "Korean",
    en: "English",
    jp: "Japanese",
  },
  jp: {
    ko: "韓国語",
    en: "英語",
    jp: "日本語",
  },
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

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
    jp: "言語",
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-neutral-500">{labelTexts[locale]}</label>
      <Select value={locale} onValueChange={(value) => switchLocale(value as Locale)}>
        <SelectTrigger className="w-[140px] h-9 border-neutral-300 bg-white text-neutral-700 text-sm">
          <SelectValue>
            {LOCALE_LABELS[locale][locale]}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(["ko", "en"] as Locale[]).map((loc) => (
            <SelectItem key={loc} value={loc}>
              {LOCALE_LABELS[locale][loc]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

