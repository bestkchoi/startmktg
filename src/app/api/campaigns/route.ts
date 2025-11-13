import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import type { CreateCampaignRequest, ApiResponse, Campaign } from "@/types/campaign";

const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

const missingEnvResponse = () =>
  respond(
    {
      ok: false,
      code: "MISSING_ENV",
      message: "Supabase 환경 변수가 설정되지 않았습니다.",
    },
    { status: 500 }
  );

export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = createSupabaseServerClient();

  // 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "UNAUTHORIZED",
        message: "인증이 필요합니다.",
      },
      { status: 401 }
    );
  }

  // 요청 본문 파싱
  let payload: CreateCampaignRequest;
  try {
    payload = await req.json();
  } catch {
    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "유효한 JSON 요청 본문이 필요합니다.",
      },
      { status: 400 }
    );
  }

  // 검증
  const errors: Record<string, string> = {};

  if (!payload.campaign_name || typeof payload.campaign_name !== "string" || payload.campaign_name.trim().length === 0) {
    errors.campaign_name = "캠페인 이름은 필수입니다.";
  } else if (payload.campaign_name.length > 100) {
    errors.campaign_name = "캠페인 이름은 100자 이하여야 합니다.";
  }

  if (!payload.start_date || typeof payload.start_date !== "string") {
    errors.start_date = "시작일은 필수입니다.";
  }

  if (!payload.end_date || typeof payload.end_date !== "string") {
    errors.end_date = "종료일은 필수입니다.";
  }

  if (payload.start_date && payload.end_date) {
    const startDate = new Date(payload.start_date);
    const endDate = new Date(payload.end_date);

    if (isNaN(startDate.getTime())) {
      errors.start_date = "유효한 날짜 형식이 아닙니다.";
    }

    if (isNaN(endDate.getTime())) {
      errors.end_date = "유효한 날짜 형식이 아닙니다.";
    }

    if (!isNaN(startDate.getTime()) && !isNaN(endDate.getTime()) && endDate < startDate) {
      errors.end_date = "종료일은 시작일 이후여야 합니다.";
    }
  }

  if (Object.keys(errors).length > 0) {
    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "VALIDATION_ERROR",
        message: "입력값 검증에 실패했습니다.",
        errors,
      },
      { status: 400 }
    );
  }

  // 캠페인 생성
  try {
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        campaign_name: payload.campaign_name.trim(),
        start_date: payload.start_date,
        end_date: payload.end_date,
        user_id: user.id,
      })
      .select()
      .single();

    if (error || !data) {
      return respond<ApiResponse<never>>(
        {
          ok: false,
          code: "DB_INSERT_ERROR",
          message: error?.message || "캠페인 생성에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    return respond<ApiResponse<Campaign>>(
      {
        ok: true,
        data: data as Campaign,
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "DB_INSERT_ERROR",
        message,
      },
      { status: 500 }
    );
  }
}
