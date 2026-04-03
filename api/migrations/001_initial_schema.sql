-- Migration: 001_initial_schema.sql
-- Creates all tables for video conferencing platform

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK(subscription_tier IN ('free', 'pro', 'business')),
    stripe_customer_id TEXT,
    email_verified INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON users(subscription_tier);

-- Meetings table
CREATE TABLE IF NOT EXISTS meetings (
    id TEXT PRIMARY KEY,
    host_user_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    scheduled_start TEXT,
    scheduled_end TEXT,
    is_instant INTEGER DEFAULT 0,
    meeting_link_slug TEXT UNIQUE NOT NULL,
    settings TEXT DEFAULT '{}',
    status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'active', 'ended', 'cancelled')),
    created_at TEXT DEFAULT (datetime('now')),
    ended_at TEXT,
    FOREIGN KEY (host_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_meetings_host ON meetings(host_user_id);
CREATE INDEX IF NOT EXISTS idx_meetings_slug ON meetings(meeting_link_slug);
CREATE INDEX IF NOT EXISTS idx_meetings_status ON meetings(status);
CREATE INDEX IF NOT EXISTS idx_meetings_scheduled ON meetings(scheduled_start);

-- Meeting participants table
CREATE TABLE IF NOT EXISTS meeting_participants (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    role TEXT DEFAULT 'participant' CHECK(role IN ('host', 'co_host', 'participant')),
    joined_at TEXT DEFAULT (datetime('now')),
    left_at TEXT,
    duration_seconds INTEGER,
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_participants_meeting ON meeting_participants(meeting_id);
CREATE INDEX IF NOT EXISTS idx_participants_user ON meeting_participants(user_id);

-- Recordings table
CREATE TABLE IF NOT EXISTS recordings (
    id TEXT PRIMARY KEY,
    meeting_id TEXT NOT NULL,
    recorded_by_user_id TEXT NOT NULL,
    r2_key TEXT NOT NULL,
    duration_seconds INTEGER,
    file_size_bytes INTEGER,
    status TEXT DEFAULT 'processing' CHECK(status IN ('processing', 'ready', 'failed')),
    download_count INTEGER DEFAULT 0,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (recorded_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_recordings_meeting ON recordings(meeting_id);
CREATE INDEX IF NOT EXISTS idx_recordings_user ON recordings(recorded_by_user_id);

-- Email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_email_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_tokens_user ON email_verification_tokens(user_id);

-- Password reset tokens table
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    used INTEGER DEFAULT 0,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_password_tokens_token ON password_reset_tokens(token);

-- Sessions table (for OAuth)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(token);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
