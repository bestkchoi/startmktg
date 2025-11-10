# 🧬 PRD_UTM_Checker_v1.0

## 1. 개요 (Overview)
**서비스명:** Start Marketing – UTM Checker  
**목표:**  
마케터가 랜딩페이지 URL을 입력하면,  
자동으로 **Google Analytics 4(이하 GA4)** 표준 UTM 파라미터를 생성하고,  
형식 오류나 누락을 검증하여 **최종 추적용 URL**을 쉽게 만들 수 있는 서비스.  

**핵심 값:**  
- 광고 링크 생성 시 수작업을 줄이고,  
- UTM 규칙을 표준화하여  
- 마케티북 성과 데이터(GA4, CRM, 광고 플랫폼) 연결을 자동화한다.  

---

## 2. 주요 사용자 (Target User)
| 구분 | 설명 |
|------|------|
| 퍼포머스 마카터 | 캠페인별 UTM을 빠르게 생성 및 검증 |
| 광고운영 담당자 | 매체별 쿼리 파라미터를 검증 |
| CRM 메시지 담당자 | 메시지 발송 시 트래킹 URL 생성 |

---

## 3. 주요 기능 (Key Features)

| 기능명 | 설명 | 출력/동작 결과 |
|---------|------|----------------|
| 1. 랜딩페이지 URL 입력 | 사용자가 원본 URL 입력 | 입력값 실시간 유효성 검증 |
| 2. GA4 표준 UTM 자동 생성 | utm_source, utm_medium, utm_campaign, utm_content, utm_term, utm_source_platform, utm_id 자동 생성 | 자동 완성 및 수정 가능 |
| 3. 매체별 파라미터 감지 | URL 내 fbclid, gclid, n_media 등 자동 탐지 | “Meta Ads 파라미터 감지됨” 등 배지 표시 |
| 4. 결과 미리보기 및 복사 | 완성된 URL 출력, 복사 버튼 제공 | ✅ 버튼 클릭 시 클리프보드 복사 |
| 5. Supabase 로그 저장 | 입력된 URL 및 생성 결과 저장 | fact_utm_log 테이블에 기록 |
| 6. 최근 생성 이력 조회 | 최근 10건 자동 표시 | /api/utm-checker GET |

---

## 4. 데이터 구조 및 데이터 출처

### 4.1 Google Analytics 4 표준 파라미터
GA4 공식 가이드([공식문서](https://support.google.com/analytics/answer/10917952?hl=ko))에 정의된 파라미터.  
Start Marketing의 UTM Checker는 이 항목들을 기본값으로 사용한다.

| 컬럼명 | 타입 | 설명 | 데이터 출처 | 비고 |
|---------|------|------|--------------|------|
| utm_source | text | 트래픽 출처 (google, kakao, naver, meta 등) | **Google Analytics 4** | 필수 |
| utm_medium | text | 마케티북 매체/형식 (cpc, message, banner) | **Google Analytics 4** | 필수 |
| utm_campaign | text | 캠페인 이름 | **Google Analytics 4** | 필수 |
| utm_content | text | 광고 컨텐츠 구분 | **Google Analytics 4** | 선택 |
| utm_term | text | 키워드 | **Google Analytics 4** | 선택 |
| utm_source_platform | text | 광고 플랫폼 명시 (google, meta, naver 등) | **Google Analytics 4** | 개선(GA4 전용) |
| utm_id | text | **캠페인 식별자 (Campaign ID)** – 비용 데이터 매칭용 | **Google Analytics 4** | **대추요** |

---

### 4.2 매체별 커스텀 파라미터
각 매체가 자체적으로 생성하는 파라미터이며 GA4에서 자동 수집하지 않는다.  

| 매체 | 주요 파라미터 키 | 설명 | 데이터 출처 |
|------|------------------|------|--------------|
| Meta (Facebook/Instagram) | fbclid | Facebook Click ID | Meta Ads |
| Google Ads | gclid | Google Click ID | Google Ads |
| Naver Ads | n_media, n_query, n_ad_group, n_campaign, n_rank | 네이버 광고 식별자 | Naver Ads |
| Kakao Ads | k_campaign, k_creative, k_medium, k_keyword | 카카오 광고 식별자 | Kakao Ads |
| Criteo | criteo_p, criteo_c, criteo_r | 리타게팅용 파라미터 | Criteo |

---

### 4.3 데이터베이스 스키마 (Supabase / PostgreSQL)

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

- **GA4 파라미터**: 컬럼 단위로 저장  
- **매체별 파라미터**: `meta_params` jsonb 필드로 통합 저장  
- 후와 `dim_user`, `dim_project` 관계 테이블 추가 예정  

---

## 5. API 설계

| 메서드 | 엔드포인트 | 설명 | 요청 예시 | 응답 예시 |
|--------|-------------|------|------------|------------|
| POST | `/api/utm-checker` | 입력된 URL과 파라미터를 받아 UTM URL 생성 및 저장 | `{ "base_url": "https://startmktg.com", "utm_source": "kakao" }` | `{ "ok": true, "final_url": "https://..." }` |
| GET | `/api/utm-checker/:id` | 특정 기록 조회 | `/api/utm-checker/uuid` | `{ "data": {...} }` |
| GET | `/api/utm-checker` | 최근 10건 조회 | `/api/utm-checker` | `[ {...}, {...} ]` |

---

## 6. 화면 구성 (UI/UX)

### 입력 영역
- Base URL 입력 필드  
- UTM 파라미터 입력 필드 (자동 완성 지원)  
- 선택지 제공: `utm_source`, `utm_medium`은 드롭다운  
- `utm_id`는 수동 입력 또는 자동 생성 옵션

### 결과 영역
- 최종 URL 표시 (복사 버튼 포함)  
- 감지된 매체 배지 표시 (“Google Ads 파라미터 감지됨”)  
- 잘못된 파라미터 시 경고 문구 표시  

### 디자인 가이드
- TailwindCSS 기반  
- 카드형 레이아웃  
- 반응형 (모바일 입력 지원)  
- Copy 버튼 클릭 시 시각적 피드백(“복사됨 ✅”)  

---

## 7. 향후 확장 로드맵 (Future Roadmap)
| 버전 | 개선 내용 |
|------|------------|
| v1.1 | Supabase Auth 연동 (로그인/사용자별 기록 분리) |
| v1.2 | GA4 비용 데이터 매칭 기능 추가 (`utm_id` 활용) |
| v1.3 | 사용자 정의 UTM 템플

