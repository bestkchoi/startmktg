/**
 * Start Campaign PRD v1.1 기반 캠페인명 처리 헬퍼 함수
 */

import translationDictionary from './translation-dictionary.json';

/**
 * 사전 정의된 번역 사전에서 번역 확인
 * 
 * @param koreanText 한글 텍스트
 * @returns 영어 번역 문장 또는 null (사전에 없으면)
 * 
 * @example
 * lookupDictionary('블랙프라이데이') => 'black friday'
 * lookupDictionary('존재하지않는단어') => null
 */
export function lookupDictionary(koreanText: string): string | null {
  const dict = translationDictionary as Record<string, string>;
  return dict[koreanText] || null;
}

/**
 * 한글을 영어로 번역하는 mock 함수 (fallback용)
 * 실제로는 Google Translate API 또는 다른 번역 서비스 사용
 * 
 * @param koreanText 한글 텍스트
 * @returns 영어 번역 문장 (단일 문장)
 * 
 * @example
 * translateToEnglish('여름세일') => 'summer sale'
 * translateToEnglish('블랙프라이데이') => 'black friday'
 */
export function translateToEnglish(koreanText: string): string {
  // 먼저 사전 확인
  const dictTranslation = lookupDictionary(koreanText);
  if (dictTranslation) {
    return dictTranslation;
  }

  // 기본 번역 (간단한 치환 - 실제로는 번역 API 사용)
  // 한글만 있는 경우 기본값
  return 'campaign';
}

/**
 * 번역된 영어 문장을 기반으로 normalizedName 후보 생성
 * 통일성을 위해 공백을 제거한 형태 하나만 반환
 * 
 * @param translatedText 번역된 영어 문장 (예: "summer sale")
 * @param maxLength 최대 길이 제한 (Naver Search 검색광고의 경우 17자)
 * @returns normalizedName 후보 배열 (1개만 반환)
 * 
 * @example
 * generateNormalizedNameCandidates('black friday') => ['blackfriday']
 * generateNormalizedNameCandidates('summer sale') => ['summersale']
 * generateNormalizedNameCandidates('black friday sale event', 17) => ['blackfridaysale'] (17자 제한)
 */
export function generateNormalizedNameCandidates(translatedText: string, maxLength?: number): string[] {
  if (!translatedText || translatedText.trim().length === 0) {
    return [];
  }

  const text = translatedText.trim().toLowerCase();
  
  // 공백 제거하여 하나의 후보만 반환 (통일성을 위해)
  const withoutSpaces = text.replace(/\s+/g, '');
  
  // 특수문자 제거 (영문자, 숫자만 유지)
  let normalized = withoutSpaces.replace(/[^a-z0-9]/g, '');
  
  // 최대 길이 제한 적용
  if (maxLength && normalized.length > maxLength) {
    normalized = normalized.substring(0, maxLength);
  }
  
  if (normalized.length === 0) {
    return [];
  }

  return [normalized];
}

/**
 * 텍스트를 normalizedName 형태로 변환 (normalizeCampaignName의 내부 로직 사용)
 */
function normalizeFromText(text: string): string {
  let normalized = text.toLowerCase();
  // 공백과 하이픈을 언더스코어로 변경
  normalized = normalized.replace(/[\s-]+/g, '_');
  // 특수문자 제거 (언더스코어와 숫자, 영문자만 유지)
  normalized = normalized.replace(/[^a-z0-9_]/g, '');
  // 연속된 언더스코어를 하나로 통합
  normalized = normalized.replace(/_+/g, '_');
  // 앞뒤 언더스코어 제거
  normalized = normalized.replace(/^_+|_+$/g, '');
  
  // 소문자 영어로 시작하는지 확인
  if (!/^[a-z]/.test(normalized)) {
    if (/^[0-9]/.test(normalized)) {
      normalized = `campaign_${normalized}`;
    } else if (normalized.length === 0) {
      normalized = 'campaign';
    } else {
      normalized = `campaign_${normalized}`;
    }
  }

  return normalized;
}

/**
 * 텍스트에 한글이 포함되어 있는지 확인
 */
function containsKorean(text: string): boolean {
  return /[가-힣]/.test(text);
}

/**
 * PRD 5.2 규칙에 따라 rawName을 normalizedName으로 변환
 * 
 * 규칙:
 * - 소문자
 * - 공백은 _로 변경
 * - 특수문자 제거
 * - 숫자는 그대로 유지하며, 문자+숫자 조합은 언더스코어로 구분하지 않는다
 * - 반드시 소문자 영어(a-z)로 시작해야 한다
 * 
 * @param rawName 사용자가 입력한 원본 이름
 * @returns 정규화된 이름
 * 
 * @example
 * normalizeCampaignName('Black Friday Sale') => 'black_friday_sale'
 * normalizeCampaignName('Summer Sale Event') => 'summer_sale_event'
 * normalizeCampaignName('블랙프라이데이') => 'blackfriday' (번역 후)
 */
export function normalizeCampaignName(rawName: string): string {
  if (!rawName || typeof rawName !== 'string') {
    throw new Error('rawName은 필수입니다.');
  }

  let text = rawName.trim();

  // 한글 포함 시 번역
  if (containsKorean(text)) {
    const translation = translateToEnglish(text);
    text = translation; // 번역 결과 사용
  }

  // 소문자 변환
  text = text.toLowerCase();

  // 공백을 언더스코어로 변경
  text = text.replace(/\s+/g, '_');

  // 특수문자 제거 (언더스코어와 숫자, 영문자만 유지)
  text = text.replace(/[^a-z0-9_]/g, '');

  // 연속된 언더스코어를 하나로 통합
  text = text.replace(/_+/g, '_');

  // 앞뒤 언더스코어 제거
  text = text.replace(/^_+|_+$/g, '');

  // 소문자 영어로 시작하는지 확인 (숫자로 시작하면 앞에 'campaign_' 추가)
  if (!/^[a-z]/.test(text)) {
    // 숫자로 시작하거나 빈 문자열인 경우
    if (/^[0-9]/.test(text)) {
      text = `campaign_${text}`;
    } else if (text.length === 0) {
      text = 'campaign';
    } else {
      // 특수문자만 남은 경우
      text = `campaign_${text}`;
    }
  }

  return text;
}

/**
 * PRD 5.2 규칙에 따라 finalCampaignName 생성
 * 
 * 규칙: finalCampaignName = sm_YYMMDD_normalizedName
 * - sm_ 접두사 추가 (Start MKTG)
 * - 날짜는 YYMMDD 형식
 * - 캠페인명은 소문자, 숫자, 언더스코어만 허용
 * 
 * @param startDate YYYY-MM-DD 형식의 날짜 문자열
 * @param normalizedName 정규화된 캠페인명 (소문자, 숫자, 언더스코어만 포함)
 * @param options 선택적 옵션 (검색광고용 또는 디스플레이 광고용)
 * @returns sm_YYMMDD_normalizedName 또는 sm_sa_nav_br_/sm_sa_nav_nb_/sm_sa_goo_br_/sm_sa_goo_nb_ 또는 sm_da_YYMMDD 형식의 최종 캠페인명
 * 
 * @example
 * buildFinalCampaignName('2025-12-01', 'blackfriday') => 'sm_251201_blackfriday'
 * buildFinalCampaignName('2026-11-30', 'black_friday_sale') => 'sm_261130_black_friday_sale'
 * buildFinalCampaignName('2025-12-01', 'blackfriday', { channel: 'naver', isBrand: true }) => 'sm_sa_nav_br_blackfriday'
 * buildFinalCampaignName('2025-12-01', 'blackfriday', { channel: 'naver', isBrand: false }) => 'sm_sa_nav_nb_blackfriday'
 * buildFinalCampaignName('2025-12-01', 'blackfriday', { channel: 'google', isBrand: true }) => 'sm_sa_goo_br_blackfriday'
 * buildFinalCampaignName('2025-12-01', 'blackfriday', { channel: 'google', isBrand: false }) => 'sm_sa_goo_nb_blackfriday'
 * buildFinalCampaignName('2025-12-01', 'blackfriday', { adType: 'display' }) => 'sm_da_251201_blackfriday'
 */
export function buildFinalCampaignName(
  startDate: string,
  normalizedName: string,
  options?: { channel?: 'naver' | 'google'; isBrand?: boolean; adType?: 'search' | 'display' | 'crm' }
): string {
  if (!startDate || !normalizedName) {
    throw new Error('startDate와 normalizedName은 필수입니다.');
  }

  // YYYY-MM-DD 형식 파싱
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    throw new Error('유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.');
  }

  // YYMMDD 형식으로 변환
  const year = date.getFullYear().toString().slice(-2); // 마지막 2자리
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // normalizedName이 소문자, 숫자, 언더스코어만 포함하는지 확인 및 정리
  // (이미 normalizeCampaignName에서 처리되지만, 안전을 위해 한 번 더 검증)
  const cleanName = normalizedName.toLowerCase().replace(/[^a-z0-9_]/g, '').replace(/_+/g, '_').replace(/^_+|_+$/g, '');

  // 디스플레이 광고인 경우: sm_da_YYMMDD_normalizedName 형식
  if (options?.adType === 'display') {
    return `sm_da_${datePrefix}_${cleanName}`;
  }

  // 검색광고인 경우 특별한 형식 사용 (Naver Search 또는 Google Ads)
  if (options?.channel === 'naver' || options?.channel === 'google') {
    const channelPrefix = options.channel === 'naver' ? 'nav' : 'goo';
    const prefix = options.isBrand ? `sm_sa_${channelPrefix}_br_` : `sm_sa_${channelPrefix}_nb_`;
    // prefix 길이: 12자 (sm_sa_nav_br_ 또는 sm_sa_nav_nb_ 또는 sm_sa_goo_br_ 또는 sm_sa_goo_nb_), 총 30자 제한이므로 캠페인명은 최대 18자
    const maxNameLength = 18;
    const truncatedName = cleanName.length > maxNameLength ? cleanName.substring(0, maxNameLength) : cleanName;
    return `${prefix}${truncatedName}`;
  }

  // 일반적인 경우: sm_YYMMDD_normalizedName 형식
  return `sm_${datePrefix}_${cleanName}`;
}

