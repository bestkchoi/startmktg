/**
 * 파라미터별 메타데이터 정의
 * 마케팅 초보자가 이해하기 쉽도록 dimension과 수집도구 정보 제공
 */

import type { Locale } from "@/lib/locale-utils";

export type ParamMetadata = {
  dimension: string; // 매체사에서 정의한 dimension 이름
  tool: string; // 수집도구
  description?: string; // 간단한 설명
};

type ParamMetadataByLocale = {
  [key in Locale]: ParamMetadata;
};

const PARAM_METADATA_BY_LOCALE: Record<string, ParamMetadataByLocale> = {
  // UTM 기본 파라미터 (GA4)
  utm_source: {
    en: {
      dimension: "Session Source",
      tool: "Google Analytics",
      description: "Where the traffic came from (e.g., google, naver, facebook)",
    },
    ko: {
      dimension: "세션 소스",
      tool: "Google Analytics",
      description: "트래픽이 어디서 왔는지 (예: google, naver, facebook)",
    },
    jp: {
      dimension: "セッションソース",
      tool: "Google Analytics",
      description: "トラフィックの発生元（例：google、naver、facebook）",
    },
  },
  utm_medium: {
    en: {
      dimension: "Session Medium",
      tool: "Google Analytics",
      description: "Marketing medium type (e.g., cpc, email, social)",
    },
    ko: {
      dimension: "세션 매체",
      tool: "Google Analytics",
      description: "마케팅 매체 유형 (예: cpc, email, social)",
    },
    jp: {
      dimension: "セッションメディア",
      tool: "Google Analytics",
      description: "マーケティングメディアタイプ（例：cpc、email、social）",
    },
  },
  utm_campaign: {
    en: {
      dimension: "Session Campaign",
      tool: "Google Analytics",
      description: "Campaign name (e.g., spring_sale_2025)",
    },
    ko: {
      dimension: "세션 캠페인",
      tool: "Google Analytics",
      description: "캠페인 이름 (예: spring_sale_2025)",
    },
    jp: {
      dimension: "セッションキャンペーン",
      tool: "Google Analytics",
      description: "キャンペーン名（例：spring_sale_2025）",
    },
  },
  utm_id: {
    en: {
      dimension: "Campaign ID",
      tool: "Google Analytics",
      description: "Unique identifier for the campaign",
    },
    ko: {
      dimension: "캠페인 ID",
      tool: "Google Analytics",
      description: "캠페인의 고유 식별자",
    },
    jp: {
      dimension: "キャンペーンID",
      tool: "Google Analytics",
      description: "キャンペーンの一意の識別子",
    },
  },
  utm_content: {
    en: {
      dimension: "Content",
      tool: "Google Analytics",
      description: "Distinguishes different versions of the same ad (e.g., banner_a, banner_b)",
    },
    ko: {
      dimension: "콘텐츠",
      tool: "Google Analytics",
      description: "같은 광고의 다른 버전 구분 (예: banner_a, banner_b)",
    },
    jp: {
      dimension: "コンテンツ",
      tool: "Google Analytics",
      description: "同じ広告の異なるバージョンを区別（例：banner_a、banner_b）",
    },
  },
  utm_term: {
    en: {
      dimension: "Search Term",
      tool: "Google Analytics",
      description: "Keyword for paid search ads",
    },
    ko: {
      dimension: "검색어",
      tool: "Google Analytics",
      description: "유료 검색 광고의 키워드",
    },
    jp: {
      dimension: "検索語",
      tool: "Google Analytics",
      description: "有料検索広告のキーワード",
    },
  },

  // Google Ads
  gclid: {
    en: {
      dimension: "Google Click ID",
      tool: "Google Ads",
      description: "Google Ads click tracking identifier",
    },
    ko: {
      dimension: "Google 클릭 ID",
      tool: "Google Ads",
      description: "Google Ads 클릭 추적 식별자",
    },
    jp: {
      dimension: "GoogleクリックID",
      tool: "Google Ads",
      description: "Google広告のクリック追跡識別子",
    },
  },
  srsltid: {
    en: {
      dimension: "Google Search Result ID",
      tool: "Google Ads",
      description: "Google search result tracking identifier",
    },
    ko: {
      dimension: "Google 검색 결과 ID",
      tool: "Google Ads",
      description: "Google 검색 결과 추적 식별자",
    },
    jp: {
      dimension: "Google検索結果ID",
      tool: "Google Ads",
      description: "Google検索結果の追跡識別子",
    },
  },

  // Meta Ads
  fbclid: {
    en: {
      dimension: "Facebook Click ID",
      tool: "Meta (Facebook)",
      description: "Facebook/Meta ad click tracking identifier",
    },
    ko: {
      dimension: "Facebook 클릭 ID",
      tool: "Meta (Facebook)",
      description: "Facebook/Meta 광고 클릭 추적 식별자",
    },
    jp: {
      dimension: "FacebookクリックID",
      tool: "Meta (Facebook)",
      description: "Facebook/Meta広告のクリック追跡識別子",
    },
  },

  // TikTok Ads
  ttclid: {
    en: {
      dimension: "TikTok Click ID",
      tool: "TikTok Ads",
      description: "TikTok ad click tracking identifier",
    },
    ko: {
      dimension: "TikTok 클릭 ID",
      tool: "TikTok Ads",
      description: "TikTok 광고 클릭 추적 식별자",
    },
    jp: {
      dimension: "TikTokクリックID",
      tool: "TikTok Ads",
      description: "TikTok広告のクリック追跡識別子",
    },
  },

  // Naver Ads (파워링크)
  n_campaign_type: {
    en: {
      dimension: "Campaign Type",
      tool: "Naver Ads",
      description: "Campaign type (1: Power Link, 2: Shopping Search, etc.)",
    },
    ko: {
      dimension: "캠페인 유형",
      tool: "Naver Ads",
      description: "캠페인 유형 (1: 파워링크, 2: 쇼핑검색 등)",
    },
    jp: {
      dimension: "キャンペーンタイプ",
      tool: "Naver Ads",
      description: "キャンペーンタイプ（1：パワーリンク、2：ショッピング検索など）",
    },
  },
  n_campaign: {
    en: {
      dimension: "Campaign ID",
      tool: "Naver Ads",
      description: "Unique identifier for Naver campaign",
    },
    ko: {
      dimension: "캠페인 ID",
      tool: "Naver Ads",
      description: "네이버 캠페인의 고유 식별자",
    },
    jp: {
      dimension: "キャンペーンID",
      tool: "Naver Ads",
      description: "Naverキャンペーンの一意の識別子",
    },
  },
  n_ad_group: {
    en: {
      dimension: "Ad Group ID",
      tool: "Naver Ads",
      description: "Unique identifier for ad group",
    },
    ko: {
      dimension: "광고 그룹 ID",
      tool: "Naver Ads",
      description: "광고 그룹의 고유 식별자",
    },
    jp: {
      dimension: "広告グループID",
      tool: "Naver Ads",
      description: "広告グループの一意の識別子",
    },
  },
  n_media: {
    en: {
      dimension: "Media ID",
      tool: "Naver Ads",
      description: "Media identifier where ads are displayed",
    },
    ko: {
      dimension: "매체 ID",
      tool: "Naver Ads",
      description: "광고가 노출되는 매체 식별자",
    },
    jp: {
      dimension: "メディアID",
      tool: "Naver Ads",
      description: "広告が表示されるメディアの識別子",
    },
  },
  n_ad: {
    en: {
      dimension: "Creative ID",
      tool: "Naver Ads",
      description: "Unique identifier for ad creative",
    },
    ko: {
      dimension: "소재 ID",
      tool: "Naver Ads",
      description: "광고 소재의 고유 식별자",
    },
    jp: {
      dimension: "クリエイティブID",
      tool: "Naver Ads",
      description: "広告クリエイティブの一意の識別子",
    },
  },
  n_ad_extension: {
    en: {
      dimension: "Ad Extension ID",
      tool: "Naver Ads",
      description: "Unique identifier for ad extension",
    },
    ko: {
      dimension: "확장 소재 ID",
      tool: "Naver Ads",
      description: "확장 소재의 고유 식별자",
    },
    jp: {
      dimension: "広告拡張ID",
      tool: "Naver Ads",
      description: "広告拡張の一意の識別子",
    },
  },
  n_keyword: {
    en: {
      dimension: "Keyword",
      tool: "Naver Ads",
      description: "Keyword registered in ad system",
    },
    ko: {
      dimension: "키워드",
      tool: "Naver Ads",
      description: "광고 시스템에 등록된 키워드",
    },
    jp: {
      dimension: "キーワード",
      tool: "Naver Ads",
      description: "広告システムに登録されたキーワード",
    },
  },
  n_keyword_id: {
    en: {
      dimension: "Keyword ID",
      tool: "Naver Ads",
      description: "Unique identifier for keyword",
    },
    ko: {
      dimension: "키워드 ID",
      tool: "Naver Ads",
      description: "키워드의 고유 식별자",
    },
    jp: {
      dimension: "キーワードID",
      tool: "Naver Ads",
      description: "キーワードの一意の識別子",
    },
  },
  n_query: {
    en: {
      dimension: "Search Query",
      tool: "Naver Ads",
      description: "Actual search query entered by user",
    },
    ko: {
      dimension: "검색어",
      tool: "Naver Ads",
      description: "사용자가 실제로 검색한 검색어",
    },
    jp: {
      dimension: "検索クエリ",
      tool: "Naver Ads",
      description: "ユーザーが実際に入力した検索クエリ",
    },
  },
  n_match: {
    en: {
      dimension: "Match Type",
      tool: "Naver Ads",
      description: "Keyword matching method (1: exact, 2: broad, 3: related search, etc.)",
    },
    ko: {
      dimension: "매치 방식",
      tool: "Naver Ads",
      description: "키워드 매칭 방식 (1: 일치, 2: 확장, 3: 연관검색 등)",
    },
    jp: {
      dimension: "マッチタイプ",
      tool: "Naver Ads",
      description: "キーワードマッチング方法（1：完全一致、2：拡張、3：関連検索など）",
    },
  },
  n_network: {
    en: {
      dimension: "Network Type",
      tool: "Naver Ads",
      description: "Search or content network (search/contents)",
    },
    ko: {
      dimension: "매체 유형",
      tool: "Naver Ads",
      description: "검색 지면 또는 콘텐츠 지면 (search/contents)",
    },
    jp: {
      dimension: "ネットワークタイプ",
      tool: "Naver Ads",
      description: "検索またはコンテンツネットワーク（search/contents）",
    },
  },
  n_rank: {
    en: {
      dimension: "Ad Rank",
      tool: "Naver Ads",
      description: "Display position in ad area",
    },
    ko: {
      dimension: "광고 순위",
      tool: "Naver Ads",
      description: "광고 영역에서의 노출 순위",
    },
    jp: {
      dimension: "広告ランク",
      tool: "Naver Ads",
      description: "広告エリアでの表示位置",
    },
  },
  n_ad_group_type: {
    en: {
      dimension: "Ad Group Type",
      tool: "Naver Ads",
      description: "Ad group type (2: Shopping Search-Product, 5: Brand Search, etc.)",
    },
    ko: {
      dimension: "광고 그룹 유형",
      tool: "Naver Ads",
      description: "광고 그룹 유형 (2: 쇼핑검색-상품형, 5: 브랜드 검색 등)",
    },
    jp: {
      dimension: "広告グループタイプ",
      tool: "Naver Ads",
      description: "広告グループタイプ（2：ショッピング検索-商品、5：ブランド検索など）",
    },
  },
  n_source: {
    en: {
      dimension: "Source",
      tool: "Naver Ads",
      description: "Traffic source",
    },
    ko: {
      dimension: "소스",
      tool: "Naver Ads",
      description: "트래픽 소스",
    },
    jp: {
      dimension: "ソース",
      tool: "Naver Ads",
      description: "トラフィックソース",
    },
  },
  n_contract: {
    en: {
      dimension: "Contract ID",
      tool: "Naver Ads",
      description: "Unique identifier for Naver ad contract",
    },
    ko: {
      dimension: "계약 ID",
      tool: "Naver Ads",
      description: "네이버 광고 계약의 고유 식별자",
    },
    jp: {
      dimension: "契約ID",
      tool: "Naver Ads",
      description: "Naver広告契約の一意の識別子",
    },
  },

  // Kakao Ads
  k_campaign: {
    en: {
      dimension: "Campaign ID",
      tool: "Kakao Ads",
      description: "Unique identifier for Kakao campaign",
    },
    ko: {
      dimension: "캠페인 ID",
      tool: "Kakao Ads",
      description: "카카오 캠페인의 고유 식별자",
    },
    jp: {
      dimension: "キャンペーンID",
      tool: "Kakao Ads",
      description: "Kakaoキャンペーンの一意の識別子",
    },
  },
  k_media: {
    en: {
      dimension: "Media ID",
      tool: "Kakao Ads",
      description: "Kakao media identifier",
    },
    ko: {
      dimension: "매체 ID",
      tool: "Kakao Ads",
      description: "카카오 매체 식별자",
    },
    jp: {
      dimension: "メディアID",
      tool: "Kakao Ads",
      description: "Kakaoメディア識別子",
    },
  },
  k_keyword: {
    en: {
      dimension: "Keyword",
      tool: "Kakao Ads",
      description: "Kakao ad keyword",
    },
    ko: {
      dimension: "키워드",
      tool: "Kakao Ads",
      description: "카카오 광고 키워드",
    },
    jp: {
      dimension: "キーワード",
      tool: "Kakao Ads",
      description: "Kakao広告キーワード",
    },
  },
};

/**
 * 파라미터 키와 locale로부터 메타데이터를 가져옵니다.
 */
export function getParamMetadata(key: string, locale: Locale = "en"): ParamMetadata {
  const metadata = PARAM_METADATA_BY_LOCALE[key];
  if (metadata) {
    return metadata[locale] || metadata.en;
  }
  
  // 기본값
  const defaults: Record<Locale, ParamMetadata> = {
    en: {
      dimension: "-",
      tool: "Other",
      description: "Unknown parameter",
    },
    ko: {
      dimension: "-",
      tool: "기타",
      description: "알 수 없는 파라미터",
    },
    jp: {
      dimension: "-",
      tool: "その他",
      description: "不明なパラメータ",
    },
  };
  
  return defaults[locale] || defaults.en;
}
