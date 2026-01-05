"use client";

import { useLocale } from "@/hooks/use-locale";
import { UtmCheckerForm } from "@/components/utm-checker/utm-checker-form";

export default function Page() {
  const locale = useLocale();
  
  // 텍스트 내용 (locale에 따라 변경)
  const texts = {
    en: {
      utmCheckerDescription: "Analyze and validate UTM parameters in your URL",
    },
    ko: {
      utmCheckerDescription: "URL의 UTM 파라미터를 분석하고 검증하세요",
    },
    jp: {
      utmCheckerDescription: "URLのUTMパラメータを分析して検証します",
    },
  };
  
  // en은 ko로 매핑
  const actualLocale = locale === "en" ? "ko" : locale;
  const t = texts[actualLocale] || texts.ko;
  
  return (
    <main className="min-h-[calc(100vh-200px)] bg-white text-neutral-900">
      {/* 중앙 컨텐츠 영역 */}
      <div className="flex items-start justify-center px-4 pt-12 pb-12">
        <div className="flex flex-col items-center gap-6 max-w-4xl w-full">
          {/* UTM Checker 섹션 */}
          <div className="w-full space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-light tracking-[-0.02em] uppercase mb-2">
                UTM Checker
              </h2>
              <p className="text-sm text-neutral-500">
                {t.utmCheckerDescription}
              </p>
            </div>
            <UtmCheckerForm compact={true} />
          </div>
        </div>
      </div>
    </main>
  );
}















