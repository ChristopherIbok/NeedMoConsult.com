"""routers/public.py — Public endpoints: contact form + waitlist signup."""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlalchemy.orm import Session

from database import get_db
from mailer import send_email_async
from templates.email_templates import contact_notification_email, welcome_email
import models
import os
import logging
logger = logging.getLogger(__name__)

router = APIRouter()
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", os.getenv("SMTP_USER"))


# ── Schemas ───────────────────────────────────────────────────────────────────
class ContactRequest(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = ""
    message: str
    service_interest: Optional[str] = "N/A"


class WaitlistRequest(BaseModel):
    email: EmailStr
    name: Optional[str] = ""


# ── Contact Form ──────────────────────────────────────────────────────────────
@router.post("/contact")
async def submit_contact(req: ContactRequest, background_tasks: BackgroundTasks,
                         db: Session = Depends(get_db)):
    """Save contact form submission and notify admin by email."""

    # Save to DB
    entry = models.Contact(
        name=req.name,
        email=req.email,
        phone=req.phone,
        message=req.message,
        service_interest=req.service_interest,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Email admin in background
    try:
    await send_email_async(
        to=ADMIN_EMAIL,
        subject=f"📬 New Enquiry from {req.name}",
        html_body=contact_notification_email(
            name=req.name,
            email=req.email,
            phone=req.phone,
            message=req.message,
            service=req.service_interest,
        ),
        reply_to=req.email,
    )
except Exception as e:
    logger.error(f"Contact email failed: {e}")
return {"message": "Thank you! We'll be in touch soon.", "id": entry.id}


# ── Waitlist Signup ───────────────────────────────────────────────────────────
@router.post("/waitlist")
async def join_waitlist(req: WaitlistRequest, background_tasks: BackgroundTasks,
                        db: Session = Depends(get_db)):
    """Add email to waitlist. Sends a welcome email. Ignores duplicates gracefully."""

    existing = db.query(models.Waitlist).filter(models.Waitlist.email == req.email).first()
    if existing:
        return {"message": "You're already on the list!", "status": "existing"}

    entry = models.Waitlist(email=req.email, name=req.name)
    db.add(entry)
    db.commit()
    db.refresh(entry)

    # Send welcome email in background
    first_name = req.name.split()[0] if req.name else "there"
    try:
    await send_email_async(
        to=req.email,
        subject="You're on the NEEDMO Consult waitlist",
        html_body=welcome_email(first_name),
    )
except Exception as e:
    logger.error(f"Welcome email failed: {e}")
return {"message": "You're on the list! Check your inbox.", "id": entry.id}
        html_body=welcome_email(first_name),
    )

    return {"message": "You're on the list! Check your inbox.", "id": entry.id}


# ── Unsubscribe ───────────────────────────────────────────────────────────────
@router.get("/unsubscribe")
def unsubscribe(email: str, db: Session = Depends(get_db)):
    """Unsubscribe from newsletter. Called via link in emails."""
    entry = db.query(models.Waitlist).filter(models.Waitlist.email == email).first()
    if entry:
        entry.is_active = False
        db.commit()
    return {"message": "You've been unsubscribed successfully."}



@router.get("/blog")
def get_blog_posts(skip: int = 0, limit: int = 20, db: Session = Depends(get_db)):
    """Public endpoint — returns published newsletters as blog posts."""
    posts = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.published == True)
        .order_by(models.Newsletter.sent_at.desc())
        .offset(skip).limit(limit).all()
    )
    return {"posts": posts, "total": len(posts)}


@router.get("/blog/{post_id}")
def get_blog_post(post_id: int, db: Session = Depends(get_db)):
    """Fetch a single published newsletter as a blog post."""
    post = (
        db.query(models.Newsletter)
        .filter(models.Newsletter.id == post_id, models.Newsletter.published == True)
        .first()
    )
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post



class BookingRequest(BaseModel):
    name: str
    email: EmailStr
    company: Optional[str] = ""
    service: Optional[str] = ""
    date: str
    time: str
    message: Optional[str] = ""

@router.post("/booking")
async def create_booking(req: BookingRequest, db: Session = Depends(get_db)):
    """Save a booking request."""
    entry = models.Booking(
        name=req.name,
        email=req.email,
        company=req.company,
        service=req.service,
        date=req.date,
        time=req.time,
        message=req.message,
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return {"message": "Booking confirmed!", "id": entry.id}