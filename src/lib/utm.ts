export type BuildOptions = {
  lowercaseKeys: boolean;
  trimEmptyParams: boolean;
  encodeSpace: "%20" | "+";
};

export type ParsedUtm = {
  baseUrl: string;
} & Record<string, string>;

const DEFAULT_OPTIONS: BuildOptions = {
  lowercaseKeys: false,
  trimEmptyParams: false,
  encodeSpace: "%20"
};

export const buildUtmUrl = (
  base: string,
  params: Record<string, string | undefined | null>,
  options: Partial<BuildOptions> = {}
) => {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options };
  const url = new URL(base);

  Object.entries(params).forEach(([rawKey, rawValue]) => {
    if (rawValue == null) {
      return;
    }

    const value = mergedOptions.trimEmptyParams ? rawValue.trim() : rawValue;
    if (!value && mergedOptions.trimEmptyParams) {
      return;
    }

    const key = mergedOptions.lowercaseKeys ? rawKey.toLowerCase() : rawKey;
    const encodedValue = encodeURIComponent(value).replace(
      /%20/g,
      mergedOptions.encodeSpace === "%20" ? "%20" : "+"
    );

    url.searchParams.append(key, encodedValue);
  });

  return url.toString();
};

export const parseUtmUrl = (urlString: string): ParsedUtm | null => {
  try {
    const url = new URL(urlString);
    const entries = Object.fromEntries(url.searchParams.entries());

    return {
      baseUrl: `${url.origin}${url.pathname}`,
      ...entries
    };
  } catch {
    return null;
  }
};

export const extractUtmParams = (params: Record<string, unknown>) => {
  const allowedKeys = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term"
  ] as const;

  return allowedKeys.reduce<Record<string, string>>((acc, key) => {
    const value = params[key];
    if (typeof value === "string") {
      acc[key] = value;
    }
    return acc;
  }, {});
};


