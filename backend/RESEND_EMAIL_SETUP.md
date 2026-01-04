# Resend Email Setup Guide

## 🎯 What is Resend?

Resend is a modern email API that makes it easy to send transactional emails without managing your own SMTP server. It's perfect for sending premium keys to users!

---

## 📋 Setup Steps

### 1. Create Resend Account

1. Go to https://resend.com
2. Sign up for a free account
3. Verify your email address

### 2. Get API Key

1. Go to https://resend.com/api-keys
2. Click "Create API Key"
3. Name it: `Seisen Hub Backend`
4. Copy the API key (starts with `re_`)
5. **Save it securely** - you won't see it again!

### 3. Verify Your Domain

You already have your domain verified! Based on your screenshot:

**Domain:** Your domain (e.g., `yourdomain.com`)

**DNS Records Already Set:**

- ✅ DKIM: `resend._domainkey` → Verified
- ✅ SPF: `send` MX record → Verified
- ✅ SPF: `send` TXT record → Verified

**Status:** ✅ Sending Enabled

---

## ⚙️ Configure Backend

### Update `.env` file:

```bash
# Resend Email Configuration
RESEND_API_KEY=re_your_actual_api_key_here

# Email sender (use your verified domain)
EMAIL_FROM=noreply@yourdomain.com
```

**Important:** Replace `yourdomain.com` with your actual verified domain!

---

## 📧 Email Features

### What Gets Sent:

When a user completes a payment, they receive a beautiful HTML email with:

- ✅ Their premium key
- ✅ Plan details (Weekly/Monthly/Lifetime)
- ✅ Transaction ID
- ✅ Purchase date
- ✅ Instructions on how to use the key
- ✅ Discord link for support

### Email Template Preview:

```
🎉 Your Premium Key is Ready!

Your Premium Key:
┌─────────────────────────────────────┐
│ seisen-abc123-def456-ghi789         │
└─────────────────────────────────────┘

Plan: Weekly (7 Days)
Transaction ID: 5AB123456789
Purchase Date: 1/5/2026

How to Use Your Key:
1. Copy your key from above
2. Launch Seisen Hub script in Roblox
3. Paste your key when prompted
4. Enjoy premium features!

[Join Our Discord]
```

---

## 🧪 Testing

### Test Email Sending:

1. Make sure backend is running with Resend configured
2. Complete a test payment
3. Check the buyer's PayPal email inbox
4. You should receive the premium key email!

### Check Resend Dashboard:

1. Go to https://resend.com/emails
2. See all sent emails
3. View delivery status
4. Check open rates (if tracking enabled)

---

## 💰 Pricing

**Free Tier:**

- ✅ 100 emails/day
- ✅ 3,000 emails/month
- ✅ Perfect for starting out!

**Pro Plan** ($20/month):

- 50,000 emails/month
- Custom domains
- Email analytics

---

## 🔧 Troubleshooting

### Email Not Sending?

1. **Check API Key:**

   - Make sure `RESEND_API_KEY` is set in `.env`
   - Verify it starts with `re_`

2. **Check Domain:**

   - Ensure `EMAIL_FROM` uses your verified domain
   - Example: `noreply@yourdomain.com`

3. **Check Logs:**
   - Backend will log: `✅ Email sent successfully: [message_id]`
   - Or: `❌ Resend email error: [error]`

### Domain Not Verified?

1. Go to Resend dashboard → Domains
2. Click on your domain
3. Check DNS records match exactly
4. Wait up to 48 hours for DNS propagation
5. Click "Verify" button

---

## 🎯 Production Checklist

- [ ] Resend account created
- [ ] API key generated and saved
- [ ] Domain verified in Resend
- [ ] DNS records configured
- [ ] `RESEND_API_KEY` added to `.env`
- [ ] `EMAIL_FROM` set to verified domain
- [ ] Test email sent successfully
- [ ] Email appears in inbox (not spam)

---

## 📊 Monitoring

### Check Email Status:

1. Go to https://resend.com/emails
2. See all sent emails with status:
   - ✅ Delivered
   - ⏳ Queued
   - ❌ Bounced
   - 📭 Spam

### Email Logs:

Backend logs will show:

```
✅ Resend email service initialized
✅ Email sent successfully: abc123-def456
```

---

## 🚀 You're Ready!

Once configured, emails will be sent automatically when users purchase premium keys. No SMTP server needed!

**Benefits:**

- ✅ No email server to manage
- ✅ High deliverability
- ✅ Beautiful HTML emails
- ✅ Email analytics
- ✅ Easy to use API
- ✅ Free tier available

Happy emailing! 📧
