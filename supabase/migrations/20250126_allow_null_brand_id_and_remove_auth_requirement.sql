-- campaigns 테이블을 로그인 없이 사용 가능하도록 수정
-- brand_id와 creator_user_id를 NULL 허용으로 변경
-- RLS 정책을 수정하여 로그인 없이도 사용 가능하도록 변경

-- campaigns 테이블이 존재하지 않으면 먼저 생성
CREATE TABLE IF NOT EXISTS public.campaigns (
  campaign_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  raw_name text NOT NULL,
  normalized_name text NOT NULL,
  final_campaign_name text NOT NULL,
  start_date date NOT NULL,
  end_date date,
  brand_id uuid, -- NULL 허용
  creator_user_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- NULL 허용
  user_id uuid REFERENCES public.users(id) ON DELETE SET NULL, -- 추가 필드
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  -- 날짜 검증: 종료일이 시작일 이후여야 함 (end_date가 NULL이면 체크 안 함)
  CONSTRAINT campaigns_date_check CHECK (
    end_date IS NULL OR end_date >= start_date
  ),
  
  -- normalizedName은 소문자 영어로 시작해야 함
  CONSTRAINT campaigns_normalized_name_check CHECK (
    normalized_name ~ '^[a-z]'
  )
);

-- 인덱스 생성 (이미 존재하면 무시)
CREATE INDEX IF NOT EXISTS campaigns_brand_created_idx 
  ON public.campaigns(brand_id, created_at DESC)
  WHERE brand_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS campaigns_creator_created_idx 
  ON public.campaigns(creator_user_id, created_at DESC)
  WHERE creator_user_id IS NOT NULL;

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

-- 1. brand_id를 NULL 허용으로 변경 (이미 NULL 허용이면 에러 없음)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'campaigns' 
    AND column_name = 'brand_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.campaigns ALTER COLUMN brand_id DROP NOT NULL;
  END IF;
END $$;

-- 2. creator_user_id를 NULL 허용으로 변경 (이미 NULL 허용이면 에러 없음)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'campaigns' 
    AND column_name = 'creator_user_id'
    AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE public.campaigns ALTER COLUMN creator_user_id DROP NOT NULL;
  END IF;
END $$;

-- 3. UNIQUE 제약조건 수정 (brand_id가 NULL일 수 있으므로)
-- 기존 제약조건 삭제
ALTER TABLE public.campaigns 
  DROP CONSTRAINT IF EXISTS campaigns_brand_final_name_unique;
  
-- 기존 인덱스 삭제 (있을 경우)
DROP INDEX IF EXISTS public.campaigns_brand_final_name_unique;
DROP INDEX IF EXISTS public.campaigns_final_name_unique_when_brand_null;

-- 새로운 제약조건 추가 (brand_id가 NULL인 경우와 아닌 경우 모두 처리)
-- NULL인 경우: final_campaign_name만 유일
-- NULL이 아닌 경우: (brand_id, final_campaign_name) 조합이 유일
CREATE UNIQUE INDEX IF NOT EXISTS campaigns_brand_final_name_unique 
  ON public.campaigns(brand_id, final_campaign_name)
  WHERE brand_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS campaigns_final_name_unique_when_brand_null
  ON public.campaigns(final_campaign_name)
  WHERE brand_id IS NULL;

-- 4. RLS 활성화
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- 기존 RLS 정책 삭제
DROP POLICY IF EXISTS "campaigns_select_own" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_insert_own" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_update_own" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_delete_own" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_select_all" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_insert_all" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_update_all" ON public.campaigns;
DROP POLICY IF EXISTS "campaigns_delete_all" ON public.campaigns;

-- 5. 새로운 RLS 정책 생성 (로그인 없이도 사용 가능)
-- SELECT: 모든 사용자 조회 가능 (anon: 비로그인, authenticated: 로그인)
CREATE POLICY "campaigns_select_all"
  ON public.campaigns
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT: 모든 사용자 생성 가능
CREATE POLICY "campaigns_insert_all"
  ON public.campaigns
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- UPDATE: 모든 사용자 수정 가능 (향후 필요시 제한 가능)
CREATE POLICY "campaigns_update_all"
  ON public.campaigns
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE: 모든 사용자 삭제 가능 (향후 필요시 제한 가능)
CREATE POLICY "campaigns_delete_all"
  ON public.campaigns
  FOR DELETE
  TO anon, authenticated
  USING (true);

