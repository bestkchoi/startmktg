-- Start Campaign PRD v1.1 기반 데이터베이스 마이그레이션
-- campaigns 테이블을 PRD 요구사항에 맞게 재구성

-- 기존 campaigns 테이블이 있다면 백업 후 삭제 (개발 환경)
-- DROP TABLE IF EXISTS public.campaigns CASCADE;

-- 1. campaigns 테이블 생성 (PRD 5.1 기준)
CREATE TABLE IF NOT EXISTS public.campaigns (
  campaign_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_name text NOT NULL,
  normalized_name text NOT NULL,
  final_campaign_name text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  brand_id uuid NOT NULL, -- 일단 user_id를 brand_id로 사용 (향후 brands 테이블 추가 가능)
  creator_user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- PRD 5.2: 동일 brandId 내에서 finalCampaignName은 반드시 유일해야 함
  CONSTRAINT campaigns_brand_final_name_unique UNIQUE (brand_id, final_campaign_name),
  
  -- 날짜 검증: 종료일이 시작일 이후여야 함 (end_date가 NULL이면 체크 안 함)
  CONSTRAINT campaigns_date_check CHECK (
    end_date IS NULL OR end_date >= start_date
  ),
  
  -- normalizedName은 소문자 영어로 시작해야 함
  CONSTRAINT campaigns_normalized_name_check CHECK (
    normalized_name ~ '^[a-z]'
  )
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS campaigns_brand_created_idx 
  ON public.campaigns(brand_id, created_at DESC);

CREATE INDEX IF NOT EXISTS campaigns_creator_created_idx 
  ON public.campaigns(creator_user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS campaigns_final_name_idx 
  ON public.campaigns(final_campaign_name);

-- updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION public.update_campaign_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_campaigns_updated_at ON public.campaigns;
CREATE TRIGGER update_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_campaign_updated_at();

-- RLS (Row Level Security) 정책
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신이 생성한 캠페인만 조회 가능
DROP POLICY IF EXISTS "campaigns_select_own" ON public.campaigns;
CREATE POLICY "campaigns_select_own"
  ON public.campaigns
  FOR SELECT
  TO authenticated
  USING (auth.uid() = creator_user_id);

-- 사용자는 자신이 생성한 캠페인만 생성 가능
DROP POLICY IF EXISTS "campaigns_insert_own" ON public.campaigns;
CREATE POLICY "campaigns_insert_own"
  ON public.campaigns
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = creator_user_id);

-- 사용자는 자신이 생성한 캠페인만 수정 가능
DROP POLICY IF EXISTS "campaigns_update_own" ON public.campaigns;
CREATE POLICY "campaigns_update_own"
  ON public.campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = creator_user_id)
  WITH CHECK (auth.uid() = creator_user_id);

-- 사용자는 자신이 생성한 캠페인만 삭제 가능
DROP POLICY IF EXISTS "campaigns_delete_own" ON public.campaigns;
CREATE POLICY "campaigns_delete_own"
  ON public.campaigns
  FOR DELETE
  TO authenticated
  USING (auth.uid() = creator_user_id);












