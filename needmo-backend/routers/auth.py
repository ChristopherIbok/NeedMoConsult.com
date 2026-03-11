"""routers/auth.py — Admin login, returns JWT token."""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from database import get_db
from core.security import verify_password, create_access_token, TOKEN_EXPIRE_H
import models

router = APIRouter()


@router.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """
    Admin login. Use form fields: username (email) + password.
    Returns a Bearer token — store this in your frontend.
    """
    admin = db.query(models.Admin).filter(models.Admin.email == form.username).first()

    if not admin or not verify_password(form.password, admin.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )

    token = create_access_token(
        data={"sub": admin.email},
        expires_delta=timedelta(hours=TOKEN_EXPIRE_H),
    )
    return {
        "access_token": token,
        "token_type": "bearer",
        "admin": {"name": admin.name, "email": admin.email},
    }
