"""routers/admin.py — Protected admin routes. All require valid JWT token."""

from fastapi import APIRouter, Depends, HTTPException, BackgroundTasks
from pydantic import BaseModel
from typing import List, Optional
from sqlalchemy.orm import Session
import logging

from database import get_db
from core.security import get_current_admin
from mailer import send_bulk_emails, send_welcome_email
from templates.email_templates import newsletter_email, welcome_email, BRAND_URL
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


# ── Welcome Email ─────────────────────────────────────────────────────────────
class WelcomeEmailRequest(BaseModel):
    email: str
    name: str = ""
    headline: str = "Welcome to the Family!"
    intro: str = "Thanks for subscribing to the NEEDMO CONSULT newsletter. You've just made a great decision for your brand."
    cta_text: str = "Visit Our Website"
    cta_url: str = "https://needmoconsult.com"


@router.post("/welcome-email")
async def send_welcome_email_route(req: WelcomeEmailRequest, admin=Depends(get_current_admin)):
    """Send a customized welcome email to a subscriber."""
    html = welcome_email(
        first_name=req.name,
        headline=req.headline,
        intro=req.intro,
        cta_text=req.cta_text,
        cta_url=req.cta_url,
    )
    
    await send_welcome_email(req.email, html)
    
    return {"message": "Welcome email sent!", "to": req.email}


# ── Projects ──────────────────────────────────────────────────────────────────
class ProjectCreate(BaseModel):
    name: str
    client: Optional[str] = ""
    description: Optional[str] = ""
    status: str = "active"
    priority: str = "medium"
    due_date: Optional[str] = ""
    budget: Optional[str] = ""
    created_by: Optional[str] = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    client: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    due_date: Optional[str] = None
    budget: Optional[str] = None


@router.get("/projects")
def list_projects(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """List all projects."""
    projects = db.query(models.Project).order_by(models.Project.created_at.desc()).all()
    return projects


@router.post("/projects")
def create_project(req: ProjectCreate, db: Session = Depends(get_db),
                   admin=Depends(get_current_admin)):
    """Create a new project."""
    project = models.Project(
        name=req.name,
        client=req.client or "",
        description=req.description or "",
        status=req.status,
        priority=req.priority,
        due_date=req.due_date or "",
        budget=req.budget or "",
        created_by=req.created_by or admin.email,
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return project


@router.patch("/projects/{project_id}")
def update_project(project_id: int, req: ProjectUpdate, db: Session = Depends(get_db),
                   admin=Depends(get_current_admin)):
    """Update a project."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    for field, value in req.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    return project


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db),
                   admin=Depends(get_current_admin)):
    """Delete a project and its tasks."""
    project = db.query(models.Project).filter(models.Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.query(models.Task).filter(models.Task.project_id == project_id).delete()
    db.delete(project)
    db.commit()
    return {"message": "Project deleted"}


# ── Tasks ─────────────────────────────────────────────────────────────────────
class TaskCreate(BaseModel):
    project_id: int
    title: str
    description: Optional[str] = ""
    status: str = "todo"
    priority: str = "medium"
    assignee: Optional[str] = ""
    due_date: Optional[str] = ""


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    assignee: Optional[str] = None
    due_date: Optional[str] = None


@router.get("/projects/{project_id}/tasks")
def list_tasks(project_id: int, db: Session = Depends(get_db),
               admin=Depends(get_current_admin)):
    """List all tasks for a project."""
    tasks = db.query(models.Task).filter(models.Task.project_id == project_id).order_by(models.Task.created_at.desc()).all()
    return tasks


@router.get("/tasks")
def list_all_tasks(db: Session = Depends(get_db), admin=Depends(get_current_admin)):
    """List all tasks across projects."""
    tasks = db.query(models.Task).order_by(models.Task.created_at.desc()).all()
    return tasks


@router.post("/tasks")
def create_task(req: TaskCreate, db: Session = Depends(get_db),
                admin=Depends(get_current_admin)):
    """Create a new task."""
    task = models.Task(
        project_id=req.project_id,
        title=req.title,
        description=req.description or "",
        status=req.status,
        priority=req.priority,
        assignee=req.assignee or "",
        due_date=req.due_date or "",
        created_by=admin.email,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.patch("/tasks/{task_id}")
def update_task(task_id: int, req: TaskUpdate, db: Session = Depends(get_db),
                admin=Depends(get_current_admin)):
    """Update a task."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    for field, value in req.model_dump(exclude_unset=True).items():
        if value is not None:
            setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db),
                admin=Depends(get_current_admin)):
    """Delete a task."""
    task = db.query(models.Task).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    db.delete(task)
    db.commit()
    return {"message": "Task deleted"}
