/**
 * URL 파싱 유틸리티
 * 
 * 사용자가 입력한 원본 URL에서 필요한 정보를 추출
 */

export type ParsedUrlInfo = {
  landing_domain: string;
  landing_path: string;
  landing_query_has_params: boolean;
  landing_hash_present: boolean;
};

/**
 * URL에서 필요한 정보 추출
 * 
 * @param url 원본 URL (사용자 입력값)
 * @returns 파싱된 URL 정보
 * @throws Error URL 파싱 실패 시
 */
export function parseLandingUrl(url: string): ParsedUrlInfo {
  if (!url || url.trim().length === 0) {
    throw new Error('URL은 필수입니다.');
  }

  try {
    const urlObj = new URL(url.trim());

    // landing_domain: hostname
    const landing_domain = urlObj.hostname;

    // landing_path: pathname (빈 경우 '/' 사용)
    const landing_path = urlObj.pathname || '/';

    // landing_query_has_params: search가 있으면 true
    const landing_query_has_params = urlObj.search.length > 0;

    // landing_hash_present: hash가 있으면 true
    const landing_hash_present = urlObj.hash.length > 0;

    return {
      landing_domain,
      landing_path,
      landing_query_has_params,
      landing_hash_present,
    };
  } catch (error) {
    throw new Error('유효한 URL 형식이 아닙니다.');
  }
}




