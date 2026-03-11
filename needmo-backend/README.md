# NEEDMO Consult — Backend API

Full Python backend for needmoconsult.com.  
**No Supabase. No Resend.** FastAPI + PostgreSQL + your own SMTP.

---

## API Endpoints

### Public (no auth required)
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/public/contact` | Contact form submission |
| POST | `/public/waitlist` | Waitlist/newsletter signup |
| GET | `/public/unsubscribe?email=` | Unsubscribe link |

### Auth
| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/auth/login` | Admin login → returns JWT |

### Admin (JWT required)
| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/admin/stats` | Dashboard counts |
| GET | `/admin/contacts` | All contact enquiries |
| PATCH | `/admin/contacts/{id}/read` | Mark enquiry as read |
| GET | `/admin/waitlist` | All subscribers |
| POST | `/admin/newsletter/send` | Send newsletter to waitlist |
| GET | `/admin/newsletters` | Newsletter history |

---

## Local Setup

```bash
cd needmo-backend

python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env
# Fill in DATABASE_URL, SMTP credentials, JWT_SECRET_KEY

# Create your admin account (run ONCE):
python create_admin.py

# Start the server:
uvicorn main:app --reload --port 8000
```

Visit `http://localhost:8000/docs` for the interactive Swagger UI.

---

## Deploying to Render

### Step 1 — Create PostgreSQL database
- Render dashboard → **New → PostgreSQL**
- Name: `needmo-db`
- Plan: Free
- Copy the **Internal Connection String** for later

### Step 2 — Create Web Service
- **New → Web Service** → connect your GitHub repo
- Set **Root Directory** to `needmo-backend` (if it's a subfolder)
- Render auto-detects `render.yaml`

### Step 3 — Add environment variables
In Render dashboard → your service → **Environment**:
```
DATABASE_URL        → paste from PostgreSQL service (Internal URL)
SMTP_HOST           → mail.needmoconsult.com
SMTP_PORT           → 587
SMTP_USER           → hello@needmoconsult.com
SMTP_PASSWORD       → your cPanel email password
SENDER_NAME         → NEEDMO Consult
SENDER_EMAIL        → hello@needmoconsult.com
ADMIN_EMAIL         → hello@needmoconsult.com
JWT_SECRET_KEY      → (generate below)
JWT_EXPIRE_HOURS    → 24
ALLOWED_ORIGINS     → https://needmoconsult.com,https://needmoconsult.vercel.app
```

Generate JWT secret:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

### Step 4 — Create admin account
After first deploy, open Render → your service → **Shell**:
```bash
python create_admin.py
```

### Step 5 — Point Cloudflare subdomain
In Cloudflare DNS → add record:
```
Type:   CNAME
Name:   api
Target: needmo-backend.onrender.com
Proxy:  OFF (grey cloud) ← important
```

Your API will be live at: `https://api.needmoconsult.com`

---

## Vercel Frontend Setup

Add to `.env.local` in your React project:
```
VITE_API_URL=https://api.needmoconsult.com
```

Copy `api.js` into `src/lib/api.js` and import:
```js
import { submitContact, joinWaitlist, adminLogin } from "@/lib/api";
```

---

## Project Structure

```
needmo-backend/
├── main.py               # FastAPI app + table creation on startup
├── database.py           # PostgreSQL connection
├── models.py             # DB tables: admins, waitlist, contacts, newsletters
├── mailer.py             # SMTP email engine (no third-party API)
├── create_admin.py       # One-time admin account setup script
├── requirements.txt
├── render.yaml           # Render deployment config
├── .env.example
├── .gitignore
├── api.js                # Frontend integration helper → copy to src/lib/
├── core/
│   └── security.py       # JWT + password hashing
├── routers/
│   ├── auth.py           # POST /auth/login
│   ├── public.py         # Contact form + waitlist (no auth)
│   └── admin.py          # Protected admin routes
└── templates/
    └── email_templates.py # Branded HTML email templates
```
