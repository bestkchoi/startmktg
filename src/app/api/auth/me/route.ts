import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = createSupabaseServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // users 테이블에서 추가 정보 가져오기
  const { data: userData, error: userError } = await supabase
    .from("users")
    .select("id, email, name, avatar_url, created_at")
    .eq("id", user.id)
    .single();

  if (userError) {
    // users 테이블에 레코드가 없을 수 있으므로 auth 정보만 반환
    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || null,
        avatar_url: user.user_metadata?.avatar_url || user.user_metadata?.picture || null,
      },
    });
  }

  return NextResponse.json({
    ok: true,
    user: userData,
  });
}

