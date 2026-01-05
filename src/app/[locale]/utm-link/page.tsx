"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "@/hooks/use-locale";
import { buildCleanLandingUrl, buildFinalUtmUrl, isValidUrl } from "@/lib/utm/url-utils";
import { generateNamingByAdType, generateUtmParamsByAdType } from "@/lib/utm/ad-type-handlers";
import { buildNaverUtmParams, buildNaverFinalUtmUrl } from "@/lib/utm/naver-utm-builder";
import type { AdType, AdTypeInfo, SearchAdInput, DisplayAdInput, CrmInput, UtmParams } from "@/types/utm";
import type { SearchAdCampaignOption } from "@/types/campaign";

export default function UtmLinkCreatePage() {
  const locale = useLocale();
  const router = useRouter();

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
  const [adGroupCustomName, setAdGroupCustomName] = useState<string>("");
  const [utmTerm, setUtmTerm] = useState<string>("{query}"); // 네이버용 utm_term
  
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

  // 공유 링크 생성 상태
  const [shareUrl, setShareUrl] = useState<string>("");
  const [shareMessage, setShareMessage] = useState<string>("");

  // 최근 생성한 UTM LINK 목록 상태
  type UtmLinkItem = {
    created_at: string;
    adtype: string;
    media: string;
    utm_source: string;
    utm_medium: string;
    landing_domain: string | null;
    landing_path: string | null;
    share_code: string | null;
  };
  const [recentLinks, setRecentLinks] = useState<UtmLinkItem[]>([]);
  const [loadingRecentLinks, setLoadingRecentLinks] = useState<boolean>(false);


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

  // 광고그룹명 custom_name 입력 가능 글자 수 계산 (검색광고/쇼핑검색광고만)
  const adGroupCustomNameRemainingLength = useMemo(() => {
    if (adType !== "sa" && adType !== "sp") return null;
    if (!campaignName) return null;
    
    const paddedNumber = adGroupNumber.toString().padStart(2, '0');
    const base = `${campaignName}_gr${paddedNumber}`;
    const remaining = 30 - base.length - 1; // underscore 1자 포함
    
    return Math.max(0, remaining);
  }, [adType, campaignName, adGroupNumber]);

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

  // 최근 생성한 UTM LINK 목록 조회
  const fetchRecentLinks = async () => {
    setLoadingRecentLinks(true);
    try {
      const response = await fetch("/api/utm-links?limit=10");
      const result = await response.json();
      if (result.ok) {
        setRecentLinks(result.data || []);
      }
    } catch (error) {
      console.error("최근 목록 조회 오류:", error);
    } finally {
      setLoadingRecentLinks(false);
    }
  };

  // 컴포넌트 마운트 시 최근 목록 로드
  useEffect(() => {
    fetchRecentLinks();
  }, []);

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
          custom_name: adGroupCustomName.trim() || undefined,
        };

        const naming = generateNamingByAdType(adType, input);
        setCampaignName(naming.campaignName);
        setAdGroupName(naming.adGroupName);

        // Google 선택 시 UTM 생성 비활성화
        if (media === "ggl") {
          // Google은 자동 태그(gclid)를 사용하므로 UTM 생성하지 않음
          // finalUrl = cleanLandingUrl (UTM 파라미터 없음)
          setFinalUtmUrl(cleanUrl);
          setCampaignNameError("");
        } else if (media === "nav") {
          // 네이버 검색광고: 네이버 전용 UTM 파라미터 생성
          const naverUtmParams = buildNaverUtmParams(
            naming.campaignName,
            naming.adGroupName,
            utmTerm || "{query}"
          );
          
          // 네이버용 Final UTM URL 생성
          const finalUrl = buildNaverFinalUtmUrl(cleanUrl, naverUtmParams);
          setFinalUtmUrl(finalUrl);
          setCampaignNameError("");
        } else {
          // 기타 매체: 기존 UTM 파라미터 생성
          const utmParams = generateUtmParamsByAdType(adType, input);

          // Final UTM URL 생성
          const finalUrl = buildFinalUtmUrl(trimmedUrl, utmParams);
          setFinalUtmUrl(finalUrl);
          setCampaignNameError("");
        }
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

          // Google 선택 시 UTM 생성 비활성화
          if (media === "ggl") {
            // Google은 자동 태그(gclid)를 사용하므로 UTM 생성하지 않음
            // finalUrl = cleanLandingUrl (UTM 파라미터 없음)
            setFinalUtmUrl(cleanUrl);
            setCampaignNameError("");
          } else {
            // Google이 아닌 경우에만 UTM 파라미터 생성
            const utmParams = generateUtmParamsByAdType(adType, input);

            // Final UTM URL 생성
            const finalUrl = buildFinalUtmUrl(trimmedUrl, utmParams);
            setFinalUtmUrl(finalUrl);
            setCampaignNameError("");
          }
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
  }, [adType, landingUrl, media, searchType, campaignOption, displayAdCampaignName, crmCampaignName, startDate, adGroupNumber, adGroupCustomName, utmTerm]);

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
          custom_name: adGroupCustomName.trim() || undefined,
        };
        // Google은 UTM 파라미터 생성하지 않음
        if (media === "ggl") {
          // Google은 UTM 파라미터 없음
          utmParams = null;
        } else if (media === "nav") {
          // Naver는 네이버 전용 UTM 파라미터 생성 (저장용으로는 utm_source, utm_medium만 필요)
          const naverUtmParams = buildNaverUtmParams(
            campaignName,
            adGroupName,
            utmTerm || "{query}"
          );
          // 저장 API는 utm_source, utm_medium만 받으므로 기존 형식으로 변환
          utmParams = {
            utm_source: naverUtmParams.utm_source,
            utm_medium: naverUtmParams.utm_medium,
            utm_id: naverUtmParams.utm_campaign,
            utm_campaign: naverUtmParams.utm_campaign,
          };
        } else {
          utmParams = generateUtmParamsByAdType(adType, input);
        }
        mediaValue = media as string;
      } else if (adType === "da") {
        const input: DisplayAdInput = {
          media: media as "ggl" | "nav" | "kko" | "met",
          campaignName: displayAdCampaignName.trim(),
          startDate,
          adGroupNumber,
        };
        // Google은 UTM 파라미터 생성하지 않음
        if (media !== "ggl") {
          utmParams = generateUtmParamsByAdType(adType, input);
        }
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

      // Google이 아닌 경우에만 UTM 파라미터 필수
      if ((adType === "sa" || adType === "sp" || adType === "da") && media === "ggl") {
        // Google은 UTM 파라미터 없이 저장 (캠페인명/광고그룹명만)
        const payload = {
          adtype: adType,
          media: mediaValue,
          utm_source: null,
          utm_medium: null,
          landing_url: landingUrl.trim() || undefined,
        };

        console.log("[UTM LINK 만들기] 저장 요청 시작 (Google, UTM 없음):", payload);

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
            console.log("[UTM LINK 만들기] 저장 성공, 저장된 데이터 ID:", result.data?.id);
            
            // Google도 공유 링크 생성 (UTM 없이도 가능)
            if (cleanLandingUrl) {
              try {
                const sharePayload = {
                  adtype: adType,
                  media: mediaValue,
                  utm_source: null,
                  utm_medium: null,
                  clean_landing_url: cleanLandingUrl || "",
                  final_utm_url: cleanLandingUrl || "", // Google일 경우 finalUrl = cleanLandingUrl
                  campaign_id: campaignName,
                  adgroup_name: adGroupName,
                };

                console.log("[UTM LINK 공유] 저장 후 자동 공유 링크 생성 요청 (Google):", sharePayload);

                const shareResponse = await fetch("/api/utm-link-shares", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(sharePayload),
                });

                const shareResult = await shareResponse.json();

                if (shareResponse.ok && shareResult.ok && (shareResult.share_code || shareResult.data?.share_code)) {
                  const shareCode = shareResult.share_code || shareResult.data?.share_code;
                  const shareUrlPath = shareResult.data?.share_url || `/u/${shareCode}`;
                  const fullShareUrl = `${window.location.origin}${shareUrlPath}`;
                  
                  setShareUrl(fullShareUrl);
                  setShareMessage("");
                  console.log("[UTM LINK 공유] 자동 생성 성공 (Google):", fullShareUrl);
                } else {
                  // 공유 링크 생성 실패해도 저장은 성공으로 처리
                  setShareUrl("");
                  setShareMessage("");
                  console.error("[UTM LINK 공유] 자동 생성 실패 (Google):", shareResult);
                }
              } catch (shareError: any) {
                // 공유 링크 생성 오류해도 저장은 성공으로 처리
                setShareUrl("");
                setShareMessage("");
                console.error("[UTM LINK 공유] 자동 생성 예외 (Google):", shareError);
              }
            }
            
            await fetchRecentLinks();
          } else {
            console.error("[UTM LINK 만들기] 저장 실패");
            const errorMsg = result.error 
              ? `로그 저장 실패: ${result.error}`
              : "로그 저장에 실패했습니다.";
            setSaveMessage(errorMsg);
            setTimeout(() => setSaveMessage(""), 5000);
          }
        } else {
          console.error("[UTM LINK 만들기] API 오류:", result);
          const errorMsg = result.error 
            ? `${result.message} (오류: ${result.error})`
            : result.message || "저장 중 오류가 발생했습니다.";
          setSaveMessage(errorMsg);
          setTimeout(() => setSaveMessage(""), 5000);
        }
        setIsSaving(false);
        return;
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
          // 저장 성공 시 조용히 처리 (콘솔 로그만)
          console.log("[UTM LINK 만들기] 저장 성공, 저장된 데이터 ID:", result.data?.id);
          
          // 저장 성공 후 자동으로 공유 링크 생성
          try {
            const sharePayload = {
              adtype: adType,
              media: mediaValue,
              utm_source: utmParams.utm_source,
              utm_medium: utmParams.utm_medium,
              clean_landing_url: cleanLandingUrl || "",
              final_utm_url: finalUtmUrl || "",
              campaign_id: campaignName,
              adgroup_name: adGroupName,
            };

            console.log("[UTM LINK 공유] 저장 후 자동 공유 링크 생성 요청:", sharePayload);

            const shareResponse = await fetch("/api/utm-link-shares", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(sharePayload),
            });

            const shareResult = await shareResponse.json();

            if (shareResponse.ok && shareResult.ok && (shareResult.share_code || shareResult.data?.share_code)) {
              const shareCode = shareResult.share_code || shareResult.data?.share_code;
              const shareUrlPath = shareResult.data?.share_url || `/u/${shareCode}`;
              const fullShareUrl = `${window.location.origin}${shareUrlPath}`;
              
              setShareUrl(fullShareUrl);
              setShareMessage("");
              console.log("[UTM LINK 공유] 자동 생성 성공:", fullShareUrl);
              
              // 최근 목록 갱신
              await fetchRecentLinks();
            } else {
              // 공유 링크 생성 실패 시 저장 실패 처리
              setShareUrl("");
              setShareMessage("공유 링크 생성에 실패했습니다. 저장이 취소되었습니다.");
              setSaveMessage("저장에 실패했습니다: 공유 링크 생성 오류");
              console.error("[UTM LINK 공유] 자동 생성 실패:", shareResult);
              return; // 저장 실패 처리
            }
          } catch (shareError: any) {
            // 공유 링크 생성 오류 시 저장 실패 처리
            setShareUrl("");
            setShareMessage("공유 링크 생성에 실패했습니다. 저장이 취소되었습니다.");
            setSaveMessage("저장에 실패했습니다: 공유 링크 생성 오류");
            console.error("[UTM LINK 공유] 자동 생성 예외:", shareError);
            return; // 저장 실패 처리
          }
        } else {
          // 저장 실패 시에만 에러 메시지 표시
          console.error("[UTM LINK 만들기] 저장 실패 (UTM 링크는 생성됨)");
          console.error("[UTM LINK 만들기] error.code:", result.errorCode);
          console.error("[UTM LINK 만들기] error.message:", result.error);
          console.error("[UTM LINK 만들기] error.details:", result.errorDetails);
          console.error("[UTM LINK 만들기] 전체 응답:", result);
          
          const errorMsg = result.error 
            ? `로그 저장 실패: ${result.error}`
            : "로그 저장에 실패했습니다.";
          setSaveMessage(errorMsg);
          // 에러 메시지는 5초 동안 표시
          setTimeout(() => setSaveMessage(""), 5000);
        }
      } else {
        // API 오류 시에만 에러 메시지 표시
        console.error("[UTM LINK 만들기] API 오류:", result);
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

  // 공유 링크 생성 함수

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
    setAdGroupCustomName("");
    setUtmTerm("{query}");
    setUrlError("");
    setCampaignNameError("");
    setCrmCampaignNameError("");
    setCampaignName("");
    setAdGroupName("");
    setCleanLandingUrl("");
    setFinalUtmUrl("");
    setShareUrl("");
    setShareMessage("");
    setCopiedField(null);
  };

  // 매체 변경 시 utm_term 초기화
  useEffect(() => {
    if (media === "nav") {
      setUtmTerm("{query}");
    }
  }, [media]);

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
      setAdGroupCustomName("");
      setUtmTerm("{query}");
    } else if (newAdType === "sp") {
      // 쇼핑검색광고(sp) 선택 시 campaign_option 기본값을 "prd"로 설정
      setMedia(null);
      setSearchType(null);
      setCampaignOption("prd");
      setDisplayAdCampaignName("");
      setAdGroupCustomName("");
      setUtmTerm("{query}");
    } else if (newAdType === "da") {
      // 디스플레이광고(da) 선택 시 media 기본값을 "met"로 설정
      setMedia("met");
      setSearchType(null);
      setCampaignOption(null);
      setDisplayAdCampaignName("");
      setCrmCampaignName("");
      setUtmTerm("{query}");
    } else if (newAdType === "cr") {
      // CRM(cr) 선택 시 media 기본값을 "msg"로 설정
      setMedia("msg");
      setSearchType(null);
      setCampaignOption(null);
      setDisplayAdCampaignName("");
      setCrmCampaignName("");
      setUtmTerm("{query}");
    } else {
      // 기타
      setMedia(null);
      setSearchType(null);
      setCampaignOption(null);
      setDisplayAdCampaignName("");
      setCrmCampaignName("");
      setUtmTerm("{query}");
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
            {/* Google 선택 시 안내 문구 */}
            {media === "ggl" && (
              <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900 leading-relaxed">
                  Google Ads는 자동 태그(gclid)를 사용합니다.<br />
                  START MKTG는 캠페인명과 광고그룹명을 정리하여<br />
                  GA4에서 성과를 쉽게 분석할 수 있도록 돕습니다.
                </p>
              </div>
            )}
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

          {/* 광고그룹 custom_name 입력 */}
          <div>
            <label htmlFor="ad_group_custom_name" className="block text-sm font-medium text-neutral-900 mb-2">
              광고그룹명 추가 입력 <span className="text-neutral-400 text-xs">(선택)</span>
              {adGroupCustomNameRemainingLength !== null && (
                <span className="ml-2 text-xs text-neutral-500">
                  남은 글자 수: {adGroupCustomNameRemainingLength}
                </span>
              )}
            </label>
            <input
              id="ad_group_custom_name"
              type="text"
              value={adGroupCustomName}
              onChange={(e) => {
                const newValue = e.target.value;
                if (adGroupCustomNameRemainingLength !== null && adGroupCustomNameRemainingLength > 0) {
                  // 남은 글자 수만큼만 입력 허용
                  if (newValue.length <= adGroupCustomNameRemainingLength) {
                    setAdGroupCustomName(newValue);
                  }
                } else if (adGroupCustomNameRemainingLength === null) {
                  // campaignName이 아직 계산되지 않은 경우 입력 허용 (나중에 제한될 수 있음)
                  setAdGroupCustomName(newValue);
                }
              }}
              disabled={adGroupCustomNameRemainingLength !== null && adGroupCustomNameRemainingLength <= 0}
              placeholder="예: summer, sale, event"
              className={`w-full border px-4 py-3 text-sm outline-none transition-all duration-300 ${
                adGroupCustomNameRemainingLength !== null && adGroupCustomNameRemainingLength <= 0
                  ? "border-neutral-200 bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  : "border-neutral-200 bg-white focus:border-neutral-900 focus:bg-neutral-50"
              }`}
            />
            {adGroupCustomNameRemainingLength !== null && adGroupCustomNameRemainingLength <= 0 && (
              <p className="mt-1 text-xs text-neutral-500">
                네이버 검색광고 기준 최대 30자 제한으로<br />
                추가 입력이 불가능합니다.
              </p>
            )}
          </div>

          {/* Naver 선택 시 utm_term 입력 */}
          {media === "nav" && (
            <div>
              <label htmlFor="utm_term" className="block text-sm font-medium text-neutral-900 mb-2">
                utm_term <span className="text-neutral-400 text-xs">(선택)</span>
              </label>
              <input
                id="utm_term"
                type="text"
                value={utmTerm}
                onChange={(e) => setUtmTerm(e.target.value)}
                placeholder="{query}"
                className="w-full border border-neutral-200 bg-white px-4 py-3 text-sm outline-none transition-all duration-300 focus:border-neutral-900 focus:bg-neutral-50"
              />
              <p className="mt-1 text-xs text-neutral-500">
                utm_term은 네이버의 검색어 치환 변수 {`{query}`}를 사용합니다.
              </p>
            </div>
          )}
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
                {/* Google 선택 시 안내 문구 */}
                {media === "ggl" && (
                  <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-900 leading-relaxed">
                      Google Ads는 자동 태그(gclid)를 사용합니다.<br />
                      START MKTG는 캠페인명과 광고그룹명을 정리하여<br />
                      GA4에서 성과를 쉽게 분석할 수 있도록 돕습니다.
                    </p>
                  </div>
                )}
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
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium text-neutral-700">캠페인명</label>
                    <span className="px-2 py-0.5 text-xs font-medium text-neutral-600 bg-neutral-200 rounded">
                      ({campaignName.length}자)
                    </span>
                  </div>
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
            {adGroupName && (() => {
              const adGroupNameLength = adGroupName.length;
              const isWarning = adGroupNameLength >= 27 && adGroupNameLength <= 30;
              const isError = adGroupNameLength > 30;
              
              return (
                <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-sm font-medium text-neutral-700">광고그룹명</label>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded ${
                        isError
                          ? "text-red-700 bg-red-100"
                          : isWarning
                          ? "text-yellow-700 bg-yellow-100"
                          : "text-neutral-600 bg-neutral-200"
                      }`}>
                        ({adGroupNameLength}/30)
                      </span>
                    </div>
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
                  {isError && (
                    <p className="mt-2 text-xs text-red-600">
                      광고그룹명은 최대 30자 이내여야 합니다.
                    </p>
                  )}
                </div>
              );
            })()}

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

            {/* Final URL (URL이 있는 경우만 표시) */}
            {finalUtmUrl && landingUrl.trim() && (
              <div className="border-2 border-neutral-900 bg-neutral-900 text-white p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">
                    {((adType === "sa" || adType === "sp" || adType === "da") && media === "ggl") 
                      ? "Final URL" 
                      : "Final UTM URL"}
                  </label>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => window.open(finalUtmUrl, "_blank")}
                      className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                      열기
                    </button>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(finalUtmUrl, "final")}
                      className="px-3 py-1.5 text-xs font-medium bg-white text-neutral-900 hover:bg-neutral-100 transition-colors"
                    >
                      {copiedField === "final" ? "복사됨!" : "복사"}
                    </button>
                  </div>
                </div>
                <p className="text-sm font-mono text-white break-all">
                  {finalUtmUrl}
                </p>
              </div>
            )}

            {/* 공유 링크 결과 (저장 후에만 표시) */}
            {shareUrl && (
              <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-700">공유 링크</label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(shareUrl, "share")}
                    className="px-3 py-1.5 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                  >
                    {copiedField === "share" ? "복사됨!" : "복사"}
                  </button>
                </div>
                <p className="text-sm font-mono text-neutral-900 break-all">
                  {shareUrl}
                </p>
              </div>
            )}
            {shareMessage && !shareUrl && (
              <div className="border-2 border-neutral-200 bg-neutral-50 p-6 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-neutral-700">공유 링크</label>
                </div>
                <p className="text-sm text-red-600">{shareMessage}</p>
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

        {/* 최근 생성한 UTM LINK 목록 */}
        <div className="mt-12 border-2 border-neutral-200 bg-white rounded-lg p-6">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              최근 생성한 UTM LINK
            </h3>
            <p className="text-sm text-neutral-600">
              서비스 개선을 위해 익명으로 저장된 최근 10개 기록입니다.
            </p>
          </div>

          {loadingRecentLinks ? (
            <div className="text-center py-8">
              <p className="text-neutral-600 text-sm">로딩 중...</p>
            </div>
          ) : recentLinks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-neutral-600 text-sm">생성된 UTM 링크가 없습니다.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100 border-b-2 border-neutral-200">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      생성일시
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      광고유형
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      매체
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      utm_source
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      utm_medium
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      도메인
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      경로
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-neutral-900">
                      공유
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {recentLinks.map((link, index) => {
                    const shareCode = link.share_code;
                    const shareUrl = shareCode ? `${window.location.origin}/u/${shareCode}` : "";
                    const rowKey = `share-${index}`;

                    return (
                      <tr key={index} className="hover:bg-neutral-50 transition-colors">
                        <td className="px-4 py-2 text-xs text-neutral-700">
                          {formatDate(link.created_at)}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-700">
                          <span className="inline-block px-2 py-0.5 bg-neutral-200 text-neutral-800 rounded text-xs font-medium">
                            {adTypeLabels[link.adtype] || link.adtype}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-700">
                          {mediaLabels[link.media] || link.media}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-700 font-mono">
                          {link.utm_source || "-"}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-700 font-mono">
                          {link.utm_medium || "-"}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-700">
                          {link.landing_domain || "-"}
                        </td>
                        <td className="px-4 py-2 text-xs text-neutral-700 font-mono">
                          {link.landing_path || "-"}
                        </td>
                        <td className="px-4 py-2 text-xs">
                          {shareCode ? (
                            <div className="flex items-center gap-2">
                              <p className="text-xs font-mono text-neutral-900">
                                /u/{shareCode}
                              </p>
                              <button
                                type="button"
                                onClick={() => router.push(`/u/${shareCode}`)}
                                className="px-2 py-1 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                              >
                                열기
                              </button>
                              <button
                                type="button"
                                onClick={() => copyToClipboard(shareUrl, rowKey)}
                                className="px-2 py-1 text-xs font-medium text-neutral-700 border border-neutral-300 hover:bg-white transition-colors"
                              >
                                {copiedField === rowKey ? "복사됨!" : "복사"}
                              </button>
                            </div>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

