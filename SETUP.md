# Prometheus Lua Obfuscator - Complete Setup Guide

This guide will walk you through setting up the complete Lua Obfuscator application with both frontend and backend.

## 📋 Table of Contents

1. [System Requirements](#system-requirements)
2. [Installing Prometheus](#installing-prometheus)
3. [Backend Setup](#backend-setup)
4. [Frontend Setup](#frontend-setup)
5. [Running the Application](#running-the-application)
6. [Troubleshooting](#troubleshooting)

## System Requirements

Before you begin, ensure you have:

- **Node.js** v14 or higher ([Download](https://nodejs.org/))
- **Lua 5.1** or **LuaJIT** ([Download for Windows](https://sourceforge.net/projects/luabinaries/files/5.1.5/Tools%20Executables/))
- **Git** (optional, for cloning Prometheus)
- A modern web browser (Chrome, Firefox, Edge)

## Installing Prometheus

### Option 1: Clone with Git

```bash
git clone https://github.com/wcrddn/Prometheus.git C:\Prometheus
```

### Option 2: Download ZIP

1. Download from: https://github.com/wcrddn/Prometheus/archive/refs/heads/master.zip
2. Extract to `C:\Prometheus`

### Verify Installation

Open a terminal and run:

```bash
cd C:\Prometheus
lua cli.lua --help
```

You should see the Prometheus help message. If you get an error:

- **"lua is not recognized"**: Install Lua and add it to your system PATH
- **"cannot open cli.lua"**: Check that you're in the correct directory

## Backend Setup

### 1. Navigate to Backend Directory

```bash
cd "d:\Project++\Lua Obfuscator\backend"
```

### 2. Install Dependencies

```bash
npm install
```

This will install:

- Express (web server)
- CORS (cross-origin support)
- dotenv (environment configuration)

### 3. Configure Environment

Copy the example configuration:

```bash
copy .env.example .env
```

Edit `.env` file and update these settings:

```env
PORT=3000
PROMETHEUS_PATH=C:\Prometheus
LUA_EXECUTABLE=lua
TEMP_DIR=./temp
DEBUG=false
```

**Important:**

- Update `PROMETHEUS_PATH` to match where you installed Prometheus
- If Lua is not in your PATH, set the full path: `LUA_EXECUTABLE=C:\lua\lua.exe`

### 4. Test the Backend

Start the server:

```bash
npm start
```

You should see:

```
🔥 Prometheus Lua Obfuscator Backend
📡 Server running on http://localhost:3000
✅ Prometheus CLI found
Ready to obfuscate! 🚀
```

Keep this terminal window open - the server needs to stay running.

## Frontend Setup

The frontend is already set up! No additional installation needed.

### Configuration (Optional)

If you need to change the backend URL, edit `js/config.js`:

```javascript
const API_CONFIG = {
  baseUrl: "http://localhost:3000", // Change if using different port
  timeout: 60000,
  enableFallback: true, // Set to false to disable simulation fallback
};
```

## Running the Application

### Step 1: Start the Backend

In a terminal:

```bash
cd "d:\Project++\Lua Obfuscator\backend"
npm start
```

Leave this running.

### Step 2: Open the Frontend

Simply open `obfuscator.html` in your web browser:

```bash
# From the project root
start obfuscator.html
```

Or double-click `obfuscator.html` in File Explorer.

### Step 3: Test Obfuscation

1. Enter some Lua code in the input field:

   ```lua
   local function greet(name)
       print("Hello, " .. name)
   end

   greet("World")
   ```

2. Select Lua version (Lua51 or LuaU)
3. Select obfuscation preset (Medium recommended)
4. Click **"🔒 Obfuscate Code"**
5. The obfuscated code will appear in the output panel

## Troubleshooting

### Backend Won't Start

**Error: "Prometheus not found"**

- Verify Prometheus is installed at the path in `.env`
- Check that `cli.lua` exists in the Prometheus directory
- Update `PROMETHEUS_PATH` in `.env`

**Error: "Port 3000 already in use"**

- Change `PORT` in `.env` to a different port (e.g., 3001)
- Update `baseUrl` in `js/config.js` to match

**Error: "lua is not recognized"**

- Install Lua 5.1 or LuaJIT
- Add Lua to system PATH, or set full path in `.env`

### Frontend Issues

**Error: "Cannot connect to backend server"**

- Make sure backend is running (`npm start` in backend directory)
- Check that the backend URL in `js/config.js` matches the server
- If backend is down, the app will use simulation mode (demo only)

**Obfuscation returns demo code**

- This means the backend is not reachable
- Check browser console (F12) for error messages
- Verify backend is running and accessible

**CORS errors in browser console**

- The backend has CORS enabled by default
- If issues persist, try accessing from `http://localhost` instead of `file://`
- You can use a simple HTTP server: `npx http-server -p 8080`

### Obfuscation Fails

**Error: "Invalid Lua syntax"**

- Check your input code for syntax errors
- Verify you selected the correct Lua version (Lua51 vs LuaU)

**Error: "Request timeout"**

- Large files may take longer to process
- Increase timeout in `js/config.js`
- Check backend logs for errors

## Advanced Usage

### Using Different Presets

- **Minify**: Basic minification, fastest
- **Weak**: Light obfuscation with variable renaming
- **Medium**: Moderate obfuscation (recommended)
- **Strong**: Heavy obfuscation, largest output

### File Upload

Click "Or Upload File" to load a `.lua` file directly into the input field.

### Keyboard Shortcuts

- **Ctrl+Enter**: Obfuscate code
- **Ctrl+K**: Clear all fields

### Running Backend in Production

For production deployment:

1. Set `DEBUG=false` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start server.js --name lua-obfuscator
   ```

## Project Structure

```
Lua Obfuscator/
├── backend/              # Backend server
│   ├── server.js        # Main server file
│   ├── package.json     # Dependencies
│   ├── .env            # Configuration (create this)
│   └── README.md       # Backend documentation
├── js/                  # Frontend JavaScript
│   ├── config.js       # API configuration
│   ├── obfuscator.js   # Obfuscation logic
│   ├── main.js         # Main app logic
│   └── components.js   # UI components
├── css/                 # Stylesheets
├── components/          # HTML components
├── obfuscator.html          # Main page
└── SETUP.md           # This file
```

## Getting Help

- **Prometheus Documentation**: https://levno-710.gitbook.io/prometheus/
- **Prometheus GitHub**: https://github.com/wcrddn/Prometheus
- **Prometheus Discord**: https://discord.gg/U8h4d4Rf64

## License

This project uses Prometheus, which is licensed under GNU AGPL v3.0.
