# PRD_Start_Campaign_v1.1

## 1.Purpose
기업들은 매년 수많은 캠페인을 진행하지만, 담당자마다 캠페인명을 제각각 작성해 규칙이 달라 관리와 분석이 어렵다.
Start MKTG의 Start Campaign의 서비스는 전세계 모든 캠페인을 규칙화된 이름과 구조로 저장해 브랜드&회사 단위 캠페인 관리와 데이터 조회 효율을 극대화하는 것을 목표로 한다.
Start Campaign은 상위 개념이며, 하나의 캠페인 아래 여러 Start Media가 연결될 수 있다.
Start Media는 광고 매체 선택, 판매채널 선택, UTM 자동 생성 기능 등을 포함하며 캠페인 생성 이후에 생성된다.
캠페인명 표준화는 브랜드 단위의 데이터 분석 구성과 UTM 생성 자동화의 기반이 된다.


## 2.핵심 개념
Start Campaign은 '날짜 + 캠페인명' 조합을 캠페인의 고유 식별자로 사용한다.
즉, 캠페인명 자체는 매년 같아도 되며, 시스템은 아래 규칙으로 고유성을 판단한다.

rawName → 사용자가 입력한 원본 이름  
normalizedName → 영어 소문자 기반 정규화된 이름  
finalCampaignName → YYMMDD + normalizedName으로 구성된 최종 비즈니스 식별자

finalCampaignName = YYMMDD_normalizedName

예:
  - 251201_blackfriday
  - 261130_blackfriday
두 캠페인은 이름은 같아도 캠페인 시작 날짜가 다르기 때문에 서로 다른 캠페인으로 인정된다. 


## 3.주요 기능 개요
### 3-1. 캠페인 생성
사용자가 캠페인을 생성할 때 다음 규칙을 따른다.
1. rawName은 한글 또는 영어 모두 입력 가능
2. 사용자가 한글로 입력할 경우
  - 자동으로 영어 번역
  - 번역 후 영어 후보명 추천
  - 중복 여부 체크 후 사용 가능한 이름만 선택 가능
3. 캠페인 시작일은 필수값
4. 캠페인 종료일은 선택값
5. finalCampaignName은 다음 규칙을 따른다.
  - YYMMDD_영문캠페인명
  - 예시 : 251201_blackfriday
6. 동일 brandId 내에서 finalCampaignName은 반드시 유일해야 한다


### 3-2. Translation Layer
번역 후보 생성은 rawName -> 영어 번역 -> normalizedName 후보 생성 순서로 이루어지며, 자동 번역 품질을 위해 번역 API(예: Google/DeepL/LLM)는 추후 실제 서비스 단계에서 적용될 수 있다.

한글 rawName 입력 시 normalizedName을 생성하기 위한 Translation Layer는 아래 단계를 따른다.
1) 영어 여부 판단
  - rawName이 영어/숫자로만 구성되면 번역을 수행하지 않고 바로 normalize 처리한다.

2) 커스텀 사전 매핑 체크
  - 사전 매핑이 존재할 경우 해당 매핑 결과를 우선 사용한다.
  - 매핑 관리 기능은 Admin 페이지에서 제공한다.
  예 : 블랙프라이데이 -> black friday, 광군제 -> singles day

3) 번역 API 또는 mock 번역 수행
  - 매핑이 없는 경우 rawName 전체 문장을 번역한다.
  - 예: 여름세일 -> "summer sale", 빼빼로데이 -> "pepero day"

4) 번역 결과를 기반으로 normalizedName 후보를 3~5개 생성한다.
  - 공백 -> underscore : summer_sale
  - 공백 제거 : summersale

5) 모든 후보명을 lowercase 처리하고, 특수문자 제거 규칙을 따른다.

6) 후보명은 UI에서 버튼 리스트로 제공되고, 사용자가 선택한 후보가 normalizedName으로 확정된다.



## 4. 사용자 시나리오 (Flow)
시나리오 A - 영어로 캠페인명 입력
1. 사용자에게 Input에 영어로 캠페인명 입력
2. normalize 진행
3. 캠페인 시작일 선택
4. finalCampaignName 생성
5. 중복체크
6. 생성

시나리오 B -  한글로 캠페인명 입력
1. 한글 감지
2. 영어 자동 번역 후보 2~3개 제안
3. 사용자가 하나 선택
4. normalize 진행
5. 시작일 선택
6. finalCampaignName 생성
7. 중복체크
8. 생성

## 5. 입력값 및 처리
### 5.1 입력 필드
| 항목 | 타입 | 필수 | 설명 |
|------|-------|------|--------------------------------------------------------------|
| campaignId        | string | Y | DB에서 사용하는 고유 ID(UUID), 사용자가 변경 불가 |
| rawName           | string | Y | 사용자가 입력한 캠페인명, 한글 또는 영어 입력 가능 |
| normalizedName    | string | Y | 영어로 자동 변환한 캠페인명, 소문자, 특수문자 제거, 스페이스는 _ |
| finalCampaignName | string | Y | startDate + normalizedName 조합으로 생성된 최종 캠페인명 |
| startDate         | date | Y | YYYY-MM-DD 입력, YYMMDD 변환하여 finalCampaignName 생성 |
| endDate           | date | N | 선택값 |
| brandId           | string | Y | 해당 캠페인이 속한 브랜드 ID |
| creatorUserId     | string | Y | 캠페인을 생성한 사용자 ID |
| createdAt         | datetime | Y | 캠페인 생성 시간, 자동 기록 |
| updatedAt         | datetime | Y | 캠페인 변경 시간, 자동 업데이트 |


### 5.2 저장 규칙 상세 설명
1) campaignId
- 시스템에서 자동 생성되는 UUID
- 사용자는 수정 불가
- 캠페인이름이 나중에 변경되어도 campaignId는 변하지 않음
-> 안정적인 식별자로 사용됨

2) rawName
- 사용자가 입력한 원본 이름
- 한글 또는 영어 모두 입력 가능
- 예: '블랙프라이데이'

3) normalizedName
- normalizedName은 rawName을 영어 소문자로 정규화한 값이며, finalCampaignName의 핵심 구성 요소로 사용된다.
- 영어 소문자만 허용
- 한글이면 자동 번역 후 normalize
- 규칙
  - 소문자
  - 공백은 _로 변경
  - 특수문자 제거
  - 숫자는 그대로 유지하며, 문자+숫자 조합은 언더스코어로 구분하지 않는다
  - 반드시 소문자 영어(a-z)로 시작해야 한다
  - ※ normalizedName에서는 underscore(_)만 사용하며, hyphen(-)은 사용하지 않는다.

- 예: 
  - '블랙프라이데이' -> blackfriday
  - 'Summer Sale Event' -> summer_sale_event
  - "여 름 세 일" -> "여"는 한글이므로 번역 후 -> summer_sale
  - "Black Friday Sale" -> black_friday_sale

4) finalCampaignName
- 최종 저장되는 실제 캠페인명
- 규칙  : finalCampaignName = YYMMDD_normalizedName
- 예 :
  - startDate : 2025-12-01
  - normalizedName : blackfriday
  - 251201_blackfriday
이 값이 DB에서 조회, 분석, UI 표시 등 모든 기준이 됨.
- rawName 또는 startDate가 변경되면 finalCampaignName은 자동으로 재생성된다.


5)  중복 체크 정책
- 동일 brandId 내에서 finalCampaignName이 같으면 중복
- finalCampaignName이 다르면 같은 normalizedName이어도 생성 가능


6) creatorUserId
- 캠페인을 누가 생성했는지 기록
- 브랜드 내부 감사 및 기록용


7) createdAt, updatedAt
- createdAt: 최초 생성 시간
- updatedAt: rawName 또는 normalizedName이 변경될 때마다 갱신
- finalCampaignName도 startDate나 캠페인명이 변경되면 자동 새로 생성된다.


## 6. UI 요구사항
### 6-1. 전체 UI 방향성
- UI는 최대한 심플하고 깔끔하고 쉽게 사용할 수 있어야 한다.
- 한 화면에서 핵심 필드만 보이고, 불필요한 옵션이나 설명은 최소화한다.
- 사용자가 첫 방문 시에도 별도 설명 없이 캠페인 생성 플로우를 이해할 수 있어야 한다.
- 캠페인 생성 후 Start Media 단계로 연결되는 버튼을 명확하게 제공하여 다음 작업으로 자연스럽게 이동할 수 있어야 한다.

### 6-2. 화면 구조
- Start Campaign 생성 화면은 단일 컬럼 레이아웃을 기본으로 한다.
- 필수 입력 필드 위주로 위에서 아래로 순차적으로 배치한다.
  - 캠페인명 (rawName) 입력 필드
  - 캠페인 시작일 (startDate) date picker
  - 캠페인 종료일 (endDate) date picker, 선택값
- 최초 생성될 finalCampaignName은 필드 하단 또는 우측에 미리보기 형태로 노출한다.
  - 예시 텍스트 : "최종 캠페인명 미리보기 : 251201_blackfriday"

### 6-3. 입력 UX
- rawName 입력 필드에는 플레이스홀더로 예시를 제공한다
- 예: 블랙프라이데이, 가을 정기세일
- 영어로 입력할 경우, 실시간으로 normalizedName과 finalCampaignName을 미리 생성해 보여준다.
- 한글로 입력할 경우, 번역 결과를 모달 또는 드롭다운으로 간단히 보여주고, 사용자가 한 번에 선택할 수 있게 한다.
- 사용자가 선택한 영어 이름은 normalizedName으로 즉시 반영하고, finalCampaignName 미리보기도 함께 갱신한다.

### 6-4. 검증 및 에러 표시
- 필수값 누락, 날짜 형식 오류, 중복된 finalCampaignName 등은 페이지 이동 없이 인라인으로 에러 메시지를 보여준다.
- 에러 메시지는 짧고 명확하게 작성한다.
  - 예: "캠페인 시작일은 필수값입니다"
  - 예: "해당 브랜드에서 이미 사용 중인 캠페인명입니다"
- 최종 저장 버튼은 필수값과 중복 체크가 모두 통과된 경우에만 활성화한다.

### 6-5. 피드백 및 완료 상태
- 캠페인 생성 성공 시, 상단 또는 중앙에 간단한 성공 메시지를 표시한다.
  - 예 : "캠페인이 생성되었습니다"
- 생성된 finalCampaignName을 바로 복사할 수 있는 버튼을 제공한다.
  - 예 : "251201_blackfriday 복사" 버튼
- 캠페인 생성 이후에는
  - "Start Media 만들기" 버튼을 한 번에 보이도록 배치해 다음 단계로 자연스럽게 이동할 수 있게 한다.

### 6-6 접근성 및 일관성
- 모든 라벨과 버튼 문구는 한글 기준으로 통일한다.
- 버튼 스타일, 입력 필드 스타일, 에러 메시지 스타일은 Start MKTG 전체 서비스에서 사용하는 공통 UI 규칙을 따른다.
- 모바일 환경에서도 한 화면에서 주요 입력이 가능하도록 여백과 폰트 크기를 조정한다.