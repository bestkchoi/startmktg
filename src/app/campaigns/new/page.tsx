"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CreateCampaignRequest } from "@/types/campaign";

export default function NewCampaignPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateCampaignRequest>({
    campaign_name: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || "캠페인 생성에 실패했습니다." });
        }
        setLoading(false);
        return;
      }

      // 성공 시 캠페인 상세 페이지로 이동
      router.push(`/campaigns/${data.data.id}`);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setErrors({ general: "캠페인 생성 중 오류가 발생했습니다." });
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateCampaignRequest, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // 에러 초기화
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-3">
            새 캠페인 생성
          </h1>
          <div className="h-px w-16 bg-neutral-300" />
        </header>

        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-700">
              {errors.general}
            </div>
          )}

          {/* 캠페인 이름 */}
          <div>
            <label
              htmlFor="campaign_name"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              캠페인 이름 <span className="text-neutral-500">*</span>
            </label>
            <input
              id="campaign_name"
              type="text"
              value={formData.campaign_name}
              onChange={(e) => handleChange("campaign_name", e.target.value)}
              placeholder="예: 2025 봄 프로모션"
              maxLength={100}
              required
              className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
            />
            {errors.campaign_name && (
              <p className="mt-1 text-xs text-neutral-500">{errors.campaign_name}</p>
            )}
          </div>

          {/* 시작일 */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              시작일 <span className="text-neutral-500">*</span>
            </label>
            <input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => handleChange("start_date", e.target.value)}
              required
              className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
            />
            {errors.start_date && (
              <p className="mt-1 text-xs text-neutral-500">{errors.start_date}</p>
            )}
          </div>

          {/* 종료일 */}
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              종료일 <span className="text-neutral-500">*</span>
            </label>
            <input
              id="end_date"
              type="date"
              value={formData.end_date}
              onChange={(e) => handleChange("end_date", e.target.value)}
              min={formData.start_date}
              required
              className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
            />
            {errors.end_date && (
              <p className="mt-1 text-xs text-neutral-500">{errors.end_date}</p>
            )}
          </div>

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link
              href="/dashboard"
              className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
