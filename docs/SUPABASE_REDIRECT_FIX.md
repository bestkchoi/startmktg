# Supabase OAuth 리다이렉트 문제 해결 가이드

## 문제
로그인 후 `startmktg.com`으로 리다이렉트되는 문제

## 원인
Supabase Dashboard의 URL Configuration에서 Redirect URLs에 프로덕션 도메인이 설정되어 있고, 이것이 우선적으로 사용되고 있을 수 있습니다.

## 해결 방법

### 1. Supabase Dashboard 설정 확인 및 수정

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. **Authentication** → **URL Configuration** 클릭
4. **Redirect URLs** 섹션 확인:
   - `http://localhost:3000/api/auth/callback` (개발용)
   - `https://startmktg.com/api/auth/callback` (프로덕션용)
   
5. **Site URL** 확인:
   - 개발 환경: `http://localhost:3000`
   - 프로덕션: `https://startmktg.com`

6. **중요**: 개발 중이라면 **Site URL**을 `http://localhost:3000`으로 설정

### 2. Google Cloud Console 설정 확인

1. [Google Cloud Console](https://console.cloud.google.com/) 접속
2. 프로젝트 선택
3. **API 및 서비스** → **사용자 인증 정보** 클릭
4. OAuth 2.0 클라이언트 ID 클릭
5. **승인된 리디렉션 URI** 확인:
   - `http://localhost:3000/api/auth/callback` 포함되어 있는지 확인
   - 없으면 추가

### 3. 코드 수정 완료

코드에서 다음 개선사항을 적용했습니다:
- 콜백에서 `redirect_to` 쿼리 파라미터 지원
- 외부 도메인 리다이렉트 방지
- 로컬호스트 우선 사용

### 4. 테스트

1. 브라우저에서 `http://localhost:3000/login` 접속
2. Google 로그인 클릭
3. 로그인 후 `http://localhost:3000/dashboard` 또는 지정한 페이지로 리다이렉트되는지 확인

### 5. Tower 테스트를 위한 리다이렉트

Tower 페이지로 직접 리다이렉트하려면:
- `http://localhost:3000/api/auth/google?redirect_to=/tower`

또는 로그인 후 수동으로 `/tower` 접속

## 추가 확인사항

### 환경 변수 확인
`.env.local` 파일에 올바른 Supabase URL이 설정되어 있는지 확인:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 브라우저 캐시 클리어
문제가 계속되면 브라우저 캐시를 클리어하거나 시크릿 모드로 테스트해보세요.




