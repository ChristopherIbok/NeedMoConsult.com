# Deployment Instructions

## Prerequisites

1. **Cloudflare Account** - Sign up at https://cloudflare.com
2. **Node.js 18+** - Ensure you have Node.js installed
3. **Wrangler CLI** - Install globally: `npm install -g wrangler`
4. **Stripe Account** - For subscription management
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
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
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

wrangler secret put STRIPE_SECRET_KEY
wrangler secret put STRIPE_WEBHOOK_SECRET
wrangler secret put RESEND_API_KEY
wrangler secret put CLOUDFLARE_API_TOKEN
```

## Step 8: Set Up Stripe

1. Create Products in Stripe Dashboard:
   - Pro: $15/month
   - Business: $30/month

2. Add price IDs to `api/src/index.js`:
   ```javascript
   const STRIPE_PRICES = {
     pro: { monthly: 'price_xxx', yearly: 'price_yyy' },
     business: { monthly: 'price_xxx', yearly: 'price_yyy' }
   };
   ```

3. Configure Webhook:
   - Endpoint: `https://api.needmoconsult.com/api/subscription/webhook`
   - Events: `customer.subscription.updated`, `customer.subscription.created`, `customer.subscription.deleted`

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
| STRIPE_SECRET_KEY | Yes | Stripe API key |
| STRIPE_WEBHOOK_SECRET | Yes | Stripe webhook signature |
| RESEND_API_KEY | No | Email delivery (optional) |
| CLOUDFLARE_ACCOUNT_ID | Yes | Cloudflare account |
| CLOUDFLARE_APP_ID | Yes | RealtimeKit app ID |
| CLOUDFLARE_API_TOKEN | Yes | RealtimeKit API token |

## Troubleshooting

### Common Issues

1. **D1 not found**: Ensure database_id matches in wrangler.jsonc
2. **CORS errors**: Add your domain to ALLOWED_ORIGINS in index.js
3. **JWT invalid**: Verify JWT_SECRET_KEY is set in Cloudflare
4. **Stripe webhook fails**: Check STRIPE_WEBHOOK_SECRET matches

### View Logs

```bash
wrangler tail
```
