"""
mailer.py — Core SMTP engine using Python's built-in smtplib.
No third-party email API. Works with your cPanel SMTP on needmoconsult.com.
"""

import smtplib, ssl, os, logging, asyncio
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.utils import formataddr
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()
logger = logging.getLogger(__name__)

SMTP_HOST     = os.getenv("SMTP_HOST", "mail.needmoconsult.com")
SMTP_PORT     = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER     = os.getenv("SMTP_USER")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD")
SENDER_NAME   = os.getenv("SENDER_NAME", "NEEDMO Consult")
SENDER_EMAIL  = os.getenv("SENDER_EMAIL", SMTP_USER)


def _build_message(to, subject, html_body, plain_body=None, reply_to=None, bcc=None):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = formataddr((SENDER_NAME, SENDER_EMAIL))
    msg["To"]      = to if isinstance(to, str) else ", ".join(to)
    if reply_to:
        msg["Reply-To"] = reply_to
    if bcc:
        msg["Bcc"] = ", ".join(bcc)

    plain = plain_body or _html_to_plain(html_body)
    msg.attach(MIMEText(plain, "plain"))
    msg.attach(MIMEText(html_body, "html"))
    return msg


def send_email(to, subject, html_body, plain_body=None, reply_to=None, bcc=None):
    recipients = ([to] if isinstance(to, str) else to) + (bcc or [])
    msg = _build_message(to, subject, html_body, plain_body, reply_to, bcc)
    context = ssl.create_default_context()
    with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as server:
        server.ehlo()
        server.starttls(context=context)
        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SENDER_EMAIL, recipients, msg.as_string())
        logger.info(f"✅ Email sent → {recipients} | {subject}")
    return {"success": True, "recipients": recipients}


async def send_email_async(to, subject, html_body, plain_body=None, reply_to=None):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(
        None, lambda: send_email(to, subject, html_body, plain_body, reply_to)
    )


async def send_bulk_emails(recipients: List[str], subject: str, html_body: str,
                           batch_size: int = 20, delay_seconds: float = 2.0) -> dict:
    sent, failed = [], []
    for i in range(0, len(recipients), batch_size):
        for email in recipients[i : i + batch_size]:
            try:
                await send_email_async(email, subject, html_body)
                sent.append(email)
            except Exception as e:
                failed.append({"email": email, "error": str(e)})
        if i + batch_size < len(recipients):
            await asyncio.sleep(delay_seconds)
    return {"total": len(recipients), "sent": len(sent), "failed": len(failed), "failed_list": failed}


def _html_to_plain(html):
    import re
    text = re.sub(r"<br\s*/?>", "\n", html, flags=re.IGNORECASE)
    text = re.sub(r"<[^>]+>", "", text)
    return re.sub(r"\n{3,}", "\n\n", text).strip()
