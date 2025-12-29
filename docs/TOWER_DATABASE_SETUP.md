# Tower 데이터베이스 설정 가이드

## 문제
`Could not find the table 'public.companies' in the schema cache` 오류가 발생합니다.

## 원인
Supabase 데이터베이스에 Tower 시스템 테이블이 생성되지 않았습니다.

## 해결 방법

### 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20250116_create_tower_system.sql` 파일 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭하여 실행
7. 성공 메시지 확인

### 방법 2: Supabase CLI 사용 (선택)

Supabase CLI가 설치되어 있다면:

```bash
# Supabase에 연결 (처음 한 번만)
supabase link --project-ref your-project-ref

# 마이그레이션 실행
supabase db push
```

### 방법 3: 수동으로 테이블 생성

Supabase Dashboard의 **Table Editor**에서 직접 테이블을 생성할 수도 있지만, 마이그레이션 파일을 실행하는 것이 가장 간단합니다.

## 확인 사항

마이그레이션 실행 후 다음 테이블들이 생성되었는지 확인:

1. **Table Editor**에서 확인:
   - `companies`
   - `company_roles`
   - `company_memberships`
   - `invitations`
   - `access_requests`
   - `landing_channels`
   - `media`
   - `objectives`
   - `utm_rules`
   - `custom_rules`
   - `logs_campaign`
   - `logs_media`
   - `logs_utm_generator`
   - `logs_utm_checker`
   - `logs_invitation`
   - `logs_access_request`
   - `logs_error`

2. **SQL Editor**에서 확인:
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name LIKE 'company%' OR table_name LIKE 'log%';
   ```

## 주의사항

- 마이그레이션 파일은 한 번만 실행하면 됩니다
- 이미 일부 테이블이 있다면 에러가 발생할 수 있지만, `IF NOT EXISTS` 구문으로 안전하게 처리됩니다
- 마이그레이션 실행 후 서버를 재시작할 필요는 없습니다 (즉시 반영됨)

## 다음 단계

마이그레이션 실행 후:
1. `http://localhost:3000/ko/tower` 접속
2. Tower Admin 페이지가 정상적으로 표시되는지 확인
3. `.env.local`에 `TOWER_DEV_MODE=true` 추가 (테스트용)




