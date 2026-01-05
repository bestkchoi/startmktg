"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";
import { buildCleanLandingUrl, buildFinalUtmUrl, isValidUrl } from "@/lib/utm/url-utils";
import { generateNamingByAdType, generateUtmParamsByAdType } from "@/lib/utm/ad-type-handlers";
import type { AdType, AdTypeInfo, SearchAdInput, DisplayAdInput, CrmInput, UtmParams } from "@/types/utm";
import type { SearchAdCampaignOption } from "@/types/campaign";

export default function UtmLinkCreatePage() {
  const locale = useLocale();

  // 광고유형 정의
  const AD_TYPES: AdTypeInfo[] = [
    { code: "sa", label: "검색광고", description: "Search Ads", isAvailable: true },
    { code: "sp", label: "쇼핑검색광고", description: "Shopping Search Ads", isAvailable: true },
    { code: "da", label: "디스플레이광고", description: "Display Ads", isAvailable: true },
    { code: "cr", label: "CRM", description: "CRM", isAvailable: true },
  ];

  // 입력 상태
  const [adType, setAdType] = useState<AdType | null>(null);
  const [landingUrl, setLandingUrl] = useState<string>("");
  
  // 검색광고(sa) 및 쇼핑검색광고(sp) 전용 입력 상태
  const [media, setMedia] = useState<"ggl" | "nav" | "kko" | "met" | "msg" | "kak" | "eml" | null>(null);
  const [searchType, setSearchType] = useState<"br" | "nb" | null>(null);
  const [campaignOption, setCampaignOption] = useState<SearchAdCampaignOption | null>(null);
  
  // 디스플레이광고(da) 전용 입력 상태
  const [displayAdCampaignName, setDisplayAdCampaignName] = useState<string>("");
  
  // CRM(cr) 전용 입력 상태
  const [crmCampaignName, setCrmCampaignName] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(() => {
    // 오늘 날짜를 YYYY-MM-DD 형식으로
    const now = new Date();
    const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
    const year = seoulTime.getFullYear();
    const month = (seoulTime.getMonth() + 1).toString().padStart(2, '0');
    const day = seoulTime.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
  });
  const [adGroupNumber, setAdGroupNumber] = useState<number>(1);

  // 에러 상태
  const [urlError, setUrlError] = useState<string>("");
  const [campaignNameError, setCampaignNameError] = useState<string>("");
  const [crmCampaignNameError, setCrmCampaignNameError] = useState<string>("");

  // 출력 결과
  const [campaignName, setCampaignName] = useState<string>("");
  const [adGroupName, setAdGroupName] = useState<string>("");
  const [cleanLandingUrl, setCleanLandingUrl] = useState<string>("");
  const [finalUtmUrl, setFinalUtmUrl] = useState<string>("");

  // 복사 상태
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // 저장 상태
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveMessage, setSaveMessage] = useState<string>("");

  // 캠페인 옵션 정의
  const CAMPAIGN_OPTIONS: Array<{ value: SearchAdCampaignOption; label: string; description: string }> = [
    { value: "home", label: "메인 페이지 랜딩", description: "home" },
    { value: "cmp", label: "경쟁사 맥락", description: "cmp" },
    { value: "cat", label: "카테고리 맥락", description: "cat" },
    { value: "prd", label: "제품, 기능 맥락", description: "prd" },
    { value: "intent", label: "행동 의도 맥락", description: "intent" },
  ];

  // 광고그룹 번호 옵션 (gr01 ~ gr20)
  const AD_GROUP_NUMBERS = Array.from({ length: 20 }, (_, i) => i + 1);

  // 실시간 계산: 입력값이 변경될 때마다 결과 업데이트
  useEffect(() => {
    // 광고유형이 선택되지 않았거나 준비 중인 경우
    if (!adType) {
      setCampaignName("");
      setAdGroupName("");
      setCleanLandingUrl("");
      setFinalUtmUrl("");
      return;
    }

    const selectedAdType = AD_TYPES.find((at) => at.code === adType);
    if (!selectedAdType || !selectedAdType.isAvailable) {
      setCampaignName("");
      setAdGroupName("");
      setCleanLandingUrl("");
      setFinalUtmUrl("");
      return;
    }

    // 검색광고(sa) 및 쇼핑검색광고(sp) 전용 검증
    if (adType === "sa" || adType === "sp") {
      if (!landingUrl.trim() || !media || !searchType || !campaignOption) {
        setCampaignName("");
        setAdGroupName("");
        setCleanLandingUrl("");
        setFinalUtmUrl("");
        return;
      }
    }

    // 디스플레이광고(da) 전용 검증
    if (adType === "da") {
      if (!landingUrl.trim() || !media || !displayAdCampaignName.trim()) {
        setCampaignName("");
        setAdGroupName("");
        setCleanLandingUrl("");
        setFinalUtmUrl("");
        setCampaignNameError("");
        return;
      }
    }

    // CRM(cr) 전용 검증 (URL은 선택사항)
    if (adType === "cr") {
      if (!media || !crmCampaignName.trim()) {
        setCampaignName("");
        setAdGroupName("");
        setCleanLandingUrl("");
        setFinalUtmUrl("");
        setCrmCampaignNameError("");
        return;
      }
    }

    // URL 유효성 검사 (앞뒤 공백 trim)
    // CRM은 URL이 선택사항이므로, URL이 없어도 캠페인명/광고그룹명은 생성 가능
    const trimmedUrl = landingUrl.trim();
    const hasUrl = trimmedUrl.length > 0;
    
    if (hasUrl && !isValidUrl(trimmedUrl)) {
      setUrlError("유효한 URL을 입력해주세요. (http:// 또는 https://로 시작해야 합니다)");
      // URL이 유효하지 않아도 CRM은 캠페인명/광고그룹명은 생성 가능
      if (adType !== "cr") {
        setCampaignName("");
        setAdGroupName("");
        setCleanLandingUrl("");
        setFinalUtmUrl("");
        return;
      }
    }

    if (hasUrl) {
      setUrlError("");
    } else {
      setUrlError("");
    }

    try {
      // 광고유형별 네이밍 생성
      if (adType === "sa" || adType === "sp") {
        // URL 필수
        if (!hasUrl) {
          setCampaignName("");
          setAdGroupName("");
          setCleanLandingUrl("");
          setFinalUtmUrl("");
          return;
        }

        // Clean landing URL 생성 (UTM 파라미터 제거)
        const cleanUrl = buildCleanLandingUrl(trimmedUrl);
        setCleanLandingUrl(cleanUrl);
        const input: SearchAdInput = {
          media: media as "ggl" | "nav",
          searchType: searchType!,
          campaignOption: campaignOption!,
          startDate,
          adGroupNumber,
        };

        const naming = generateNamingByAdType(adType, input);
        setCampaignName(naming.campaignName);
        setAdGroupName(naming.adGroupName);

        // UTM 파라미터 생성
        const utmParams = generateUtmParamsByAdType(adType, input);

        // Final UTM URL 생성
        const finalUrl = buildFinalUtmUrl(trimmedUrl, utmParams);
        setFinalUtmUrl(finalUrl);
        setCampaignNameError("");
      } else if (adType === "da") {
        // URL 필수
        if (!hasUrl) {
          setCampaignName("");
          setAdGroupName("");
          setCleanLandingUrl("");
          setFinalUtmUrl("");
          return;
        }

        // Clean landing URL 생성 (UTM 파라미터 제거)
        const cleanUrl = buildCleanLandingUrl(trimmedUrl);
        setCleanLandingUrl(cleanUrl);

        try {
          const input: DisplayAdInput = {
            media: media as "ggl" | "nav" | "kko" | "met",
            campaignName: displayAdCampaignName.trim(),
            startDate,
            adGroupNumber,
          };

          const naming = generateNamingByAdType(adType, input);
          setCampaignName(naming.campaignName);
          setAdGroupName(naming.adGroupName);

          // UTM 파라미터 생성
          const utmParams = generateUtmParamsByAdType(adType, input);

          // Final UTM URL 생성
          const finalUrl = buildFinalUtmUrl(trimmedUrl, utmParams);
          setFinalUtmUrl(finalUrl);
          setCampaignNameError("");
        } catch (error: any) {
          // 정규화 에러 처리
          setCampaignNameError(error.message || "캠페인명 정규화 중 오류가 발생했습니다.");
          setCampaignName("");
          setAdGroupName("");
          setFinalUtmUrl("");
        }
      } else if (adType === "cr") {
        try {
          const input: CrmInput = {
            media: media as "msg" | "kak" | "eml",
            campaignName: crmCampaignName.trim(),
            startDate,
            adGroupNumber,
          };

          const naming = generateNamingByAdType(adType, input);
          setCampaignName(naming.campaignName);
          setAdGroupName(naming.adGroupName);

          // URL이 있는 경우에만 clean landing url과 final utm url 생성
          if (hasUrl) {
            // Clean landing URL 생성 (UTM 파라미터 제거)
            const cleanUrl = buildCleanLandingUrl(trimmedUrl);
            setCleanLandingUrl(cleanUrl);

            // UTM 파라미터 생성
            const utmParams = generateUtmParamsByAdType(adType, input);

            // Final UTM URL 생성
            const finalUrl = buildFinalUtmUrl(trimmedUrl, utmParams);
            setFinalUtmUrl(finalUrl);
          } else {
            // URL이 없으면 clean landing url과 final utm url은 빈 문자열
            setCleanLandingUrl("");
            setFinalUtmUrl("");
          }
          setCrmCampaignNameError("");
        } catch (error: any) {
          // 정규화 에러 처리
          setCrmCampaignNameError(error.message || "캠페인명 정규화 중 오류가 발생했습니다.");
          setCampaignName("");
          setAdGroupName("");
          setCleanLandingUrl("");
          setFinalUtmUrl("");
        }
      }
    } catch (error) {
      console.error("Error generating UTM link:", error);
      setUrlError("UTM 링크 생성 중 오류가 발생했습니다.");
      setCampaignName("");
      setAdGroupName("");
      setFinalUtmUrl("");
    }
  }, [adType, landingUrl, media, searchType, campaignOption, displayAdCampaignName, crmCampaignName, startDate, adGroupNumber]);

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

  // 저장 함수
  const handleSave = async () => {
    if (!adType || !campaignName || !adGroupName) {
      setSaveMessage("저장할 데이터가 없습니다.");
      return;
    }

    // URL이 필수인 광고유형(sa, sp, da)은 URL이 있어야 함
    if ((adType === "sa" || adType === "sp" || adType === "da") && !landingUrl.trim()) {
      setSaveMessage("랜딩페이지 URL이 필요합니다.");
      return;
    }

    setIsSaving(true);
    setSaveMessage("");

    try {
      // UTM 파라미터 가져오기
      let utmParams: UtmParams | null = null;
      let mediaValue: string | null = null;

      if (adType === "sa" || adType === "sp") {
        const input: SearchAdInput = {
          media: media as "ggl" | "nav",
          searchType: searchType!,
          campaignOption: campaignOption!,
          startDate,
          adGroupNumber,
        };
        utmParams = generateUtmParamsByAdType(adType, input);
        mediaValue = media as string;
      } else if (adType === "da") {
        const input: DisplayAdInput = {
          media: media as "ggl" | "nav" | "kko" | "met",
          campaignName: displayAdCampaignName.trim(),
          startDate,
          adGroupNumber,
        };
        utmParams = generateUtmParamsByAdType(adType, input);
        mediaValue = media as string;
      } else if (adType === "cr") {
        const input: CrmInput = {
          media: media as "msg" | "kak" | "eml",
          campaignName: crmCampaignName.trim(),
          startDate,
          adGroupNumber,
        };
        utmParams = generateUtmParamsByAdType(adType, input);
        mediaValue = media as string;
      }

      if (!utmParams || !mediaValue) {
        setSaveMessage("UTM 파라미터를 생성할 수 없습니다.");
        setIsSaving(false);
        return;
      }

      // API 호출
      const payload = {
        adtype: adType,
        media: mediaValue,
        utm_source: utmParams.utm_source,
        utm_medium: utmParams.utm_medium,
        landing_url: landingUrl.trim() || undefined,
      };

      console.log("[UTM LINK 만들기] 저장 요청 시작:", payload);

      const response = await fetch("/api/utm-links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      console.log("[UTM LINK 만들기] 저장 응답 상태:", response.status);

      const result = await response.json();
      console.log("[UTM LINK 만들기] 저장 응답 데이터:", result);

      if (result.ok) {
        if (result.saved) {
          console.log("[UTM LINK 만들기] 저장 성공, 저장된 데이터:", result.data);
          setSaveMessage("저장되었습니다!");
        } else {
          console.warn("[UTM LINK 만들기] 저장 실패 (UTM 링크는 생성됨):", result);
          const errorMsg = result.error 
            ? `UTM 링크는 생성되었지만 로그 저장에 실패했습니다. (오류: ${result.error})`
            : "UTM 링크는 생성되었지만 로그 저장에 실패했습니다.";
          setSaveMessage(errorMsg);
          // 에러가 있으면 5초 동안 표시
          setTimeout(() => setSaveMessage(""), 5000);
        }
        // 3초 후 메시지 제거
        setTimeout(() => setSaveMessage(""), 3000);
      } else {
        console.error("[UTM LINK 만들기] 저장 오류:", result);
        const errorMsg = result.error 
          ? `${result.message} (오류: ${result.error})`
          : result.message || "저장 중 오류가 발생했습니다.";
        setSaveMessage(errorMsg);
        setTimeout(() => setSaveMessage(""), 5000);
      }
    } catch (error: any) {
      console.error("저장 오류:", error);
      setSaveMessage("저장 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  // 새로 만들기 (폼 리셋)
  const handleReset = () => {
    setAdType(null);
    setLandingUrl("");
    setMedia(null);
    setSearchType(null);
    setCampaignOption(null);
    setDisplayAdCampaignName("");
    setCrmCampaignName("");
    setStartDate(() => {
      const now = new Date();
      const seoulTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Seoul' }));
      const year = seoulTime.getFullYear();
      const month = (seoulTime.getMonth() + 1).toString().padStart(2, '0');
      const day = seoulTime.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    });
    setAdGroupNumber(1);
    setUrlError("");
    setCampaignNameError("");
    setCrmCampaignNameError("");
    setCampaignName("");
    setAdGroupName("");
    setCleanLandingUrl("");
    setFinalUtmUrl("");
    setCopiedField(null);
  };

  // 광고유형 변경 시 관련 상태 초기화
  const handleAdTypeChange = (newAdType: AdType) => {
    setAdType(newAdType);
    // 광고유형 변경 시 관련 필드 초기화
    if (newAdType === "sa") {
      // 검색광고(sa) 선택 시
      setMedia(null);
      setSearchType(null);
      setCampaignOption(null);
      setDisplayAdCampaignName("");
    } else if (newAdType === "sp") {
      // 쇼핑검색광고(sp) 선택 시 campaign_option 기본값을 "prd"로 설정
      setMedia(null);
      setSearchType(null);
      setCampaignOption("prd");
      setDisplayAdCampaignName("");
    } else if (newAdType === "da") {
      // 디스플레이광고(da) 선택 시 media 기본값을 "met"로 설정
      setMedia("met");
      setSearchType(null);
      setCampaignOption(null);
      setDisplayAdCampaignName("");
      setCrmCampaignName("");
    } else if (newAdType === "cr") {
      // CRM(cr) 선택 시 media 기본값을 "msg"로 설정
      setMedia("msg");
      setSearchType(null);
      setCampaignOption(null);
      setDisplayAdCampaignName("");
      setCrmCampaignName("");
    } else {
      // 기타
      setMedia(null);
      setSearchType(null);
      setCampaignOption(null);
      setDisplayAdCampaignName("");
      setCrmCampaignName("");
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-12 sm:px-6">
        {/* 헤더 */}
        <header className="mb-8">
          <h2 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-3">
            UTM LINK 만들기
          </h2>
          <div className="h-px w-16 bg-neutral-300" />
          <p className="mt-4 text-sm text-neutral-600">
            랜딩페이지 URL과 옵션을 입력하면 캠페인명, 광고그룹명, UTM 링크를 자동으로 생성합니다.
          </p>
        </header>

        {/* 입력 폼 */}
        <div className="space-y-6 mb-8">
          {/* 광고유형 선택 (최상단) */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              광고유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {AD_TYPES.map((type) => (
                <button
                  key={type.code}
                  type="button"
                  onClick={() => handleAdTypeChange(type.code)}
                  className={`relative px-4 py-3 text-sm font-medium rounded transition-colors text-left ${
                    adType === type.code
                      ? "bg-neutral-900 text-white border-2 border-neutral-900"
                      : type.isAvailable
                      ? "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                      : "bg-neutral-100 text-neutral-400 border-2 border-neutral-200 cursor-not-allowed opacity-60"
                  }`}
                  disabled={!type.isAvailable}
                >
                  {adType === type.code && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  {!type.isAvailable && (
                    <div className="absolute top-1 right-1">
                      <span className="text-xs bg-neutral-300 text-neutral-600 px-1.5 py-0.5 rounded">
                        준비중
                      </span>
                    </div>
                  )}
                  <div className="pr-6">
                    <div className="font-semibold mb-1">{type.label}</div>
                    <div className={`text-xs ${adType === type.code ? "text-neutral-300" : "text-neutral-500"}`}>
                      {type.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 랜딩페이지 URL (CRM은 선택사항) */}
          <div>
            <label htmlFor="landing_url" className="block text-sm font-medium text-neutral-900 mb-2">
              랜딩페이지 URL{" "}
              {adType === "cr" ? (
                <span className="text-neutral-400 text-xs">(선택)</span>
              ) : (
                <span className="text-red-500">*</span>
              )}
            </label>
            <input
              id="landing_url"
              type="url"
              value={landingUrl}
              onChange={(e) => setLandingUrl(e.target.value)}
              placeholder="https://example.com/page?ref=abc#section"
              className={`w-full border px-4 py-3 text-sm outline-none transition-all duration-300 ${
                urlError
                  ? "border-red-500 bg-red-50 focus:border-red-600"
                  : "border-neutral-200 bg-white focus:border-neutral-900 focus:bg-neutral-50"
              }`}
            />
            {urlError && (
              <p className="mt-1 text-xs text-red-600">{urlError}</p>
            )}
          </div>

          {/* 검색광고(sa) 및 쇼핑검색광고(sp) 전용 입력 필드 */}
          {(adType === "sa" || adType === "sp") && (
            <>
              {/* 매체 선택 */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              매체 선택 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setMedia("ggl")}
                className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                  media === "ggl"
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                }`}
              >
                Google
              </button>
              <button
                type="button"
                onClick={() => setMedia("nav")}
                className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                  media === "nav"
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                }`}
              >
                Naver
              </button>
            </div>
          </div>

          {/* 검색 유형 선택 */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              검색 유형 <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSearchType("br")}
                className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                  searchType === "br"
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                }`}
              >
                브랜드 검색 (br)
              </button>
              <button
                type="button"
                onClick={() => setSearchType("nb")}
                className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                  searchType === "nb"
                    ? "bg-neutral-900 text-white"
                    : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                }`}
              >
                논브랜드 검색 (nb)
              </button>
            </div>
          </div>

          {/* 캠페인 옵션 선택 */}
          <div>
            <label className="block text-sm font-medium text-neutral-900 mb-2">
              캠페인 옵션 <span className="text-red-500">*</span>{" "}
              <span className="text-neutral-400 text-xs font-normal">(1개만 선택)</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
              {CAMPAIGN_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setCampaignOption(option.value)}
                  className={`relative px-4 py-3 text-sm font-medium rounded transition-colors text-left ${
                    campaignOption === option.value
                      ? "bg-neutral-900 text-white border-2 border-neutral-900"
                      : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                  }`}
                >
                  {campaignOption === option.value && (
                    <div className="absolute top-2 right-2">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <div className="pr-6">
                    <div className="font-semibold mb-1">{option.label}</div>
                    <div className={`text-xs ${campaignOption === option.value ? "text-neutral-300" : "text-neutral-500"}`}>
                      {option.description}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 시작일 및 광고그룹 번호 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* 시작일 */}
            <div>
              <label htmlFor="start_date" className="block text-sm font-medium text-neutral-900 mb-2">
                캠페인 시작일 <span className="text-neutral-400 text-xs">(선택)</span>
              </label>
              <input
                id="start_date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
            </div>

            {/* 광고그룹 번호 */}
            <div>
              <label htmlFor="ad_group_number" className="block text-sm font-medium text-neutral-900 mb-2">
                광고그룹 번호 <span className="text-neutral-400 text-xs">(선택)</span>
              </label>
              <select
                id="ad_group_number"
                value={adGroupNumber}
                onChange={(e) => setAdGroupNumber(parseInt(e.target.value, 10))}
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              >
                {AD_GROUP_NUMBERS.map((num) => (
                  <option key={num} value={num}>
                    gr{num.toString().padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>
          </div>
            </>
          )}

          {/* 디스플레이광고(da) 전용 입력 필드 */}
          {adType === "da" && (
            <>
              {/* 매체 선택 (순서: met, nav, kko, ggl) */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  매체 선택 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setMedia("met")}
                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                      media === "met"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                    }`}
                  >
                    Meta
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedia("nav")}
                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                      media === "nav"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                    }`}
                  >
                    Naver GFA
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedia("kko")}
                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                      media === "kko"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                    }`}
                  >
                    Kakao Moment
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedia("ggl")}
                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                      media === "ggl"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                    }`}
                  >
                    Google Display
                  </button>
                </div>
              </div>

              {/* 캠페인명 입력 (디스플레이광고 전용) */}
              <div>
                <label htmlFor="display_ad_campaign_name" className="block text-sm font-medium text-neutral-900 mb-2">
                  캠페인명 <span className="text-red-500">*</span>
                  <span className="text-neutral-400 text-xs font-normal ml-2">(예: youtube_video, summer_sale)</span>
                </label>
                <input
                  id="display_ad_campaign_name"
                  type="text"
                  value={displayAdCampaignName}
                  onChange={(e) => setDisplayAdCampaignName(e.target.value)}
                  placeholder="예: youtube_video, youtube_shorts, summer_sale"
                  maxLength={100}
                  className={`w-full border px-4 py-3 text-sm outline-none transition-all duration-300 ${
                    campaignNameError
                      ? "border-red-500 bg-red-50 focus:border-red-600"
                      : "border-neutral-200 bg-white focus:border-neutral-900 focus:bg-neutral-50"
                  }`}
                />
                {campaignNameError && (
                  <p className="mt-1 text-xs text-red-600">{campaignNameError}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  소문자, 숫자, 언더스코어만 허용됩니다. 공백은 언더스코어로 변환됩니다. (최대 30자)
                </p>
              </div>

              {/* 시작일 및 광고그룹 번호 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 시작일 */}
                <div>
                  <label htmlFor="start_date_da" className="block text-sm font-medium text-neutral-900 mb-2">
                    캠페인 시작일 <span className="text-neutral-400 text-xs">(선택)</span>
                  </label>
                  <input
                    id="start_date_da"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
                  />
                </div>

                {/* 광고그룹 번호 */}
                <div>
                  <label htmlFor="ad_group_number_da" className="block text-sm font-medium text-neutral-900 mb-2">
                    광고그룹 번호 <span className="text-neutral-400 text-xs">(선택)</span>
                  </label>
                  <select
                    id="ad_group_number_da"
                    value={adGroupNumber}
                    onChange={(e) => setAdGroupNumber(parseInt(e.target.value, 10))}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
                  >
                    {AD_GROUP_NUMBERS.map((num) => (
                      <option key={num} value={num}>
                        gr{num.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}

          {/* CRM(cr) 전용 입력 필드 */}
          {adType === "cr" && (
            <>
              {/* 매체 선택 (msg, kak, eml) */}
              <div>
                <label className="block text-sm font-medium text-neutral-900 mb-2">
                  발송 채널 선택 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setMedia("msg")}
                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                      media === "msg"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                    }`}
                  >
                    통합 메시지
                    <div className="text-xs mt-1 opacity-75">(SMS, LMS, MMS, RCS)</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedia("kak")}
                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                      media === "kak"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                    }`}
                  >
                    카카오톡 메시지
                  </button>
                  <button
                    type="button"
                    onClick={() => setMedia("eml")}
                    className={`px-4 py-3 text-sm font-medium rounded transition-colors ${
                      media === "eml"
                        ? "bg-neutral-900 text-white"
                        : "bg-white text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900"
                    }`}
                  >
                    이메일
                  </button>
                </div>
              </div>

              {/* 캠페인명 입력 (CRM 전용) */}
              <div>
                <label htmlFor="crm_campaign_name" className="block text-sm font-medium text-neutral-900 mb-2">
                  캠페인명 <span className="text-red-500">*</span>
                  <span className="text-neutral-400 text-xs font-normal ml-2">(예: welcome_message, promotion)</span>
                </label>
                <input
                  id="crm_campaign_name"
                  type="text"
                  value={crmCampaignName}
                  onChange={(e) => setCrmCampaignName(e.target.value)}
                  placeholder="예: welcome_message, promotion, event_notification"
                  maxLength={100}
                  className={`w-full border px-4 py-3 text-sm outline-none transition-all duration-300 ${
                    crmCampaignNameError
                      ? "border-red-500 bg-red-50 focus:border-red-600"
                      : "border-neutral-200 bg-white focus:border-neutral-900 focus:bg-neutral-50"
                  }`}
                />
                {crmCampaignNameError && (
                  <p className="mt-1 text-xs text-red-600">{crmCampaignNameError}</p>
                )}
                <p className="mt-1 text-xs text-neutral-500">
                  소문자, 숫자, 언더스코어만 허용됩니다. 공백은 언더스코어로 변환됩니다. (최대 30자)
                </p>
              </div>

              {/* 시작일 및 광고그룹 번호 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 시작일 */}
                <div>
                  <label htmlFor="start_date_cr" className="block text-sm font-medium text-neutral-900 mb-2">
                    캠페인 시작일 <span className="text-neutral-400 text-xs">(선택)</span>
                  </label>
                  <input
                    id="start_date_cr"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
                  />
                </div>

                {/* 광고그룹 번호 */}
                <div>
                  <label htmlFor="ad_group_number_cr" className="block text-sm font-medium text-neutral-900 mb-2">
                    광고그룹 번호 <span className="text-neutral-400 text-xs">(선택)</span>
                  </label>
                  <select
                    id="ad_group_number_cr"
                    value={adGroupNumber}
                    onChange={(e) => setAdGroupNumber(parseInt(e.target.value, 10))}
                    className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
                  >
                    {AD_GROUP_NUMBERS.map((num) => (
                      <option key={num} value={num}>
                        gr{num.toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 출력 결과 카드 (검색광고, 쇼핑검색광고, 디스플레이광고, CRM 표시) */}
        {(adType === "sa" || adType === "sp" || adType === "da" || adType === "cr") && (campaignName || adGroupName || cleanLandingUrl || finalUtmUrl) && (
          <div className="space-y-4 mb-8">
            {/* 캠페인명 */}
            {campaignName && (
              <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-700">캠페인명</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(campaignName, "campaign")}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                  >
                    {copiedField === "campaign" ? "복사됨!" : "복사"}
                  </button>
                </div>
                <p className="text-base font-mono font-semibold text-neutral-900 break-all">
                  {campaignName}
                </p>
              </div>
            )}

            {/* 광고그룹명 */}
            {adGroupName && (
              <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-700">광고그룹명</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(adGroupName, "adgroup")}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                  >
                    {copiedField === "adgroup" ? "복사됨!" : "복사"}
                  </button>
                </div>
                <p className="text-base font-mono font-semibold text-neutral-900 break-all">
                  {adGroupName}
                </p>
              </div>
            )}

            {/* Clean Landing URL (URL이 있는 경우만 표시) */}
            {cleanLandingUrl && landingUrl.trim() && (
              <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-700">Clean Landing URL</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cleanLandingUrl, "clean")}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                  >
                    {copiedField === "clean" ? "복사됨!" : "복사"}
                  </button>
                </div>
                <p className="text-sm font-mono text-neutral-900 break-all">
                  {cleanLandingUrl}
                </p>
              </div>
            )}

            {/* Final UTM URL (URL이 있는 경우만 표시) */}
            {finalUtmUrl && landingUrl.trim() && (
              <div className="border-2 border-neutral-900 bg-neutral-900 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">Final UTM URL</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(finalUtmUrl, "final")}
                    className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
                  >
                    {copiedField === "final" ? "복사됨!" : "복사"}
                  </button>
                </div>
                <p className="text-sm font-mono text-white break-all">
                  {finalUtmUrl}
                </p>
              </div>
            )}
          </div>
        )}

        {/* 저장 버튼 및 새로 만들기 버튼 */}
        {(campaignName || adGroupName || cleanLandingUrl || finalUtmUrl) && (
          <div className="flex justify-between items-center gap-4">
            <div className="flex-1">
              {saveMessage && (
                <p className={`text-sm ${saveMessage.includes("저장되었습니다") ? "text-green-600" : "text-red-600"}`}>
                  {saveMessage}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="px-6 py-3 text-sm font-medium bg-neutral-900 text-white hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed transition-all"
              >
                {isSaving ? "저장 중..." : "저장"}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 text-sm font-medium text-neutral-700 border-2 border-neutral-200 hover:border-neutral-900 hover:bg-neutral-50 transition-all"
              >
                새로 만들기
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
