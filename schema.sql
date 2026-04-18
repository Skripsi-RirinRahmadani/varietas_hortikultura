-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Districts table
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Commodities table
CREATE TABLE IF NOT EXISTS commodities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  image_url TEXT,
  soil_type TEXT,
  ph_min FLOAT8,
  ph_max FLOAT8,
  rainfall_min FLOAT8,
  rainfall_max FLOAT8,
  temp_min FLOAT8,
  temp_max FLOAT8,
  district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Biasa' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  soil_type TEXT NOT NULL,
  ph FLOAT8 NOT NULL,
  rainfall FLOAT8 NOT NULL,
  temperature FLOAT8 NOT NULL,
  elevation FLOAT8 NOT NULL,
  variety_name TEXT NOT NULL,
  confidence_score FLOAT8 NOT NULL,
  accuracy FLOAT8,
  precision FLOAT8,
  recall FLOAT8,
  f1_score FLOAT8,
  recommendation TEXT,
  user_id UUID
);

-- Enable RLS
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE commodities ENABLE ROW LEVEL SECURITY;
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;

-- Basic Policies
-- Districts: Read for all, Write for authenticated (admin usually)
CREATE POLICY "Districts are viewable by everyone" ON districts FOR SELECT USING (true);
CREATE POLICY "Districts can be modified by authenticated users" ON districts 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Commodities: Read for all, Write for authenticated
CREATE POLICY "Commodities are viewable by everyone" ON commodities FOR SELECT USING (true);
CREATE POLICY "Commodities can be modified by authenticated users" ON commodities 
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Predictions: Read for all, Write for anyone (or authenticated)
CREATE POLICY "Predictions are viewable by everyone" ON predictions FOR SELECT USING (true);
CREATE POLICY "Predictions can be inserted by anyone" ON predictions 
  FOR INSERT WITH CHECK (true);
CREATE POLICY "Predictions can be modified by authenticated users" ON predictions 
  FOR UPDATE, DELETE TO authenticated USING (true);
