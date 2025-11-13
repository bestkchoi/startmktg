# 🧬 PRD_Member_System_v1.0

## 1. 개요 (Overview)

**서비스명:** Start Marketing – 회원가입 및 인증 시스템  
**목표:**  
퍼포먼스 마케팅 유저들을 위한 Gmail 기반 회원가입 시스템.  
개인용 Gmail로 로그인하고, 회사 광고 시스템 접근 시 회사 도메인 이메일을 별도로 인증받는 방식.

**핵심 가치:**  
- 퍼포먼스 마케터들은 대부분 Google Ads와 Google Analytics를 사용하므로 Gmail 계정을 보유
- 개인 계정과 회사 계정을 분리하여 보안성과 편의성 확보
- 메타(Meta)와 유사한 이중 인증 방식으로 신뢰도 향상

---

## 2. 주요 사용자 (Target User)

| 구분 | 설명 |
|------|------|
| 퍼포먼스 마케터 | Google Ads, GA4 사용자, Gmail 계정 보유 |
| 광고 운영 담당자 | 회사 도메인 이메일을 통한 워크스페이스 접근 필요 |
| 팀 리더/관리자 | 팀원 초대 및 권한 관리 필요 |

---

## 3. 인증 방식 설계

### 3.1 1차 인증: 개인용 Gmail 로그인

**요구사항:**
- Gmail 계정만 회원가입 가능 (`@gmail.com` 도메인만 허용)
- Google OAuth 2.0을 통한 소셜 로그인
- Supabase Auth와 연동

**플로우:**
1. 사용자가 "Gmail로 로그인" 버튼 클릭
2. Google OAuth 인증 화면으로 리다이렉트
3. Google 계정 선택 및 권한 승인
4. Supabase Auth에 사용자 생성/로그인
5. 개인 프로필 페이지로 이동

**제약사항:**
- `@gmail.com` 도메인이 아닌 경우 회원가입 거부
- 이미 가입된 이메일인 경우 로그인 처리

### 3.2 2차 인증: 회사 도메인 이메일 인증

**요구사항:**
- 워크스페이스(회사) 접근 시 회사 도메인 이메일 인증 필요
- 이메일 인증 링크를 통한 검증
- 개인 Gmail과 회사 이메일을 연결하여 워크스페이스 접근 권한 부여

**플로우:**
1. 사용자가 워크스페이스 접근 시도
2. 회사 도메인 이메일 입력 요청
3. 입력한 이메일로 인증 링크 전송
4. 사용자가 이메일에서 링크 클릭
5. 회사 도메인 이메일 인증 완료
6. 워크스페이스 접근 권한 부여

**제약사항:**
- 회사 도메인 이메일은 워크스페이스별로 관리
- 한 개인 Gmail 계정에 여러 회사 이메일 연결 가능
- 회사 이메일 인증은 워크스페이스별로 독립적

---

## 4. 데이터 구조

### 4.1 users 테이블 (Supabase Auth 확장)

| 컬럼명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| id | uuid | PK, Supabase auth.users.id와 동일 | |
| email | text | 개인 Gmail 주소 | unique, @gmail.com만 허용 |
| name | text | 사용자 이름 | Google OAuth에서 가져옴 |
| avatar_url | text | 프로필 이미지 URL | Google OAuth에서 가져옴 |
| created_at | timestamptz | 가입일시 | default now() |
| updated_at | timestamptz | 수정일시 | |

### 4.2 user_company_emails 테이블 (신규)

| 컬럼명 | 타입 | 설명 | 비고 |
|--------|------|------|------|
| id | uuid | PK | default gen_random_uuid() |
| user_id | uuid | FK -> users.id | 개인 Gmail 계정 |
| workspace_id | uuid | FK -> workspaces.id | 회사 워크스페이스 |
| company_email | text | 회사 도메인 이메일 | unique(workspace_id, company_email) |
| verified | boolean | 인증 완료 여부 | default false |
| verification_token | text | 인증 토큰 | 인증 완료 후 null |
| verified_at | timestamptz | 인증 완료 일시 | |
| created_at | timestamptz | 생성일시 | default now() |

**제약사항:**
- `user_id`와 `workspace_id` 조합은 unique
- `verified = true`인 경우에만 워크스페이스 접근 가능
- 인증 토큰은 24시간 유효

### 4.3 기존 테이블과의 관계

```
users (1) ──< (N) user_company_emails (N) >── (1) workspaces
```

- 한 사용자는 여러 워크스페이스에 회사 이메일로 가입 가능
- 한 워크스페이스는 여러 사용자의 회사 이메일을 가질 수 있음

---

## 5. 주요 기능 (Key Features)

### 5.1 회원가입/로그인

| 기능명 | 설명 | 출력/동작 결과 |
|--------|------|----------------|
| Gmail 로그인 | Google OAuth를 통한 소셜 로그인 | Supabase Auth 세션 생성 |
| 도메인 검증 | @gmail.com 도메인만 허용 | 비Gmail 계정 거부 메시지 |
| 자동 회원가입 | 최초 로그인 시 자동 회원가입 | users 테이블에 레코드 생성 |
| 프로필 정보 동기화 | Google 프로필 정보 자동 동기화 | 이름, 아바타 업데이트 |

### 5.2 회사 이메일 인증

| 기능명 | 설명 | 출력/동작 결과 |
|--------|------|------|
| 회사 이메일 입력 | 워크스페이스 접근 시 이메일 입력 요청 | 입력 폼 표시 |
| 인증 링크 전송 | 입력한 이메일로 인증 링크 전송 | 이메일 발송 완료 메시지 |
| 이메일 인증 | 링크 클릭 시 인증 완료 | verified = true, 워크스페이스 접근 권한 부여 |
| 인증 상태 확인 | 워크스페이스 접근 시 인증 상태 확인 | 미인증 시 인증 요청 화면 |

### 5.3 워크스페이스 접근 제어

| 기능명 | 설명 | 출력/동작 결과 |
|--------|------|------|
| 접근 권한 확인 | 워크스페이스 접근 시 인증 상태 확인 | 인증 완료 시 접근 허용, 미인증 시 인증 요청 |
| 다중 워크스페이스 | 한 사용자가 여러 워크스페이스에 가입 가능 | 워크스페이스 목록 표시 |
| 워크스페이스 전환 | 다른 워크스페이스로 전환 | 선택한 워크스페이스로 이동 |

---

## 6. UX Flow

### 6.1 회원가입 플로우

```
1. 사용자가 "/login" 접속
   ↓
2. "Gmail로 로그인" 버튼 클릭
   ↓
3. Google OAuth 인증 화면
   ↓
4. Gmail 계정 선택 및 권한 승인
   ↓
5. 도메인 검증 (@gmail.com 확인)
   ↓
6. [최초 로그인] 자동 회원가입 완료
   [기존 사용자] 로그인 완료
   ↓
7. 대시보드 또는 워크스페이스 선택 화면으로 이동
```

### 6.2 워크스페이스 접근 플로우

```
1. 사용자가 워크스페이스 접근 시도
   ↓
2. 회사 이메일 인증 상태 확인
   ↓
3. [인증 완료] 워크스페이스 접근 허용
   [미인증] 회사 이메일 입력 화면 표시
   ↓
4. 회사 이메일 입력 및 "인증 링크 전송" 클릭
   ↓
5. 입력한 이메일로 인증 링크 전송
   ↓
6. 사용자가 이메일에서 링크 클릭
   ↓
7. 인증 완료 처리 (verified = true)
   ↓
8. 워크스페이스 접근 권한 부여
```

---

## 7. API 설계

### 7.1 인증 API

| Method | Endpoint | 설명 | 요청/응답 |
|--------|----------|------|-----------|
| GET | `/api/auth/google` | Google OAuth 인증 시작 | 리다이렉트 |
| GET | `/api/auth/callback` | Google OAuth 콜백 처리 | 세션 생성 |
| POST | `/api/auth/logout` | 로그아웃 | 세션 삭제 |
| GET | `/api/auth/me` | 현재 사용자 정보 조회 | `{ id, email, name, avatar_url }` |

### 7.2 회사 이메일 인증 API

| Method | Endpoint | 설명 | 요청/응답 |
|--------|----------|------|-----------|
| POST | `/api/workspaces/:id/verify-email` | 회사 이메일 인증 요청 | `{ company_email }` → `{ ok: true, message }` |
| GET | `/api/workspaces/:id/verify-email/:token` | 인증 링크 검증 | `{ ok: true, verified: true }` |
| GET | `/api/workspaces/:id/verification-status` | 인증 상태 확인 | `{ verified: boolean, company_email?: string }` |

---

## 8. 보안 정책

### 8.1 RLS (Row Level Security)

**users 테이블:**
- 사용자는 자신의 정보만 조회 가능
- 관리자는 모든 사용자 조회 가능 (향후 구현)

**user_company_emails 테이블:**
- 사용자는 자신의 회사 이메일 정보만 조회 가능
- `verified = true`인 경우에만 워크스페이스 접근 가능

### 8.2 인증 토큰

- 인증 토큰은 24시간 유효
- 토큰은 단일 사용 (한 번 사용 후 무효화)
- 토큰은 암호화하여 저장

---

## 9. 기술 스택

| 구분 | 기술 | 설명 |
|------|------|------|
| 인증 | Supabase Auth | Google OAuth 연동 |
| 이메일 발송 | Supabase Edge Functions | 인증 링크 전송 |
| 데이터베이스 | Supabase PostgreSQL | 사용자 및 인증 정보 저장 |
| 프론트엔드 | Next.js 15 App Router | 인증 UI 구현 |

---

## 10. 구현 우선순위

### Phase 1: 기본 인증 (MVP)
- [ ] Google OAuth 연동
- [ ] Gmail 도메인 검증
- [ ] 회원가입/로그인 플로우
- [ ] 사용자 프로필 정보 동기화

### Phase 2: 회사 이메일 인증
- [ ] 회사 이메일 입력 UI
- [ ] 인증 링크 전송 기능
- [ ] 이메일 인증 처리
- [ ] 워크스페이스 접근 제어

### Phase 3: 고급 기능
- [ ] 다중 워크스페이스 관리
- [ ] 워크스페이스 전환 기능
- [ ] 회사 이메일 재인증 기능
- [ ] 인증 이력 조회

---

## 11. 참고 사항

### 11.1 메타(Meta) 방식 참고
- 개인 계정으로 로그인
- 비즈니스 계정(회사 도메인) 별도 인증
- 한 개인 계정에 여러 비즈니스 계정 연결 가능

### 11.2 Google OAuth 설정
- Google Cloud Console에서 OAuth 2.0 클라이언트 ID 생성
- 리다이렉트 URI: `https://startmktg.com/api/auth/callback`
- Supabase Auth에 Google Provider 설정

### 11.3 이메일 템플릿
- 인증 링크 이메일 템플릿 필요
- 브랜드 일관성 유지 (흑백 디자인)
- 모바일 친화적 레이아웃

---

## 12. 성공 지표

| 지표 | 목표 | 측정 방법 |
|------|------|-----------|
| 회원가입 전환율 | 70% 이상 | 로그인 시도 대비 회원가입 완료 |
| 이메일 인증 완료율 | 80% 이상 | 인증 링크 전송 대비 인증 완료 |
| 평균 인증 시간 | 5분 이내 | 인증 링크 전송부터 완료까지 |

---

**작성일:** 2025-01-11  
**버전:** 1.0  
**작성자:** Start Marketing Team

