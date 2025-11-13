# Start Marketing — UTM Checker Base

Next.js(App Router) 기반의 UTM Checker 및 회원가입 시스템 프로젝트입니다.  
Supabase 연동과 Tailwind CSS가 적용되어 있으며 `docs/` 폴더의 기존 문서는 그대로 유지되었습니다.

## 주요 기능

- **UTM Checker**: URL의 UTM 파라미터 검증 및 생성
- **회원가입 시스템**: Gmail 기반 소셜 로그인 (Google OAuth)
- **Google Analytics 4**: 웹사이트 방문자 추적

## 필수 환경 변수

`.env.local` 파일을 프로젝트 루트에 만들고 아래 값을 채워주세요.

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Google Analytics 4 (선택)
NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
```

> **참고**: 
> - GA4 설정 방법은 [`docs/ANALYTICS_SETUP.md`](./docs/ANALYTICS_SETUP.md)를 참고하세요.
> - Google OAuth 설정 방법은 [`docs/SETUP/google_oauth_setup.md`](./docs/SETUP/google_oauth_setup.md)를 참고하세요.

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 메인 페이지를 확인할 수 있습니다.

## 데이터베이스 마이그레이션

회원가입 시스템을 사용하려면 Supabase에서 마이그레이션을 실행해야 합니다.

1. Supabase Dashboard → **SQL Editor** 접속
2. `supabase/migrations/20250111_create_user_system.sql` 파일 내용 복사
3. SQL Editor에 붙여넣고 **Run** 클릭

자세한 설정 방법은 [`docs/SETUP/google_oauth_setup.md`](./docs/SETUP/google_oauth_setup.md)를 참고하세요.

## 주요 페이지

- `/` - 메인 페이지
- `/login` - 로그인 페이지 (Gmail 소셜 로그인)
- `/dashboard` - 사용자 대시보드
- `/utmchecker` - UTM Checker 서비스

## API 엔드포인트

- `GET /api/ping` - Supabase 연결 확인
- `GET /api/auth/google` - Google OAuth 로그인 시작
- `GET /api/auth/callback` - OAuth 콜백 처리
- `POST /api/auth/logout` - 로그아웃
- `GET /api/auth/me` - 현재 사용자 정보 조회
- `POST /api/utm-checker` - UTM URL 생성 및 저장
- `GET /api/utm-checker` - 최근 UTM 로그 조회


