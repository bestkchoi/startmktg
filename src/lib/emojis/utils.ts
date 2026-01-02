// 클립보드 복사 유틸리티
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error("복사 실패:", err);
    return false;
  }
}

// 로컬 스토리지에서 최근 사용한 이모지 가져오기
export function getRecentEmojis(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("recentEmojis");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 최근 사용한 이모지 저장
export function saveRecentEmoji(emoji: string): void {
  if (typeof window === "undefined") return;
  try {
    const recent = getRecentEmojis();
    const updated = [emoji, ...recent.filter((e) => e !== emoji)].slice(0, 30);
    localStorage.setItem("recentEmojis", JSON.stringify(updated));
  } catch (err) {
    console.error("저장 실패:", err);
  }
}

// 즐겨찾기 이모지 가져오기
export function getFavoriteEmojis(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem("favoriteEmojis");
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// 즐겨찾기 이모지 저장
export function saveFavoriteEmojis(emojis: string[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem("favoriteEmojis", JSON.stringify(emojis));
  } catch (err) {
    console.error("저장 실패:", err);
  }
}

// 즐겨찾기 토글
export function toggleFavorite(emoji: string): string[] {
  const favorites = getFavoriteEmojis();
  const isFavorite = favorites.includes(emoji);
  const updated = isFavorite
    ? favorites.filter((e) => e !== emoji)
    : [...favorites, emoji];
  saveFavoriteEmojis(updated);
  return updated;
}

// 검색 필터링
export function filterEmojis(
  emojis: Array<{ char: string; name_ko: string; name_en?: string; category?: string; tags: string[] }>,
  query: string,
  category: string
): Array<{ char: string; name_ko: string; name_en?: string; category?: string; tags: string[] }> {
  let filtered = emojis;

  // 카테고리 필터
  if (category !== "all") {
    filtered = filtered.filter((emoji) => {
      return emoji.category === category;
    });
  }

  // 검색어 필터 (name_ko, name_en, tags 모두 검색)
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    filtered = filtered.filter((emoji) => {
      return (
        emoji.name_ko.toLowerCase().includes(lowerQuery) ||
        (emoji.name_en && emoji.name_en.toLowerCase().includes(lowerQuery)) ||
        emoji.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
        emoji.char.includes(query)
      );
    });
  }

  return filtered;
}

