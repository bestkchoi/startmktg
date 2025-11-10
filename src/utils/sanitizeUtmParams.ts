import type { UtmParams } from "@/types/utm";

export function sanitizeUtmParams(input: Partial<UtmParams>): UtmParams {
  const sanitized: UtmParams = {};

  for (const [key, value] of Object.entries(input)) {
    if (typeof value !== "string") {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    sanitized[key as keyof UtmParams] = trimmed;
  }

  return sanitized;
}

import type { UtmParams } from "@/types/utm";

export function sanitizeUtmParams(input: Partial<UtmParams>): UtmParams {
  const entries = Object.entries(input ?? {});
  const sanitized = entries.reduce<Record<string, string>>((acc, [key, value]) => {
    if (value === undefined || value === null) {
      return acc;
    }

    const trimmed = String(value).trim();

    if (!trimmed) {
      return acc;
    }

    acc[key] = trimmed;
    return acc;
  }, {});

  return sanitized as UtmParams;
}


