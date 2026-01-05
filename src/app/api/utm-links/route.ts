import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import { parseLandingUrl } from "@/lib/utm/url-parser";
import type { AdType, UtmParams } from "@/types/utm";

/**
 * POST /api/utm-links
 * UTM LINK 생성 및 DB 저장
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return Response.json(
      {
        ok: false,
        code: "MISSING_ENV",
        message: "Supabase 환경 변수가 설정되지 않았습니다.",
      },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  // 요청 본문 파싱
  let payload: {
    adtype: AdType;
    media: string;
    utm_source: string | null;
    utm_medium: string | null;
    landing_url?: string; // 선택사항 (CRM의 경우)
  };

  try {
    payload = await req.json();
  } catch {
    return Response.json(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "유효하지 않은 JSON 요청입니다.",
      },
      { status: 400 }
    );
  }

  // 필수 필드 검증 (Google일 경우 utm_source, utm_medium은 선택사항)
  const isGoogle = payload.media === "ggl";
  if (!payload.adtype || !payload.media) {
    return Response.json(
      {
        ok: false,
        code: "MISSING_FIELD",
        message: "필수 필드가 누락되었습니다.",
      },
      { status: 400 }
    );
  }

  // Google이 아닌 경우에만 utm_source, utm_medium 필수
  if (!isGoogle && (!payload.utm_source || !payload.utm_medium)) {
    return Response.json(
      {
        ok: false,
        code: "MISSING_FIELD",
        message: "필수 필드가 누락되었습니다.",
      },
      { status: 400 }
    );
  }

  // URL 파싱 (URL이 있는 경우만)
  let parsedUrl: {
    landing_domain: string;
    landing_path: string;
    landing_query_has_params: boolean;
    landing_hash_present: boolean;
  } | null = null;

  if (payload.landing_url && payload.landing_url.trim().length > 0) {
    try {
      parsedUrl = parseLandingUrl(payload.landing_url);
    } catch (error: any) {
      // URL 파싱 실패는 로그만 남기고 계속 진행 (CRM의 경우 URL이 선택사항)
      console.error("URL 파싱 실패:", error.message);
    }
  }

  // DB에 저장할 데이터 준비
  // URL 정보가 있는 경우에만 landing 관련 필드 포함
  const insertData: {
    adtype: AdType;
    media: string;
    utm_source: string | null;
    utm_medium: string | null;
    landing_domain?: string;
    landing_path?: string;
    landing_query_has_params?: boolean;
    landing_hash_present?: boolean;
  } = {
    adtype: payload.adtype,
    media: payload.media,
    utm_source: payload.utm_source || null,
    utm_medium: payload.utm_medium || null,
  };

  // URL 정보가 있으면 추가 (없으면 필드를 포함하지 않음)
  if (parsedUrl) {
    insertData.landing_domain = parsedUrl.landing_domain;
    insertData.landing_path = parsedUrl.landing_path;
    insertData.landing_query_has_params = parsedUrl.landing_query_has_params;
    insertData.landing_hash_present = parsedUrl.landing_hash_present;
  }
  // URL이 없으면 landing 관련 필드를 아예 포함하지 않음 (NULL도 전달하지 않음)

  // DB에 INSERT
  console.log("[UTM LINK 저장] INSERT 시작");
  console.log("[UTM LINK 저장] 테이블: utm_link_generations");
  console.log("[UTM LINK 저장] 데이터:", JSON.stringify(insertData, null, 2));
  console.log("[UTM LINK 저장] Supabase URL:", url);
  console.log("[UTM LINK 저장] Anon Key 존재:", !!anonKey);
  
  // 현재 사용자 역할 확인 (디버깅용)
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    console.log("[UTM LINK 저장] 현재 사용자:", user ? `인증됨 (${user.id})` : "익명 사용자");
    if (userError) {
      console.log("[UTM LINK 저장] 사용자 확인 오류 (익명 사용자일 수 있음):", userError.message);
    }
  } catch (e) {
    console.log("[UTM LINK 저장] 사용자 확인 중 예외 (익명 사용자일 수 있음):", e);
  }
  
  try {
    const { data, error } = await supabase
      .from("utm_link_generations")
      .insert(insertData as any)
      .select()
      .single();

    if (error) {
      // Supabase 에러 정보를 그대로 출력
      console.error("[UTM LINK 저장] DB INSERT 오류 발생");
      console.error("[UTM LINK 저장] error.code:", error.code);
      console.error("[UTM LINK 저장] error.message:", error.message);
      console.error("[UTM LINK 저장] error.details:", error.details);
      console.error("[UTM LINK 저장] error.hint:", error.hint);
      console.error("[UTM LINK 저장] 전체 error 객체:", JSON.stringify(error, null, 2));
      
      const errorDetails = {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      };
      
      // 에러가 있어도 UTM 링크 생성 자체는 실패시키지 않음
      return Response.json(
        {
          ok: true,
          message: "UTM 링크는 생성되었지만 로그 저장에 실패했습니다.",
          saved: false,
          error: error.message,
          errorCode: error.code,
          errorDetails: errorDetails,
        },
        { status: 200 }
      );
    }

    // 저장 성공 시 조용히 처리 (콘솔 로그만)
    console.log("[UTM LINK 저장] INSERT 성공");
    console.log("[UTM LINK 저장] 저장된 데이터 ID:", (data as any)?.id);
    
    return Response.json(
      {
        ok: true,
        data,
        saved: true,
      },
      { status: 201 }
    );
  } catch (error: any) {
    // 예외 발생 시 상세 로그 출력
    console.error("[UTM LINK 저장] DB INSERT 예외 발생");
    console.error("[UTM LINK 저장] error.message:", error.message);
    console.error("[UTM LINK 저장] error.stack:", error.stack);
    console.error("[UTM LINK 저장] 전체 error 객체:", JSON.stringify(error, null, 2));
    
    // 예외가 있어도 UTM 링크 생성 자체는 실패시키지 않음
    return Response.json(
      {
        ok: true,
        message: "UTM 링크는 생성되었지만 로그 저장에 실패했습니다.",
        saved: false,
        error: error.message,
      },
      { status: 200 }
    );
  }
}

/**
 * GET /api/utm-links
 * UTM LINK 목록 조회
 */
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return Response.json(
      {
        ok: false,
        code: "MISSING_ENV",
        message: "Supabase 환경 변수가 설정되지 않았습니다.",
      },
      { status: 500 }
    );
  }

  const supabase = await createSupabaseServerClient();

  // 쿼리 파라미터에서 limit 가져오기
  const searchParams = req.nextUrl.searchParams;
  const limit = parseInt(searchParams.get("limit") || "100", 10);

  console.log("[UTM LINK 목록] 조회 시작, limit:", limit);
  try {
    // utm_link_generations_public에서 기본 정보 가져오기
    const { data: generationsData, error: generationsError } = await supabase
      .from("utm_link_generations_public")
      .select("created_at, adtype, media, utm_source, utm_medium, landing_domain, landing_path")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (generationsError) {
      console.error("[UTM LINK 목록] DB 조회 오류:", {
        code: generationsError.code,
        message: generationsError.message,
        details: generationsError.details,
        hint: generationsError.hint,
      });
      return Response.json(
        {
          ok: false,
          code: "DB_QUERY_ERROR",
          message: "목록 조회 중 오류가 발생했습니다.",
          error: generationsError.message,
        },
        { status: 500 }
      );
    }

    if (!generationsData || generationsData.length === 0) {
      return Response.json(
        {
          ok: true,
          data: [],
          message: "목록 조회 완료",
        },
        { status: 200 }
      );
    }

    // 각 generation에 대해 share_code 찾기
    // created_at 시간을 기준으로 해당 generation 이후에 생성된 가장 가까운 share를 찾음
    const dataWithShareCode = await Promise.all(
      generationsData.map(async (gen: any) => {
        const genCreatedAt = new Date(gen.created_at);
        const isGoogle = gen.media === "ggl";
        
        // generation의 created_at 이후에 생성된 share 중에서
        // 동일한 파라미터를 가진 가장 가까운 share를 찾음
        let query = supabase
          .from("utm_link_shares")
          .select("share_code, created_at")
          .eq("adtype", gen.adtype)
          .eq("media", gen.media)
          .gte("created_at", genCreatedAt.toISOString());
        
        // Google일 경우 utm_source, utm_medium이 null이므로 이 조건들을 제외
        if (isGoogle) {
          query = query.is("utm_source", null).is("utm_medium", null);
        } else {
          query = query.eq("utm_source", gen.utm_source).eq("utm_medium", gen.utm_medium);
        }
        
        const { data: shareData } = await query
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        return {
          ...gen,
          share_code: (shareData as any)?.share_code || null,
        };
      })
    );

    console.log("[UTM LINK 목록] 조회 성공, 데이터 개수:", dataWithShareCode?.length || 0);
    return Response.json(
      {
        ok: true,
        data: dataWithShareCode || [],
        message: "목록 조회 완료",
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[UTM LINK 목록] DB 조회 예외:", {
      message: error.message,
      stack: error.stack,
    });
    return Response.json(
      {
        ok: false,
        code: "DB_QUERY_ERROR",
        message: "목록 조회 중 오류가 발생했습니다.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

