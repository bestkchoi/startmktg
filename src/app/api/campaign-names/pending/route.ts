import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";

interface PendingCampaignName {
  korean: string;
  english?: string;
  normalized?: string;
  timestamp: string;
}

/**
 * POST /api/campaign-names/pending
 * 사전 정의되지 않은 캠페인명을 대기 목록에 추가
 * 
 * 주의: Vercel 서버리스 환경에서는 파일 시스템에 쓰기가 불가능하므로
 * Supabase 데이터베이스를 사용합니다.
 */
export async function POST(request: NextRequest) {
  try {
    const { korean, english, normalized } = await request.json();

    if (!korean || typeof korean !== "string") {
      return NextResponse.json(
        { ok: false, message: "한글 캠페인명이 필요합니다." },
        { status: 400 }
      );
    }

    const supabase = await createSupabaseServerClient();

    // 중복 체크 (같은 한글명이 이미 있는지)
    const { data: existing, error: checkError } = await supabase
      .from("pending_campaign_names" as any)
      .select("korean")
      .eq("korean", korean)
      .maybeSingle();

    // 테이블이 없거나 에러가 발생한 경우 (테이블 미생성 시)
    if (checkError) {
      // 테이블이 없는 경우 (42P01: relation does not exist)
      if (checkError.code === "42P01" || checkError.message.includes("does not exist")) {
        console.warn("pending_campaign_names 테이블이 아직 생성되지 않았습니다. Supabase에서 테이블을 생성해주세요.");
        // 테이블이 없어도 에러를 반환하지 않고 성공으로 처리 (기능은 비활성화)
        return NextResponse.json({
          ok: true,
          message: "대기 목록 기능이 아직 활성화되지 않았습니다. Supabase에서 테이블을 생성해주세요.",
          data: null,
        });
      }
      console.error("Error checking existing campaign name:", checkError);
    }

    if (existing) {
      return NextResponse.json(
        { ok: true, message: "이미 대기 목록에 있습니다." },
        { status: 200 }
      );
    }

    // 새 항목 추가 (한국 시간으로 저장)
    const now = new Date();
    // 한국 시간대 (UTC+9)로 변환
    const koreaTime = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Seoul" }));
    // YYYY-MM-DD HH:mm:ss 형식으로 포맷팅
    const year = koreaTime.getFullYear();
    const month = String(koreaTime.getMonth() + 1).padStart(2, "0");
    const day = String(koreaTime.getDate()).padStart(2, "0");
    const hours = String(koreaTime.getHours()).padStart(2, "0");
    const minutes = String(koreaTime.getMinutes()).padStart(2, "0");
    const seconds = String(koreaTime.getSeconds()).padStart(2, "0");
    const koreaTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds} KST`;
    
    const newItem: PendingCampaignName = {
      korean,
      english: english || undefined,
      normalized: normalized || undefined,
      timestamp: koreaTimeString,
    };

    // Supabase에 저장
    const { data, error } = await supabase
      .from("pending_campaign_names" as any)
      .insert({
        korean: newItem.korean,
        english: newItem.english || null,
        normalized: newItem.normalized || null,
        timestamp: newItem.timestamp,
      } as any)
      .select()
      .single();

    if (error) {
      // 테이블이 없는 경우 (42P01: relation does not exist)
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("pending_campaign_names 테이블이 아직 생성되지 않았습니다. Supabase에서 테이블을 생성해주세요.");
        // 테이블이 없어도 에러를 반환하지 않고 성공으로 처리 (기능은 비활성화)
        return NextResponse.json({
          ok: true,
          message: "대기 목록 기능이 아직 활성화되지 않았습니다. Supabase에서 테이블을 생성해주세요.",
          data: newItem,
        });
      }
      console.error("Error saving pending campaign name:", error);
      return NextResponse.json(
        { ok: false, message: "대기 목록 추가에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: "대기 목록에 추가되었습니다.",
      data: newItem,
    });
  } catch (error) {
    console.error("Error saving pending campaign name:", error);
    return NextResponse.json(
      { ok: false, message: "대기 목록 추가에 실패했습니다." },
      { status: 500 }
    );
  }
}

/**
 * GET /api/campaign-names/pending
 * 대기 목록 조회
 * 
 * 주의: Vercel 서버리스 환경에서는 파일 시스템 읽기가 제한적이므로
 * Supabase 데이터베이스에서 조회합니다.
 */
export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const { data, error } = await supabase
      .from("pending_campaign_names" as any)
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      // 테이블이 없는 경우 (42P01: relation does not exist)
      if (error.code === "42P01" || error.message.includes("does not exist")) {
        console.warn("pending_campaign_names 테이블이 아직 생성되지 않았습니다. Supabase에서 테이블을 생성해주세요.");
        // 테이블이 없으면 빈 배열 반환
        return NextResponse.json({
          ok: true,
          data: [],
        });
      }
      console.error("Error reading pending campaign names:", error);
      return NextResponse.json(
        { ok: false, message: "대기 목록 조회에 실패했습니다." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      data: data || [],
    });
  } catch (error) {
    console.error("Error reading pending campaign names:", error);
    return NextResponse.json(
      { ok: false, message: "대기 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

