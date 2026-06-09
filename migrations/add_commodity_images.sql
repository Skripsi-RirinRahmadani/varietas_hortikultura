-- Migration: Add commodity images to image_url field
-- Description: Update commodities table dengan image URLs dari public folder

-- Update Ketimun
UPDATE commodities SET image_url = '/ketimun.png' WHERE name = 'Ketimun';

-- Update Kacang Panjang
UPDATE commodities SET image_url = '/kacang_panjang.png' WHERE name = 'Kacang Panjang';

-- Update Kangkung
UPDATE commodities SET image_url = '/kangkung.png' WHERE name = 'Kangkung';

-- Update Terung
UPDATE commodities SET image_url = '/terung.png' WHERE name = 'Terung';

-- Update Cabe Rawit
UPDATE commodities SET image_url = '/cabe_rawit.png' WHERE name = 'Cabe Rawit';

-- Update Cabe Keriting
UPDATE commodities SET image_url = '/cabe_keriting.png' WHERE name = 'Cabe Keriting';

-- Update Cabe Besar
UPDATE commodities SET image_url = '/cabe_besar.png' WHERE name = 'Cabe Besar';

-- Update Tomat
UPDATE commodities SET image_url = '/tomat.png' WHERE name = 'Tomat';

-- Update Semangka
UPDATE commodities SET image_url = '/semangka.png' WHERE name = 'Semangka';

-- Update Bayam
UPDATE commodities SET image_url = '/bayam.png' WHERE name = 'Bayam';

-- Verify updates
SELECT id, name, image_url FROM commodities WHERE name IN (
  'Ketimun', 'Kacang Panjang', 'Kangkung', 'Terung', 'Cabe Rawit',
  'Cabe Keriting', 'Cabe Besar', 'Tomat', 'Semangka', 'Bayam'
);
