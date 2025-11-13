/**
 * UTM 템플릿 처리 유틸리티
 * Mustache 스타일 변수를 사용하여 UTM 파라미터를 생성합니다.
 */

export type TemplateVariables = {
  campaign_name: string;
  channel_type: string;
  adgroup_name?: string;
  creative_id?: string;
};

export type UtmTemplate = {
  utm_source_pattern?: string | null;
  utm_medium_pattern?: string | null;
  utm_campaign_pattern?: string | null;
  utm_content_pattern?: string | null;
  utm_term_pattern?: string | null;
};

/**
 * Mustache 변수를 실제 값으로 치환
 */
function replaceVariables(
  pattern: string | null | undefined,
  variables: TemplateVariables
): string {
  if (!pattern) {
    return "";
  }

  let result = pattern;

  // {{campaign_name}} 치환
  result = result.replace(/\{\{campaign_name\}\}/g, variables.campaign_name);

  // {{channel_type}} 치환
  result = result.replace(/\{\{channel_type\}\}/g, variables.channel_type);

  // {{adgroup_name}} 치환 (선택적)
  if (variables.adgroup_name) {
    result = result.replace(/\{\{adgroup_name\}\}/g, variables.adgroup_name);
  }

  // {{creative_id}} 치환 (선택적)
  if (variables.creative_id) {
    result = result.replace(/\{\{creative_id\}\}/g, variables.creative_id);
  }

  return result.trim();
}

/**
 * 템플릿이 없을 때 기본 규칙 적용
 */
function getDefaultUtmParams(
  channelType: string,
  campaignName: string,
  customContent?: string,
  customTerm?: string
) {
  return {
    utm_source: channelType.toLowerCase(),
    utm_medium: channelType.toLowerCase(),
    utm_campaign: campaignName.toLowerCase().replace(/\s+/g, "_"),
    utm_content: customContent || "",
    utm_term: customTerm || "",
  };
}

/**
 * UTM 파라미터 생성
 */
export function generateUtmParams(
  template: UtmTemplate | null,
  variables: TemplateVariables,
  customContent?: string,
  customTerm?: string
) {
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
  const utm_source = replaceVariables(
    template.utm_source_pattern,
    variables
  ) || variables.channel_type.toLowerCase();

  const utm_medium = replaceVariables(
    template.utm_medium_pattern,
    variables
  ) || variables.channel_type.toLowerCase();

  const utm_campaign = replaceVariables(
    template.utm_campaign_pattern,
    variables
  ) || variables.campaign_name.toLowerCase().replace(/\s+/g, "_");

  let utm_content = replaceVariables(
    template.utm_content_pattern,
    variables
  );
  // 사용자 입력값이 있으면 덮어쓰기
  if (customContent) {
    utm_content = customContent;
  }

  let utm_term = replaceVariables(template.utm_term_pattern, variables);
  // 사용자 입력값이 있으면 덮어쓰기
  if (customTerm) {
    utm_term = customTerm;
  }

  return {
    utm_source: utm_source || variables.channel_type.toLowerCase(),
    utm_medium: utm_medium || variables.channel_type.toLowerCase(),
    utm_campaign: utm_campaign || variables.campaign_name.toLowerCase().replace(/\s+/g, "_"),
    utm_content: utm_content || "",
    utm_term: utm_term || "",
  };
}

/**
 * 최종 URL 생성
 */
export function buildFinalUrl(
  landingUrl: string,
  utmParams: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
  }
): string {
  const url = new URL(landingUrl);
  const params = new URLSearchParams();

  // 빈 값이 아닌 파라미터만 추가
  if (utmParams.utm_source) {
    params.set("utm_source", utmParams.utm_source);
  }
  if (utmParams.utm_medium) {
    params.set("utm_medium", utmParams.utm_medium);
  }
  if (utmParams.utm_campaign) {
    params.set("utm_campaign", utmParams.utm_campaign);
  }
  if (utmParams.utm_content) {
    params.set("utm_content", utmParams.utm_content);
  }
  if (utmParams.utm_term) {
    params.set("utm_term", utmParams.utm_term);
  }

  // 알파벳 순서로 정렬
  const sortedParams = new URLSearchParams();
  Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([key, value]) => {
      sortedParams.set(key, value);
    });

  const queryString = sortedParams.toString();
  url.search = queryString ? `?${queryString}` : "";

  return url.toString();
}

