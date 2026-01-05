-- UTM LINK 공유 테이블
-- 공유 링크를 통해 UTM 생성 결과를 공유하는 기능

-- 1. utm_link_shares 테이블 생성
CREATE TABLE IF NOT EXISTS public.utm_link_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  share_code text NOT NULL UNIQUE,
  created_at timestamptz DEFAULT now(),
  adtype text NOT NULL CHECK (adtype IN ('sa', 'sp', 'da', 'cr')),
  media text NOT NULL,
  utm_source text NOT NULL,
  utm_medium text NOT NULL,
  campaign_id text NOT NULL,
  adgroup_name text NOT NULL,
  clean_landing_url text NOT NULL,
  final_utm_url text NOT NULL,
  note text
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS utm_link_shares_share_code_idx ON public.utm_link_shares(share_code);
CREATE INDEX IF NOT EXISTS utm_link_shares_created_idx ON public.utm_link_shares(created_at DESC);

-- 2. 권한 부여 (RLS 정책 설정 전에 권한 부여)
GRANT INSERT ON public.utm_link_shares TO anon;
GRANT INSERT ON public.utm_link_shares TO authenticated;
GRANT SELECT ON public.utm_link_shares TO anon;
GRANT SELECT ON public.utm_link_shares TO authenticated;

-- 3. RLS 정책 설정
-- 공개 기능이므로 로그인 없이 누구나 사용 가능
ALTER TABLE public.utm_link_shares ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Allow anonymous insert on utm_link_shares" ON public.utm_link_shares;
DROP POLICY IF EXISTS "Allow anonymous select on utm_link_shares" ON public.utm_link_shares;

-- INSERT 정책: 누구나 INSERT 가능 (anon 및 authenticated)
CREATE POLICY "Allow anonymous insert on utm_link_shares"
ON public.utm_link_shares
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- SELECT 정책: 누구나 조회 가능 (anon 및 authenticated)
CREATE POLICY "Allow anonymous select on utm_link_shares"
ON public.utm_link_shares
FOR SELECT
TO anon, authenticated
USING (true);

-- 4. 스키마 캐시 새로고침 (PGRST205 에러 해결)
-- Supabase PostgREST가 새로운 테이블을 인식하도록 스키마 캐시를 새로고침
NOTIFY pgrst, 'reload schema';

