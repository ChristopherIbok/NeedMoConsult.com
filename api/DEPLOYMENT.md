# Deployment Instructions

## Prerequisites

1. **Cloudflare Account** - Sign up at https://cloudflare.com
2. **Node.js 18+** - Ensure you have Node.js installed
3. **Wrangler CLI** - Install globally: `npm install -g wrangler`
4. **Flutterwave Account** - For subscription payments
5. **Resend Account** - For sending emails (or SendGrid)

## Step 1: Clone and Setup

```bash
# Clone your repository
git clone https://github.com/your-org/NeedMoConsult.com.git
cd NeedMoConsult.com

# Install dependencies
npm install
```

## Step 2: Configure Environment Variables

Create a `.env` file in the `api/` directory:

```bash
# API/.env
JWT_SECRET_KEY=your-super-secure-jwt-secret-min-32-chars
FLW_SECRET_KEY=FLWSECK_TEST-...
FLW_SECRET_HASH=your-dashboard-webhook-secret-hash
FLW_CURRENCY=USD
RESEND_API_KEY=re_...
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_APP_ID=your-app-id
CLOUDFLARE_API_TOKEN=your-api-token
```

## Step 3: Create Cloudflare Resources

### D1 Database
```bash
cd api
wrangler d1 create needmo_db
# Copy the database_id to wrangler.jsonc
```

### KV Namespaces
```bash
wrangler kv:namespace create RATE_LIMIT
wrangler kv:namespace create EMAIL_TOKENS
```

### R2 Bucket (for recordings)
```bash
wrangler r2 bucket create needmo-recordings
```

### Queue
```bash
wrangler queue create needmo-webhooks
```

## Step 4: Update wrangler.jsonc

Replace `<YOUR_*_ID>` placeholders with actual IDs from Step 3:

```bash
wrangler d1 list
wrangler kv:list
# Update wrangler.jsonc with IDs
```

## Step 5: Run Database Migrations

```bash
cd api
wrangler d1 migrations apply needmo_db --local
wrangler d1 migrations apply needmo_db --remote
```

## Step 6: Deploy to Cloudflare

```bash
# Deploy the API
cd api
wrangler deploy

# Build and deploy frontend
cd ..
npm run build
wrangler deploy
```

## Step 7: Configure Secrets

```bash
wrangler secret put JWT_SECRET_KEY
# Enter your secret when prompted

wrangler secret put FLW_SECRET_KEY
wrangler secret put FLW_SECRET_HASH
wrangler secret put RESEND_API_KEY
wrangler secret put CLOUDFLARE_API_TOKEN
```

## Step 8: Set Up Flutterwave

1. Create or log in to your Flutterwave Dashboard and copy your secret key.

2. Configure prices using Worker vars if you need to change the defaults:
   - `FLW_CURRENCY`: defaults to `USD`
   - `FLW_PRO_MONTHLY_AMOUNT`: defaults to `15`
   - `FLW_PRO_YEARLY_AMOUNT`: defaults to `150`
   - `FLW_BUSINESS_MONTHLY_AMOUNT`: defaults to `30`
   - `FLW_BUSINESS_YEARLY_AMOUNT`: defaults to `300`

3. Configure the webhook:
   - Endpoint: `https://api.needmoconsult.com/api/subscription/webhook`
   - Secret hash: same value as `FLW_SECRET_HASH`
   - Events: payment/charge completed events

## Step 9: Configure DNS

In Cloudflare Dashboard:

1. **API Subdomain**:
   - Type: CNAME
   - Name: api
   - Content: needmo-api.tcp.workers.dev

2. **Main Domain** (if using Workers Sites):
   - Already configured in wrangler.jsonc routes

## Step 10: Verify Deployment

```bash
# Test health endpoint
curl https://api.needmoconsult.com/health

# Check Cloudflare Analytics
# Visit: https://dash.cloudflare.com/analytics/workers
```

## Environment Variables Summary

| Variable | Required | Description |
|----------|----------|-------------|
| JWT_SECRET_KEY | Yes | Secret for JWT signing |
| FLW_SECRET_KEY | Yes | Flutterwave secret key |
| FLW_SECRET_HASH | Yes | Flutterwave dashboard webhook secret hash |
| FLW_CURRENCY | No | Checkout currency, defaults to USD |
| FLW_*_AMOUNT | No | Optional plan amount overrides |
| RESEND_API_KEY | No | Email delivery (optional) |
| CLOUDFLARE_ACCOUNT_ID | Yes | Cloudflare account |
| CLOUDFLARE_APP_ID | Yes | RealtimeKit app ID |
| CLOUDFLARE_API_TOKEN | Yes | RealtimeKit API token |

## Troubleshooting

### Common Issues

1. **D1 not found**: Ensure database_id matches in wrangler.jsonc
2. **CORS errors**: Add your domain to ALLOWED_ORIGINS in index.js
3. **JWT invalid**: Verify JWT_SECRET_KEY is set in Cloudflare
4. **Flutterwave webhook fails**: Check FLW_SECRET_HASH matches the dashboard secret hash

### View Logs

```bash
wrangler tail
```
