/**
 * 광고유형별 네이밍 및 UTM 생성 로직
 * 
 * 각 광고유형별로 독립적인 모듈로 분리하여 확장 가능한 구조로 설계
 */

import { buildSearchAdCampaignName, buildShoppingSearchAdCampaignName, buildDisplayAdCampaignName, buildCrmCampaignName, buildAdGroupName, buildUtmParams, buildDisplayAdUtmParams, buildCrmUtmParams } from "@/lib/campaign/campaign-name";
import { normalizeCampaignName } from "./campaign-name-normalize";
import { formatDateToYYMMDD } from "./url-utils";
import type { AdType, SearchAdInput, DisplayAdInput, CrmInput, NamingResult, UtmParams } from "@/types/utm";

/**
 * 검색광고(sa) 네이밍 생성
 */
export function generateSearchAdNaming(input: SearchAdInput): NamingResult {
  const campaignName = buildSearchAdCampaignName(
    input.startDate,
    input.media,
    input.searchType,
    input.campaignOption
  );

  const adGroupName = buildAdGroupName(campaignName, input.adGroupNumber, input.custom_name);

  return {
    campaignName,
    adGroupName,
  };
}

/**
 * 검색광고(sa) UTM 파라미터 생성
 */
export function generateSearchAdUtmParams(
  media: "ggl" | "nav",
  campaignName: string,
  adGroupName: string
): UtmParams {
  return buildUtmParams(media, campaignName, adGroupName);
}

/**
 * 쇼핑검색광고(sp) 네이밍 생성
 * 
 * 검색광고(sa)와 동일한 규칙을 재사용하되, adtype 코드만 "sp"로 변경
 * 향후 sp 전용 규칙이 분리될 수 있도록 독립 함수로 구현
 */
export function generateShoppingSearchAdNaming(input: SearchAdInput): NamingResult {
  const campaignName = buildShoppingSearchAdCampaignName(
    input.startDate,
    input.media,
    input.searchType,
    input.campaignOption
  );

  const adGroupName = buildAdGroupName(campaignName, input.adGroupNumber, input.custom_name);

  return {
    campaignName,
    adGroupName,
  };
}

/**
 * 쇼핑검색광고(sp) UTM 파라미터 생성
 * 
 * 검색광고(sa)와 동일한 UTM 매핑 규칙 사용
 */
export function generateShoppingSearchAdUtmParams(
  media: "ggl" | "nav",
  campaignName: string,
  adGroupName: string
): UtmParams {
  return buildUtmParams(media, campaignName, adGroupName);
}

/**
 * 디스플레이광고(da) 네이밍 생성
 * 
 * 사용자가 입력한 campaign_name을 정규화하여 네이밍 생성
 */
export function generateDisplayAdNaming(input: DisplayAdInput): NamingResult {
  // campaign_name 정규화
  const normalizedCampaignName = normalizeCampaignName(input.campaignName);

  // 캠페인명 생성
  const campaignName = buildDisplayAdCampaignName(
    input.startDate,
    input.media,
    normalizedCampaignName
  );

  // 광고그룹명 생성
  const adGroupName = buildAdGroupName(campaignName, input.adGroupNumber);

  return {
    campaignName,
    adGroupName,
  };
}

/**
 * 디스플레이광고(da) UTM 파라미터 생성
 * 
 * utm_medium은 "display"로 고정
 */
export function generateDisplayAdUtmParams(
  media: "ggl" | "nav" | "kko" | "met",
  campaignName: string,
  adGroupName: string
): UtmParams {
  return buildDisplayAdUtmParams(media, campaignName, adGroupName);
}

/**
 * CRM(cr) 네이밍 생성
 * 
 * 사용자가 입력한 campaign_name을 정규화하여 네이밍 생성
 */
export function generateCrmNaming(input: CrmInput): NamingResult {
  // campaign_name 정규화
  const normalizedCampaignName = normalizeCampaignName(input.campaignName);

  // 캠페인명 생성
  const campaignName = buildCrmCampaignName(
    input.startDate,
    input.media,
    normalizedCampaignName
  );

  // 광고그룹명 생성
  const adGroupName = buildAdGroupName(campaignName, input.adGroupNumber);

  return {
    campaignName,
    adGroupName,
  };
}

/**
 * CRM(cr) UTM 파라미터 생성
 * 
 * utm_source는 "crm"으로 고정
 * utm_medium은 media에 따라 변환
 */
export function generateCrmUtmParams(
  media: "msg" | "kak" | "eml",
  campaignName: string,
  adGroupName: string
): UtmParams {
  return buildCrmUtmParams(media, campaignName, adGroupName);
}

/**
 * 광고유형별 네이밍 생성 라우터
 * 
 * @param adType 광고유형
 * @param input 광고유형별 입력 파라미터
 * @returns 네이밍 결과
 */
export function generateNamingByAdType(
  adType: AdType,
  input: SearchAdInput | DisplayAdInput | CrmInput | unknown
): NamingResult {
  switch (adType) {
    case "sa":
      return generateSearchAdNaming(input as SearchAdInput);
    case "sp":
      return generateShoppingSearchAdNaming(input as SearchAdInput);
    case "da":
      return generateDisplayAdNaming(input as DisplayAdInput);
    case "cr":
      return generateCrmNaming(input as CrmInput);
    default:
      throw new Error(`지원하지 않는 광고유형입니다: ${adType}`);
  }
}

/**
 * 광고유형별 UTM 파라미터 생성 라우터
 * 
 * @param adType 광고유형
 * @param input 광고유형별 입력 파라미터
 * @returns UTM 파라미터
 */
export function generateUtmParamsByAdType(
  adType: AdType,
  input: SearchAdInput | DisplayAdInput | CrmInput | unknown
): UtmParams {
  switch (adType) {
    case "sa": {
      const saInput = input as SearchAdInput;
      const naming = generateSearchAdNaming(saInput);
      return generateSearchAdUtmParams(saInput.media, naming.campaignName, naming.adGroupName);
    }
    case "sp": {
      const spInput = input as SearchAdInput;
      const naming = generateShoppingSearchAdNaming(spInput);
      return generateShoppingSearchAdUtmParams(spInput.media, naming.campaignName, naming.adGroupName);
    }
    case "da": {
      const daInput = input as DisplayAdInput;
      const naming = generateDisplayAdNaming(daInput);
      return generateDisplayAdUtmParams(daInput.media, naming.campaignName, naming.adGroupName);
    }
    case "cr": {
      const crInput = input as CrmInput;
      const naming = generateCrmNaming(crInput);
      return generateCrmUtmParams(crInput.media, naming.campaignName, naming.adGroupName);
    }
    default:
      throw new Error(`지원하지 않는 광고유형입니다: ${adType}`);
  }
}

