# Prometheus Lua Obfuscator - Backend Server

Backend API server for the Prometheus Lua Obfuscator web application. This server provides HTTP endpoints to obfuscate Lua code using the Prometheus CLI.

## Prerequisites

Before setting up the backend, ensure you have:

1. **Node.js** (v14 or higher) - [Download here](https://nodejs.org/)
2. **Lua 5.1** or **LuaJIT** - Required to run Prometheus
   - Windows: [Download Lua binaries](https://sourceforge.net/projects/luabinaries/files/5.1.5/Tools%20Executables/)
   - Linux: `sudo apt install lua5.1` or `sudo apt install luajit`
   - macOS: `brew install lua@5.1` or `brew install luajit`
3. **Prometheus** - Lua obfuscator tool

## Installation

### 1. Install Prometheus

Clone the Prometheus repository:

```bash
git clone https://github.com/wcrddn/Prometheus.git C:\Prometheus
```

Or download from: https://github.com/wcrddn/Prometheus/archive/refs/heads/master.zip

### 2. Verify Prometheus Installation

Test that Prometheus works:

```bash
cd C:\Prometheus
lua cli.lua --help
```

You should see the Prometheus help message.

### 3. Install Backend Dependencies

Navigate to the backend directory and install dependencies:

```bash
cd "d:\Project++\Lua Obfuscator\backend"
npm install
```

### 4. Configure Environment

Copy the example environment file:

```bash
copy .env.example .env
```

Edit `.env` and update the paths:

```env
PORT=3000
PROMETHEUS_PATH=C:\Prometheus
LUA_EXECUTABLE=lua
TEMP_DIR=./temp
DEBUG=false
```

**Important:** Update `PROMETHEUS_PATH` to match where you installed Prometheus.

## Running the Server

Start the backend server:

```bash
npm start
```

For development with auto-reload (Node.js 18+):

```bash
npm run dev
```

You should see:

```
🔥 Prometheus Lua Obfuscator Backend
📡 Server running on http://localhost:3000
📁 Prometheus path: C:\Prometheus
🔧 Lua executable: lua
📂 Temp directory: ./temp
🐛 Debug mode: disabled

✅ Prometheus CLI found
Ready to obfuscate! 🚀
```

## API Endpoints

### Health Check

**GET** `/api/health`

Check if the server is running and Prometheus is available.

**Response:**

```json
{
  "status": "ok",
  "timestamp": "2026-01-03T13:45:00.000Z",
  "prometheus": true
}
```

### Obfuscate Code

**POST** `/api/obfuscate`

Obfuscate Lua code using Prometheus.

**Request Body:**

```json
{
  "code": "print('Hello, World!')",
  "version": "lua51",
  "preset": "medium"
}
```

**Parameters:**

- `code` (string, required): Lua code to obfuscate
- `version` (string, required): `lua51` or `luau`
- `preset` (string, required): `minify`, `weak`, `medium`, or `strong`

**Success Response:**

```json
{
  "success": true,
  "obfuscatedCode": "-- obfuscated code here",
  "metadata": {
    "version": "lua51",
    "preset": "medium",
    "originalSize": 23,
    "obfuscatedSize": 156
  }
}
```

**Error Response:**

```json
{
  "error": "Error message",
  "details": "Detailed error information",
  "hint": "Helpful suggestion"
}
```

## Testing the API

Test with curl:

```bash
curl -X POST http://localhost:3000/api/obfuscate ^
  -H "Content-Type: application/json" ^
  -d "{\"code\":\"print('Hello')\",\"version\":\"lua51\",\"preset\":\"medium\"}"
```

Or use PowerShell:

```powershell
$body = @{
    code = "print('Hello, World!')"
    version = "lua51"
    preset = "medium"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/obfuscate" -Method Post -Body $body -ContentType "application/json"
```

## Troubleshooting

### "Prometheus not found" Error

**Problem:** Server can't find Prometheus CLI.

**Solution:**

1. Verify Prometheus is installed at the path specified in `.env`
2. Check that `cli.lua` exists in the Prometheus directory
3. Update `PROMETHEUS_PATH` in `.env` to the correct path

### "Lua executable not found" Error

**Problem:** Lua is not in system PATH.

**Solution:**

1. Install Lua 5.1 or LuaJIT
2. Add Lua to system PATH, or
3. Set full path to Lua executable in `.env`:
   ```env
   LUA_EXECUTABLE=C:\lua\lua.exe
   ```

### Port Already in Use

**Problem:** Port 3000 is already taken.

**Solution:** Change the port in `.env`:

```env
PORT=3001
```

### CORS Errors

**Problem:** Frontend can't connect to backend.

**Solution:** The server has CORS enabled by default. If issues persist:

1. Ensure backend is running
2. Check frontend is using correct API URL
3. Verify no firewall is blocking the connection

## Development

### Enable Debug Logging

Set `DEBUG=true` in `.env` to see detailed logs:

```env
DEBUG=true
```

### File Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env              # Configuration (create from .env.example)
├── .env.example      # Configuration template
├── .gitignore        # Git ignore rules
├── README.md         # This file
└── temp/             # Temporary files (auto-created)
```

## Security Notes

- The server validates all inputs before processing
- Temporary files are automatically cleaned up
- File size is limited to 10MB
- Execution timeout is set to 30 seconds
- Only accepts JSON requests

## License

This backend server follows the same license as Prometheus: GNU AGPL v3.0

## Support

- Prometheus Documentation: https://levno-710.gitbook.io/prometheus/
- Prometheus GitHub: https://github.com/wcrddn/Prometheus
- Prometheus Discord: https://discord.gg/U8h4d4Rf64
