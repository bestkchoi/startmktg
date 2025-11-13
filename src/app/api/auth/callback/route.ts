import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import { isGmailEmail } from "@/libs/supabase/auth";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const error = requestUrl.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error)}`, requestUrl.origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL("/login?error=missing_code", requestUrl.origin)
    );
  }

  const supabase = createSupabaseServerClient();

  // OAuth 코드를 세션으로 교환
  const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(
    code
  );

  if (exchangeError || !data.user) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(exchangeError?.message || "auth_failed")}`,
        requestUrl.origin
      )
    );
  }

  // Gmail 도메인 검증
  const email = data.user.email;
  if (!email || !isGmailEmail(email)) {
    // 비Gmail 계정인 경우 로그아웃 처리
    await supabase.auth.signOut();
    return NextResponse.redirect(
      new URL(
        "/login?error=gmail_only",
        requestUrl.origin
      )
    );
  }

  // users 테이블에 사용자 정보 저장/업데이트
  const { error: upsertError } = await supabase
    .from("users")
    .upsert(
      {
        id: data.user.id,
        email: email,
        name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
        avatar_url: data.user.user_metadata?.avatar_url || data.user.user_metadata?.picture || null,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "id",
      }
    );

  if (upsertError) {
    console.error("Failed to upsert user:", upsertError);
    // 사용자 정보 저장 실패해도 로그인은 진행
  }

  // 대시보드로 리다이렉트
  return NextResponse.redirect(new URL("/dashboard", requestUrl.origin));
}

