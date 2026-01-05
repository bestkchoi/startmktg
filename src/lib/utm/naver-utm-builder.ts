/**
 * 네이버 검색광고용 UTM 파라미터 및 URL 생성 유틸리티
 */

/**
 * 네이버 검색광고용 UTM 파라미터 생성
 */
export function buildNaverUtmParams(
  campaignName: string,
  adGroupName: string,
  utmTerm: string = "{query}"
): {
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_content: string;
  utm_term: string;
} {
  return {
    utm_source: "naver",
    utm_medium: "cpc",
    utm_campaign: campaignName,
    utm_content: adGroupName,
    utm_term: utmTerm,
  };
}

/**
 * 네이버용 Final UTM URL 생성
 * utm_term은 인코딩하지 않고 그대로 유지
 */
export function buildNaverFinalUtmUrl(
  cleanLandingUrl: string,
  utmParams: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
  }
): string {
  try {
    const urlObj = new URL(cleanLandingUrl);
    
    // 기존 쿼리 파라미터 가져오기
    const existingParams = new URLSearchParams(urlObj.search);
    
    // UTM 파라미터 목록
    const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
    
    // 기존 UTM 파라미터 제거
    utmKeys.forEach(key => {
      existingParams.delete(key);
    });
    
    // 새로운 URL 생성
    const finalUrl = new URL(urlObj.origin + urlObj.pathname);
    
    // UTM 파라미터를 먼저 추가 (인코딩 처리)
    const utmParamsArray: string[] = [];
    utmParamsArray.push(`utm_source=${encodeURIComponent(utmParams.utm_source)}`);
    utmParamsArray.push(`utm_medium=${encodeURIComponent(utmParams.utm_medium)}`);
    utmParamsArray.push(`utm_campaign=${encodeURIComponent(utmParams.utm_campaign)}`);
    utmParamsArray.push(`utm_content=${encodeURIComponent(utmParams.utm_content)}`);
    // utm_term은 인코딩하지 않고 그대로 유지
    utmParamsArray.push(`utm_term=${utmParams.utm_term}`);
    
    // 기존 파라미터 추가
    const otherParams: string[] = [];
    existingParams.forEach((value, key) => {
      otherParams.push(`${key}=${encodeURIComponent(value)}`);
    });
    
    // 모든 파라미터 결합
    const allParams = [...utmParamsArray, ...otherParams].join('&');
    finalUrl.search = allParams;
    
    // hash 유지
    if (urlObj.hash) {
      finalUrl.hash = urlObj.hash;
    }
    
    return finalUrl.toString();
  } catch (error) {
    // URL 파싱 실패 시 원본 반환
    return cleanLandingUrl;
  }
}

