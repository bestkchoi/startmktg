# 1.문서 정보
- 문서명 : PRD_UTM_Checker PRD
- 버전 : v1.2
- 작성일 : 2025-11-24
- 적용 페이지 : /kr/utm-checker


# 2.목적
사용자가 랜딩페이지 URL을 입력하면 UTM 파라미터와 광고 플랫폼 자동 파라미터를 분석하고,
기본적인 진단 결과를 제공하는 간단한 분석 도구를 제공합니다.
그리고 마케팅 초보자들을 위해서 구글애널리틱스4에서 어떻게 수집되는지 쉽게 확인할 수 있도록 미리보기도 제공합니다.
또한 사용자가 입력한 URL과 분석 결과를 Supabase에 저장하여, 서비스 사용량 분석을 위해 입력 URL 로그를 저장합니다.


# 3. 서비스 범위
포함되는 범위
- URL 파싱
- UTM 파라미터 추출
- 광고 플랫폼 자동 파라미터 추출
- 분석 결과 표시 (테이블 형식)
- 기본 진단 체크 (누락, 이상값 확인)
- 입력 URL 및 분석 결과 DB 저장
- KR 언어 버전으로 먼저 제공
- URL구조 /kr/utm-checker 기반

제외되는 범위
- UTM 생성 기능
- Start Campaign, Start Media와의 연동
- 다국어 UI (추후 확장)
- 진단 알고리즘 고도화 (추후 버전)


# 4. 주요 기능 정의
## 4-1. URL 입력 기능
- 사용자가 URL을 입력할 수 있는 입력창 1개
- 입력값을 엔터 또는 버튼으로 제출
- 제출 시 URL 유효성 검사
  - http, https 허용
  - querystring 여부와 무관하게 파싱 지원

## 4-2. 파라미터 추출 기능

1) UTM 기본 6종

| Key          | 설명                | 도구             |
| ------------ | ------------------- | ---------------- |
| utm_source   | 필수값, 트래픽 출처 | 구글애널리틱스   |
| utm_medium   | 필수값, 마케팅 매체 | 구글애널리틱스   |  
| utm_campaign | 캠페인명            | 구글애널리틱스   | 
| utm_id       | 캠페인 ID           | 구글애널리틱스   | 
| utm_content  | 소재 구분           | 구글애널리틱스   |  
| utm_term     | 키워드              | 구글애널리틱스   | 


2) 광고 플랫폼 자동 파라미터
| 광고 플랫폼     | 파라미터                                          | 설명             |
| --------------- | ------------------------------------------------- | -------------- |
| Google Ads      | gclid                                             | 자동 태그          |
| Google Ads      | srsltid                                           | 검색 리다이렉션       |
| Meta Ads        | fbclid                                            | 자동 태그          |
| TikTok Ads      | ttclid                                            | 자동 태그          |
| Naver Ads       | n_media, n_campaign, n_keyword, n_source, n_query | 검색 광고 관련       |
| Kakao Ads       | k_campaign, k_media, k_keyword 등                  | 광고 플랫폼 기본 파라미터 |


3) Naver Search Ads 파라미터



## 4-3. GA4 수집 미리보기 기능
- 파싱된 UTM 값을 바탕으로 GA4 이벤트 수집 화면 예시를 제공
- 보여주는 정보
  - source / media
  - session_campaign
  - content
  - term




# 5. 진단 로직 정의
## 5-1. 필수값 체크
- utm_source 누락 -> warning
- utm_medium 누락 -> warning

## 5-2. 포맷 체크
- 공백 포함 여부 검사
- 대문자 포함 시 warning
- 특수문자 허용 범위 초과 시 warning

## 5-3. utm_id 체크
- 숫자 또는 영문 조합만 허용
- 이상값 발견 시 warning

## 5-4. 광고 플랫폼 자동 파라미터 체크
- gclid, fbclid "검출만 표시"
- 잘못됨 여부 판단은 하지 않음

---

# 6. 데이터 저장 (Supabase)
테이블명 : utm_checker_logs

컬럼 구조
| 필드명           | 타입             | 설명          |
| ------------- | -------------- | ----------- |
| id            | uuid           | PK          |
| user_id       | uuid, nullable | 로그인 유저 ID   |
| input_url     | text           | 입력받은 전체 URL |
| parsed_params | jsonb          | 파싱된 파라미터 전체 |
| diagnosis     | jsonb          | 진단 결과       |
| created_at    | timestamp      | 생성시간        |

로그인 하지 않은 경우 user_id는 null로 저장


---
# 7. UI/UX 정의 (초간단 버전)

## 7.1 페이지 구성
- 상단 타이틀 : START MKTG
- 페이지 타이틀 : START MKTG - UTM Checker
- 메인 타이틀 : UTM Checker
- 한 줄 입력폼
- 버튼 : 분석하기
- 결과 박스
  - 파라미터 테이블
  - 진단 결과 리스트
  - 구글애널리틱스4 데이터 수집 미리보기

## 7-2. 기본 와이어프레임
----------------------------------------
UTM Checker

[ https://example.com?utm_source=... ]  [분석하기]

----------------------------------------
파라미터 분석 결과

| GA4 세션     | 수집값            | 수집 도구          |
|--------------|-------------------| ------------------ |
| utm_source   | google            | GA4   |
| utm_medium   | cpc               | GA4   |
| fbclid       | AbCdE...          | Meta               |
...

----------------------------------------
진단 결과
- utm_source: 정상
- utm_medium: 정상
- utm_campaign: 정상상
- utm_id: 누락됨
- utm_content: 누락됨
- utm_term: (검색광고 일경우에만 진단 결과 표시)
- 대문자 없음: 정상
----------------------------------------

# 8. API 스펙 (Next.js App Router)
## 8-1. POST /api/utm-checker
입력받은 URL을 파싱하고, 결과를 저장한 뒤 JSON으로 반환한다.

Request Body
{
  "url": "https://example.com?utm_source=google&utm_medium=cpc"
}

Response
{
  "ok": true,
  "parsed": {
    "utm_source": "google",
    "utm_medium": "cpc",
    "gclid": "12345"
  },
  "diagnosis": {
    "utm_source": "ok",
    "utm_medium": "ok",
    "utm_id": "missing"
  }
}


# 9. 에러 처리

- 입력값 없음 -> { ok: false, message: "URL을 입력해주세요" }
- URL 형태 오류 -> { ok: false, message: "유효한 URL이 아닙니다" }
- 서버 오류 -> { ok: false, message: "잠시 후 다시 시도해주세요" }

