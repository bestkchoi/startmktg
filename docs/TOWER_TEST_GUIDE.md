# Tower 테스트 가이드

## Tower 메뉴 테스트 방법

### 방법 1: 개발 모드 활성화 (가장 간단)

`.env.local` 파일에 다음을 추가:

```env
TOWER_DEV_MODE=true
```

이렇게 하면 **모든 로그인한 사용자**가 Tower에 접근할 수 있습니다.

### 방법 2: 환경 변수에 사용자 추가

현재 로그인한 사용자의 정보를 확인한 후 환경 변수에 추가:

1. **사용자 정보 확인**
   - 브라우저에서 `http://localhost:3000/api/tower/test-info` 접속
   - 현재 로그인한 사용자의 이메일과 ID 확인

2. **환경 변수 설정**
   `.env.local` 파일에 다음 중 하나 추가:

   ```env
   # 이메일 기반 (이메일이 포함되면 허용)
   TOWER_OPERATOR_EMAILS=your-email@gmail.com,admin@startmktg.com
   
   # 또는 사용자 ID 기반
   TOWER_OPERATOR_USER_IDS=user-id-1,user-id-2
   ```

3. **서버 재시작**
   ```bash
   # 개발 서버 재시작
   npm run dev
   ```

### 방법 3: Supabase에서 직접 사용자 확인

1. Supabase Dashboard 접속
2. `users` 테이블에서 현재 로그인한 사용자의 `id`와 `email` 확인
3. 환경 변수에 추가

## 테스트 순서

### 1. 로그인
- `http://localhost:3000/login` 접속
- Google OAuth로 로그인

### 2. 사용자 정보 확인 (선택)
- `http://localhost:3000/api/tower/test-info` 접속
- 현재 사용자 정보 및 Tower Operator 여부 확인

### 3. Tower 접근
- `http://localhost:3000/tower` 접속
- 또는 `http://localhost:3000/ko/tower`, `http://localhost:3000/en/tower`

### 4. 기능 테스트
- Company 목록 확인
- Company 생성 (새 Company 생성 버튼)
- Company 상세 페이지 접근
- 각 탭 (Roles, Members, Invitations 등) 확인

## 주의사항

### 개발 모드 (TOWER_DEV_MODE=true)
- ⚠️ **프로덕션 환경에서는 절대 사용하지 마세요!**
- 모든 로그인 사용자가 Tower에 접근할 수 있습니다
- 개발/테스트 환경에서만 사용하세요

### 환경 변수 설정
- `.env.local` 파일은 Git에 커밋하지 마세요 (이미 `.gitignore`에 포함되어 있을 것입니다)
- 환경 변수 변경 후에는 **반드시 서버를 재시작**해야 합니다

## 문제 해결

### "접근 권한 없음" 메시지가 표시되는 경우

1. **로그인 확인**
   - 로그인되어 있는지 확인
   - `/api/tower/test-info`에서 사용자 정보 확인

2. **환경 변수 확인**
   - `.env.local` 파일이 올바르게 설정되었는지 확인
   - 서버를 재시작했는지 확인

3. **개발 모드 활성화**
   - `TOWER_DEV_MODE=true` 추가 후 서버 재시작

### "인증이 필요합니다" 메시지가 표시되는 경우

- Google OAuth로 로그인하지 않았습니다
- `/login` 페이지에서 로그인하세요

### 데이터베이스 오류가 발생하는 경우

- Supabase 마이그레이션이 실행되었는지 확인:
  ```bash
  supabase migration up
  ```
- 또는 Supabase Dashboard에서 마이그레이션 파일을 직접 실행

## 테스트 체크리스트

- [ ] 로그인 성공
- [ ] `/api/tower/test-info`에서 사용자 정보 확인
- [ ] `/tower` 페이지 접근 성공
- [ ] Company 목록 표시 (없으면 빈 목록)
- [ ] Company 생성 버튼 클릭 가능
- [ ] Company 상세 페이지 접근 (Company가 있는 경우)
- [ ] 각 탭 (Profile, Roles, Members 등) 전환 가능




