/**
 * 캠페인명 정규화 유틸리티
 * 
 * 디스플레이광고(da)의 campaign_name 정규화 규칙:
 * - 소문자로 변환
 * - 공백은 "_"로 치환
 * - 허용 문자: a-z, 0-9, _
 * - 그 외 문자 제거
 * - 연속 "_"는 하나로 축약
 * - 앞뒤 "_" 제거
 * - 최대 길이 30자
 * - 결과가 비어있으면 에러
 */

/**
 * 캠페인명 정규화
 * 
 * @param campaignName 원본 캠페인명
 * @returns 정규화된 캠페인명
 * @throws Error 정규화 결과가 비어있으면 에러
 */
export function normalizeCampaignName(campaignName: string): string {
  if (!campaignName || typeof campaignName !== 'string') {
    throw new Error('campaignName은 필수입니다.');
  }

  // 앞뒤 공백 제거
  let normalized = campaignName.trim();

  // 소문자로 변환
  normalized = normalized.toLowerCase();

  // 공백을 "_"로 치환
  normalized = normalized.replace(/\s+/g, '_');

  // 허용 문자만 유지 (a-z, 0-9, _)
  normalized = normalized.replace(/[^a-z0-9_]/g, '');

  // 연속 "_"는 하나로 축약
  normalized = normalized.replace(/_+/g, '_');

  // 앞뒤 "_" 제거
  normalized = normalized.replace(/^_+|_+$/g, '');

  // 최대 길이 30자
  if (normalized.length > 30) {
    normalized = normalized.substring(0, 30);
    // 잘린 부분이 "_"로 끝나면 제거
    normalized = normalized.replace(/_+$/, '');
  }

  // 결과가 비어있으면 에러
  if (normalized.length === 0) {
    throw new Error('정규화된 캠페인명이 비어있습니다. 유효한 문자를 입력해주세요.');
  }

  return normalized;
}




