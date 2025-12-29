import { NextResponse } from "next/server";

const BASE_URL = "https://startmktg.com";
const LOCALE = "jp";

// 주요 페이지 목록
const PAGES = [
  "",
  "utm-checker",
  "campaigns",
  "dashboard",
];

export async function GET() {
  const urls = PAGES.map((page) => {
    const path = page ? `/${LOCALE}/${page}` : `/${LOCALE}`;
    return `  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === "" ? "1.0" : "0.8"}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${path.replace(`/${LOCALE}`, "/en")}"/>
    <xhtml:link rel="alternate" hreflang="ko" href="${BASE_URL}${path.replace(`/${LOCALE}`, "/ko")}"/>
    <xhtml:link rel="alternate" hreflang="jp" href="${BASE_URL}${path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en"/>
  </url>`;
  }).join("\n");

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}













