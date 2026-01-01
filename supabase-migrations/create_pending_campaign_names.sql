-- pending_campaign_names 테이블 생성
-- 사전 정의되지 않은 캠페인명을 저장하는 테이블

CREATE TABLE IF NOT EXISTS pending_campaign_names (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  korean TEXT NOT NULL UNIQUE,
  english TEXT,
  normalized TEXT,
  timestamp TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 추가 (조회 성능 향상)
CREATE INDEX IF NOT EXISTS idx_pending_campaign_names_korean ON pending_campaign_names(korean);
CREATE INDEX IF NOT EXISTS idx_pending_campaign_names_timestamp ON pending_campaign_names(timestamp DESC);

-- RLS (Row Level Security) 정책 설정 (모든 사용자가 읽고 쓸 수 있도록)
ALTER TABLE pending_campaign_names ENABLE ROW LEVEL SECURITY;

-- 모든 사용자가 읽을 수 있도록 정책 추가
CREATE POLICY "Allow public read access" ON pending_campaign_names
  FOR SELECT
  USING (true);

-- 모든 사용자가 쓸 수 있도록 정책 추가
CREATE POLICY "Allow public insert access" ON pending_campaign_names
  FOR INSERT
  WITH CHECK (true);


