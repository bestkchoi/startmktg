import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import { generateShareCode } from "@/lib/utm/share-code-generator";
import type { AdType } from "@/types/utm";

/**
 * POST /api/utm-link-shares
 * UTM LINK 공유 링크 생성
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
    clean_landing_url?: string;
    final_utm_url: string;
    campaign_id: string;
    adgroup_name: string;
  };

  try {
    const body = await req.json();
    console.log("[UTM LINK 공유] 요청 본문 전체:", JSON.stringify(body, null, 2));
    payload = body;
  } catch (error: any) {
    console.error("[UTM LINK 공유] JSON 파싱 오류:", error);
    return Response.json(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "유효하지 않은 JSON 요청입니다.",
      },
      { status: 400 }
    );
  }

  // 필수 필드 검증 (insert 전 모든 필수 값 존재 확인)
  const campaignId = payload.campaign_id;
  const adgroupName = payload.adgroup_name;
  const cleanLandingUrl = payload.clean_landing_url || "";
  const isGoogle = payload.media === "ggl";

  // Google이 아닌 경우에만 utm_source, utm_medium 필수
  if (
    !payload.adtype ||
    !payload.media ||
    (!isGoogle && (!payload.utm_source || !payload.utm_medium)) ||
    !campaignId ||
    !adgroupName ||
    !cleanLandingUrl ||
    !payload.final_utm_url
  ) {
    console.error("[UTM LINK 공유] 필수 필드 누락:", {
      adtype: payload.adtype,
      media: payload.media,
      utm_source: payload.utm_source,
      utm_medium: payload.utm_medium,
      campaign_id: campaignId,
      adgroup_name: adgroupName,
      clean_landing_url: cleanLandingUrl,
      final_utm_url: payload.final_utm_url,
      isGoogle,
    });
    return Response.json(
      {
        ok: false,
        code: "MISSING_FIELD",
        message: "필수 필드가 누락되었습니다.",
        missingFields: {
          adtype: !payload.adtype,
          media: !payload.media,
          utm_source: !isGoogle && !payload.utm_source,
          utm_medium: !isGoogle && !payload.utm_medium,
          campaign_id: !campaignId,
          adgroup_name: !adgroupName,
          clean_landing_url: !cleanLandingUrl,
          final_utm_url: !payload.final_utm_url,
        },
      },
      { status: 400 }
    );
  }

  // 공유 코드 생성 (중복 체크 포함, 최소 2회 재시도)
  let shareCode: string | null = null;
  let attempts = 0;
  const maxAttempts = 5; // 충돌 시 재시도를 위해 충분한 횟수

  do {
    const generatedCode = generateShareCode();
    
    // share_code 생성 검증: 길이 6~8자 보장
    if (!generatedCode || generatedCode.length < 6 || generatedCode.length > 8) {
      console.error("[UTM LINK 공유] 공유 코드 길이 오류:", generatedCode);
      attempts++;
      if (attempts >= maxAttempts) {
        console.error("[UTM LINK 공유] 공유 코드 생성 실패: 유효하지 않은 코드 생성");
        return Response.json(
          {
            ok: false,
            code: "CODE_GENERATION_FAILED",
            message: "공유 코드 생성에 실패했습니다. 다시 시도해주세요.",
          },
          { status: 500 }
        );
      }
      continue;
    }

    attempts++;

    // 중복 체크
    const { data: existing, error: checkError } = await supabase
      .from("utm_link_shares")
      .select("share_code")
      .eq("share_code", generatedCode)
      .maybeSingle();

    if (checkError && checkError.code !== "PGRST116") {
      // PGRST116은 "no rows returned"이므로 정상, 다른 에러는 로그
      console.error("[UTM LINK 공유] 중복 체크 오류:", {
        code: checkError.code,
        message: checkError.message,
        details: checkError.details,
        hint: checkError.hint,
      });
    }

    if (!existing) {
      // 중복이 없으면 사용 가능
      shareCode = generatedCode;
      break;
    }

    if (attempts >= maxAttempts) {
      console.error("[UTM LINK 공유] 공유 코드 생성 실패: 최대 재시도 횟수 초과");
      return Response.json(
        {
          ok: false,
          code: "CODE_GENERATION_FAILED",
          message: "공유 코드 생성에 실패했습니다. 다시 시도해주세요.",
        },
        { status: 500 }
        );
    }
  } while (attempts < maxAttempts);

  // share_code가 생성되지 않았으면 insert 시도 금지
  if (!shareCode || shareCode.length < 6 || shareCode.length > 8) {
    console.error("[UTM LINK 공유] 공유 코드 검증 실패:", shareCode);
    return Response.json(
      {
        ok: false,
        code: "CODE_GENERATION_FAILED",
        message: "공유 코드 생성에 실패했습니다. 다시 시도해주세요.",
      },
      { status: 500 }
    );
  }

  // DB에 저장할 데이터 준비 (컬럼명을 테이블 스키마에 맞게 매핑)
  const insertData = {
    share_code: shareCode,
    adtype: payload.adtype,
    media: payload.media,
    utm_source: payload.utm_source,
    utm_medium: payload.utm_medium,
    campaign_id: campaignId,
    adgroup_name: adgroupName,
    clean_landing_url: cleanLandingUrl,
    final_utm_url: payload.final_utm_url,
  };

  console.log("[UTM LINK 공유] INSERT 데이터:", JSON.stringify(insertData, null, 2));

  // DB에 INSERT
  console.log("[UTM LINK 공유] INSERT 시작");
  console.log("[UTM LINK 공유] share_code:", shareCode);

  try {
    const { data, error } = await supabase
      .from("utm_link_shares")
      .insert([insertData] as any)
      .select()
      .single();

    if (error) {
      // 상세 에러 정보 출력 (최우선)
      console.error("[UTM LINK 공유] utm_link_shares insert error");
      console.error("[UTM LINK 공유] error.code:", error.code);
      console.error("[UTM LINK 공유] error.message:", error.message);
      console.error("[UTM LINK 공유] error.details:", error.details);
      console.error("[UTM LINK 공유] error.hint:", error.hint);
      console.error("[UTM LINK 공유] 전체 error 객체:", JSON.stringify(error, null, 2));
      console.error("[UTM LINK 공유] INSERT 시도한 데이터:", JSON.stringify(insertData, null, 2));

      return Response.json(
        {
          ok: false,
          code: "DB_INSERT_ERROR",
          message: "공유 링크 생성에 실패했습니다.",
          error: error.message,
          errorCode: error.code,
          errorDetails: {
            code: error.code,
            message: error.message,
            details: error.details,
            hint: error.hint,
          },
        },
        { status: 500 }
      );
    }

    console.log("[UTM LINK 공유] INSERT 성공");
    console.log("[UTM LINK 공유] 저장된 데이터 ID:", (data as any)?.id);
    console.log("[UTM LINK 공유] share_code:", shareCode);

    // 공유 URL 생성
    const shareUrl = `/u/${shareCode}`;

    return Response.json(
      {
        ok: true,
        share_code: shareCode, // 프론트엔드에서 직접 사용할 수 있도록 최상위에 추가
        share_url: shareUrl,
        data: {
          share_code: shareCode,
          share_url: shareUrl,
          ...(data as any),
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    // 예외 발생 시 상세 로그 출력
    console.error("[UTM LINK 공유] DB INSERT 예외 발생");
    console.error("[UTM LINK 공유] error.message:", error.message);
    console.error("[UTM LINK 공유] error.stack:", error.stack);
    console.error("[UTM LINK 공유] 전체 error 객체:", JSON.stringify(error, null, 2));
    console.error("[UTM LINK 공유] INSERT 시도한 데이터:", JSON.stringify(insertData, null, 2));

    return Response.json(
      {
        ok: false,
        code: "DB_INSERT_ERROR",
        message: "공유 링크 생성에 실패했습니다.",
        error: error.message,
        errorStack: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/utm-link-shares?share_code=xxx
 * 공유 링크 조회
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

  // 쿼리 파라미터에서 share_code 가져오기
  const searchParams = req.nextUrl.searchParams;
  const shareCode = searchParams.get("share_code");

  if (!shareCode) {
    return Response.json(
      {
        ok: false,
        code: "MISSING_SHARE_CODE",
        message: "share_code 파라미터가 필요합니다.",
      },
      { status: 400 }
    );
  }

  console.log("[UTM LINK 공유] 조회 시작, share_code:", shareCode);

  try {
    const { data, error } = await supabase
      .from("utm_link_shares")
      .select("*")
      .eq("share_code", shareCode)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // 데이터 없음
        return Response.json(
          {
            ok: false,
            code: "NOT_FOUND",
            message: "공유 링크를 찾을 수 없습니다.",
          },
          { status: 404 }
        );
      }

      console.error("[UTM LINK 공유] DB 조회 오류:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });

      return Response.json(
        {
          ok: false,
          code: "DB_QUERY_ERROR",
          message: "공유 링크 조회 중 오류가 발생했습니다.",
          error: error.message,
        },
        { status: 500 }
      );
    }

    console.log("[UTM LINK 공유] 조회 성공");

    return Response.json(
      {
        ok: true,
        data,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("[UTM LINK 공유] DB 조회 예외:", {
      message: error.message,
      stack: error.stack,
    });

    return Response.json(
      {
        ok: false,
        code: "DB_QUERY_ERROR",
        message: "공유 링크 조회 중 오류가 발생했습니다.",
        error: error.message,
      },
      { status: 500 }
    );
  }
}

