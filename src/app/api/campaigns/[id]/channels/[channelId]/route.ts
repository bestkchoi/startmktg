import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import type { CampaignChannel } from "@/types/campaign";
import { generateUtmParams, buildFinalUrl } from "@/lib/campaign/utm-template";
import type { UtmTemplate } from "@/lib/campaign/utm-template";
import type { Database } from "@/types/supabase";
import {
  respond,
  missingEnvResponse,
  invalidJsonResponse,
  validationErrorResponse,
  notFoundResponse,
  dbErrorResponse,
  successResponse,
} from "@/lib/campaign/api-utils";

type Campaign = Database["public"]["Tables"]["campaigns"]["Row"];
type CampaignChannelRow = Database["public"]["Tables"]["campaign_channels"]["Row"];

/**
 * GET /api/campaigns/[id]/channels/[channelId]
 * 채널 정보 조회
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = await createSupabaseServerClient();
  const { id, channelId } = await params;

  try {
    // 채널 조회
    const { data: channel, error: channelError } = await supabase
      .from("campaign_channels")
      .select("*")
      .eq("id", channelId)
      .eq("campaign_id", id)
      .single<CampaignChannelRow>();

    if (channelError || !channel) {
      return notFoundResponse("매체를 찾을 수 없습니다.");
    }

    return successResponse(channel as CampaignChannel);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return dbErrorResponse(message, "DB_QUERY_ERROR");
  }
}

/**
 * PATCH /api/campaigns/[id]/channels/[channelId]
 * 채널 수정
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; channelId: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = await createSupabaseServerClient();
  const { id, channelId } = await params;

  // 기존 채널 조회
  const { data: existingChannel, error: fetchError } = await supabase
    .from("campaign_channels")
    .select("*")
    .eq("id", channelId)
    .eq("campaign_id", id)
    .single<CampaignChannelRow>();

  if (fetchError || !existingChannel) {
    return notFoundResponse("매체를 찾을 수 없습니다.");
  }

  // 캠페인 조회 (PRD 구조: campaign_id 사용)
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("campaign_id", id)
    .single<Campaign>();

  if (campaignError || !campaign) {
    return notFoundResponse("캠페인을 찾을 수 없습니다.");
  }

  // 요청 본문 파싱
  let payload: {
    landing_url?: string;
    custom_content?: string;
    custom_term?: string;
  };
  try {
    payload = await req.json();
  } catch {
    return invalidJsonResponse();
  }

  // 검증
  const errors: Record<string, string> = {};

  if (payload.landing_url !== undefined) {
    if (!payload.landing_url || typeof payload.landing_url !== "string") {
      errors.landing_url = "랜딩 URL은 필수입니다.";
    } else {
      try {
        new URL(payload.landing_url);
      } catch {
        errors.landing_url = "유효한 URL 형식이 아닙니다.";
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse(errors);
  }

  // 템플릿 조회
  let template: UtmTemplate | null = null;
  const { data: templateData } = await supabase
    .from("utm_templates")
    .select("*")
    .eq("channel_type", existingChannel.channel_type)
    .single();

  if (templateData) {
    template = templateData as unknown as UtmTemplate;
  }

  // UTM 파라미터 재생성
  const campaignName = (campaign as any).final_campaign_name || (campaign as any).raw_name || "campaign";
  const landingUrl = payload.landing_url || existingChannel.landing_url;
  const customContent = payload.custom_content !== undefined ? payload.custom_content : existingChannel.utm_content || undefined;
  const customTerm = payload.custom_term !== undefined ? payload.custom_term : existingChannel.utm_term || undefined;

  const utmParams = generateUtmParams(
    template,
    {
      campaign_name: campaignName,
      channel_type: existingChannel.channel_type as any,
    },
    customContent,
    customTerm
  );

  // 최종 URL 재생성
  const finalUrl = buildFinalUrl(landingUrl, utmParams);

  // 채널 업데이트
  try {
    const updateData: Record<string, any> = {
      landing_url: landingUrl,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content || null,
      utm_term: utmParams.utm_term || null,
      final_url: finalUrl,
    };

    const { data, error } = await (supabase as any)
      .from("campaign_channels")
      .update(updateData)
      .eq("id", channelId)
      .eq("campaign_id", id)
      .select()
      .single();

    if (error || !data) {
      return dbErrorResponse(
        error?.message || "매체 수정에 실패했습니다.",
        "DB_UPDATE_ERROR"
      );
    }

    return successResponse(data as CampaignChannel);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return dbErrorResponse(message, "DB_UPDATE_ERROR");
  }
}

