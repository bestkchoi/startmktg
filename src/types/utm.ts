/**
 * UTM LINK 만들기 관련 타입 정의
 */

/**
 * 광고유형 (Ad Type)
 */
export type AdType = "sa" | "sp" | "da" | "cr";

/**
 * 광고유형 정보
 */
export type AdTypeInfo = {
  code: AdType;
  label: string;
  description: string;
  isAvailable: boolean; // 현재 사용 가능한지 여부
};

/**
 * 매체 코드 (3글자 강제)
 */
export type MediaCode = "ggl" | "nav" | "kko" | "met";

/**
 * CRM 매체 코드 (3글자 강제)
 */
export type CrmMediaCode = "msg" | "kak" | "eml";

/**
 * 검색광고 전용 입력 파라미터
 */
export type SearchAdInput = {
  media: "ggl" | "nav";
  searchType: "br" | "nb";
  campaignOption: "home" | "cmp" | "cat" | "prd" | "intent";
  startDate: string;
  adGroupNumber: number;
  custom_name?: string; // 광고그룹명 custom_name (선택)
};

/**
 * 디스플레이광고 전용 입력 파라미터
 */
export type DisplayAdInput = {
  media: MediaCode;
  campaignName: string; // 사용자 직접 입력
  startDate: string;
  adGroupNumber: number;
};

/**
 * CRM 전용 입력 파라미터
 */
export type CrmInput = {
  media: CrmMediaCode;
  campaignName: string; // 사용자 직접 입력
  startDate: string;
  adGroupNumber: number;
};

/**
 * 네이밍 결과
 */
export type NamingResult = {
  campaignName: string;
  adGroupName: string;
};

/**
 * UTM 파라미터
 */
export type UtmParams = {
  utm_source: string;
  utm_medium: string;
  utm_id: string;
  utm_campaign: string;
  utm_content?: string;
  utm_term?: string;
};
