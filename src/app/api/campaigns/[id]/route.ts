import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import type { ApiResponse, CampaignWithChannels } from "@/types/campaign";

const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

const missingEnvResponse = () =>
  respond(
    {
      ok: false,
      code: "MISSING_ENV",
      message: "Supabase 환경 변수가 설정되지 않았습니다.",
    },
    { status: 500 }
  );

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const supabase = createSupabaseServerClient();

  // 인증 확인
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "UNAUTHORIZED",
        message: "인증이 필요합니다.",
      },
      { status: 401 }
    );
  }

  const { id } = await params;

  // 캠페인 조회
  try {
    const { data: campaign, error: campaignError } = await supabase
      .from("campaigns")
      .select("*")
      .eq("id", id)
      .single();

    if (campaignError || !campaign) {
      return respond<ApiResponse<never>>(
        {
          ok: false,
          code: "NOT_FOUND",
          message: "캠페인을 찾을 수 없습니다.",
        },
        { status: 404 }
      );
    }

    // 권한 확인
    if (campaign.user_id !== user.id) {
      return respond<ApiResponse<never>>(
        {
          ok: false,
          code: "FORBIDDEN",
          message: "접근 권한이 없습니다.",
        },
        { status: 403 }
      );
    }

    // 매체 리스트 조회
    const { data: channels, error: channelsError } = await supabase
      .from("campaign_channels")
      .select("*")
      .eq("campaign_id", id)
      .order("created_at", { ascending: false });

    if (channelsError) {
      console.error("Failed to fetch channels:", channelsError);
    }

    const result: CampaignWithChannels = {
      ...(campaign as CampaignWithChannels),
      channels: (channels || []) as CampaignWithChannels["channels"],
    };

    return respond<ApiResponse<CampaignWithChannels>>({
      ok: true,
      data: result,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return respond<ApiResponse<never>>(
      {
        ok: false,
        code: "DB_QUERY_ERROR",
        message,
      },
      { status: 500 }
    );
  }
}
