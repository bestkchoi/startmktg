"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocale, useLocalizedPath } from "@/hooks/use-locale";
import type { StartCampaign, ChannelType } from "@/types/campaign";

const CHANNEL_TYPE_LABELS: Record<ChannelType, string> = {
  meta: "Meta",
  google: "Google",
  naver: "Naver Search",
  kakao: "Kakao",
  crm_sms: "CRM SMS",
  crm_lms: "CRM LMS",
  crm_kakao: "CRM Kakao",
  tiktok: "TikTok",
  other: "기타",
};

type CampaignWithChannels = StartCampaign & {
  channels?: ChannelType[];
};

export default function CampaignsPage() {
  const router = useRouter();
  const locale = useLocale();
  const localizedPath = useLocalizedPath();
  const [campaigns, setCampaigns] = useState<CampaignWithChannels[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 텍스트 번역 객체
  const t = {
    en: {
      loading: "Loading...",
      errorLoading: "Failed to load campaign list.",
      errorOccurred: "An error occurred while loading campaign list.",
      backToMain: "Back to Main",
      campaignList: "Campaign List",
      createCampaign: "Create Campaign",
      noCampaigns: "No campaigns created yet.",
      createFirstCampaign: "Create Campaign",
      createAd: "Create AD",
      dateRange: "Date Range",
      channels: "Channels",
    },
    ko: {
      loading: "로딩 중...",
      errorLoading: "캠페인 목록을 불러올 수 없습니다.",
      errorOccurred: "캠페인 목록을 불러오는 중 오류가 발생했습니다.",
      backToMain: "메인으로 돌아가기",
      campaignList: "Campaign 목록",
      createCampaign: "Campaign 만들기",
      noCampaigns: "생성된 캠페인이 없습니다.",
      createFirstCampaign: "Campaign 만들기",
      createAd: "AD 만들기",
      dateRange: "기간",
      channels: "매체",
    },
  };
  
  const texts = (t[locale as keyof typeof t] || t.en) as typeof t.en;

  useEffect(() => {
    let cancelled = false;
    
    async function fetchCampaigns() {
      try {
        // 캐시를 활용하여 빠른 응답
        const response = await fetch("/api/campaigns", {
          cache: "no-store", // 항상 최신 데이터 가져오기
        });
        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data.ok) {
          setError(data.message || texts.errorLoading);
          setLoading(false);
          return;
        }

        setCampaigns(data.data || []);
      } catch (err) {
        if (cancelled) return;
        console.error("Failed to fetch campaigns:", err);
        setError(texts.errorOccurred);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    fetchCampaigns();
    
    // cleanup 함수로 컴포넌트 언마운트 시 요청 취소
    return () => {
      cancelled = true;
    };
  }, [texts.errorLoading, texts.errorOccurred]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatDateRange = (startDate: string, endDate: string | null) => {
    const start = formatDate(startDate);
    if (endDate) {
      const end = formatDate(endDate);
      return `${start} ~ ${end}`;
    }
    return `${start} ~ (종료일 미정)`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-20 sm:px-6">
          {/* START MKTG 로고 링크 */}
          <div className="mb-8">
            <Link
              href={localizedPath("/") as any}
              className="inline-block transition-opacity hover:opacity-70"
            >
              <h1 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] uppercase">
                START MKTG
              </h1>
            </Link>
          </div>

          {/* 헤더 */}
          <header className="mb-12 flex items-start justify-between">
            <div>
              <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-2">
                {texts.campaignList}
              </h1>
              <div className="h-px w-16 bg-neutral-300 mb-4" />
            </div>
          </header>

          {/* 로딩 스켈레톤 */}
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="border-2 border-neutral-200 bg-white rounded-lg p-6 animate-pulse"
              >
                <div className="flex items-center justify-between gap-6">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="h-6 bg-neutral-200 rounded w-48" />
                      <div className="h-5 bg-neutral-200 rounded w-32" />
                    </div>
                    <div className="h-4 bg-neutral-200 rounded w-40" />
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="h-10 bg-neutral-200 rounded w-24" />
                    <div className="h-10 bg-neutral-200 rounded w-24" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-700 mb-4">{error}</p>
          <Link
            href={localizedPath("/") as any}
            className="text-sm text-neutral-500 hover:text-neutral-900 underline"
          >
            {texts.backToMain}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-20 sm:px-6">
        {/* START MKTG 로고 링크 */}
        <div className="mb-8">
          <Link
            href={localizedPath("/") as any}
            className="inline-block transition-opacity hover:opacity-70"
          >
            <h1 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] uppercase">
              START MKTG
            </h1>
          </Link>
        </div>

        {/* 헤더 */}
        <header className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-2">
              {texts.campaignList}
            </h1>
            <div className="h-px w-16 bg-neutral-300 mb-4" />
          </div>
          <div className="flex gap-3">
            <Link
              href={localizedPath("/") as any}
              className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
            >
              Main
            </Link>
            <Link
              href={localizedPath("/campaign/new") as any}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900"
            >
              Campaign 만들기
            </Link>
          </div>
        </header>

        {/* 캠페인 리스트 */}
        {campaigns.length === 0 ? (
          <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
            <p className="text-sm text-neutral-500 mb-4">생성된 캠페인이 없습니다.</p>
            <Link
              href={localizedPath("/campaign/new") as any}
              className="text-sm text-neutral-900 underline hover:text-neutral-600"
            >
              Campaign 만들기
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign) => (
              <div
                key={campaign.campaign_id}
                className="border-2 border-neutral-200 bg-white rounded-lg p-6 transition-all duration-300 hover:border-neutral-900 hover:shadow-md"
              >
                <div className="flex items-center justify-between gap-6">
                  {/* 캠페인 정보 영역 */}
                  <div
                    onClick={() => router.push(localizedPath(`/campaigns/${campaign.campaign_id}`) as any)}
                    className="flex-1 min-w-0 group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-xl font-semibold text-neutral-900 group-hover:text-neutral-600 transition-colors">
                        {campaign.raw_name}
                      </h2>
                      <span className="px-2.5 py-1 text-xs font-mono bg-neutral-100 text-neutral-600 rounded">
                        {campaign.final_campaign_name}
                      </span>
                    </div>
                    <div className="text-sm text-neutral-600">
                      <p className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-neutral-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {formatDateRange(campaign.start_date, campaign.end_date)}
                      </p>
                    </div>
                  </div>

                  {/* 매체 목록 + AD 만들기 버튼 영역 */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* 매체 목록 표시 */}
                    {campaign.channels && campaign.channels.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2">
                        {campaign.channels
                          .filter((channelType) => channelType && CHANNEL_TYPE_LABELS[channelType])
                          .map((channelType, index) => (
                            <Link
                              key={`${campaign.campaign_id}-${channelType}-${index}`}
                              href={localizedPath(`/campaigns/${campaign.campaign_id}/channels/new?type=${channelType}`) as any}
                              onClick={(e) => e.stopPropagation()}
                              className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 border-2 border-neutral-200 rounded-lg hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
                            >
                              {CHANNEL_TYPE_LABELS[channelType]}
                            </Link>
                          ))}
                      </div>
                    )}
                    {/* AD 만들기 버튼 - 매체 태그와 동일한 스타일 */}
                    <Link
                      href={localizedPath(`/campaigns/${campaign.campaign_id}/channels/new`) as any}
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-neutral-700 bg-neutral-100 border-2 border-neutral-200 rounded-lg hover:bg-neutral-900 hover:text-white hover:border-neutral-900 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M12 4v16m8-8H4"
                        />
                      </svg>
                      <span>{texts.createAd}</span>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

