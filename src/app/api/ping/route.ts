import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return NextResponse.json(
      {
        ok: false,
        code: "MISSING_ENV",
        message: "Supabase 환경 변수가 설정되지 않았습니다."
      },
      { status: 500 }
    );
  }

  try {
    const supabase = createSupabaseServerClient({ url, anonKey });
    const { error } = await supabase
      .from("fact_utm_log")
      .select("id", { head: true, count: "exact" })
      .limit(1);

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          code: "DB_CONN_ERROR",
          message: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "Supabase 연결이 정상입니다."
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json(
      {
        ok: false,
        code: "DB_CONN_ERROR",
        message
      },
      { status: 500 }
    );
  }
}


