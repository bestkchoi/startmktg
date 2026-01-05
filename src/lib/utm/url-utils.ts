/**
 * UTM LINK 만들기 페이지용 URL 처리 유틸리티
 */

/**
 * URL에서 UTM 파라미터를 제거한 clean URL 생성
 * 
 * @param url 원본 URL
 * @returns UTM 파라미터가 제거된 URL (나머지 파라미터와 hash는 유지)
 */
export function buildCleanLandingUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // UTM 파라미터 목록
    const utmParams = ['utm_source', 'utm_medium', 'utm_id', 'utm_campaign'];
    
    // 기존 쿼리 파라미터에서 UTM 파라미터만 제거
    const params = new URLSearchParams(urlObj.search);
    utmParams.forEach(param => {
      params.delete(param);
    });
    
    // 새로운 URL 생성
    const cleanUrl = new URL(urlObj.origin + urlObj.pathname);
    if (params.toString()) {
      cleanUrl.search = params.toString();
    }
    if (urlObj.hash) {
      cleanUrl.hash = urlObj.hash;
    }
    
    return cleanUrl.toString();
  } catch (error) {
    // URL 파싱 실패 시 원본 반환
    return url;
  }
}

/**
 * URL에 UTM 파라미터를 병합한 최종 URL 생성
 * 
 * @param url 원본 URL
 * @param utmParams UTM 파라미터 객체
 * @returns UTM 파라미터가 병합된 최종 URL
 */
export function buildFinalUtmUrl(
  url: string,
  utmParams: {
    utm_source: string;
    utm_medium: string;
    utm_id: string;
    utm_campaign: string;
  }
): string {
  try {
    const urlObj = new URL(url);
    
    // 기존 쿼리 파라미터 가져오기
    const params = new URLSearchParams(urlObj.search);
    
    // UTM 파라미터 목록
    const utmKeys = ['utm_source', 'utm_medium', 'utm_id', 'utm_campaign'];
    
    // 기존 UTM 파라미터 제거 (새 값으로 덮어쓰기)
    utmKeys.forEach(key => {
      params.delete(key);
    });
    
    // 새로운 UTM 파라미터 추가
    params.set('utm_source', utmParams.utm_source);
    params.set('utm_medium', utmParams.utm_medium);
    params.set('utm_id', utmParams.utm_id);
    params.set('utm_campaign', utmParams.utm_campaign);
    
    // 새로운 URL 생성
    const finalUrl = new URL(urlObj.origin + urlObj.pathname);
    
    // 쿼리 파라미터 정렬: UTM 파라미터를 먼저, 나머지는 그대로
    const otherParams: string[] = [];
    
    // 모든 파라미터를 순회하면서 분류
    params.forEach((value, key) => {
      if (!utmKeys.includes(key)) {
        otherParams.push(`${key}=${encodeURIComponent(value)}`);
      }
    });
    
    // UTM 파라미터를 먼저 추가
    const utmQuery = utmKeys
      .map(key => `${key}=${encodeURIComponent(params.get(key) || '')}`)
      .join('&');
    
    // 나머지 파라미터 추가
    const allParams = utmQuery + (otherParams.length > 0 ? '&' + otherParams.join('&') : '');
    finalUrl.search = allParams;
    
    // hash 유지
    if (urlObj.hash) {
      finalUrl.hash = urlObj.hash;
    }
    
    return finalUrl.toString();
  } catch (error) {
    // URL 파싱 실패 시 원본 반환
    return url;
  }
}

/**
 * URL 유효성 검사
 * 
 * @param url 검사할 URL
 * @returns 유효하면 true, 아니면 false
 */
export function isValidUrl(url: string): boolean {
  if (!url || url.trim().length === 0) {
    return false;
  }
  
  try {
    const urlObj = new URL(url.trim());
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * 오늘 날짜를 YYMMDD 형식으로 반환 (Asia/Seoul 기준)
 * 
 * @returns YYMMDD 형식의 날짜 문자열
 */
export function getTodayDateString(): string {
  const now = new Date();
  const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
  
  const year = seoulTime.getFullYear().toString().slice(-2);
  const month = (seoulTime.getMonth() + 1).toString().padStart(2, '0');
  const day = seoulTime.getDate().toString().padStart(2, '0');
  
  return `${year}${month}${day}`;
}

/**
 * YYYY-MM-DD 형식의 날짜를 YYMMDD 형식으로 변환
 * 
 * @param dateString YYYY-MM-DD 형식의 날짜 문자열
 * @returns YYMMDD 형식의 날짜 문자열
 */
export function formatDateToYYMMDD(dateString: string): string {
  try {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  } catch {
    return getTodayDateString();
  }
}

