-- Meta 광고 이름 컬럼 추가
-- campaign_channels 테이블에 Meta 광고 관리자에서 사용할 이름 필드 추가

ALTER TABLE public.campaign_channels
ADD COLUMN IF NOT EXISTS meta_campaign_name text,
ADD COLUMN IF NOT EXISTS meta_adset_name text,
ADD COLUMN IF NOT EXISTS meta_ad_name text;

-- 인덱스 추가 (Meta 광고 이름 검색 최적화)
CREATE INDEX IF NOT EXISTS campaign_channels_meta_campaign_name_idx 
  ON public.campaign_channels(meta_campaign_name) 
  WHERE meta_campaign_name IS NOT NULL;

CREATE INDEX IF NOT EXISTS campaign_channels_meta_adset_name_idx 
  ON public.campaign_channels(meta_adset_name) 
  WHERE meta_adset_name IS NOT NULL;





