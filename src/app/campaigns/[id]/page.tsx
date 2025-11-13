"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import type { CampaignWithChannels } from "@/types/campaign";

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

export default function CampaignDetailPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignWithChannels | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const data = await response.json();

        if (!response.ok || !data.ok) {
          setError(data.message || "캠페인을 불러올 수 없습니다.");
          return;
        }

        setCampaign(data.data);
      } catch (err) {
        console.error("Failed to fetch campaign:", err);
        setError("캠페인을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    }

    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId]);

  const handleDeleteChannel = async (channelId: string) => {
    if (!confirm("정말 이 매체를 삭제하시겠습니까?")) {
      return;
    }

    // TODO: DELETE API 구현 후 연결
    console.log("Delete channel:", channelId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // TODO: 토스트 메시지 표시
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
        <div className="text-sm text-neutral-500">로딩 중...</div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-sm text-neutral-700 mb-4">{error || "캠페인을 찾을 수 없습니다."}</p>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-neutral-900 underline"
          >
            대시보드로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-20 sm:px-6">
        {/* 헤더 */}
        <header className="mb-12 flex items-start justify-between">
          <div>
            <h1 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] uppercase mb-2">
              {campaign.campaign_name}
            </h1>
            <div className="h-px w-16 bg-neutral-300 mb-4" />
            <div className="text-sm text-neutral-500">
              <p>
                {formatDate(campaign.start_date)} ~ {formatDate(campaign.end_date)}
              </p>
              <p className="mt-1">생성일: {formatDate(campaign.created_at)}</p>
            </div>
          </div>
          <Link
            href="/dashboard"
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            대시보드
          </Link>
        </header>

        {/* 매체 리스트 섹션 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-neutral-900">매체 목록</h2>
            <Link
              href={`/campaigns/${campaignId}/channels/new`}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900"
            >
              매체 추가
            </Link>
          </div>

          {campaign.channels.length === 0 ? (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm text-neutral-500 mb-4">매체를 추가해주세요.</p>
              <Link
                href={`/campaigns/${campaignId}/channels/new`}
                className="text-sm text-neutral-900 underline hover:text-neutral-600"
              >
                첫 매체 추가하기
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {campaign.channels.map((channel) => (
                <div
                  key={channel.id}
                  className="border border-neutral-200 bg-white p-6 transition-colors hover:bg-neutral-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 text-xs font-medium bg-neutral-100 text-neutral-700">
                          {CHANNEL_TYPE_LABELS[channel.channel_type] || channel.channel_type}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {formatDate(channel.created_at)}
                        </span>
                      </div>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">랜딩 URL</p>
                          <a
                            href={channel.landing_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-neutral-700 hover:text-neutral-900 underline break-all"
                          >
                            {channel.landing_url}
                          </a>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">최종 URL</p>
                          <div className="flex items-center gap-2">
                            <code className="flex-1 text-xs bg-neutral-50 px-3 py-2 border border-neutral-200 break-all">
                              {channel.final_url}
                            </code>
                            <button
                              onClick={() => copyToClipboard(channel.final_url)}
                              className="px-3 py-2 text-xs font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-100 transition-colors"
                            >
                              복사
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeleteChannel(channel.id)}
                      className="ml-4 text-xs text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
