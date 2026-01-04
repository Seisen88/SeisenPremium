# Testing Premium.html with PayPal Sandbox

## 🎯 Goal

Test the complete real payment flow on `premium.html` using PayPal Sandbox (fake money) to see exactly what users will experience.

---

## 📋 Prerequisites

### 1. PayPal Sandbox Account Setup

You need **two sandbox accounts**:

#### **Business Account** (Already have - your seller account)

- This receives the payments
- Already configured with your Client ID and Secret

#### **Buyer Account** (Need to create - test customer)

1. Go to: https://developer.paypal.com/dashboard/
2. Click **"Sandbox"** → **"Accounts"**
3. Click **"Create Account"**
4. Select **"Personal"** (buyer account)
5. Fill in details:
   - Country: Your country
   - Email: Will be auto-generated (e.g., `sb-test123@personal.example.com`)
   - Password: Set a password you'll remember
6. Click **"Create"**
7. **Save the email and password!**

---

## 🧪 Complete Test Flow

### Step 1: Start Your Backend

```powershell
cd backend
npm start
```

**Verify it's running:**

- Open: http://localhost:3000/api/health
- Should see: `{"status":"ok",...}`

---

### Step 2: Open Premium Page

Open in your browser:

```
file:///d:/Project++/Lua Obfuscator/premium.html
```

**You should see:**

- Three pricing tiers (Weekly, Monthly, Lifetime)
- "Pay with PayPal" buttons
- Professional UI

---

### Step 3: Click "Pay with PayPal"

**Choose any tier** (e.g., Weekly - €3)

**What happens:**

1. Button shows "Creating PayPal order..."
2. Redirects to PayPal Sandbox login page
3. URL will be: `https://www.sandbox.paypal.com/checkoutnow?token=...`

---

### Step 4: Login to PayPal Sandbox

**On the PayPal page:**

1. **Email:** Use your sandbox **buyer** account email
   - Example: `sb-test123@personal.example.com`
2. **Password:** Your sandbox buyer password
3. Click **"Log In"**

**Important:** Use the BUYER account, not your business account!

---

### Step 5: Complete Payment

**You'll see:**

- Payment amount (e.g., €3.00)
- Merchant: Your business name
- "Pay Now" button

**Actions:**

1. Review the payment details
2. Click **"Pay Now"** or **"Complete Purchase"**
3. Wait for confirmation

**Note:** This is fake money! No real charge!

---

### Step 6: Automatic Redirect Back

**PayPal redirects you back to:**

```
file:///d:/Project++/Lua Obfuscator/premium.html?token=ORDER_ID
```

**What you'll see:**

1. Notification: "Processing your payment..."
2. **Wait 2-3 seconds** (backend is working)
3. **Modal pops up** with your key!

---

### Step 7: Key Display Modal

**You should see a modal like this:**

```
┌─────────────────────────────────────────────┐
│  ✅ Payment Successful!                     │
├─────────────────────────────────────────────┤
│                                             │
│  Your Premium Key:                          │
│  ┌───────────────────────────────────────┐  │
│  │ seisen-abc123-def456-ghi789          │  │
│  └───────────────────────────────────────┘  │
│                                             │
│  Plan: Weekly                               │
│  ─────────────────────────────────────────  │
│  Your key has been sent to your PayPal      │
│  email address.                             │
│                                             │
│  How to Use Your Key:                       │
│  1. Copy your key from above                │
│  2. Launch Seisen Hub script in Roblox      │
│  3. Paste your key when prompted            │
│  4. Enjoy premium features!                 │
│                                             │
│  [📋 Copy Key]  [Close]                     │
└─────────────────────────────────────────────┘
```

**Test the buttons:**

- Click **"Copy Key"** → Should copy to clipboard
- Click **"Close"** → Returns to premium page

---

## 🔍 What to Check

### ✅ Visual Experience Checklist:

- [ ] Premium page loads correctly
- [ ] "Pay with PayPal" button works
- [ ] Redirects to PayPal sandbox
- [ ] Can login with buyer account
- [ ] Payment details show correct amount
- [ ] Can complete payment
- [ ] Redirects back to your site
- [ ] "Processing payment" notification shows
- [ ] Modal appears with key
- [ ] Key is displayed clearly
- [ ] Copy button works
- [ ] Instructions are clear
- [ ] Close button works

### ✅ Backend Logs to Check:

```
✅ PayPal order created: ORDER_ID
💰 Capturing PayPal order: ORDER_ID
✅ Payment captured
💾 Payment saved to database
🔑 Calling Junkie webhook for tier: weekly
✅ Key generated successfully: seisen-...
🎉 Payment processed successfully!
```

---

## 🧪 Test All Three Tiers

Repeat the process for each tier to verify correct validity:

### Test Weekly (€3):

- Should generate key with **168 hours** validity
- Webhook: `...316e1749-5e8b-4e85-9a17-857acb1e7afb`

### Test Monthly (€5):

- Should generate key with **720 hours** validity
- Webhook: `...c3c177b5-9af8-45fd-a772-522bf8ff84a1`

### Test Lifetime (€10):

- Should generate key with **unlimited** validity
- Webhook: `...a6ca55e9-eaff-4bb9-90df-e1f0f7962365`

---

## 💡 Tips

### If Modal Doesn't Appear:

1. Check browser console (F12) for errors
2. Check backend terminal for errors
3. Verify `BACKEND_URL` in `premium.js` is `http://localhost:3000`

### If Payment Fails:

1. Verify sandbox buyer account credentials
2. Check that `PAYPAL_SANDBOX=true` in `.env`
3. Verify PayPal credentials are sandbox credentials

### To Test Again:

- Just click "Pay with PayPal" again
- Use the same sandbox buyer account
- System prevents duplicate charges

---

## 📊 What This Tests

This complete flow tests:

- ✅ PayPal order creation
- ✅ PayPal redirect
- ✅ Payment processing
- ✅ Return redirect
- ✅ Payment capture
- ✅ Junkie webhook call
- ✅ Key generation
- ✅ Key display modal
- ✅ Copy functionality
- ✅ User instructions
- ✅ Complete user experience

**This is EXACTLY what real users will see!** The only difference is you're using sandbox (fake) money instead of real money.

---

## 🎯 Summary

**To test the complete user experience:**

1. Open `premium.html` in browser
2. Click "Pay with PayPal"
3. Login with sandbox **buyer** account
4. Complete payment
5. See the key modal appear automatically
6. Test copy button
7. Read the instructions

**This shows you the complete real user experience without spending real money!** 🎉
