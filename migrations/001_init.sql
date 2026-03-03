-- Create URL mappings table
CREATE TABLE IF NOT EXISTS url_mappings (
    id SERIAL PRIMARY KEY,
    short_id VARCHAR(12) UNIQUE NOT NULL,
    long_url TEXT NOT NULL,
    custom_alias BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Create click analytics table
CREATE TABLE IF NOT EXISTS click_analytics (
    id SERIAL PRIMARY KEY,
    short_id VARCHAR(12) NOT NULL REFERENCES url_mappings(short_id) ON DELETE CASCADE,
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    browser VARCHAR(50),
    os VARCHAR(50),
    country VARCHAR(100),
    clicked_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_urls_short_id ON url_mappings(short_id);
CREATE INDEX IF NOT EXISTS idx_analytics_short_id ON click_analytics(short_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicked_at ON click_analytics(clicked_at);
