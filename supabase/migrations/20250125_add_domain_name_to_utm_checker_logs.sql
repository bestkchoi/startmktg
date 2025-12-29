-- UTM Checker 로그 테이블에 도메인명 컬럼 추가
-- 도메인명은 URL에서 추출하여 저장

ALTER TABLE IF EXISTS public.utm_checker_logs
ADD COLUMN IF NOT EXISTS domain_name text;

-- 도메인명 인덱스 생성 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS utm_checker_logs_domain_name_idx ON public.utm_checker_logs(domain_name);

-- 기존 데이터에 대한 도메인명 업데이트 (선택사항)
-- UPDATE public.utm_checker_logs
-- SET domain_name = (
--   SELECT regexp_replace(
--     regexp_replace(input_url, '^https?://', ''),
--     '/.*$', ''
--   )
-- )
-- WHERE domain_name IS NULL;



