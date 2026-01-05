"use client";

import { useState, useEffect } from "react";
import { useLocale } from "@/hooks/use-locale";

type UtmLinkItem = {
  created_at: string;
  adtype: string;
  media: string;
  utm_source: string;
  utm_medium: string;
  landing_domain: string | null;
  landing_path: string | null;
};

export default function UtmLinkListPage() {
  const locale = useLocale();
  const [links, setLinks] = useState<UtmLinkItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

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

  // 목록 조회
  useEffect(() => {
    const fetchLinks = async () => {
      setLoading(true);
      setError("");

      try {
        console.log("[UTM LINK 목록] API 호출 시작");
        const response = await fetch("/api/utm-links?limit=100");
        console.log("[UTM LINK 목록] API 응답 상태:", response.status);

        const result = await response.json();
        console.log("[UTM LINK 목록] API 응답 데이터:", {
          ok: result.ok,
          dataLength: result.data?.length || 0,
          message: result.message,
        });

        if (result.ok) {
          const data = result.data || [];
          console.log("[UTM LINK 목록] 조회 성공, 데이터 개수:", data.length);
          if (data.length > 0) {
            console.log("[UTM LINK 목록] 첫 번째 항목:", data[0]);
          }
          setLinks(data);
        } else {
          console.error("[UTM LINK 목록] API 오류:", result);
          setError(result.message || "목록을 불러오는 중 오류가 발생했습니다.");
        }
      } catch (err: any) {
        console.error("[UTM LINK 목록] 예외 발생:", err);
        setError("목록을 불러오는 중 오류가 발생했습니다.");
      } finally {
        setLoading(false);
      }
    };

    fetchLinks();
  }, []);

  return (
    <div className="min-h-screen bg-white text-neutral-900">
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-12 sm:px-6">
        {/* 헤더 */}
        <header className="mb-8">
          <h2 className="text-4xl sm:text-5xl font-light tracking-[-0.02em] mb-3">
            UTM LINK 목록
          </h2>
          <p className="text-neutral-600 text-sm">
            생성된 UTM 링크 목록을 확인할 수 있습니다.
          </p>
        </header>

        {/* 목록 테이블 */}
        {loading ? (
          <div className="border-2 border-neutral-200 bg-neutral-50 p-12 rounded-lg text-center">
            <p className="text-neutral-600">로딩 중...</p>
          </div>
        ) : error ? (
          <div className="border-2 border-red-200 bg-red-50 p-6 rounded-lg">
            <p className="text-red-600 font-medium mb-2">오류가 발생했습니다</p>
            <p className="text-red-600 text-sm">{error}</p>
            <p className="text-red-500 text-xs mt-2">
              콘솔을 확인하여 자세한 오류 정보를 확인하세요.
            </p>
          </div>
        ) : links.length === 0 ? (
          <div className="border-2 border-neutral-200 bg-neutral-50 p-12 rounded-lg text-center">
            <p className="text-neutral-600 mb-2">생성된 UTM 링크가 없습니다.</p>
            <p className="text-neutral-500 text-sm">
              "UTM LINK 만들기"에서 링크를 생성하면 여기에 표시됩니다.
            </p>
          </div>
        ) : (
          <div className="border-2 border-neutral-200 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-100 border-b-2 border-neutral-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                      생성일시
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                      광고유형
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                      매체
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                      utm_source
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                      utm_medium
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                      도메인
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-neutral-900">
                      경로
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {links.map((link, index) => (
                    <tr key={index} className="hover:bg-neutral-50 transition-colors">
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {formatDate(link.created_at)}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        <span className="inline-block px-2 py-1 bg-neutral-200 text-neutral-800 rounded text-xs font-medium">
                          {adTypeLabels[link.adtype] || link.adtype}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {mediaLabels[link.media] || link.media}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700 font-mono">
                        {link.utm_source}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700 font-mono">
                        {link.utm_medium}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700">
                        {link.landing_domain || "-"}
                      </td>
                      <td className="px-4 py-3 text-sm text-neutral-700 font-mono">
                        {link.landing_path || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}




