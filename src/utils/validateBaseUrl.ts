export function validateBaseUrl(
  baseUrl: string
): { valid: true; url: URL } | { valid: false; reason: string } {
  const trimmed = baseUrl.trim();

  if (!trimmed) {
    return { valid: false, reason: "URL이 비어 있습니다." };
  }

  try {
    const url = new URL(trimmed);

    if (!["http:", "https:"].includes(url.protocol)) {
      return { valid: false, reason: "URL 스킴은 http 또는 https여야 합니다." };
    }

    if (!url.hostname) {
      return { valid: false, reason: "URL 호스트가 존재하지 않습니다." };
    }

    return { valid: true, url };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "URL 파싱 중 알 수 없는 오류";
    return { valid: false, reason: message };
  }
}


