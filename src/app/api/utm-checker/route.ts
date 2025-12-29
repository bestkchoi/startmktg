import type { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import { parseUrl } from "@/lib/utm-checker/parseUrl";
import { diagnose } from "@/lib/utm-checker/diagnose";
import { generateGA4Preview } from "@/lib/utm-checker/ga4Preview";

type ApiResponse =
  | {
      ok: true;
      parsed: Record<string, string>;
      diagnosis: Record<string, string>;
    }
  | {
      ok: false;
      message: string;
    };

/**
 * POST /api/utm-checker
 * URL을 파싱하고 진단 결과를 반환하며 Supabase에 저장합니다.
 */
export async function POST(req: NextRequest): Promise<Response> {
  try {
    // 요청 본문 파싱
    let body: { url?: string };
    try {
      body = await req.json();
    } catch {
      return Response.json(
        {
          ok: false,
          message: "유효한 JSON 요청 본문이 필요합니다",
        } as ApiResponse,
        { status: 400 }
      );
    }

    const inputUrl = typeof body.url === "string" ? body.url.trim() : "";

    // 입력값 검증
    if (!inputUrl || inputUrl.length === 0) {
      return Response.json(
        {
          ok: false,
          message: "URL을 입력해주세요",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // URL 파싱
    const parseResult = parseUrl(inputUrl);

    if (!parseResult.success) {
      return Response.json(
        {
          ok: false,
          message: parseResult.error || "유효한 URL이 아닙니다",
        } as ApiResponse,
        { status: 400 }
      );
    }

    // 진단 실행
    const diagnosis = diagnose(parseResult.parsed);

    // GA4 미리보기 생성 (클라이언트에서 사용)
    const ga4Preview = generateGA4Preview(parseResult.parsed);

    // 도메인명 추출
    let domainName: string | null = null;
    try {
      const url = new URL(parseResult.inputUrl);
      domainName = url.hostname;
    } catch (error) {
      // URL 파싱 실패 시 도메인명은 null로 유지
      console.warn("도메인명 추출 실패:", error);
    }

    // Supabase에 저장
    try {
      const supabase = await createSupabaseServerClient();

      // 현재 사용자 ID 가져오기 (로그인한 경우)
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error: insertError } = await supabase
        .from("utm_checker_logs")
        // @ts-ignore - Supabase 타입 정의가 실제 스키마와 다름
        .insert({
          user_id: user?.id || null,
          input_url: parseResult.inputUrl,
          domain_name: domainName,
          parsed_params: parseResult.parsed,
          diagnosis: {
            result: diagnosis.result,
            details: diagnosis.details,
          },
        });

      if (insertError) {
        console.error("Supabase 저장 오류:", insertError);
        // 저장 오류는 로그만 남기고 응답은 성공으로 처리
      }
    } catch (dbError) {
      console.error("DB 저장 중 오류:", dbError);
      // 저장 오류는 로그만 남기고 응답은 성공으로 처리
    }

    // 응답 반환
    // parsed는 빈 값 제외하고 반환
    const parsedForResponse: Record<string, string> = {};
    Object.entries(parseResult.parsed).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        parsedForResponse[key] = value;
      }
    });

    return Response.json({
      ok: true,
      parsed: parsedForResponse,
      diagnosis: diagnosis.result,
    } as ApiResponse);
  } catch (error) {
    console.error("API 오류:", error);
    return Response.json(
      {
        ok: false,
        message: "잠시 후 다시 시도해주세요",
      } as ApiResponse,
      { status: 500 }
    );
  }
}
