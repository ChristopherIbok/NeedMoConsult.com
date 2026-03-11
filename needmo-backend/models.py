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
    headline         = Column(String, nullable=False)
    body_html        = Column(Text, nullable=False)
    recipient_count  = Column(Integer, default=0)
    sent_at          = Column(DateTime(timezone=True), server_default=func.now())
