# Setting Up Multiple Junkie Webhooks for Different Tiers

## Why You Need 3 Webhooks

Your current setup uses **one webhook** for all tiers, which means all keys get the same validity (168 hours). To have different validities for each tier, you need **3 separate webhooks**:

- **Weekly**: 168 hours (7 days)
- **Monthly**: 720 hours (30 days)
- **Lifetime**: 0 hours (unlimited)

---

## Step-by-Step Setup

### 1. Create Weekly Webhook

1. Go to Junkie dashboard → Webhooks
2. Click "Create New Webhook"
3. **Name**: `Seisen Premium - Weekly`
4. **Trigger Condition**:
   - Field Path: `item.product.name`
   - Type: `Contains`
   - Value: `Premium Key`
5. **Action Configuration**:
   - Provider: `seisenhub`
   - Service: `Premium Key`
   - **Validity**: `168` hours
   - Quantity Field Path: `item.quantity`
   - Generate Premium Keys: ✅ Checked
6. **HMAC Secret**: `ZlU4RGkc7bAeQPidYIET60f8LKqrjyWg`
7. Click "Create"
8. **Copy the webhook URL** (e.g., `https://api.junkie-development.de/api/v1/webhooks/execute/WEEKLY-ID`)

### 2. Create Monthly Webhook

Repeat the same steps but change:

- **Name**: `Seisen Premium - Monthly`
- **Validity**: `720` hours
- **Copy the webhook URL**

### 3. Create Lifetime Webhook

Repeat the same steps but change:

- **Name**: `Seisen Premium - Lifetime`
- **Validity**: `0` hours (unlimited)
- **Copy the webhook URL**

---

## Update Your .env File

Add the three webhook URLs to your `.env` file:

```bash
# Weekly tier webhook (168 hours)
JUNKIE_WEBHOOK_URL_WEEKLY=https://api.junkie-development.de/api/v1/webhooks/execute/YOUR_WEEKLY_ID

# Monthly tier webhook (720 hours)
JUNKIE_WEBHOOK_URL_MONTHLY=https://api.junkie-development.de/api/v1/webhooks/execute/YOUR_MONTHLY_ID

# Lifetime tier webhook (unlimited)
JUNKIE_WEBHOOK_URL_LIFETIME=https://api.junkie-development.de/api/v1/webhooks/execute/YOUR_LIFETIME_ID

# HMAC secret (same for all)
JUNKIE_HMAC_SECRET=ZlU4RGkc7bAeQPidYIET60f8LKqrjyWg
JUNKIE_PROVIDER=seisenhub
JUNKIE_SERVICE=Premium Key
```

---

## Test Each Tier

After updating `.env` and restarting the server:

1. Open `test-payment.html`
2. Test **Weekly** → Should get 168 hours
3. Test **Monthly** → Should get 720 hours
4. Test **Lifetime** → Should get unlimited

---

## Quick Reference

| Tier     | Validity            | Webhook Variable              |
| -------- | ------------------- | ----------------------------- |
| Weekly   | 168 hours           | `JUNKIE_WEBHOOK_URL_WEEKLY`   |
| Monthly  | 720 hours           | `JUNKIE_WEBHOOK_URL_MONTHLY`  |
| Lifetime | 0 hours (unlimited) | `JUNKIE_WEBHOOK_URL_LIFETIME` |

All three webhooks use the same HMAC secret for security.
