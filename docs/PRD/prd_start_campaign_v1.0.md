# 🧬 PRD_Start_Campaign_v1.0

## 1. Overview

**서비스명:** Start Marketing – Start Campaign  
**버전:** 1.0  
**작성일:** 2025-01-11  
**작성자:** Start Marketing Product Team

**서비스 개요:**  
퍼포먼스 마케터가 캠페인을 생성하고, 매체별로 UTM 파라미터가 포함된 추적 URL을 자동 생성하는 서비스입니다. 캠페인 단위로 매체를 관리하고, 매체별 템플릿을 통해 일관된 UTM 규칙을 적용합니다.

**핵심 가치:**
- 캠페인 단위로 매체를 체계적으로 관리
- 매체별 UTM 템플릿을 통한 자동화된 URL 생성
- 심플한 구조로 빠른 캠페인 생성 및 관리
- 확장 가능한 템플릿 시스템으로 유연한 규칙 적용

---

## 2. Problem Statement

### 현재 문제점

1. **수작업의 비효율성**
   - 매체별로 다른 UTM 규칙을 수동으로 입력해야 함
   - 실수로 인한 파라미터 오류 발생
   - 캠페인별 URL 관리가 어려움

2. **일관성 부족**
   - 팀원마다 다른 UTM 네이밍 규칙 사용
   - 매체별 표준 규칙이 없어 추적 데이터 품질 저하
   - GA4에서 데이터 분석 시 혼란 발생

3. **관리 복잡성**
   - 캠페인과 매체가 분산되어 관리 어려움
   - 생성된 URL의 추적 및 관리가 어려움
   - 캠페인 기간과 매체별 성과 연결이 복잡

### 해결 방향

- 캠페인 단위로 매체를 그룹화하여 관리
- 매체별 템플릿을 통한 자동화된 UTM 생성
- 심플한 3단계 플로우로 빠른 URL 생성
- 템플릿 기반 구조로 확장성 확보

---

## 3. Goals & Success Metrics

### 목표 (Goals)

1. **효율성 향상**
   - 캠페인 생성부터 UTM URL 생성까지 3분 이내 완료
   - 수작업 입력 시간 80% 감소

2. **일관성 확보**
   - 매체별 표준 템플릿 적용으로 오류율 90% 감소
   - 팀 내 UTM 네이밍 규칙 통일

3. **사용성 개선**
   - 직관적인 3단계 플로우로 학습 곡선 최소화
   - 신규 사용자도 5분 내 첫 캠페인 생성 가능

### 성공 지표 (Success Metrics)

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 캠페인 생성 시간 | 평균 3분 이내 | 사용자 행동 추적 |
| UTM 생성 오류율 | 5% 이하 | 생성된 URL 검증 |
| 사용자 만족도 | 4.0/5.0 이상 | 설문 조사 |
| 월간 활성 캠페인 수 | 사용자당 10개 이상 | 데이터 분석 |
| 템플릿 활용률 | 80% 이상 | 템플릿 사용 통계 |

---

## 4. Scope

### 포함 범위 (In Scope)

- ✅ 캠페인 생성 및 관리 (이름, 기간)
- ✅ 매체 선택 및 추가 (8개 매체 지원)
- ✅ 매체별 UTM 템플릿 기반 URL 생성
- ✅ 생성된 URL 저장 및 조회
- ✅ 템플릿 관리 (CRUD)
- ✅ 캠페인별 매체 리스트 조회

### 제외 범위 (Out of Scope)

- ❌ 캠페인 성과 분석 (GA4 연동)
- ❌ 매체별 광고 계정 연동
- ❌ URL 클릭 추적
- ❌ 팀 협업 기능 (공유, 권한 관리)
- ❌ 캠페인 템플릿/프리셋
- ❌ 일괄 URL 생성 (Excel 업로드)

---

## 5. Functional Requirements

### 5.1 캠페인 관리

#### FR-1: 캠페인 생성
- **우선순위:** P0 (필수)
- **설명:** 사용자는 캠페인 이름, 시작일, 종료일을 입력하여 캠페인을 생성할 수 있다.
- **입력값:**
  - `campaign_name` (필수, 문자열, 최대 100자)
  - `start_date` (필수, 날짜)
  - `end_date` (필수, 날짜, start_date 이후)
- **검증 규칙:**
  - 캠페인 이름은 필수이며 공백만으로 구성될 수 없음
  - 종료일은 시작일 이후여야 함
  - 날짜는 미래 날짜도 허용 (예: 예정된 캠페인)
- **출력:** 생성된 캠페인 ID와 상세 페이지로 리다이렉트

#### FR-2: 캠페인 조회
- **우선순위:** P0
- **설명:** 사용자는 자신이 생성한 캠페인 목록과 상세 정보를 조회할 수 있다.
- **기능:**
  - 캠페인 목록 조회 (생성일 기준 내림차순)
  - 캠페인 상세 정보 조회
  - 캠페인별 매체 리스트 조회

#### FR-3: 캠페인 수정
- **우선순위:** P1
- **설명:** 사용자는 캠페인 이름과 기간을 수정할 수 있다.
- **제약사항:** 매체가 추가된 후에도 수정 가능

#### FR-4: 캠페인 삭제
- **우선순위:** P1
- **설명:** 사용자는 캠페인을 삭제할 수 있다.
- **제약사항:** 
  - 매체가 추가된 경우 확인 메시지 표시
  - 삭제 시 하위 매체도 함께 삭제 (CASCADE)

### 5.2 매체 관리

#### FR-5: 매체 추가
- **우선순위:** P0
- **설명:** 사용자는 캠페인 상세 페이지에서 매체를 추가할 수 있다.
- **지원 매체:**
  - Meta
  - Google
  - Kakao
  - CRM SMS
  - CRM LMS
  - CRM Kakao
  - TikTok
  - 기타
- **입력값:**
  - `channel_type` (필수, 선택 목록에서 선택)
- **출력:** UTM 생성 페이지로 이동

#### FR-6: 매체 리스트 조회
- **우선순위:** P0
- **설명:** 사용자는 캠페인별로 추가된 매체 목록을 조회할 수 있다.
- **표시 정보:**
  - 매체 타입
  - 랜딩 URL
  - 생성일
  - 최종 URL (미리보기)

#### FR-7: 매체 삭제
- **우선순위:** P1
- **설명:** 사용자는 추가된 매체를 삭제할 수 있다.
- **제약사항:** 확인 메시지 표시 후 삭제

### 5.3 UTM 생성

#### FR-8: UTM 파라미터 자동 생성
- **우선순위:** P0
- **설명:** 사용자가 매체를 선택하고 랜딩 URL을 입력하면, 템플릿 기반으로 UTM 파라미터가 자동 생성된다.
- **입력값:**
  - `landing_url` (필수, URL 형식)
  - `custom_content` (선택, 문자열)
  - `custom_term` (선택, 문자열)
- **자동 생성값:**
  - `utm_source` (템플릿 기반)
  - `utm_medium` (템플릿 기반)
  - `utm_campaign` (템플릿 기반)
  - `utm_content` (템플릿 기반 또는 custom_content)
  - `utm_term` (템플릿 기반 또는 custom_term)
- **출력:** 최종 URL (landing_url + UTM 파라미터)

#### FR-9: UTM 템플릿 적용
- **우선순위:** P0
- **설명:** 매체별로 정의된 템플릿을 사용하여 UTM 파라미터를 생성한다.
- **템플릿 변수:**
  - `{{campaign_name}}` - 캠페인 이름
  - `{{channel_type}}` - 매체 타입
  - `{{adgroup_name}}` - 광고그룹 이름 (향후)
  - `{{creative_id}}` - 크리에이티브 ID (향후)
- **우선순위:**
  1. 템플릿 패턴 적용
  2. 사용자 입력값 (custom_content, custom_term)이 있으면 해당 값으로 덮어쓰기

#### FR-10: 최종 URL 생성 및 저장
- **우선순위:** P0
- **설명:** 생성된 UTM 파라미터를 랜딩 URL에 추가하여 최종 URL을 생성하고 저장한다.
- **URL 형식:**
  ```
  {landing_url}?utm_source={value}&utm_medium={value}&utm_campaign={value}&utm_content={value}&utm_term={value}
  ```
- **저장:** `campaign_channels` 테이블에 저장

### 5.4 템플릿 관리

#### FR-11: 템플릿 조회
- **우선순위:** P0
- **설명:** 매체별 UTM 템플릿을 조회할 수 있다.
- **기능:** 템플릿이 없으면 기본값 사용

#### FR-12: 템플릿 수정 (향후)
- **우선순위:** P2
- **설명:** 관리자가 매체별 템플릿을 수정할 수 있다.
- **비고:** v1.0에서는 템플릿은 비워두고, 향후 관리 기능 추가 예정

---

## 6. Non-Functional Requirements

### 6.1 성능

- 캠페인 생성 응답 시간: 500ms 이내
- UTM 생성 응답 시간: 200ms 이내
- 페이지 로딩 시간: 2초 이내

### 6.2 보안

- 사용자는 자신이 생성한 캠페인만 조회/수정/삭제 가능 (RLS)
- URL 입력값 검증 (XSS 방지)
- SQL Injection 방지 (파라미터화된 쿼리)

### 6.3 사용성

- 반응형 디자인 (모바일, 태블릿, 데스크톱)
- 키보드 네비게이션 지원
- 명확한 에러 메시지 제공
- 로딩 상태 표시

### 6.4 확장성

- 새로운 매체 타입 추가 용이
- 템플릿 변수 확장 가능
- API 버전 관리

---

## 7. User Flow

### 7.1 캠페인 생성 플로우

```
[대시보드]
    ↓
[캠페인 생성 버튼 클릭]
    ↓
[캠페인 생성 페이지]
    - 캠페인 이름 입력
    - 시작일 선택
    - 종료일 선택
    ↓
[생성 버튼 클릭]
    ↓
[검증]
    - 이름 필수 체크
    - 날짜 유효성 체크
    ↓
[캠페인 상세 페이지로 이동]
```

### 7.2 매체 추가 및 UTM 생성 플로우

```
[캠페인 상세 페이지]
    ↓
[매체 추가 버튼 클릭]
    ↓
[매체 선택 페이지]
    - 매체 타입 선택 (Meta, Google, Kakao 등)
    ↓
[선택 완료]
    ↓
[UTM 생성 페이지]
    - 랜딩 URL 입력
    - 커스텀 Content 입력 (선택)
    - 커스텀 Term 입력 (선택)
    ↓
[UTM 미리보기]
    - utm_source 표시
    - utm_medium 표시
    - utm_campaign 표시
    - utm_content 표시
    - utm_term 표시
    - 최종 URL 표시
    ↓
[저장 버튼 클릭]
    ↓
[캠페인 상세 페이지로 이동]
    - 추가된 매체가 리스트에 표시됨
```

### 7.3 전체 사용자 여정

```
1. 로그인
   ↓
2. 대시보드 접속
   ↓
3. 캠페인 생성
   ↓
4. 캠페인 상세 페이지
   ↓
5. 매체 추가
   ↓
6. 매체 선택
   ↓
7. UTM 생성
   ↓
8. URL 복사 및 사용
```

---

## 8. Page-by-Page UX Spec

### 8.1 캠페인 생성 페이지 (`/campaigns/new`)

**목적:** 새로운 캠페인을 생성하는 페이지

**레이아웃:**
- 헤더: "새 캠페인 생성"
- 본문: 입력 폼 (중앙 정렬)
- 푸터: 취소 버튼, 생성 버튼

**컴포넌트:**

1. **캠페인 이름 입력**
   - 레이블: "캠페인 이름"
   - 입력 타입: 텍스트
   - 플레이스홀더: "예: 2025 봄 프로모션"
   - 필수 표시: *
   - 최대 길이: 100자
   - 실시간 검증: 공백만 입력 불가

2. **시작일 선택**
   - 레이블: "시작일"
   - 입력 타입: 날짜 선택기
   - 필수 표시: *
   - 기본값: 오늘 날짜

3. **종료일 선택**
   - 레이블: "종료일"
   - 입력 타입: 날짜 선택기
   - 필수 표시: *
   - 기본값: 오늘 날짜
   - 검증: 시작일 이후만 선택 가능

4. **액션 버튼**
   - 취소 버튼: 왼쪽, 보조 스타일
   - 생성 버튼: 오른쪽, 주요 스타일

**상태:**
- 로딩: 생성 버튼 비활성화, 로딩 스피너 표시
- 에러: 필드별 에러 메시지 표시
- 성공: 캠페인 상세 페이지로 리다이렉트

---

### 8.2 캠페인 상세 페이지 (`/campaigns/:id`)

**목적:** 캠페인 정보와 매체 리스트를 표시하는 페이지

**레이아웃:**
- 헤더: 캠페인 이름, 기간 표시, 수정/삭제 버튼
- 본문: 매체 리스트 섹션
- 하단: 매체 추가 버튼

**컴포넌트:**

1. **캠페인 정보 카드**
   - 캠페인 이름 (큰 제목)
   - 기간: "2025-01-15 ~ 2025-02-15" 형식
   - 생성일: "생성일: 2025-01-11"
   - 액션: 수정, 삭제 버튼 (우측 상단)

2. **매체 리스트 섹션**
   - 제목: "매체 목록"
   - 테이블/카드 형식:
     - 매체 타입 (배지)
     - 랜딩 URL (링크)
     - 최종 URL (미리보기, 복사 버튼)
     - 생성일
     - 액션: 삭제 버튼

3. **매체 추가 버튼**
   - 주요 스타일
   - 클릭 시 매체 선택 페이지로 이동

**상태:**
- 매체 없음: "매체를 추가해주세요" 메시지 표시
- 로딩: 스켈레톤 UI 표시
- 에러: 에러 메시지 표시

---

### 8.3 매체 선택 페이지 (`/campaigns/:id/channels/new`)

**목적:** 추가할 매체를 선택하는 페이지

**레이아웃:**
- 헤더: "매체 선택"
- 본문: 매체 선택 그리드
- 하단: 취소 버튼

**컴포넌트:**

1. **매체 카드 그리드**
   - 2열 그리드 (모바일: 1열)
   - 각 매체별 카드:
     - 매체 아이콘/로고
     - 매체 이름
     - 호버 효과
   - 지원 매체:
     - Meta
     - Google
     - Kakao
     - CRM SMS
     - CRM LMS
     - CRM Kakao
     - TikTok
     - 기타

2. **선택 동작**
   - 카드 클릭 시 UTM 생성 페이지로 이동
   - 선택한 매체 타입을 쿼리 파라미터로 전달

---

### 8.4 UTM 생성 페이지 (`/campaigns/:id/channels/new?type={channel_type}`)

**목적:** UTM 파라미터를 생성하는 페이지

**레이아웃:**
- 헤더: "UTM 생성 - {매체명}"
- 본문: 입력 폼 + 미리보기
- 하단: 취소 버튼, 저장 버튼

**컴포넌트:**

1. **입력 섹션**
   - 랜딩 URL 입력
     - 레이블: "랜딩 URL"
     - 입력 타입: URL
     - 플레이스홀더: "https://example.com/landing"
     - 필수 표시: *
     - 실시간 URL 검증
   
   - 커스텀 Content (선택)
     - 레이블: "커스텀 Content"
     - 입력 타입: 텍스트
     - 플레이스홀더: "선택사항"
     - 도움말: "템플릿의 utm_content를 덮어씁니다"
   
   - 커스텀 Term (선택)
     - 레이블: "커스텀 Term"
     - 입력 타입: 텍스트
     - 플레이스홀더: "선택사항"
     - 도움말: "템플릿의 utm_term을 덮어씁니다"

2. **미리보기 섹션**
   - 제목: "생성된 UTM 파라미터"
   - 파라미터 표시:
     - utm_source: {값}
     - utm_medium: {값}
     - utm_campaign: {값}
     - utm_content: {값}
     - utm_term: {값}
   - 최종 URL 표시:
     - 읽기 전용 입력 필드
     - 복사 버튼

3. **액션 버튼**
   - 취소 버튼: 왼쪽
   - 저장 버튼: 오른쪽, 주요 스타일

**동작:**
- 랜딩 URL 입력 시 실시간으로 UTM 파라미터 생성 및 미리보기 업데이트
- 템플릿이 없으면 기본값 사용 (예: channel_type을 utm_source로)

---

### 8.5 매체 리스트 페이지 (`/campaigns/:id/channels`)

**목적:** 캠페인에 추가된 모든 매체를 조회하는 페이지

**레이아웃:**
- 헤더: "매체 목록"
- 본문: 매체 리스트 테이블
- 하단: 매체 추가 버튼

**컴포넌트:**

1. **매체 리스트 테이블**
   - 컬럼:
     - 매체 타입
     - 랜딩 URL
     - 최종 URL (미리보기)
     - 생성일
     - 액션 (삭제)
   - 정렬: 생성일 기준 내림차순
   - 페이지네이션: 20개씩 표시

2. **URL 복사 기능**
   - 각 행의 최종 URL 옆 복사 버튼
   - 복사 성공 시 토스트 메시지

---

## 9. Database Schema

### 9.1 테이블 구조

#### campaigns

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 캠페인 고유 ID |
| campaign_name | text | NOT NULL | 캠페인 이름 |
| start_date | date | NOT NULL | 시작일 |
| end_date | date | NOT NULL | 종료일 |
| user_id | uuid | NOT NULL, FK → users.id | 생성자 ID |
| created_at | timestamptz | DEFAULT now() | 생성일시 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**인덱스:**
- `campaigns_user_created_idx` (user_id, created_at DESC)

**RLS 정책:**
- SELECT: 사용자는 자신이 생성한 캠페인만 조회 가능
- INSERT: 인증된 사용자만 생성 가능
- UPDATE: 사용자는 자신이 생성한 캠페인만 수정 가능
- DELETE: 사용자는 자신이 생성한 캠페인만 삭제 가능

---

#### campaign_channels

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 매체 고유 ID |
| campaign_id | uuid | NOT NULL, FK → campaigns.id ON DELETE CASCADE | 캠페인 ID |
| channel_type | text | NOT NULL | 매체 타입 (meta, google, kakao 등) |
| landing_url | text | NOT NULL | 랜딩 URL |
| utm_source | text | | 생성된 utm_source |
| utm_medium | text | | 생성된 utm_medium |
| utm_campaign | text | | 생성된 utm_campaign |
| utm_content | text | | 생성된 utm_content |
| utm_term | text | | 생성된 utm_term |
| final_url | text | NOT NULL | 최종 URL (랜딩 URL + UTM) |
| created_at | timestamptz | DEFAULT now() | 생성일시 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**인덱스:**
- `campaign_channels_campaign_idx` (campaign_id, created_at DESC)
- `campaign_channels_type_idx` (channel_type)

**RLS 정책:**
- SELECT: 사용자는 자신이 생성한 캠페인의 매체만 조회 가능
- INSERT: 사용자는 자신이 생성한 캠페인에만 매체 추가 가능
- UPDATE: 사용자는 자신이 생성한 캠페인의 매체만 수정 가능
- DELETE: 사용자는 자신이 생성한 캠페인의 매체만 삭제 가능

---

#### utm_templates

| 컬럼명 | 타입 | 제약 | 설명 |
|--------|------|------|------|
| id | uuid | PK, DEFAULT gen_random_uuid() | 템플릿 고유 ID |
| channel_type | text | NOT NULL, UNIQUE | 매체 타입 |
| utm_source_pattern | text | | utm_source 템플릿 패턴 |
| utm_medium_pattern | text | | utm_medium 템플릿 패턴 |
| utm_campaign_pattern | text | | utm_campaign 템플릿 패턴 |
| utm_content_pattern | text | | utm_content 템플릿 패턴 |
| utm_term_pattern | text | | utm_term 템플릿 패턴 |
| updated_at | timestamptz | DEFAULT now() | 수정일시 |

**인덱스:**
- `utm_templates_channel_idx` (channel_type) UNIQUE

**RLS 정책:**
- SELECT: 모든 인증된 사용자 조회 가능
- INSERT/UPDATE/DELETE: 관리자만 가능 (향후 구현)

**기본값 (v1.0):**
- 모든 템플릿은 초기값이 비어있음
- 템플릿이 없으면 기본 규칙 적용:
  - utm_source: channel_type (소문자)
  - utm_medium: channel_type (소문자)
  - utm_campaign: campaign_name (소문자, 공백을 언더스코어로 변환)

---

### 9.2 ERD

```
users (1) ──< (N) campaigns
campaigns (1) ──< (N) campaign_channels
utm_templates (1) ──< (N) campaign_channels (channel_type로 연결)
```

---

### 9.3 마이그레이션 SQL

```sql
-- campaigns 테이블
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT campaigns_date_check CHECK (end_date >= start_date)
);

CREATE INDEX campaigns_user_created_idx ON public.campaigns(user_id, created_at DESC);

-- campaign_channels 테이블
CREATE TABLE IF NOT EXISTS public.campaign_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel_type text NOT NULL,
  landing_url text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  final_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX campaign_channels_campaign_idx ON public.campaign_channels(campaign_id, created_at DESC);
CREATE INDEX campaign_channels_type_idx ON public.campaign_channels(channel_type);

-- utm_templates 테이블
CREATE TABLE IF NOT EXISTS public.utm_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type text NOT NULL UNIQUE,
  utm_source_pattern text,
  utm_medium_pattern text,
  utm_campaign_pattern text,
  utm_content_pattern text,
  utm_term_pattern text,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX utm_templates_channel_idx ON public.utm_templates(channel_type);

-- RLS 활성화
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.utm_templates ENABLE ROW LEVEL SECURITY;

-- RLS 정책 (예시)
-- campaigns SELECT 정책
CREATE POLICY "campaigns_select_own"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- campaign_channels SELECT 정책
CREATE POLICY "campaign_channels_select_own"
  ON public.campaign_channels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_channels.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- utm_templates SELECT 정책 (모든 인증 사용자)
CREATE POLICY "utm_templates_select_all"
  ON public.utm_templates
  FOR SELECT
  TO authenticated
  USING (true);
```

---

## 10. API Spec

### 10.1 POST /api/campaigns

**설명:** 새로운 캠페인을 생성합니다.

**요청:**

```json
{
  "campaign_name": "2025 봄 프로모션",
  "start_date": "2025-03-01",
  "end_date": "2025-03-31"
}
```

**응답 (성공):**

```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "campaign_name": "2025 봄 프로모션",
    "start_date": "2025-03-01",
    "end_date": "2025-03-31",
    "user_id": "user-uuid",
    "created_at": "2025-01-11T10:00:00Z",
    "updated_at": "2025-01-11T10:00:00Z"
  }
}
```

**응답 (에러):**

```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "캠페인 이름은 필수입니다.",
  "errors": {
    "campaign_name": "필수 필드입니다."
  }
}
```

**에러 코드:**
- `VALIDATION_ERROR`: 입력값 검증 실패
- `DATE_INVALID`: 종료일이 시작일보다 이전
- `UNAUTHORIZED`: 인증되지 않은 사용자

**상태 코드:**
- 201: 생성 성공
- 400: 검증 실패
- 401: 인증 실패
- 500: 서버 오류

---

### 10.2 GET /api/campaigns/:id

**설명:** 캠페인 상세 정보를 조회합니다.

**요청:** 경로 파라미터 `id`

**응답 (성공):**

```json
{
  "ok": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "campaign_name": "2025 봄 프로모션",
    "start_date": "2025-03-01",
    "end_date": "2025-03-31",
    "user_id": "user-uuid",
    "created_at": "2025-01-11T10:00:00Z",
    "updated_at": "2025-01-11T10:00:00Z",
    "channels": [
      {
        "id": "channel-uuid",
        "channel_type": "meta",
        "landing_url": "https://example.com/landing",
        "final_url": "https://example.com/landing?utm_source=meta&utm_medium=meta&utm_campaign=2025_spring_promotion",
        "created_at": "2025-01-11T10:30:00Z"
      }
    ]
  }
}
```

**응답 (에러):**

```json
{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "캠페인을 찾을 수 없습니다."
}
```

**에러 코드:**
- `NOT_FOUND`: 캠페인을 찾을 수 없음
- `FORBIDDEN`: 접근 권한 없음
- `UNAUTHORIZED`: 인증되지 않은 사용자

**상태 코드:**
- 200: 조회 성공
- 401: 인증 실패
- 403: 권한 없음
- 404: 찾을 수 없음
- 500: 서버 오류

---

### 10.3 POST /api/campaigns/:id/channels

**설명:** 캠페인에 매체를 추가하고 UTM을 생성합니다.

**요청:**

```json
{
  "channel_type": "meta",
  "landing_url": "https://example.com/landing",
  "custom_content": "ad_001",
  "custom_term": "spring_sale"
}
```

**응답 (성공):**

```json
{
  "ok": true,
  "data": {
    "id": "channel-uuid",
    "campaign_id": "550e8400-e29b-41d4-a716-446655440000",
    "channel_type": "meta",
    "landing_url": "https://example.com/landing",
    "utm_source": "meta",
    "utm_medium": "meta",
    "utm_campaign": "2025_spring_promotion",
    "utm_content": "ad_001",
    "utm_term": "spring_sale",
    "final_url": "https://example.com/landing?utm_source=meta&utm_medium=meta&utm_campaign=2025_spring_promotion&utm_content=ad_001&utm_term=spring_sale",
    "created_at": "2025-01-11T10:30:00Z",
    "updated_at": "2025-01-11T10:30:00Z"
  }
}
```

**응답 (에러):**

```json
{
  "ok": false,
  "code": "VALIDATION_ERROR",
  "message": "랜딩 URL이 유효하지 않습니다.",
  "errors": {
    "landing_url": "유효한 URL 형식이 아닙니다."
  }
}
```

**에러 코드:**
- `VALIDATION_ERROR`: 입력값 검증 실패
- `CAMPAIGN_NOT_FOUND`: 캠페인을 찾을 수 없음
- `FORBIDDEN`: 접근 권한 없음
- `TEMPLATE_NOT_FOUND`: 템플릿을 찾을 수 없음 (기본값 사용)

**상태 코드:**
- 201: 생성 성공
- 400: 검증 실패
- 401: 인증 실패
- 403: 권한 없음
- 404: 캠페인을 찾을 수 없음
- 500: 서버 오류

---

### 10.4 POST /api/campaigns/:id/channels/:channelId/utm

**설명:** 기존 매체의 UTM을 재생성합니다. (선택적 기능)

**요청:**

```json
{
  "landing_url": "https://example.com/new-landing",
  "custom_content": "ad_002",
  "custom_term": null
}
```

**응답 (성공):**

```json
{
  "ok": true,
  "data": {
    "id": "channel-uuid",
    "final_url": "https://example.com/new-landing?utm_source=meta&utm_medium=meta&utm_campaign=2025_spring_promotion&utm_content=ad_002",
    "updated_at": "2025-01-11T11:00:00Z"
  }
}
```

**응답 (에러):** 위와 동일

**상태 코드:**
- 200: 업데이트 성공
- 400: 검증 실패
- 401: 인증 실패
- 403: 권한 없음
- 404: 매체를 찾을 수 없음
- 500: 서버 오류

---

## 11. Future Enhancements

### Phase 2 (향후 계획)

1. **템플릿 관리 UI**
   - 관리자 페이지에서 템플릿 CRUD
   - 템플릿 미리보기 기능
   - 템플릿 버전 관리

2. **캠페인 템플릿/프리셋**
   - 자주 사용하는 캠페인 구조 저장
   - 프리셋으로 빠른 캠페인 생성

3. **일괄 URL 생성**
   - Excel 업로드로 여러 URL 한번에 생성
   - 광고그룹별 일괄 생성

4. **URL 클릭 추적**
   - 생성된 URL의 클릭 수 추적
   - 매체별 성과 대시보드

5. **팀 협업 기능**
   - 캠페인 공유
   - 권한 관리 (읽기/쓰기)
   - 댓글 및 알림

6. **GA4 연동**
   - 생성된 UTM과 GA4 데이터 자동 매칭
   - 실시간 성과 대시보드

7. **고급 템플릿 기능**
   - 조건부 템플릿 (날짜, 지역 등)
   - 동적 변수 확장
   - 템플릿 테스트 기능

---

## 12. Appendix

### 12.1 UTM 템플릿 구조 상세

#### 템플릿 패턴 형식

템플릿은 Mustache 스타일의 변수를 사용합니다:

```
{{variable_name}}
```

#### 지원 변수 (v1.0)

| 변수명 | 설명 | 예시 값 |
|--------|------|---------|
| `{{campaign_name}}` | 캠페인 이름 | "2025 봄 프로모션" |
| `{{channel_type}}` | 매체 타입 | "meta", "google", "kakao" |
| `{{adgroup_name}}` | 광고그룹 이름 | (향후) |
| `{{creative_id}}` | 크리에이티브 ID | (향후) |

#### 템플릿 예시

**Meta 템플릿:**
```json
{
  "channel_type": "meta",
  "utm_source_pattern": "meta",
  "utm_medium_pattern": "cpc",
  "utm_campaign_pattern": "{{campaign_name}}",
  "utm_content_pattern": "",
  "utm_term_pattern": ""
}
```

**Google 템플릿:**
```json
{
  "channel_type": "google",
  "utm_source_pattern": "google",
  "utm_medium_pattern": "cpc",
  "utm_campaign_pattern": "{{campaign_name}}",
  "utm_content_pattern": "",
  "utm_term_pattern": ""
}
```

**Kakao 템플릿:**
```json
{
  "channel_type": "kakao",
  "utm_source_pattern": "kakao",
  "utm_medium_pattern": "cpc",
  "utm_campaign_pattern": "{{campaign_name}}",
  "utm_content_pattern": "",
  "utm_term_pattern": ""
}
```

#### 템플릿 처리 로직

1. 템플릿 조회: `channel_type`으로 `utm_templates` 테이블에서 조회
2. 변수 치환: Mustache 변수를 실제 값으로 치환
3. 기본값 처리: 템플릿이 없거나 패턴이 비어있으면 기본 규칙 적용
4. 사용자 입력 우선: `custom_content` 또는 `custom_term`이 있으면 해당 값으로 덮어쓰기

#### 기본 규칙 (템플릿이 없을 때)

```javascript
{
  utm_source: channel_type.toLowerCase(),
  utm_medium: channel_type.toLowerCase(),
  utm_campaign: campaign_name.toLowerCase().replace(/\s+/g, '_'),
  utm_content: custom_content || '',
  utm_term: custom_term || ''
}
```

---

### 12.2 URL 생성 규칙

1. **파라미터 정렬**: 알파벳 순서로 정렬
2. **인코딩**: URL 인코딩 적용 (공백 → %20, 특수문자 인코딩)
3. **중복 제거**: 동일한 파라미터가 있으면 마지막 값 사용
4. **빈 값 처리**: 빈 문자열인 파라미터는 제외

**예시:**
```
랜딩 URL: https://example.com/landing
UTM 파라미터:
  - utm_source: meta
  - utm_medium: cpc
  - utm_campaign: 2025_spring_promotion
  - utm_content: ad_001

최종 URL: https://example.com/landing?utm_campaign=2025_spring_promotion&utm_content=ad_001&utm_medium=cpc&utm_source=meta
```

---

### 12.3 매체 타입 정의

| 매체 타입 | 값 (channel_type) | 설명 |
|-----------|-------------------|------|
| Meta | `meta` | Meta (Facebook, Instagram) 광고 |
| Google | `google` | Google Ads |
| Kakao | `kakao` | 카카오 비즈보드 |
| CRM SMS | `crm_sms` | CRM SMS 발송 |
| CRM LMS | `crm_lms` | CRM LMS 발송 |
| CRM Kakao | `crm_kakao` | CRM 카카오톡 발송 |
| TikTok | `tiktok` | TikTok 광고 |
| 기타 | `other` | 기타 매체 |

---

**작성 완료일:** 2025-01-11  
**검토 예정일:** 2025-01-15  
**개발 시작 예정일:** 2025-01-20

