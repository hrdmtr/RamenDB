-- Scraping management tables for comprehensive restaurant data collection

-- Stations master table (神奈川県の全駅)
CREATE TABLE IF NOT EXISTS stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL, -- 駅名（例: 成瀬駅）
  prefecture TEXT NOT NULL DEFAULT '神奈川県',
  city TEXT, -- 市区町村（例: 町田市）
  railway TEXT, -- 路線名（例: 横浜線）
  latitude DECIMAL(10, 8), -- 緯度
  longitude DECIMAL(11, 8), -- 経度
  is_active BOOLEAN DEFAULT true, -- スクレイピング対象かどうか
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, railway) -- 駅名と路線名の組み合わせでユニーク
);

-- Scraping jobs table (スクレイピング実行管理)
CREATE TABLE IF NOT EXISTS scraping_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  station_id UUID REFERENCES stations(id) ON DELETE CASCADE,
  query TEXT NOT NULL, -- 検索キーワード（例: ラーメン、ラーメンショップ）
  radius INTEGER DEFAULT 3000, -- 検索半径（メートル）
  status TEXT NOT NULL DEFAULT 'pending', -- pending, running, completed, failed
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  restaurants_found INTEGER DEFAULT 0, -- 検索でヒットした店舗数
  restaurants_new INTEGER DEFAULT 0, -- 新規登録数
  restaurants_updated INTEGER DEFAULT 0, -- 更新数
  restaurants_failed INTEGER DEFAULT 0, -- 失敗数
  error_message TEXT, -- エラーメッセージ
  log_file_path TEXT, -- ログファイルのパス
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scraping results detail (各店舗の収集履歴)
CREATE TABLE IF NOT EXISTS scraping_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES scraping_jobs(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
  action TEXT NOT NULL, -- 'created' or 'updated'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_stations_prefecture ON stations(prefecture);
CREATE INDEX IF NOT EXISTS idx_stations_active ON stations(is_active);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_station ON scraping_jobs(station_id);
CREATE INDEX IF NOT EXISTS idx_scraping_jobs_status ON scraping_jobs(status);
CREATE INDEX IF NOT EXISTS idx_scraping_results_job ON scraping_results(job_id);
CREATE INDEX IF NOT EXISTS idx_scraping_results_restaurant ON scraping_results(restaurant_id);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_stations_updated_at
  BEFORE UPDATE ON stations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scraping_jobs_updated_at
  BEFORE UPDATE ON scraping_jobs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Initial data: Kanagawa Prefecture stations
-- 主要駅のみ初期投入（後で全駅追加可能）
INSERT INTO stations (name, prefecture, city, railway, latitude, longitude) VALUES
  ('横浜駅', '神奈川県', '横浜市', '東海道本線', 35.4657, 139.6220),
  ('川崎駅', '神奈川県', '川崎市', '東海道本線', 35.5306, 139.6976),
  ('相模大野駅', '神奈川県', '相模原市', '小田急線', 35.5314, 139.4274),
  ('町田駅', '神奈川県', '相模原市', '横浜線', 35.5428, 139.4263),
  ('成瀬駅', '神奈川県', '町田市', '横浜線', 35.5355, 139.4729),
  ('鶴川駅', '神奈川県', '町田市', '小田急線', 35.5631, 139.4867),
  ('つきみ野駅', '神奈川県', '大和市', '東急田園都市線', 35.5175, 139.4565),
  ('中央林間駅', '神奈川県', '大和市', '小田急線', 35.5164, 139.4517),
  ('藤沢駅', '神奈川県', '藤沢市', '東海道本線', 35.3401, 139.4875),
  ('小田原駅', '神奈川県', '小田原市', '東海道本線', 35.2558, 139.1562)
ON CONFLICT (name, railway) DO NOTHING;
