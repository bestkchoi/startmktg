# 1. Purpose
StartMKTG Tower는 브랜드/기업을 Company 단위로 운영하고,
Company 내부의 조직 구조와 권한을 역할(Role) 기반 계층 구조로 관리하는 중앙 관제 시스템이다.
Tower는 Company 단위 표준 데이터를 기반으로 브랜드, 사용자 권한, Pro 커스텀, Global Media, Objective, Landing Channel, Global UTM Rule 등 StartMKTG 전체 생태계를 결정하는 모든 데이터를 관리한다.

Tower는 StartMKTG 내부 운영자 전용 시스템이며, 고객사(브랜드)에서는 접근할 수 없다.

# 2. Core Concepts
## 2.1 Company
StartMKTG에서 운영되는 기업/브랜드 전체를 의미한다.
Company는 단일 Workspace이며 아래 모든 역할이 Company에 소속된다.
Company는 국가 + 사업자번호 조합으로 유일성을 가진다.
예 : 
  - 무신사
  - 쿠팡
  - 유니레버

## 2.2 Role (역할 정의)
Company 내부에서 사용자의 권한과 조직 위치를 결정하는 단위
Role은 Level(1~5)과 parent_role_id로 설정한다.


## 2.3 Level (권한 등급 1~5)
StartMKTG 역할의 "권한 세기"를 숫자+이름으로 표현한다.

| Level             | 권한 수준                     |
| ------------------| ------------------------------|
| LV5 Global Master | 최상위 권한, 전체 제어        |
| LV4 HQ Admin      | 글로벌 본사 관리자            |
| LV3 Branch Admin  | 국가 지사/디스트리뷰터 관리자 |
| LV2 Operator      | 실무자 및 대행사 담당         |
| LV1 Viewer        | 조회만 가능                   |

LV 숫자가 클수록 권한이 강함

## 2.4 Role Tree (조직 계층 구조)
각 Role은 parent_role_id로 계층이 결정된다.

LV5 Global Master
   └─ LV4 HQ Admin
         ├─ LV3 Branch Admin (KR)
         ├─ LV3 Branch Admin (JP)
         └─ LV3 Branch Admin (VN, Distributor)
               └─ LV2 Agency Operator (KR)


## 2.5 Membership
사용자(User)와 역할(Role)의 연결.
Membership은 '이 사용자가 이 회사에서 어떤 역할을 활동하는지'를 의미한다.



# 3. Authentication and Access
## 3-1. Personal Authentication = Google OAuth Only
StartMKTG Google OAuth로만 로그인 가능하다.
별도의 회원가입, 비밀번호 없이 개인 Google 계정만 사용한다.
StartMKTG는 Google OAuth Only로 로그인한다.
Gmail.com 또는 회사 Google Workspace 이메일 모두 사용 가능하다.
StartMKTG는 별도 비밀번호를 보관하지 않는다.


## 3-2. Company Access Authorization (Company 접근은 별도 승인 필요)
Google 로그인만으로 Company 접근 불가
Company 접근은 다음 중 하나로 부여된다.
1. Invitation 초대 링크
2. Access Request 승인
3. Tower Operator 수동 부여

초대 이메일과 로그인 이메일이 달라도 초대 수락 가능 (Meta BM 동일 방식)


## 3-3. Tower Operator Authorization
Tower Admin 접근 권한은 Company 내부 Role(LV1~LV5)와 별도로 운영된다.
STARTMKTG 내부 운영자는 Tower Operator로 설정되며, Tower 전체 기능에 접근 할 수 있다.

- Tower Operator: Tower Admin 전체 기능 접근 가능
- Tower Viewer (선택) : Read-only 접근
- 일반 사용자는 Tower에 접근할 수 없음
- company Role(LV1~LV5)은 Tower 접근 권한에 영향을 주지 않음

# 4. Tower Responsibilities
Tower Operator는 다음 기능을 수행한다.

## 4-1. Company 관리
- Company 생성 요청 검토
- Company 생성 (승인 후)
- country + business_number 중복 검사
- 기본 Role Tree 자동 생성
- Company 정보 수정
- 역할 이동, 구조 변경

## 4-2. Role Tree 관리
- Role 생성
- Role 편집
- Tree 구조(Parent 변경)
- parent_role_id로 Tree 관리
- Level(LV1~LV5) 설정
- region(KR, JP, VN) 설정
- permissions 변경
- Role 비활성화

## 4-3. Membership 관리
- 사용자 초대
- 초대 취소, 재전송
- Access Request 승인/거절
- Role 변경
- Role 제거(비활성화)
- 사용자 상태 변경

## 4-4. Platform Standard Data 관리
Company 단위로 운영되는 표준 데이터
- Landing Channels
- Media
- Objectives
- UTM Rules (utm_source, utm_medium, utm_id, 층위 규칙 관리)
- Custom Rules (Pro Account 가능)

## 4-5. Monitoring
- Start Campaign Logs
- Start Media Logs
- 회사별 사용량
- 초대, 승인 로그
- 시스템 오류 로그


# 5. Information Architecture
/tower
  /companies
     /[companyId]
        /profile
        /roles
        /members
        /invitations
        /access-requests
        /platform
           /media
           /landing-channels
           /objectives
           /utm-rules
           /custom-rules
        /logs


# 6. Feature Specifications

## 6-1. Company Management
### 6-1-1. Company Creation Request
사용자 제출 필드:
- company_name
- country
- business_number
- industry
- domain
- request_note (회사 생성 요청 이유, 상황 설명)

예: 
  - "한국지사 먼저 사용 시작, HQ는 추후 연동 예정"
  - "우리는 베트남 공식 디스트리뷰터입니다"

Tower Operator 검증:
- country + business_number 유니크 검사
- request_note 내용 확인
- 설정 정보 정상 여부 확인

승인 후 작동 동작:
- Company 생성
- 기본 Role Tree 생성
  - LV5 Global Master (Tower 소유)
  - LV4 HQ Admin (요청자에게 부여)
- membership 생성

### 6-1-2. Direct Company Creation (Tower Admin Only)
Tower Admin 내부 운영자가 사용자 요청 없이 Company를 직접 생성할 수 있어야 한다.

목적
- 신규 고객사 온보딩 용도
- 테스트용 Company 생성
- 파트너사 또는 내부 운영용 Company 생성
- 외부 요청 없이 빠른 셋업 필요 시 활용

기능 요구사항
1. Tower Admin 화면의 "새 Company 생성" 버튼을 통해 바로 생성 가능
2. 필수 입력값
  - company_name
  - country
  - business_number(국가별 포맷 검증 적용)
3. 생성 즉시 Company 활성화
4. 기본 Role Tree 자동 생성
5. membership 생성 없이 Owenr는 비어있는 상태(null) 허용
6. 추후 실제 사용자에게 소유권 이전 가능 (owner_assignment 기능 별도 스펙 예정)

검증 규칙
- country + business_number 유니크 조건 동일 적용
- 입력값 정상 여부 검사
- 잘못된 형식일 경우 생성 불가

Audit Log
다음 정보가 log에 저장되어야 한다.
- creatd_by (tower_operator_id)
- company_id
- 생성 시간
- 초기 설정 값


## 6-2. Role Management
### 6-2-1. Role 속성 정의
role_name
display_name
level (LV1~LV5)
parent_role_id
region
permissions (json)
is_active


### 6-2-2. Role 생성 규칙
- parent 역할의 LV는 자식 LV보다 높아야 함
- LV5는 parent_role_id가 없어야 함
- parent_role.level > role.level 이어야 한다
- LV5는 parent_role_id가 없어야 한다



### 6-2-3. Role Tree 편집
- Drag & Drop
- parent 설정 변경
- region 변경
- permissions 수정 가능


## 6-3. Membership Management
### 6-3-1. Invitation
invite_email
role_id
region
expires_at
request_note(optional)


### 6-3-2. Access Request
- 사용자가 특정 Role에 접근 요청
- LV4 이상의 유저가 LV3, LV2, LV1 승인
- LV3 Branch Admin은 LV2, LV1 승인 가능


### 6-3-3. Role 변경 규칙
- LV 높은 사람이 LV 낮은 사람의 Role 변경 가능
- LV 동일한 경우 변경 불가
- Role 변경 시 parent_role.level > role.level 조건을 만족해야 한다


## 6-4. Platform Data Management
### 6-4-1. Landing Channels
- 생성
- 수정
- 비활성화

### 6-4-2. Media
- 생성
- 수정
- 비활성화


### 6-4-3. Objectives
- Media 종속
- 생성, 수정
- 비활성화


## 6-5. Monitoring
Tower에서는 Company 단위로 다음 로그를 조회할 수 있다.

- Start Campaign Logs
  - 캠페인 생성, 수정 이력
  - 어떤 사용자가 언제 어떤 캠페인을 만들었는지 기록

- Start Media Logs
  - Media, Objectives, Landing Channel 설정 변경 이력
  - 규칙 변경, 비활성화, 생성 이력

- UTM Generator Logs
  - UTM 생성 요청 이력, 출력 결과

- UTM Checker Logs
  - URL 검사, 파싱 결과, 유효 여부

- Error Logs
  - 시스템 에러 코드, 메시지, 발생 위치, 발생 시각


### 6-5-1. Error Logs
error_code
message
origin
timestamp


# 7. Database Schema
## 7-1. company
id (PK)
company_name
country
business_number
domain
industry
request_note
created_by
created_at

UNIQUE(country, business_number)


## 7-2. company_roles
id (PK)
company_id (FK)
role_name
display_name
level (1~5)
parent_role_id (nullable)
region (nullable)
permissions jsonb
is_active boolean
created_at

## 7-3. company_memberships
id (PK)
company_id
user_id
role_id
status (active, suspended)
created_at


## 7-4. Users
id (PK)
google_sub_id
email
name
photo_url
created_at


## 7-5. Invitation
id
company_id
invite_email
role_id
region
token
expires_at
request_note (optional)
status
created_at


## 7-6. access_requests
id
company_id
user_id
requested_role_id
region
request_note
status
created_at


# 8. Development Order
Phase1 - Auth
- Google OAuth Only
- user 테이블

Phase2 - Company
- Company 생성 요청
- business_number 유니크 검증
- Company 생성 기능
- 기본 Role Tree 생성

Phase 3 - Role Tree
- Role 생성
- Role 편집
- Level(LV1~LV5) 적용

Phase 4 - Membership
- Invitation
- Access Request
- Role 변경

Phase 5 - Platform Data
- Media
- Objectives
- Landing Channels
- UTM Rules

Phase 6 - Monitoring
- Start Campaign Logs
- Start Media Logs
- UTM Generator Logs 
- UTM Checker Logs
- Error Logs


# 9. UI / UX
# 9-1. Company Creation UI / UX
1) 메인화면
경로 : /tower/companies/creation

구성 요소:
- 페이지 타이틀 : Tower Admin
- 서브텍스트 : StartMKTG 중앙 관제 시스템
- 우측 상단 버튼 : 새 Company 생성 (Create Company)
- Companies 리스트
  - company_name
  - country
  - business_number
  - created_at
  - status (active)
빈 상태(empty state):
- "등록된 Company가 없습니다. 새 Company를 생성해주세요."

UX 원칙:
- 관리자(Tower Admin)에게만 "새 Company 생성" 버튼 표시
- 일반 사용자는 리스트만 조회 가능


2) Company 생성 모달/페이지
UI 요소

폼 입력 필드:
- Company Name (텍스트, 필수)
- Country (드롭다운, 필수)
- Business Number (텍스트, 필수, 국가별 format validation)
- Industry (텍스트 또는 드롭다운)
- Domain (텍스트)
- Request Note
  - Company Creation Request인 경경우: 표시
  - Direct Creation 일 경우: 숨김 또는 optional

버튼:
- 취소
- 생성(Create)

에러 처리:
- 중복된 country + business_number일 경우 즉시 에러 표시
- 필수값 누락 시 생성 버튼 비활성화

성공 시 동작:
- Company 생성 후 리스트 페이지로 리다이렉트
- 상단 Toast 메시지
  - "Company가 성공적으로 생성되었습니다."


3) Direct Creation 모드 UI (관리자 전용)
Direct Creation일 때 표시되는 조건:
- Request Note 필드 자동 숨김 또는 optional 처리

Form 변화:
- Request Note 숨김
- Owner 값이 비어있는 상태(null)로 생성됨
- 생성 후 시스템 로그에 created_by 저장


4) UX Flow
1. Tower Admin이 /tower/companies 진입
2. "새 Company 생성" 클릭
3. Company 생성 모달 열림
4. 필수 필드 입력
5. 유니크 값 실시간 검증
6. 생성 버튼 클릭
7. 성공 시 리스트로 이동
8. 기본 Role Tree 자동 생성
9. Audit Log 기록


5) Future UI 확장 고려
향후 추가될 기능을 고려하여 아래 UI 슬롯 확보 필요:
- Owner Assignment (사용자에게 소유권 넘기기)
- Company Status (active, suspended)
- Company 삭제(비활성화) 기능
- Role Tree 자동 매핑 룰 표시
- 국가별 비즈니스 넘버 포맷 힌트(placeholder)