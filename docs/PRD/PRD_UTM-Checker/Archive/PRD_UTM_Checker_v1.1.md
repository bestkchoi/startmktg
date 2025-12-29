# 1. 개요 (Overview)

**서비스명:** Start MKTG – UTM Checker  
**버전:** 1.1  
**작성일:** 2025-01-21  
**기반 버전:** v1.0

**URL:**
- KOR 버전: `/ko/utm-checker`
- ENG 버전: `/en/utm-checker`

**목표:**  
마케터가 랜딩페이지 URI를 입력하면, URI의 파라미터값을 파싱하여,
광고매체사와 GA4가 수집하는 데이터를 쉽게 분류해서 보여주고,
GA4에 데이터가 어떻게 수집되는지 미리보기를 통해 확인할 수 있다.


---

## 2. 주요 사용자 (Target User)

| 구분 | 설명 |
|------|------|
| 퍼포먼스 마케터 | 캠페인별 UTM을 빠르게 확인 |
| 광고운영 담당자 | 매체별 쿼리 파라미터를 검증 |
| CRM 메시지 담당자 | 메시지 발송 시 트래킹 URL 확인인 |

---

## 3. 주요 기능 (Key Features)

### 3.1 구현 완료된 기능

| 기능명 | 설명 | 구현 상태 |
|---------|------|-----------|
| 1. Base URL 입력 및 검증 | 사용자가 랜딩페이지 URL 입력 | ✅ 완료 |
| 2. UTM 파라미터 입력 폼 | utm_source, utm_medium, utm_campaign (필수), utm_content, utm_term (선택) | ✅ 완료 |
| 3. URL 파싱 기능 | 기존 URL을 붙여넣으면 폼에 자동으로 채움 | ✅ 완료 |
| 4. URL 빌드 옵션 | lowercaseKeys, trimEmptyParams, encodeSpace 설정 | ✅ 완료 |
| 5. 최종 URL 생성 및 미리보기 | 완성된 URL 출력 | ✅ 완료 |
| 6. 클립보드 복사 | URL 및 JSON 형태로 복사 | ✅ 완료 |
| 7. 매체별 파라미터 감지 | URL 내 fbclid, gclid 등 자동 탐지 | ✅ 완료 |
| 8. 플랫폼 배지 표시 | 감지된 매체를 배지로 표시 | ✅ 완료 |
| 9. 로컬 히스토리 | 최근 5개 생성 기록 (localStorage) | ✅ 완료 |
| 10. Supabase 로그 저장 | 입력된 URL 및 생성 결과 저장 | ✅ 완료 |
| 11. 최근 생성 이력 조회 API | 최근 10건 조회 (GET /api/utm-checker) | ✅ 완료 |
| 12. Google Analytics 이벤트 추적 | UTM 체크 이벤트 추적 | ✅ 완료 |

### 3.2 미구현 기능 (v1.0 계획 대비)

| 기능명 | 설명 | 상태 |
|---------|------|------|
| utm_source_platform | GA4 선택 수집 항목 | ⏳ 향후 구현 |
| utm_id | 캠페인 식별자 (비용 데이터 매칭용) | ⏳ 향후 구현 |
| Supabase Auth 연동 | 사용자별 기록 분리 | ⏳ 향후 구현 |
| 드롭다운 선택지 | utm_source, utm_medium 드롭다운 | ⏳ 향후 구현 |

---

## 4. 데이터 구조 및 데이터 출처

### 4.1 Google Analytics 4 표준 파라미터

GA4 공식 가이드([공식문서](https://support.google.com/analytics/answer/10917952?hl=ko))에 정의된 파라미터.

| 컬럼명 | 타입 | 설명 | 데이터 출처 | 구현 상태 |
|---------|------|------|--------------|-----------|
| utm_source | text | 트래픽 출처 (google, kakao, naver, meta 등) | **Google Analytics 4** | ✅ 필수 |
| utm_medium | text | 마케팅 매체/형식 (cpc, message, banner) | **Google Analytics 4** | ✅ 필수 |
| utm_campaign | text | 캠페인 이름 | **Google Analytics 4** | ✅ 필수 |
| utm_content | text | 광고 컨텐츠 구분 | **Google Analytics 4** | ✅ 선택 |
| utm_term | text | 키워드 | **Google Analytics 4** | ✅ 선택 |
| utm_source_platform | text | 광고 플랫폼 명시 (google, meta, naver 등) | **Google Analytics 4** | ⏳ 미구현 |
| utm_id | text | **캠페인 식별자 (Campaign ID)** – 비용 데이터 매칭용 | **Google Analytics 4** | ⏳ 미구현 |

### 4.2 매체별 커스텀 파라미터

각 매체가 자체적으로 생성하는 파라미터이며 GA4에서 자동 수집하지 않습니다.

| 매체 | 주요 파라미터 키 | 설명 | 데이터 출처 | 감지 상태 |
|------|------------------|------|--------------|-----------|
| Meta (Facebook/Instagram) | fbclid | Facebook Click ID | Meta Ads | ✅ 감지 가능 |
| Google Ads | gclid | Google Click ID | Google Ads | ✅ 감지 가능 |
| Naver Ads | n_media, n_query, n_ad_group, n_campaign, n_rank | 네이버 광고 식별자 | Naver Ads | ✅ 감지 가능 |
| Kakao Ads | k_campaign, k_creative, k_medium, k_keyword | 카카오 광고 식별자 | Kakao Ads | ✅ 감지 가능 |
| Criteo | criteo_p, criteo_c, criteo_r | 리타게팅용 파라미터 | Criteo | ✅ 감지 가능 |

### 4.3 파라미터 표시 규칙 (UI 메타 정보)

URL 검사 결과 영역에는 감지된 파라미터별로 "수집 가능 여부"와 "플랫폼 문구"를 함께 보여줍니다.

| 구분 | 파라미터 키 | 표시 문구 | 배지 색상/스타일 | 구현 상태 |
|------|-------------|-----------|------------------|-----------|
| GA4 기본 수집 | utm_source, utm_medium, utm_campaign | `GA4 기본 수집 항목` | 기본 스타일 | ✅ 구현됨 |
| GA4 선택 수집 | utm_content, utm_term, utm_source_platform, utm_id | `GA4 선택 수집 항목` | 기본 스타일 | ✅ 부분 구현 |
| 메타 광고 | fbclid | `Meta/Facebook Ads 자동 매핑` | 플랫폼 배지 | ✅ 구현됨 |
| 구글 광고 | gclid | `Google Ads 자동 매핑` | 플랫폼 배지 | ✅ 구현됨 |
| 네이버 광고 | n_media, n_query, n_ad_group, n_campaign, n_rank | `네이버 검색광고 추적 파라미터` | 플랫폼 배지 | ✅ 구현됨 |
| 카카오 광고 | k_campaign, k_creative, k_medium, k_keyword | `카카오 광고 추적 파라미터` | 플랫폼 배지 | ✅ 구현됨 |
| 크리테오 | criteo_p, criteo_c, criteo_r | `Criteo 리타게팅 파라미터` | 플랫폼 배지 | ✅ 구현됨 |
| 기타 | 그 외 키 | `커스텀 파라미터` | 기본 스타일 | ✅ 구현됨 |

**표시 규칙:**
- 배열 순서는 GA4 기본 ▶ GA4 선택 ▶ 플랫폼별 ▶ 기타 순으로 정렬됩니다.
- 감지된 플랫폼은 ResultsCard에서 배지로 표시됩니다.

---

## 5. 데이터베이스 스키마 (Supabase / PostgreSQL)

### 5.1 fact_utm_log 테이블

**테이블명:** `fact_utm_log`

```sql
CREATE TABLE fact_utm_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  base_url text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  utm_source_platform text,
  utm_id text,
  meta_params jsonb,
  final_url text
);
```

**설명:**
- **GA4 파라미터**: 컬럼 단위로 저장
- **매체별 파라미터**: `meta_params` jsonb 필드로 통합 저장
- 향후 `dim_user`, `dim_project` 관계 테이블 추가 예정

**인덱스:**
- `created_at` 기준 내림차순 정렬 (최근 기록 우선)

---

## 6. API 설계

### 6.1 POST /api/utm-checker

**설명:** 입력된 URL과 파라미터를 받아 UTM URL 생성 및 저장

**요청:**
```json
{
  "base_url": "https://startmktg.com",
  "utm_source": "kakao",
  "utm_medium": "cpc",
  "utm_campaign": "launch",
  "utm_content": "ad_001",
  "utm_term": "spring_sale",
  "utm_source_platform": null,
  "utm_id": null
}
```

**응답 (성공):**
```json
{
  "ok": true,
  "id": "uuid",
  "final_url": "https://startmktg.com?utm_source=kakao&utm_medium=cpc&utm_campaign=launch&utm_content=ad_001&utm_term=spring_sale",
  "message": "UTM 생성 및 저장 완료"
}
```

**응답 (에러):**
```json
{
  "ok": false,
  "code": "MISSING_FIELD",
  "message": "utm_source, utm_medium 필수 파라미터가 누락되었습니다."
}
```

**에러 코드:**
- `MISSING_ENV`: Supabase 환경 변수 미설정
- `INVALID_JSON`: 유효하지 않은 JSON 요청
- `MISSING_FIELD`: 필수 파라미터 누락
- `INVALID_URL`: base_url이 유효하지 않음
- `DB_INSERT_ERROR`: 데이터베이스 저장 실패

**상태 코드:**
- 201: 생성 성공
- 400: 검증 실패
- 500: 서버 오류

### 6.2 GET /api/utm-checker

**설명:** 최근 생성 이력 조회

**쿼리 파라미터:**
- `limit` (선택): 조회할 개수 (기본값: 10, 최대: 50)

**요청 예시:**
```
GET /api/utm-checker?limit=10
```

**응답 (성공):**
```json
{
  "ok": true,
  "items": [
    {
      "id": "uuid",
      "created_at": "2025-01-21T10:00:00Z",
      "base_url": "https://startmktg.com",
      "utm_source": "kakao",
      "utm_medium": "cpc",
      "utm_campaign": "launch",
      "utm_content": "ad_001",
      "utm_term": "spring_sale",
      "utm_source_platform": null,
      "utm_id": null,
      "final_url": "https://startmktg.com?utm_source=kakao&utm_medium=cpc&utm_campaign=launch&utm_content=ad_001&utm_term=spring_sale",
      "meta_params": {
        "baseUrl": "https://startmktg.com",
        "utm_source": "kakao",
        "utm_medium": "cpc",
        "platform": "kakao"
      }
    }
  ]
}
```

**응답 (에러):**
```json
{
  "ok": false,
  "code": "DB_QUERY_ERROR",
  "message": "데이터베이스 조회 중 오류가 발생했습니다."
}
```

**상태 코드:**
- 200: 조회 성공
- 400: 잘못된 쿼리 파라미터
- 500: 서버 오류

### 6.3 GET /api/utm-checker/:id (미구현)

**설명:** 특정 기록 조회

**상태:** ⏳ 향후 구현 예정

---

## 7. 화면 구성 (UI/UX)

### 7.1 페이지 레이아웃

**경로:** `/[locale]/utmchecker`

**구성 요소:**
1. **FormCard** - UTM 파라미터 입력 폼
2. **ParserCard** - 기존 URL 파싱
3. **ResultsCard** - 최종 URL 및 결과 표시
4. **HistoryCard** - 로컬 히스토리 (최근 5개)

### 7.2 FormCard (Build URL)

**기능:**
- Base URL 입력 필드 (필수, URL 검증)
- UTM 파라미터 입력 필드:
  - `utm_source` (필수, 소문자/숫자/언더스코어만 허용)
  - `utm_medium` (필수, 소문자/숫자/언더스코어만 허용)
  - `utm_campaign` (필수, 소문자/숫자/언더스코어만 허용)
  - `utm_content` (선택)
  - `utm_term` (선택)

**옵션 설정:**
- Lowercase keys: UTM 키를 모두 소문자로 변환
- Trim empty params: 값이 비어 있는 파라미터 제외
- Encode spaces as %20: 공백 문자를 %20 또는 +로 변환

**액션:**
- Build URL 버튼: 최종 URL 생성 및 Supabase 저장
- Reset 버튼: 폼 초기화

### 7.3 ParserCard

**기능:**
- 기존 URL을 붙여넣으면 자동으로 파싱
- 파싱된 base_url과 UTM 파라미터를 FormCard에 자동 채움

**동작:**
1. 사용자가 URL 입력
2. Parse 버튼 클릭
3. URL 파싱 후 FormCard에 값 채움

### 7.4 ResultsCard

**기능:**
- 최종 URL 표시 (읽기 전용)
- Copy URL 버튼: 클립보드에 URL 복사
- Copy JSON 버튼: 파라미터를 JSON 형태로 복사
- 감지된 플랫폼 배지 표시 (Meta, Google, Kakao, Naver, Criteo 등)
- 파라미터 칩 표시 (key=value 형태)

### 7.5 HistoryCard

**기능:**
- 로컬 스토리지에 저장된 최근 5개 기록 표시
- 각 기록의 base_url, final_url, 생성 시간 표시
- Copy 버튼으로 final_url 복사

**저장 방식:**
- 브라우저 localStorage 사용
- 사용자별로 독립적으로 저장

### 7.6 디자인 가이드

- **프레임워크:** TailwindCSS 기반
- **컴포넌트:** shadcn/ui 사용
- **레이아웃:** 카드형 레이아웃
- **반응형:** 모바일, 태블릿, 데스크톱 지원
- **피드백:** 복사 성공 시 토스트 메시지 표시

---

## 8. 유틸리티 함수

### 8.1 validateBaseUrl

**경로:** `src/utils/validateBaseUrl.ts`

**기능:** Base URL 유효성 검증

**반환값:**
```typescript
{
  valid: boolean;
  reason?: string;
  url?: URL;
}
```

### 8.2 sanitizeUtmParams

**경로:** `src/utils/sanitizeUtmParams.ts`

**기능:** UTM 파라미터 정제 (공백 제거, null/undefined 처리)

### 8.3 buildUtmUrl

**경로:** `src/utils/buildUtmUrl.ts`

**기능:** Base URL과 UTM 파라미터를 조합하여 최종 URL 생성

**옵션:**
- `lowercaseKeys`: 키를 소문자로 변환
- `trimEmptyParams`: 빈 파라미터 제외
- `encodeSpace`: 공백 인코딩 방식 (%20 또는 +)

### 8.4 detectPlatformParams

**경로:** `src/utils/detectPlatformParams.ts`

**기능:** URL에서 매체별 파라미터 감지 및 플랫폼 추론

**감지 가능한 플랫폼:**
- Meta (Facebook/Instagram)
- Google Ads
- Kakao Ads
- Naver Ads
- Criteo

### 8.5 parseUtmUrl

**경로:** `src/lib/utm.ts`

**기능:** URL 문자열을 파싱하여 base_url과 파라미터 추출

**반환값:**
```typescript
{
  baseUrl: string;
  [key: string]: string;
}
```

---

## 9. Google Analytics 추적

### 9.1 이벤트 추적

**이벤트명:** `utm_check`

**파라미터:**
- `event_category`: "utm_checker"
- `event_label`: "valid_utm" 또는 "invalid_utm"
- `has_utm_source`: boolean
- `has_utm_medium`: boolean
- `has_utm_campaign`: boolean
- `param_count`: number

**이벤트명:** `utm_check_error`

**파라미터:**
- `event_category`: "utm_checker"
- `event_label`: "url_parse_error"
- `error_message`: string

### 9.2 UTM 파라미터 추적

**함수:** `trackUtmParams(utmParams)`

**기능:** UTM 파라미터를 GA4에 자동으로 전달

---

## 10. v1.0 대비 변경사항

### 10.1 구현 방식 변경

| 항목 | v1.0 계획 | v1.1 실제 구현 |
|------|-----------|---------------|
| UTM 생성 방식 | 자동 생성 | 사용자 입력 폼 |
| URL 파싱 | 미계획 | ✅ 추가됨 |
| 로컬 히스토리 | 미계획 | ✅ 추가됨 |
| URL 빌드 옵션 | 미계획 | ✅ 추가됨 |
| utm_source_platform | 계획됨 | ⏳ 미구현 |
| utm_id | 계획됨 | ⏳ 미구현 |
| Supabase Auth | 계획됨 | ⏳ 미구현 |

### 10.2 개선 사항

1. **사용자 경험 개선**
   - 기존 URL 파싱 기능으로 빠른 입력 가능
   - 로컬 히스토리로 최근 작업 재사용 가능
   - URL 빌드 옵션으로 유연한 URL 생성

2. **검증 강화**
   - Base URL 실시간 검증
   - UTM 파라미터 형식 검증 (소문자/숫자/언더스코어)
   - 필수 파라미터 누락 시 명확한 에러 메시지

3. **분석 기능**
   - Google Analytics 이벤트 추적
   - 매체별 파라미터 자동 감지
   - 플랫폼 배지 표시

---

## 11. 향후 확장 로드맵 (Future Roadmap)

| 버전 | 개선 내용 | 우선순위 |
|------|------------|----------|
| v1.2 | utm_source_platform, utm_id 필드 추가 | P1 |
| v1.3 | Supabase Auth 연동 (로그인/사용자별 기록 분리) | P1 |
| v1.4 | utm_source, utm_medium 드롭다운 선택지 제공 | P2 |
| v1.5 | UTM 템플릿 저장 및 재사용 기능 | P2 |
| v1.6 | GA4 비용 데이터 매칭 기능 추가 (utm_id 활용) | P3 |
| v1.7 | 일괄 URL 생성 (Excel 업로드) | P3 |

---

## 12. 기술 스택

### 12.1 프론트엔드

- **프레임워크:** Next.js 14 (App Router)
- **언어:** TypeScript
- **스타일링:** TailwindCSS
- **UI 컴포넌트:** shadcn/ui
- **폼 관리:** react-hook-form + zod
- **상태 관리:** React useState, localStorage

### 12.2 백엔드

- **API:** Next.js API Routes
- **데이터베이스:** Supabase (PostgreSQL)
- **인증:** Supabase Auth (향후 구현)

### 12.3 분석

- **이벤트 추적:** Google Analytics 4

---

## 13. 파일 구조

```
src/
├── app/
│   ├── [locale]/
│   │   └── utmchecker/
│   │       └── page.tsx          # 메인 페이지 (리다이렉트)
│   ├── api/
│   │   └── utm-checker/
│   │       └── route.ts          # API 엔드포인트
│   └── utmchecker/
│       └── page.tsx              # 실제 페이지 컴포넌트
├── components/
│   └── utm/
│       ├── form-card.tsx         # 입력 폼 카드
│       ├── parser-card.tsx       # URL 파서 카드
│       ├── results-card.tsx      # 결과 표시 카드
│       └── history-card.tsx     # 히스토리 카드
├── hooks/
│   └── use-local-history.ts      # 로컬 히스토리 훅
├── lib/
│   ├── utm.ts                    # UTM 유틸리티
│   └── utm-form-schema.ts        # 폼 스키마 (zod)
└── utils/
    ├── validateBaseUrl.ts        # URL 검증
    ├── sanitizeUtmParams.ts      # 파라미터 정제
    ├── buildUtmUrl.ts            # URL 빌드
    └── detectPlatformParams.ts   # 플랫폼 감지
```

---

**작성 완료일:** 2025-01-21  
**다음 버전 예정일:** v1.2 (2025-02-01 예정)


