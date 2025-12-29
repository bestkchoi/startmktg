# Meta 광고 이름 컬럼 마이그레이션 가이드

## 문제
`Could not find the 'meta_ad_name' column of 'campaign_channels' in the schema cache` 오류가 발생합니다.

## 원인
Supabase 데이터베이스의 `campaign_channels` 테이블에 Meta 광고 이름 컬럼이 추가되지 않았습니다.

## 해결 방법

### 방법 1: Supabase Dashboard에서 직접 실행 (권장)

1. [Supabase Dashboard](https://app.supabase.com/) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. **New query** 클릭
5. `supabase/migrations/20250128_add_meta_ad_names.sql` 파일 내용을 복사하여 붙여넣기
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

## 확인 사항

마이그레이션 실행 후 다음 컬럼들이 추가되었는지 확인:

1. **Table Editor**에서 확인:
   - `campaign_channels` 테이블 선택
   - 다음 컬럼이 있는지 확인:
     - `meta_campaign_name` (text, nullable)
     - `meta_adset_name` (text, nullable)
     - `meta_ad_name` (text, nullable)

2. **SQL Editor**에서 확인:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_schema = 'public' 
   AND table_name = 'campaign_channels'
   AND column_name LIKE 'meta_%';
   ```

## 주의사항

- 마이그레이션 파일은 한 번만 실행하면 됩니다
- 이미 컬럼이 있다면 `IF NOT EXISTS` 구문으로 안전하게 처리됩니다
- 마이그레이션 실행 후 Supabase 클라이언트를 재시작할 필요는 없습니다 (자동으로 반영됨)




