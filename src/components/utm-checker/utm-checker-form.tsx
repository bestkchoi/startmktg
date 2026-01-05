"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";
import { getParamMetadata } from "@/lib/utm-checker/param-metadata";
import { getAdProductFromParams, getAdGroupTypeFromParams } from "@/lib/utm-checker/naver-campaign-type";
import { getMediaInfoFromParams } from "@/lib/utm-checker/naver-media";

type ApiResponse =
  | {
      ok: true;
      parsed: Record<string, string>;
      diagnosis: Record<string, string>;
      diagnosisDetails?: Record<string, any>;
    }
  | {
      ok: false;
      message: string;
    };

type ParamInfo = {
  key: string;
  value: string;
  dimension: string;
  tool: string;
};

export function UtmCheckerForm({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ApiResponse | null>(null);
  const [ga4PreviewOpen, setGa4PreviewOpen] = useState(false);

  // 다국어 텍스트
  const texts = {
    en: {
      urlPlaceholder: "Please enter a URL",
      analyze: "Analyze",
      analyzing: "Analyzing...",
      errorUrlRequired: "Please enter a URL",
      errorRetry: "Please try again later",
      landingPageOptimization: "Landing Page URL Optimization",
      key: "Key",
      dimension: "Dimension",
      value: "Value",
      description: "Description",
      collectionTool: "Collection Tool",
      noParameters: "No parameters found.",
      ga4Optimization: "Google Analytics 4 Optimization",
      parameter: "Parameter",
      status: "Status",
      ok: "OK",
      missing: "Missing",
      warning: "Warning",
      notApplicable: "-",
      ga4Preview: "Google Analytics 4 Preview",
      sessionSourceMedium: "Session Source/Medium",
      sessionCampaign: "Session Campaign",
      sessionContent: "Session Content",
      sessionTerm: "Session Term",
      sessions: "Sessions",
      total: "Total",
      totalPercentage: "100% of total",
      utmSourceDesc: "utm_source is a required parameter. It identifies the source of traffic.",
      utmMediumDesc: "utm_medium is a required parameter. It identifies the marketing medium.",
      utmCampaignDesc: "utm_campaign is a required parameter. It identifies the campaign name.",
      utmIdDesc: "utm_id is a required parameter. It identifies the campaign ID.",
      utmContentDesc: "utm_content is a required parameter. It distinguishes variations of the same link.",
      utmTermDesc: "utm_term is a required parameter for search ads. It identifies the search keyword.",
    },
    ko: {
      urlPlaceholder: "URL을 입력해주세요",
      analyze: "분석하기",
      analyzing: "분석 중...",
      errorUrlRequired: "URL을 입력해주세요",
      errorRetry: "잠시 후 다시 시도해주세요",
      landingPageOptimization: "랜딩페이지 URL 최적화",
      key: "키",
      dimension: "Dimension",
      value: "값",
      description: "설명",
      collectionTool: "수집도구",
      noParameters: "파라미터가 없습니다.",
      ga4Optimization: "구글애널리틱스4 최적화",
      parameter: "파라미터",
      status: "상태",
      ok: "정상",
      missing: "누락됨",
      warning: "경고",
      notApplicable: "-",
      ga4Preview: "구글애널리틱스4 미리보기",
      sessionSourceMedium: "세션 소스/매체",
      sessionCampaign: "세션 캠페인",
      sessionContent: "세션 컨텐츠",
      sessionTerm: "세션 Term",
      sessions: "세션수",
      total: "합계",
      totalPercentage: "총계 대비 100%",
      utmSourceDesc: "utm_source는 필수 파라미터입니다. 트래픽의 출처를 식별합니다.",
      utmMediumDesc: "utm_medium은 필수 파라미터입니다. 마케팅 매체를 식별합니다.",
      utmCampaignDesc: "utm_campaign은 필수 파라미터입니다. 캠페인명을 식별합니다.",
      utmIdDesc: "utm_id는 필수 파라미터입니다. 캠페인 ID를 식별합니다.",
      utmContentDesc: "utm_content는 필수 파라미터입니다. 동일한 링크의 변형을 구분합니다.",
      utmTermDesc: "utm_term은 검색광고의 경우 필수 파라미터입니다. 검색 키워드를 식별합니다.",
    },
    jp: {
      urlPlaceholder: "URLを入力してください",
      analyze: "分析",
      analyzing: "分析中...",
      errorUrlRequired: "URLを入力してください",
      errorRetry: "しばらくしてからもう一度お試しください",
      landingPageOptimization: "ランディングページURL最適化",
      key: "キー",
      dimension: "Dimension",
      value: "値",
      description: "説明",
      collectionTool: "収集ツール",
      noParameters: "パラメータがありません。",
      ga4Optimization: "Google Analytics 4最適化",
      parameter: "パラメータ",
      status: "ステータス",
      ok: "正常",
      missing: "欠落",
      warning: "警告",
      notApplicable: "-",
      ga4Preview: "Google Analytics 4プレビュー",
      sessionSourceMedium: "セッションソース/メディア",
      sessionCampaign: "セッションキャンペーン",
      sessionContent: "セッションコンテンツ",
      sessionTerm: "セッションTerm",
      sessions: "セッション数",
      total: "合計",
      totalPercentage: "総計の100%",
      utmSourceDesc: "utm_sourceは必須パラメータです。トラフィックの発生元を識別します。",
      utmMediumDesc: "utm_mediumは必須パラメータです。マーケティングメディアを識別します。",
      utmCampaignDesc: "utm_campaignは必須パラメータです。キャンペーン名を識別します。",
      utmIdDesc: "utm_idは必須パラメータです。キャンペーンIDを識別します。",
      utmContentDesc: "utm_contentは必須パラメータです。同じリンクのバリエーションを区別します。",
      utmTermDesc: "utm_termは検索広告の場合、必須パラメータです。検索キーワードを識別します。",
    },
  };

  // en은 ko로 매핑
  const actualLocale = locale === "en" ? "ko" : locale;
  const t = texts[actualLocale] || texts.ko;

  // 분석 결과가 나오면 GA4 미리보기를 자동으로 열기
  useEffect(() => {
    if (result?.ok) {
      setGa4PreviewOpen(true);
    }
  }, [result]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!url.trim()) {
      setResult({
        ok: false,
        message: t.errorUrlRequired,
      });
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      const response = await fetch("/api/utm-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      });

      const data: ApiResponse = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        message: t.errorRetry,
      });
    } finally {
      setLoading(false);
    }
  };

  // 파라미터를 테이블 형식으로 정리
  const paramList: ParamInfo[] = result?.ok
    ? Object.entries(result.parsed).map(([key, value]) => {
        const metadata = getParamMetadata(key, locale);
        return {
          key,
          value,
          dimension: metadata.dimension,
          tool: metadata.tool,
        };
      })
    : [];

  // n_campaign_type이 있으면 광고 상품명 가져오기
  const adProductName = result?.ok ? getAdProductFromParams(result.parsed) : null;

  // n_ad_group_type이 있으면 광고 그룹 유형명 가져오기
  const adGroupTypeName = result?.ok ? getAdGroupTypeFromParams(result.parsed) : null;

  // n_media가 있으면 매체 정보 가져오기
  const mediaInfo = result?.ok ? getMediaInfoFromParams(result.parsed) : null;

  // 설명 컬럼에 표시할 정보가 있는지 확인
  const hasDescription = adProductName !== null || adGroupTypeName !== null || mediaInfo !== null;

  // 진단 결과 정리 (부가 설명 포함)
  const getDiagnosisDescription = (key: string, status: string): string | null => {
    if (status !== "missing") return null;
    
    const descriptions: Record<string, string> = {
      utm_source: t.utmSourceDesc,
      utm_medium: t.utmMediumDesc,
      utm_campaign: t.utmCampaignDesc,
      utm_id: t.utmIdDesc,
      utm_content: t.utmContentDesc,
      utm_term: t.utmTermDesc,
    };
    
    return descriptions[key] || null;
  };

  const diagnosisList: Array<{ key: string; status: string; label: string; value: string | null; description: string | null }> =
    result?.ok
      ? [
          {
            key: "utm_source",
            status: result.diagnosis.utm_source || "missing",
            label: "utm_source",
            value: result.parsed.utm_source || null,
            description: getDiagnosisDescription("utm_source", result.diagnosis.utm_source || "missing"),
          },
          {
            key: "utm_medium",
            status: result.diagnosis.utm_medium || "missing",
            label: "utm_medium",
            value: result.parsed.utm_medium || null,
            description: getDiagnosisDescription("utm_medium", result.diagnosis.utm_medium || "missing"),
          },
          {
            key: "utm_campaign",
            status: result.diagnosis.utm_campaign || "missing",
            label: "utm_campaign",
            value: result.parsed.utm_campaign || null,
            description: getDiagnosisDescription("utm_campaign", result.diagnosis.utm_campaign || "missing"),
          },
          {
            key: "utm_id",
            status: result.diagnosis.utm_id || "missing",
            label: "utm_id",
            value: result.parsed.utm_id || null,
            description: getDiagnosisDescription("utm_id", result.diagnosis.utm_id || "missing"),
          },
          {
            key: "utm_content",
            status: result.diagnosis.utm_content || "missing",
            label: "utm_content",
            value: result.parsed.utm_content || null,
            description: getDiagnosisDescription("utm_content", result.diagnosis.utm_content || "missing"),
          },
          {
            key: "utm_term",
            status: result.diagnosis.utm_term || "not_applicable",
            label: "utm_term",
            value: result.parsed.utm_term || null,
            description: getDiagnosisDescription("utm_term", result.diagnosis.utm_term || "not_applicable"),
          },
        ]
      : [];

  // GA4 미리보기 데이터
  const ga4Preview = result?.ok
    ? {
        session_source: result.parsed.utm_source || null,
        session_medium: result.parsed.utm_medium || null,
        session_campaign: result.parsed.utm_campaign || null,
        content: result.parsed.utm_content || null,
        term: result.parsed.utm_term || null,
      }
    : null;

  const getStatusLabel = (status: string): string => {
    switch (status) {
      case "ok":
        return t.ok;
      case "missing":
        return t.missing;
      case "warning":
        return t.warning;
      case "not_applicable":
        return t.notApplicable;
      default:
        return status;
    }
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case "ok":
        return "text-neutral-700";
      case "missing":
        return "text-neutral-500";
      case "warning":
        return "text-neutral-600";
      default:
        return "text-neutral-600";
    }
  };

  if (compact) {
    return (
      <div className="w-full space-y-4">
        <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 sm:flex-row sm:items-stretch">
          <label htmlFor="utm-url" className="sr-only">
            {t.urlPlaceholder}
          </label>
          <input
            id="utm-url"
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com?utm_source=google&utm_medium=cpc"
            disabled={loading}
            className="flex-1 border border-neutral-200 bg-white px-6 py-4 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
          />
          <button
            type="submit"
            disabled={loading}
            className="group relative min-w-[140px] border border-neutral-900 bg-neutral-900 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="relative z-10">
              {loading ? t.analyzing : t.analyze}
            </span>
          </button>
        </form>

        {/* 에러 메시지 */}
        {result && !result.ok && (
          <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-700">
            {result.message}
          </div>
        )}

        {/* 결과 섹션 - 상세 버전 */}
        {result?.ok && (
          <div className="w-full space-y-8" aria-live="polite">
            {/* 랜딩페이지 URL 최적화 */}
            <div>
              <h3 className={`text-lg font-light tracking-[-0.02em] mb-4 ${locale === "ko" ? "uppercase" : ""}`}>
                {t.landingPageOptimization}
              </h3>
              {paramList.length > 0 ? (
                <div className="border border-neutral-200">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-neutral-200 bg-neutral-50">
                        <th className="text-left p-3 text-sm font-medium text-neutral-900">
                          {t.key}
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-neutral-900">
                          {t.dimension}
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-neutral-900">
                          {t.value}
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-neutral-900">
                          {t.description}
                        </th>
                        <th className="text-left p-3 text-sm font-medium text-neutral-900">
                          {t.collectionTool}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {paramList.map((param) => {
                        const getDescription = () => {
                          if (param.key === "n_media" && mediaInfo) {
                            return (
                              <div className="space-y-1">
                                <div>{mediaInfo.mediaName}</div>
                                {mediaInfo.locations.length > 0 && (
                                  <div className="text-xs text-neutral-300">
                                    ({mediaInfo.locations.join(", ")})
                                  </div>
                                )}
                              </div>
                            );
                          } else if (param.key === "n_campaign_type" && adProductName) {
                            return adProductName;
                          } else if (param.key === "n_ad_group_type" && adGroupTypeName) {
                            return adGroupTypeName;
                          }
                          return null;
                        };

                        const description = getDescription();
                        const hasDescription = description !== null;

                        return (
                          <tr
                            key={param.key}
                            className="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                          >
                            <td className="p-3 font-mono text-sm text-neutral-900">
                              {param.key}
                            </td>
                            <td className="p-3 text-sm text-neutral-700">
                              {param.dimension}
                            </td>
                            <td className="p-3 break-all text-sm text-neutral-700">
                              {param.value}
                            </td>
                            <td className="p-3 text-sm text-neutral-700">
                              {hasDescription ? (
                                <div className="group relative inline-flex items-center">
                                  <svg className="w-4 h-4 text-neutral-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  <div className="absolute left-0 bottom-full mb-2 w-72 max-w-[calc(100vw-2rem)] p-4 bg-neutral-900 text-white text-sm leading-relaxed rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                                    <div className="space-y-2">
                                      <div className="font-semibold text-base">{param.dimension}</div>
                                      <div className="whitespace-normal break-words">{description}</div>
                                    </div>
                                    <div className="absolute top-full left-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                                  </div>
                                </div>
                              ) : (
                                "-"
                              )}
                            </td>
                            <td className="p-3 text-sm text-neutral-600">
                              {param.tool}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-500 text-center">
                  {t.noParameters}
                </div>
              )}
            </div>

            {/* 진단 결과 */}
            <div>
              <h3 className={`text-lg font-light tracking-[-0.02em] mb-4 ${locale === "ko" ? "uppercase" : ""}`}>
                {t.ga4Optimization}
              </h3>
              <div className="border border-neutral-200 bg-white">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50">
                      <th className="text-left p-3 text-sm font-medium text-neutral-900 w-[140px]">
                        {t.parameter}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-900">
                        {t.value}
                      </th>
                      <th className="text-left p-3 text-sm font-medium text-neutral-900 w-[120px]">
                        {t.status}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {diagnosisList.map((item) => (
                      <tr
                        key={item.key}
                        className="border-b border-neutral-100 transition-colors hover:bg-neutral-50"
                      >
                        <td className="p-3 text-sm font-medium text-neutral-900">
                          {item.label}
                        </td>
                        <td className="p-3 break-all text-sm text-neutral-700 font-mono">
                          {item.value || "-"}
                        </td>
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <span
                              className={`text-sm ${getStatusColor(item.status)}`}
                            >
                              {getStatusLabel(item.status)}
                            </span>
                            {item.description && (
                              <div className="group relative flex-shrink-0">
                                <svg className="w-4 h-4 text-neutral-400 cursor-help" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="absolute right-0 bottom-full mb-2 w-72 max-w-[calc(100vw-2rem)] p-4 bg-neutral-900 text-white text-sm leading-relaxed rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 shadow-xl">
                                  <div className="space-y-2">
                                    <div className="font-semibold text-base">{item.label}</div>
                                    <div className="whitespace-normal break-words">{item.description}</div>
                                  </div>
                                  <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-neutral-900"></div>
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* GA4 미리보기 */}
            {ga4Preview && (
              <div className="group">
                <div 
                  className="w-full flex items-center justify-between px-4 py-3 mb-4 border border-neutral-200 bg-white rounded-lg transition-all duration-200 hover:bg-neutral-50 hover:border-neutral-300 cursor-pointer"
                  onClick={() => setGa4PreviewOpen(!ga4PreviewOpen)}
                >
                  <h3 className={`text-lg font-light tracking-[-0.02em] text-neutral-900 ${locale === "ko" ? "uppercase" : ""}`}>
                    {t.ga4Preview}
                  </h3>
                  <svg
                    className={`w-5 h-5 text-neutral-500 transition-transform duration-200 ${
                      ga4PreviewOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
                <div className={`bg-white border border-neutral-200 rounded-lg shadow-sm transition-all duration-200 mb-4 ${
                  ga4PreviewOpen ? "opacity-100 visible" : "opacity-0 invisible"
                }`}>
                  {/* 필터 섹션 */}
                  <div className="px-6 py-3 border-b border-neutral-200 bg-white flex items-center gap-3">
                    <div className="relative inline-flex items-center border border-neutral-300 rounded bg-white px-3 py-1.5 text-sm text-neutral-700">
                      <span>{t.sessionSourceMedium}</span>
                      <svg className="w-4 h-4 ml-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                    <div className="relative inline-flex items-center border border-neutral-300 rounded bg-white px-3 py-1.5 text-sm text-neutral-700">
                      <span>{t.sessionCampaign}</span>
                      <svg className="w-4 h-4 ml-2 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* 테이블 */}
                  <div className="overflow-x-auto -mx-px">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-white">
                          <th className="text-left px-4 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider w-12">
                            
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            {t.sessionSourceMedium}
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            {t.sessionCampaign}
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            {t.sessionContent}
                          </th>
                          <th className="text-left px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            {t.sessionTerm}
                          </th>
                          <th className="text-right px-6 py-3 text-xs font-medium text-neutral-600 uppercase tracking-wider">
                            <div className="flex items-center justify-end gap-1">
                              <svg className="w-3 h-3 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                              <span className="border-b border-dashed border-neutral-300 pb-0.5">{t.sessions}</span>
                            </div>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {/* 합계 행 */}
                        <tr className="bg-white">
                          <td className="px-4 py-3 text-sm text-neutral-500">
                            
                          </td>
                          <td colSpan={4} className="px-6 py-3 text-sm font-medium text-neutral-900">
                            {t.total}
                          </td>
                          <td className="px-6 py-3 text-sm text-neutral-900 text-right">
                            <div className="font-medium">1</div>
                            <div className="text-xs text-neutral-500">{t.totalPercentage}</div>
                          </td>
                        </tr>
                        {/* 데이터 행 */}
                        <tr className="border-b border-neutral-100 bg-neutral-50 transition-colors hover:bg-blue-50">
                          <td className="px-4 py-4 text-sm text-neutral-500">
                            1
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">
                            {ga4Preview.session_source && ga4Preview.session_medium
                              ? `${ga4Preview.session_source} / ${ga4Preview.session_medium}`
                              : ga4Preview.session_source
                              ? `${ga4Preview.session_source} / (none)`
                              : ga4Preview.session_medium
                              ? `(none) / ${ga4Preview.session_medium}`
                              : "(direct) / (none)"}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">
                            {ga4Preview.session_campaign || "(none)"}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">
                            {ga4Preview.content || "(none)"}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900">
                            {ga4Preview.term || "(none)"}
                          </td>
                          <td className="px-6 py-4 text-sm text-neutral-900 text-right font-medium">
                            1 (100%)
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // 전체 버전은 기존 코드 사용
  return null;
}






