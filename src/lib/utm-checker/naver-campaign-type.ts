/**
 * 네이버 검색광고 캠페인 유형 매핑
 * n_campaign_type 값에 따른 광고 상품명 반환
 */

export function getNaverCampaignProductName(campaignType: string | undefined): string | null {
  if (!campaignType) return null;

  const typeMap: Record<string, string> = {
    "1": "네이버 파워링크",
    "2": "네이버 쇼핑검색",
    "4": "네이버 브랜드검색",
  };

  return typeMap[campaignType] || null;
}

/**
 * 파싱된 파라미터에서 n_campaign_type을 찾아 광고 상품명을 반환
 */
export function getAdProductFromParams(parsed: Record<string, string>): string | null {
  return getNaverCampaignProductName(parsed.n_campaign_type);
}

/**
 * 네이버 검색광고 광고 그룹 유형 매핑
 * n_ad_group_type 값에 따른 광고 그룹 유형명 반환
 */
export function getNaverAdGroupTypeName(adGroupType: string | undefined): string | null {
  if (!adGroupType) return null;

  const typeMap: Record<string, string> = {
    "1": "파워링크",
    "2": "쇼핑 검색-상품형",
    "5": "브랜드 검색-일반형",
    "7": "카탈로그형",
    "8": "브랜드존형",
    "9": "쇼핑 브랜드형",
  };

  return typeMap[adGroupType] || null;
}

/**
 * 파싱된 파라미터에서 n_ad_group_type을 찾아 광고 그룹 유형명을 반환
 */
export function getAdGroupTypeFromParams(parsed: Record<string, string>): string | null {
  return getNaverAdGroupTypeName(parsed.n_ad_group_type);
}

