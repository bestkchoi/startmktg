-- campaigns 테이블에서 description 컬럼 삭제
ALTER TABLE public.campaigns
DROP COLUMN IF EXISTS description;



