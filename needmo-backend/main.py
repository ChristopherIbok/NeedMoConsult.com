"""main.py — NEEDMO Consult Backend API"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from dotenv import load_dotenv
import os

from database import engine, Base
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
    allow_origins=os.getenv("ALLOWED_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Static Files ───────────────────────────────────────────────────────────────
app.mount("/static", StaticFiles(directory="static"), name="static")

# ── Routers ───────────────────────────────────────────────────────────────────
app.include_router(auth.router,   prefix="/auth",   tags=["Auth"])
app.include_router(public.router, prefix="/public", tags=["Public"])
app.include_router(admin.router,  prefix="/admin",  tags=["Admin 🔒"])


@app.get("/", tags=["Health"])
def health():
    return {"status": "NEEDMO Consult API is running ✅"}
