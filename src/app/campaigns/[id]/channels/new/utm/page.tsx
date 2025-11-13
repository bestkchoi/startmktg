"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { generateUtmParams, buildFinalUrl } from "@/lib/utm-template";

const CHANNEL_TYPE_LABELS: Record<string, string> = {
  meta: "Meta",
  google: "Google",
  kakao: "Kakao",
  crm_sms: "CRM SMS",
  crm_lms: "CRM LMS",
  crm_kakao: "CRM Kakao",
  tiktok: "TikTok",
  other: "기타",
};

function UtmGenerateContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const campaignId = params.id as string;
  const channelType = searchParams.get("type") || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [campaignName, setCampaignName] = useState("");
  const [formData, setFormData] = useState({
    landing_url: "",
    custom_content: "",
    custom_term: "",
  });
  const [preview, setPreview] = useState<{
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    utm_term: string;
    final_url: string;
  } | null>(null);

  // 캠페인 정보 가져오기
  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const data = await response.json();

        if (response.ok && data.ok) {
          setCampaignName(data.data.campaign_name);
        }
      } catch (err) {
        console.error("Failed to fetch campaign:", err);
      }
    }

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  // UTM 미리보기 업데이트
  useEffect(() => {
    if (!formData.landing_url || !campaignName || !channelType) {
      setPreview(null);
      return;
    }

    try {
      // URL 검증
      new URL(formData.landing_url);

      // UTM 파라미터 생성 (템플릿 없이 기본 규칙 사용)
      const utmParams = generateUtmParams(
        null, // 템플릿은 향후 API에서 가져올 수 있음
        {
          campaign_name: campaignName,
          channel_type: channelType,
        },
        formData.custom_content || undefined,
        formData.custom_term || undefined
      );

      // 최종 URL 생성
      const finalUrl = buildFinalUrl(formData.landing_url, utmParams);

      setPreview({
        ...utmParams,
        final_url: finalUrl,
      });
    } catch (err) {
      setPreview(null);
    }
  }, [formData, campaignName, channelType]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

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
        setError(data.message || "매체 생성에 실패했습니다.");
        setLoading(false);
        return;
      }

      // 성공 시 캠페인 상세 페이지로 이동
      router.push(`/campaigns/${campaignId}`);
    } catch (err) {
      setError("서버 오류가 발생했습니다.");
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCopyUrl = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      alert("URL이 복사되었습니다.");
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  if (!channelType || !CHANNEL_TYPE_LABELS[channelType]) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-20 sm:px-6">
          <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-700">
            유효하지 않은 매체 타입입니다.
          </div>
          <Link
            href={`/campaigns/${campaignId}/channels/new`}
            className="mt-4 inline-block px-8 py-4 text-sm font-medium text-neutral-900 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
          >
            매체 선택으로 돌아가기
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-3">
            UTM 생성 - {CHANNEL_TYPE_LABELS[channelType]}
          </h1>
          <div className="h-px w-16 bg-neutral-300" />
        </header>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 에러 메시지 */}
          {error && (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-4 text-sm text-neutral-700">
              {error}
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
                name="landing_url"
                type="url"
                required
                value={formData.landing_url}
                onChange={handleChange}
                placeholder="https://example.com/landing"
                className="w-full border border-neutral-200 bg-white px-6 py-4 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
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
                name="custom_content"
                type="text"
                value={formData.custom_content}
                onChange={handleChange}
                placeholder="선택사항"
                className="w-full border border-neutral-200 bg-white px-6 py-4 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-500">
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
                name="custom_term"
                type="text"
                value={formData.custom_term}
                onChange={handleChange}
                placeholder="선택사항"
                className="w-full border border-neutral-200 bg-white px-6 py-4 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-500">
                템플릿의 utm_term을 덮어씁니다.
              </p>
            </div>
          </div>

          {/* 미리보기 섹션 */}
          {preview && (
            <div className="border border-neutral-200 bg-neutral-50 p-6 space-y-4">
              <h2 className="text-lg font-medium text-neutral-900">생성된 UTM 파라미터</h2>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-neutral-500">utm_source:</span>{" "}
                  <span className="font-mono">{preview.utm_source}</span>
                </div>
                <div>
                  <span className="text-neutral-500">utm_medium:</span>{" "}
                  <span className="font-mono">{preview.utm_medium}</span>
                </div>
                <div>
                  <span className="text-neutral-500">utm_campaign:</span>{" "}
                  <span className="font-mono">{preview.utm_campaign}</span>
                </div>
                {preview.utm_content && (
                  <div>
                    <span className="text-neutral-500">utm_content:</span>{" "}
                    <span className="font-mono">{preview.utm_content}</span>
                  </div>
                )}
                {preview.utm_term && (
                  <div>
                    <span className="text-neutral-500">utm_term:</span>{" "}
                    <span className="font-mono">{preview.utm_term}</span>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  최종 URL
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={preview.final_url}
                    className="flex-1 border border-neutral-200 bg-white px-4 py-2 text-sm font-mono text-neutral-700"
                  />
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(preview.final_url)}
                    className="px-4 py-2 text-xs font-medium text-neutral-900 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50 whitespace-nowrap"
                  >
                    복사
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-4 pt-4">
            <Link
              href={`/campaigns/${campaignId}/channels/new`}
              className="px-8 py-4 text-sm font-medium text-neutral-900 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading || !preview}
              className="px-8 py-4 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default function UtmGeneratePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
          <div className="text-sm text-neutral-500">로딩 중...</div>
        </div>
      }
    >
      <UtmGenerateContent />
    </Suspense>
  );
}

