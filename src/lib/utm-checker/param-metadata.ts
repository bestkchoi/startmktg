/**
 * 파라미터별 메타데이터 정의
 * 마케팅 초보자가 이해하기 쉽도록 dimension과 수집도구 정보 제공
 */

export type ParamMetadata = {
  dimension: string; // 매체사에서 정의한 dimension 이름
  tool: string; // 수집도구
  description?: string; // 간단한 설명
};

export const PARAM_METADATA: Record<string, ParamMetadata> = {
  // UTM 기본 파라미터 (GA4)
  utm_source: {
    dimension: "세션 소스",
    tool: "Google Analytics",
    description: "트래픽이 어디서 왔는지 (예: google, naver, facebook)",
  },
  utm_medium: {
    dimension: "세션 매체",
    tool: "Google Analytics",
    description: "마케팅 매체 유형 (예: cpc, email, social)",
  },
  utm_campaign: {
    dimension: "세션 캠페인",
    tool: "Google Analytics",
    description: "캠페인 이름 (예: spring_sale_2025)",
  },
  utm_id: {
    dimension: "캠페인 ID",
    tool: "Google Analytics",
    description: "캠페인의 고유 식별자",
  },
  utm_content: {
    dimension: "콘텐츠",
    tool: "Google Analytics",
    description: "같은 광고의 다른 버전 구분 (예: banner_a, banner_b)",
  },
  utm_term: {
    dimension: "검색어",
    tool: "Google Analytics",
    description: "유료 검색 광고의 키워드",
  },

  // Google Ads
  gclid: {
    dimension: "Google 클릭 ID",
    tool: "Google Ads",
    description: "Google Ads 클릭 추적 식별자",
  },
  srsltid: {
    dimension: "Google 검색 결과 ID",
    tool: "Google Ads",
    description: "Google 검색 결과 추적 식별자",
  },

  // Meta Ads
  fbclid: {
    dimension: "Facebook 클릭 ID",
    tool: "Meta (Facebook)",
    description: "Facebook/Meta 광고 클릭 추적 식별자",
  },

  // TikTok Ads
  ttclid: {
    dimension: "TikTok 클릭 ID",
    tool: "TikTok Ads",
    description: "TikTok 광고 클릭 추적 식별자",
  },

  // Naver Ads (파워링크)
  n_campaign_type: {
    dimension: "캠페인 유형",
    tool: "Naver Ads",
    description: "캠페인 유형 (1: 파워링크, 2: 쇼핑검색 등)",
  },
  n_campaign: {
    dimension: "캠페인 ID",
    tool: "Naver Ads",
    description: "네이버 캠페인의 고유 식별자",
  },
  n_ad_group: {
    dimension: "광고 그룹 ID",
    tool: "Naver Ads",
    description: "광고 그룹의 고유 식별자",
  },
  n_media: {
    dimension: "매체 ID",
    tool: "Naver Ads",
    description: "광고가 노출되는 매체 식별자",
  },
  n_ad: {
    dimension: "소재 ID",
    tool: "Naver Ads",
    description: "광고 소재의 고유 식별자",
  },
  n_ad_extension: {
    dimension: "확장 소재 ID",
    tool: "Naver Ads",
    description: "확장 소재의 고유 식별자",
  },
  n_keyword: {
    dimension: "키워드",
    tool: "Naver Ads",
    description: "광고 시스템에 등록된 키워드",
  },
  n_keyword_id: {
    dimension: "키워드 ID",
    tool: "Naver Ads",
    description: "키워드의 고유 식별자",
  },
  n_query: {
    dimension: "검색어",
    tool: "Naver Ads",
    description: "사용자가 실제로 검색한 검색어",
  },
  n_match: {
    dimension: "매치 방식",
    tool: "Naver Ads",
    description: "키워드 매칭 방식 (1: 일치, 2: 확장, 3: 연관검색 등)",
  },
  n_network: {
    dimension: "매체 유형",
    tool: "Naver Ads",
    description: "검색 지면 또는 콘텐츠 지면 (search/contents)",
  },
  n_rank: {
    dimension: "광고 순위",
    tool: "Naver Ads",
    description: "광고 영역에서의 노출 순위",
  },
  n_ad_group_type: {
    dimension: "광고 그룹 유형",
    tool: "Naver Ads",
    description: "광고 그룹 유형 (2: 쇼핑검색-상품형, 5: 브랜드 검색 등)",
  },
  n_source: {
    dimension: "소스",
    tool: "Naver Ads",
    description: "트래픽 소스",
  },
  n_contract: {
    dimension: "계약 ID",
    tool: "Naver Ads",
    description: "네이버 광고 계약의 고유 식별자",
  },

  // Kakao Ads
  k_campaign: {
    dimension: "캠페인 ID",
    tool: "Kakao Ads",
    description: "카카오 캠페인의 고유 식별자",
  },
  k_media: {
    dimension: "매체 ID",
    tool: "Kakao Ads",
    description: "카카오 매체 식별자",
  },
  k_keyword: {
    dimension: "키워드",
    tool: "Kakao Ads",
    description: "카카오 광고 키워드",
  },
};

/**
 * 파라미터 키로부터 메타데이터를 가져옵니다.
 */
export function getParamMetadata(key: string): ParamMetadata {
  return (
    PARAM_METADATA[key] || {
      dimension: "-",
      tool: "기타",
      description: "알 수 없는 파라미터",
    }
  );
}

