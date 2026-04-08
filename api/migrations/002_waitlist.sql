-- Migration: 002_waitlist.sql
-- Adds waitlist/subscribers table for newsletter

CREATE TABLE IF NOT EXISTS waitlist_subscribers (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'unsubscribed')),
    subscribed_at TEXT DEFAULT (datetime('now')),
    unsubscribed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_waitlist_email ON waitlist_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_waitlist_status ON waitlist_subscribers(status);