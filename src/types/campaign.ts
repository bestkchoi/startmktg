/**
 * Start Campaign 서비스 타입 정의
 */

export type ChannelType =
  | "meta"
  | "google"
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

export type CreateCampaignRequest = {
  campaign_name: string;
  start_date: string;
  end_date: string;
};

export type CreateChannelRequest = {
  channel_type: ChannelType;
  landing_url: string;
  custom_content?: string;
  custom_term?: string;
};

export type ApiResponse<T> = {
  ok: boolean;
  data?: T;
  code?: string;
  message?: string;
  errors?: Record<string, string>;
};

