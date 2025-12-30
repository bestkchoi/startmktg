"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLocalizedPath } from "@/hooks/use-locale";
import { normalizeCampaignName, buildFinalCampaignName, translateToEnglish, generateNormalizedNameCandidates } from "@/lib/campaign/campaign-name";
import type { CreateStartCampaignRequest, StartCampaign, ChannelType } from "@/types/campaign";

const CHANNEL_TYPES: Array<{ value: ChannelType; label: string; description?: string; adType?: "search" | "display" | "crm" | "other" }> = [
  { value: "meta", label: "Meta", description: "Facebook, Instagram", adType: "display" },
  { value: "google", label: "Google", description: "Google Ads", adType: "search" },
  { value: "naver", label: "Naver Search", description: "네이버 검색광고", adType: "search" },
  { value: "kakao", label: "Kakao", description: "카카오 비즈보드", adType: "display" },
  { value: "crm_sms", label: "CRM SMS", description: "CRM SMS 발송", adType: "crm" },
  { value: "crm_lms", label: "CRM LMS", description: "CRM LMS 발송", adType: "crm" },
  { value: "crm_kakao", label: "CRM Kakao", description: "CRM 카카오톡 발송", adType: "crm" },
  { value: "tiktok", label: "TikTok", description: "TikTok 광고", adType: "display" },
  { value: "other", label: "기타", description: "기타 매체", adType: "other" },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const localizedPath = useLocalizedPath();
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
  
  // 검색광고 ON/OFF 상태
  const [searchAdEnabled, setSearchAdEnabled] = useState(false);
  
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
      setIsTranslating(true);
      
      // ChatGPT API를 통한 번역
      const translateWithChatGPT = async () => {
        try {
          // 검색광고인 경우 18자 제한
          const isNaverSearch = searchAdEnabled && selectedChannels.includes("naver");
          const isGoogleAds = searchAdEnabled && selectedChannels.includes("google");
          const maxLength = (isNaverSearch || isGoogleAds) ? 18 : undefined;

          const response = await fetch("/api/translate", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              koreanText: formData.raw_name,
              maxLength,
            }),
          });

          const data = await response.json();

          if (data.ok && data.data) {
            // ChatGPT가 반환한 normalized 이름 사용
            const candidate = data.data.normalized;
            setTranslationCandidates([candidate]);
            setNormalizedName(candidate);
            setShowTranslationModal(true);
          } else {
            // API 실패 시 기존 로직 사용 (fallback)
            const translated = translateToEnglish(formData.raw_name);
            const candidates = generateNormalizedNameCandidates(translated, maxLength);
            setTranslationCandidates(candidates);
            setShowTranslationModal(candidates.length > 0);
            if (candidates.length > 0) {
              setNormalizedName(candidates[0]);
            }
          }
        } catch (error) {
          console.error("Translation error:", error);
          // 에러 발생 시 기존 로직 사용 (fallback)
          const isNaverSearch = searchAdEnabled && selectedChannels.includes("naver");
          const isGoogleAds = searchAdEnabled && selectedChannels.includes("google");
          const maxLength = (isNaverSearch || isGoogleAds) ? 18 : undefined;
          const translated = translateToEnglish(formData.raw_name);
          const candidates = generateNormalizedNameCandidates(translated, maxLength);
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
    } else {
      // 영어로 변경되면 원본 한글 초기화
      setOriginalKoreanName("");
      setIsTranslating(false);
      // 영어인 경우 바로 normalize
      let normalized = normalizeCampaignName(formData.raw_name);
      // 검색광고인 경우 18자 제한 (Naver Search 또는 Google Ads: sm_sa_nav_br_/sm_sa_nav_nb_/sm_sa_goo_br_/sm_sa_goo_nb_ prefix 12자 + 캠페인명 18자 = 30자)
      const isNaverSearch = searchAdEnabled && selectedChannels.includes("naver");
      const isGoogleAds = searchAdEnabled && selectedChannels.includes("google");
      if ((isNaverSearch || isGoogleAds) && normalized.length > 18) {
        normalized = normalized.substring(0, 18);
      }
      setNormalizedName(normalized);
      setTranslationCandidates([]);
      setShowTranslationModal(false);
    }
  }, [formData.raw_name, searchAdEnabled, selectedChannels]);

  // normalizedName과 startDate 변경 시 finalCampaignName 업데이트
  useEffect(() => {
    if (normalizedName && formData.start_date) {
      try {
        // 검색광고인 경우 특별한 형식 사용 (Naver Search 또는 Google Ads)
        const isNaverSearch = searchAdEnabled && selectedChannels.includes("naver");
        const isGoogleAds = searchAdEnabled && selectedChannels.includes("google");
        const isBrand = searchAdType === "brand";
        
        let channel: 'naver' | 'google' | undefined;
        if (isNaverSearch) {
          channel = 'naver';
        } else if (isGoogleAds) {
          channel = 'google';
        }
        
        const final = buildFinalCampaignName(
          formData.start_date,
          normalizedName,
          channel ? { channel, isBrand } : undefined
        );
        setFinalCampaignName(final);
      } catch (error) {
        setFinalCampaignName("");
      }
    } else {
      setFinalCampaignName("");
    }
  }, [normalizedName, formData.start_date, searchAdEnabled, selectedChannels, searchAdType]);

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
  const handleSelectCandidate = (candidate: string) => {
    // candidate는 이미 normalizedName 형태이므로 그대로 사용
    setNormalizedName(candidate);
    // 원본 한글이 있으면 캠페인명을 영어로 변경하고 설명에 한글 저장
    if (originalKoreanName) {
      handleChange("raw_name", candidate); // 캠페인명을 영어로 변경
      handleChange("description", originalKoreanName); // 원본 한글을 설명에 저장
      setOriginalKoreanName(""); // 원본 한글 초기화
    }
    setShowTranslationModal(false);
  };

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
          setErrors({ general: data.message || "캠페인 생성에 실패했습니다." });
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
      setErrors({ general: "캠페인 생성 중 오류가 발생했습니다." });
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
            href={localizedPath("/")}
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
              Campaign 만들기
            </h2>
            <div className="h-px w-16 bg-neutral-300" />
          </div>
          <Link
            href={localizedPath("/campaigns")}
            className="px-4 py-2 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
          >
            Campaign 목록
          </Link>
        </header>

        {/* 최종 캠페인명 ID 미리보기 - 검색광고 토글 OFF 시에만 표시 */}
        {!searchAdEnabled && finalCampaignName && (
          <div
            ref={(errors.general || errors.final_campaign_name) ? errorRef : null}
            className={`mb-8 border-2 px-6 py-5 ${
              errors.general || errors.final_campaign_name
                ? "border-red-500 bg-red-50"
                : "border-neutral-900 bg-neutral-50"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-neutral-600 font-medium">최종 캠페인명 ID 미리보기</p>
              <p className="text-xs text-neutral-500">
                {finalCampaignName.length}자
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
                <p className="text-sm font-medium text-red-700 flex-1">
                  {errors.general || errors.final_campaign_name}
                </p>
              </div>
            )}
          </div>
        )}

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

          {/* 검색광고 ON/OFF 토글 */}
          <div className="mb-6">
            <div className="flex items-center justify-between p-4 border border-neutral-200 rounded-lg bg-neutral-50">
              <div className="flex items-center gap-3">
                <label className="text-sm font-medium text-neutral-900 cursor-pointer">
                  검색광고
                </label>
                <button
                  type="button"
                  onClick={() => {
                    const newValue = !searchAdEnabled;
                    setSearchAdEnabled(newValue);
                    if (newValue) {
                      // 검색광고 필터로 자동 전환
                      setAdTypeFilter("search");
                    } else {
                      // 검색광고 OFF 시 검색광고 매체 선택 해제 및 상태 초기화
                      setSelectedChannels(selectedChannels.filter((c) => {
                        const channel = CHANNEL_TYPES.find((ch) => ch.value === c);
                        return channel?.adType !== "search";
                      }));
                      setSearchAdType(null);
                      // 전체 필터로 복귀
                      setAdTypeFilter("all");
                    }
                  }}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    searchAdEnabled ? "bg-neutral-900" : "bg-neutral-300"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      searchAdEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          {/* 검색광고 토글 ON 시 매체 선택 섹션을 여기에 표시 */}
          {searchAdEnabled && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-neutral-900 mb-3">
                광고할 매체 선택 <span className="text-neutral-400 text-xs font-normal">(선택사항, 나중에 추가 가능)</span>
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
                          // 검색광고 토글 ON 시 선택 해제 가능
                          setSelectedChannels(selectedChannels.filter((c) => c !== channel.value));
                          // 검색광고 선택 해제 시 검색광고 토글도 OFF
                          if (isSearchAd) {
                            const remainingSearchAds = selectedChannels.filter((c) => {
                              const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                              return ch?.adType === "search" && c !== channel.value;
                            });
                            if (remainingSearchAds.length === 0) {
                              setSearchAdEnabled(false);
                              setSearchAdType(null);
                            }
                          }
                        } else {
                          // 검색광고 토글 ON 시 단일 선택만 가능
                          if (searchAdEnabled) {
                            // 기존 검색광고 매체 선택 해제하고 새 매체만 선택
                            const nonSearchChannels = selectedChannels.filter((c) => {
                              const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                              return ch?.adType !== "search";
                            });
                            setSelectedChannels([...nonSearchChannels, channel.value]);
                          } else {
                            setSelectedChannels([...selectedChannels, channel.value]);
                          }
                          // 검색광고 선택 시 검색광고 토글도 ON
                          if (isSearchAd && !searchAdEnabled) {
                            setSearchAdEnabled(true);
                          }
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
                  <span className="font-medium text-neutral-900">1개</span> 매체 선택됨
                </p>
              )}
            </div>
          )}

          {/* 검색광고 ON 시 세부설정 패널 */}
          {searchAdEnabled && (
            <div className="mb-6 p-4 border border-neutral-200 rounded-lg bg-white">
              <p className="text-xs font-medium text-neutral-700 mb-3">검색광고 유형 선택</p>
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
                  브랜드명 검색광고
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
                  논브랜드 검색광고
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
              캠페인명 <span className="text-neutral-500">*</span>
              {searchAdEnabled && (selectedChannels.includes("naver") || selectedChannels.includes("google")) && (
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
              placeholder="예: 블랙프라이데이, Black Friday Sale"
              maxLength={searchAdEnabled && (selectedChannels.includes("naver") || selectedChannels.includes("google")) ? 18 : 100}
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

          {/* normalizedName 후보 선택 (한글 입력 시) */}
          {isTranslating && (
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
              <div className="flex items-center gap-2">
                <svg
                  className="animate-spin h-4 w-4 text-neutral-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-xs text-neutral-600">ChatGPT가 캠페인명을 추천하고 있습니다...</p>
              </div>
            </div>
          )}
          {showTranslationModal && translationCandidates.length > 0 && !isTranslating && (
            <div className="border border-neutral-200 bg-neutral-50 px-4 py-3">
              <p className="text-xs text-neutral-600 mb-2">ChatGPT 추천 캠페인명:</p>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectCandidate(translationCandidates[0])}
                  className="px-4 py-2 text-sm font-mono border-2 border-neutral-900 bg-white hover:bg-neutral-50 transition-all font-medium text-neutral-900"
                >
                  {translationCandidates[0]}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTranslationModal(false);
                    setNormalizedName("");
                    setTranslationCandidates([]);
                  }}
                  className="px-3 py-2 text-xs text-neutral-500 hover:text-neutral-700 transition-colors"
                >
                  다른 이름 사용
                </button>
              </div>
            </div>
          )}

          {/* 검색광고 토글 ON 시 최종 캠페인명 ID 미리보기 */}
          {searchAdEnabled && finalCampaignName && (
            <div
              ref={(errors.general || errors.final_campaign_name) ? errorRef : null}
              className={`mb-6 border-2 px-6 py-5 ${
                errors.general || errors.final_campaign_name
                  ? "border-red-500 bg-red-50"
                  : "border-neutral-900 bg-neutral-50"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-neutral-600 font-medium">최종 캠페인명 ID 미리보기</p>
                <p className="text-xs text-neutral-500">
                  {finalCampaignName.length}자
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

          {/* 시작일 */}
          <div>
            <label
              htmlFor="start_date"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              시작일 <span className="text-neutral-500">*</span>
            </label>
            <div className="relative inline-flex items-center group">
              <input
                id="start_date"
                type="date"
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
                aria-label="날짜 선택"
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
          <div>
            <label
              htmlFor="end_date"
              className="block text-sm font-medium text-neutral-900 mb-2"
            >
              종료일 <span className="text-neutral-400 text-xs">(선택)</span>
            </label>
            <div className="relative inline-flex items-center group">
              <input
                id="end_date"
                type="date"
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
                aria-label="날짜 선택"
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

          {/* 매체 선택 (선택사항) - 검색광고 토글이 OFF일 때만 표시 */}
          {!searchAdEnabled && (
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-3">
              광고할 매체 선택 <span className="text-neutral-400 text-xs font-normal">(선택사항, 나중에 추가 가능)</span>
            </label>
            
            {/* 광고 유형 필터 탭 */}
            <div className="flex gap-2 mb-4 border-b border-neutral-200">
                <button
                  type="button"
                  onClick={() => setAdTypeFilter("all")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    adTypeFilter === "all"
                      ? "text-neutral-900 border-b-2 border-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  전체
                </button>
                <button
                  type="button"
                  onClick={() => setAdTypeFilter("search")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    adTypeFilter === "search"
                      ? "text-neutral-900 border-b-2 border-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  검색광고
                </button>
                <button
                  type="button"
                  onClick={() => setAdTypeFilter("display")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    adTypeFilter === "display"
                      ? "text-neutral-900 border-b-2 border-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  디스플레이 광고
                </button>
                <button
                  type="button"
                  onClick={() => setAdTypeFilter("crm")}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    adTypeFilter === "crm"
                      ? "text-neutral-900 border-b-2 border-neutral-900"
                      : "text-neutral-500 hover:text-neutral-700"
                  }`}
                >
                  CRM
                </button>
              </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {CHANNEL_TYPES.filter((channel) => {
                // 검색광고 토글이 ON이면 검색광고만 표시
                if (searchAdEnabled) {
                  return channel.adType === "search";
                }
                // 검색광고 토글이 OFF면 기존 필터 로직 사용
                if (adTypeFilter === "all") return true;
                return channel.adType === adTypeFilter;
              }).map((channel) => {
                const isSelected = selectedChannels.includes(channel.value);
                const isSearchAd = channel.adType === "search";
                return (
                  <button
                    key={channel.value}
                    type="button"
                    onClick={() => {
                      if (isSelected) {
                        setSelectedChannels(selectedChannels.filter((c) => c !== channel.value));
                        // 검색광고 선택 해제 시 검색광고 토글도 OFF
                        if (isSearchAd) {
                          const remainingSearchAds = selectedChannels.filter((c) => {
                            const ch = CHANNEL_TYPES.find((ct) => ct.value === c);
                            return ch?.adType === "search" && c !== channel.value;
                          });
                          if (remainingSearchAds.length === 0) {
                            setSearchAdEnabled(false);
                            setSearchAdType(null);
                          }
                        }
                      } else {
                        setSelectedChannels([...selectedChannels, channel.value]);
                        // 검색광고 선택 시 검색광고 토글도 ON
                        if (isSearchAd && !searchAdEnabled) {
                          setSearchAdEnabled(true);
                        }
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
            {selectedChannels.length > 0 && (
              <p className="mt-3 text-xs text-neutral-500">
                <span className="font-medium text-neutral-900">{selectedChannels.length}개</span> 매체 선택됨
              </p>
            )}
          </div>
          )}

          {/* 액션 버튼 */}
          <div className="flex items-center justify-end gap-4 pt-6">
            <Link
              href={localizedPath("/")}
              className="px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={loading || !finalCampaignName}
              className="px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "생성 중..." : "생성"}
            </button>
          </div>
        </form>
      </main>

      {/* 성공 모달 */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-8 max-w-md w-full mx-4 border border-neutral-200">
            <h2 className="text-2xl font-light mb-4">캠페인이 생성되었습니다</h2>
            <div className="mb-6">
              <p className="text-sm text-neutral-600 mb-2">최종 캠페인명:</p>
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
                              localizedPath(`/campaigns/${showSuccessModal.campaign_id}/channels/new?type=${channelType}`)
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
                        router.push(localizedPath(`/campaigns/${showSuccessModal.campaign_id}`));
                      }}
                      className="flex-1 px-6 py-3 text-sm font-medium text-neutral-700 border border-neutral-200 transition-all duration-300 hover:border-neutral-900 hover:bg-neutral-50"
                    >
                      캠페인 상세 보기
                    </button>
                    <button
                      onClick={() => {
                        setShowSuccessModal(null);
                        router.push(localizedPath("/campaigns"));
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
                        router.push(localizedPath(`/campaigns/${showSuccessModal.campaign_id}/channels/new`));
                      }}
                      className="flex-1 px-6 py-3 text-sm font-medium text-white bg-neutral-900 border border-neutral-900 transition-all duration-300 hover:bg-white hover:text-neutral-900"
                    >
                      AD 만들기
                    </button>
                    <button
                      onClick={() => {
                        setShowSuccessModal(null);
                        router.push(localizedPath("/campaigns"));
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
                  router.push(localizedPath("/"));
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

