-- Add device_type to click_analytics for better device targeting visualization
ALTER TABLE click_analytics ADD COLUMN IF NOT EXISTS device_type VARCHAR(20) DEFAULT 'desktop';

-- Create index for device analytics performance
CREATE INDEX IF NOT EXISTS idx_click_analytics_device ON click_analytics(device_type);
