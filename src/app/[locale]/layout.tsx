import type { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const base = "https://startmktg.com";

  const titles: Record<string, string> = {
    en: "Start Marketing - UTM Tools & Campaign Management",
    ko: "Start Marketing - UTM 도구 및 캠페인 관리",
    jp: "Start Marketing - UTMツールとキャンペーン管理",
  };

  const descriptions: Record<string, string> = {
    en: "Free UTM parameter checker, campaign management tools, and marketing analytics platform.",
    ko: "무료 UTM 파라미터 체커, 캠페인 관리 도구 및 마케팅 분석 플랫폼.",
    jp: "無料UTMパラメータチェッカー、キャンペーン管理ツール、マーケティング分析プラットフォーム。",
  };

  return {
    title: titles[locale] || titles.en,
    description: descriptions[locale] || descriptions.en,
    alternates: {
      canonical: `${base}/${locale}`,
      languages: {
        en: `${base}/en`,
        ko: `${base}/ko`,
        jp: `${base}/jp`,
        "x-default": `${base}/en`,
      } as Record<string, string>,
    },
    openGraph: {
      title: titles[locale] || titles.en,
      description: descriptions[locale] || descriptions.en,
      url: `${base}/${locale}`,
      siteName: "Start Marketing",
      locale: locale,
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  await params; // params를 await하여 사용
  return <>{children}</>;
}




