# Tower Admin 시스템 설정 가이드

## 1. 패키지 설치

먼저 필요한 패키지를 설치하세요:

```bash
npm install @radix-ui/react-select
```

## 2. 데이터베이스 마이그레이션

Supabase Dashboard에서 마이그레이션을 실행하세요:

1. Supabase Dashboard → **SQL Editor**
2. `supabase/migrations/20250116_create_tower_system.sql` 파일 내용 복사
3. SQL Editor에 붙여넣기 후 **Run** 클릭
4. 성공 메시지 확인

**중요**: 마이그레이션 파일이 업데이트되었습니다:
- `is_tower_operator` 필드가 `users` 테이블에 추가되었습니다
- `update_updated_at_column()` 함수 생성 코드가 포함되었습니다

## 3. Tower Operator 권한 설정

### 방법 1: Supabase Dashboard에서 직접 설정

1. Supabase Dashboard → **Table Editor** → **users** 테이블
2. Tower Operator로 설정할 사용자 선택
3. `is_tower_operator` 필드를 `true`로 변경
4. 저장

### 방법 2: SQL로 설정

```sql
-- 특정 사용자에게 Tower Operator 권한 부여
UPDATE users 
SET is_tower_operator = true 
WHERE email = 'your-email@gmail.com';

-- 또는 사용자 ID로 설정
UPDATE users 
SET is_tower_operator = true 
WHERE id = 'user-id-here';
```

## 4. 접근 테스트

1. Tower Operator 권한이 있는 계정으로 로그인
2. `http://localhost:3000/tower` 접속
3. Tower Admin 페이지가 표시되는지 확인

## 5. Company 생성 테스트

1. `/tower/companies` 페이지에서 "새 Company 생성" 버튼 클릭
2. 필수 필드 입력:
   - Company Name
   - Country (드롭다운에서 선택)
   - Business Number (국가별 형식에 맞게)
3. "생성" 버튼 클릭
4. Company 상세 페이지로 리다이렉트되는지 확인

## 주의사항

- Tower Operator 권한이 없는 사용자는 `/tower` 경로에 접근할 수 없습니다
- Company 생성 시 기본 Role Tree가 자동 생성됩니다 (LV5, LV4)
- Business Number는 국가별 포맷 검증이 적용됩니다

## 문제 해결

### "Tower Operator 권한이 필요합니다" 오류
- `users` 테이블에서 `is_tower_operator = true`로 설정했는지 확인
- 로그인한 사용자의 이메일/ID와 일치하는지 확인

### "Could not find the table 'public.companies'" 오류
- 마이그레이션이 실행되었는지 확인
- Supabase Dashboard에서 `companies` 테이블이 생성되었는지 확인

### 페이지가 404 오류
- Next.js 서버를 재시작했는지 확인
- 파일 경로가 올바른지 확인 (`/tower/companies`)

