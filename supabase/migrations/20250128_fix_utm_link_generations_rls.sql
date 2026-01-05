-- UTM LINK 생성 로그 테이블 RLS 정책 수정
-- 기존 정책이 제대로 작동하지 않는 경우를 대비한 수정 스크립트

-- 1. 기존 정책 삭제 (존재하는 경우)
DROP POLICY IF EXISTS "Allow anonymous insert on utm_link_generations" ON public.utm_link_generations;
DROP POLICY IF EXISTS "Allow anonymous select on utm_link_generations" ON public.utm_link_generations;

-- 2. RLS 활성화 확인
ALTER TABLE public.utm_link_generations ENABLE ROW LEVEL SECURITY;

-- 3. INSERT 정책 재생성 (anon 및 authenticated 모두 허용)
CREATE POLICY "Allow anonymous insert on utm_link_generations"
ON public.utm_link_generations
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 4. SELECT 정책 재생성 (anon 및 authenticated 모두 허용)
CREATE POLICY "Allow anonymous select on utm_link_generations"
ON public.utm_link_generations
FOR SELECT
TO anon, authenticated
USING (true);

-- 5. 권한 확인
GRANT INSERT ON public.utm_link_generations TO anon;
GRANT INSERT ON public.utm_link_generations TO authenticated;
GRANT SELECT ON public.utm_link_generations TO anon;
GRANT SELECT ON public.utm_link_generations TO authenticated;




