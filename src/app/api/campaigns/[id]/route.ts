import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import type { CampaignWithChannels, StartCampaign, UpdateStartCampaignRequest } from "@/types/campaign";
import { normalizeCampaignName, buildFinalCampaignName } from "@/lib/campaign/campaign-name";
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

type CampaignRow = Database["public"]["Tables"]["campaigns"]["Row"];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = await createSupabaseServerClient();

  const { id } = await params;

  // 캠페인 조회 (PRD 구조: campaign_id 사용)
  try {
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("campaign_id", id)
      .single();

    if (campaignError || !campaign) {
      return notFoundResponse("캠페인을 찾을 수 없습니다.");
    }

    // 매체 리스트 조회
    const { data: channels, error: channelsError } = await supabase
      .from("campaign_channels")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });

    if (channelsError) {
      console.error("Failed to fetch channels:", channelsError);
    }

    const result: CampaignWithChannels = {
      ...(campaign as any), // PRD 구조를 기존 타입에 맞게 변환 필요 시
      channels: (channels || []) as CampaignWithChannels["channels"],
    };

    return successResponse(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return dbErrorResponse(message, "DB_QUERY_ERROR");
  }
}

/**
 * PATCH /api/campaigns/[id]
 * Campaign 수정 (PRD v1.1)
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = await createSupabaseServerClient();

  const { id } = await params;

  // 기존 캠페인 조회
  const { data: existingCampaign, error: fetchError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("campaign_id", id)
    .single<CampaignRow>();

  if (fetchError || !existingCampaign) {
    return notFoundResponse("캠페인을 찾을 수 없습니다.");
  }

  // 요청 본문 파싱
  let payload: UpdateStartCampaignRequest;
  try {
    payload = await req.json();
  } catch {
    return invalidJsonResponse();
  }

  // 업데이트할 필드가 없으면 에러
  if (!payload.raw_name && !payload.start_date && payload.end_date === undefined) {
    return validationErrorResponse({
      general: "수정할 필드를 지정해주세요.",
    });
  }

  // 검증
  const errors: Record<string, string> = {};

  if (payload.raw_name !== undefined) {
    if (typeof payload.raw_name !== "string" || payload.raw_name.trim().length === 0) {
      errors.raw_name = "캠페인명은 필수입니다.";
    }
  }

  if (payload.start_date !== undefined) {
    if (typeof payload.start_date !== "string") {
      errors.start_date = "시작일은 필수입니다.";
    } else {
      const startDate = new Date(payload.start_date);
      if (isNaN(startDate.getTime())) {
        errors.start_date = "유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.";
      }
    }
  }

  if (payload.end_date !== undefined && payload.end_date !== null && payload.end_date !== "") {
    if (typeof payload.end_date !== "string") {
      errors.end_date = "유효한 날짜 형식이 아닙니다.";
    } else {
      const endDate = new Date(payload.end_date);
      if (isNaN(endDate.getTime())) {
        errors.end_date = "유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.";
      } else {
        const startDate = new Date(payload.start_date || existingCampaign.start_date);
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
    // 업데이트할 값 계산
    const campaignData = existingCampaign as any;
    const newRawName = payload.raw_name !== undefined 
      ? payload.raw_name.trim() 
      : (campaignData.raw_name || campaignData.campaign_name || "");
    const newStartDate = payload.start_date || existingCampaign.start_date;

    // rawName 또는 startDate가 변경되면 normalizedName과 finalCampaignName 재생성
    let newNormalizedName = campaignData.normalized_name || "";
    let newFinalCampaignName = campaignData.final_campaign_name || "";

    if (payload.raw_name !== undefined || payload.start_date !== undefined) {
      newNormalizedName = normalizeCampaignName(newRawName);
      newFinalCampaignName = buildFinalCampaignName(newStartDate, newNormalizedName);
    }

    // 중복 체크: finalCampaignName이 변경되었고, 동일 brandId 내에서 중복인지 확인
    if (newFinalCampaignName !== campaignData.final_campaign_name) {
      const brandId = campaignData.brand_id || null;
      let duplicateCampaign = null;
      let checkError = null;
      
      if (brandId) {
        const result = await supabase
          .from("campaigns")
          .select("campaign_id")
          .eq("brand_id", brandId)
          .eq("final_campaign_name", newFinalCampaignName)
          .neq("campaign_id", id)
          .single();
        duplicateCampaign = result.data;
        checkError = result.error;
      } else {
        const result = await supabase
          .from("campaigns")
          .select("campaign_id")
          .is("brand_id", null)
          .eq("final_campaign_name", newFinalCampaignName)
          .neq("campaign_id", id)
          .single();
        duplicateCampaign = result.data;
        checkError = result.error;
      }

      if (checkError && checkError.code !== "PGRST116") {
        return dbErrorResponse("중복 체크 중 오류가 발생했습니다.", "DB_QUERY_ERROR");
      }

      if (duplicateCampaign) {
        return respond(
          {
            ok: false,
            code: "DUPLICATE_CAMPAIGN",
            message: "이미 사용 중인 캠페인명입니다.",
            errors: {
              final_campaign_name: `"${newFinalCampaignName}"은(는) 이미 존재합니다.`,
            },
          },
          { status: 409 }
        );
      }
    }

    // 캠페인 업데이트
    const updateData: Record<string, any> = {
      raw_name: newRawName,
      normalized_name: newNormalizedName,
      final_campaign_name: newFinalCampaignName,
      start_date: newStartDate,
    };

    if (payload.end_date !== undefined) {
      updateData.end_date = payload.end_date && payload.end_date.length > 0 ? payload.end_date : null;
    }

    const { data, error } = await supabase
      .from("campaigns")
      // @ts-ignore - Supabase 타입 정의가 실제 스키마와 다름
      .update(updateData)
      .eq("campaign_id", id)
      .select()
      .single();

    if (error || !data) {
      return dbErrorResponse(
        error?.message || "캠페인 수정에 실패했습니다.",
        "DB_UPDATE_ERROR"
      );
    }

    return successResponse(data as StartCampaign);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return dbErrorResponse(message, "DB_UPDATE_ERROR");
  }
}
