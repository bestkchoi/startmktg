import type { UtmParams } from "@/types/utm";

export function buildUtmUrl(
  baseUrl: string,
  utm: UtmParams
): { finalUrl: string; mergedQuery: Record<string, string> } {
  const url = new URL(baseUrl);
  const searchParams = new URLSearchParams(url.search);

  for (const [key, value] of Object.entries(utm)) {
    if (!value) {
      continue;
    }

    searchParams.set(key, value);
  }

  const sortedEntries = Array.from(searchParams.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const mergedQuery: Record<string, string> = {};
  const sortedParams = new URLSearchParams();
  for (const [key, value] of sortedEntries) {
    mergedQuery[key] = value;
    sortedParams.append(key, value);
  }

  url.search = sortedParams.toString();

  return {
    finalUrl: url.toString(),
    mergedQuery
  };
}

import type { UtmParams } from "@/types/utm";

export function buildUtmUrl(
  baseUrl: string,
  utm: UtmParams
): { finalUrl: string; mergedQuery: Record<string, string> } {
  const url = new URL(baseUrl);
  const params = new URLSearchParams(url.search);

  Object.entries(utm).forEach(([key, value]) => {
    if (!value) {
      params.delete(key);
      return;
    }

    params.set(key, value);
  });

  const sortedEntries = Array.from(params.entries()).sort(([a], [b]) =>
    a.localeCompare(b)
  );

  const sortedParams = new URLSearchParams();
  const mergedQuery: Record<string, string> = {};

  for (const [key, value] of sortedEntries) {
    sortedParams.set(key, value);
    mergedQuery[key] = value;
  }

  const queryString = sortedParams.toString();
  url.search = queryString ? `?${queryString}` : "";

  return {
    finalUrl: url.toString(),
    mergedQuery
  };
}


