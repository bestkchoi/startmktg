import { NextResponse } from "next/server";

const BASE_URL = "https://startmktg.com";
const LOCALES = ["en", "ko", "jp"];

export async function GET() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${LOCALES.map(
    (locale) => `  <sitemap>
    <loc>${BASE_URL}/sitemap-${locale}.xml</loc>
  </sitemap>`
  ).join("\n")}
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}













