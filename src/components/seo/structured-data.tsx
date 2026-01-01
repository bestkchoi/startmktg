import Script from "next/script";

type StructuredDataProps = {
  type: "WebApplication" | "Organization" | "BreadcrumbList";
  data: Record<string, unknown>;
};

export function StructuredData({ type, data }: StructuredDataProps) {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": type,
    ...data,
  };

  return (
    <Script
      id={`structured-data-${type}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
    />
  );
}

// UTM Checker 페이지용 구조화된 데이터
export function UtmCheckerStructuredData({ locale }: { locale: string }) {
  const base = "https://startmktg.com";
  const path = `/${locale}/utm-checker`;

  const names: Record<string, string> = {
    en: "UTM Checker",
    ko: "UTM 체커",
    jp: "UTMチェッカー",
  };

  const descriptions: Record<string, string> = {
    en: "Free online tool to analyze and validate UTM parameters, Google Ads, Meta, TikTok, Naver, and Kakao tracking parameters.",
    ko: "UTM 파라미터, Google Ads, Meta, TikTok, Naver, Kakao 추적 파라미터를 분석하고 검증하는 무료 온라인 도구.",
    jp: "UTMパラメータ、Google Ads、Meta、TikTok、Naver、Kakaoのトラッキングパラメータを分析・検証する無料オンラインツール。",
  };

  return (
    <StructuredData
      type="WebApplication"
      data={{
        name: names[locale] || names.en,
        description: descriptions[locale] || descriptions.en,
        url: `${base}${path}`,
        applicationCategory: "MarketingApplication",
        operatingSystem: "Web",
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
        },
        inLanguage: locale,
        publisher: {
          "@type": "Organization",
          name: "Start MKTG",
          url: base,
        },
      }}
    />
  );
}

// Organization 구조화된 데이터
export function OrganizationStructuredData() {
  const base = "https://startmktg.com";

  return (
    <StructuredData
      type="Organization"
      data={{
        name: "Start MKTG",
        url: base,
        logo: `${base}/logo.png`,
        sameAs: [
          // 소셜 미디어 링크가 있다면 여기에 추가
        ],
      }}
    />
  );
}













