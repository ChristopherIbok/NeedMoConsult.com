"""main.py — NEEDMO Consult Backend API"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os
import logging

from database import engine, Base, SessionLocal
from routers import auth, public, admin

load_dotenv()

logger = logging.getLogger(__name__)

# Create tables on startup
Base.metadata.create_all(bind=engine)

# Run migrations for new columns/tables
def run_migrations():
    try:
        db = SessionLocal()
        try:
            # Add links column if not exists
            result = db.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name = 'links'
            """)
            if not result.fetchone():
                db.execute("ALTER TABLE tasks ADD COLUMN links TEXT")
                logger.info("Added 'links' column to tasks")
            
            # Add image_urls column if not exists
            result = db.execute("""
                SELECT column_name FROM information_schema.columns 
                WHERE table_name = 'tasks' AND column_name = 'image_urls'
            """)
            if not result.fetchone():
                db.execute("ALTER TABLE tasks ADD COLUMN image_urls TEXT")
                logger.info("Added 'image_urls' column to tasks")
            
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
                logger.info("Created task_comments table")
            
            db.commit()
            logger.info("Migrations complete")
        finally:
            db.close()
    except Exception as e:
        logger.error(f"Migration error (non-fatal): {e}")

run_migrations()

app = FastAPI(
    title="NEEDMO Consult API",
    description="Backend for needmoconsult.com — auth, contact form, waitlist, newsletter.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,   prefix="/auth",   tags=["Auth"])
app.include_router(public.router, prefix="/public", tags=["Public"])
app.include_router(admin.router,  prefix="/admin",  tags=["Admin 🔒"])


@app.get("/", tags=["Health"])
def health():
    return {"status": "NEEDMO Consult API is running ✅"}
