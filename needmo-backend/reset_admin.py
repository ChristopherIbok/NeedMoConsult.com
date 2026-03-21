"""
reset_admin.py — Reset password for any admin account.
Works for both creating new admins AND updating existing ones.

Usage:
    python reset_admin.py

Edit the ADMIN entries at the bottom before running.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from database import engine, SessionLocal, Base
import models
from core.security import hash_password

def create_tables():
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created")


def upsert_admin(name: str, email: str, password: str):
    db = SessionLocal()
    try:
        existing = db.query(models.Admin).filter(models.Admin.email == email).first()
        if existing:
            existing.name = name
            existing.password = hash_password(password)
            db.commit()
            print(f"✅ Password updated for: {name} <{email}>")
        else:
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
    create_tables()
    
    # ── Edit these accounts ─────────────────────────────────────────────
    admins = [
        {
            "name": "Chris",
            "email": "hello@needmoconsult.com",
            "password": "YOUR_NEW_PASSWORD_HERE",  # CHANGE THIS
        },
        {
            "name": "Team Member 1",
            "email": "team@needmoconsult.com",
            "password": "YOUR_NEW_PASSWORD_HERE",  # CHANGE THIS
        },
        {
            "name": "Team Member 2",
            "email": "support@needmoconsult.com",
            "password": "YOUR_NEW_PASSWORD_HERE",  # CHANGE THIS
        },
    ]
    # ─────────────────────────────────────────────────────────────────

    for admin in admins:
        upsert_admin(admin["name"], admin["email"], admin["password"])

    print("\nDone! You can now log in at POST /auth/login")
