-- UTM Checker 로그 저장을 위한 테이블 생성
-- PRD_UTM_Checker_v1.2 기준

CREATE TABLE IF NOT EXISTS public.utm_checker_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL,
  input_url text NOT NULL,
  parsed_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  diagnosis jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS utm_checker_logs_user_id_idx ON public.utm_checker_logs(user_id);
CREATE INDEX IF NOT EXISTS utm_checker_logs_created_at_idx ON public.utm_checker_logs(created_at DESC);

-- RLS 정책 (선택사항 - 필요시 활성화)
-- ALTER TABLE public.utm_checker_logs ENABLE ROW LEVEL SECURITY;
-- 
-- CREATE POLICY "Users can view their own logs" ON public.utm_checker_logs
--   FOR SELECT USING (auth.uid() = user_id);
-- 
-- CREATE POLICY "Anyone can insert logs" ON public.utm_checker_logs
--   FOR INSERT WITH CHECK (true);



