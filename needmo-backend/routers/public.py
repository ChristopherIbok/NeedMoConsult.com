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
            subject=f" New Enquiry from {req.name}",
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
            subject="You're on the NEEDMO Consult waitlist 🎉",
            html_body=welcome_email(first_name),
        )
    except Exception as e:
        logger.error(f"Welcome email failed: {e}")
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
async def create_booking(req: BookingRequest, background_tasks: BackgroundTasks,
                         db: Session = Depends(get_db)):
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
    
    return {
        "message": "Booking confirmed!", 
        "id": entry.id,
    }


@router.post("/room/create")
async def create_room():
    """Create a Daily.co meeting room."""
    import httpx
    import os
    
    api_key = os.getenv("DAILY_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Video calls not configured. Add DAILY_API_KEY to backend environment.")
    
    room_name = f"needmo-{os.urandom(4).hex()}"
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                "https://api.daily.co/v1/rooms",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_key}",
                },
                json={
                    "name": room_name,
                    "privacy": "public",
                    "properties": {
                        "max_participants": 6,
                        "enable_screenshare": True,
                        "enable_chat": True,
                    },
                },
                timeout=10.0,
            )
            
            if response.status_code == 200:
                data = response.json()
                return {"url": data.get("url"), "name": room_name}
            else:
                raise HTTPException(status_code=500, detail="Failed to create meeting room")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Room creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create meeting room")


class RealtimeKitJoinRequest(BaseModel):
    name: str
    meetingId: str
    role: Optional[str] = "participant"

PRESET_MAP = {
    "host": "group_call_host",
    "participant": "group_call_participant",
}

@router.post("/realtimekit/join")
async def realtimekit_join(req: RealtimeKitJoinRequest):
    """Join a Cloudflare RealtimeKit meeting."""
    import httpx
    
    account_id = os.getenv("CLOUDFLARE_ACCOUNT_ID")
    app_id = os.getenv("CLOUDFLARE_APP_ID")
    api_token = os.getenv("CLOUDFLARE_API_TOKEN")
    
    if not all([account_id, app_id, api_token]):
        raise HTTPException(
            status_code=500,
            detail="Cloudflare RealtimeKit not configured. Add CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_APP_ID, and CLOUDFLARE_API_TOKEN to backend environment."
        )
    
    preset_name = PRESET_MAP.get(req.role, "group-call-participant")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"https://api.cloudflare.com/client/v4/accounts/{account_id}/realtime/kit/{app_id}/meetings/{req.meetingId}/participants",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": f"Bearer {api_token}",
                },
                json={
                    "name": req.name,
                    "preset_name": preset_name,
                    "custom_participant_id": req.name,
                },
                timeout=15.0,
            )
            
            if response.status_code in (200, 201):
                data = response.json()
                logger.info(f"RealtimeKit response data: {data}")
                if data.get("success"):
                    auth_token = data.get("data", {}).get("token") or data.get("data", {}).get("authToken")
                    if auth_token:
                        return {"authToken": auth_token}
                    raise HTTPException(status_code=500, detail="No auth token in response")
                raise HTTPException(status_code=500, detail="Failed to create participant")
            else:
                logger.error(f"RealtimeKit participant creation failed: {response.status_code} {response.text}")
                raise HTTPException(status_code=500, detail="Failed to join meeting")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"RealtimeKit join error: {e}")
        raise HTTPException(status_code=500, detail="Failed to join meeting")