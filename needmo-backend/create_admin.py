"""
create_admin.py — Run this ONCE to create your admin account.

Usage:
    python create_admin.py

This is a one-time setup script. After running it, you can log in
via POST /auth/login with the email and password you set here.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from database import engine, SessionLocal, Base
import models
from core.security import hash_password

def create_tables():
    """Create all database tables."""
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")


def create_admin(name: str, email: str, password: str):
    db = SessionLocal()
    try:
        existing = db.query(models.Admin).filter(models.Admin.email == email).first()
        if existing:
            print(f"⚠️  Admin with email {email} already exists")
            return

        admin = models.Admin(
            name=name,
            email=email,
            password=hash_password(password),
        )
        db.add(admin)
        db.commit()
        print(f"✅ Admin created: {name} <{email}>")
    finally:
        db.close()


if __name__ == "__main__":
    # ── Edit these before running ─────────────────────────────────────────────
    ADMIN_NAME     = "Kriz"
    ADMIN_EMAIL    = "hello@needmoconsult.com"   # your login email
    ADMIN_PASSWORD = "replace_with_strong_password"
    # ─────────────────────────────────────────────────────────────────────────

    create_tables()
    create_admin(ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD)
    print("\n🚀 Setup complete. You can now log in at POST /auth/login")
