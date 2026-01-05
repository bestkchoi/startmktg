# UTM LINK 공유 기능 설정 가이드

## 문제 해결

에러 메시지: `Could not find the table 'public.utm_link_shares' in the schema cache` (PGRST205)

이 에러는 `utm_link_shares` 테이블이 Supabase 데이터베이스에 생성되지 않았을 때 발생합니다.

## 해결 방법

### 1단계: Supabase Dashboard에서 마이그레이션 실행

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20250129_create_utm_link_shares.sql` 파일 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭하여 실행
7. 성공 메시지 확인

### 2단계: 테이블 생성 확인

SQL Editor에서 다음 쿼리로 테이블이 생성되었는지 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'utm_link_shares';
```

결과가 나오면 테이블이 정상적으로 생성된 것입니다.

### 3단계: 테이블 구조 확인

다음 쿼리로 테이블 구조를 확인:

```sql
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'utm_link_shares'
ORDER BY ordinal_position;
```

예상 컬럼:
- id (uuid)
- share_code (text, NOT NULL, UNIQUE)
- created_at (timestamptz)
- adtype (text, NOT NULL)
- media (text, NOT NULL)
- utm_source (text, NOT NULL)
- utm_medium (text, NOT NULL)
- campaign_id (text, NOT NULL)
- adgroup_name (text, NOT NULL)
- clean_landing_url (text, NOT NULL)
- final_utm_url (text, NOT NULL)
- note (text, nullable)

### 4단계: RLS 정책 확인

다음 쿼리로 RLS 정책이 설정되었는지 확인:

```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'utm_link_shares';
```

예상 결과:
- `Allow anonymous insert on utm_link_shares` (INSERT, anon, authenticated)
- `Allow anonymous select on utm_link_shares` (SELECT, anon, authenticated)

### 5단계: 테스트 INSERT

다음으로 테스트 INSERT를 실행:

```sql
INSERT INTO public.utm_link_shares (
  share_code,
  adtype,
  media,
  utm_source,
  utm_medium,
  campaign_id,
  adgroup_name,
  clean_landing_url,
  final_utm_url
) VALUES (
  'test123',
  'sa',
  'ggl',
  'google',
  'cpc',
  'test_campaign',
  'test_adgroup',
  'https://example.com',
  'https://example.com?utm_source=google&utm_medium=cpc'
);
```

성공하면 정책이 올바르게 설정된 것입니다.

### 6단계: 테스트 데이터 삭제

테스트 후 다음으로 삭제:

```sql
DELETE FROM public.utm_link_shares WHERE share_code = 'test123';
```

## 주의사항

- 마이그레이션 파일은 한 번만 실행하면 됩니다
- 이미 테이블이 있다면 `CREATE TABLE IF NOT EXISTS` 구문으로 안전하게 처리됩니다
- RLS 정책이 이미 있다면 `CREATE POLICY IF NOT EXISTS` 구문으로 안전하게 처리됩니다

## 문제가 계속되면

1. Supabase Dashboard → **Database** → **Tables**에서 `utm_link_shares` 테이블이 보이는지 확인
2. 테이블이 없다면 마이그레이션 파일을 다시 실행
3. 테이블이 있는데도 에러가 발생하면 Supabase 프로젝트를 재시작하거나 스키마 캐시를 새로고침



