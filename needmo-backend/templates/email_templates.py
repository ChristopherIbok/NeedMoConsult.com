"""templates/email_templates.py — Branded HTML emails for NEEDMO Consult."""

BRAND_COLOR = "#FF6B35"
BRAND_NAME  = "NEEDMO Consult"
BRAND_URL   = "https://needmoconsult.com"


def _base(content: str, preview: str = "") -> str:
    return f"""<!DOCTYPE html>
<html lang="en"><head><meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1.0"/>
<span style="display:none;max-height:0;overflow:hidden;">{preview}</span>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:30px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0"
       style="background:#fff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,.08);">
  <tr><td style="background:{BRAND_COLOR};padding:28px 40px;text-align:center;">
    <a href="{BRAND_URL}" style="text-decoration:none;">
      <span style="color:#fff;font-size:24px;font-weight:bold;letter-spacing:1px;">
        {BRAND_NAME.upper()}
      </span>
    </a>
  </td></tr>
  <tr><td style="padding:40px 40px 30px;">{content}</td></tr>
  <tr><td style="background:#f9f9f9;padding:20px 40px;text-align:center;border-top:1px solid #eee;">
    <p style="margin:0;color:#999;font-size:12px;">
      © {BRAND_NAME} · Nigeria<br/>
      <a href="{BRAND_URL}" style="color:{BRAND_COLOR};text-decoration:none;">{BRAND_URL}</a>
    </p>
  </td></tr>
</table>
</td></tr></table>
</body></html>"""


def welcome_email(first_name: str) -> str:
    return _base(f"""
    <h2 style="color:#222;margin-top:0;">Welcome to {BRAND_NAME}, {first_name}! 🎉</h2>
    <p style="color:#555;line-height:1.7;">
      We're thrilled to have you on board. We'll keep you updated with
      exclusive insights, brand strategy tips, and NEEDMO news.
    </p>
    <div style="text-align:center;margin:30px 0;">
      <a href="{BRAND_URL}" style="background:{BRAND_COLOR};color:#fff;padding:14px 32px;
         border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
        Visit Our Website
      </a>
    </div>
    <p style="color:#555;">Warmly,<br/><strong>The {BRAND_NAME} Team</strong></p>
    """, preview=f"Welcome aboard, {first_name}!")


def contact_notification_email(name, email, phone, message, service="N/A") -> str:
    return _base(f"""
    <h2 style="color:#222;margin-top:0;">📬 New Contact Form Submission</h2>
    <table width="100%" cellpadding="10" cellspacing="0"
           style="background:#f9f9f9;border-radius:6px;border:1px solid #eee;">
      <tr>
        <td style="color:#888;font-size:13px;width:140px;"><strong>Name</strong></td>
        <td style="color:#333;">{name}</td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="color:#888;font-size:13px;"><strong>Email</strong></td>
        <td><a href="mailto:{email}" style="color:{BRAND_COLOR};">{email}</a></td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="color:#888;font-size:13px;"><strong>Phone</strong></td>
        <td style="color:#333;">{phone or "Not provided"}</td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="color:#888;font-size:13px;"><strong>Service</strong></td>
        <td style="color:#333;">{service}</td>
      </tr>
      <tr style="border-top:1px solid #eee;">
        <td style="color:#888;font-size:13px;vertical-align:top;padding-top:12px;">
          <strong>Message</strong></td>
        <td style="color:#333;line-height:1.7;">{message}</td>
      </tr>
    </table>
    <div style="text-align:center;margin:28px 0;">
      <a href="mailto:{email}" style="background:{BRAND_COLOR};color:#fff;padding:12px 28px;
         border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px;">
        Reply to {name}
      </a>
    </div>
    """, preview=f"New message from {name}")


def newsletter_email(headline, body_html, cta_text="Read More",
                     cta_url=BRAND_URL, unsubscribe_url=f"{BRAND_URL}/unsubscribe") -> str:
    return _base(f"""
    <h2 style="color:#222;margin-top:0;">{headline}</h2>
    <div style="color:#555;line-height:1.8;">{body_html}</div>
    <div style="text-align:center;margin:30px 0;">
      <a href="{cta_url}" style="background:{BRAND_COLOR};color:#fff;padding:14px 32px;
         border-radius:6px;text-decoration:none;font-weight:bold;font-size:15px;">
        {cta_text}
      </a>
    </div>
    <hr style="border:none;border-top:1px solid #eee;margin:24px 0;"/>
    <p style="color:#999;font-size:11px;text-align:center;">
      You're receiving this because you joined the NEEDMO waitlist.<br/>
      <a href="{unsubscribe_url}" style="color:#999;">Unsubscribe</a>
    </p>
    """)
