-- UTM LINK 생성 로그 테이블
-- 공개 기능이므로 로그인 없이 누구나 사용 가능

-- 1. utm_link_generations 테이블 생성
CREATE TABLE IF NOT EXISTS public.utm_link_generations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  adtype text NOT NULL CHECK (adtype IN ('sa', 'sp', 'da', 'cr')),
  media text NOT NULL,
  utm_source text NOT NULL,
  utm_medium text NOT NULL,
  landing_domain text,
  landing_path text,
  landing_query_has_params boolean DEFAULT false,
  landing_hash_present boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS utm_link_generations_created_idx ON public.utm_link_generations(created_at DESC);
CREATE INDEX IF NOT EXISTS utm_link_generations_adtype_idx ON public.utm_link_generations(adtype);
CREATE INDEX IF NOT EXISTS utm_link_generations_media_idx ON public.utm_link_generations(media);

-- 2. 공개 뷰 생성 (RLS 정책 없이 조회 가능)
CREATE OR REPLACE VIEW public.utm_link_generations_public AS
SELECT 
  id,
  created_at,
  adtype,
  media,
  utm_source,
  utm_medium,
  landing_domain,
  landing_path,
  landing_query_has_params,
  landing_hash_present
FROM public.utm_link_generations
ORDER BY created_at DESC;

-- 3. RLS 정책 설정
-- anon key로 INSERT 허용 (공개 기능)
ALTER TABLE public.utm_link_generations ENABLE ROW LEVEL SECURITY;

-- INSERT 정책: 누구나 INSERT 가능 (anon 및 authenticated)
CREATE POLICY "Allow anonymous insert on utm_link_generations"
ON public.utm_link_generations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- SELECT 정책: 누구나 조회 가능 (anon 및 authenticated)
CREATE POLICY "Allow anonymous select on utm_link_generations"
ON public.utm_link_generations
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. 뷰에 대한 권한 설정
GRANT SELECT ON public.utm_link_generations_public TO anon;
GRANT SELECT ON public.utm_link_generations_public TO authenticated;

