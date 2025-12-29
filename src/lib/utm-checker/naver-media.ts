/**
 * 네이버 검색광고 매체 정보
 * CSV 파일 기반 매체ID → 매체 정보 매핑
 */

export type NaverMediaInfo = {
  mediaId: string;
  mediaName: string;
  mediaUrl: string;
  locations: string[]; // 노출 위치 정보
};

// CSV 데이터를 직접 정의 (인코딩 문제로 CSV 파일 읽기 대신)
// 형식: 매체ID, 매체이름, 매체URL, 네이버, 포털, 검색포탈, 검색영역포함, PC영역포함, 모바일영역포함
const MEDIA_DATA: Array<[string, string, string, string, string, string, string, string, string]> = [
  ["27758", "네이버 통합검색 - PC", "http://search.naver.com/search.naver", "O", "", "O", "O", "", "O"],
  ["8753", "네이버 통합검색 - 모바일", "http://m.search.naver.com/search.naver", "O", "", "O", "O", "", "O"],
  ["122876", "네이버 사이트검색", "http://search.naver.com/search.naver?where=site", "O", "", "O", "O", "", "O"],
  ["122875", "네이버 통합검색 연관검색어", "http://ad.search.naver.com/search.naver", "O", "", "O", "O", "", "O"],
  ["11068", "네이버 쇼핑 - PC", "http://shopping.naver.com", "O", "", "", "O", "", "O"],
  ["33421", "네이버 쇼핑 - 모바일", "http://m.shopping.naver.com", "O", "", "", "O", "", "O"],
  ["1525", "네이버 지식iN - PC", "http://kin.naver.com", "O", "", "", "", "O", ""],
  ["36010", "네이버 지식iN - 모바일", "http://m.kin.naver.com", "O", "", "", "", "", "O"],
  ["96499", "네이버 카페 - PC", "http://cafe.naver.com", "O", "", "", "", "O", ""],
  ["96500", "네이버 카페 - 모바일", "http://m.cafe.naver.com", "O", "", "", "", "", "O"],
  ["118495", "ZUM - PC", "http://zum.com", "", "O", "O", "O", "O", ""],
  ["118496", "ZUM - 모바일", "http://m.zum.com", "", "O", "O", "O", "", "O"],
  ["700903", "네이버 통합검색 피드형 연관검색어 - 모바일", "https://m.search.naver.com/search.naver#searchfeed", "O", "", "O", "", "O", "O"],
  ["103848", "밴드(BAND) - 모바일", "http://band.us/", "O", "", "", "", "", "O"],
  ["38367", "11번가 - PC", "http://www.11st.co.kr", "", "O", "", "O", "O", ""],
  ["38630", "11번가 - 모바일", "http://m.11st.co.kr", "", "O", "", "O", "", "O"],
  // 더 많은 데이터는 필요시 추가
];

const LOCATION_LABELS: Record<number, string> = {
  3: "네이버",
  4: "포털",
  5: "검색포탈",
  6: "검색영역포함",
  7: "PC영역포함",
  8: "모바일영역포함",
};

/**
 * 매체ID로 매체 정보를 가져옵니다.
 */
export function getNaverMediaInfo(mediaId: string | undefined): NaverMediaInfo | null {
  if (!mediaId) return null;

  const media = MEDIA_DATA.find(([id]) => id === mediaId);
  if (!media) return null;

  const [, mediaName, mediaUrl, naver, portal, searchPortal, searchArea, pcArea, mobileArea] = media;

  const locations: string[] = [];
  if (naver === "O") locations.push("네이버");
  if (portal === "O") locations.push("포털");
  if (searchPortal === "O") locations.push("검색포탈");
  if (searchArea === "O") locations.push("검색영역포함");
  if (pcArea === "O") locations.push("PC영역포함");
  if (mobileArea === "O") locations.push("모바일영역포함");

  return {
    mediaId,
    mediaName,
    mediaUrl,
    locations,
  };
}

/**
 * 파싱된 파라미터에서 n_media를 찾아 매체 정보를 반환
 */
export function getMediaInfoFromParams(parsed: Record<string, string>): NaverMediaInfo | null {
  return getNaverMediaInfo(parsed.n_media);
}


