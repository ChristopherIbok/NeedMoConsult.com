"""
migration_add_task_fields.py — Add new fields to existing database.
Run this once to add links, image_urls to tasks and create task_comments table.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from database import engine, SessionLocal, Base
import models

def migrate():
    db = SessionLocal()
    try:
        # Check if columns exist, add if not
        result = db.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'links'
        """)
        if not result.fetchone():
            db.execute("ALTER TABLE tasks ADD COLUMN links TEXT")
            print("Added 'links' column to tasks")
        
        result = db.execute("""
            SELECT column_name FROM information_schema.columns 
            WHERE table_name = 'tasks' AND column_name = 'image_urls'
        """)
        if not result.fetchone():
            db.execute("ALTER TABLE tasks ADD COLUMN image_urls TEXT")
            print("Added 'image_urls' column to tasks")
        
        # Create task_comments table if not exists
        result = db.execute("""
            SELECT table_name FROM information_schema.tables 
            WHERE table_name = 'task_comments'
        """)
        if not result.fetchone():
            db.execute("""
                CREATE TABLE task_comments (
                    id SERIAL PRIMARY KEY,
                    task_id INTEGER NOT NULL,
                    author VARCHAR,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
                )
            """)
            print("Created task_comments table")
        
        db.commit()
        print("Migration complete!")
    except Exception as e:
        print(f"Migration error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    migrate()