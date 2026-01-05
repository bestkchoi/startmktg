"use client";

import Link from "next/link";
import { useLocale } from "@/hooks/use-locale";
import { useLocalizedPath } from "@/hooks/use-locale";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  const pathname = usePathname();

  // 메뉴 텍스트
  const menuTexts = {
    en: {
      landingPageCheck: "UTM LINK",
      campaignManagement: "UTM 생성",
      simpleTools: "간편툴",
      utmChecker: "UTM CHECKER",
      createCampaign: "UTM LINK 만들기",
      campaignList: "UTM LINK 목록",
    },
    ko: {
      landingPageCheck: "UTM LINK",
      campaignManagement: "UTM 생성",
      simpleTools: "간편툴",
      utmChecker: "UTM CHECKER",
      createCampaign: "UTM LINK 만들기",
      campaignList: "UTM LINK 목록",
    },
    jp: {
      landingPageCheck: "UTM LINK",
      campaignManagement: "UTM 생성",
      simpleTools: "간편툴",
      utmChecker: "UTM CHECKER",
      createCampaign: "UTM LINK 만들기",
      campaignList: "UTM LINK 목록",
    },
  };

  // en은 ko로 매핑
  const actualLocale = locale === "en" ? "ko" : locale;
  const t = menuTexts[actualLocale] || menuTexts.ko;

  // UTM LINK 서브메뉴 href 정의
  const utmCheckerHref = localizedPath("/utm-checker");
  const utmLinkHref = localizedPath("/utm-link");
  const utmLinksHref = localizedPath("/utm-links");

  // active 판정 함수: pathname이 href와 정확히 같거나, href로 시작하면 active
  // 단, 더 긴 경로를 먼저 확인하여 /utm-link가 /utm-links에 포함되지 않도록 처리
  const isActive = (href: string): boolean => {
    if (!pathname || !href) return false;
    // 정확히 일치하거나, href로 시작하면서 다음 문자가 '/'이거나 끝인 경우
    return pathname === href || pathname.startsWith(href + "/");
  };

  // 간편툴 서브메뉴 href 정의
  const symbolsHref = localizedPath("/symbols");
  const metaEmojiHref = localizedPath("/meta-emoji");
  const toolsUrlConverterHref = localizedPath("/tools/url-converter");
  const toolsTextConverterHref = localizedPath("/tools/text-converter");
  const toolsCalculatorHref = localizedPath("/tools/calculator");

  // 각 메뉴의 active 상태 계산 (긴 경로부터 확인)
  const isUtmCheckerActive = isActive(utmCheckerHref);
  const isUtmLinksActive = isActive(utmLinksHref); // /utm-links를 먼저 확인
  const isUtmLinkActive = isActive(utmLinkHref) && !isUtmLinksActive; // /utm-link는 /utm-links가 아닐 때만

  // 간편툴 서브메뉴 active 상태
  const isSymbolsActive = isActive(symbolsHref);
  const isMetaEmojiActive = isActive(metaEmojiHref);
  const isToolsUrlConverterActive = isActive(toolsUrlConverterHref);
  const isToolsTextConverterActive = isActive(toolsTextConverterHref);
  const isToolsCalculatorActive = isActive(toolsCalculatorHref);
  
  // 간편툴 관련 경로인지 확인 (서브메뉴 표시 여부)
  const isSimpleToolsActive = isSymbolsActive || isMetaEmojiActive || isToolsUrlConverterActive || isToolsTextConverterActive || isToolsCalculatorActive;

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
          <Link
            href={utmCheckerHref as any}
            className="px-6 py-3 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-70"
          >
            {t.landingPageCheck}
          </Link>
          <Link
            href={localizedPath("/symbols") as any}
            className="px-6 py-3 text-sm font-semibold text-neutral-900 transition-opacity hover:opacity-70"
          >
            {t.simpleTools}
          </Link>
        </div>
      </div>

      {/* UTM LINK 서브메뉴 - 항상 표시 */}
      <div className="w-full bg-neutral-100">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-center gap-3 py-3">
            <Link
              href={utmCheckerHref as any}
              className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                isUtmCheckerActive
                  ? "text-neutral-900 bg-neutral-200 font-semibold"
                  : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
              aria-current={isUtmCheckerActive ? "page" : undefined}
            >
              1. UTM CHECKER
            </Link>
            <Link
              href={utmLinkHref as any}
              className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                isUtmLinkActive
                  ? "text-neutral-900 bg-neutral-200 font-semibold"
                  : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
              aria-current={isUtmLinkActive ? "page" : undefined}
            >
              2. UTM LINK 만들기
            </Link>
            <Link
              href={utmLinksHref as any}
              className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                isUtmLinksActive
                  ? "text-neutral-900 bg-neutral-200 font-semibold"
                  : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
              }`}
              aria-current={isUtmLinksActive ? "page" : undefined}
            >
              3. UTM LINK 목록
            </Link>
          </div>
        </div>
      </div>

      {/* 간편툴 서브메뉴 - 간편툴 관련 경로일 때 표시 */}
      {isSimpleToolsActive && (
        <div className="w-full bg-neutral-100">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-center gap-3 py-3">
              <Link
                href={metaEmojiHref as any}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  isMetaEmojiActive
                    ? "text-neutral-900 bg-neutral-200 font-semibold"
                    : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
                aria-current={isMetaEmojiActive ? "page" : undefined}
              >
                메타 광고용 이모지
              </Link>
              <Link
                href={symbolsHref as any}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  isSymbolsActive
                    ? "text-neutral-900 bg-neutral-200 font-semibold"
                    : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
                aria-current={isSymbolsActive ? "page" : undefined}
              >
                😀 이모지페이지
              </Link>
              <Link
                href={toolsUrlConverterHref as any}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  isToolsUrlConverterActive
                    ? "text-neutral-900 bg-neutral-200 font-semibold"
                    : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
                aria-current={isToolsUrlConverterActive ? "page" : undefined}
              >
                🔗 URL 변환기
              </Link>
              <Link
                href={toolsTextConverterHref as any}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  isToolsTextConverterActive
                    ? "text-neutral-900 bg-neutral-200 font-semibold"
                    : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
                aria-current={isToolsTextConverterActive ? "page" : undefined}
              >
                📝 텍스트 변환기
              </Link>
              <Link
                href={toolsCalculatorHref as any}
                className={`px-6 py-2.5 text-sm font-medium transition-colors ${
                  isToolsCalculatorActive
                    ? "text-neutral-900 bg-neutral-200 font-semibold"
                    : "text-neutral-800 hover:bg-neutral-200 hover:text-neutral-900"
                }`}
                aria-current={isToolsCalculatorActive ? "page" : undefined}
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

