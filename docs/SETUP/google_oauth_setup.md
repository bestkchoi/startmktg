# Google OAuth 설정 가이드

Start Marketing 회원가입 시스템을 위한 Google OAuth 설정 방법입니다.

## 1. Google Cloud Console 설정

### 1단계: 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 상단 프로젝트 선택 → **새 프로젝트** 클릭
3. 프로젝트 이름 입력 (예: "Start Marketing")
4. **만들기** 클릭

### 2단계: OAuth 동의 화면 구성

1. 왼쪽 메뉴에서 **API 및 서비스** → **OAuth 동의 화면** 클릭
2. **외부** 선택 → **만들기** 클릭
3. 앱 정보 입력:
   - **앱 이름**: Start Marketing
   - **사용자 지원 이메일**: 본인 이메일
   - **앱 로고**: (선택) 로고 업로드
   - **앱 도메인**: `startmktg.com` (또는 개발 도메인)
   - **개발자 연락처 정보**: 본인 이메일
4. **저장 후 계속** 클릭

5. 범위(Scopes) 설정:
   - **범위 추가 또는 삭제** 클릭
   - 다음 범위 추가:
     - `userinfo.email` (이메일 주소 보기)
     - `userinfo.profile` (기본 프로필 정보 보기)
   - **업데이트** → **저장 후 계속** 클릭

6. 테스트 사용자 추가 (개발 단계):
   - **테스트 사용자 추가** 클릭
   - 테스트할 Gmail 주소 추가
   - **저장 후 계속** 클릭

7. 요약 확인 후 **대시보드로 돌아가기** 클릭

### 3단계: OAuth 2.0 클라이언트 ID 생성

1. 왼쪽 메뉴에서 **API 및 서비스** → **사용자 인증 정보** 클릭
2. 상단 **+ 사용자 인증 정보 만들기** → **OAuth 클라이언트 ID** 클릭
3. 애플리케이션 유형: **웹 애플리케이션** 선택
4. 이름 입력 (예: "Start Marketing Web")
5. 승인된 리디렉션 URI 추가:
   - 개발 환경: `http://localhost:3000/api/auth/callback`
   - 프로덕션: `https://startmktg.com/api/auth/callback`
   - (Vercel 배포 URL이 있다면 추가)
6. **만들기** 클릭
7. **클라이언트 ID**와 **클라이언트 보안 비밀번호** 복사 (나중에 필요)

## 2. Supabase 설정

### 1단계: Supabase 프로젝트 접속

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택

### 2단계: Authentication 설정

1. 왼쪽 메뉴에서 **Authentication** → **Providers** 클릭
2. **Google** 찾아서 활성화
3. 다음 정보 입력:
   - **Client ID (for OAuth)**: Google Cloud Console에서 복사한 클라이언트 ID
   - **Client Secret (for OAuth)**: Google Cloud Console에서 복사한 클라이언트 보안 비밀번호
4. **Save** 클릭

### 3단계: Redirect URLs 설정

1. **Authentication** → **URL Configuration** 클릭
2. **Redirect URLs**에 다음 추가:
   - `http://localhost:3000/api/auth/callback` (개발)
   - `https://startmktg.com/api/auth/callback` (프로덕션)
   - (Vercel 배포 URL이 있다면 추가)
3. **Save** 클릭

## 3. 데이터베이스 마이그레이션

### 1단계: Supabase SQL Editor에서 마이그레이션 실행

1. Supabase Dashboard → **SQL Editor** 클릭
2. **New query** 클릭
3. `supabase/migrations/20250111_create_user_system.sql` 파일 내용 복사하여 붙여넣기
4. **Run** 클릭하여 실행

### 2단계: 테이블 확인

1. **Table Editor**에서 다음 테이블이 생성되었는지 확인:
   - `users` (확장됨)
   - `user_company_emails` (신규)

## 4. 환경 변수 설정

### 로컬 개발 환경

`.env.local` 파일에 다음 추가 (이미 있으면 확인):

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Vercel 배포 환경

1. [Vercel Dashboard](https://vercel.com) 접속
2. 프로젝트 선택 → **Settings** → **Environment Variables** 클릭
3. 다음 변수 추가:
   - `NEXT_PUBLIC_SUPABASE_URL`: Supabase 프로젝트 URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase Anon Key
4. **Save** 클릭
5. **Redeploy** 클릭

## 5. 테스트

### 로컬 테스트

1. 개발 서버 실행:
   ```bash
   npm run dev
   ```

2. 브라우저에서 `http://localhost:3000/login` 접속

3. **Gmail로 로그인** 버튼 클릭

4. Google 계정 선택 및 권한 승인

5. Gmail 계정인 경우:
   - `/dashboard`로 리다이렉트되어 로그인 성공
   - `users` 테이블에 사용자 정보 저장 확인

6. 비Gmail 계정인 경우:
   - 에러 메시지 표시: "Gmail 계정만 회원가입할 수 있습니다."

### 프로덕션 테스트

1. Vercel에 배포된 사이트 접속
2. `/login` 페이지에서 동일한 테스트 수행

## 6. 문제 해결

### "redirect_uri_mismatch" 에러

- Google Cloud Console의 **승인된 리디렉션 URI**에 정확한 URL이 추가되었는지 확인
- Supabase의 **Redirect URLs**에도 동일한 URL이 추가되었는지 확인

### "gmail_only" 에러

- Gmail 계정(`@gmail.com`)만 허용됩니다
- Google Workspace 계정(`@company.com`)은 현재 지원하지 않습니다

### 사용자 정보가 저장되지 않음

- `users` 테이블이 올바르게 생성되었는지 확인
- RLS 정책이 올바르게 설정되었는지 확인
- Supabase 로그에서 에러 확인

## 7. 다음 단계

- [ ] 회사 이메일 인증 기능 구현
- [ ] 워크스페이스 접근 제어 구현
- [ ] 다중 워크스페이스 관리 기능

---

**작성일:** 2025-01-11  
**버전:** 1.0

