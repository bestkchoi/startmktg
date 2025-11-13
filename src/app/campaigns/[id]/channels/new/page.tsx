"use client";

import { useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ChannelType, CreateChannelRequest } from "@/types/campaign";

const CHANNEL_TYPES: Array<{ value: ChannelType; label: string; description?: string }> = [
  { value: "meta", label: "Meta", description: "Facebook, Instagram" },
  { value: "google", label: "Google", description: "Google Ads" },
  { value: "kakao", label: "Kakao", description: "카카오 비즈보드" },
  { value: "crm_sms", label: "CRM SMS", description: "CRM SMS 발송" },
  { value: "crm_lms", label: "CRM LMS", description: "CRM LMS 발송" },
  { value: "crm_kakao", label: "CRM Kakao", description: "CRM 카카오톡 발송" },
  { value: "tiktok", label: "TikTok", description: "TikTok 광고" },
  { value: "other", label: "기타", description: "기타 매체" },
];

function ChannelSelectionContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const selectedType = searchParams.get("type") as ChannelType | null;

  const handleSelect = (channelType: ChannelType) => {
    router.push(`/campaigns/${campaignId}/channels/new?type=${channelType}`);
  };

  // 타입이 선택되었으면 UTM 생성 페이지로 이동
  if (selectedType && CHANNEL_TYPES.some((c) => c.value === selectedType)) {
    return null; // UTM 생성 페이지 컴포넌트로 리다이렉트
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-3">
            매체 선택
          </h1>
          <div className="h-px w-16 bg-neutral-300" />
        </header>

        {/* 매체 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {CHANNEL_TYPES.map((channel) => (
            <button
              key={channel.value}
              onClick={() => handleSelect(channel.value)}
              className="group border border-neutral-200 bg-white p-6 text-left transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
            >
              <h3 className="text-lg font-medium mb-1">{channel.label}</h3>
              {channel.description && (
                <p className="text-sm text-neutral-500 group-hover:text-neutral-300">
                  {channel.description}
                </p>
              )}
            </button>
          ))}
        </div>

        {/* 취소 버튼 */}
        <div className="mt-12">
          <Link
            href={`/campaigns/${campaignId}`}
            className="text-sm text-neutral-500 hover:text-neutral-900 underline"
          >
            취소
          </Link>
        </div>
      </main>
    </div>
  );
}

function UtmGenerationContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const channelType = searchParams.get("type") as ChannelType;

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateChannelRequest>({
    channel_type: channelType,
    landing_url: "",
    custom_content: "",
    custom_term: "",
  });

  const [preview, setPreview] = useState<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    final_url?: string;
  } | null>(null);

  const selectedChannel = CHANNEL_TYPES.find((c) => c.value === channelType);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      const response = await fetch(`/api/campaigns/${campaignId}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel_type: channelType,
          landing_url: formData.landing_url,
          custom_content: formData.custom_content || undefined,
          custom_term: formData.custom_term || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.errors) {
          setErrors(data.errors);
        } else {
          setErrors({ general: data.message || "매체 생성에 실패했습니다." });
        }
        setLoading(false);
        return;
      }

      // 성공 시 캠페인 상세 페이지로 이동
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Failed to create channel:", error);
      setErrors({ general: "매체 생성 중 오류가 발생했습니다." });
      setLoading(false);
    }
  };

  const handlePreview = async () => {
    if (!formData.landing_url) {
      return;
    }

    try {
      // 미리보기용 API 호출 (실제 저장 없이 UTM 생성만)
      const response = await fetch(`/api/campaigns/${campaignId}/channels`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          channel_type: channelType,
          landing_url: formData.landing_url,
          custom_content: formData.custom_content || undefined,
          custom_term: formData.custom_term || undefined,
        }),
      });

      const data = await response.json();

      if (data.ok && data.data) {
        setPreview({
          utm_source: data.data.utm_source,
          utm_medium: data.data.utm_medium,
          utm_campaign: data.data.utm_campaign,
          utm_content: data.data.utm_content,
          utm_term: data.data.utm_term,
          final_url: data.data.final_url,
        });
      }
    } catch (error) {
      console.error("Failed to preview:", error);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-3">
            UTM 생성 - {selectedChannel?.label}
          </h1>
          <div className="h-px w-16 bg-neutral-300" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 일반 에러 메시지 */}
          {errors.general && (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-700">
              {errors.general}
            </div>
          )}

          {/* 입력 섹션 */}
          <div className="space-y-6">
            {/* 랜딩 URL */}
            <div>
              <label
                htmlFor="landing_url"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                랜딩 URL <span className="text-neutral-500">*</span>
              </label>
              <input
                id="landing_url"
                type="url"
                value={formData.landing_url}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, landing_url: e.target.value }));
                  setPreview(null);
                }}
                placeholder="https://example.com/landing"
                required
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
              {errors.landing_url && (
                <p className="mt-1 text-xs text-neutral-500">{errors.landing_url}</p>
              )}
            </div>

            {/* 커스텀 Content */}
            <div>
              <label
                htmlFor="custom_content"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                커스텀 Content <span className="text-neutral-400 text-xs">(선택)</span>
              </label>
              <input
                id="custom_content"
                type="text"
                value={formData.custom_content}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, custom_content: e.target.value }));
                  setPreview(null);
                }}
                placeholder="선택사항"
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-400">
                템플릿의 utm_content를 덮어씁니다.
              </p>
            </div>

            {/* 커스텀 Term */}
            <div>
              <label
                htmlFor="custom_term"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                커스텀 Term <span className="text-neutral-400 text-xs">(선택)</span>
              </label>
              <input
                id="custom_term"
                type="text"
                value={formData.custom_term}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, custom_term: e.target.value }));
                  setPreview(null);
                }}
                placeholder="선택사항"
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-400">
                템플릿의 utm_term을 덮어씁니다.
              </p>
            </div>

            {/* 미리보기 버튼 */}
            {formData.landing_url && (
              <button
                type="button"
                onClick={handlePreview}
                className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                미리보기
              </button>
            )}
          </div>

          {/* 미리보기 섹션 */}
          {preview && (
            <div className="border border-neutral-200 bg-neutral-50 p-6 space-y-4">
              <h3 className="text-sm font-medium text-neutral-900 mb-4">생성된 UTM 파라미터</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-neutral-500">utm_source:</span>{" "}
                  <code className="text-neutral-900">{preview.utm_source}</code>
                </div>
                <div>
                  <span className="text-neutral-500">utm_medium:</span>{" "}
                  <code className="text-neutral-900">{preview.utm_medium}</code>
                </div>
                <div>
                  <span className="text-neutral-500">utm_campaign:</span>{" "}
                  <code className="text-neutral-900">{preview.utm_campaign}</code>
                </div>
                {preview.utm_content && (
                  <div>
                    <span className="text-neutral-500">utm_content:</span>{" "}
                    <code className="text-neutral-900">{preview.utm_content}</code>
                  </div>
                )}
                {preview.utm_term && (
                  <div>
                    <span className="text-neutral-500">utm_term:</span>{" "}
                    <code className="text-neutral-900">{preview.utm_term}</code>
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-neutral-200">
                <p className="text-xs text-neutral-500 mb-2">최종 URL</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white px-3 py-2 border border-neutral-200 break-all">
                    {preview.final_url}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(preview.final_url || "")}
                    className="px-3 py-2 text-xs font-medium text-neutral-700 border border-neutral-200 hover:bg-white transition-colors"
                  >
                    복사
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link
              href={`/campaigns/${campaignId}/channels/new`}
              className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading || !formData.landing_url}
              className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function NewChannelPage() {
  const searchParams = useSearchParams();
  const channelType = searchParams.get("type");

  if (channelType && CHANNEL_TYPES.some((c) => c.value === channelType)) {
    return <UtmGenerationContent />;
  }

  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
          <div className="text-sm text-neutral-500">로딩 중...</div>
        </div>
      }
    >
      <ChannelSelectionContent />
    </Suspense>
  );
}
