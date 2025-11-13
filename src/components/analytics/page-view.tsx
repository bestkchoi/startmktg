"use client";

import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { trackPageView } from "@/lib/analytics";

/**
 * 페이지뷰 자동 추적 컴포넌트 (내부)
 * Next.js App Router의 경로 변경을 감지하여 자동으로 GA4에 페이지뷰를 전송합니다.
 */
function PageViewTrackerInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // 경로와 쿼리 파라미터를 포함한 전체 경로 생성
    const fullPath = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;
    
    // 페이지뷰 추적
    trackPageView(fullPath);
  }, [pathname, searchParams]);

  return null;
}

/**
 * 페이지뷰 자동 추적 컴포넌트
 * Suspense boundary로 감싸서 useSearchParams() 사용 시 발생하는 빌드 에러를 방지합니다.
 */
export function PageViewTracker() {
  return (
    <Suspense fallback={null}>
      <PageViewTrackerInner />
    </Suspense>
  );
}

