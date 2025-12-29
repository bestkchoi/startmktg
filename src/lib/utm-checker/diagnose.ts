/**
 * UTM 파라미터 진단 로직
 * PRD_UTM_Checker_v1.2 기준
 */

import type { ParsedParams } from "./parseUrl";

export type DiagnosisResult = {
  utm_source: "ok" | "missing" | "warning";
  utm_medium: "ok" | "missing" | "warning";
  utm_campaign: "ok" | "missing" | "warning";
  utm_id: "ok" | "missing" | "warning";
  utm_content: "ok" | "missing" | "warning";
  utm_term: "ok" | "missing" | "warning" | "not_applicable";
  uppercase_check: "ok" | "warning";
  [key: string]: "ok" | "missing" | "warning" | "not_applicable" | string;
};

export type DiagnosisDetails = {
  utm_source?: string;
  utm_medium?: string;
  utm_id?: string;
  format_issues?: string[];
  uppercase_issues?: string[];
};

/**
 * 파싱된 파라미터를 진단합니다.
 */
export function diagnose(params: ParsedParams): {
  result: DiagnosisResult;
  details: DiagnosisDetails;
} {
  const result: DiagnosisResult = {
    utm_source: "ok",
    utm_medium: "ok",
    utm_campaign: "ok",
    utm_id: "ok",
    utm_content: "ok",
    utm_term: "not_applicable",
    uppercase_check: "ok",
  };
  
  const details: DiagnosisDetails = {};
  const formatIssues: string[] = [];
  const uppercaseIssues: string[] = [];

  // 5-1. 필수값 체크
  if (!params.utm_source || params.utm_source.trim().length === 0) {
    result.utm_source = "missing";
  } else {
    // 포맷 체크
    const sourceIssues = checkFormat(params.utm_source, "utm_source");
    if (sourceIssues.length > 0) {
      result.utm_source = "warning";
      formatIssues.push(...sourceIssues);
    }
    // 대문자 체크
    if (/[A-Z]/.test(params.utm_source)) {
      uppercaseIssues.push("utm_source");
    }
  }

  if (!params.utm_medium || params.utm_medium.trim().length === 0) {
    result.utm_medium = "missing";
  } else {
    // 포맷 체크
    const mediumIssues = checkFormat(params.utm_medium, "utm_medium");
    if (mediumIssues.length > 0) {
      result.utm_medium = "warning";
      formatIssues.push(...mediumIssues);
    }
    // 대문자 체크
    if (/[A-Z]/.test(params.utm_medium)) {
      uppercaseIssues.push("utm_medium");
    }
  }

  // utm_campaign 체크
  if (!params.utm_campaign || params.utm_campaign.trim().length === 0) {
    result.utm_campaign = "missing";
  } else {
    const campaignIssues = checkFormat(params.utm_campaign, "utm_campaign");
    if (campaignIssues.length > 0) {
      result.utm_campaign = "warning";
      formatIssues.push(...campaignIssues);
    }
    // 대문자 체크
    if (/[A-Z]/.test(params.utm_campaign)) {
      uppercaseIssues.push("utm_campaign");
    }
  }

  // 5-3. utm_id 체크
  if (params.utm_id) {
    const idIssues = checkUtmIdFormat(params.utm_id);
    if (idIssues.length > 0) {
      result.utm_id = "warning";
      formatIssues.push(...idIssues);
      details.utm_id = idIssues.join(", ");
    }
  } else {
    result.utm_id = "missing";
  }

  // utm_content 체크
  if (!params.utm_content || params.utm_content.trim().length === 0) {
    result.utm_content = "missing";
  } else {
    const contentIssues = checkFormat(params.utm_content, "utm_content");
    if (contentIssues.length > 0) {
      result.utm_content = "warning";
      formatIssues.push(...contentIssues);
    }
    // 대문자 체크
    if (/[A-Z]/.test(params.utm_content)) {
      uppercaseIssues.push("utm_content");
    }
  }

  // utm_term 체크
  // utm_term이 존재하면 항상 체크, 검색광고인데 없으면 missing, 아니면 not_applicable
  const isSearchAds = isSearchAdvertising(params.utm_medium);
  if (params.utm_term && params.utm_term.trim().length > 0) {
    // utm_term은 검색어이므로 다국어 문자 허용, 공백만 체크
    const termIssues: string[] = [];
    // 공백 포함 여부만 체크 (검색어는 다국어 문자 허용)
    if (/\s/.test(params.utm_term)) {
      termIssues.push("utm_term에 공백이 포함되어 있습니다");
    }
    
    if (termIssues.length > 0) {
      result.utm_term = "warning";
      formatIssues.push(...termIssues);
    } else {
      result.utm_term = "ok";
    }
    // utm_term은 검색어이므로 대문자 체크 제외
  } else {
    // utm_term이 없는 경우
    if (isSearchAds) {
      result.utm_term = "missing";
    } else {
      result.utm_term = "not_applicable";
    }
  }

  // 대문자 체크 결과
  if (uppercaseIssues.length > 0) {
    result.uppercase_check = "warning";
    details.uppercase_issues = uppercaseIssues;
  }

  if (formatIssues.length > 0) {
    details.format_issues = formatIssues;
  }

  return { result, details };
}

/**
 * 검색광고 매체인지 확인
 * utm_term은 검색광고일 경우에만 필수
 */
function isSearchAdvertising(medium: string | undefined): boolean {
  if (!medium) return false;
  const searchMediums = ["cpc", "paid-search", "ppc", "search", "searchad"];
  return searchMediums.includes(medium.toLowerCase());
}

/**
 * 포맷 체크 (공백, 대문자, 특수문자)
 */
function checkFormat(value: string, paramName: string): string[] {
  const issues: string[] = [];

  // 공백 포함 여부
  if (/\s/.test(value)) {
    issues.push(`${paramName}에 공백이 포함되어 있습니다`);
  }

  // 대문자 포함 시 warning
  if (/[A-Z]/.test(value)) {
    issues.push(`${paramName}에 대문자가 포함되어 있습니다 (소문자 권장)`);
  }

  // 특수문자 허용 범위 초과 시 warning
  // 허용: 하이픈(-), 언더스코어(_), 점(.)
  // 그 외 특수문자는 warning
  const allowedSpecialChars = /^[a-z0-9\-_.]+$/i;
  if (!allowedSpecialChars.test(value)) {
    const invalidChars = value.match(/[^a-z0-9\-_.]/gi);
    if (invalidChars) {
      const uniqueChars = [...new Set(invalidChars)];
      issues.push(`${paramName}에 허용되지 않는 특수문자가 포함되어 있습니다: ${uniqueChars.join(", ")}`);
    }
  }

  return issues;
}

/**
 * utm_id 형식 체크 (숫자 또는 영문 조합만 허용)
 */
function checkUtmIdFormat(value: string): string[] {
  const issues: string[] = [];

  // 숫자 또는 영문 조합만 허용
  const validPattern = /^[a-zA-Z0-9]+$/;
  if (!validPattern.test(value)) {
    issues.push("utm_id는 숫자 또는 영문 조합만 허용됩니다");
  }

  return issues;
}

