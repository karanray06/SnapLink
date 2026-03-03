-- Add enterprise security and geo-fencing fields to url_mappings
ALTER TABLE url_mappings ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE url_mappings ADD COLUMN IF NOT EXISTS allowed_countries TEXT[]; -- Array of ISO country codes

-- Create index for geo-fencing if we ever filter by it in SQL
CREATE INDEX IF NOT EXISTS idx_urls_allowed_countries ON url_mappings USING GIN (allowed_countries);
