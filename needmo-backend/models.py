"""
models.py — Database table definitions.
Tables: admins, waitlist, contacts, newsletters
"""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean
from sqlalchemy.sql import func
from database import Base


class Admin(Base):
    __tablename__ = "admins"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String, unique=True, index=True, nullable=False)
    name       = Column(String, nullable=False)
    password   = Column(String, nullable=False)           # bcrypt hashed
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Waitlist(Base):
    __tablename__ = "waitlist"

    id         = Column(Integer, primary_key=True, index=True)
    email      = Column(String, unique=True, index=True, nullable=False)
    name       = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active  = Column(Boolean, default=True)            # for unsubscribes


class Contact(Base):
    __tablename__ = "contacts"

    id               = Column(Integer, primary_key=True, index=True)
    name             = Column(String, nullable=False)
    email            = Column(String, nullable=False)
    phone            = Column(String, nullable=True)
    message          = Column(Text, nullable=False)
    service_interest = Column(String, nullable=True)
    created_at       = Column(DateTime(timezone=True), server_default=func.now())
    is_read          = Column(Boolean, default=False)     # admin can mark as read


class Newsletter(Base):
    __tablename__ = "newsletters"

    id               = Column(Integer, primary_key=True, index=True)
    subject          = Column(String, nullable=False)
    issue            = Column(String, nullable=True)
    headline         = Column(String, nullable=False)
    hero_intro       = Column(Text, nullable=True)
    body_html        = Column(Text, nullable=False)
    tags             = Column(String, nullable=True)   # comma-separated e.g. "branding,social"
    image_url        = Column(String, nullable=True)
    published        = Column(Boolean, default=True)
    recipient_count  = Column(Integer, default=0)
    sent_at          = Column(DateTime(timezone=True), server_default=func.now())



class Booking(Base):
    __tablename__ = "bookings"

    id         = Column(Integer, primary_key=True, index=True)
    name       = Column(String, nullable=False)
    email      = Column(String, nullable=False)
    company    = Column(String, nullable=True)
    service    = Column(String, nullable=True)
    date       = Column(String, nullable=False)
    time       = Column(String, nullable=False)
    message    = Column(Text, nullable=True)
    status     = Column(String, default="pending")
    call_url   = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Project(Base):
    __tablename__ = "projects"

    id          = Column(Integer, primary_key=True, index=True)
    name        = Column(String, nullable=False)
    client      = Column(String, nullable=True)
    description = Column(Text, nullable=True)
    status      = Column(String, default="active")  # active, completed, on_hold
    priority    = Column(String, default="medium")   # low, medium, high, urgent
    due_date    = Column(String, nullable=True)
    budget      = Column(String, nullable=True)
    created_by  = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now())


class Task(Base):
    __tablename__ = "tasks"

    id          = Column(Integer, primary_key=True, index=True)
    project_id  = Column(Integer, nullable=False)
    title       = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status      = Column(String, default="todo")  # todo, in_progress, review, done
    priority    = Column(String, default="medium")
    assignee    = Column(String, nullable=True)
    due_date    = Column(String, nullable=True)
    created_by  = Column(String, nullable=True)
    created_at  = Column(DateTime(timezone=True), server_default=func.now())
    updated_at  = Column(DateTime(timezone=True), server_default=func.now())