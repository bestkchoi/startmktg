"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { UtmCheckerForm } from "@/components/utm-checker/utm-checker-form";

export default function Page() {
  const locale = useLocale();
  
  // 경로 생성
  const campaignNewPath = `/${locale}/campaign/new`;
  const campaignsPath = `/${locale}/campaigns`;
  
  // 텍스트 내용 (locale에 따라 변경)
  const texts = {
    en: {
      utmCheckerDescription: "Analyze and validate UTM parameters in your URL",
      createCampaign: "Create Campaign",
      viewCampaigns: "View Campaigns",
    },
    ko: {
      utmCheckerDescription: "URL의 UTM 파라미터를 분석하고 검증하세요",
      createCampaign: "Campaign 만들기",
      viewCampaigns: "Campaign 보기",
    },
    jp: {
      utmCheckerDescription: "URLのUTMパラメータを分析して検証します",
      createCampaign: "キャンペーン作成",
      viewCampaigns: "キャンペーン一覧",
    },
  };
  
  const t = texts[locale] || texts.en;
  
  return (
    <main className="min-h-screen bg-white text-neutral-900 flex flex-col">
      {/* 중앙 컨텐츠 영역 */}
      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="flex flex-col items-center gap-16 max-w-4xl w-full">
          {/* 브랜드명 */}
          <div className="flex flex-col items-center gap-3">
            <Link
              href={`/${locale}`}
              className="transition-opacity hover:opacity-70"
            >
              <h1 className="text-5xl sm:text-6xl md:text-7xl font-light tracking-[-0.02em] uppercase text-center leading-tight">
                START MKTG
              </h1>
            </Link>
            <div className="h-px w-16 bg-neutral-300" />
          </div>

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

          {/* 액션 버튼 */}
          <div className="flex flex-col items-center gap-4 w-full">
            <Link
              href={campaignNewPath}
              className="group relative w-full sm:w-auto min-w-[280px] px-10 py-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-none transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono tracking-wider opacity-60 group-hover:opacity-100">
                  01
                </span>
                <span className="h-3 w-px bg-neutral-300 group-hover:bg-white" />
                <span>{t.createCampaign}</span>
              </span>
            </Link>
            <Link
              href={campaignsPath}
              className="group relative w-full sm:w-auto min-w-[280px] px-10 py-4 text-sm font-medium text-neutral-900 border border-neutral-200 rounded-none transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <span className="text-[10px] font-mono tracking-wider opacity-60 group-hover:opacity-100">
                  02
                </span>
                <span className="h-3 w-px bg-neutral-300 group-hover:bg-white" />
                <span>{t.viewCampaigns}</span>
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 text-xs text-neutral-400 text-center tracking-wide">
        © {new Date().getFullYear()} START MKTG
      </footer>
    </main>
  );
}















