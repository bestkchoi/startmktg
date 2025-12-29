/**
 * GA4 수집 미리보기 데이터 생성
 * PRD_UTM_Checker_v1.2 기준
 */

import type { ParsedParams } from "./parseUrl";

export type GA4Preview = {
  session_source: string | null;
  session_medium: string | null;
  session_campaign: string | null;
  content: string | null;
  term: string | null;
};

/**
 * 파싱된 파라미터로부터 GA4 수집 데이터 미리보기를 생성합니다.
 */
export function generateGA4Preview(params: ParsedParams): GA4Preview {
  return {
    session_source: params.utm_source || null,
    session_medium: params.utm_medium || null,
    session_campaign: params.utm_campaign || null,
    content: params.utm_content || null,
    term: params.utm_term || null,
  };
}



