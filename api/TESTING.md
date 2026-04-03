# Testing Guide

## Authentication Flow

### 1. User Registration

```bash
# Test registration endpoint
curl -X POST https://api.needmoconsult.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'

# Expected: 200 OK with message about email verification
```

### 2. Email Verification

- Check your email for verification link
- Click the link or use the token:
```bash
curl -X POST https://api.needmoconsult.com/api/auth/verify-email \
  -H "Content-Type: application/json" \
  -d '{"token":"verification-token-here"}'
```

### 3. Login

```bash
curl -X POST https://api.needmoconsult.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Expected: 200 OK with access_token
# Save the token for subsequent requests
```

### 4. Password Reset

```bash
# Request reset
curl -X POST https://api.needmoconsult.com/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}'

# Use the token from email (you'll need to extract it from the link)
```

## Meeting Operations

### 1. Create a Meeting

```bash
TOKEN="your-jwt-token"

# Create instant meeting
curl -X POST https://api.needmoconsult.com/api/meetings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Meeting","isInstant":true}'

# Expected response:
# {
#   "meeting": {
#     "id": "uuid",
#     "title": "Test Meeting",
#     "slug": "abc123xyz",
#     "meetingLink": "https://needmoconsult.com/meeting/abc123xyz"
#   }
# }
```

### 2. Get Meetings

```bash
# List all meetings
curl https://api.needmoconsult.com/api/meetings \
  -H "Authorization: Bearer $TOKEN"

# Filter upcoming
curl "https://api.needmoconsult.com/api/meetings?filter=upcoming" \
  -H "Authorization: Bearer $TOKEN"
```

### 3. Get Meeting Details

```bash
curl https://api.needmoconsult.com/api/meetings/{meeting-id} \
  -H "Authorization: Bearer $TOKEN"
```

### 4. Join via RealtimeKit

```bash
curl -X POST https://api.needmoconsult.com/api/realtimekit/join \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"meetingId":"meeting-id","name":"Your Name"}'

# Expected: Returns authToken for RealtimeKit SDK
```

## Subscription Tests

### 1. Create Checkout Session

```bash
# Upgrade to Pro
curl -X POST https://api.needmoconsult.com/api/subscription/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tier":"pro","interval":"monthly"}'

# Expected: Returns Stripe checkout URL
```

### 2. Access Subscription Portal

```bash
curl https://api.needmoconsult.com/api/subscription/portal \
  -H "Authorization: Bearer $TOKEN"

# Expected: Returns Stripe customer portal URL
```

### 3. Stripe Webhook

Test with Stripe CLI:
```bash
stripe listen --forward-to https://api.needmoconsult.com/api/subscription/webhook
```

Trigger test events:
```bash
# Subscription created
stripe trigger customer.subscription.created

# Subscription updated
stripe trigger customer.subscription.updated

# Subscription deleted
stripe trigger customer.subscription.deleted
```

## Subscription Tier Enforcement

### Test Free Tier Limits

1. Try to join a second participant (should fail)
2. Schedule meeting longer than 40 minutes (should warn)
3. Try to access recording features (should show upgrade prompt)

### Test Pro Tier

1. Upgrade account via Stripe
2. Verify subscription_tier updates in database
3. Create meeting with 50 participants
4. Enable recording

### Test Business Tier

1. Upgrade to Business
2. Create 100-participant meeting
3. Verify transcription features available

## WebSocket / Durable Object Tests

### Connect to Meeting Room

```javascript
// In browser console or frontend
const ws = new WebSocket(
  'wss://api.needmoconsult.com/meetings/{slug}/ws?token={jwt}'
);

ws.onmessage = (event) => {
  console.log('Received:', JSON.parse(event.data));
};

// Test chat
ws.send(JSON.stringify({ type: 'chat', message: 'Hello!' }));

// Test reaction
ws.send(JSON.stringify({ type: 'reaction', reaction: '👏' }));
```

### Verify Participant Broadcast

1. Open meeting in two browser windows
2. Join as different users
3. Verify participant list syncs between windows

## Frontend Testing

### Login Flow

1. Navigate to `/login`
2. Enter valid credentials
3. Verify redirect to `/dashboard`
4. Check token stored in localStorage

### Meeting Room

1. Click "New Meeting"
2. Enter meeting title
3. Verify redirect to meeting page
4. Check video/audio controls work

### Subscription Page

1. Navigate to `/pricing`
2. Click upgrade button
3. Verify Stripe checkout opens

## Automated Testing Script

```bash
#!/bin/bash
# test-api.sh

BASE_URL="https://api.needmoconsult.com"
EMAIL="test@example.com"
PASS="password123"

echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq .

echo "2. Testing registration..."
curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\",\"name\":\"Test User\"}"

echo "3. Testing login..."
TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASS\"}" | jq -r '.access_token')

echo "4. Testing get user..."
curl -s "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "5. Testing create meeting..."
curl -s -X POST "$BASE_URL/api/meetings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"API Test Meeting","isInstant":true}' | jq .

echo "6. Testing get meetings..."
curl -s "$BASE_URL/api/meetings" \
  -H "Authorization: Bearer $TOKEN" | jq .

echo "7. Testing subscription checkout..."
curl -s -X POST "$BASE_URL/api/subscription/create-checkout" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"tier":"pro","interval":"monthly"}' | jq .
```

## Performance Testing

```bash
# Load test with hey
hey -n 1000 -c 10 https://api.needmoconsult.com/health

# Test WebSocket connections
# Use https://www.websocket.org/echo.html
# Connect to wss://api.needmoconsult.com/meetings/test/ws?token=...
```

## Security Tests

1. **Test invalid token** - Should return 401
2. **Test expired token** - Should return 401
3. **Test unauthorized meeting access** - Should return 403
4. **Test rate limiting** - Should return 429 after 5 attempts
5. **Test CORS** - Verify only allowed origins work

## Browser DevTools Testing

### Network Tab

1. Open DevTools > Network
2. Filter by fetch/XHR
3. Test login, create meeting, etc.
4. Verify headers and response bodies

### Application Tab

1. Check localStorage for `needmo_token`
2. Verify token format (JWT structure)
3. Test token persistence across refreshes
