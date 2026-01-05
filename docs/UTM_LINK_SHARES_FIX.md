# UTM LINK 공유 기능 PGRST205 에러 해결 가이드

## 문제
`PGRST205` 에러: "Could not find the table 'public.utm_link_shares' in the schema cache"

## 원인
Supabase PostgREST가 새로운 테이블을 스키마 캐시에서 찾지 못할 때 발생합니다.

## 해결 방법

### 1단계: Supabase Dashboard에서 마이그레이션 실행

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20250129_create_utm_link_shares.sql` 파일 내용을 복사하여 붙여넣기
6. **Run** 버튼 클릭하여 실행
7. 성공 메시지 확인

### 2단계: 스키마 캐시 새로고침

마이그레이션 실행 후, 다음 SQL을 실행하여 PostgREST 스키마 캐시를 새로고침하세요:

```sql
NOTIFY pgrst, 'reload schema';
```

**중요**: 이 명령은 마이그레이션 실행 직후에 실행해야 합니다.

### 3단계: 테이블 생성 확인

다음 쿼리로 테이블이 생성되었는지 확인:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'utm_link_shares';
```

### 4단계: 권한 및 RLS 정책 확인

다음 쿼리로 권한이 부여되었는지 확인:

```sql
-- 권한 확인
SELECT 
  grantee,
  privilege_type
FROM information_schema.role_table_grants
WHERE table_schema = 'public' 
  AND table_name = 'utm_link_shares'
  AND grantee IN ('anon', 'authenticated');
```

다음 쿼리로 RLS 정책이 설정되었는지 확인:

```sql
-- RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
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

### 7단계: 애플리케이션 재시작

마이그레이션 실행 및 스키마 캐시 새로고침 후:
1. 개발 서버 재시작 (Ctrl+C 후 `npm run dev`)
2. 브라우저 새로고침
3. 공유 링크 생성 다시 시도

## 문제가 계속되면

1. Supabase Dashboard → **Database** → **Tables**에서 `utm_link_shares` 테이블이 보이는지 확인
2. 테이블이 없다면 마이그레이션 파일을 다시 실행
3. 테이블이 있는데도 에러가 발생하면:
   - Supabase 프로젝트를 재시작
   - 또는 Supabase Dashboard → **Settings** → **API** → **Reload Schema** 클릭 (있는 경우)

## 확인 체크리스트

- [ ] Supabase Dashboard에서 마이그레이션 SQL 실행 완료
- [ ] `NOTIFY pgrst, 'reload schema';` 실행 완료
- [ ] 테이블 생성 확인 쿼리 결과 확인
- [ ] 권한 및 RLS 정책 확인 쿼리 결과 확인
- [ ] 테스트 INSERT 성공
- [ ] 개발 서버 재시작
- [ ] 공유 링크 생성 다시 시도



