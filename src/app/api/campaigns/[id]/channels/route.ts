import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import type { CreateChannelRequest, CampaignChannel } from "@/types/campaign";
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
type CampaignChannelInsert = Database["public"]["Tables"]["campaign_channels"]["Insert"];

export async function POST(
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

  // 캠페인 존재 확인 (PRD 구조: campaign_id 사용)
  const { data: campaign, error: campaignError } = await supabase
    .from("campaigns")
    .select("*")
    .eq("campaign_id", id)
    .single<Campaign>();

  if (campaignError || !campaign) {
    return notFoundResponse("캠페인을 찾을 수 없습니다.");
  }

  // 요청 본문 파싱
  let payload: CreateChannelRequest;
  try {
    payload = await req.json();
  } catch {
    return invalidJsonResponse();
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
    return validationErrorResponse(errors);
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
  // campaign 객체는 raw_name, normalized_name, final_campaign_name을 가지고 있음
  const campaignName = (campaign as any).final_campaign_name || (campaign as any).raw_name || "campaign";
  
  // Meta/Google/Naver 매체의 경우 utm_content 및 광고 이름 자동 생성
  let customContent = payload.custom_content;
  let customTerm = payload.custom_term;
  let metaCampaignName: string | null = null;
  let metaAdsetName: string | null = null;
  let metaAdName: string | null = null;
  let googleCampaignName: string | null = null;
  let googleAdgroupName: string | null = null;
  let googleAdName: string | null = null;
  let naverCampaignName: string | null = null;
  let naverAdgroupName: string | null = null;
  let naverKeywordName: string | null = null;
  
  if (payload.channel_type === "meta") {
    const campaignId = (campaign as any).campaign_id || id;
    
    // utm_campaign과 동일한 형식으로 utm_content 생성 (목표 접미사 포함)
    const goalSuffix = payload.campaign_goal === "awareness" ? "_awa" :
                      payload.campaign_goal === "traffic" ? "_trf" :
                      payload.campaign_goal === "engagement" ? "_eng" :
                      payload.campaign_goal === "leads" ? "_rea" :
                      payload.campaign_goal === "app_promotion" ? "_app" :
                      payload.campaign_goal === "sales" ? "_sal" : "";
    const utmCampaign = `${campaignName}_meta${goalSuffix}`;
    
    // 기존 Meta 채널 조회
    const { data: existingChannels } = await supabase
      .from("campaign_channels")
      .select("utm_campaign, meta_campaign_name, meta_adset_name, meta_ad_name")
      .eq("campaign_id", campaignId)
      .eq("channel_type", "meta");
    
    // 1. 캠페인 이름 생성: {utm_campaign}_cp01
    // 같은 utm_campaign을 가진 기존 채널들에서 cp 번호 확인
    const existingCampaigns = existingChannels?.filter(
      (ch: any) => ch.utm_campaign === utmCampaign && ch.meta_campaign_name
    ) || [];
    
    // meta_campaign_name에서 cp 번호 추출 (예: sm_251204_blackfriday_meta_awa_cp01 -> 01)
    const cpNumbers = existingCampaigns
      .map((ch: any) => {
        const match = ch.meta_campaign_name?.match(/_cp(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextCpNumber = cpNumbers.length > 0 ? Math.max(...cpNumbers) + 1 : 1;
    metaCampaignName = `${utmCampaign}_cp${String(nextCpNumber).padStart(2, "0")}`;
    
    // 2. 광고 세트 이름 생성: {campaign_name}_gr01
    // 같은 meta_campaign_name을 가진 기존 채널들에서 gr 번호 확인
    const existingAdsets = existingChannels?.filter(
      (ch: any) => ch.meta_campaign_name === metaCampaignName && ch.meta_adset_name
    ) || [];
    
    const grNumbers = existingAdsets
      .map((ch: any) => {
        const match = ch.meta_adset_name?.match(/_gr(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextGrNumber = grNumbers.length > 0 ? Math.max(...grNumbers) + 1 : 1;
    metaAdsetName = `${metaCampaignName}_gr${String(nextGrNumber).padStart(2, "0")}`;
    
    // 3. 광고 이름 생성: {adset_name}_ad01
    // 같은 meta_adset_name을 가진 기존 채널들에서 ad 번호 확인
    const existingAds = existingChannels?.filter(
      (ch: any) => ch.meta_adset_name === metaAdsetName && ch.meta_ad_name
    ) || [];
    
    const adNumbers = existingAds
      .map((ch: any) => {
        const match = ch.meta_ad_name?.match(/_ad(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextAdNumber = adNumbers.length > 0 ? Math.max(...adNumbers) + 1 : 1;
    metaAdName = `${metaAdsetName}_ad${String(nextAdNumber).padStart(2, "0")}`;
    
    // UTM 파라미터 타입에 따라 처리
    if (payload.utm_param_type === "dynamic") {
      // URL 다이내믹 매개변수 방식
      customContent = "{{ad.id}}";
    } else {
      // 표준 방식: utm_content는 기존 로직 유지 (모든 Meta 광고 개수 기반)
      const baseCampaignPattern = `${campaignName}_meta`;
      const metaChannels = existingChannels?.filter(
        (ch: any) => ch.utm_campaign && ch.utm_campaign.startsWith(baseCampaignPattern)
      ) || [];
      
      const adNumber = metaChannels.length + 1;
      customContent = `${utmCampaign}_ad${String(adNumber).padStart(2, "0")}`;
    }
  } else if (payload.channel_type === "google") {
    const campaignId = (campaign as any).campaign_id || id;
    const utmCampaign = `${campaignName}_google`;
    
    // 기존 Google 채널 조회
    const { data: existingChannels } = await supabase
      .from("campaign_channels")
      .select("utm_campaign, google_campaign_name, google_adgroup_name, google_ad_name")
      .eq("campaign_id", campaignId)
      .eq("channel_type", "google");
    
    // 1. 캠페인 이름 생성: {utm_campaign}_cp01
    const existingCampaigns = existingChannels?.filter(
      (ch: any) => ch.utm_campaign === utmCampaign && ch.google_campaign_name
    ) || [];
    
    const cpNumbers = existingCampaigns
      .map((ch: any) => {
        const match = ch.google_campaign_name?.match(/_cp(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextCpNumber = cpNumbers.length > 0 ? Math.max(...cpNumbers) + 1 : 1;
    googleCampaignName = `${utmCampaign}_cp${String(nextCpNumber).padStart(2, "0")}`;
    
    // 2. 광고 그룹 이름 생성: {campaign_name}_ag01
    const existingAdgroups = existingChannels?.filter(
      (ch: any) => ch.google_campaign_name === googleCampaignName && ch.google_adgroup_name
    ) || [];
    
    const agNumbers = existingAdgroups
      .map((ch: any) => {
        const match = ch.google_adgroup_name?.match(/_ag(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextAgNumber = agNumbers.length > 0 ? Math.max(...agNumbers) + 1 : 1;
    googleAdgroupName = `${googleCampaignName}_ag${String(nextAgNumber).padStart(2, "0")}`;
    
    // 3. 광고 이름 생성: {adgroup_name}_ad01
    const existingAds = existingChannels?.filter(
      (ch: any) => ch.google_adgroup_name === googleAdgroupName && ch.google_ad_name
    ) || [];
    
    const adNumbers = existingAds
      .map((ch: any) => {
        const match = ch.google_ad_name?.match(/_ad(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextAdNumber = adNumbers.length > 0 ? Math.max(...adNumbers) + 1 : 1;
    googleAdName = `${googleAdgroupName}_ad${String(nextAdNumber).padStart(2, "0")}`;
    
    // utm_content는 광고 이름 사용
    customContent = googleAdName;
  } else if (payload.channel_type === "naver") {
    const campaignId = (campaign as any).campaign_id || id;
    const utmCampaign = `${campaignName}_naver`;
    
    // 기존 Naver 채널 조회
    const { data: existingChannels } = await supabase
      .from("campaign_channels")
      .select("utm_campaign, utm_content, utm_term")
      .eq("campaign_id", campaignId)
      .eq("channel_type", "naver");
    
    // 1. 캠페인 이름 생성: {utm_campaign} (Naver Search는 검색 광고이므로 _cp01 자동 추가하지 않음, 30자 제한)
    naverCampaignName = utmCampaign;
    if (naverCampaignName.length > 30) {
      naverCampaignName = naverCampaignName.substring(0, 30);
    }
    
    // 2. 광고 그룹 이름 생성: {campaign_name}_ag01 (30자 제한)
    const existingAdgroups = existingChannels?.filter(
      (ch: any) => ch.utm_campaign === naverCampaignName
    ) || [];
    
    const agNumbers = existingAdgroups
      .map((ch: any) => {
        const match = ch.utm_content?.match(/_ag(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextAgNumber = agNumbers.length > 0 ? Math.max(...agNumbers) + 1 : 1;
    naverAdgroupName = `${naverCampaignName}_ag${String(nextAgNumber).padStart(2, "0")}`;
    // 30자 제한
    if (naverAdgroupName.length > 30) {
      naverAdgroupName = naverAdgroupName.substring(0, 30);
    }
    
    // 3. 키워드 이름 생성: {adgroup_name}_kw01 (30자 제한)
    const existingKeywords = existingChannels?.filter(
      (ch: any) => ch.utm_content === naverAdgroupName
    ) || [];
    
    const kwNumbers = existingKeywords
      .map((ch: any) => {
        const match = ch.utm_term?.match(/_kw(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((num: number) => num > 0);
    
    const nextKwNumber = kwNumbers.length > 0 ? Math.max(...kwNumbers) + 1 : 1;
    naverKeywordName = `${naverAdgroupName}_kw${String(nextKwNumber).padStart(2, "0")}`;
    // 30자 제한
    if (naverKeywordName.length > 30) {
      naverKeywordName = naverKeywordName.substring(0, 30);
    }
    
    // utm_content는 광고 그룹 이름 사용, utm_term은 키워드 이름 사용
    customContent = naverAdgroupName;
    customTerm = naverKeywordName;
  }
  
  const utmParams = generateUtmParams(
    template,
    {
      campaign_name: campaignName,
      channel_type: payload.channel_type as any,
      campaign_goal: payload.channel_type === "meta" ? payload.campaign_goal : undefined,
    },
    customContent,
    payload.channel_type === "meta" ? undefined : customTerm // Meta는 custom_term 사용 안 함, Naver는 자동 생성된 customTerm 사용
  );
  
  // Meta 매체이고 URL 다이내믹 매개변수 방식을 선택한 경우 UTM 파라미터 수정
  if (payload.channel_type === "meta" && payload.utm_param_type === "dynamic") {
    utmParams.utm_campaign = "{{adset.id}}";
    utmParams.utm_content = "{{ad.id}}";
    utmParams.utm_id = "{{campaign.id}}";
    utmParams.utm_source_platform = "{{placement}}";
  }
  
  // Google 매체인 경우 UTM 파라미터 수정
  if (payload.channel_type === "google" && googleAdgroupName && googleAdName) {
    utmParams.utm_campaign = googleAdgroupName;
    utmParams.utm_content = googleAdName;
  }
  
  // Naver 매체인 경우 UTM 파라미터 수정
  if (payload.channel_type === "naver" && naverCampaignName && naverAdgroupName && naverKeywordName) {
    utmParams.utm_campaign = naverCampaignName;
    utmParams.utm_content = naverAdgroupName;
    utmParams.utm_term = naverKeywordName;
  }

  // 최종 URL 생성
  const finalUrl = buildFinalUrl(payload.landing_url, utmParams);

  // 매체 저장
  try {
    const campaignId = (campaign as any).campaign_id || id;
    const insertData: any = {
      campaign_id: campaignId,
      channel_type: payload.channel_type,
      landing_url: payload.landing_url,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_content: utmParams.utm_content || null,
      utm_term: utmParams.utm_term || null,
      final_url: finalUrl,
    };
    
    // Meta 매체인 경우에만 Meta 광고 이름 필드 추가
    if (payload.channel_type === "meta") {
      insertData.meta_campaign_name = metaCampaignName;
      insertData.meta_adset_name = metaAdsetName;
      insertData.meta_ad_name = metaAdName;
    }
    
    // Google 매체인 경우에만 Google 광고 이름 필드 추가
    if (payload.channel_type === "google") {
      insertData.google_campaign_name = googleCampaignName;
      insertData.google_adgroup_name = googleAdgroupName;
      insertData.google_ad_name = googleAdName;
    }
    
    if (payload.channel_type === "naver") {
      // Naver 광고 이름은 UTM 파라미터에 저장되므로 별도 컬럼 불필요
      // 필요시 나중에 추가 가능
    }
    
    const { data, error } = await supabase
      .from("campaign_channels")
      .insert(insertData)
      .select()
      .single();

    if (error || !data) {
      return dbErrorResponse(
        error?.message || "매체 생성에 실패했습니다.",
        "DB_INSERT_ERROR"
      );
    }

    return successResponse(data as CampaignChannel, 201);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";
    return dbErrorResponse(message, "DB_INSERT_ERROR");
  }
}
