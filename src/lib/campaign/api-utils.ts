import { NextResponse } from "next/server";

/**
 * API 응답 헬퍼 함수
 */
export const respond = (body: unknown, init?: ResponseInit) => 
  NextResponse.json(body, init);

/**
 * 환경 변수 누락 응답
 */
export const missingEnvResponse = (): NextResponse => 
  respond(
    {
      ok: false,
      code: "MISSING_ENV",
      message: "Supabase 환경 변수가 설정되지 않았습니다.",
    },
    { status: 500 }
  );

/**
 * 유효하지 않은 JSON 응답
 */
export const invalidJsonResponse = (): NextResponse =>
  respond(
    {
      ok: false,
      code: "INVALID_JSON",
      message: "유효한 JSON 요청 본문이 필요합니다.",
    },
    { status: 400 }
  );

/**
 * 검증 에러 응답
 */
export const validationErrorResponse = (errors: Record<string, string>): NextResponse =>
  respond(
    {
      ok: false,
      code: "VALIDATION_ERROR",
      message: "입력값 검증에 실패했습니다.",
      errors,
    },
    { status: 400 }
  );

/**
 * 리소스를 찾을 수 없음 응답
 */
export const notFoundResponse = (message: string = "리소스를 찾을 수 없습니다."): NextResponse =>
  respond(
    {
      ok: false,
      code: "NOT_FOUND",
      message,
    },
    { status: 404 }
  );

/**
 * 데이터베이스 에러 응답
 */
export const dbErrorResponse = (
  message: string,
  code: string = "DB_ERROR"
): NextResponse =>
  respond(
    {
      ok: false,
      code,
      message,
    },
    { status: 500 }
  );

/**
 * 성공 응답
 */
export const successResponse = <T>(data: T, status: number = 200): NextResponse =>
  respond(
    {
      ok: true,
      data,
    },
    { status }
  );



