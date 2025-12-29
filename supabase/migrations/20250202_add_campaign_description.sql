-- 캠페인 설명 필드 추가
ALTER TABLE public.campaigns
ADD COLUMN IF NOT EXISTS description text;

-- 설명
COMMENT ON COLUMN public.campaigns.description IS '캠페인 설명 (한글 원본 등)';
