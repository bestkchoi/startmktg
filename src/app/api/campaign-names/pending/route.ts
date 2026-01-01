import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

interface PendingCampaignName {
  korean: string;
  english?: string;
  normalized?: string;
  timestamp: string;
}

interface PendingCampaignNamesData {
  pending: PendingCampaignName[];
}

/**
 * POST /api/campaign-names/pending
 * 사전 정의되지 않은 캠페인명을 대기 목록에 추가
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

    const filePath = join(process.cwd(), "src", "lib", "campaign", "pending-campaign-names.json");

    // 기존 파일 읽기
    let data: PendingCampaignNamesData = { pending: [] };
    try {
      const fileContent = await readFile(filePath, "utf-8");
      data = JSON.parse(fileContent);
    } catch (error) {
      // 파일이 없으면 새로 생성
      data = { pending: [] };
    }

    // 중복 체크 (같은 한글명이 이미 있는지)
    const exists = data.pending.some((item) => item.korean === korean);
    if (exists) {
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

    data.pending.push(newItem);

    // 파일에 저장
    await writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");

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
 */
export async function GET() {
  try {
    const filePath = join(process.cwd(), "src", "lib", "campaign", "pending-campaign-names.json");

    try {
      const fileContent = await readFile(filePath, "utf-8");
      const data: PendingCampaignNamesData = JSON.parse(fileContent);
      return NextResponse.json({
        ok: true,
        data: data.pending,
      });
    } catch (error) {
      // 파일이 없으면 빈 배열 반환
      return NextResponse.json({
        ok: true,
        data: [],
      });
    }
  } catch (error) {
    console.error("Error reading pending campaign names:", error);
    return NextResponse.json(
      { ok: false, message: "대기 목록 조회에 실패했습니다." },
      { status: 500 }
    );
  }
}

