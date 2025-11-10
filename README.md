# Start Marketing — UTM Checker Base

Next.js(App Router) 기반의 UTM Checker 초깃값 프로젝트입니다.  
Supabase 연동과 Tailwind CSS가 적용되어 있으며 `docs/` 폴더의 기존 문서는 그대로 유지되었습니다.

## 필수 환경 변수

`.env.local` 파일을 프로젝트 루트에 만들고 아래 값을 채워주세요.

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 실행 방법

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 접속하면 `UTM Checker — Base Ready` 플레이스홀더 화면을 확인할 수 있습니다.  
연결 검증은 `http://localhost:3000/api/ping`에서 확인할 수 있습니다.


