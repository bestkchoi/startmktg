"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/use-locale";
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
  const localizedPath = useLocalizedPath();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignWithChannels | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedChannelId, setCopiedChannelId] = useState<string | null>(null);

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

  const copyToClipboard = (text: string, channelId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChannelId(channelId);
    setTimeout(() => {
      setCopiedChannelId(null);
    }, 2000);
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
            href={localizedPath("/campaigns")}
            className="text-sm text-neutral-500 hover:text-neutral-900 underline"
          >
            목록으로 돌아가기
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
            <div className="mb-4">
              <p className="font-mono text-lg sm:text-xl text-neutral-700 bg-neutral-100 px-3 py-1.5 rounded inline-block">
                {campaign.final_campaign_name}
              </p>
              <p className="text-base sm:text-lg text-neutral-600 mt-2">
                {(campaign as any).raw_name || campaign.campaign_name}
              </p>
            </div>
            <div className="h-px w-16 bg-neutral-300 mb-4" />
            <div className="text-sm text-neutral-500 space-y-1">
              <p>
                {formatDate(campaign.start_date)} ~ {formatDate(campaign.end_date)}
              </p>
              <p>생성일: {formatDate(campaign.created_at)}</p>
            </div>
          </div>
          <Link
            href={localizedPath("/campaigns") as any}
            className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            목록
          </Link>
        </header>

        {/* 광고 리스트 섹션 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-neutral-900">광고 목록</h2>
            <Link
              href={localizedPath(`/campaigns/${campaignId}/channels/new`) as any}
              className="px-4 py-2 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900"
            >
              광고 추가
            </Link>
          </div>

          {campaign.channels.length === 0 ? (
            <div className="border border-neutral-200 bg-neutral-50 px-6 py-12 text-center">
              <p className="text-sm text-neutral-500 mb-4">광고를 추가해주세요.</p>
              <Link
                href={localizedPath(`/campaigns/${campaignId}/channels/new`) as any}
                className="text-sm text-neutral-900 underline hover:text-neutral-600"
              >
                첫 광고 추가하기
              </Link>
            </div>
          ) : (
            <div className="border border-neutral-200 bg-white overflow-hidden rounded-lg">
              <table className="w-full">
                <thead className="bg-neutral-50 border-b border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                      매체
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                      광고이름
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                      랜딩 URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                      최종 URL
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-neutral-700 uppercase tracking-wider">
                      생성일
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-neutral-700 uppercase tracking-wider">
                      액션
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-neutral-200">
                  {campaign.channels.map((channel) => (
                    <tr
                      key={channel.id}
                      className="transition-colors hover:bg-neutral-50"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2.5 py-1 text-xs font-medium bg-neutral-100 text-neutral-700 rounded">
                          {CHANNEL_TYPE_LABELS[channel.channel_type] || channel.channel_type}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {channel.meta_ad_name ? (
                          <code className="text-xs text-neutral-900 font-mono break-all max-w-md block">
                            {channel.meta_ad_name}
                          </code>
                        ) : (
                          <span className="text-xs text-neutral-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={channel.landing_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-neutral-700 hover:text-neutral-900 underline break-all max-w-md block"
                        >
                          {channel.landing_url}
                        </a>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-neutral-50 px-3 py-1.5 border border-neutral-200 rounded break-all max-w-md">
                            {channel.final_url}
                          </code>
                          <button
                            onClick={() => copyToClipboard(channel.final_url, channel.id)}
                            className="px-3 py-1.5 text-xs font-medium text-neutral-700 bg-white border border-neutral-200 rounded hover:bg-neutral-100 transition-colors whitespace-nowrap"
                            title="복사"
                          >
                            {copiedChannelId === channel.id ? "복사되었습니다" : "복사"}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-neutral-600">
                        {formatDate(channel.created_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-3">
                          <Link
                            href={localizedPath(`/campaigns/${campaignId}/channels/${channel.id}/edit`) as any}
                            className="text-xs text-neutral-600 hover:text-neutral-900 transition-colors"
                          >
                            수정
                          </Link>
                          <button
                            onClick={() => handleDeleteChannel(channel.id)}
                            className="text-xs text-neutral-400 hover:text-red-600 transition-colors"
                          >
                            삭제
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
