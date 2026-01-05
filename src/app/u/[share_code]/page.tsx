"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

type ShareData = {
  share_code: string;
  adtype: string;
  media: string;
  utm_source: string;
  utm_medium: string;
  clean_landing_url: string | null;
  final_utm_url: string;
  campaign_id: string; // utm_id 대신 campaign_id 사용
  adgroup_name: string; // utm_campaign 대신 adgroup_name 사용
  created_at: string;
};

// 광고유형 라벨 매핑
const adTypeLabels: Record<string, string> = {
  sa: "검색광고",
  sp: "쇼핑검색광고",
  da: "디스플레이광고",
  cr: "CRM",
};

// 매체 라벨 매핑
const mediaLabels: Record<string, string> = {
  ggl: "Google",
  nav: "Naver",
  kko: "Kakao",
  met: "Meta",
  msg: "통합 메시지",
  kak: "카카오톡",
  eml: "이메일",
};

export default function UtmLinkSharePage() {
  const params = useParams();
  const shareCode = params?.share_code as string;

  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 공유 데이터 조회
  useEffect(() => {
    if (!shareCode) {
      setError("공유 코드가 없습니다.");
      setLoading(false);
      return;
    }

    const fetchShareData = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/utm-link-shares?share_code=${shareCode}`);
        const result = await response.json();

        if (result.ok && result.data) {
          setShareData(result.data);
        } else {
          setError(result.message || "공유 링크를 찾을 수 없습니다.");
        }
      } catch (err: any) {
        console.error("공유 데이터 조회 오류:", err);
        setError("공유 링크를 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchShareData();
  }, [shareCode]);

  // 복사 함수
  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day} ${hours}:${minutes}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-12 sm:px-6">
          <div className="border-2 border-neutral-200 bg-neutral-50 p-12 rounded-lg text-center">
            <p className="text-neutral-600">로딩 중...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !shareData) {
    return (
      <div className="min-h-screen bg-white text-neutral-900">
        <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-12 sm:px-6">
          <div className="border-2 border-red-200 bg-red-50 p-6 rounded-lg">
            <p className="text-red-600 font-medium mb-2">오류가 발생했습니다</p>
            <p className="text-red-600 text-sm">{error || "공유 링크를 찾을 수 없습니다."}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-12 sm:px-6">
        {/* 헤더 */}
        <header className="mb-8">
          <h2 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-3">
            UTM 링크 공유
          </h2>
          <p className="text-neutral-600 text-sm">
            광고 세팅 및 검토를 위해 공유하는 UTM 링크 결과입니다.
          </p>
        </header>

        {/* 메타 정보 */}
        <div className="mb-6 p-4 bg-neutral-50 border border-neutral-200 rounded-lg">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-neutral-600 text-xs mb-1">생성일시</p>
              <p className="font-medium">{formatDate(shareData.created_at)}</p>
            </div>
            <div>
              <p className="text-neutral-600 text-xs mb-1">광고유형</p>
              <p className="font-medium">
                <span className="inline-block px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded text-xs font-medium">
                  {adTypeLabels[shareData.adtype] || shareData.adtype}
                </span>
              </p>
            </div>
            <div>
              <p className="text-neutral-600 text-xs mb-1">매체</p>
              <p className="font-medium">{mediaLabels[shareData.media] || shareData.media}</p>
            </div>
            <div>
              <p className="text-neutral-600 text-xs mb-1">공유 링크</p>
              <div className="flex items-center gap-2">
                <p className="font-mono text-xs">{`/u/${shareData.share_code}`}</p>
                <button
                  type="button"
                  onClick={() => copyToClipboard(`${typeof window !== 'undefined' ? window.location.origin : 'https://startmktg.com'}/u/${shareData.share_code}`, "share")}
                  className="px-2 py-1 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                >
                  {copiedField === "share" ? "복사됨!" : "복사"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 결과 카드 */}
        <div className="space-y-4 mb-8">
          {/* 캠페인명 (campaign_id) */}
          <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700">캠페인명 (utm_id)</label>
              <button
                type="button"
                onClick={() => copyToClipboard(shareData.campaign_id, "campaign")}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
              >
                {copiedField === "campaign" ? "복사됨!" : "복사"}
              </button>
            </div>
            <p className="text-base font-mono font-semibold text-neutral-900 break-all">
              {shareData.campaign_id}
            </p>
          </div>

          {/* 광고그룹명 (adgroup_name) */}
          <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-neutral-700">광고그룹명 (utm_campaign)</label>
              <button
                type="button"
                onClick={() => copyToClipboard(shareData.adgroup_name, "adgroup")}
                className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
              >
                {copiedField === "adgroup" ? "복사됨!" : "복사"}
              </button>
            </div>
            <p className="text-base font-mono font-semibold text-neutral-900 break-all">
              {shareData.adgroup_name}
            </p>
          </div>

          {/* Clean Landing URL (있는 경우만 표시) */}
          {shareData.clean_landing_url && (
            <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-neutral-700">Clean Landing URL</label>
                <button
                  type="button"
                  onClick={() => copyToClipboard(shareData.clean_landing_url!, "clean")}
                  className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                >
                  {copiedField === "clean" ? "복사됨!" : "복사"}
                </button>
              </div>
              <p className="text-sm font-mono text-neutral-900 break-all">
                {shareData.clean_landing_url}
              </p>
            </div>
          )}

          {/* Final UTM URL */}
          <div className="border-2 border-neutral-900 bg-neutral-900 text-white p-6 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-white">Final UTM URL</label>
              <button
                type="button"
                onClick={() => copyToClipboard(shareData.final_utm_url, "final")}
                className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
              >
                {copiedField === "final" ? "복사됨!" : "복사"}
              </button>
            </div>
            <p className="text-sm font-mono text-white break-all">
              {shareData.final_utm_url}
            </p>
          </div>

          {/* UTM 파라미터 정보 */}
          <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
            <h3 className="text-sm font-semibold text-neutral-900 mb-4">UTM 파라미터</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">utm_source:</span>
                <span className="font-mono font-medium">{shareData.utm_source}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">utm_medium:</span>
                <span className="font-mono font-medium">{shareData.utm_medium}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">utm_id:</span>
                <span className="font-mono font-medium text-xs break-all">{shareData.campaign_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-neutral-600">utm_campaign:</span>
                <span className="font-mono font-medium text-xs break-all">{shareData.adgroup_name}</span>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}

