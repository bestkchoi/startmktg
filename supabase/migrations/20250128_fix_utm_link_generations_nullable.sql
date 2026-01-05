-- UTM LINK 생성 로그 테이블 nullable 필드 수정
-- landing_domain, landing_path는 선택사항이므로 nullable이어야 함

-- 1. 기존 NOT NULL 제약조건 제거 (존재하는 경우)
ALTER TABLE public.utm_link_generations 
  ALTER COLUMN landing_domain DROP NOT NULL;

ALTER TABLE public.utm_link_generations 
  ALTER COLUMN landing_path DROP NOT NULL;

-- 2. 스키마 확인 쿼리 (실행 후 결과 확인)
-- SELECT 
--   column_name,
--   data_type,
--   is_nullable,
--   column_default
-- FROM information_schema.columns
-- WHERE table_schema = 'public' 
--   AND table_name = 'utm_link_generations'
-- ORDER BY ordinal_position;




