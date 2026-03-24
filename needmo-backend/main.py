"""main.py — NEEDMO Consult Backend API"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

from database import engine, Base
import models
from routers import auth, public, admin

load_dotenv()

# Create tables on startup
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NEEDMO Consult API",
    description="Backend for needmoconsult.com — auth, contact form, waitlist, newsletter.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
    allow_credentials=True,
)

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,   prefix="/auth",   tags=["Auth"])
app.include_router(public.router, prefix="/public", tags=["Public"])
app.include_router(admin.router,  prefix="/admin",  tags=["Admin 🔒"])


@app.get("/", tags=["Health"])
def health():
    return {"status": "NEEDMO Consult API is running ✅"}
