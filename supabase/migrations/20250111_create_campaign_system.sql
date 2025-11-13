-- Start Campaign 서비스를 위한 데이터베이스 마이그레이션
-- campaigns, campaign_channels, utm_templates 테이블 생성

-- 1. campaigns 테이블
CREATE TABLE IF NOT EXISTS public.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_name text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT campaigns_date_check CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS campaigns_user_created_idx ON public.campaigns(user_id, created_at DESC);

-- 2. campaign_channels 테이블
CREATE TABLE IF NOT EXISTS public.campaign_channels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  channel_type text NOT NULL,
  landing_url text NOT NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  final_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS campaign_channels_campaign_idx ON public.campaign_channels(campaign_id, created_at DESC);
CREATE INDEX IF NOT EXISTS campaign_channels_type_idx ON public.campaign_channels(channel_type);

-- 3. utm_templates 테이블
CREATE TABLE IF NOT EXISTS public.utm_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_type text NOT NULL UNIQUE,
  utm_source_pattern text,
  utm_medium_pattern text,
  utm_campaign_pattern text,
  utm_content_pattern text,
  utm_term_pattern text,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS utm_templates_channel_idx ON public.utm_templates(channel_type);

-- 4. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_campaign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- campaigns 테이블 트리거
DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_updated_at();

-- campaign_channels 테이블 트리거
DROP TRIGGER IF EXISTS update_campaign_channels_updated_at ON public.campaign_channels;
CREATE TRIGGER update_campaign_channels_updated_at
  BEFORE UPDATE ON public.campaign_channels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_updated_at();

-- utm_templates 테이블 트리거
DROP TRIGGER IF EXISTS update_utm_templates_updated_at ON public.utm_templates;
CREATE TRIGGER update_utm_templates_updated_at
  BEFORE UPDATE ON public.utm_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_updated_at();

-- 5. RLS (Row Level Security) 정책

-- campaigns 테이블 RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 생성한 캠페인만 조회 가능
DROP POLICY IF EXISTS "campaigns_select_own" ON public.campaigns;
CREATE POLICY "campaigns_select_own"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- 사용자는 자신이 생성한 캠페인만 생성 가능
DROP POLICY IF EXISTS "campaigns_insert_own" ON public.campaigns;
CREATE POLICY "campaigns_insert_own"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신이 생성한 캠페인만 수정 가능
DROP POLICY IF EXISTS "campaigns_update_own" ON public.campaigns;
CREATE POLICY "campaigns_update_own"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신이 생성한 캠페인만 삭제 가능
DROP TRIGGER IF EXISTS "campaigns_delete_own" ON public.campaigns;
CREATE POLICY "campaigns_delete_own"
  ON public.campaigns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- campaign_channels 테이블 RLS
ALTER TABLE public.campaign_channels ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 생성한 캠페인의 매체만 조회 가능
DROP POLICY IF EXISTS "campaign_channels_select_own" ON public.campaign_channels;
CREATE POLICY "campaign_channels_select_own"
  ON public.campaign_channels
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_channels.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- 사용자는 자신이 생성한 캠페인에만 매체 추가 가능
DROP POLICY IF EXISTS "campaign_channels_insert_own" ON public.campaign_channels;
CREATE POLICY "campaign_channels_insert_own"
  ON public.campaign_channels
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_channels.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- 사용자는 자신이 생성한 캠페인의 매체만 수정 가능
DROP POLICY IF EXISTS "campaign_channels_update_own" ON public.campaign_channels;
CREATE POLICY "campaign_channels_update_own"
  ON public.campaign_channels
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_channels.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_channels.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- 사용자는 자신이 생성한 캠페인의 매체만 삭제 가능
DROP POLICY IF EXISTS "campaign_channels_delete_own" ON public.campaign_channels;
CREATE POLICY "campaign_channels_delete_own"
  ON public.campaign_channels
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.campaigns
      WHERE campaigns.id = campaign_channels.campaign_id
        AND campaigns.user_id = auth.uid()
    )
  );

-- utm_templates 테이블 RLS
ALTER TABLE public.utm_templates ENABLE ROW LEVEL SECURITY;

-- 모든 인증된 사용자가 템플릿 조회 가능
DROP POLICY IF EXISTS "utm_templates_select_all" ON public.utm_templates;
CREATE POLICY "utm_templates_select_all"
  ON public.utm_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- 템플릿 수정/삭제는 향후 관리자 권한으로 제한 (현재는 모든 인증 사용자 허용)
DROP POLICY IF EXISTS "utm_templates_insert_all" ON public.utm_templates;
CREATE POLICY "utm_templates_insert_all"
  ON public.utm_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "utm_templates_update_all" ON public.utm_templates;
CREATE POLICY "utm_templates_update_all"
  ON public.utm_templates
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "utm_templates_delete_all" ON public.utm_templates;
CREATE POLICY "utm_templates_delete_all"
  ON public.utm_templates
  FOR DELETE
  TO authenticated
  USING (true);
