-- Seed a default enterprise API key for testing
-- Hash of 'enterprise-test-key'
INSERT INTO api_keys (key_hash, owner_name, usage_quota)
VALUES ('f32856008f8e07922390e2b6f89935ce6bf48fd04f9693bcea6e9ab32d561a9e', 'Master Admin', 10000)
ON CONFLICT (key_hash) DO NOTHING;
