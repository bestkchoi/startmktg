-- campaign_channels 테이블 생성 및 RLS 정책 설정
-- campaigns 테이블의 campaign_id를 참조하도록 수정

-- 1. campaign_channels 테이블 생성 (campaigns.campaign_id 참조)
CREATE TABLE IF NOT EXISTS public.campaign_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL,
  channel_type text NOT NULL,
  landing_url text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  final_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT campaign_channels_campaign_id_fkey 
    FOREIGN KEY (campaign_id) 
    REFERENCES public.campaigns(campaign_id) 
    ON DELETE CASCADE
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS campaign_channels_campaign_idx 
  ON public.campaign_channels(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS campaign_channels_type_idx 
  ON public.campaign_channels(channel_type);

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_campaign_channel_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_campaign_channels_updated_at ON public.campaign_channels;
CREATE TRIGGER update_campaign_channels_updated_at
  BEFORE UPDATE ON public.campaign_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_channel_updated_at();

-- 4. RLS 활성화
ALTER TABLE public.campaign_channels ENABLE ROW LEVEL SECURITY;

-- 5. 기존 RLS 정책 삭제 (있을 경우)
DROP POLICY IF EXISTS "campaign_channels_select_own" ON public.campaign_channels;
DROP POLICY IF EXISTS "campaign_channels_insert_own" ON public.campaign_channels;
DROP POLICY IF EXISTS "campaign_channels_update_own" ON public.campaign_channels;
DROP POLICY IF EXISTS "campaign_channels_delete_own" ON public.campaign_channels;
DROP POLICY IF EXISTS "campaign_channels_select_all" ON public.campaign_channels;
DROP POLICY IF EXISTS "campaign_channels_insert_all" ON public.campaign_channels;
DROP POLICY IF EXISTS "campaign_channels_update_all" ON public.campaign_channels;
DROP POLICY IF EXISTS "campaign_channels_delete_all" ON public.campaign_channels;

-- 6. 새로운 RLS 정책 생성 (로그인 없이도 사용 가능)
-- SELECT: 모든 사용자 조회 가능
CREATE POLICY "campaign_channels_select_all"
  ON public.campaign_channels
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: 모든 사용자 생성 가능
CREATE POLICY "campaign_channels_insert_all"
  ON public.campaign_channels
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: 모든 사용자 수정 가능
CREATE POLICY "campaign_channels_update_all"
  ON public.campaign_channels
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: 모든 사용자 삭제 가능
CREATE POLICY "campaign_channels_delete_all"
  ON public.campaign_channels
  FOR DELETE
  TO anon, authenticated
  USING (true);

