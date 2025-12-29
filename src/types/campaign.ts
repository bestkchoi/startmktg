/**
 * Start Campaign 서비스 타입 정의
 */

export type ChannelType =
  | "meta"
  | "google"
  | "naver"
  | "kakao"
  | "crm_sms"
  | "crm_lms"
  | "crm_kakao"
  | "tiktok"
  | "other";

export type Campaign = {
  id: string;
  campaign_name: string;
  start_date: string;
  end_date: string;
  user_id: string;
  created_at: string;
  updated_at: string;
};

export type CampaignChannel = {
  id: string;
  campaign_id: string;
  channel_type: ChannelType;
  landing_url: string;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  final_url: string;
  meta_campaign_name: string | null;
  meta_adset_name: string | null;
  meta_ad_name: string | null;
  google_campaign_name: string | null;
  google_adgroup_name: string | null;
  google_ad_name: string | null;
  created_at: string;
  updated_at: string;
};

export type UtmTemplate = {
  id: string;
  channel_type: ChannelType;
  utm_source_pattern: string | null;
  utm_medium_pattern: string | null;
  utm_campaign_pattern: string | null;
  utm_content_pattern: string | null;
  utm_term_pattern: string | null;
  updated_at: string;
};

export type CampaignWithChannels = Campaign & {
  channels: CampaignChannel[];
};

// 기존 타입 (하위 호환성 유지)
export type CreateCampaignRequest = {
  campaign_name: string;
  start_date: string;
	end_date?: string;
};

// PRD v1.1 기반 Start Campaign 타입
export type StartCampaign = {
  campaign_id: string;
  raw_name: string;
  normalized_name: string;
  final_campaign_name: string;
  start_date: string;
  end_date: string | null;
  brand_id: string | null;
  creator_user_id: string | null;
  user_id?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateStartCampaignRequest = {
  raw_name: string;
  start_date: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD, 선택값
  brand_id?: string; // 선택값, 없으면 user_id 사용
  normalized_name?: string; // 선택값, 없으면 자동 생성
  selected_channels?: ChannelType[]; // 선택한 매체 목록
  description?: string; // 캠페인 설명 (한글 원본 등)
  search_ad_type?: "brand" | "non_brand" | null; // 검색광고 유형 (브랜드/논브랜드)
};

export type UpdateStartCampaignRequest = {
  raw_name?: string;
  start_date?: string; // YYYY-MM-DD
  end_date?: string | null; // YYYY-MM-DD
};

export type MetaCampaignGoal =
  | "awareness"
  | "traffic"
  | "engagement"
  | "leads"
  | "app_promotion"
  | "sales";

export type GoogleCampaignGoal =
  | "sales"
  | "leads"
  | "traffic"
  | "app_promotion"
  | "awareness"
  | "store_visits"
  | "no_guidance";

export type NaverCampaignType =
  | "powerlink"
  | "shopping_search"
  | "power_content"
  | "brand_search"
  | "place";

export type CreateChannelRequest = {
  channel_type: ChannelType;
  landing_url: string;
  custom_content?: string;
  custom_term?: string;
  campaign_goal?: MetaCampaignGoal | GoogleCampaignGoal; // Meta/Google 매체 전용
  utm_param_type?: "standard" | "dynamic"; // Meta 매체 전용: UTM 파라미터 타입
  campaign_type?: NaverCampaignType; // Naver 매체 전용: 캠페인 유형
};

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
  errors?: Record<string, string>;
};





