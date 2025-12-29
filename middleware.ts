import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED = ["en", "ko", "jp"];

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Skip static and API
	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/assets") ||
		pathname === "/favicon.ico"
	) {
		return NextResponse.next();
	}

	// Already has locale?
	const hasLocale = SUPPORTED.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
	if (hasLocale) return NextResponse.next();

	// Detect from header (very simple)
	const header = request.headers.get("accept-language") || "";
	const detected = header.includes("ko") ? "ko" : header.includes("ja") ? "jp" : "en";

	request.nextUrl.pathname = `/${detected}${pathname === "/" ? "" : pathname}`;
	return NextResponse.redirect(request.nextUrl, 302);
}

export const config = {
	matcher: ["/((?!_next|api|assets|favicon.ico).*)"]
};















