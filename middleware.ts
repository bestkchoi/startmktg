import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SUPPORTED_LOCALES = ["en", "ko", "jp"];
const DEFAULT_LOCALE = "en"; // 영어를 기본값으로 설정

/**
 * Accept-Language 헤더에서 언어 감지
 * 예: "ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7" -> "ko"
 */
function detectLocaleFromHeader(acceptLanguage: string | null): string {
	if (!acceptLanguage) return DEFAULT_LOCALE;

	// 언어 코드 추출 (예: "ko-KR,ko;q=0.9,en-US;q=0.8" -> ["ko-KR", "ko", "en-US", "en"])
	const languages = acceptLanguage
		.split(",")
		.map((lang) => {
			const [code] = lang.trim().split(";");
			return code.trim().toLowerCase();
		});

	// 지원되는 언어 찾기 (우선순위 순서대로)
	for (const lang of languages) {
		// 정확히 일치하는 경우
		if (SUPPORTED_LOCALES.includes(lang)) {
			return lang;
		}
		// 언어 코드만 일치하는 경우 (예: "ko-KR" -> "ko")
		const langCode = lang.split("-")[0];
		if (SUPPORTED_LOCALES.includes(langCode)) {
			return langCode;
		}
	}

	return DEFAULT_LOCALE;
}

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// 디버깅: 모든 요청에 대해 로그 출력
	console.log("========================================");
	console.log("[Middleware] EXECUTING - pathname:", pathname);
	console.log("========================================");

	// Skip static and API
	if (
		pathname.startsWith("/api") ||
		pathname.startsWith("/_next") ||
		pathname.startsWith("/assets") ||
		pathname === "/favicon.ico" ||
		pathname === "/robots.txt" ||
		pathname.startsWith("/sitemap") ||
		pathname.startsWith("/.well-known")
	) {
		console.log("[Middleware] Skipping:", pathname);
		return NextResponse.next();
	}

	// 이미 locale이 있는지 확인 (kr도 ko로 처리)
	const hasLocale = SUPPORTED_LOCALES.some(
		(locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)
	) || pathname === "/kr" || pathname.startsWith("/kr/");

	if (hasLocale) {
		console.log("[Middleware] Already has locale:", pathname);
		// locale이 있으면 그대로 진행
		return NextResponse.next();
	}

	console.log("[Middleware] No locale found, detecting...");

	// Accept-Language 헤더에서 언어 감지 (우선순위 1)
	const acceptLanguage = request.headers.get("accept-language");
	let detectedLocale = detectLocaleFromHeader(acceptLanguage);
	console.log("[Middleware] Detected locale from Accept-Language:", detectedLocale, "from:", acceptLanguage);

	// 쿠키에서 locale 확인 (사용자가 명시적으로 선택한 경우에만 사용)
	// 단, Accept-Language 헤더가 없거나 감지 실패한 경우에만 쿠키 사용
	const cookieLocale = request.cookies.get("NEXT_LOCALE")?.value;
	if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
		// Accept-Language 헤더가 없거나 기본값(en)으로 감지된 경우에만 쿠키 사용
		if (!acceptLanguage || detectedLocale === DEFAULT_LOCALE) {
			console.log("[Middleware] Using cookie locale (fallback):", cookieLocale);
			detectedLocale = cookieLocale;
		} else {
			console.log("[Middleware] Ignoring cookie locale (", cookieLocale, ") in favor of Accept-Language (", detectedLocale, ")");
		}
	}

	// 리다이렉트 URL 생성
	const redirectPath = pathname === "/" ? `/${detectedLocale}` : `/${detectedLocale}${pathname}`;
	const newUrl = request.nextUrl.clone();
	newUrl.pathname = redirectPath;
	console.log("[Middleware] Redirecting to:", redirectPath);
	
	const response = NextResponse.redirect(newUrl, 302);
	
	// 감지된 언어를 쿠키에 저장 (1년간 유지)
	response.cookies.set("NEXT_LOCALE", detectedLocale, {
		maxAge: 60 * 60 * 24 * 365, // 1년
		path: "/",
		sameSite: "lax",
	});

	return response;
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 * - robots.txt, sitemap.xml (SEO files)
		 * - files with extensions (images, etc.)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap|.*\\..*).*)",
	],
};
