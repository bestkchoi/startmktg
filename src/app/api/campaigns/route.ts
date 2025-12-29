import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import type { StartCampaign, CreateStartCampaignRequest } from "@/types/campaign";
import { normalizeCampaignName, buildFinalCampaignName } from "@/lib/campaign/campaign-name";
import {
  respond,
  missingEnvResponse,
  invalidJsonResponse,
  validationErrorResponse,
  dbErrorResponse,
  successResponse,
} from "@/lib/campaign/api-utils";

/**
 * POST /api/campaigns
 * Campaign 생성 (PRD v1.1)
 */
export async function POST(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = await createSupabaseServerClient();

  // 요청 본문 파싱
  let payload: CreateStartCampaignRequest;
  try {
    payload = await req.json();
  } catch {
    return invalidJsonResponse();
  }

  // 검증
  const errors: Record<string, string> = {};

  if (!payload.raw_name || typeof payload.raw_name !== "string" || payload.raw_name.trim().length === 0) {
    errors.raw_name = "캠페인명은 필수입니다.";
  }

  if (!payload.start_date || typeof payload.start_date !== "string") {
    errors.start_date = "시작일은 필수입니다.";
  } else {
    // 날짜 형식 검증
    const startDate = new Date(payload.start_date);
    if (isNaN(startDate.getTime())) {
      errors.start_date = "유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.";
    }
  }

  // 종료일 검증 (선택값)
  if (payload.end_date !== undefined && payload.end_date !== null && payload.end_date !== "") {
    if (typeof payload.end_date !== "string") {
      errors.end_date = "유효한 날짜 형식이 아닙니다.";
    } else {
      const endDate = new Date(payload.end_date);
      if (isNaN(endDate.getTime())) {
        errors.end_date = "유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.";
      } else if (payload.start_date) {
        const startDate = new Date(payload.start_date);
        if (!isNaN(startDate.getTime()) && endDate < startDate) {
          errors.end_date = "종료일은 시작일 이후여야 합니다.";
        }
      }
    }
  }

  if (Object.keys(errors).length > 0) {
    return validationErrorResponse(errors);
  }

  try {
    // normalizedName 생성
    let normalizedName = payload.normalized_name 
      ? payload.normalized_name 
      : normalizeCampaignName(payload.raw_name);

    // 검색광고인 경우 18자 제한 (Naver Search 또는 Google Ads: sm_sa_nav_br_/sm_sa_nav_nb_/sm_sa_goo_br_/sm_sa_goo_nb_ prefix 12자 + 캠페인명 18자 = 30자)
    const isNaverSearch = payload.selected_channels?.includes("naver") || false;
    const isGoogleAds = payload.selected_channels?.includes("google") || false;
    if ((isNaverSearch || isGoogleAds) && normalizedName.length > 18) {
      normalizedName = normalizedName.substring(0, 18);
    }

    // finalCampaignName 생성
    const isBrand = payload.search_ad_type === "brand";
    let channel: 'naver' | 'google' | undefined;
    if (isNaverSearch) {
      channel = 'naver';
    } else if (isGoogleAds) {
      channel = 'google';
    }
    const finalCampaignName = buildFinalCampaignName(
      payload.start_date,
      normalizedName,
      channel ? { channel, isBrand } : undefined
    );

    // brandId 결정 (없으면 null, 로그인 없이 사용 가능하도록)
    const brandId = payload.brand_id || null;

    // 중복 체크: 동일 brandId 내에서 finalCampaignName이 유일해야 함 (brandId가 null이면 전체에서 체크)
    let existingCampaign = null;
    let checkError = null;
    
    try {
      if (brandId) {
        const result = await supabase
          .from("campaigns")
          .select("campaign_id")
          .eq("brand_id", brandId)
          .eq("final_campaign_name", finalCampaignName)
          .maybeSingle();
        existingCampaign = result.data;
        checkError = result.error;
      } else {
        // brandId가 null인 경우 전체에서 중복 체크
        const result = await supabase
          .from("campaigns")
          .select("campaign_id")
          .is("brand_id", null)
          .eq("final_campaign_name", finalCampaignName)
          .maybeSingle();
        existingCampaign = result.data;
        checkError = result.error;
      }

      // 에러가 있고 "no rows returned"가 아닌 경우에만 에러 처리
      if (checkError && checkError.code !== "PGRST116") {
        console.error("중복 체크 오류:", checkError);
        return dbErrorResponse("중복 체크 중 오류가 발생했습니다.", "DB_QUERY_ERROR");
      }
    } catch (error) {
      console.error("중복 체크 예외:", error);
      return dbErrorResponse("중복 체크 중 오류가 발생했습니다.", "DB_QUERY_ERROR");
    }

    if (existingCampaign) {
      return respond(
        {
          ok: false,
          code: "DUPLICATE_CAMPAIGN",
          message: "이미 사용 중인 캠페인명입니다.",
          errors: {
            final_campaign_name: `"${finalCampaignName}"은(는) 이미 존재합니다.`,
          },
        },
        { status: 409 }
      );
    }

    // 캠페인 생성 (로그인 없이 사용 가능하도록 user_id 관련 필드는 null)
    const { data, error } = await supabase
      .from("campaigns")
      .insert({
        raw_name: payload.raw_name.trim(),
        normalized_name: normalizedName,
        final_campaign_name: finalCampaignName,
        start_date: payload.start_date,
        end_date: payload.end_date && payload.end_date.length > 0 ? payload.end_date : null,
        brand_id: brandId,
        creator_user_id: null, // 로그인 없이 사용 가능
        description: payload.description || null, // 캠페인 설명 (한글 원본 등)
        user_id: null, // 로그인 없이 사용 가능
      } as any)
      .select()
      .single();

    if (error || !data) {
      return dbErrorResponse(
        error?.message || "캠페인 생성에 실패했습니다.",
        "DB_INSERT_ERROR"
      );
    }

    const campaignId = (data as any).campaign_id;

    // 선택한 매체가 있으면 campaign_channels에 저장 (landing_url은 임시 값으로 저장)
    if (payload.selected_channels && Array.isArray(payload.selected_channels) && payload.selected_channels.length > 0) {
      const channelInserts = payload.selected_channels.map((channelType: string) => ({
        campaign_id: campaignId,
        channel_type: channelType,
        landing_url: "pending", // 임시 값, 나중에 AD 만들기 시 업데이트
        final_url: "pending", // 임시 값, 나중에 AD 만들기 시 업데이트
        utm_source: null,
        utm_medium: null,
        utm_campaign: null,
        utm_content: null,
        utm_term: null,
      }));

      const { data: insertedChannels, error: channelsError } = await supabase
        .from("campaign_channels")
        .insert(channelInserts as any)
        .select();

      if (channelsError) {
        console.error("Failed to insert selected channels:", channelsError);
        console.error("Channel inserts:", channelInserts);
        console.error("Campaign ID:", campaignId);
        // 매체 저장 실패해도 캠페인 생성은 성공으로 처리
      } else {
        console.log("Successfully inserted channels:", insertedChannels);
      }
    }

    return successResponse(data as StartCampaign, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return dbErrorResponse(message, "DB_INSERT_ERROR");
  }
}

/**
 * GET /api/campaigns
 * Campaign 목록 조회
 */
export async function GET(req: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = await createSupabaseServerClient();

  try {
    // 모든 캠페인 조회 (매체 정보 포함)
    const { data: campaigns, error: campaignsError } = await supabase
      .from("campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    if (campaignsError) {
      return dbErrorResponse(
        campaignsError.message || "캠페인 목록 조회에 실패했습니다.",
        "DB_QUERY_ERROR"
      );
    }

    // 각 캠페인별로 매체 정보 조회
    const campaignsWithChannels = await Promise.all(
      (campaigns || []).map(async (campaign: any) => {
        const { data: channels } = await supabase
          .from("campaign_channels")
          .select("channel_type")
          .eq("campaign_id", campaign.campaign_id);

        return {
          ...campaign,
          channels: (channels || []).map((ch) => ch.channel_type),
        };
      })
    );

    return successResponse(campaignsWithChannels as any);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return dbErrorResponse(message, "DB_QUERY_ERROR");
  }
}
