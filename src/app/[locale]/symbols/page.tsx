"use client";

import { useState, useEffect, useCallback } from "react";
import { useLocale } from "@/hooks/use-locale";
import emojisData from "@/../../data/emojis_ko.json";
import {
  copyToClipboard,
  getRecentEmojis,
  saveRecentEmoji,
  getFavoriteEmojis,
  toggleFavorite,
  filterEmojis,
} from "@/lib/emojis/utils";
import { Toast } from "@/lib/emojis/toast";

type EmojiItem = {
  char: string;
  name_ko: string;
  name_en: string;
  category: string;
  tags: string[];
};

const categories = [
  { id: "smileys", name: "웃는 얼굴 및 사람" },
  { id: "hearts", name: "하트" },
  { id: "symbols", name: "기호" },
  { id: "arrows", name: "화살표" },
  { id: "stars", name: "별" },
  { id: "weather", name: "날씨" },
  { id: "animals", name: "동물 및 자연" },
  { id: "food", name: "음식 및 식음료" },
  { id: "flags", name: "국기" },
  { id: "text", name: "텍스트" },
];

export default function SymbolsPage() {
  const locale = useLocale();
  const [searchQuery, setSearchQuery] = useState("");
  const [recentEmojis, setRecentEmojis] = useState<string[]>([]);
  const [favoriteEmojis, setFavoriteEmojis] = useState<string[]>([]);
  const [showToast, setShowToast] = useState(false);
  const [copiedEmoji, setCopiedEmoji] = useState<string>("");

  // 로컬 스토리지에서 데이터 불러오기
  useEffect(() => {
    setRecentEmojis(getRecentEmojis());
    setFavoriteEmojis(getFavoriteEmojis());
  }, []);

  // 이모지 클릭 핸들러
  const handleEmojiClick = useCallback(
    async (emoji: string) => {
      const success = await copyToClipboard(emoji);
      if (success) {
        saveRecentEmoji(emoji);
        setRecentEmojis(getRecentEmojis());
        setCopiedEmoji(emoji);
        setShowToast(true);
      }
    },
    []
  );

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, emoji: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleEmojiClick(emoji);
      }
    },
    [handleEmojiClick]
  );

  // 즐겨찾기 토글
  const handleToggleFavorite = useCallback(
    (e: React.MouseEvent, emoji: string) => {
      e.stopPropagation();
      const updated = toggleFavorite(emoji);
      setFavoriteEmojis(updated);
    },
    []
  );

  // 카테고리별로 이모지 그룹화
  const emojisByCategory = categories.reduce((acc, category) => {
    const categoryEmojis = (emojisData as EmojiItem[]).filter(
      (emoji) => emoji.category === category.id
    );
    if (categoryEmojis.length > 0) {
      acc[category.id] = categoryEmojis;
    }
    return acc;
  }, {} as Record<string, EmojiItem[]>);

  // 검색 시 필터링된 이모지
  const filteredEmojis = searchQuery
    ? filterEmojis(emojisData as EmojiItem[], searchQuery, "all")
    : [];

  // 검색 모드인지 확인
  const isSearchMode = searchQuery.trim().length > 0;

  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-2xl font-light tracking-[-0.02em] mb-4 text-center">
          이모지 페이지
        </h1>

        {/* 검색 바 */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="이모지 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-3 border border-neutral-200 rounded-lg focus:outline-none focus:border-neutral-900"
            aria-label="이모지 검색"
          />
        </div>

        {/* 검색 모드: 검색 결과 표시 */}
        {isSearchMode ? (
          <div className="mb-4">
            <h2 className="text-lg font-medium mb-2">
              검색 결과 ({filteredEmojis.length}개)
            </h2>
            {filteredEmojis.length === 0 ? (
              <div className="text-center py-8 text-neutral-500">
                검색 결과가 없습니다.
              </div>
            ) : (
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 2xl:grid-cols-16 gap-1">
                {filteredEmojis.map((emoji, index) => {
                  const isFavorite = favoriteEmojis.includes(emoji.char);
                  return (
                    <div
                      key={index}
                      className="relative group flex flex-col items-center"
                    >
                      <button
                        onClick={() => handleEmojiClick(emoji.char)}
                        onKeyDown={(e) => handleKeyDown(e, emoji.char)}
                        className="w-full text-xl p-1 rounded hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900"
                        aria-label={`${emoji.name_ko} 복사`}
                        role="button"
                        tabIndex={0}
                        title={emoji.name_ko}
                      >
                        {emoji.char}
                      </button>
                      <button
                        onClick={(e) => handleToggleFavorite(e, emoji.char)}
                        className={`absolute top-0 right-0 text-xs transition-opacity ${
                          isFavorite
                            ? "opacity-100 text-yellow-500"
                            : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-yellow-500"
                        }`}
                        aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                        role="button"
                        tabIndex={0}
                      >
                        {isFavorite ? "⭐" : "☆"}
                      </button>
                      <span className="text-[10px] text-neutral-500 mt-0.5 text-center line-clamp-1 leading-tight">
                        {emoji.name_ko}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          <>
            {/* 즐겨찾기 섹션 */}
            {favoriteEmojis.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">즐겨찾기</h2>
                <div className="flex flex-wrap gap-1">
                  {favoriteEmojis
                    .map((emojiChar) => {
                      const emoji = (emojisData as EmojiItem[]).find(
                        (e) => e.char === emojiChar
                      );
                      return emoji ? { ...emoji, char: emojiChar } : null;
                    })
                    .filter((e): e is EmojiItem => e !== null)
                    .map((emoji, index) => (
                      <div key={index} className="relative group flex flex-col items-center">
                        <button
                          onClick={() => handleEmojiClick(emoji.char)}
                          onKeyDown={(e) => handleKeyDown(e, emoji.char)}
                          className="text-xl p-1 rounded hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          aria-label={`${emoji.name_ko} 복사`}
                          role="button"
                          tabIndex={0}
                        >
                          {emoji.char}
                        </button>
                        <button
                          onClick={(e) => handleToggleFavorite(e, emoji.char)}
                          className="absolute -top-0.5 -right-0.5 text-xs text-yellow-500 opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="즐겨찾기 해제"
                          role="button"
                        >
                          ⭐
                        </button>
                        <span className="text-[10px] text-neutral-500 mt-0.5 text-center line-clamp-1 leading-tight">
                          {emoji.name_ko}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 최근 사용한 이모지 */}
            {recentEmojis.length > 0 && (
              <div className="mb-4">
                <h2 className="text-lg font-medium mb-2">최근 사용</h2>
                <div className="flex flex-wrap gap-1">
                  {recentEmojis
                    .map((emojiChar) => {
                      const emoji = (emojisData as EmojiItem[]).find(
                        (e) => e.char === emojiChar
                      );
                      return emoji ? { ...emoji, char: emojiChar } : null;
                    })
                    .filter((e): e is EmojiItem => e !== null)
                    .slice(0, 20)
                    .map((emoji, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <button
                          onClick={() => handleEmojiClick(emoji.char)}
                          onKeyDown={(e) => handleKeyDown(e, emoji.char)}
                          className="text-xl p-1 rounded hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900"
                          aria-label={`${emoji.name_ko} 복사`}
                          role="button"
                          tabIndex={0}
                        >
                          {emoji.char}
                        </button>
                        <span className="text-[10px] text-neutral-500 mt-0.5 text-center line-clamp-1 leading-tight">
                          {emoji.name_ko}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* 카테고리별 섹션 */}
            {categories.map((category) => {
              const categoryEmojis = emojisByCategory[category.id] || [];
              if (categoryEmojis.length === 0) return null;

              return (
                <div key={category.id} className="mb-6">
                  <h2 className="text-lg font-medium mb-2 pb-1.5 border-b border-neutral-200">
                    {category.name} ({categoryEmojis.length}개)
                  </h2>
                  <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 xl:grid-cols-14 2xl:grid-cols-16 gap-1">
                    {categoryEmojis.map((emoji, index) => {
                      const isFavorite = favoriteEmojis.includes(emoji.char);
                      return (
                        <div
                          key={index}
                          className="relative group flex flex-col items-center"
                        >
                          <button
                            onClick={() => handleEmojiClick(emoji.char)}
                            onKeyDown={(e) => handleKeyDown(e, emoji.char)}
                            className="w-full text-xl p-1 rounded hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-neutral-900"
                            aria-label={`${emoji.name_ko} 복사`}
                            role="button"
                            tabIndex={0}
                            title={emoji.name_ko}
                          >
                            {emoji.char}
                          </button>
                          <button
                            onClick={(e) => handleToggleFavorite(e, emoji.char)}
                            className={`absolute top-0 right-0 text-xs transition-opacity ${
                              isFavorite
                                ? "opacity-100 text-yellow-500"
                                : "opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-yellow-500"
                            }`}
                            aria-label={isFavorite ? "즐겨찾기 해제" : "즐겨찾기 추가"}
                            role="button"
                            tabIndex={0}
                          >
                            {isFavorite ? "⭐" : "☆"}
                          </button>
                          <span className="text-[10px] text-neutral-500 mt-0.5 text-center line-clamp-1 leading-tight">
                            {emoji.name_ko}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </>
        )}
      </main>

      {/* 토스트 */}
      {showToast && (
        <Toast
          message="복사됨"
          duration={1000}
          onClose={() => setShowToast(false)}
        />
      )}
    </div>
  );
}

