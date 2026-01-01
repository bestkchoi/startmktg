import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";

const BASE_URL = "https://startmktg.com";
const LOCALE = "jp";

// 정적 페이지 목록
const STATIC_PAGES = [
  "",
  "utm-checker",
  "campaigns",
  "campaign/new",
  "dashboard",
];

export async function GET() {
  // 정적 페이지 URL 생성
  const staticUrls = STATIC_PAGES.map((page) => {
    const path = page ? `/${LOCALE}/${page}` : `/${LOCALE}`;
    const priority = page === "" ? "1.0" : page === "campaign/new" ? "0.7" : "0.8";
    return `  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${new Date().toISOString().split("T")[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${path.replace(`/${LOCALE}`, "/en")}"/>
    <xhtml:link rel="alternate" hreflang="ko" href="${BASE_URL}${path.replace(`/${LOCALE}`, "/ko")}"/>
    <xhtml:link rel="alternate" hreflang="jp" href="${BASE_URL}${path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en"/>
  </url>`;
  });

  // 동적 캠페인 페이지 URL 생성 (최근 100개만 포함)
  let campaignUrls: string[] = [];
  try {
    const supabase = await createSupabaseServerClient();
    const { data: campaigns } = await supabase
      .from("campaigns" as any)
      .select("campaign_id, updated_at")
      .order("updated_at", { ascending: false })
      .limit(100);

    if (campaigns && campaigns.length > 0) {
      campaignUrls = campaigns.map((campaign: any) => {
        const path = `/${LOCALE}/campaigns/${campaign.campaign_id}`;
        const lastmod = campaign.updated_at 
          ? new Date(campaign.updated_at).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0];
        return `  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
    <xhtml:link rel="alternate" hreflang="en" href="${BASE_URL}${path.replace(`/${LOCALE}`, "/en")}"/>
    <xhtml:link rel="alternate" hreflang="ko" href="${BASE_URL}${path.replace(`/${LOCALE}`, "/ko")}"/>
    <xhtml:link rel="alternate" hreflang="jp" href="${BASE_URL}${path}"/>
    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE_URL}/en"/>
  </url>`;
      });
    }
  } catch (error) {
    // 캠페인 조회 실패 시 정적 페이지만 포함
    console.error("Failed to fetch campaigns for sitemap:", error);
  }

  const urls = [...staticUrls, ...campaignUrls].join("\n");

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













