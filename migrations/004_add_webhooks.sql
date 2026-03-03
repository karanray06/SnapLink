CREATE TABLE IF NOT EXISTS webhook_subscriptions (
    id SERIAL PRIMARY KEY,
    owner_name TEXT NOT NULL,
    target_url TEXT NOT NULL,
    event_type TEXT DEFAULT 'url.click',
    is_active BOOLEAN DEFAULT TRUE,
    secret TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
