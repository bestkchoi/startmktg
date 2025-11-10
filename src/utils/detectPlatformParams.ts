// src/utils/detectPlatformParams.ts
export type DetectedParams = {
  baseUrl: string;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  platform?: 'meta' | 'google' | 'kakao' | 'naver' | 'criteo' | 'unknown';
};

export function detectPlatformParams(targetUrl: string | URL): DetectedParams {
  const url = targetUrl instanceof URL ? targetUrl : new URL(String(targetUrl));
  const p = url.searchParams;

  const source = p.get('utm_source');
  const medium = p.get('utm_medium');

  return {
    baseUrl: `${url.origin}${url.pathname}`,
    utm_source: source,
    utm_medium: medium,
    utm_campaign: p.get('utm_campaign'),
    utm_content: p.get('utm_content'),
    utm_term: p.get('utm_term'),
    platform: inferPlatform(source, medium),
  };
}

function inferPlatform(
  source: string | null,
  medium: string | null
): DetectedParams['platform'] {
  const s = (source || '').toLowerCase();
  const m = (medium || '').toLowerCase();

  if (s.includes('meta') || s.includes('facebook') || s.includes('instagram')) return 'meta';
  if (s.includes('google') || m === 'cpc') return 'google';
  if (s.includes('kakao')) return 'kakao';
  if (s.includes('naver')) return 'naver';
  if (s.includes('criteo')) return 'criteo';
  return 'unknown';
}
