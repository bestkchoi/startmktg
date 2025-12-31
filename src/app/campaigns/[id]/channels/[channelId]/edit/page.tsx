"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

export default function EditChannelPage() {
  const router = useRouter();
  const params = useParams();
  const campaignId = params.id as string;
  const channelId = params.channelId as string;

  // TODO: 채널 수정 페이지 구현
  // 현재는 채널 상세 페이지로 리다이렉트
  useEffect(() => {
    router.push(`/campaigns/${campaignId}`);
  }, [router, campaignId]);

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex items-center justify-center">
      <div className="text-sm text-neutral-500">리다이렉트 중...</div>
    </div>
  );
}
