-- Google 광고 이름 컬럼 추가
-- campaign_channels 테이블에 Google Ads에서 사용할 이름 필드 추가

ALTER TABLE public.campaign_channels
ADD COLUMN IF NOT EXISTS google_campaign_name text,
ADD COLUMN IF NOT EXISTS google_adgroup_name text,
ADD COLUMN IF NOT EXISTS google_ad_name text;

-- 인덱스 추가 (Google 광고 이름 검색 최적화)
CREATE INDEX IF NOT EXISTS campaign_channels_google_campaign_name_idx 
  ON public.campaign_channels(google_campaign_name) 
  WHERE google_campaign_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS campaign_channels_google_adgroup_name_idx 
  ON public.campaign_channels(google_adgroup_name) 
  WHERE google_adgroup_name IS NOT NULL;



