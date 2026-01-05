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
 * 검색광고 캠페인 옵션 타입
 */
export type SearchAdCampaignOption = 'home' | 'cmp' | 'cat' | 'prd' | 'intent';

/**
 * 검색광고 네이밍 규칙에 따라 캠페인명 생성
 * 
 * 규칙: sm_sa_[media]_[br|nb]_[YYMMDD]_[campaign_option]
 * - sm: 브랜드 코드 (고정)
 * - sa: 검색광고 채널 코드 (고정)
 * - media: ggl (Google) 또는 nav (Naver)
 * - br|nb: br (브랜드 검색) 또는 nb (논브랜드 검색)
 * - YYMMDD: 시스템 날짜 (자동 입력)
 * - campaign_option: home, cmp, cat, prd, intent 중 하나
 * 
 * @param startDate YYYY-MM-DD 형식의 날짜 문자열
 * @param media 'ggl' (Google) 또는 'nav' (Naver)
 * @param searchType 'br' (브랜드) 또는 'nb' (논브랜드)
 * @param campaignOption 'home', 'cmp', 'cat', 'prd', 'intent' 중 하나
 * @returns sm_sa_[media]_[br|nb]_[YYMMDD]_[campaign_option] 형식의 캠페인명
 * 
 * @example
 * buildSearchAdCampaignName('2026-01-04', 'ggl', 'br', 'prd') => 'sm_sa_ggl_br_260104_prd'
 * buildSearchAdCampaignName('2026-01-04', 'nav', 'nb', 'cat') => 'sm_sa_nav_nb_260104_cat'
 */
export function buildSearchAdCampaignName(
  startDate: string,
  media: 'ggl' | 'nav',
  searchType: 'br' | 'nb',
  campaignOption: SearchAdCampaignOption
): string {
  if (!startDate) {
    throw new Error('startDate는 필수입니다.');
  }

  // 매체 코드는 반드시 3글자
  if (media.length !== 3) {
    throw new Error('media 코드는 반드시 3글자여야 합니다.');
  }

  // 유효한 campaign_option인지 확인
  const validOptions: SearchAdCampaignOption[] = ['home', 'cmp', 'cat', 'prd', 'intent'];
  if (!validOptions.includes(campaignOption)) {
    throw new Error(`campaignOption은 ${validOptions.join(', ')} 중 하나여야 합니다.`);
  }

  // YYYY-MM-DD 형식 파싱
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    throw new Error('유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.');
  }

  // YYMMDD 형식으로 변환
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // sm_sa_[media]_[br|nb]_[YYMMDD]_[campaign_option] 형식으로 생성
  return `sm_sa_${media}_${searchType}_${datePrefix}_${campaignOption}`;
}

/**
 * 쇼핑검색광고 네이밍 규칙에 따라 캠페인명 생성
 * 
 * 규칙: sm_sp_[media]_[br|nb]_[YYMMDD]_[campaign_option]
 * - sm: 브랜드 코드 (고정)
 * - sp: 쇼핑검색광고 채널 코드 (고정)
 * - media: ggl (Google) 또는 nav (Naver)
 * - br|nb: br (브랜드 검색) 또는 nb (논브랜드 검색)
 * - YYMMDD: 시스템 날짜 (자동 입력)
 * - campaign_option: home, cmp, cat, prd, intent 중 하나
 * 
 * @param startDate YYYY-MM-DD 형식의 날짜 문자열
 * @param media 'ggl' (Google) 또는 'nav' (Naver)
 * @param searchType 'br' (브랜드) 또는 'nb' (논브랜드)
 * @param campaignOption 'home', 'cmp', 'cat', 'prd', 'intent' 중 하나
 * @returns sm_sp_[media]_[br|nb]_[YYMMDD]_[campaign_option] 형식의 캠페인명
 * 
 * @example
 * buildShoppingSearchAdCampaignName('2026-01-04', 'ggl', 'br', 'prd') => 'sm_sp_ggl_br_260104_prd'
 * buildShoppingSearchAdCampaignName('2026-01-04', 'nav', 'nb', 'prd') => 'sm_sp_nav_nb_260104_prd'
 */
export function buildShoppingSearchAdCampaignName(
  startDate: string,
  media: 'ggl' | 'nav',
  searchType: 'br' | 'nb',
  campaignOption: SearchAdCampaignOption
): string {
  if (!startDate) {
    throw new Error('startDate는 필수입니다.');
  }

  // 매체 코드는 반드시 3글자
  if (media.length !== 3) {
    throw new Error('media 코드는 반드시 3글자여야 합니다.');
  }

  // 유효한 campaign_option인지 확인
  const validOptions: SearchAdCampaignOption[] = ['home', 'cmp', 'cat', 'prd', 'intent'];
  if (!validOptions.includes(campaignOption)) {
    throw new Error(`campaignOption은 ${validOptions.join(', ')} 중 하나여야 합니다.`);
  }

  // YYYY-MM-DD 형식 파싱
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    throw new Error('유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.');
  }

  // YYMMDD 형식으로 변환
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // sm_sp_[media]_[br|nb]_[YYMMDD]_[campaign_option] 형식으로 생성
  return `sm_sp_${media}_${searchType}_${datePrefix}_${campaignOption}`;
}

/**
 * 디스플레이광고 네이밍 규칙에 따라 캠페인명 생성
 * 
 * 규칙: sm_da_[media]_[YYMMDD]_[campaign_name]
 * - sm: 브랜드 코드 (고정)
 * - da: 디스플레이광고 채널 코드 (고정)
 * - media: ggl, nav, kko, met 중 하나 (3글자)
 * - YYMMDD: 시스템 날짜 (자동 입력)
 * - campaign_name: 사용자 입력 후 정규화된 값
 * 
 * @param startDate YYYY-MM-DD 형식의 날짜 문자열
 * @param media 'ggl', 'nav', 'kko', 'met' 중 하나
 * @param normalizedCampaignName 정규화된 캠페인명
 * @returns sm_da_[media]_[YYMMDD]_[campaign_name] 형식의 캠페인명
 * 
 * @example
 * buildDisplayAdCampaignName('2026-01-04', 'met', 'youtube_video') => 'sm_da_met_260104_youtube_video'
 * buildDisplayAdCampaignName('2026-01-04', 'ggl', 'summer_sale') => 'sm_da_ggl_260104_summer_sale'
 */
export function buildDisplayAdCampaignName(
  startDate: string,
  media: 'ggl' | 'nav' | 'kko' | 'met',
  normalizedCampaignName: string
): string {
  if (!startDate) {
    throw new Error('startDate는 필수입니다.');
  }

  if (!normalizedCampaignName || normalizedCampaignName.trim().length === 0) {
    throw new Error('normalizedCampaignName은 필수입니다.');
  }

  // 매체 코드는 반드시 3글자
  if (media.length !== 3) {
    throw new Error('media 코드는 반드시 3글자여야 합니다.');
  }

  // YYYY-MM-DD 형식 파싱
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    throw new Error('유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.');
  }

  // YYMMDD 형식으로 변환
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // sm_da_[media]_[YYMMDD]_[campaign_name] 형식으로 생성
  return `sm_da_${media}_${datePrefix}_${normalizedCampaignName}`;
}

/**
 * CRM 네이밍 규칙에 따라 캠페인명 생성
 * 
 * 규칙: sm_cr_[media]_[YYMMDD]_[campaign_name]
 * - sm: 브랜드 코드 (고정)
 * - cr: CRM 채널 코드 (고정)
 * - media: msg, kak, eml 중 하나 (3글자)
 * - YYMMDD: 시스템 날짜 (자동 입력)
 * - campaign_name: 사용자 입력 후 정규화된 값
 * 
 * @param startDate YYYY-MM-DD 형식의 날짜 문자열
 * @param media 'msg', 'kak', 'eml' 중 하나
 * @param normalizedCampaignName 정규화된 캠페인명
 * @returns sm_cr_[media]_[YYMMDD]_[campaign_name] 형식의 캠페인명
 * 
 * @example
 * buildCrmCampaignName('2026-01-04', 'msg', 'welcome_message') => 'sm_cr_msg_260104_welcome_message'
 * buildCrmCampaignName('2026-01-04', 'kak', 'promotion') => 'sm_cr_kak_260104_promotion'
 */
export function buildCrmCampaignName(
  startDate: string,
  media: 'msg' | 'kak' | 'eml',
  normalizedCampaignName: string
): string {
  if (!startDate) {
    throw new Error('startDate는 필수입니다.');
  }

  if (!normalizedCampaignName || normalizedCampaignName.trim().length === 0) {
    throw new Error('normalizedCampaignName은 필수입니다.');
  }

  // 매체 코드는 반드시 3글자
  if (media.length !== 3) {
    throw new Error('media 코드는 반드시 3글자여야 합니다.');
  }

  // YYYY-MM-DD 형식 파싱
  const date = new Date(startDate);
  if (isNaN(date.getTime())) {
    throw new Error('유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식을 사용해주세요.');
  }

  // YYMMDD 형식으로 변환
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const datePrefix = `${year}${month}${day}`;

  // sm_cr_[media]_[YYMMDD]_[campaign_name] 형식으로 생성
  return `sm_cr_${media}_${datePrefix}_${normalizedCampaignName}`;
}

/**
 * 광고그룹명 생성
 * 
 * 규칙: [campaign_name]_grNN[_custom_name]
 * - 첫 광고그룹은 반드시 "gr01"
 * - 이후 생성 시 gr02, gr03 순차 증가
 * - 삭제된 번호는 재사용하지 않음
 * - custom_name이 있으면 뒤에 추가 (선택)
 * 
 * @param campaignName 캠페인명
 * @param groupNumber 광고그룹 번호 (1부터 시작)
 * @param customName 광고그룹 custom_name (선택)
 * @returns [campaign_name]_grNN[_custom_name] 형식의 광고그룹명
 * 
 * @example
 * buildAdGroupName('sm_sa_ggl_br_260104_prd', 1) => 'sm_sa_ggl_br_260104_prd_gr01'
 * buildAdGroupName('sm_sa_nav_nb_260104_cat', 2, 'summer') => 'sm_sa_nav_nb_260104_cat_gr02_summer'
 */
export function buildAdGroupName(campaignName: string, groupNumber: number, customName?: string): string {
  if (!campaignName || campaignName.trim().length === 0) {
    throw new Error('campaignName은 필수입니다.');
  }
  if (!Number.isInteger(groupNumber) || groupNumber < 1) {
    throw new Error('groupNumber는 1 이상의 정수여야 합니다.');
  }

  const paddedNumber = groupNumber.toString().padStart(2, '0');
  const base = `${campaignName}_gr${paddedNumber}`;
  
  if (customName && customName.trim().length > 0) {
    return `${base}_${customName.trim()}`;
  }
  
  return base;
}

/**
 * 매체 코드를 utm_source로 변환
 * 
 * @param media 매체 코드 (ggl, nav, kko, met)
 * @returns utm_source 값
 */
export function getUtmSourceFromMedia(media: 'ggl' | 'nav' | 'kko' | 'met'): string {
  const mapping: Record<'ggl' | 'nav' | 'kko' | 'met', string> = {
    ggl: 'google',
    nav: 'naver',
    kko: 'kakao',
    met: 'meta',
  };
  return mapping[media];
}

/**
 * UTM 파라미터 생성 (검색광고/쇼핑검색광고용)
 * 
 * 규칙:
 * - utm_source: Google → "google", Naver → "naver"
 * - utm_medium: 항상 "cpc"
 * - utm_id: 캠페인명 그대로 사용
 * - utm_campaign: 광고그룹명 그대로 사용
 * 
 * @param media 'ggl' (Google) 또는 'nav' (Naver)
 * @param campaignName 캠페인명
 * @param adGroupName 광고그룹명
 * @returns UTM 파라미터 객체
 * 
 * @example
 * buildUtmParams('ggl', 'sm_sa_ggl_br_260104_prd', 'sm_sa_ggl_br_260104_prd_gr01')
 * => { utm_source: 'google', utm_medium: 'cpc', utm_id: 'sm_sa_ggl_br_260104_prd', utm_campaign: 'sm_sa_ggl_br_260104_prd_gr01' }
 */
export function buildUtmParams(
  media: 'ggl' | 'nav',
  campaignName: string,
  adGroupName: string
): {
  utm_source: string;
  utm_medium: string;
  utm_id: string;
  utm_campaign: string;
} {
  if (!campaignName || campaignName.trim().length === 0) {
    throw new Error('campaignName은 필수입니다.');
  }
  if (!adGroupName || adGroupName.trim().length === 0) {
    throw new Error('adGroupName은 필수입니다.');
  }

  const utm_source = getUtmSourceFromMedia(media);

  return {
    utm_source,
    utm_medium: 'cpc',
    utm_id: campaignName,
    utm_campaign: adGroupName,
  };
}

/**
 * 디스플레이광고 UTM 파라미터 생성
 * 
 * 규칙:
 * - utm_source: media에 따라 변환 (ggl→google, nav→naver, kko→kakao, met→meta)
 * - utm_medium: 항상 "display"
 * - utm_id: 캠페인명 그대로 사용
 * - utm_campaign: 광고그룹명 그대로 사용
 * 
 * @param media 'ggl', 'nav', 'kko', 'met' 중 하나
 * @param campaignName 캠페인명
 * @param adGroupName 광고그룹명
 * @returns UTM 파라미터 객체
 */
export function buildDisplayAdUtmParams(
  media: 'ggl' | 'nav' | 'kko' | 'met',
  campaignName: string,
  adGroupName: string
): {
  utm_source: string;
  utm_medium: string;
  utm_id: string;
  utm_campaign: string;
} {
  if (!campaignName || campaignName.trim().length === 0) {
    throw new Error('campaignName은 필수입니다.');
  }
  if (!adGroupName || adGroupName.trim().length === 0) {
    throw new Error('adGroupName은 필수입니다.');
  }

  const utm_source = getUtmSourceFromMedia(media);

  return {
    utm_source,
    utm_medium: 'display',
    utm_id: campaignName,
    utm_campaign: adGroupName,
  };
}

/**
 * CRM 매체 코드를 utm_medium으로 변환
 * 
 * @param media CRM 매체 코드 (msg, kak, eml)
 * @returns utm_medium 값
 */
export function getCrmUtmMediumFromMedia(media: 'msg' | 'kak' | 'eml'): string {
  const mapping: Record<'msg' | 'kak' | 'eml', string> = {
    msg: 'msg',
    kak: 'kak',
    eml: 'email',
  };
  return mapping[media];
}

/**
 * CRM UTM 파라미터 생성
 * 
 * 규칙:
 * - utm_source: 항상 "crm" (고정)
 * - utm_medium: media에 따라 변환 (msg→msg, kak→kak, eml→email)
 * - utm_id: 캠페인명 그대로 사용
 * - utm_campaign: 광고그룹명 그대로 사용
 * 
 * @param media 'msg', 'kak', 'eml' 중 하나
 * @param campaignName 캠페인명
 * @param adGroupName 광고그룹명
 * @returns UTM 파라미터 객체
 */
export function buildCrmUtmParams(
  media: 'msg' | 'kak' | 'eml',
  campaignName: string,
  adGroupName: string
): {
  utm_source: string;
  utm_medium: string;
  utm_id: string;
  utm_campaign: string;
} {
  if (!campaignName || campaignName.trim().length === 0) {
    throw new Error('campaignName은 필수입니다.');
  }
  if (!adGroupName || adGroupName.trim().length === 0) {
    throw new Error('adGroupName은 필수입니다.');
  }

  const utm_medium = getCrmUtmMediumFromMedia(media);

  return {
    utm_source: 'crm',
    utm_medium,
    utm_id: campaignName,
    utm_campaign: adGroupName,
  };
}

/**
 * UTM 파라미터를 URL 쿼리 문자열로 변환
 * 
 * @param utmParams UTM 파라미터 객체
 * @returns URL 쿼리 문자열 (예: ?utm_source=google&utm_medium=cpc&...)
 */
export function buildUtmQueryString(utmParams: {
  utm_source: string;
  utm_medium: string;
  utm_id: string;
  utm_campaign: string;
}): string {
  const params = new URLSearchParams();
  params.append('utm_source', utmParams.utm_source);
  params.append('utm_medium', utmParams.utm_medium);
  params.append('utm_id', utmParams.utm_id);
  params.append('utm_campaign', utmParams.utm_campaign);
  return `?${params.toString()}`;
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
  if (!startDate) {
    throw new Error('startDate는 필수입니다.');
  }
  // normalizedName은 검색광고의 경우 빈 문자열 허용 (prefix만 반환)
  if (normalizedName === undefined || normalizedName === null) {
    throw new Error('normalizedName은 필수입니다.');
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
  // 주의: 이 함수는 기존 호환성을 위해 유지되지만, 새로운 검색광고는 buildSearchAdCampaignName 사용 권장
  if (options?.channel === 'naver' || options?.channel === 'google') {
    const channelPrefix = options.channel === 'naver' ? 'nav' : 'goo';
    const brandPrefix = options.isBrand ? 'br' : 'nb';
    // sm_sa_nav_br_YYMMDD_ 형식으로 시작일 포함
    const prefix = `sm_sa_${channelPrefix}_${brandPrefix}_${datePrefix}`;
    // cleanName이 비어있으면 prefix만 반환 (마지막 언더스코어와 캠페인명 없이)
    if (!cleanName || cleanName.trim() === '') {
      return prefix;
    }
    // prefix 길이 계산: sm_sa_nav_br_YYMMDD = 18자 (YYMMDD 포함)
    // 총 30자 제한이므로 캠페인명은 최대 11자 (30 - 18 - 1(언더스코어) = 11)
    const maxNameLength = 11;
    const truncatedName = cleanName.length > maxNameLength ? cleanName.substring(0, maxNameLength) : cleanName;
    return `${prefix}_${truncatedName}`;
  }

  // 일반적인 경우: sm_YYMMDD_normalizedName 형식
  return `sm_${datePrefix}_${cleanName}`;
}

