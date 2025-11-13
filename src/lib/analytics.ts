/**
 * Google Analytics 4 이벤트 추적 유틸리티
 * 
 * 사용법:
 * import { trackEvent } from '@/lib/analytics';
 * 
 * trackEvent('button_click', {
 *   button_name: 'utm_check',
 *   page_path: '/utmchecker'
 * });
 */

declare global {
  interface Window {
    gtag?: (
      command: "config" | "set" | "event" | "js" | "consent",
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

type EventParams = {
  event_category?: string;
  event_label?: string;
  value?: number;
  [key: string]: string | number | boolean | undefined;
};

/**
 * GA4 이벤트 추적
 * @param eventName - 이벤트 이름 (예: 'button_click', 'page_view')
 * @param params - 이벤트 파라미터
 */
export function trackEvent(eventName: string, params?: EventParams) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", eventName, params);
}

/**
 * 페이지뷰 추적
 * @param pagePath - 페이지 경로 (예: '/utmchecker')
 * @param pageTitle - 페이지 제목 (선택)
 */
export function trackPageView(pagePath: string, pageTitle?: string) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("config", process.env.NEXT_PUBLIC_GA4_ID || "", {
    page_path: pagePath,
    page_title: pageTitle,
  });
}

/**
 * UTM 파라미터 추적
 * @param utmParams - UTM 파라미터 객체
 */
export function trackUtmParams(utmParams: {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
}) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  const params: Record<string, string> = {};

  if (utmParams.utm_source) {
    params.source = utmParams.utm_source;
  }
  if (utmParams.utm_medium) {
    params.medium = utmParams.utm_medium;
  }
  if (utmParams.utm_campaign) {
    params.campaign = utmParams.utm_campaign;
  }
  if (utmParams.utm_content) {
    params.content = utmParams.utm_content;
  }
  if (utmParams.utm_term) {
    params.term = utmParams.utm_term;
  }

  if (Object.keys(params).length > 0) {
    window.gtag("event", "utm_detected", params);
  }
}

