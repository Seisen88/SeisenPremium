# Production Deployment Guide

## 🚀 Deploying to a Real Domain

When you're ready to deploy your site to a real domain (e.g., `https://seisenhub.com`), follow these steps:

---

## 📋 Prerequisites

You'll need:

1. **A domain name** (e.g., seisenhub.com)
2. **A hosting service** for the backend (e.g., Heroku, DigitalOcean, AWS, Railway)
3. **A web host** for the frontend (e.g., Netlify, Vercel, GitHub Pages, or same server as backend)

---

## 🔧 Step 1: Deploy Backend Server

### Option A: Deploy to Railway (Recommended - Easy & Free)

1. **Create account** at https://railway.app
2. **Create new project** → Deploy from GitHub
3. **Connect your repository** or upload backend folder
4. **Set environment variables:**
   ```
   PORT=3000
   PAYPAL_SANDBOX=false
   PAYPAL_CLIENT_ID=your_production_client_id
   PAYPAL_CLIENT_SECRET=your_production_secret
   JUNKIE_WEBHOOK_URL_WEEKLY=https://api.junkie-development.de/api/v1/webhooks/execute/...
   JUNKIE_WEBHOOK_URL_MONTHLY=https://api.junkie-development.de/api/v1/webhooks/execute/...
   JUNKIE_WEBHOOK_URL_LIFETIME=https://api.junkie-development.de/api/v1/webhooks/execute/...
   JUNKIE_HMAC_SECRET=ZlU4RGkc7bAeQPidYIET60f8LKqrjyWg
   JUNKIE_PROVIDER=seisenhub
   JUNKIE_SERVICE=Premium Key
   DB_PATH=./payments.db
   ```
5. **Deploy** - Railway will give you a URL like `https://your-app.railway.app`

### Option B: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create seisenhub-backend`
4. Set environment variables: `heroku config:set PAYPAL_SANDBOX=false ...`
5. Deploy: `git push heroku main`

### Option C: Deploy to Your Own Server (VPS)

1. **SSH into your server**
2. **Install Node.js** (v18 or higher)
3. **Upload backend folder**
4. **Install dependencies:** `npm install`
5. **Set up PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start server.js --name seisenhub-backend
   pm2 startup
   pm2 save
   ```
6. **Set up Nginx** as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name api.seisenhub.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
7. **Get SSL certificate:** `certbot --nginx -d api.seisenhub.com`

---

## 🌐 Step 2: Deploy Frontend

### Option A: Deploy to Netlify (Recommended - Easy & Free)

1. **Create account** at https://netlify.com
2. **Drag and drop** your project folder (or connect GitHub)
3. **Build settings:** None needed (static site)
4. **Deploy!**
5. Netlify will give you a URL like `https://seisenhub.netlify.app`
6. **Optional:** Add custom domain in Netlify settings

### Option B: Deploy to Vercel

1. **Create account** at https://vercel.com
2. **Import project** from GitHub or upload
3. **Deploy** - automatic!
4. Get URL like `https://seisenhub.vercel.app`

### Option C: Same Server as Backend

Just serve the frontend files from your backend server using Express static files.

---

## ⚙️ Step 3: Update Configuration

### A. Update Backend URL in Frontend

The code is already set up to auto-detect! But if you need to manually set it:

**Edit `js/premium.js`:**

```javascript
const BACKEND_URL = "https://api.seisenhub.com"; // Your backend URL
```

### B. Backend is Already Configured!

The backend automatically detects if it's running on localhost or production:

- **Localhost:** Uses `file:///` return URLs
- **Production:** Uses `https://yourdomain.com/premium.html`

No changes needed! ✅

---

## 🔐 Step 4: Switch to Production PayPal

### Update `.env` on your backend server:

```bash
# Change from sandbox to production
PAYPAL_SANDBOX=false

# Use PRODUCTION PayPal credentials
PAYPAL_CLIENT_ID=your_production_client_id_here
PAYPAL_CLIENT_SECRET=your_production_secret_here
```

### Get Production Credentials:

1. Go to https://developer.paypal.com/dashboard/
2. Switch to **"Live"** mode (top right)
3. Create a new app or use existing
4. Copy **Client ID** and **Secret**

---

## 📊 Step 5: Test Everything

### Test Checklist:

- [ ] Frontend loads at your domain
- [ ] Backend API is accessible
- [ ] Sidebar navigation works
- [ ] Premium page loads correctly
- [ ] "Pay with PayPal" button works
- [ ] Redirects to PayPal (LIVE mode)
- [ ] **DO A SMALL TEST PAYMENT** (€3)
- [ ] Redirects back to your site
- [ ] Key is generated and displayed
- [ ] Email is sent (if configured)
- [ ] Database entry created

---

## 🎯 Production URLs Example

If your domain is `seisenhub.com`:

| Component         | URL                                                  |
| ----------------- | ---------------------------------------------------- |
| **Frontend**      | `https://seisenhub.com`                              |
| **Premium Page**  | `https://seisenhub.com/premium.html`                 |
| **Backend API**   | `https://api.seisenhub.com` (subdomain)              |
| **Create Order**  | `https://api.seisenhub.com/api/paypal/create-order`  |
| **Capture Order** | `https://api.seisenhub.com/api/paypal/capture-order` |

---

## 🔄 How It Works in Production

### Payment Flow:

1. User visits `https://seisenhub.com/premium.html`
2. Clicks "Pay with PayPal"
3. Frontend calls `https://api.seisenhub.com/api/paypal/create-order`
4. Backend creates order with return URL: `https://seisenhub.com/premium.html`
5. User redirects to PayPal (LIVE)
6. User completes payment
7. PayPal redirects to `https://seisenhub.com/premium.html?token=ORDER_ID`
8. Frontend detects token, calls `https://api.seisenhub.com/api/paypal/capture-order`
9. Backend captures payment, generates key via Junkie
10. Frontend displays key to user
11. Email sent to user's PayPal email

**Everything works automatically!** ✅

---

## 🛡️ Security Checklist for Production

- [ ] Use HTTPS for both frontend and backend
- [ ] Set `PAYPAL_SANDBOX=false`
- [ ] Use production PayPal credentials
- [ ] Keep `.env` file secure (never commit to git)
- [ ] Enable CORS only for your domain
- [ ] Set up proper firewall rules
- [ ] Use strong HMAC secret for Junkie
- [ ] Monitor backend logs
- [ ] Set up database backups

---

## 💡 Quick Deployment Summary

**Easiest Setup:**

1. **Frontend:** Netlify (free, automatic HTTPS)
2. **Backend:** Railway (free tier, easy deployment)
3. **Domain:** Point your domain to Netlify
4. **API Subdomain:** Point `api.yourdomain.com` to Railway

**Total time:** ~30 minutes
**Cost:** Free (with free tiers)

---

## 🎉 You're Ready!

The code is already production-ready! Just:

1. Deploy backend to Railway/Heroku
2. Deploy frontend to Netlify/Vercel
3. Update PayPal to production mode
4. Test with a small payment

Everything else is automatic! 🚀
