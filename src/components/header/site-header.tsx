"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { useLocalizedPath } from "@/hooks/use-locale";
import { usePathname } from "next/navigation";
import { useState } from "react";

export function SiteHeader() {
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  const pathname = usePathname();
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  // 메뉴 텍스트
  const menuTexts = {
    en: {
      landingPageCheck: "랜딩페이지 체크",
      campaignManagement: "UTM 생성",
      simpleTools: "간편툴",
      utmChecker: "UTM CHECKER",
      createCampaign: "Campaign 만들기",
      campaignList: "Campaign 목록",
    },
    ko: {
      landingPageCheck: "랜딩페이지 체크",
      campaignManagement: "UTM 생성",
      simpleTools: "간편툴",
      utmChecker: "UTM CHECKER",
      createCampaign: "Campaign 만들기",
      campaignList: "Campaign 목록",
    },
    jp: {
      landingPageCheck: "랜딩페이지 체크",
      campaignManagement: "UTM 생성",
      simpleTools: "간편툴",
      utmChecker: "UTM CHECKER",
      createCampaign: "Campaign 만들기",
      campaignList: "Campaign 목록",
    },
  };

  const t = menuTexts[locale] || menuTexts.en;

  // 현재 경로 확인
  const isUtmChecker = pathname === `/${locale}` || pathname === `/${locale}/` || pathname === "/";
  const isCreateCampaign = pathname?.includes("/campaign/new");
  const isCampaignList = pathname?.includes("/campaigns") && !pathname?.includes("/campaign/new") && !pathname?.includes("/channels");

  // 경로에 따라 활성 메뉴 자동 설정
  const getActiveMenuFromPath = () => {
    if (isUtmChecker) return "landing";
    if (isCreateCampaign || isCampaignList) return "campaign";
    return null;
  };

  const currentActiveMenu = activeMenu || getActiveMenuFromPath();

  const handleMenuClick = (menu: string) => {
    setActiveMenu(activeMenu === menu ? null : menu);
  };

  return (
    <header className="bg-white sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4">
        {/* 로고 - 상단 중앙 */}
        <div className="flex items-center justify-center h-16">
          <Link
            href={localizedPath("/") as any}
            className="transition-opacity hover:opacity-70"
          >
            <h1 className="text-2xl font-light tracking-[-0.02em] uppercase">
              START MKTG
            </h1>
          </Link>
        </div>

        {/* 메인 메뉴 */}
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => handleMenuClick("landing")}
            className="px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            {t.landingPageCheck}
          </button>
          <button
            type="button"
            onClick={() => handleMenuClick("campaign")}
            className="px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            {t.campaignManagement}
          </button>
          <button
            type="button"
            onClick={() => handleMenuClick("simpleTools")}
            className="px-6 py-3 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100"
          >
            {t.simpleTools}
          </button>
        </div>
      </div>

      {/* 서브메뉴 - 전체 너비 */}
      {currentActiveMenu === "landing" && (
        <div className="w-full bg-neutral-100">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-center py-3">
              <Link
                href={localizedPath("/") as any}
                className="px-6 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
              >
                1. {t.utmChecker}
              </Link>
            </div>
          </div>
        </div>
      )}

      {currentActiveMenu === "campaign" && (
        <div className="w-full bg-neutral-100">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-center gap-3 py-3">
              <Link
                href={localizedPath("/campaign/new") as any}
                className="px-6 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
              >
                1. {t.createCampaign}
              </Link>
              <Link
                href={localizedPath("/campaigns") as any}
                className="px-6 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
              >
                2. {t.campaignList}
              </Link>
            </div>
          </div>
        </div>
      )}

      {currentActiveMenu === "simpleTools" && (
        <div className="w-full bg-neutral-100">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-center gap-3 py-3">
              <Link
                href={localizedPath("/symbols") as any}
                className="px-6 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
              >
                😀 이모지페이지
              </Link>
              <Link
                href={localizedPath("/tools/url-converter") as any}
                className="px-6 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
              >
                🔗 URL 변환기
              </Link>
              <Link
                href={localizedPath("/tools/text-converter") as any}
                className="px-6 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
              >
                📝 텍스트 변환기
              </Link>
              <Link
                href={localizedPath("/tools/calculator") as any}
                className="px-6 py-2.5 text-sm font-medium text-neutral-800 transition-colors hover:bg-neutral-200 hover:text-neutral-900"
              >
                🧮 계산기
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

