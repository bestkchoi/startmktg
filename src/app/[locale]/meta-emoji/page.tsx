"use client";

import { useState, useCallback } from "react";
import { useLocale } from "@/hooks/use-locale";

// Meta 광고에 자주 사용되는 이모지 카테고리
const emojiCategories = [
  {
    id: "popular",
    name: "인기 이모지",
    emojis: ["🔥", "✨", "💯", "⭐", "🎉", "👍", "❤️", "💪", "🎯", "🚀", "💎", "🏆"],
  },
  {
    id: "check-arrow",
    name: "체크, 화살표",
    emojis: ["✅", "✔️", "👉", "➡️", "⬇️", "⬆️", "↗️", "↙️", "↪️", "🔙", "🔜", "⏩"],
  },
  {
    id: "emphasis",
    name: "강조, 주목",
    emojis: ["❗", "⚠️", "💡", "📢", "🔔", "🎊", "🎈", "🎁", "🏅", "🎖️", "💫", "🌟"],
  },
  {
    id: "emotion",
    name: "감정, 반응",
    emojis: ["😊", "😍", "🥰", "😎", "🤩", "😃", "😄", "😁", "🙂", "😉", "😘", "🥳"],
  },
  {
    id: "number-symbol",
    name: "숫자, 기호",
    emojis: ["1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "💯", "🔟", "🔢", "➕", "➖", "✖️", "➗"],
  },
];

// 간단한 토스트 컴포넌트
function SimpleToast({ message }: { message: string }) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-neutral-900 text-white px-6 py-3 rounded-lg shadow-lg z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
      {message}
    </div>
  );
}

export default function MetaEmojiPage() {
  const locale = useLocale();
  const [showToast, setShowToast] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("popular");

  // 이모지 클릭 핸들러
  const handleEmojiClick = useCallback(async (emoji: string) => {
    try {
      await navigator.clipboard.writeText(emoji);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    } catch (error) {
      console.error("복사 실패:", error);
    }
  }, []);

  // 현재 선택된 카테고리의 이모지
  const currentEmojis = emojiCategories.find((cat) => cat.id === selectedCategory)?.emojis || [];

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-12 sm:px-6">
        {/* 헤더 */}
        <header className="mb-8">
          <h2 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-3">
            메타 광고용 이모지
          </h2>
          <div className="h-px w-16 bg-neutral-300" />
          <p className="mt-4 text-sm text-neutral-600">
            메타 광고, 인스타그램 광고 소재에 바로 사용할 수 있는 이모지 모음
            <br />
            클릭하면 자동으로 복사됩니다.
          </p>
        </header>

        {/* 카테고리 선택 */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {emojiCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-4 py-2 text-sm font-medium rounded transition-colors ${
                  selectedCategory === category.id
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* 이모지 그리드 */}
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-4">
          {currentEmojis.map((emoji, index) => (
            <button
              key={`${emoji}-${index}`}
              onClick={() => handleEmojiClick(emoji)}
              className="aspect-square flex items-center justify-center text-3xl sm:text-4xl bg-neutral-50 hover:bg-neutral-100 rounded-lg transition-colors cursor-pointer active:scale-95"
              aria-label={`이모지 ${emoji} 복사`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* 토스트 메시지 */}
        {showToast && <SimpleToast message="이모지가 복사되었습니다" />}
      </main>
    </div>
  );
}

