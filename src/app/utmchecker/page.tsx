"use client";

import { useMemo, useState } from "react";

type ResultState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | {
      status: "success";
      requiredOk: boolean;
      params: Record<string, string>;
      utmParams: Record<string, string>;
    };

const REQUIRED_KEYS = ["utm_source", "utm_medium", "utm_campaign"] as const;

export default function UtmCheckerPage() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<ResultState>({ status: "idle" });

  const entries = useMemo(() => {
    if (result.status !== "success") return [];
    return Object.entries(result.params);
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

      setResult({
        status: "success",
        requiredOk,
        params: allParams,
        utmParams
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "검사 중 오류가 발생했습니다.";
      setResult({ status: "error", message });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col items-center gap-10 px-4 py-16 sm:px-6">
        <header className="w-full text-center">
          <h1 className="text-3xl font-semibold tracking-tight">UTM Checker</h1>
          <p className="mt-2 text-sm text-neutral-500">
            URL 한 줄을 입력하고 UTM 파라미터를 바로 확인해보세요.
          </p>
        </header>

        <form
          onSubmit={handleSubmit}
          className="flex w-full max-w-2xl flex-col gap-3 sm:flex-row sm:items-center"
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
            className="w-full rounded-full border border-neutral-200 bg-white px-5 py-3 text-sm shadow-sm outline-none transition focus:border-neutral-400 focus:ring-1 focus:ring-neutral-400"
          />
          <button
            type="submit"
            className="w-full rounded-full border border-neutral-900 bg-neutral-900 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-neutral-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900 sm:w-auto"
          >
            Check
          </button>
        </form>

        <section
          className="w-full max-w-2xl text-sm text-neutral-800"
          aria-live="polite"
        >
          {result.status === "idle" && (
            <p className="text-neutral-500">
              결과가 여기에 표시됩니다. URL을 입력한 뒤 Check 버튼을 눌러주세요.
            </p>
          )}

          {result.status === "error" && <p className="font-medium">{result.message}</p>}

          {result.status === "success" && (
            <div className="space-y-4">
              <p className="font-medium">
                {Object.keys(result.params).length === 0
                  ? "URL에 쿼리 파라미터가 없습니다."
                  : Object.keys(result.utmParams).length === 0
                    ? "UTM 파라미터가 포함되지 않았습니다. 필요한 경우 utm_source, utm_medium, utm_campaign 등을 추가하세요."
                    : result.requiredOk
                      ? "OK, 기본 UTM 파라미터가 확인되었습니다."
                      : "기본 UTM 파라미터가 없습니다. utm_source, utm_medium, utm_campaign 을 확인하세요."}
              </p>

              {entries.length > 0 ? (
                <ul className="space-y-2 text-neutral-700">
                  {entries.map(([key, value]) => (
                    <li
                      key={key}
                      className="flex items-center justify-between rounded border border-neutral-200 px-3 py-2"
                    >
                      <span className="font-semibold uppercase tracking-wide">{key}</span>
                      <span className="ml-4 max-w-[60%] truncate text-right">{value}</span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

