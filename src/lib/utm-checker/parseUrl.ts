/**
 * URL에서 UTM 파라미터와 광고 플랫폼 파라미터를 추출합니다.
 * PRD_UTM_Checker_v1.2 기준
 */

export type ParsedParams = {
  // UTM 기본 6종
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_id?: string;
  utm_content?: string;
  utm_term?: string;
  
  // Google Ads
  gclid?: string;
  srsltid?: string;
  
  // Meta Ads
  fbclid?: string;
  
  // TikTok Ads
  ttclid?: string;
  
  // Naver Ads (파워링크)
  n_campaign_type?: string; // 캠페인 유형
  n_campaign?: string; // 캠페인 ID
  n_ad_group?: string; // 광고 그룹 ID
  n_media?: string; // 매체 ID
  n_ad?: string; // 소재 ID
  n_ad_extension?: string; // 확장 소재 ID
  n_keyword?: string; // 키워드
  n_keyword_id?: string; // 키워드 ID
  n_query?: string; // 검색어
  n_match?: string; // 매치 방식
  n_network?: string; // 매체(검색/콘텐츠)
  n_rank?: string; // 광고 순위
  n_ad_group_type?: string; // 광고 그룹 유형
  n_source?: string; // 소스
  n_contract?: string; // 계약 ID
  
  // Kakao Ads
  k_campaign?: string;
  k_media?: string;
  k_keyword?: string;
};

export type ParseResult = {
  success: boolean;
  inputUrl: string;
  parsed: ParsedParams;
  error?: string;
};

/**
 * URL을 파싱하여 UTM 및 광고 플랫폼 파라미터를 추출합니다.
 */
export function parseUrl(url: string): ParseResult {
  try {
    // URL 유효성 검사
    if (!url || typeof url !== "string" || url.trim().length === 0) {
      return {
        success: false,
        inputUrl: url,
        parsed: {},
        error: "URL을 입력해주세요",
      };
    }

    const trimmedUrl = url.trim();
    
    // http, https 프로토콜이 없으면 추가
    let urlToParse = trimmedUrl;
    if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
      urlToParse = `https://${trimmedUrl}`;
    }

    const urlObj = new URL(urlToParse);
    const searchParams = urlObj.searchParams;

    const parsed: ParsedParams = {};

    // UTM 기본 6종 추출
    const utmSource = searchParams.get("utm_source");
    if (utmSource) parsed.utm_source = utmSource;
    
    const utmMedium = searchParams.get("utm_medium");
    if (utmMedium) parsed.utm_medium = utmMedium;
    
    const utmCampaign = searchParams.get("utm_campaign");
    if (utmCampaign) parsed.utm_campaign = utmCampaign;
    
    const utmId = searchParams.get("utm_id");
    if (utmId) parsed.utm_id = utmId;
    
    const utmContent = searchParams.get("utm_content");
    if (utmContent) parsed.utm_content = utmContent;
    
    const utmTerm = searchParams.get("utm_term");
    if (utmTerm) parsed.utm_term = utmTerm;

    // Google Ads 파라미터
    const gclid = searchParams.get("gclid");
    if (gclid) parsed.gclid = gclid;
    
    const srsltid = searchParams.get("srsltid");
    if (srsltid) parsed.srsltid = srsltid;

    // Meta Ads 파라미터
    const fbclid = searchParams.get("fbclid");
    if (fbclid) parsed.fbclid = fbclid;

    // TikTok Ads 파라미터
    const ttclid = searchParams.get("ttclid");
    if (ttclid) parsed.ttclid = ttclid;

    // Naver Ads 파라미터 (파워링크)
    const nCampaignType = searchParams.get("n_campaign_type");
    if (nCampaignType) parsed.n_campaign_type = nCampaignType;
    
    const nCampaign = searchParams.get("n_campaign");
    if (nCampaign) parsed.n_campaign = nCampaign;
    
    const nAdGroup = searchParams.get("n_ad_group");
    if (nAdGroup) parsed.n_ad_group = nAdGroup;
    
    const nMedia = searchParams.get("n_media");
    if (nMedia) parsed.n_media = nMedia;
    
    const nAd = searchParams.get("n_ad");
    if (nAd) parsed.n_ad = nAd;
    
    const nAdExtension = searchParams.get("n_ad_extension");
    if (nAdExtension) parsed.n_ad_extension = nAdExtension;
    
    const nKeyword = searchParams.get("n_keyword");
    if (nKeyword) parsed.n_keyword = nKeyword;
    
    const nKeywordId = searchParams.get("n_keyword_id");
    if (nKeywordId) parsed.n_keyword_id = nKeywordId;
    
    const nQuery = searchParams.get("n_query");
    if (nQuery) parsed.n_query = nQuery;
    
    const nMatch = searchParams.get("n_match");
    if (nMatch) parsed.n_match = nMatch;
    
    const nNetwork = searchParams.get("n_network");
    if (nNetwork) parsed.n_network = nNetwork;
    
    const nRank = searchParams.get("n_rank");
    if (nRank) parsed.n_rank = nRank;
    
    const nAdGroupType = searchParams.get("n_ad_group_type");
    if (nAdGroupType) parsed.n_ad_group_type = nAdGroupType;
    
    const nSource = searchParams.get("n_source");
    if (nSource) parsed.n_source = nSource;
    
    const nContract = searchParams.get("n_contract");
    if (nContract) parsed.n_contract = nContract;

    // Kakao Ads 파라미터
    const kCampaign = searchParams.get("k_campaign");
    if (kCampaign) parsed.k_campaign = kCampaign;
    
    const kMedia = searchParams.get("k_media");
    if (kMedia) parsed.k_media = kMedia;
    
    const kKeyword = searchParams.get("k_keyword");
    if (kKeyword) parsed.k_keyword = kKeyword;

    return {
      success: true,
      inputUrl: trimmedUrl,
      parsed,
    };
  } catch (error) {
    return {
      success: false,
      inputUrl: url,
      parsed: {},
      error: error instanceof Error ? error.message : "유효한 URL이 아닙니다",
    };
  }
}



