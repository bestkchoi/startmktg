/**
 * UTM 템플릿 처리 유틸리티
 * Mustache 스타일 변수를 실제 값으로 치환하고 UTM 파라미터를 생성합니다.
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

export type UtmTemplate = {
  channel_type: ChannelType;
  utm_source_pattern?: string | null;
  utm_medium_pattern?: string | null;
  utm_campaign_pattern?: string | null;
  utm_content_pattern?: string | null;
  utm_term_pattern?: string | null;
};

export type UtmParams = {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
};

export type TemplateVariables = {
  campaign_name: string;
  channel_type: ChannelType;
  adgroup_name?: string;
  creative_id?: string;
};

/**
 * 템플릿 변수를 실제 값으로 치환
 */
function replaceTemplateVariables(
  pattern: string | null | undefined,
  variables: TemplateVariables
): string {
  if (!pattern) {
    return "";
  }

  let result = pattern;
  result = result.replace(/\{\{campaign_name\}\}/g, variables.campaign_name);
  result = result.replace(/\{\{channel_type\}\}/g, variables.channel_type);
  result = result.replace(
    /\{\{adgroup_name\}\}/g,
    variables.adgroup_name || ""
  );
  result = result.replace(/\{\{creative_id\}\}/g, variables.creative_id || "");

  return result.trim();
}

/**
 * 기본 UTM 규칙 적용 (템플릿이 없을 때)
 */
function getDefaultUtmParams(
  channelType: ChannelType,
  campaignName: string,
  customContent?: string,
  customTerm?: string
): UtmParams {
  const normalizedCampaignName = campaignName
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");

  return {
    utm_source: channelType.toLowerCase(),
    utm_medium: channelType.toLowerCase(),
    utm_campaign: normalizedCampaignName,
    utm_content: customContent || "",
    utm_term: customTerm || "",
  };
}

/**
 * 템플릿을 사용하여 UTM 파라미터 생성
 */
export function generateUtmParams(
  template: UtmTemplate | null,
  variables: TemplateVariables,
  customContent?: string,
  customTerm?: string
): UtmParams {
  // 템플릿이 없으면 기본 규칙 사용
  if (!template) {
    return getDefaultUtmParams(
      variables.channel_type,
      variables.campaign_name,
      customContent,
      customTerm
    );
  }

  // 템플릿 패턴 적용
  const utm_source = replaceTemplateVariables(
    template.utm_source_pattern,
    variables
  );
  const utm_medium = replaceTemplateVariables(
    template.utm_medium_pattern,
    variables
  );
  const utm_campaign = replaceTemplateVariables(
    template.utm_campaign_pattern,
    variables
  );
  let utm_content = replaceTemplateVariables(
    template.utm_content_pattern,
    variables
  );
  let utm_term = replaceTemplateVariables(template.utm_term_pattern, variables);

  // 사용자 입력값이 있으면 덮어쓰기
  if (customContent) {
    utm_content = customContent;
  }
  if (customTerm) {
    utm_term = customTerm;
  }

  // 빈 값이면 기본 규칙 사용
  const source = utm_source || variables.channel_type.toLowerCase();
  const medium = utm_medium || variables.channel_type.toLowerCase();
  const campaign = utm_campaign || variables.campaign_name.toLowerCase().replace(/\s+/g, "_");

  return {
    utm_source: source,
    utm_medium: medium,
    utm_campaign: campaign,
    utm_content: utm_content || "",
    utm_term: utm_term || "",
  };
}

/**
 * UTM 파라미터를 URL에 추가하여 최종 URL 생성
 */
export function buildFinalUrl(landingUrl: string, params: UtmParams): string {
  try {
    const url = new URL(landingUrl);
    const searchParams = new URLSearchParams();

    // UTM 파라미터 추가 (빈 값 제외)
    if (params.utm_source) {
      searchParams.set("utm_source", params.utm_source);
    }
    if (params.utm_medium) {
      searchParams.set("utm_medium", params.utm_medium);
    }
    if (params.utm_campaign) {
      searchParams.set("utm_campaign", params.utm_campaign);
    }
    if (params.utm_content) {
      searchParams.set("utm_content", params.utm_content);
    }
    if (params.utm_term) {
      searchParams.set("utm_term", params.utm_term);
    }

    // 파라미터를 알파벳 순서로 정렬
    const sortedParams = new URLSearchParams();
    Array.from(searchParams.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, value]) => {
        sortedParams.set(key, value);
      });

    url.search = sortedParams.toString();
    return url.toString();
  } catch (error) {
    // URL 파싱 실패 시 원본 반환
    console.error("Failed to build final URL:", error);
    return landingUrl;
  }
}

