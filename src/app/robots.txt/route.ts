import { NextResponse } from "next/server";

export async function GET() {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /_next/
Disallow: /tower/

Sitemap: https://startmktg.com/sitemap.xml`;

  return new NextResponse(robots, {
    headers: {
      "Content-Type": "text/plain",
    },
  });
}













