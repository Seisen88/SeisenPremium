# Switching to Production PayPal - Step by Step Guide

## ⚠️ IMPORTANT - Read Before Proceeding

Switching to production means **REAL MONEY** will be charged. Make sure:

- ✅ Your PayPal business account is fully verified
- ✅ You've tested thoroughly in Sandbox mode
- ✅ All webhooks are configured correctly
- ✅ Email system is working

---

## 📋 Step 1: Get Production PayPal Credentials

### A. Login to PayPal Developer Dashboard

1. Go to https://developer.paypal.com/dashboard/
2. **Switch to LIVE mode** (toggle in top right corner)
   - Should say "Live" not "Sandbox"

### B. Create or Use Existing App

1. Go to **"My Apps & Credentials"**
2. Under **"Live"** section (NOT Sandbox):
   - If you have an app: Click on it
   - If not: Click **"Create App"**
     - App Name: `Seisen Hub Live`
     - App Type: Merchant
     - Click Create

### C. Copy Credentials

1. You'll see:
   - **Client ID** (starts with `A...`)
   - **Secret** (click "Show" to reveal)
2. **Copy both** - you'll need them next

---

## 📝 Step 2: Update `.env` File

Open your `.env` file and update these lines:

```bash
# Change from Sandbox to Production
PAYPAL_SANDBOX=false

# Replace with PRODUCTION credentials
PAYPAL_CLIENT_ID=your_production_client_id_here
PAYPAL_CLIENT_SECRET=your_production_secret_here
```

### Example:

```bash
# Before (Sandbox):
PAYPAL_SANDBOX=true
PAYPAL_CLIENT_ID=ATk-Zd_3C1XhXrIyHZjJbKVeT0c4DOKTxbzZLSPD0YqW0zIz9R3O1N_e5EeXLzfGsasbITocUiDLk73W
PAYPAL_CLIENT_SECRET=EPqiegBYZ2qHm2Ptq8YeCHU68VOQhDywy66IBKE7Y9Z_NP-PHY3fL2oehrlIx-uobsxhJEoUZxXRUtg8

# After (Production):
PAYPAL_SANDBOX=false
PAYPAL_CLIENT_ID=AZaXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZX
PAYPAL_CLIENT_SECRET=ELaXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZXZX
```

---

## 🔄 Step 3: Restart Backend Server

```powershell
cd backend
npm start
```

**Look for:**

```
✅ PayPal SDK initialized (Production Mode)
```

If you see "Sandbox Mode", the `.env` wasn't updated correctly.

---

## 🧪 Step 4: Test with Small Payment

### CRITICAL: Test First!

1. **Open:** `http://localhost:3000/premium.html`
2. **Choose:** Weekly tier (€3 - smallest amount)
3. **Use:** Your REAL PayPal account
4. **Complete:** Real payment
5. **Verify:**
   - ✅ Key generated
   - ✅ Email received
   - ✅ Money received in your PayPal business account

### What to Check:

- [ ] Payment goes through
- [ ] Redirects back correctly
- [ ] Key is generated (real Junkie key)
- [ ] Email is sent
- [ ] Key saved to localStorage
- [ ] Transaction appears in PayPal dashboard
- [ ] Money in your business account

---

## ⚠️ Important Differences: Sandbox vs Production

| Feature         | Sandbox                  | Production            |
| --------------- | ------------------------ | --------------------- |
| **Money**       | Fake                     | **REAL**              |
| **PayPal URL**  | `sandbox.paypal.com`     | `paypal.com`          |
| **Login**       | Test accounts            | Real PayPal accounts  |
| **Credentials** | Sandbox Client ID/Secret | Live Client ID/Secret |
| **Junkie Keys** | Real keys                | Real keys             |
| **Emails**      | Sent to test emails      | Sent to real emails   |

---

## 🔐 Security Checklist

Before going live:

- [ ] `.env` file is NOT committed to git
- [ ] Production credentials are secure
- [ ] HTTPS enabled (for production deployment)
- [ ] All webhooks tested
- [ ] Email system working
- [ ] Database backups enabled
- [ ] Error handling in place
- [ ] Refund process documented

---

## 💰 PayPal Fees (Production)

PayPal will charge fees on real transactions:

- **Standard rate:** 2.9% + €0.35 per transaction
- **Example:** €3 payment = €0.44 fee, you receive €2.56

Make sure your pricing accounts for this!

---

## 🚨 Troubleshooting

### "Invalid credentials" error:

- ✅ Make sure you're using **LIVE** credentials, not Sandbox
- ✅ Check Client ID and Secret are copied correctly
- ✅ Verify `PAYPAL_SANDBOX=false`

### Payment works but no key:

- ✅ Check Junkie webhooks are configured
- ✅ Verify HMAC secret matches
- ✅ Check backend logs for errors

### Email not sent:

- ✅ Verify Resend API key is correct
- ✅ Check `EMAIL_FROM` uses verified domain
- ✅ Look for email errors in backend logs

---

## 📊 Monitoring Production

### Check PayPal Dashboard:

1. Go to https://www.paypal.com/businessmanage/
2. View transactions
3. Monitor disputes/chargebacks

### Check Backend Logs:

```
✅ Payment captured
✅ Key generated successfully
✅ Email sent successfully
```

### Check Resend Dashboard:

1. Go to https://resend.com/emails
2. See all sent emails
3. Monitor delivery rates

---

## 🔄 Rolling Back to Sandbox

If you need to go back to testing:

```bash
# In .env file:
PAYPAL_SANDBOX=true
PAYPAL_CLIENT_ID=your_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_sandbox_secret
```

Then restart server.

---

## ✅ You're Ready for Production!

Once you've:

1. ✅ Updated `.env` with production credentials
2. ✅ Set `PAYPAL_SANDBOX=false`
3. ✅ Restarted server
4. ✅ Tested with small payment

Your system will accept **REAL PAYMENTS**! 🎉

**Remember:** Start with a test payment to yourself first!
