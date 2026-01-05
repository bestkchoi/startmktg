import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  
  return {
    title: "이모지 페이지 | START MKTG",
    description: "다양한 이모지와 기호를 검색하고 복사할 수 있는 간편한 도구입니다. 카테고리별로 정리된 이모지를 빠르게 찾아보세요.",
  };
}

export default async function SymbolsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}







