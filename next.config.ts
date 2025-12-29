import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    typedRoutes: true
  },
  // i18n 설정 제거: App Router에서는 [locale] 동적 세그먼트와 middleware로 처리
  // i18n: {
  //   locales: ["en", "ko", "jp"],
  //   defaultLocale: "ko"
  // }
};

export default nextConfig;


