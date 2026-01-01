"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocalizedPath, useLocale } from "@/hooks/use-locale";
import { normalizeCampaignName, buildFinalCampaignName, translateToEnglish, generateNormalizedNameCandidates, lookupDictionary } from "@/lib/campaign/campaign-name";
import type { CreateStartCampaignRequest, StartCampaign, ChannelType } from "@/types/campaign";

const CHANNEL_TYPES: Array<{ value: ChannelType; label: string; description?: string; adType?: "search" | "display" | "crm" | "other" }> = [
  { value: "meta", label: "Meta", description: "Facebook, Instagram", adType: "display" },
  { value: "google", label: "Google", description: "Google Ads", adType: "search" },
  { value: "naver", label: "Naver Search", description: "Naver Search Ads", adType: "search" },
  { value: "kakao", label: "Kakao", description: "Kakao Bizboard", adType: "display" },
  { value: "crm_sms", label: "CRM Text", description: "SMS, LMS", adType: "crm" },
  { value: "crm_lms", label: "CRM LMS", description: "CRM LMS", adType: "crm" },
  { value: "crm_kakao", label: "CRM Kakao", description: "CRM KakaoTalk", adType: "crm" },
  { value: "tiktok", label: "TikTok", description: "TikTok Ads", adType: "display" },
  { value: "other", label: "Other", description: "Other Channels", adType: "other" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const localizedPath = useLocalizedPath();
  const locale = useLocale();
  
  // 텍스트 번역 객체
  const t = {
    en: {
      createCampaign: "Create Campaign",
      campaignList: "Campaign List",
      finalCampaignNamePreview: "Final Campaign Name ID Preview",
      characters: "characters",
      searchAd: "Search Ad",
      selectChannels: "Select advertising channels",
      selectChannelsOptional: "(Optional, can be added later)",
      searchAdType: "Search Ad Type",
      brandSearchAd: "Brand Search Ad",
      nonBrandSearchAd: "Non-Brand Search Ad",
      all: "All",
      displayAd: "Display Ad",
      crm: "CRM",
      examplePlaceholder: "e.g., Black Friday, Black Friday Sale",
      campaignName: "Campaign Name",
      maxCharacters: "(Max 18 characters)",
      campaignDescription: "Campaign Description",
      enterDescription: "Enter campaign description",
      startDate: "Start Date",
      endDate: "End Date",
      optional: "(Optional)",
      cancel: "Cancel",
      create: "Create",
      creating: "Creating...",
      campaignCreated: "Campaign Created",
      finalCampaignName: "Final Campaign Name:",
      copy: "Copy",
      copied: "Copied!",
      createAdForChannel: "Create {channel} AD",
      viewCampaignDetail: "View Campaign Detail",
      viewList: "View List",
      createAd: "Create AD",
      close: "Close",
      generatingCampaignName: "Generating campaign name...",
      predefinedCampaignName: "Predefined Campaign Name:",
      useDifferentName: "Use Different Name",
      errorCreatingCampaign: "Failed to create campaign.",
      errorOccurred: "An error occurred while creating campaign.",
      selectChannelsCount: "{count} channel(s) selected",
    },
    ko: {
      createCampaign: "Campaign 만들기",
      campaignList: "Campaign 목록",
      finalCampaignNamePreview: "최종 캠페인명 ID 미리보기",
      characters: "자",
      searchAd: "검색광고",
      selectChannels: "광고할 매체 선택",
      selectChannelsOptional: "(선택사항, 나중에 추가 가능)",
      searchAdType: "검색광고 유형 선택",
      brandSearchAd: "브랜드명 검색광고",
      nonBrandSearchAd: "논브랜드 검색광고",
      all: "전체",
      displayAd: "디스플레이 광고",
      crm: "CRM",
      examplePlaceholder: "예: 블랙프라이데이, Black Friday Sale",
      campaignName: "캠페인명",
      maxCharacters: "(최대 18자)",
      campaignDescription: "캠페인 설명",
      enterDescription: "캠페인 설명을 입력하세요",
      startDate: "시작일",
      endDate: "종료일",
      optional: "(선택)",
      cancel: "취소",
      create: "생성",
      creating: "생성 중...",
      campaignCreated: "캠페인이 생성되었습니다",
      finalCampaignName: "최종 캠페인명:",
      copy: "복사",
      copied: "복사됨!",
      createAdForChannel: "{channel} AD 만들기",
      viewCampaignDetail: "캠페인 상세 보기",
      viewList: "목록 보기",
      createAd: "AD 만들기",
      close: "닫기",
      generatingCampaignName: "캠페인명을 생성하고 있습니다...",
      predefinedCampaignName: "사전 정의된 캠페인명:",
      useDifferentName: "다른 이름 사용",
      errorCreatingCampaign: "캠페인 생성에 실패했습니다.",
      errorOccurred: "캠페인 생성 중 오류가 발생했습니다.",
      selectChannelsCount: "{count}개 매체 선택됨",
    },
  };
  
  const texts = (t[locale as keyof typeof t] || t.en) as typeof t.en;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formData, setFormData] = useState<CreateStartCampaignRequest>({
    raw_name: "",
    start_date: new Date().toISOString().split("T")[0],
    end_date: null,
    description: "",
  });

  // 실시간 미리보기 상태
  const [normalizedName, setNormalizedName] = useState<string>("");
  const [finalCampaignName, setFinalCampaignName] = useState<string>("");
  const [translationCandidates, setTranslationCandidates] = useState<string[]>([]);
  const [showTranslationModal, setShowTranslationModal] = useState(false);
  const [originalKoreanName, setOriginalKoreanName] = useState<string>(""); // 원본 한글 저장
  const [isTranslating, setIsTranslating] = useState(false); // 번역 중 상태
  
  // 매체 선택 상태
  const [selectedChannels, setSelectedChannels] = useState<ChannelType[]>([]);
  
  // 광고 유형 필터 상태 (전체, 검색광고, 디스플레이 광고, CRM)
  const [adTypeFilter, setAdTypeFilter] = useState<"all" | "search" | "display" | "crm" | "other">("all");
  
  // 광고 유형 선택 상태 (검색광고, 디스플레이 광고, CRM 중 하나만 선택 가능)
  const [selectedAdType, setSelectedAdType] = useState<"search" | "display" | "crm" | null>(null);
  
  // 검색광고 선택 시 브랜드/논브랜드 선택 상태
  const [searchAdType, setSearchAdType] = useState<"brand" | "non_brand" | null>(null);

  // 에러 메시지 스크롤용 ref
  const errorRef = useRef<HTMLDivElement | HTMLParagraphElement>(null);

  // 한글 감지 함수
  const containsKorean = (text: string): boolean => {
    return /[가-힣]/.test(text);
  };

  // rawName 변경 시 실시간 처리
  useEffect(() => {
    if (!formData.raw_name.trim()) {
      setNormalizedName("");
      setFinalCampaignName("");
      setTranslationCandidates([]);
      setShowTranslationModal(false);
      setIsTranslating(false);
      return;
    }

    const isKorean = containsKorean(formData.raw_name);

    if (isKorean) {
      // 한글인 경우 원본 한글 저장
      setOriginalKoreanName(formData.raw_name);
      
      // 1단계: 사전 정의된 번역 확인
      const dictTranslation = lookupDictionary(formData.raw_name);
      
      if (dictTranslation) {
        // 사전에 정의된 번역이 있는 경우 - maxLength는 나중에 적용
        const candidates = generateNormalizedNameCandidates(dictTranslation);
        setTranslationCandidates(candidates);
        setShowTranslationModal(candidates.length > 0);
        setIsTranslating(false);
        if (candidates.length > 0) {
          setNormalizedName(candidates[0]);
        }
      } else {
        // 사전에 없는 경우 번역 API 호출 - maxLength는 나중에 적용
        setIsTranslating(true);
        
        const translateWithChatGPT = async () => {
          try {
            const response = await fetch("/api/translate", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                koreanText: formData.raw_name,
              }),
            });

            const data = await response.json();

            if (data.ok && data.data) {
              // API가 반환한 normalized 이름 사용
              const candidate = data.data.normalized;
              setTranslationCandidates([candidate]);
              setNormalizedName(candidate);
              setShowTranslationModal(true);
            } else {
              // API 실패 시 기존 로직 사용 (fallback)
              const translated = translateToEnglish(formData.raw_name);
              const candidates = generateNormalizedNameCandidates(translated);
              setTranslationCandidates(candidates);
              setShowTranslationModal(candidates.length > 0);
              if (candidates.length > 0) {
                setNormalizedName(candidates[0]);
              }
            }
          } catch (error) {
            console.error("Translation error:", error);
            // 에러 발생 시 기존 로직 사용 (fallback)
            const translated = translateToEnglish(formData.raw_name);
            const candidates = generateNormalizedNameCandidates(translated);
            setTranslationCandidates(candidates);
            setShowTranslationModal(candidates.length > 0);
            if (candidates.length > 0) {
              setNormalizedName(candidates[0]);
            }
          } finally {
            setIsTranslating(false);
          }
        };

        // 디바운싱: 사용자가 입력을 멈춘 후 500ms 후에 번역 요청
        const timeoutId = setTimeout(() => {
          translateWithChatGPT();
        }, 500);

        return () => clearTimeout(timeoutId);
      }
    } else {
      // 영어로 변경되면 원본 한글 초기화
      setOriginalKoreanName("");
      setIsTranslating(false);
      // 영어인 경우 바로 normalize (18자 제한은 finalCampaignName 생성 시 적용)
      const normalized = normalizeCampaignName(formData.raw_name);
      setNormalizedName(normalized);
      setTranslationCandidates([]);
      setShowTranslationModal(false);
    }
  }, [formData.raw_name, selectedAdType]);

  // normalizedName과 startDate, selectedChannels 변경 시 finalCampaignName 업데이트
  // normalizedName에 18자 제한 적용 (검색광고인 경우)
  useEffect(() => {
    if (normalizedName && formData.start_date) {
      try {
        // 검색광고인 경우 18자 제한 적용
        const isNaverSearch = selectedAdType === "search" && selectedChannels.includes("naver");
        const isGoogleAds = selectedAdType === "search" && selectedChannels.includes("google");
        let finalNormalizedName = normalizedName;
        
        if ((isNaverSearch || isGoogleAds) && finalNormalizedName.length > 18) {
          finalNormalizedName = finalNormalizedName.substring(0, 18);
        }
        
        // 검색광고인 경우 특별한 형식 사용 (Naver Search 또는 Google Ads)
        const isBrand = searchAdType === "brand";
        
        let channel: 'naver' | 'google' | undefined;
        if (isNaverSearch) {
          channel = 'naver';
        } else if (isGoogleAds) {
          channel = 'google';
        }
        
        // 디스플레이 광고인 경우
        const adType = selectedAdType === "display" ? "display" : selectedAdType === "search" ? "search" : selectedAdType === "crm" ? "crm" : undefined;
        
        const final = buildFinalCampaignName(
          formData.start_date,
          finalNormalizedName,
          channel ? { channel, isBrand } : adType ? { adType } : undefined
        );
        setFinalCampaignName(final);
      } catch (error) {
        setFinalCampaignName("");
      }
    } else {
      setFinalCampaignName("");
    }
  }, [normalizedName, formData.start_date, selectedAdType, selectedChannels, searchAdType]);

  // 에러 발생 시 스크롤하여 에러 메시지로 이동
  useEffect(() => {
    if (errors.general || errors.final_campaign_name || errors.raw_name) {
      // 약간의 지연 후 스크롤 (DOM 업데이트 대기)
      setTimeout(() => {
        if (errorRef.current) {
          errorRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 100);
    }
  }, [errors.general, errors.final_campaign_name, errors.raw_name]);

  // 검색광고 매체 선택 해제 시 토글 OFF 로직은 매체 카드의 onClick 핸들러에서 처리
  // 사용자가 직접 토글을 ON한 경우는 매체 선택 없이도 토글이 유지되어야 함

  // normalizedName 후보 선택
  const handleSelectCandidate = async (candidate: string) => {
    // candidate는 이미 normalizedName 형태이므로 그대로 사용
    setNormalizedName(candidate);
    // 원본 한글이 있으면 캠페인명을 영어로 변경하고 설명에 한글 저장
    if (originalKoreanName) {
      handleChange("raw_name", candidate); // 캠페인명을 영어로 변경
      handleChange("description", originalKoreanName); // 원본 한글을 설명에 저장
      
      // 사전에 없는 캠페인명만 대기 목록에 저장
      const dictTranslation = lookupDictionary(originalKoreanName);
      if (!dictTranslation) {
        try {
          await fetch("/api/campaign-names/pending", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              korean: originalKoreanName,
              normalized: candidate,
            }),
          });
        } catch (error) {
          // 대기 목록 저장 실패는 무시 (사용자 경험에 영향 없음)
          console.error("Failed to save pending campaign name:", error);
        }
      }
      
      setOriginalKoreanName(""); // 원본 한글 초기화
    }
    setShowTranslationModal(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});

    try {
      // 한글 캠페인명이고 사전에 없는 경우 대기 목록에 저장
      // (번역 후보를 선택하지 않고 바로 제출한 경우를 대비)
      if (originalKoreanName) {
        const dictTranslation = lookupDictionary(originalKoreanName);
        if (!dictTranslation) {
          try {
            await fetch("/api/campaign-names/pending", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                korean: originalKoreanName,
                normalized: normalizedName,
              }),
            });
          } catch (error) {
            // 대기 목록 저장 실패는 무시 (사용자 경험에 영향 없음)
            console.error("Failed to save pending campaign name:", error);
          }
        }
      }

      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          normalized_name: normalizedName,
          selected_channels: selectedChannels,
          search_ad_type: searchAdType,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.ok) {
        if (data.errors) {
          // final_campaign_name 에러가 있으면 일반 에러로도 표시
          const errorObj = { ...data.errors };
          if (data.errors.final_campaign_name) {
            errorObj.general = data.errors.final_campaign_name;
          }
          setErrors(errorObj);
        } else {
          setErrors({ general: data.message || texts.errorCreatingCampaign });
        }
        setLoading(false);
        return;
      }

      // 성공 시 캠페인 상세 페이지로 이동 또는 성공 메시지 표시
      const campaign = data.data as StartCampaign;
      setLoading(false);
      setSuccessModalSelectedChannels([...selectedChannels]);
      setShowSuccessModal(campaign);
    } catch (error) {
      console.error("Failed to create campaign:", error);
      setErrors({ general: texts.errorOccurred });
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateStartCampaignRequest, value: string | null) => {
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

  const [showSuccessModal, setShowSuccessModal] = useState<StartCampaign | null>(null);
  const [copied, setCopied] = useState(false);
  const [successModalSelectedChannels, setSuccessModalSelectedChannels] = useState<ChannelType[]>([]);

  const copyFinalName = () => {
    if (showSuccessModal) {
      navigator.clipboard.writeText(showSuccessModal.final_campaign_name);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-4 py-20 sm:px-6">
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
            <h2 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-3">
              {texts.createCampaign}
            </h2>
            <div className="h-px w-16 bg-neutral-300" />
          </div>
          <Link
            href={localizedPath("/campaigns") as any}
            className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
          >
            {texts.campaignList}
          </Link>
        </header>


        {/* 폼 */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* 일반 에러 메시지 - 최종 캠페인명 미리보기 영역에 표시되지 않은 경우에만 표시 */}
          {errors.general && !finalCampaignName && (
            <div ref={errorRef} className="border-2 border-red-500 bg-red-50 px-6 py-4 rounded">
              <div className="flex items-start gap-3">
                <svg
                  className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-red-700 flex-1">
                  {errors.general}
                </p>
              </div>
            </div>
          )}

          {/* 광고 유형 선택: 큰 카드 형태 (상호 배타적) */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              광고 유형 선택 <span className="text-neutral-400 text-xs font-normal">(하나만 선택 가능)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* 검색광고 카드 */}
              <button
                type="button"
                onClick={() => {
                  if (selectedAdType === "search") {
                    // 이미 선택된 경우 해제
                    setSelectedAdType(null);
                    setSelectedChannels(selectedChannels.filter((c) => {
                      const channel = CHANNEL_TYPES.find((ch) => ch.value === c);
                      return channel?.adType !== "search";
                    }));
                    setSearchAdType(null);
                    setAdTypeFilter("all");
                  } else {
                    // 다른 광고 유형 선택 해제 및 검색광고 선택
                    setSelectedAdType("search");
                    setSelectedChannels(selectedChannels.filter((c) => {
                      const channel = CHANNEL_TYPES.find((ch) => ch.value === c);
                      return channel?.adType !== "search";
                    }));
                    setSearchAdType(null);
                    setAdTypeFilter("search");
                  }
                }}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  selectedAdType === "search"
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-lg"
                    : "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-md"
                }`}
              >
                {selectedAdType === "search" && (
                  <div className="absolute top-3 right-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="pr-8">
                  <div className="text-lg font-semibold mb-1">{texts.searchAd}</div>
                  <p className={`text-xs ${selectedAdType === "search" ? "text-neutral-300" : "text-neutral-500"}`}>
                    브랜드명 또는 논브랜드 검색광고
                  </p>
                </div>
              </button>

              {/* 디스플레이 광고 카드 */}
              <button
                type="button"
                onClick={() => {
                  if (selectedAdType === "display") {
                    // 이미 선택된 경우 해제
                    setSelectedAdType(null);
                    setSelectedChannels(selectedChannels.filter((c) => {
                      const channel = CHANNEL_TYPES.find((ch) => ch.value === c);
                      return channel?.adType !== "display";
                    }));
                    setAdTypeFilter("all");
                  } else {
                    // 다른 광고 유형 선택 해제 및 디스플레이 광고 선택
                    setSelectedAdType("display");
                    setSelectedChannels(selectedChannels.filter((c) => {
                      const channel = CHANNEL_TYPES.find((ch) => ch.value === c);
                      return channel?.adType !== "display";
                    }));
                    setSearchAdType(null);
                    setAdTypeFilter("display");
                  }
                }}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  selectedAdType === "display"
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-lg"
                    : "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-md"
                }`}
              >
                {selectedAdType === "display" && (
                  <div className="absolute top-3 right-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="pr-8">
                  <div className="text-lg font-semibold mb-1">{texts.displayAd}</div>
                  <p className={`text-xs ${selectedAdType === "display" ? "text-neutral-300" : "text-neutral-500"}`}>
                    이미지, 동영상 등의 디스플레이 광고
                  </p>
                </div>
              </button>

              {/* CRM 카드 */}
              <button
                type="button"
                onClick={() => {
                  if (selectedAdType === "crm") {
                    // 이미 선택된 경우 해제
                    setSelectedAdType(null);
                    setSelectedChannels(selectedChannels.filter((c) => {
                      const channel = CHANNEL_TYPES.find((ch) => ch.value === c);
                      return channel?.adType !== "crm";
                    }));
                    setAdTypeFilter("all");
                  } else {
                    // 다른 광고 유형 선택 해제 및 CRM 선택
                    setSelectedAdType("crm");
                    setSelectedChannels(selectedChannels.filter((c) => {
                      const channel = CHANNEL_TYPES.find((ch) => ch.value === c);
                      return channel?.adType !== "crm";
                    }));
                    setSearchAdType(null);
                    setAdTypeFilter("crm");
                  }
                }}
                className={`relative p-5 rounded-xl border-2 transition-all text-left ${
                  selectedAdType === "crm"
                    ? "border-neutral-900 bg-neutral-900 text-white shadow-lg"
                    : "border-neutral-200 bg-white hover:border-neutral-400 hover:shadow-md"
                }`}
              >
                {selectedAdType === "crm" && (
                  <div className="absolute top-3 right-3">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
                <div className="pr-8">
                  <div className="text-lg font-semibold mb-1">{texts.crm}</div>
                  <p className={`text-xs ${selectedAdType === "crm" ? "text-neutral-300" : "text-neutral-500"}`}>
                    SMS, LMS, 카카오톡 등 고객 관리
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* 검색광고 선택 시 매체 선택 섹션 */}
          {selectedAdType === "search" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-900 mb-3">
                {texts.selectChannels} <span className="text-neutral-400 text-xs font-normal">{texts.selectChannelsOptional}</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CHANNEL_TYPES.filter((channel) => {
                  // 검색광고만 표시
                  return channel.adType === "search";
                }).map((channel) => {
                  const isSelected = selectedChannels.includes(channel.value);
                  const isSearchAd = channel.adType === "search";
                  return (
                    <button
                      key={channel.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          // 선택 해제
                          setSelectedChannels(selectedChannels.filter((c) => c !== channel.value));
                        } else {
                          // 검색광고는 단일 선택만 가능
                          const nonSearchChannels = selectedChannels.filter((c) => {
                            const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                            return ch?.adType !== "search";
                          });
                          setSelectedChannels([...nonSearchChannels, channel.value]);
                        }
                      }}
                      className={`relative p-4 border-2 rounded-lg transition-all duration-200 text-left group h-full flex flex-col ${
                        isSelected
                          ? "border-neutral-900 bg-neutral-900 text-white shadow-md"
                          : "border-neutral-200 bg-white text-neutral-900 hover:border-neutral-900 hover:shadow-sm"
                      }`}
                    >
                      {/* 선택 표시 - 우측 상단 체크 아이콘 */}
                      {isSelected && (
                        <div className="absolute top-2 right-2 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <svg
                            className="w-3.5 h-3.5 text-neutral-900"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      {/* 매체 정보 */}
                      <div className="pr-6 flex-1 flex flex-col">
                        <span className="text-sm font-semibold block mb-1">{channel.label}</span>
                        {channel.description && (
                          <p
                            className={`text-xs leading-tight flex-1 ${
                              isSelected ? "text-neutral-300" : "text-neutral-500"
                            }`}
                          >
                            {channel.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedChannels.filter((c) => {
                const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                return ch?.adType === "search";
              }).length > 0 && (
                <p className="mt-3 text-xs text-neutral-500">
                  {texts.selectChannelsCount.replace("{count}", selectedChannels.filter((c) => {
                    const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                    return ch?.adType === "search";
                  }).length.toString())}
                </p>
              )}
            </div>
          )}

          {/* CRM 선택 시 매체 선택 섹션 */}
          {selectedAdType === "crm" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-900 mb-3">
                {texts.selectChannels} <span className="text-neutral-400 text-xs font-normal">{texts.selectChannelsOptional}</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CHANNEL_TYPES.filter((channel) => {
                  // CRM만 표시, crm_lms는 숨김 (crm_sms와 통합)
                  return channel.adType === "crm" && channel.value !== "crm_lms";
                }).map((channel) => {
                  // crm_sms 선택 여부는 crm_sms 또는 crm_lms 중 하나라도 선택되어 있으면 true
                  const isSelected = channel.value === "crm_sms" 
                    ? (selectedChannels.includes("crm_sms") || selectedChannels.includes("crm_lms"))
                    : selectedChannels.includes(channel.value);
                  
                  return (
                    <button
                      key={channel.value}
                      type="button"
                      onClick={() => {
                        if (channel.value === "crm_sms") {
                          // CRM 문자메시지 선택 시 SMS와 LMS 모두 처리
                          if (isSelected) {
                            // 선택 해제: crm_sms와 crm_lms 모두 제거
                            setSelectedChannels(selectedChannels.filter((c) => c !== "crm_sms" && c !== "crm_lms"));
                          } else {
                            // 선택 추가: crm_sms와 crm_lms 모두 추가
                            const newChannels = [...selectedChannels];
                            if (!newChannels.includes("crm_sms")) newChannels.push("crm_sms");
                            if (!newChannels.includes("crm_lms")) newChannels.push("crm_lms");
                            setSelectedChannels(newChannels);
                          }
                        } else {
                          // 다른 CRM 채널은 기존 로직
                          if (isSelected) {
                            setSelectedChannels(selectedChannels.filter((c) => c !== channel.value));
                          } else {
                            setSelectedChannels([...selectedChannels, channel.value]);
                          }
                        }
                      }}
                      className={`relative border-2 rounded-lg p-4 text-left transition-all ${
                        isSelected
                          ? "border-neutral-900 bg-neutral-900"
                          : "border-neutral-200 bg-white hover:border-neutral-400"
                      }`}
                    >
                      {/* 체크 아이콘 */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      {/* 매체 정보 */}
                      <div className="pr-6 flex-1 flex flex-col">
                        <span className={`text-sm font-semibold block mb-1 ${isSelected ? "text-white" : "text-neutral-900"}`}>
                          {channel.label}
                        </span>
                        {channel.description && (
                          <p
                            className={`text-xs leading-tight flex-1 ${
                              isSelected ? "text-neutral-300" : "text-neutral-500"
                            }`}
                          >
                            {channel.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {(() => {
                // CRM 채널 개수 계산 (crm_sms와 crm_lms는 하나로 카운트)
                const crmChannels = selectedChannels.filter((c) => {
                  const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                  return ch?.adType === "crm";
                });
                // crm_sms와 crm_lms가 모두 선택되어 있으면 하나로 카운트
                const hasSms = crmChannels.includes("crm_sms");
                const hasLms = crmChannels.includes("crm_lms");
                const smsLmsCount = (hasSms && hasLms) ? 1 : (hasSms || hasLms ? 1 : 0);
                const otherCrmCount = crmChannels.filter((c) => c !== "crm_sms" && c !== "crm_lms").length;
                const totalCount = smsLmsCount + otherCrmCount;
                
                return totalCount > 0 ? (
                  <p className="mt-3 text-xs text-neutral-500">
                    {texts.selectChannelsCount.replace("{count}", totalCount.toString())}
                  </p>
                ) : null;
              })()}
            </div>
          )}

          {/* 디스플레이 광고 선택 시 매체 선택 섹션 */}
          {selectedAdType === "display" && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-900 mb-3">
                {texts.selectChannels} <span className="text-neutral-400 text-xs font-normal">{texts.selectChannelsOptional}</span>
              </label>
              
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {CHANNEL_TYPES.filter((channel) => {
                  // 디스플레이 광고만 표시
                  return channel.adType === "display";
                }).map((channel) => {
                  const isSelected = selectedChannels.includes(channel.value);
                  return (
                    <button
                      key={channel.value}
                      type="button"
                      onClick={() => {
                        if (isSelected) {
                          // 선택 해제
                          setSelectedChannels(selectedChannels.filter((c) => c !== channel.value));
                        } else {
                          // 선택 추가
                          setSelectedChannels([...selectedChannels, channel.value]);
                        }
                      }}
                      className={`relative border-2 rounded-lg p-4 text-left transition-all ${
                        isSelected
                          ? "border-neutral-900 bg-neutral-900"
                          : "border-neutral-200 bg-white hover:border-neutral-400"
                      }`}
                    >
                      {/* 체크 아이콘 */}
                      {isSelected && (
                        <div className="absolute top-2 right-2">
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                      {/* 매체 정보 */}
                      <div className="pr-6 flex-1 flex flex-col">
                        <span className={`text-sm font-semibold block mb-1 ${isSelected ? "text-white" : "text-neutral-900"}`}>
                          {channel.label}
                        </span>
                        {channel.description && (
                          <p
                            className={`text-xs leading-tight flex-1 ${
                              isSelected ? "text-neutral-300" : "text-neutral-500"
                            }`}
                          >
                            {channel.description}
                          </p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedChannels.filter((c) => {
                const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                return ch?.adType === "display";
              }).length > 0 && (
                <p className="mt-3 text-xs text-neutral-500">
                  {texts.selectChannelsCount.replace("{count}", selectedChannels.filter((c) => {
                    const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                    return ch?.adType === "display";
                  }).length.toString())}
                </p>
              )}
            </div>
          )}

          {/* 검색광고 선택 시 세부설정 패널 */}
          {selectedAdType === "search" && (
            <div className="mb-6 p-4 border border-neutral-200 rounded-lg bg-white">
              <p className="text-xs font-medium text-neutral-700 mb-3">{texts.searchAdType}</p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchAdType("brand");
                  }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded transition-colors ${
                    searchAdType === "brand"
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  {texts.brandSearchAd}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchAdType("non_brand");
                  }}
                  className={`flex-1 px-4 py-2.5 text-sm font-medium rounded transition-colors ${
                    searchAdType === "non_brand"
                      ? "bg-neutral-900 text-white"
                      : "bg-white text-neutral-700 border border-neutral-300 hover:border-neutral-900"
                  }`}
                >
                  {texts.nonBrandSearchAd}
                </button>
              </div>
            </div>
          )}

          {/* 캠페인명 (rawName) */}
          <div>
            <label
              htmlFor="raw_name"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              {texts.campaignName} <span className="text-neutral-500">*</span>
              {selectedAdType === "search" && (selectedChannels.includes("naver") || selectedChannels.includes("google")) && (
                <span className="text-xs text-neutral-500 font-normal ml-2">
                  (최대 18자)
                </span>
              )}
            </label>
            <input
              id="raw_name"
              type="text"
              value={formData.raw_name}
              onChange={(e) => handleChange("raw_name", e.target.value)}
                    placeholder={texts.examplePlaceholder}
              maxLength={selectedAdType === "search" && (selectedChannels.includes("naver") || selectedChannels.includes("google")) ? 18 : 100}
              required
              className={`w-full border px-4 py-3 text-sm outline-none transition-all duration-300 ${
                errors.general || errors.final_campaign_name
                  ? "border-red-500 bg-red-50 focus:border-red-600 focus:bg-red-50"
                  : "border-neutral-200 bg-white focus:border-neutral-900 focus:bg-neutral-50"
              }`}
            />
            {errors.raw_name && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {errors.raw_name}
              </p>
            )}
            {(errors.general || errors.final_campaign_name) && !finalCampaignName && (
              <p ref={errorRef} className="mt-2 text-sm text-red-600 flex items-start gap-2">
                <svg
                  className="w-5 h-5 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="flex-1">{errors.general || errors.final_campaign_name}</span>
              </p>
            )}
          </div>

          {/* 캠페인 설명 */}
          {formData.description && (
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-neutral-900 mb-2"
              >
                캠페인 설명
              </label>
              <input
                id="description"
                type="text"
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="캠페인 설명을 입력하세요"
                maxLength={200}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
            </div>
          )}

          {showTranslationModal && translationCandidates.length > 0 && !isTranslating && (
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
              {lookupDictionary(formData.raw_name) && (
                <p className="text-xs text-neutral-600 mb-2">
                  {texts.predefinedCampaignName}
                </p>
              )}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectCandidate(translationCandidates[0])}
                  className="px-4 py-2 text-sm font-mono border-2 border-neutral-900 bg-white hover:bg-neutral-50 transition-all font-medium text-neutral-900"
                >
                  {translationCandidates[0]}
                </button>
              </div>
            </div>
          )}


          {/* 시작일 */}
          <div lang={locale === "en" ? "en" : locale === "ko" ? "ko" : "en"}>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              {texts.startDate} <span className="text-neutral-500">*</span>
            </label>
            <div className="relative inline-flex items-center group">
              <input
                id="start_date"
                type="date"
                lang={locale === "en" ? "en-US" : locale === "ko" ? "ko-KR" : "en-US"}
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
                required
                className="border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50 w-auto min-w-[200px] cursor-pointer"
                onClick={(e) => {
                  // @ts-ignore - showPicker는 최신 브라우저 API
                  if (e.currentTarget.showPicker) {
                    e.currentTarget.showPicker();
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const input = document.getElementById("start_date") as HTMLInputElement;
                  if (input) {
                    input.focus();
                    // @ts-ignore - showPicker는 최신 브라우저 API
                    if (input.showPicker) {
                      input.showPicker();
                    } else {
                      input.click();
                    }
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-neutral-100 rounded transition-colors"
                aria-label={locale === "ko" ? "날짜 선택" : "Select date"}
              >
                <svg
                  className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors"
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
              </button>
            </div>
            {errors.start_date && (
              <p className="mt-1 text-xs text-neutral-500">{errors.start_date}</p>
            )}
          </div>

          {/* 종료일 (선택) */}
          <div lang={locale === "en" ? "en" : locale === "ko" ? "ko" : "en"}>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              {texts.endDate} <span className="text-neutral-400 text-xs">{texts.optional}</span>
            </label>
            <div className="relative inline-flex items-center group">
              <input
                id="end_date"
                type="date"
                lang={locale === "en" ? "en-US" : locale === "ko" ? "ko-KR" : "en-US"}
                value={formData.end_date || ""}
                onChange={(e) => handleChange("end_date", e.target.value || null)}
                min={formData.start_date}
                className="border border-neutral-200 bg-white px-4 py-3 pr-10 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50 w-auto min-w-[200px] cursor-pointer"
                onClick={(e) => {
                  // @ts-ignore - showPicker는 최신 브라우저 API
                  if (e.currentTarget.showPicker) {
                    e.currentTarget.showPicker();
                  }
                }}
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  const input = document.getElementById("end_date") as HTMLInputElement;
                  if (input) {
                    input.focus();
                    // @ts-ignore - showPicker는 최신 브라우저 API
                    if (input.showPicker) {
                      input.showPicker();
                    } else {
                      input.click();
                    }
                  }
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer p-1 hover:bg-neutral-100 rounded transition-colors"
                aria-label={locale === "ko" ? "날짜 선택" : "Select date"}
              >
                <svg
                  className="w-5 h-5 text-neutral-400 group-hover:text-neutral-600 transition-colors"
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
              </button>
            </div>
            {errors.end_date && (
              <p className="mt-1 text-xs text-neutral-500">{errors.end_date}</p>
            )}
          </div>

          {/* 최종 캠페인명 ID 미리보기 - 모든 광고 유형 */}
          {finalCampaignName && (
            <div
              ref={(errors.general || errors.final_campaign_name) ? errorRef : null}
              className={`mb-6 border-2 px-6 py-5 ${
                errors.general || errors.final_campaign_name
                  ? "border-red-500 bg-red-50"
                  : "border-neutral-900 bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-neutral-600 font-medium">{texts.finalCampaignNamePreview}</p>
                <p className="text-xs text-neutral-500">
                  {finalCampaignName.length} {texts.characters}
                </p>
              </div>
              <p className="text-lg font-mono font-semibold text-neutral-900">
                {finalCampaignName}
              </p>
              {(errors.general || errors.final_campaign_name) && (
                <div className="mt-3 flex items-start gap-2">
                  <svg
                    className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm text-red-600 flex-1">
                    {errors.general || errors.final_campaign_name}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link
              href={localizedPath("/") as any}
              className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
            >
              {texts.cancel}
            </Link>
            <button
              type="submit"
              disabled={loading || !finalCampaignName}
              className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? texts.creating : texts.create}
            </button>
          </div>
        </form>
      </main>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md w-full mx-4 border border-neutral-200">
            <h2 className="text-2xl font-light mb-4">{texts.campaignCreated}</h2>
            <div className="mb-6">
              <p className="text-sm text-neutral-600 mb-2">{texts.finalCampaignName}</p>
              <div className="flex items-center gap-2">
                <p className="text-base font-mono font-medium text-neutral-900 flex-1">
                  {showSuccessModal.final_campaign_name}
                </p>
                <button
                  onClick={copyFinalName}
                  className="px-4 py-2 text-xs border border-neutral-300 hover:border-neutral-900 transition-all"
                >
                  {copied ? "복사됨!" : "복사"}
                </button>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {/* 선택한 매체가 있으면 매체별 AD 만들기 버튼 표시 */}
              {successModalSelectedChannels.length > 0 ? (
                <>
                  <p className="text-sm text-neutral-600 mb-2">
                    선택한 매체로 AD를 만들 수 있습니다:
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {successModalSelectedChannels.map((channelType) => {
                      const channel = CHANNEL_TYPES.find((c) => c.value === channelType);
                      return (
                        <button
                          key={channelType}
                          onClick={() => {
                            setShowSuccessModal(null);
                            router.push(
                              localizedPath(`/campaigns/${showSuccessModal.campaign_id}/channels/new?type=${channelType}`) as any
                            );
                          }}
                          className="px-4 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900"
                        >
                          {channel?.label} AD 만들기
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowSuccessModal(null);
                        router.push(localizedPath(`/campaigns/${showSuccessModal.campaign_id}`) as any);
                      }}
                      className="flex-1 px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
                    >
                      캠페인 상세 보기
                    </button>
                    <button
                      onClick={() => {
                        setShowSuccessModal(null);
                        router.push(localizedPath("/campaigns") as any);
                      }}
                      className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
                    >
                      목록 보기
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setShowSuccessModal(null);
                        router.push(localizedPath(`/campaigns/${showSuccessModal.campaign_id}/channels/new`) as any);
                      }}
                      className="flex-1 px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900"
                    >
                      AD 만들기
                    </button>
                    <button
                      onClick={() => {
                        setShowSuccessModal(null);
                        router.push(localizedPath("/campaigns") as any);
                      }}
                      className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
                    >
                      목록 보기
                    </button>
                  </div>
                </>
              )}
              <button
                onClick={() => {
                  setShowSuccessModal(null);
                  router.push(localizedPath("/") as any);
                }}
                className="w-full px-6 py-3 text-sm font-medium text-neutral-500 border border-neutral-200 transition-all duration-300 hover:border-neutral-400 hover:bg-neutral-50"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

