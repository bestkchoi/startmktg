-- UTM LINK 공유 테이블: Google 선택 시 utm_source, utm_medium nullable 허용
-- Google Ads는 자동 태그(gclid)를 사용하므로 UTM 파라미터를 생성하지 않음

-- 1. utm_source, utm_medium 컬럼을 nullable로 변경
ALTER TABLE public.utm_link_shares 
  ALTER COLUMN utm_source DROP NOT NULL;

ALTER TABLE public.utm_link_shares 
  ALTER COLUMN utm_medium DROP NOT NULL;

-- 2. 스키마 확인 쿼리 (실행 후 결과 확인)
-- SELECT 
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'utm_link_shares'
--   AND column_name IN ('utm_source', 'utm_medium')
-- ORDER BY ordinal_position;

