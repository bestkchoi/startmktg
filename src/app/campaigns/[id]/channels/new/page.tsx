"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import type { ChannelType, CreateChannelRequest, MetaCampaignGoal, GoogleCampaignGoal, NaverCampaignType } from "@/types/campaign";
import { generateUtmParams, buildFinalUrl } from "@/lib/campaign/utm-template";

const CHANNEL_TYPES: Array<{ value: ChannelType; label: string; description?: string }> = [
  { value: "meta", label: "Meta", description: "Facebook, Instagram" },
  { value: "google", label: "Google", description: "Google Ads" },
  { value: "naver", label: "Naver Search", description: "네이버 검색광고" },
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
  const [campaignLoading, setCampaignLoading] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [campaign, setCampaign] = useState<{ final_campaign_name?: string; raw_name?: string } | null>(null);
  const [formData, setFormData] = useState<CreateChannelRequest>({
    channel_type: channelType,
    landing_url: "",
    custom_content: "",
    custom_term: "",
    campaign_goal: undefined,
    campaign_type: undefined,
  });

  const [preview, setPreview] = useState<{
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    final_url?: string;
  } | null>(null);

  const [metaAdCount, setMetaAdCount] = useState<number | null>(null);
  const [metaAdNames, setMetaAdNames] = useState<{
    campaign_name?: string;
    adset_name?: string;
    ad_name?: string;
  } | null>(null);
  const [googleAdCount, setGoogleAdCount] = useState<number | null>(null);
  const [googleAdNames, setGoogleAdNames] = useState<{
    campaign_name?: string;
    adgroup_name?: string;
    ad_name?: string;
  } | null>(null);
  const [naverAdCount, setNaverAdCount] = useState<number | null>(null);
  const [naverAdNames, setNaverAdNames] = useState<{
    campaign_name?: string;
    adgroup_name?: string;
    keyword_name?: string;
  } | null>(null);
  const [finalUrl, setFinalUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [utmParamType, setUtmParamType] = useState<"standard" | "dynamic">("standard");
  const [googleUtmParamType, setGoogleUtmParamType] = useState<"standard" | "auto_tag">("auto_tag");

  const selectedChannel = CHANNEL_TYPES.find((c) => c.value === channelType);

  // 캠페인 정보 가져오기 및 매체별 개수 조회
  useEffect(() => {
    async function fetchCampaign() {
      setCampaignLoading(true);
      try {
        const response = await fetch(`/api/campaigns/${campaignId}`);
        const data = await response.json();
        if (response.ok && data.ok && data.data) {
          setCampaign(data.data);
          
          // Meta 매체인 경우
          if (channelType === "meta" && data.data.channels && data.data.final_campaign_name) {
            const baseCampaignPattern = `${data.data.final_campaign_name}_meta`;
            const metaChannels = data.data.channels.filter(
              (ch: any) => ch.channel_type === "meta" && 
                          ch.utm_campaign && 
                          ch.utm_campaign.startsWith(baseCampaignPattern)
            );
            setMetaAdCount(metaChannels.length);
            
            // Meta 광고 이름 계산 (campaign_goal이 선택된 경우에만)
            if (formData.campaign_goal) {
              const goalSuffix = formData.campaign_goal === "awareness" ? "_awa" :
                                formData.campaign_goal === "traffic" ? "_trf" :
                                formData.campaign_goal === "engagement" ? "_eng" :
                                formData.campaign_goal === "leads" ? "_rea" :
                                formData.campaign_goal === "app_promotion" ? "_app" :
                                formData.campaign_goal === "sales" ? "_sal" : "";
              const utmCampaign = `${data.data.final_campaign_name}_meta${goalSuffix}`;
              
              // 1. 캠페인 이름 계산
              const existingCampaigns = metaChannels.filter(
                (ch: any) => ch.utm_campaign === utmCampaign && ch.meta_campaign_name
              );
              const cpNumbers = existingCampaigns
                .map((ch: any) => {
                  const match = ch.meta_campaign_name?.match(/_cp(\d+)$/);
                  return match ? parseInt(match[1], 10) : 0;
                })
                .filter((num: number) => num > 0);
              const nextCpNumber = cpNumbers.length > 0 ? Math.max(...cpNumbers) + 1 : 1;
              const campaignName = `${utmCampaign}_cp${String(nextCpNumber).padStart(2, "0")}`;
              
              // 2. 광고 세트 이름 계산
              const existingAdsets = existingCampaigns.filter(
                (ch: any) => ch.meta_campaign_name === campaignName && ch.meta_adset_name
              );
              const grNumbers = existingAdsets
                .map((ch: any) => {
                  const match = ch.meta_adset_name?.match(/_gr(\d+)$/);
                  return match ? parseInt(match[1], 10) : 0;
                })
                .filter((num: number) => num > 0);
              const nextGrNumber = grNumbers.length > 0 ? Math.max(...grNumbers) + 1 : 1;
              const adsetName = `${campaignName}_gr${String(nextGrNumber).padStart(2, "0")}`;
              
              // 3. 광고 이름 계산
              const existingAds = existingAdsets.filter(
                (ch: any) => ch.meta_adset_name === adsetName && ch.meta_ad_name
              );
              const adNumbers = existingAds
                .map((ch: any) => {
                  const match = ch.meta_ad_name?.match(/_ad(\d+)$/);
                  return match ? parseInt(match[1], 10) : 0;
                })
                .filter((num: number) => num > 0);
              const nextAdNumber = adNumbers.length > 0 ? Math.max(...adNumbers) + 1 : 1;
              const adName = `${adsetName}_ad${String(nextAdNumber).padStart(2, "0")}`;
              
              setMetaAdNames({
                campaign_name: campaignName,
                adset_name: adsetName,
                ad_name: adName,
              });
            } else {
              setMetaAdNames(null);
            }
          } else if (channelType === "meta") {
            setMetaAdCount(0);
            setMetaAdNames(null);
          }
          
          // Google 매체인 경우
          if (channelType === "google" && data.data.channels && data.data.final_campaign_name) {
            const baseCampaignPattern = `${data.data.final_campaign_name}_google`;
            const googleChannels = data.data.channels.filter(
              (ch: any) => ch.channel_type === "google" && 
                          ch.utm_campaign && 
                          ch.utm_campaign.startsWith(baseCampaignPattern)
            );
            setGoogleAdCount(googleChannels.length);
            
            // Google 광고 이름 계산
            const utmCampaign = `${data.data.final_campaign_name}_google`;
            
            // 1. 캠페인 이름 계산: {final_campaign_name}_google_cp01
            const existingCampaigns = googleChannels.filter(
              (ch: any) => ch.utm_campaign === utmCampaign && ch.google_campaign_name
            );
            const cpNumbers = existingCampaigns
              .map((ch: any) => {
                const match = ch.google_campaign_name?.match(/_cp(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
              })
              .filter((num: number) => num > 0);
            const nextCpNumber = cpNumbers.length > 0 ? Math.max(...cpNumbers) + 1 : 1;
            const campaignName = `${utmCampaign}_cp${String(nextCpNumber).padStart(2, "0")}`;
            
            // 2. 광고 그룹 이름 계산: {campaign_name}_ag01
            const existingAdgroups = existingCampaigns.filter(
              (ch: any) => ch.google_campaign_name === campaignName && ch.google_adgroup_name
            );
            const agNumbers = existingAdgroups
              .map((ch: any) => {
                const match = ch.google_adgroup_name?.match(/_ag(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
              })
              .filter((num: number) => num > 0);
            const nextAgNumber = agNumbers.length > 0 ? Math.max(...agNumbers) + 1 : 1;
            const adgroupName = `${campaignName}_ag${String(nextAgNumber).padStart(2, "0")}`;
            
            // 3. 광고 이름 계산: {adgroup_name}_ad01
            const existingAds = existingAdgroups.filter(
              (ch: any) => ch.google_adgroup_name === adgroupName && ch.google_ad_name
            );
            const adNumbers = existingAds
              .map((ch: any) => {
                const match = ch.google_ad_name?.match(/_ad(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
              })
              .filter((num: number) => num > 0);
            const nextAdNumber = adNumbers.length > 0 ? Math.max(...adNumbers) + 1 : 1;
            const adName = `${adgroupName}_ad${String(nextAdNumber).padStart(2, "0")}`;
            
            setGoogleAdNames({
              campaign_name: campaignName,
              adgroup_name: adgroupName,
              ad_name: adName,
            });
          } else if (channelType === "google") {
            setGoogleAdCount(0);
            setGoogleAdNames(null);
          }
          
          // Naver 매체인 경우
          if (channelType === "naver" && data.data.channels && data.data.final_campaign_name) {
            const baseCampaignPattern = `${data.data.final_campaign_name}_naver`;
            const naverChannels = data.data.channels.filter(
              (ch: any) => ch.channel_type === "naver" && 
                          ch.utm_campaign && 
                          ch.utm_campaign.startsWith(baseCampaignPattern)
            );
            setNaverAdCount(naverChannels.length);
            
            // Naver 광고 이름 계산
            // Naver Search는 검색 광고이므로 _cp01 자동 추가하지 않음
            const utmCampaign = `${data.data.final_campaign_name}_naver`;
            
            // 1. 캠페인 이름 계산: {final_campaign_name}_naver (30자 제한)
            let campaignName = utmCampaign;
            if (campaignName.length > 30) {
              campaignName = campaignName.substring(0, 30);
            }
            
            // 2. 광고 그룹 이름 계산: {campaign_name}_ag01 (30자 제한)
            const existingAdgroups = naverChannels.filter(
              (ch: any) => ch.utm_campaign === campaignName
            );
            const agNumbers = existingAdgroups
              .map((ch: any) => {
                const match = ch.utm_content?.match(/_ag(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
              })
              .filter((num: number) => num > 0);
            const nextAgNumber = agNumbers.length > 0 ? Math.max(...agNumbers) + 1 : 1;
            let adgroupName = `${campaignName}_ag${String(nextAgNumber).padStart(2, "0")}`;
            // 30자 제한
            if (adgroupName.length > 30) {
              adgroupName = adgroupName.substring(0, 30);
            }
            
            // 3. 키워드 이름 계산: {adgroup_name}_kw01 (30자 제한)
            const existingKeywords = existingAdgroups.filter(
              (ch: any) => ch.utm_content === adgroupName
            );
            const kwNumbers = existingKeywords
              .map((ch: any) => {
                const match = ch.utm_term?.match(/_kw(\d+)$/);
                return match ? parseInt(match[1], 10) : 0;
              })
              .filter((num: number) => num > 0);
            const nextKwNumber = kwNumbers.length > 0 ? Math.max(...kwNumbers) + 1 : 1;
            let keywordName = `${adgroupName}_kw${String(nextKwNumber).padStart(2, "0")}`;
            // 30자 제한
            if (keywordName.length > 30) {
              keywordName = keywordName.substring(0, 30);
            }
            
            setNaverAdNames({
              campaign_name: campaignName,
              adgroup_name: adgroupName,
              keyword_name: keywordName,
            });
          } else if (channelType === "naver") {
            setNaverAdCount(0);
            setNaverAdNames(null);
          }
        }
      } catch (error) {
        console.error("Failed to fetch campaign:", error);
      } finally {
        setCampaignLoading(false);
      }
    }
    if (campaignId) {
      fetchCampaign();
    }
  }, [campaignId, channelType, formData.campaign_goal]);

  // Meta/Google/Naver 매체에서 랜딩 URL과 UTM 파라미터로 최종 URL 자동 생성
  useEffect(() => {
    if ((channelType === "meta" || channelType === "google" || channelType === "naver") && formData.landing_url) {
      try {
        // 랜딩 URL 유효성 검사
        const trimmedUrl = formData.landing_url.trim();
        if (!trimmedUrl) {
          setFinalUrl(null);
          return;
        }
        
        // URL 형식 검증
        try {
          new URL(trimmedUrl);
        } catch {
          // 유효하지 않은 URL 형식
          setFinalUrl(null);
          return;
        }
        
        let utmParams: any = {
          utm_term: "",
        };
        
        if (channelType === "meta") {
          utmParams.utm_source = "meta";
          utmParams.utm_medium = "display";
          
          if (utmParamType === "standard" && metaAdNames?.adset_name && metaAdNames?.ad_name) {
            // 표준 방식: META 광고 이름 사용
            utmParams.utm_campaign = metaAdNames.adset_name;
            utmParams.utm_content = metaAdNames.ad_name;
          } else if (utmParamType === "dynamic") {
            // URL 다이내믹 매개변수 방식
            utmParams.utm_campaign = "{{adset.id}}";
            utmParams.utm_content = "{{ad.id}}";
            utmParams.utm_id = "{{campaign.id}}";
            utmParams.utm_source_platform = "{{placement}}";
          } else {
            setFinalUrl(null);
            return;
          }
        } else if (channelType === "google") {
          if (googleUtmParamType === "auto_tag") {
            // Google Analytics 자동 태그 방식: UTM 파라미터 불필요, 랜딩 URL만 사용
            // Google Ads에서 입력한 캠페인 이름, 광고 그룹 이름, 광고 이름이 GA4에서 자동 수집됨
            setFinalUrl(trimmedUrl);
            return;
          } else if (googleUtmParamType === "standard") {
            // 표준 방식: Google 광고 이름 사용하여 UTM 파라미터 추가
            utmParams.utm_source = "google";
            utmParams.utm_medium = "cpc";
            if (googleAdNames?.adgroup_name && googleAdNames?.ad_name) {
              utmParams.utm_campaign = googleAdNames.adgroup_name;
              utmParams.utm_content = googleAdNames.ad_name;
            } else {
              setFinalUrl(null);
              return;
            }
          } else {
            setFinalUrl(null);
            return;
          }
        } else if (channelType === "naver") {
          // Naver 방식: Naver 광고 이름 사용하여 UTM 파라미터 추가
          utmParams.utm_source = "naver";
          utmParams.utm_medium = "cpc";
          if (naverAdNames?.adgroup_name && naverAdNames?.keyword_name) {
            utmParams.utm_campaign = naverAdNames.campaign_name;
            utmParams.utm_content = naverAdNames.adgroup_name;
            utmParams.utm_term = naverAdNames.keyword_name;
          } else {
            setFinalUrl(null);
            return;
          }
        }
        
        const url = buildFinalUrl(trimmedUrl, utmParams);
        setFinalUrl(url);
      } catch (error) {
        // buildFinalUrl 내부에서 이미 에러를 처리하므로 여기서는 조용히 처리
        setFinalUrl(null);
      }
    } else {
      setFinalUrl(null);
    }
  }, [channelType, formData.landing_url, metaAdNames, googleAdNames, naverAdNames, utmParamType, googleUtmParamType]);

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
          campaign_goal: channelType === "meta" ? formData.campaign_goal : undefined,
          utm_param_type: channelType === "meta" ? utmParamType : undefined,
          campaign_type: channelType === "naver" ? formData.campaign_type : undefined,
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
          campaign_goal: channelType === "meta" ? formData.campaign_goal : undefined,
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
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-20 sm:px-6">
        {/* START MKTG 로고 링크 */}
        <div className="mb-8">
          <Link
            // @ts-ignore - Next.js typedRoutes 경고 무시
            href="/"
            className="inline-block transition-opacity hover:opacity-70"
          >
            <h1 className="text-3xl sm:text-4xl font-light tracking-[-0.02em] uppercase">
              START MKTG
            </h1>
          </Link>
        </div>

        {/* 헤더 */}
        <header className="mb-12">
          <h2 className={`text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-3 ${channelType === "naver" ? "" : "uppercase"}`}>
            광고 생성 - {channelType === "naver" ? "Naver Search" : selectedChannel?.label}
          </h2>
          {campaign?.final_campaign_name && (
            <div className="mb-3">
              <span className="text-sm text-neutral-500">캠페인 ID: </span>
              <span className="text-sm font-mono text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded">
                {campaign.final_campaign_name}
              </span>
            </div>
          )}
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
            {/* Meta 매체 캠페인 목표 선택 */}
            {channelType === "meta" && (
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-4">
                  캠페인 목표 <span className="text-neutral-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { 
                      value: "awareness", 
                      label: "인지도", 
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M15 11a3 3 0 11-6 0m6 0a3 3 0 10-6 0m6 0h1.5M15 11h1.5m-6 0H9m0 0H7.5m0 0H6m0 0H4.5M21 11a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    },
                    { 
                      value: "traffic", 
                      label: "트래픽", 
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      )
                    },
                    { 
                      value: "engagement", 
                      label: "참여", 
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      )
                    },
                    { 
                      value: "leads", 
                      label: "잠재 고객", 
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                      )
                    },
                    { 
                      value: "app_promotion", 
                      label: "앱 홍보", 
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )
                    },
                    { 
                      value: "sales", 
                      label: "판매", 
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      )
                    },
                  ].map((goal) => (
                    <div
                      key={goal.value}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          campaign_goal: goal.value as MetaCampaignGoal,
                        }));
                      }}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.campaign_goal === goal.value
                          ? "border-neutral-900 bg-neutral-50 shadow-md"
                          : "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="radio"
                        name="campaign_goal"
                        value={goal.value}
                        checked={formData.campaign_goal === goal.value}
                        onChange={() => {}}
                        className="sr-only"
                        required={channelType === "meta"}
                      />
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="text-neutral-700">
                          {goal.icon}
                        </div>
                        <div className="text-base font-semibold text-neutral-900">{goal.label}</div>
                        {formData.campaign_goal === goal.value && (
                          <div className="absolute top-3 right-3">
                            <svg
                              className="w-6 h-6 text-neutral-900"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.campaign_goal && (
                  <p className="mt-2 text-xs text-red-600">{errors.campaign_goal}</p>
                )}
              </div>
            )}

            {/* Google 매체 캠페인 목표 선택 */}
            {channelType === "google" && (
              <div>
                <h2 className="text-2xl font-light tracking-[-0.02em] uppercase mb-3">
                  캠페인 목표가 무엇인가요?
                </h2>
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-neutral-900 mb-2">목표 선택하기</h3>
                  <p className="text-sm text-neutral-600">
                    캠페인에 가장 적합한 목적과 설정에 맞게 환경을 구현할 수 있는 목표를 선택합니다.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { 
                      value: "sales", 
                      label: "판매", 
                      description: "온라인, 앱, 전화, 매장을 통한 판매를 촉진합니다.",
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                        </svg>
                      )
                    },
                    { 
                      value: "leads", 
                      label: "리드", 
                      description: "고객의 액션을 유도하여 리드 및 다른 전환을 늘립니다.",
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      )
                    },
                    { 
                      value: "traffic", 
                      label: "웹사이트 트래픽", 
                      description: "관련성 높은 사용자가 웹사이트를 방문하도록 유도합니다.",
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                        </svg>
                      )
                    },
                    { 
                      value: "app_promotion", 
                      label: "앱 프로모션", 
                      description: "앱의 설치 수, 참여도 및 사전 등록을 늘립니다.",
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      )
                    },
                    { 
                      value: "awareness", 
                      label: "인지도 및 구매 고려도", 
                      description: "광범위한 잠재고객에게 도달하여 제품 또는 브랜드에 대한 관심도를 높입니다.",
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 002 2h2.945M15 11a3 3 0 11-6 0m6 0a3 3 0 10-6 0m6 0h1.5M15 11h1.5m-6 0H9m0 0H7.5m0 0H6m0 0H4.5M21 11a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      )
                    },
                    { 
                      value: "store_visits", 
                      label: "오프라인 매장 방문 및 프로모션", 
                      description: "음식점, 대리점 등 오프라인 매장으로의 방문을 유도합니다.",
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )
                    },
                    { 
                      value: "no_guidance", 
                      label: "안내 없이 캠페인 만들기", 
                      description: "다음 단계에서 캠페인을 선택하게 됩니다.",
                      icon: (
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )
                    },
                  ].map((goal) => (
                    <div
                      key={goal.value}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          campaign_goal: goal.value as GoogleCampaignGoal,
                        }));
                      }}
                      className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                        formData.campaign_goal === goal.value
                          ? "border-neutral-900 bg-neutral-50 shadow-md"
                          : "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm"
                      }`}
                    >
                      <input
                        type="radio"
                        name="google_campaign_goal"
                        value={goal.value}
                        checked={formData.campaign_goal === goal.value}
                        onChange={() => {}}
                        className="sr-only"
                        required={channelType === "google"}
                      />
                      <div className="flex flex-col items-center text-center gap-3">
                        <div className="text-neutral-700">
                          {goal.icon}
                        </div>
                        <div className="text-base font-semibold text-neutral-900">{goal.label}</div>
                        <div className="text-xs text-neutral-600 text-left w-full">{goal.description}</div>
                        {formData.campaign_goal === goal.value && (
                          <div className="absolute top-3 right-3">
                            <svg
                              className="w-6 h-6 text-neutral-900"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.campaign_goal && (
                  <p className="mt-2 text-xs text-red-600">{errors.campaign_goal}</p>
                )}
              </div>
            )}

            {/* Meta 매체 광고 이름 및 UTM 파라미터 미리보기 */}
            {channelType === "meta" && (
              <div className="space-y-3">
                {campaignLoading ? (
                  <>
                    <div className="border-l-2 border-neutral-300 pl-4 py-2">
                      <div className="h-4 bg-neutral-200 animate-pulse rounded w-3/4 mb-2"></div>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900">META 광고 이름</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                          <div className="h-3 bg-neutral-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-4 bg-neutral-200 animate-pulse rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900 mt-8">UTM 파라미터</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                          <div className="h-3 bg-neutral-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-4 bg-neutral-200 animate-pulse rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : campaign?.final_campaign_name ? (
                  <>
                <div className="border-l-2 border-neutral-300 pl-4 py-2">
                  <p className="text-sm text-neutral-600 leading-relaxed">
                    해당 서비스는 캠페인명, 광고그룹, 광고이름을 표준화하는 서비스이다.
                  </p>
                </div>
                
                {/* Meta 광고 이름 */}
                <h3 className="text-sm font-medium text-neutral-900">META 광고 이름</h3>
                <div className="space-y-3">
                  <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                    <label className="block text-xs text-neutral-500 mb-1">캠페인 이름</label>
                    <code className="text-sm text-neutral-900 font-mono break-all">
                      {metaAdNames?.campaign_name || `${campaign.final_campaign_name}_meta_xxx_cp01`}
                    </code>
                    {!metaAdNames && (
                      <p className="text-xs text-neutral-400 mt-1">캠페인 목표를 선택하면 자동으로 생성됩니다.</p>
                    )}
                  </div>
                  <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                    <label className="block text-xs text-neutral-500 mb-1">광고 세트 이름</label>
                    <code className="text-sm text-neutral-900 font-mono break-all">
                      {metaAdNames?.adset_name || `${campaign.final_campaign_name}_meta_xxx_cp01_gr01`}
                    </code>
                    {!metaAdNames && (
                      <p className="text-xs text-neutral-400 mt-1">캠페인 목표를 선택하면 자동으로 생성됩니다.</p>
                    )}
                  </div>
                  <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                    <label className="block text-xs text-neutral-500 mb-1">광고 이름</label>
                    <code className="text-sm text-neutral-900 font-mono break-all">
                      {metaAdNames?.ad_name || `${campaign.final_campaign_name}_meta_xxx_cp01_gr01_ad01`}
                    </code>
                    {!metaAdNames && (
                      <p className="text-xs text-neutral-400 mt-1">캠페인 목표를 선택하면 자동으로 생성됩니다.</p>
                    )}
                  </div>
                </div>
                
                <h3 className="text-sm font-medium text-neutral-900 mt-8">UTM 파라미터</h3>
                
                {/* UTM 파라미터 타입 선택 */}
                <div className="mb-4">
                  <label className="block text-xs font-medium text-neutral-700 mb-2">UTM 파라미터 타입</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="utm_param_type"
                        value="standard"
                        checked={utmParamType === "standard"}
                        onChange={(e) => setUtmParamType(e.target.value as "standard" | "dynamic")}
                        className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                      />
                      <span className="text-sm text-neutral-900">표준 방식 (META 광고 이름)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="utm_param_type"
                        value="dynamic"
                        checked={utmParamType === "dynamic"}
                        onChange={(e) => setUtmParamType(e.target.value as "standard" | "dynamic")}
                        className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                      />
                      <span className="text-sm text-neutral-900">URL 다이내믹 매개변수</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                    <label className="block text-xs text-neutral-500 mb-1">utm_source</label>
                    <code className="text-sm text-neutral-900 font-mono">meta</code>
                  </div>
                  <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                    <label className="block text-xs text-neutral-500 mb-1">utm_medium</label>
                    <code className="text-sm text-neutral-900 font-mono">display</code>
                  </div>
                  <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                    <label className="block text-xs text-neutral-500 mb-1">utm_campaign</label>
                    <code className="text-sm text-neutral-900 font-mono break-all">
                      {utmParamType === "standard" 
                        ? (metaAdNames?.adset_name || `${campaign.final_campaign_name}_meta_xxx_cp01_gr01`)
                        : "{{adset.id}}"
                      }
                    </code>
                    {utmParamType === "standard" && !metaAdNames && (
                      <p className="text-xs text-neutral-400 mt-1">캠페인 목표를 선택하면 자동으로 생성됩니다.</p>
                    )}
                    {utmParamType === "dynamic" && (
                      <p className="text-xs text-neutral-400 mt-1">Meta에서 자동으로 광고 세트 ID로 치환됩니다.</p>
                    )}
                  </div>
                  <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                    <label className="block text-xs text-neutral-500 mb-1">utm_content</label>
                    <code className="text-sm text-neutral-900 font-mono break-all">
                      {utmParamType === "standard"
                        ? (metaAdNames?.ad_name || `${campaign.final_campaign_name}_meta_xxx_cp01_gr01_ad01`)
                        : "{{ad.id}}"
                      }
                    </code>
                    {utmParamType === "standard" && !metaAdNames && (
                      <p className="text-xs text-neutral-400 mt-1">캠페인 목표를 선택하면 자동으로 생성됩니다.</p>
                    )}
                    {utmParamType === "dynamic" && (
                      <p className="text-xs text-neutral-400 mt-1">Meta에서 자동으로 광고 ID로 치환됩니다.</p>
                    )}
                  </div>
                  {utmParamType === "dynamic" && (
                    <>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_id</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">{"{{campaign.id}}"}</code>
                        <p className="text-xs text-neutral-400 mt-1">Meta에서 자동으로 캠페인 ID로 치환됩니다.</p>
                </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_source_platform</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">{"{{placement}}"}</code>
                        <p className="text-xs text-neutral-400 mt-1">Meta에서 자동으로 배치(placement)로 치환됩니다.</p>
                      </div>
                    </>
                  )}
                </div>
                  </>
                ) : null}
              </div>
            )}

            {/* Google 매체 광고 이름 및 UTM 파라미터 미리보기 */}
            {channelType === "google" && (
              <div className="space-y-3">
                {campaignLoading ? (
                  <>
                    <div className="border-l-2 border-neutral-300 pl-4 py-2">
                      <div className="h-4 bg-neutral-200 animate-pulse rounded w-3/4 mb-2"></div>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900">Google 광고 이름</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                          <div className="h-3 bg-neutral-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-4 bg-neutral-200 animate-pulse rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900 mt-8">UTM 파라미터</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                          <div className="h-3 bg-neutral-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-4 bg-neutral-200 animate-pulse rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : campaign?.final_campaign_name ? (
                  <>
                    <div className="border-l-2 border-neutral-300 pl-4 py-2">
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        해당 서비스는 캠페인명, 광고그룹, 광고이름을 표준화하는 서비스이다.
                      </p>
                    </div>
                    
                    {/* Google 광고 이름 */}
                    <h3 className="text-sm font-medium text-neutral-900">Google 광고 이름</h3>
                    <div className="space-y-3">
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">캠페인 이름</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {googleAdNames?.campaign_name || `${campaign.final_campaign_name}_google_cp01`}
                        </code>
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">광고 그룹 이름</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {googleAdNames?.adgroup_name || `${campaign.final_campaign_name}_google_cp01_ag01`}
                        </code>
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">광고 이름</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {googleAdNames?.ad_name || `${campaign.final_campaign_name}_google_cp01_ag01_ad01`}
                        </code>
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-medium text-neutral-900 mt-8">UTM 파라미터</h3>
                    
                    {/* UTM 파라미터 타입 선택 */}
                    <div className="mb-4">
                      <label className="block text-xs font-medium text-neutral-700 mb-2">
                        UTM 파라미터 타입
                        <a
                          href="https://support.google.com/google-ads/answer/3095550"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="ml-2 text-xs text-neutral-500 hover:text-neutral-900 underline"
                        >
                          (도움말)
                        </a>
                      </label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="google_utm_param_type"
                            value="auto_tag"
                            checked={googleUtmParamType === "auto_tag"}
                            onChange={(e) => setGoogleUtmParamType(e.target.value as "standard" | "auto_tag")}
                            className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                          />
                          <span className="text-sm text-neutral-900">Google Analytics(GA4) 자동 태그</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="google_utm_param_type"
                            value="standard"
                            checked={googleUtmParamType === "standard"}
                            onChange={(e) => setGoogleUtmParamType(e.target.value as "standard" | "auto_tag")}
                            className="w-4 h-4 text-neutral-900 border-neutral-300 focus:ring-neutral-900"
                          />
                          <span className="text-sm text-neutral-900">UTM 파라미터 포함</span>
                        </label>
                      </div>
                      {googleUtmParamType === "auto_tag" && (
                        <p className="mt-2 text-xs text-neutral-500">
                          Google Ads에서 자동 태그가 활성화되면 <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">gclid</code> 파라미터가 자동으로 추가됩니다.
                        </p>
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_source</label>
                        <code className="text-sm text-neutral-900 font-mono">google</code>
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_medium</label>
                        <code className="text-sm text-neutral-900 font-mono">cpc</code>
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_campaign</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {googleAdNames?.adgroup_name || `${campaign.final_campaign_name}_google_cp01_ag01`}
                        </code>
                        {googleUtmParamType === "auto_tag" && (
                          <p className="text-xs text-neutral-400 mt-1">Google Ads 자동 태그와 함께 사용됩니다.</p>
                        )}
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_content</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {googleAdNames?.ad_name || `${campaign.final_campaign_name}_google_cp01_ag01_ad01`}
                        </code>
                        {googleUtmParamType === "auto_tag" && (
                          <p className="text-xs text-neutral-400 mt-1">Google Ads 자동 태그와 함께 사용됩니다.</p>
                        )}
                      </div>
                      {googleUtmParamType === "auto_tag" && (
                        <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                          <label className="block text-xs text-neutral-500 mb-1">gclid (자동 추가)</label>
                          <code className="text-sm text-neutral-900 font-mono break-all text-neutral-400">
                            Google Ads에서 자동으로 추가됨
                          </code>
                          <p className="text-xs text-neutral-400 mt-1">
                            Google Ads 계정에서 자동 태그가 활성화되어 있으면 클릭 시 자동으로 <code className="text-xs bg-neutral-100 px-1 py-0.5 rounded">gclid</code> 파라미터가 추가됩니다.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* 랜딩 URL */}
                    <div className="mt-8">
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
                    
                    {/* 최종 URL */}
                    {finalUrl && (
                      <div className="mt-8 border border-neutral-200 bg-neutral-50 p-6 space-y-4">
                        <h3 className="text-sm font-medium text-neutral-900">최종 URL</h3>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-white px-3 py-2 border border-neutral-200 break-all">
                            {finalUrl}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(finalUrl)}
                            className="px-3 py-2 text-xs font-medium text-neutral-700 border border-neutral-200 hover:bg-white transition-colors whitespace-nowrap"
                          >
                            {copied ? "복사되었습니다" : "복사"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* Naver Search 매체 광고 이름 및 UTM 파라미터 미리보기 */}
            {channelType === "naver" && (
              <div className="space-y-3">
                {campaignLoading ? (
                  <>
                    <div className="border-l-2 border-neutral-300 pl-4 py-2">
                      <div className="h-4 bg-neutral-200 animate-pulse rounded w-3/4 mb-2"></div>
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900">Naver 광고 이름</h3>
                    <div className="space-y-3">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                          <div className="h-3 bg-neutral-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-4 bg-neutral-200 animate-pulse rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                    <h3 className="text-sm font-medium text-neutral-900 mt-8">UTM 파라미터</h3>
                    <div className="space-y-3">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                          <div className="h-3 bg-neutral-200 animate-pulse rounded w-24 mb-2"></div>
                          <div className="h-4 bg-neutral-200 animate-pulse rounded w-full"></div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : campaign?.final_campaign_name ? (
                  <>
                    <div className="border-l-2 border-neutral-300 pl-4 py-2">
                      <p className="text-sm text-neutral-600 leading-relaxed">
                        해당 서비스는 캠페인명, 광고그룹, 키워드를 표준화하는 서비스이다.
                      </p>
                    </div>
                    
                    {/* Naver 캠페인 유형 선택 */}
                    <div className="mb-8">
                      <label className="block text-sm font-medium text-neutral-900 mb-4">
                        캠페인 유형 <span className="text-neutral-500">*</span>
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { 
                            value: "powerlink", 
                            label: "파워링크 유형", 
                            description: "네이버 통합검색 및 네이버 내외부의 다양한 영역에 텍스트와 사이트 링크를 노출하는 기본형 검색광고",
                            icon: (
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                              </svg>
                            )
                          },
                          { 
                            value: "shopping_search", 
                            label: "쇼핑검색 유형", 
                            description: "네이버 쇼핑의 검색 결과 화면 등에 상품 이미지와 쇼핑 콘텐츠를 노출하는 판매 유도형 검색광고",
                            icon: (
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                              </svg>
                            )
                          },
                          { 
                            value: "power_content", 
                            label: "파워컨텐츠 유형", 
                            description: "블로그, 카페 콘텐츠를 네이버 통합검색 결과 및 콘텐츠 지면에 노출하는 정보 제공형 검색광고",
                            icon: (
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                              </svg>
                            )
                          },
                          { 
                            value: "brand_search", 
                            label: "브랜드검색/신제품검색 유형", 
                            description: "상호와 같은 브랜드 연관 키워드(브랜드 검색) 또는 제품 및 서비스 관련 일반 키워드(신제품 검색)로 검색했을 때 네이버 통합검색 결과에 다양한 콘텐츠를 노출하는 브랜딩형 검색광고",
                            icon: (
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                            )
                          },
                          { 
                            value: "place", 
                            label: "플레이스 유형", 
                            description: "네이버 스마트 플레이스의 업체 정보를 네이버 통합검색 결과 및 콘텐츠 지면에 노출하는 지역 정보 광고",
                            icon: (
                              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                            )
                          },
                        ].map((type) => (
                          <div
                            key={type.value}
                            onClick={() => {
                              setFormData((prev) => ({
                                ...prev,
                                campaign_type: type.value as NaverCampaignType,
                              }));
                            }}
                            className={`relative p-6 border-2 rounded-xl cursor-pointer transition-all duration-200 ${
                              formData.campaign_type === type.value
                                ? "border-neutral-900 bg-neutral-50 shadow-md"
                                : "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-sm"
                            }`}
                          >
                            <input
                              type="radio"
                              name="campaign_type"
                              value={type.value}
                              checked={formData.campaign_type === type.value}
                              onChange={() => {}}
                              className="sr-only"
                              required={channelType === "naver"}
                            />
                            <div className="flex items-center gap-3">
                              <div className="text-neutral-700 flex-shrink-0">
                                {type.icon}
                              </div>
                              <div className="text-base font-semibold text-neutral-900 flex-1">{type.label}</div>
                              {formData.campaign_type === type.value && (
                                <div className="flex-shrink-0">
                                  <svg
                                    className="w-6 h-6 text-neutral-900"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      {errors.campaign_type && (
                        <p className="mt-2 text-xs text-red-600">{errors.campaign_type}</p>
                      )}
                    </div>
                    
                    {/* Naver 광고 이름 */}
                    <h3 className="text-sm font-medium text-neutral-900">Naver 광고 이름</h3>
                    <div className="space-y-3">
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs text-neutral-500">캠페인 이름</label>
                          <span className="text-xs text-neutral-400">
                            {(() => {
                              const name = naverAdNames?.campaign_name || (() => {
                                const n = `${campaign.final_campaign_name}_naver`;
                                return n.length > 30 ? n.substring(0, 30) : n;
                              })();
                              return `${name.length}/30`;
                            })()}
                          </span>
                        </div>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {naverAdNames?.campaign_name || (() => {
                            const name = `${campaign.final_campaign_name}_naver`;
                            return name.length > 30 ? name.substring(0, 30) : name;
                          })()}
                        </code>
                        {!naverAdNames && (
                          <p className="text-xs text-neutral-400 mt-1">자동으로 생성됩니다.</p>
                        )}
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <div className="flex items-center justify-between mb-1">
                          <label className="block text-xs text-neutral-500">광고 그룹 이름</label>
                          <span className="text-xs text-neutral-400">
                            {(() => {
                              const name = naverAdNames?.adgroup_name || (() => {
                                const n = `${campaign.final_campaign_name}_naver_ag01`;
                                return n.length > 30 ? n.substring(0, 30) : n;
                              })();
                              return `${name.length}/30`;
                            })()}
                          </span>
                        </div>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {naverAdNames?.adgroup_name || (() => {
                            const name = `${campaign.final_campaign_name}_naver_ag01`;
                            return name.length > 30 ? name.substring(0, 30) : name;
                          })()}
                        </code>
                        {!naverAdNames && (
                          <p className="text-xs text-neutral-400 mt-1">자동으로 생성됩니다.</p>
                        )}
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">키워드 이름</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {naverAdNames?.keyword_name || (() => {
                            const name = `${campaign.final_campaign_name}_naver_ag01_kw01`;
                            return name.length > 30 ? name.substring(0, 30) : name;
                          })()}
                        </code>
                        {!naverAdNames && (
                          <p className="text-xs text-neutral-400 mt-1">자동으로 생성됩니다.</p>
                        )}
                      </div>
                    </div>
                    
                    <h3 className="text-sm font-medium text-neutral-900 mt-8">UTM 파라미터</h3>
                    
                    <div className="space-y-3">
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_source</label>
                        <code className="text-sm text-neutral-900 font-mono">naver</code>
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_medium</label>
                        <code className="text-sm text-neutral-900 font-mono">cpc</code>
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_campaign</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {naverAdNames?.campaign_name || (() => {
                            const name = `${campaign.final_campaign_name}_naver`;
                            return name.length > 30 ? name.substring(0, 30) : name;
                          })()}
                        </code>
                        {!naverAdNames && (
                          <p className="text-xs text-neutral-400 mt-1">자동으로 생성됩니다.</p>
                        )}
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_content</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {naverAdNames?.adgroup_name || (() => {
                            const name = `${campaign.final_campaign_name}_naver_ag01`;
                            return name.length > 30 ? name.substring(0, 30) : name;
                          })()}
                        </code>
                        {!naverAdNames && (
                          <p className="text-xs text-neutral-400 mt-1">자동으로 생성됩니다.</p>
                        )}
                      </div>
                      <div className="border border-neutral-200 bg-neutral-50 p-3 rounded">
                        <label className="block text-xs text-neutral-500 mb-1">utm_term</label>
                        <code className="text-sm text-neutral-900 font-mono break-all">
                          {naverAdNames?.keyword_name || (() => {
                            const name = `${campaign.final_campaign_name}_naver_ag01_kw01`;
                            return name.length > 30 ? name.substring(0, 30) : name;
                          })()}
                        </code>
                        {!naverAdNames && (
                          <p className="text-xs text-neutral-400 mt-1">자동으로 생성됩니다.</p>
                        )}
                      </div>
                    </div>
                    
                    {/* 랜딩 URL */}
                    <div className="mt-8">
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
                    
                    {/* 최종 URL */}
                    {finalUrl && (
                      <div className="mt-8 border border-neutral-200 bg-neutral-50 p-6 space-y-4">
                        <h3 className="text-sm font-medium text-neutral-900">최종 URL</h3>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs bg-white px-3 py-2 border border-neutral-200 break-all">
                            {finalUrl}
                          </code>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(finalUrl)}
                            className="px-3 py-2 text-xs font-medium text-neutral-700 border border-neutral-200 hover:bg-white transition-colors whitespace-nowrap"
                          >
                            {copied ? "복사되었습니다" : "복사"}
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : null}
              </div>
            )}

            {/* 랜딩 URL (Google/Meta/Naver가 아닌 매체용) */}
            {channelType !== "google" && channelType !== "meta" && channelType !== "naver" && (
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
            )}

            {/* 최종 URL (Meta/Naver 매체 자동 생성) */}
            {(channelType === "meta" || channelType === "naver") && finalUrl && (
              <div className="border border-neutral-200 bg-neutral-50 p-6 space-y-4">
                <h3 className="text-sm font-medium text-neutral-900">최종 URL</h3>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-white px-3 py-2 border border-neutral-200 break-all">
                    {finalUrl}
                  </code>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(finalUrl)}
                    className="px-3 py-2 text-xs font-medium text-neutral-700 border border-neutral-200 hover:bg-white transition-colors whitespace-nowrap"
                  >
                    {copied ? "복사되었습니다" : "복사"}
                  </button>
                </div>
              </div>
            )}

            {/* 커스텀 Content - Meta/Google/Naver 매체는 자동 생성되므로 제외 */}
            {channelType !== "meta" && channelType !== "google" && channelType !== "naver" && (
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
            )}

            {/* 커스텀 Term - Meta/Google 매체는 제외 */}
            {channelType !== "meta" && channelType !== "google" && (
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
            )}

            {/* 미리보기 버튼 - Meta/Google 매체는 자동 생성되므로 제외 */}
            {channelType !== "meta" && channelType !== "google" && formData.landing_url && (
              <button
                type="button"
                onClick={handlePreview}
                className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-colors"
              >
                미리보기
              </button>
            )}
          </div>

          {/* 미리보기 섹션 - Meta/Google 매체는 자동 생성되므로 제외 */}
          {channelType !== "meta" && channelType !== "google" && preview && (
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
