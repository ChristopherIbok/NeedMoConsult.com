"""routers/admin.py — Protected admin routes. All require valid JWT token."""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import httpx
import os
import logging

from database import get_db
from core.security import get_current_admin
from mailer import send_bulk_emails
from templates.email_templates import newsletter_email, BRAND_URL
import models

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Schemas ───────────────────────────────────────────────────────────────────
class NewsletterRequest(BaseModel):
    subject: str
    headline: str
    body_html: str
    cta_text: str = "Read More"
    cta_url: str = BRAND_URL


# ── Dashboard Stats ───────────────────────────────────────────────────────────
@router.get("/stats")
def get_stats(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """Quick dashboard numbers."""
    return {
        "total_contacts": db.query(models.Contact).count(),
        "unread_contacts": db.query(models.Contact).filter(models.Contact.is_read == False).count(),
        "total_subscribers": db.query(models.Waitlist).filter(models.Waitlist.is_active == True).count(),
        "newsletters_sent": db.query(models.Newsletter).count(),
    }


# ── Contacts ──────────────────────────────────────────────────────────────────
@router.get("/contacts")
def list_contacts(skip: int = 0, limit: int = 50,
                  db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """List all contact form submissions, newest first."""
    contacts = (
        db.query(models.Contact)
        .order_by(models.Contact.created_at.desc())
        .offset(skip).limit(limit).all()
    )
    return contacts


@router.patch("/contacts/{contact_id}/read")
def mark_contact_read(contact_id: int, db: Session = Depends(get_db),
                      admin=Depends(get_current_admin)):
    """Mark a contact enquiry as read."""
    contact = db.query(models.Contact).filter(models.Contact.id == contact_id).first()
    if not contact:
        raise HTTPException(status_code=404, detail="Contact not found")
    contact.is_read = True
    db.commit()
    return {"message": "Marked as read"}


# ── Waitlist ──────────────────────────────────────────────────────────────────
@router.get("/waitlist")
def list_waitlist(skip: int = 0, limit: int = 100,
                  db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """List all active waitlist subscribers."""
    subscribers = (
        db.query(models.Waitlist)
        .filter(models.Waitlist.is_active == True)
        .order_by(models.Waitlist.created_at.desc())
        .offset(skip).limit(limit).all()
    )
    return {"total": len(subscribers), "subscribers": subscribers}


# ── Newsletter ─────────────────────────────────────────────────────────────────
@router.post("/newsletter/send")
async def send_newsletter(req: NewsletterRequest, background_tasks: BackgroundTasks,
                          db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """
    Send a newsletter to all active waitlist subscribers.
    Runs in background — API responds immediately.
    """
    subscribers = (
        db.query(models.Waitlist)
        .filter(models.Waitlist.is_active == True)
        .all()
    )

    if not subscribers:
        raise HTTPException(status_code=400, detail="No active subscribers to send to")

    recipient_emails = [s.email for s in subscribers]

    html = newsletter_email(
        headline=req.headline,
        body_html=req.body_html,
        cta_text=req.cta_text,
        cta_url=req.cta_url,
    )

    # Save newsletter record
    record = models.Newsletter(
        subject=req.subject,
        headline=req.headline,
        body_html=req.body_html,
        recipient_count=len(recipient_emails),
    )
    db.add(record)
    db.commit()

    # Send in background
    async def _dispatch():
        await send_bulk_emails(
            recipients=recipient_emails,
            subject=req.subject,
            html_body=html,
        )

    background_tasks.add_task(_dispatch)

    return {
        "message": f"Newsletter queued for {len(recipient_emails)} subscriber(s)",
        "newsletter_id": record.id,
        "recipients": len(recipient_emails),
    }


@router.get("/newsletters")
def list_newsletters(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """List all sent newsletters."""
    return (
        db.query(models.Newsletter)
        .order_by(models.Newsletter.sent_at.desc())
        .all()
    )


# ── Video Call Rooms ───────────────────────────────────────────────────────────
@router.post("/room/create")
async def create_room(admin=Depends(get_current_admin)):
    """Create a Daily.co meeting room and return the URL."""
    api_key = os.getenv("DAILY_API_KEY")
    
    if not api_key:
        raise HTTPException(status_code=500, detail="Daily.co API key not configured")
    
    room_name = f"needmo-meeting-{os.urandom(4).hex()}"
    
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
                        "enable_recording": "cloud",
                    },
                },
                timeout=10.0,
            )
            
            if response.status_code == 200:
                data = response.json()
                return {"url": data.get("url"), "name": room_name}
            else:
                logger.error(f"Daily.co error: {response.status_code} - {response.text}")
                raise HTTPException(status_code=500, detail="Failed to create meeting room")
    except Exception as e:
        logger.error(f"Room creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create meeting room")
