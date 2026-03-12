"""
mailer.py — Email via Brevo HTTPS API.
No SMTP ports needed — works on Render free tier.
"""

import os, logging, asyncio, requests
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

BREVO_API_KEY  = os.getenv("BREVO_API_KEY")
SENDER_NAME    = os.getenv("SENDER_NAME", "NEEDMO Consult")
SENDER_EMAIL   = os.getenv("SENDER_EMAIL", "hello@needmoconsult.com")
BREVO_API_URL  = "https://api.brevo.com/v3/smtp/email"


def send_email(
    to: str | List[str],
    subject: str,
    html_body: str,
    plain_body: Optional[str] = None,
    reply_to: Optional[str] = None,
) -> dict:
    """Send email via Brevo HTTPS API."""
    recipients = [to] if isinstance(to, str) else to

    payload = {
        "sender": {"name": SENDER_NAME, "email": SENDER_EMAIL},
        "to": [{"email": r} for r in recipients],
        "subject": subject,
        "htmlContent": html_body,
    }

    if plain_body:
        payload["textContent"] = plain_body
    if reply_to:
        payload["replyTo"] = {"email": reply_to}

    headers = {
        "accept": "application/json",
        "content-type": "application/json",
        "api-key": BREVO_API_KEY,
    }

    response = requests.post(BREVO_API_URL, json=payload, headers=headers)

    if response.status_code not in (200, 201):
        logger.error(f"Brevo error: {response.text}")
        raise Exception(f"Brevo API error: {response.text}")

    logger.info(f"✅ Email sent to {recipients} | {subject}")
    return {"success": True, "recipients": recipients}


async def send_email_async(
    to: str | List[str],
    subject: str,
    html_body: str,
    plain_body: Optional[str] = None,
    reply_to: Optional[str] = None,
) -> dict:
    """Async wrapper for FastAPI routes."""
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, lambda: send_email(to, subject, html_body, plain_body, reply_to)
    )


async def send_bulk_emails(
    recipients: List[str],
    subject: str,
    html_body: str,
    batch_size: int = 20,
    delay_seconds: float = 1.0,
) -> dict:
    """Send bulk emails in batches."""
    sent, failed = [], []

    for i in range(0, len(recipients), batch_size):
        batch = recipients[i : i + batch_size]
        for email in batch:
            try:
                await send_email_async(email, subject, html_body)
                sent.append(email)
            except Exception as e:
                failed.append({"email": email, "error": str(e)})
        if i + batch_size < len(recipients):
            await asyncio.sleep(delay_seconds)

    return {
        "total": len(recipients),
        "sent": len(sent),
        "failed": len(failed),
        "failed_list": failed,
    }
```
