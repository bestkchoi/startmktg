import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import { validateBaseUrl } from "@/utils/validateBaseUrl";
import { sanitizeUtmParams } from "@/utils/sanitizeUtmParams";
import { buildUtmUrl } from "@/utils/buildUtmUrl";
import { detectPlatformParams } from "@/utils/detectPlatformParams";
import type { ApiError, UtmParams } from "@/types/utm";

const REQUIRED_UTM_FIELDS: Array<keyof UtmParams> = [
  "utm_source",
  "utm_medium",
  "utm_campaign"
];

const missingEnvResponse = () =>
  NextResponse.json<ApiError>(
    {
      ok: false,
      code: "MISSING_ENV",
      message: "Supabase 환경 변수가 설정되지 않았습니다."
    },
    { status: 500 }
  );

const jsonParseErrorResponse = () =>
  NextResponse.json<ApiError>(
    {
      ok: false,
      code: "INVALID_JSON",
      message: "유효한 JSON 요청 본문이 필요합니다."
    },
    { status: 400 }
  );

const missingFieldsResponse = (fields: string[]) =>
  NextResponse.json<ApiError>(
    {
      ok: false,
      code: "MISSING_FIELD",
      message: `${fields.join(", ")} 필수 파라미터가 누락되었습니다.`
    },
    { status: 400 }
  );

const invalidUrlResponse = (reason: string) =>
  NextResponse.json<ApiError>(
    {
      ok: false,
      code: "INVALID_URL",
      message: `base_url이 유효하지 않습니다: ${reason}`
    },
    { status: 400 }
  );

export async function POST(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  let payload: Record<string, unknown>;
  try {
    payload = await request.json();
  } catch {
    return jsonParseErrorResponse();
  }

  const baseUrl = typeof payload.base_url === "string" ? payload.base_url : "";
  const validation = validateBaseUrl(baseUrl);
  if (!validation.valid) {
    return invalidUrlResponse(validation.reason);
  }

  const utmInput: Partial<UtmParams> = {
    utm_source:
      typeof payload.utm_source === "string" ? payload.utm_source : undefined,
    utm_medium:
      typeof payload.utm_medium === "string" ? payload.utm_medium : undefined,
    utm_campaign:
      typeof payload.utm_campaign === "string" ? payload.utm_campaign : undefined,
    utm_content:
      typeof payload.utm_content === "string" ? payload.utm_content : undefined,
    utm_term:
      typeof payload.utm_term === "string" ? payload.utm_term : undefined,
    utm_source_platform:
      typeof payload.utm_source_platform === "string"
        ? payload.utm_source_platform
        : undefined,
    utm_id:
      typeof payload.utm_id === "string" ? payload.utm_id : undefined
  };

  const sanitizedUtm = sanitizeUtmParams(utmInput);
  const missingRequired = REQUIRED_UTM_FIELDS.filter(
    (key) => !sanitizedUtm[key]
  );

  if (missingRequired.length > 0) {
    return missingFieldsResponse(missingRequired);
  }

  const { finalUrl } = buildUtmUrl(validation.url.toString(), sanitizedUtm);
  const platformInfo = detectPlatformParams(finalUrl);

  try {
    const supabase = createSupabaseServerClient({ url, anonKey });

    const { data, error } = await supabase
      .from("fact_utm_log")
      .insert({
        base_url: validation.url.toString(),
        utm_source: sanitizedUtm.utm_source ?? null,
        utm_medium: sanitizedUtm.utm_medium ?? null,
        utm_campaign: sanitizedUtm.utm_campaign ?? null,
        utm_content: sanitizedUtm.utm_content ?? null,
        utm_term: sanitizedUtm.utm_term ?? null,
        utm_source_platform: sanitizedUtm.utm_source_platform ?? null,
        utm_id: sanitizedUtm.utm_id ?? null,
        meta_params:
          Object.keys(platformInfo.detected).length > 0
            ? platformInfo
            : null,
        final_url: finalUrl
      })
      .select("id")
      .single();

    if (error || !data) {
      return NextResponse.json<ApiError>(
        {
          ok: false,
          code: "DB_INSERT_ERROR",
          message: error?.message ?? "저장 중 오류가 발생했습니다."
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        id: data.id,
        final_url: finalUrl,
        message: "UTM 생성 및 저장 완료"
      },
      { status: 201 }
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json<ApiError>(
      {
        ok: false,
        code: "DB_INSERT_ERROR",
        message
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return missingEnvResponse();
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  let limit = 10;

  if (limitParam) {
    const parsed = Number.parseInt(limitParam, 10);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      return NextResponse.json<ApiError>(
        {
          ok: false,
          code: "INVALID_QUERY",
          message: "limit은 양의 정수여야 합니다."
        },
        { status: 400 }
      );
    }

    limit = Math.min(parsed, 50);
  }

  try {
    const supabase = createSupabaseServerClient({ url, anonKey });

    const { data, error } = await supabase
      .from("fact_utm_log")
      .select(
        "id, created_at, base_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_source_platform, utm_id, final_url, meta_params"
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json<ApiError>(
        {
          ok: false,
          code: "DB_QUERY_ERROR",
          message: error.message
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      items: data ?? []
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "알 수 없는 오류가 발생했습니다.";

    return NextResponse.json<ApiError>(
      {
        ok: false,
        code: "DB_QUERY_ERROR",
        message
      },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/libs/supabase/server";
import { buildUtmUrl } from "@/utils/buildUtmUrl";
import { detectPlatformParams } from "@/utils/detectPlatformParams";
import { sanitizeUtmParams } from "@/utils/sanitizeUtmParams";
import { validateBaseUrl } from "@/utils/validateBaseUrl";
import type { UtmParams } from "@/types/utm";

const REQUIRED_UTM_KEYS: (keyof UtmParams)[] = [
  "utm_source",
  "utm_medium",
  "utm_campaign"
];

const createSupabaseOrError = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          code: "MISSING_ENV",
          message: "Supabase 환경 변수가 설정되지 않았습니다."
        },
        { status: 500 }
      )
    };
  }

  return {
    client: createSupabaseServerClient({ url, anonKey })
  };
};

export async function POST(request: Request) {
  const supabaseResult = createSupabaseOrError();
  if ("error" in supabaseResult) {
    return supabaseResult.error;
  }

  let payload: Record<string, unknown>;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_JSON",
        message: "JSON 본문을 파싱할 수 없습니다."
      },
      { status: 400 }
    );
  }

  const baseUrlRaw = typeof payload.base_url === "string" ? payload.base_url : "";
  const validation = validateBaseUrl(baseUrlRaw);

  if (!validation.valid) {
    return NextResponse.json(
      {
        ok: false,
        code: "INVALID_URL",
        message: validation.reason
      },
      { status: 400 }
    );
  }

  const utmInput: Partial<UtmParams> = {};
  for (const key of Object.keys(payload)) {
    if (key.startsWith("utm_")) {
      utmInput[key as keyof UtmParams] =
        typeof payload[key] === "string" ? (payload[key] as string) : undefined;
    }
  }

  const sanitized = sanitizeUtmParams(utmInput);

  const missingRequired = REQUIRED_UTM_KEYS.filter((key) => !sanitized[key]);
  if (missingRequired.length > 0) {
    return NextResponse.json(
      {
        ok: false,
        code: "MISSING_FIELD",
        message: `${missingRequired.join(", ")} 필드가 필요합니다.`
      },
      { status: 400 }
    );
  }

  const { finalUrl } = buildUtmUrl(
    validation.url.toString(),
    sanitized
  );

  const platformDetection = detectPlatformParams(finalUrl);

  const { client } = supabaseResult;

  const insertPayload = {
    base_url: validation.url.toString(),
    utm_source: sanitized.utm_source ?? null,
    utm_medium: sanitized.utm_medium ?? null,
    utm_campaign: sanitized.utm_campaign ?? null,
    utm_content: sanitized.utm_content ?? null,
    utm_term: sanitized.utm_term ?? null,
    utm_source_platform: sanitized.utm_source_platform ?? null,
    utm_id: sanitized.utm_id ?? null,
    meta_params: {
      detected: platformDetection.detected,
      platforms: platformDetection.platforms
    },
    final_url: finalUrl
  };

  const { data, error } = await client
    .from("fact_utm_log")
    .insert(insertPayload)
    .select("id")
    .single();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "DB_INSERT_ERROR",
        message: error.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      id: data.id,
      final_url: finalUrl,
      message: "UTM 생성 및 저장 완료"
    },
    { status: 201 }
  );
}

export async function GET(request: Request) {
  const supabaseResult = createSupabaseOrError();
  if ("error" in supabaseResult) {
    return supabaseResult.error;
  }

  const { client } = supabaseResult;
  const url = new URL(request.url);
  const limitParam = url.searchParams.get("limit");
  const limit = Math.min(
    50,
    Math.max(1, limitParam ? Number.parseInt(limitParam, 10) || 10 : 10)
  );

  const { data, error } = await client
    .from("fact_utm_log")
    .select(
      "id, created_at, base_url, utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_source_platform, utm_id, final_url, meta_params"
    )
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "DB_READ_ERROR",
        message: error.message
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    items: data ?? []
  });
}


