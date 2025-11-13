import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import type { CreateChannelRequest, ApiResponse, CampaignChannel } from "@/types/campaign";
import { generateUtmParams, buildFinalUrl } from "@/lib/campaign/utm-template";
import type { UtmTemplate } from "@/lib/campaign/utm-template";

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

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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

  const { id } = await params;

  // 캠페인 존재 및 권한 확인
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("id", id)
    .single();

  if (campaignError || !campaign) {
    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "CAMPAIGN_NOT_FOUND",
        message: "캠페인을 찾을 수 없습니다.",
      },
      { status: 404 }
    );
  }

  if (campaign.user_id !== user.id) {
    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "FORBIDDEN",
        message: "접근 권한이 없습니다.",
      },
      { status: 403 }
    );
  }

  // 요청 본문 파싱
  let payload: CreateChannelRequest;
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

  if (!payload.channel_type || typeof payload.channel_type !== "string") {
    errors.channel_type = "매체 타입은 필수입니다.";
  }

  if (!payload.landing_url || typeof payload.landing_url !== "string") {
    errors.landing_url = "랜딩 URL은 필수입니다.";
  } else {
    try {
      new URL(payload.landing_url);
    } catch {
      errors.landing_url = "유효한 URL 형식이 아닙니다.";
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

  // 템플릿 조회
  let template: UtmTemplate | null = null;
  const { data: templateData } = await supabase
    .from("utm_templates")
    .select("*")
    .eq("channel_type", payload.channel_type)
    .single();

  if (templateData) {
    template = templateData as unknown as UtmTemplate;
  }

  // UTM 파라미터 생성
  const utmParams = generateUtmParams(
    template,
    {
      campaign_name: campaign.campaign_name,
      channel_type: payload.channel_type as any,
    },
    payload.custom_content,
    payload.custom_term
  );

  // 최종 URL 생성
  const finalUrl = buildFinalUrl(payload.landing_url, utmParams);

  // 매체 저장
  try {
    const { data, error } = await supabase
      .from("campaign_channels")
      .insert({
        campaign_id: id,
        channel_type: payload.channel_type,
        landing_url: payload.landing_url,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        utm_campaign: utmParams.utm_campaign,
        utm_content: utmParams.utm_content || null,
        utm_term: utmParams.utm_term || null,
        final_url: finalUrl,
      })
      .select()
      .single();

    if (error || !data) {
      return respond<ApiResponse<never>>(
        {
          ok: false,
          code: "DB_INSERT_ERROR",
          message: error?.message || "매체 생성에 실패했습니다.",
        },
        { status: 500 }
      );
    }

    return respond<ApiResponse<CampaignChannel>>(
      {
        ok: true,
        data: data as CampaignChannel,
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
