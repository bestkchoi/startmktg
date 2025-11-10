export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_source_platform?: string;
  utm_id?: string;
};

export type PlatformParamMap = Record<string, string>;

export type ApiError = {
  ok: false;
  code: string;
  message: string;
};


