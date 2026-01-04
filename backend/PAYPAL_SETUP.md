# PayPal Webhook Integration Setup Guide

## 🎯 Overview

This guide will help you set up automatic premium key generation when users pay via PayPal.

## 📋 Prerequisites

- ✅ Node.js installed (v14 or higher)
- ✅ PayPal Business account
- ✅ Junkie Development account with webhook configured
- ✅ (Optional) Email account for sending keys

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env`:

```bash
copy .env.example .env
```

Edit `.env` and configure:

```bash
# PayPal Configuration
PAYPAL_SANDBOX=true  # Set to false for production

# Junkie Webhook Configuration
JUNKIE_WEBHOOK_URL=https://junkie-development.de/api/webhooks/YOUR_WEBHOOK_ID
JUNKIE_HMAC_SECRET=your_hmac_secret_here
JUNKIE_PROVIDER=seisenhub
JUNKIE_SERVICE=Premium Key

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

### 3. Configure Junkie Webhook

1. Go to https://junkie-development.de/dashboard
2. Navigate to Webhooks section
3. Click "Create Webhook"
4. Configure as follows:

**Basic Settings:**

- **Name:** PayPal Premium Payment
- **Store Provider:** Custom
- **HMAC Secret:** Generate a secure secret (save this!)

**Trigger Conditions:**

- **Field Path:** `item.product.name`
- **Type:** Contains
- **Value:** `Premium Key`

**Action Configuration:**

- **Action Type:** Generate Keys
- **Provider:** `seisenhub`
- **Service:** `Premium Key`
- **Validity (hours):**
  - Weekly: 168
  - Monthly: 720
  - Lifetime: 0 (unlimited)
- **Quantity Field Path:** `item.quantity`
- **Generate Premium Keys:** ✓ (checked)

4. Save webhook and copy the webhook URL
5. Update `JUNKIE_WEBHOOK_URL` in your `.env` file

### 4. Configure PayPal IPN

1. Log into your PayPal account
2. Go to Account Settings → Notifications
3. Click "Instant Payment Notifications (IPN)"
4. Set Notification URL to: `https://your-domain.com/api/paypal/ipn`
5. Enable IPN

> **Note:** For testing, you can use ngrok to expose your local server:
>
> ```bash
> ngrok http 3000
> ```
>
> Then use the ngrok URL: `https://your-ngrok-url.ngrok.io/api/paypal/ipn`

### 5. Start the Server

```bash
npm start
```

You should see:

```
🔥 Prometheus Lua Obfuscator Backend
📡 Server running on http://localhost:3000
✅ Payment database connected
✅ Payments table ready
✅ Email transporter configured
```

## 🔧 PayPal Payment Button Setup

### Option 1: PayPal SDK (Recommended)

Update your `premium.html` to use PayPal's JavaScript SDK:

```html
<script src="https://www.paypal.com/sdk/js?client-id=YOUR_CLIENT_ID&currency=EUR"></script>
```

### Option 2: PayPal Payment Buttons

1. Go to https://www.paypal.com/buttons/
2. Create payment buttons for each tier:
   - Weekly: €3
   - Monthly: €5
   - Lifetime: €10
3. In the button settings, set:
   - **Item Name:** `Premium Key - Weekly` (or Monthly/Lifetime)
   - **Custom Field:** Ask for Roblox username
4. Copy the button code to your `premium.html`

## 📧 Email Configuration (Optional)

If you want to send keys via email:

### Gmail Setup

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password
3. Update `.env`:
   ```bash
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password-here
   ```

### Other Email Providers

Update the SMTP settings accordingly:

- **Outlook:** smtp-mail.outlook.com:587
- **Yahoo:** smtp.mail.yahoo.com:587
- **Custom SMTP:** Your provider's settings

## 🧪 Testing

### Test with PayPal Sandbox

1. Create a PayPal Sandbox account at https://developer.paypal.com
2. Create test buyer and seller accounts
3. Set `PAYPAL_SANDBOX=true` in `.env`
4. Use sandbox credentials for testing

### Test Payment Flow

1. Make a test payment using PayPal Sandbox
2. Check server logs for:
   ```
   📧 Received PayPal IPN
   🔍 Verifying IPN with PayPal...
   ✅ IPN verified
   💾 Payment saved to database
   🔑 Generating premium key...
   ✅ Key generated successfully
   📧 Key email sent
   🎉 Payment processed successfully!
   ```

### Check Database

```bash
sqlite3 payments.db
SELECT * FROM payments;
```

## 🔒 Security Best Practices

1. **Always use HMAC secret** for Junkie webhooks
2. **Verify PayPal IPN** before processing (already implemented)
3. **Use HTTPS** in production
4. **Keep `.env` file secure** - never commit to Git
5. **Rotate secrets regularly**

## 🐛 Troubleshooting

### IPN Not Received

- Check PayPal IPN settings
- Verify webhook URL is accessible
- Check firewall/network settings
- Use ngrok for local testing

### Key Generation Failed

- Verify Junkie webhook URL is correct
- Check HMAC secret matches
- Ensure provider and service names are correct
- Check Junkie dashboard for webhook logs

### Email Not Sending

- Verify SMTP credentials
- Check email provider allows SMTP
- Enable "Less secure app access" if using Gmail (or use App Password)
- Check spam folder

### Database Errors

- Ensure write permissions for `payments.db`
- Check SQLite is installed
- Verify database path in `.env`

## 📊 Monitoring

### Check Payment Records

```javascript
// Get all payments
GET /api/payments

// Get payment by transaction ID
GET /api/payments/:transactionId
```

### Server Health

```javascript
GET / api / health;
```

Response:

```json
{
  "status": "ok",
  "timestamp": "2026-01-05T01:00:00.000Z",
  "prometheus": true,
  "paypal": true,
  "email": true
}
```

## 🚀 Production Deployment

1. Set `PAYPAL_SANDBOX=false`
2. Use production PayPal credentials
3. Deploy to a server with HTTPS
4. Set up process manager (PM2):
   ```bash
   npm install -g pm2
   pm2 start server.js --name seisen-backend
   pm2 save
   pm2 startup
   ```
5. Configure reverse proxy (nginx/Apache)
6. Set up monitoring and logging

## 📝 Environment Variables Reference

| Variable             | Required    | Description                     |
| -------------------- | ----------- | ------------------------------- |
| `PORT`               | No          | Server port (default: 3000)     |
| `PAYPAL_SANDBOX`     | Yes         | Use PayPal sandbox (true/false) |
| `JUNKIE_WEBHOOK_URL` | Yes         | Junkie webhook endpoint         |
| `JUNKIE_HMAC_SECRET` | Recommended | HMAC secret for security        |
| `JUNKIE_PROVIDER`    | Yes         | Your provider name (seisenhub)  |
| `JUNKIE_SERVICE`     | Yes         | Service name (Premium Key)      |
| `DB_PATH`            | No          | Database file path              |
| `EMAIL_HOST`         | Optional    | SMTP server                     |
| `EMAIL_PORT`         | Optional    | SMTP port                       |
| `EMAIL_USER`         | Optional    | Email username                  |
| `EMAIL_PASS`         | Optional    | Email password                  |
| `DEBUG`              | No          | Enable debug logging            |

## 🆘 Support

- **Discord:** https://discord.gg/F4sAf6z8Ph
- **Junkie Docs:** https://junkie-development.de/docs
- **PayPal IPN Guide:** https://developer.paypal.com/docs/api-basics/notifications/ipn/

## ✅ Checklist

- [ ] Dependencies installed
- [ ] `.env` file configured
- [ ] Junkie webhook created
- [ ] PayPal IPN configured
- [ ] Email settings configured (optional)
- [ ] Test payment successful
- [ ] Keys generated automatically
- [ ] Email received (if configured)
- [ ] Database records created
- [ ] Ready for production!
