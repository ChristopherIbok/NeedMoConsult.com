"""
list_admins.py — List all admin accounts in the database.
"""

import os
from dotenv import load_dotenv
load_dotenv()

from database import SessionLocal
import models

def list_admins():
    db = SessionLocal()
    try:
        admins = db.query(models.Admin).all()
        if not admins:
            print("No admin accounts found.")
            return
        
        print(f"Found {len(admins)} admin account(s):\n")
        for admin in admins:
            print(f"  ID:    {admin.id}")
            print(f"  Name:  {admin.name}")
            print(f"  Email: {admin.email}")
            print(f"  Created: {admin.created_at}")
            print("-" * 30)
    finally:
        db.close()

if __name__ == "__main__":
    list_admins()