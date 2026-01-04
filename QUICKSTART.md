# Quick Start Guide

## 🚀 Get Started in 3 Steps

### Step 1: Install Prerequisites

**Install Lua:**

- Download: https://sourceforge.net/projects/luabinaries/files/5.1.5/Tools%20Executables/
- Extract to `C:\lua` and add to PATH

**Install Prometheus:**

```bash
git clone https://github.com/wcrddn/Prometheus.git C:\Prometheus
```

### Step 2: Configure & Start Backend

```bash
cd "d:\Project++\Lua Obfuscator\backend"
copy .env.example .env
npm start
```

### Step 3: Open Frontend

Open `obfuscator.html` in your browser and start obfuscating!

---

## 📖 Full Documentation

- **Complete Setup Guide**: [SETUP.md](file:///d:/Project++/Lua%20Obfuscator/SETUP.md)
- **Backend Documentation**: [backend/README.md](file:///d:/Project++/Lua%20Obfuscator/backend/README.md)
- **Implementation Details**: See walkthrough.md artifact

## 🆘 Need Help?

If backend is not available, the app will automatically use simulation mode (demo only).

For real obfuscation, ensure:

1. ✅ Lua is installed
2. ✅ Prometheus is installed at `C:\Prometheus`
3. ✅ Backend server is running (`npm start`)
