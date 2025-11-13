"use client";

import { useMemo, useState } from "react";
import { trackEvent, trackUtmParams } from "@/lib/analytics";

type ResultState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "success";
      requiredOk: boolean;
      params: Record<string, string>;
      utmParams: Record<string, string>;
    };

type ParamMeta = {
  label: string;
  badgeClass: string;
  order: number;
};

const REQUIRED_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

const PARAM_GROUPS: Array<{ keys: string[]; meta: ParamMeta }> = [
  {
    keys: ["utm_source", "utm_medium", "utm_campaign"],
    meta: {
      label: "GA4 기본 수집 항목",
      badgeClass: "",
      order: 0,
    },
  },
  {
    keys: ["utm_content", "utm_term", "utm_source_platform", "utm_id"],
    meta: {
      label: "GA4 선택 수집 항목",
      badgeClass: "",
      order: 1,
    },
  },
  {
    keys: ["fbclid"],
    meta: {
      label: "Meta/Facebook Ads 자동 매핑",
      badgeClass: "",
      order: 2,
    },
  },
  {
    keys: ["gclid"],
    meta: {
      label: "Google Ads 자동 매핑",
      badgeClass: "",
      order: 3,
    },
  },
  {
    keys: ["n_media", "n_query", "n_ad_group", "n_campaign", "n_rank"],
    meta: {
      label: "네이버 검색광고 추적 파라미터",
      badgeClass: "",
      order: 4,
    },
  },
  {
    keys: ["k_campaign", "k_creative", "k_medium", "k_keyword"],
    meta: {
      label: "카카오 광고 추적 파라미터",
      badgeClass: "",
      order: 5,
    },
  },
  {
    keys: ["criteo_p", "criteo_c", "criteo_r"],
    meta: {
      label: "Criteo 리타게팅 파라미터",
      badgeClass: "",
      order: 6,
    },
  },
];

const PARAM_META_MAP = PARAM_GROUPS.reduce<Record<string, ParamMeta>>((acc, group) => {
  group.keys.forEach((key) => {
    acc[key] = group.meta;
  });
  return acc;
}, {});

const DEFAULT_META: ParamMeta = {
  label: "커스텀 파라미터",
  badgeClass: "",
  order: 999,
};

export default function UtmCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  const entries = useMemo(() => {
    if (result.status !== "success") return [] as Array<{
      key: string;
      value: string;
      meta: ParamMeta;
    }>;

    return Object.entries(result.params)
      .map(([key, value]) => ({
        key,
        value,
        meta: PARAM_META_MAP[key] ?? DEFAULT_META,
      }))
      .sort((a, b) => {
        if (a.meta.order !== b.meta.order) {
          return a.meta.order - b.meta.order;
        }
        return a.key.localeCompare(b.key);
      });
  }, [result]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setResult({ status: "error", message: "URL을 입력해주세요." });
      return;
    }

    try {
      const parsedUrl = new URL(trimmed);
      const searchParams = parsedUrl.searchParams;

      const allParams: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        allParams[key] = value;
      });

      const utmParams = Object.fromEntries(
        Object.entries(allParams).filter(([key]) => key.startsWith("utm_"))
      );

      const requiredOk = REQUIRED_KEYS.every(
        (key) => typeof utmParams[key] === "string" && utmParams[key]?.trim()
      );

      // GA4 이벤트 추적
      trackEvent("utm_check", {
        event_category: "utm_checker",
        event_label: requiredOk ? "valid_utm" : "invalid_utm",
        has_utm_source: !!utmParams.utm_source,
        has_utm_medium: !!utmParams.utm_medium,
        has_utm_campaign: !!utmParams.utm_campaign,
        param_count: Object.keys(allParams).length,
      });

      // UTM 파라미터 추적
      if (Object.keys(utmParams).length > 0) {
        trackUtmParams(utmParams);
      }

      setResult({
        status: "success",
        requiredOk,
        params: allParams,
        utmParams,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "검사 중 오류가 발생했습니다.";
      
      // 에러 이벤트 추적
      trackEvent("utm_check_error", {
        event_category: "utm_checker",
        event_label: "url_parse_error",
        error_message: message,
      });
      
      setResult({ status: "error", message });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-16 text-center">
          <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-3">
            UTM Checker
          </h1>
          <div className="h-px w-16 bg-neutral-300 mx-auto" />
        </header>

        {/* 입력 폼 */}
        <form
          onSubmit={handleSubmit}
          className="mb-20 flex w-full flex-col gap-4 sm:flex-row sm:items-stretch"
        >
          <label htmlFor="utm-url" className="sr-only">
            UTM URL 입력
          </label>
          <input
            id="utm-url"
            type="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
            placeholder="https://example.com/?utm_source=startmktg&utm_medium=cpc&utm_campaign=launch"
            className="flex-1 border border-neutral-200 bg-white px-6 py-4 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
          />
          <button
            type="submit"
            className="group relative min-w-[140px] border border-neutral-900 bg-neutral-900 px-8 py-4 text-sm font-medium text-white transition-all duration-300 hover:bg-white hover:text-neutral-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
          >
            <span className="relative z-10">Check</span>
          </button>
        </form>

        {/* 결과 섹션 */}
        <section className="w-full" aria-live="polite">
          {result.status === "idle" && (
            <div className="text-center text-sm text-neutral-400">
              <div className="h-px w-24 bg-neutral-200 mx-auto mb-4" />
            </div>
          )}

          {result.status === "error" && (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-700">
              {result.message}
            </div>
          )}

          {result.status === "success" && (
            <div className="space-y-6">
              {entries.length > 0 ? (
                <ul className="space-y-2">
                  {entries.map(({ key, value, meta }) => (
                    <li
                      key={key}
                      className="group flex items-start gap-6 border-b border-neutral-100 px-2 py-4 transition-colors hover:bg-neutral-50"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="mb-2 flex items-center gap-3">
                          <span className="text-xs font-mono uppercase tracking-wider text-neutral-500">
                            {key}
                          </span>
                          <span className="text-xs text-neutral-400">/</span>
                          <span className="text-xs text-neutral-500">
                            {meta.label}
                          </span>
                        </div>
                        <div className="break-all text-sm text-neutral-900" title={value}>
                          {value}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-500 text-center">
                  쿼리 파라미터가 없습니다.
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

