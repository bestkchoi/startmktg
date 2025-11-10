# 🔧 UTM Checker – Function & API SPEC v1.0

> 제안 파일 경로: `docs/SPEC/utm_checker_spec_v1.md`

## 0. 범위
- 본 문서는 Start Marketing UTM Checker MVP의 **구현 규칙**을 정의한다.
- 대상: Next.js App Router, TypeScript, Tailwind, Supabase(PostgreSQL).
- 참조: `docs/PRD/PRD_UTM_Checker_v1.0.md`.

---

## 1. 공통 규칙
- 모든 함수는 **TypeScript**로 작성한다.
- 모든 API 응답은 `{ ok: boolean, ... }` 형태를 기본으로 한다.
- 에러 응답은 `{ ok: false, code: string, message: string }` 규격을 따른다.
- 환경 변수는 코드에 하드코딩하지 않는다.
- UTM 키는 소문자, 값은 트리밍 후 URL 인코딩을 적용한다.

### 1.1 타입 기본 정의
```ts
// src/types/utm.ts
export type UtmParams = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  utm_source_platform?: string;
  utm_id?: string;
};

export type PlatformParamMap = Record<string, string>; // 예: { gclid: "...", fbclid: "..." }

export type ApiError = { ok: false; code: string; message: string };
```

---

## 2. 유틸리티 함수 명세 (`src/utils/*`)

### 2.1 `validateBaseUrl`
- **파일**: `src/utils/validateBaseUrl.ts`
- **시그니처**:
```ts
export function validateBaseUrl(baseUrl: string): { valid: true; url: URL } | { valid: false; reason: string };
```
- **설명**: 사용자가 입력한 baseUrl이 유효한 http, https URL인지 검사한다.
- **검사 규칙**:
  - 스킴은 http 또는 https여야 한다.
  - 호스트가 존재해야 한다.
  - 공백과 보이지 않는 문자를 제거한다.
- **오류 케이스**: 유효하지 않으면 `{ valid: false, reason }` 반환.

### 2.2 `sanitizeUtmParams`
- **파일**: `src/utils/sanitizeUtmParams.ts`
- **시그니처**:
```ts
export function sanitizeUtmParams(input: Partial<UtmParams>): UtmParams;
```
- **설명**: 입력된 UTM 값들을 트리밍하고 빈 문자열은 제거한다. null, undefined는 제외한다.
- **특이사항**: 키는 소문자로 강제하지 않고, 호출부에서 정규 UTM 키만 전달하도록 전제한다.

### 2.3 `detectPlatformParams`
- **파일**: `src/utils/detectPlatformParams.ts`
- **시그니처**:
```ts
export function detectPlatformParams(targetUrl: string | URL): { detected: PlatformParamMap; platforms: string[] };
```
- **설명**: URL의 쿼리에서 매체 전용 파라미터를 감지한다.
- **감지 대상**:
  - Google Ads: `gclid`
  - Meta: `fbclid`
  - Naver Ads: `n_media`, `n_query`, `n_ad_group`, `n_campaign`, `n_rank`
  - Kakao Ads: `k_campaign`, `k_creative`, `k_medium`, `k_keyword`
  - Criteo: `criteo_p`, `criteo_c`, `criteo_r`
- **반환값**:
  - `detected`: 감지된 키들과 값의 맵
  - `platforms`: 상징 라벨 목록, 예: `["Google Ads", "Meta", "Naver Ads"]`

### 2.4 `buildUtmUrl`
- **파일**: `src/utils/buildUtmUrl.ts`
- **시그니처**:
```ts
export function buildUtmUrl(baseUrl: string, utm: UtmParams): { finalUrl: string; mergedQuery: Record<string, string> };
```
- **설명**: baseUrl의 기존 쿼리를 유지하면서 UTM 파라미터를 병합하고 최종 URL 문자열을 만든다.
- **동작 규칙**:
  - 기존 쿼리와 충돌 시 UTM 키는 **UTM 입력값으로 덮어쓴다**.
  - 빈 값, 공백 문자열은 쿼리에 포함하지 않는다.
  - 정렬 규칙: 결과 쿼리는 알파벳 오름차순으로 정렬한다.
  - URL 인코딩은 `URLSearchParams` 표준에 따른다.
- **반환값**:
  - `finalUrl`: 완성된 URL 문자열
  - `mergedQuery`: 최종 반영된 쿼리 키 값 맵
- **예시**:
```ts
buildUtmUrl("https://startmktg.com/p?a=1", { utm_source: "kakao", utm_medium: "message" })
// => {
//   finalUrl: "https://startmktg.com/p?a=1&utm_medium=message&utm_source=kakao",
//   mergedQuery: { a: "1", utm_medium: "message", utm_source: "kakao" }
// }
```

---

## 3. API 명세 (`src/app/api/*`)

### 3.1 건강 체크 API — `GET /api/ping`
- **파일**: `src/app/api/ping/route.ts`
- **요청**: 쿼리 없음.
- **처리**: Supabase 연결 확인용 최소 쿼리 수행.
- **성공 응답**:
```json
{ "ok": true, "message": "Supabase 연결이 정상입니다." }
```
- **실패 응답**:
```json
{ "ok": false, "code": "DB_CONN_ERROR", "message": "Supabase 연결 실패" }
```

### 3.2 UTM 생성 저장 API — `POST /api/utm-checker`
- **파일**: `src/app/api/utm-checker/route.ts`
- **요청 본문(JSON)**:
```json
{
  "base_url": "https://startmktg.com/product",
  "utm_source": "kakao",
  "utm_medium": "message",
  "utm_campaign": "retinol_251101_launch",
  "utm_content": "image_a",
  "utm_term": "remarketing",
  "utm_source_platform": "kakao",
  "utm_id": "cmp_2025_1109"
}
```
- **검증 규칙**:
  - `base_url`은 `validateBaseUrl`로 필수 검사.
  - 필수 UTM: `utm_source`, `utm_medium`, `utm_campaign`.
  - 선택 UTM은 있으면 반영, 없으면 제외.
- **처리 순서**:
  1. 입력 파싱 및 검증.
  2. `sanitizeUtmParams`로 UTM 정리.
  3. `buildUtmUrl`로 `final_url` 생성.
  4. `detectPlatformParams`로 `meta_params` 후보 수집.
  5. Supabase `fact_utm_log`에 insert.
- **성공 응답** `201`:
```json
{
  "ok": true,
  "id": "<uuid>",
  "final_url": "https://startmktg.com/product?utm_campaign=retinol_251101_launch&utm_medium=message&utm_source=kakao",
  "message": "UTM 생성 및 저장 완료"
}
```
- **오류 응답 예시**:
```json
{ "ok": false, "code": "INVALID_URL", "message": "base_url이 유효한 URL이 아닙니다." }
{ "ok": false, "code": "MISSING_FIELD", "message": "utm_source, utm_medium, utm_campaign은 필수입니다." }
{ "ok": false, "code": "DB_INSERT_ERROR", "message": "저장 중 오류가 발생했습니다." }
```

### 3.3 최근 이력 조회 — `GET /api/utm-checker`
- **쿼리**: `limit` 옵션, 기본 10, 최대 50.
- **처리**: `created_at desc` 정렬 후 상위 `limit`개 반환.
- **성공 응답** `200`:
```json
{
  "ok": true,
  "items": [
    {
      "id": "<uuid>",
      "created_at": "2025-11-10T09:00:00.000Z",
      "base_url": "https://...",
      "utm_source": "kakao",
      "utm_medium": "message",
      "utm_campaign": "...",
      "utm_content": null,
      "utm_term": null,
      "utm_source_platform": null,
      "utm_id": null,
      "final_url": "https://..."
    }
  ]
}
```

### 3.4 단건 조회 — `GET /api/utm-checker/:id`
- **파라미터**: `id`는 uuid.
- **응답**:
```json
{ "ok": true, "data": { "id": "<uuid>", "final_url": "https://...", ... } }
```
- **오류**:
```json
{ "ok": false, "code": "NOT_FOUND", "message": "해당 id를 찾을 수 없습니다." }
```

---

## 4. DB 반영 규칙 (Supabase)
- 테이블: `fact_utm_log` (PRD와 동일).
- `meta_params`에는 `detectPlatformParams` 결과를 저장한다.
- 인덱스 권장:
```sql
CREATE INDEX IF NOT EXISTS idx_fact_utm_log_created_at ON fact_utm_log (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_fact_utm_log_campaign ON fact_utm_log (utm_campaign);
```

---

## 5. UI 연동 포인트
- `utm_id`가 존재하면 화면에 “GA4 비용 매칭 가능” 배지를 표시한다.
- `detectPlatformParams`에서 감지된 플랫폼 라벨을 배지로 표시한다.
- 복사 버튼은 `navigator.clipboard.writeText(final_url)` 사용, 성공 시 토스트 노출.

---

## 6. 테스트 시나리오
1) 잘못된 URL 입력
- 입력: `base_url = "startmktg"`
- 응답: `INVALID_URL`

2) 필수 UTM 누락
- 입력: `utm_medium` 없음
- 응답: `MISSING_FIELD`

3) 기존 쿼리 병합
- 입력: `https://site.com?p=1`, utm 2개
- 결과: `p=1` 유지, utm 키 추가, 알파벳 정렬 확인

4) 플랫폼 파라미터 감지
- 입력 URL에 `gclid=...` 포함
- 응답: 저장 시 `meta_params`에 `gclid` 포함, UI 배지 노출

5) 정상 생성 저장
- 상태: `201`, DB에 행 생성, `/history`에서 노출

---

## 7. 비목표 (MVP 범위 외)
- 인증과 권한 분리, RLS 정책 적용.
- 비용 데이터 자동 매핑 처리.
- 고급 템플릿 저장, 조직 별 규칙 엔진.

---

## 8. 변경 기록
- v1.0 — 최초 작성. PRD v1.0에 대응.

