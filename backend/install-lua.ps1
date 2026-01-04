# Lua Installation Helper Script for Windows
# This script downloads and sets up Lua 5.1 for the Prometheus backend

Write-Host "🔥 Lua 5.1 Installation Helper" -ForegroundColor Cyan
Write-Host ""

$luaDir = "C:\lua"
$luaUrl = "https://sourceforge.net/projects/luabinaries/files/5.1.5/Tools%20Executables/lua-5.1.5_Win64_bin.zip/download"

# Check if Lua is already installed
$luaExists = Get-Command lua -ErrorAction SilentlyContinue
if ($luaExists) {
    Write-Host "✅ Lua is already installed!" -ForegroundColor Green
    Write-Host "   Location: $($luaExists.Source)" -ForegroundColor Gray
    lua -v
    Write-Host ""
    Write-Host "You can now start the backend server with: npm start" -ForegroundColor Green
    exit 0
}

Write-Host "Lua is not installed. Let's install it!" -ForegroundColor Yellow
Write-Host ""

# Option 1: Manual Download
Write-Host "📥 Option 1: Manual Download (Recommended)" -ForegroundColor Cyan
Write-Host "   1. Download Lua from: https://sourceforge.net/projects/luabinaries/files/5.1.5/Tools%20Executables/" -ForegroundColor White
Write-Host "   2. Download: lua-5.1.5_Win64_bin.zip (or Win32 for 32-bit)" -ForegroundColor White
Write-Host "   3. Extract to C:\lua" -ForegroundColor White
Write-Host "   4. Add C:\lua to your system PATH" -ForegroundColor White
Write-Host ""

# Option 2: Using Chocolatey
Write-Host "🍫 Option 2: Using Chocolatey (if installed)" -ForegroundColor Cyan
Write-Host "   Run: choco install lua" -ForegroundColor White
Write-Host ""

# Option 3: Using Scoop
Write-Host "🥄 Option 3: Using Scoop (if installed)" -ForegroundColor Cyan
Write-Host "   Run: scoop install lua" -ForegroundColor White
Write-Host ""

# Ask user which option
Write-Host "Which option would you like to use?" -ForegroundColor Yellow
Write-Host "  [1] Open download page in browser (Manual)" -ForegroundColor White
Write-Host "  [2] Try Chocolatey install" -ForegroundColor White
Write-Host "  [3] Try Scoop install" -ForegroundColor White
Write-Host "  [4] Skip (I'll install it myself)" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter choice (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Opening download page..." -ForegroundColor Green
        Start-Process "https://sourceforge.net/projects/luabinaries/files/5.1.5/Tools%20Executables/"
        Write-Host ""
        Write-Host "After downloading and extracting:" -ForegroundColor Yellow
        Write-Host "1. Extract to C:\lua" -ForegroundColor White
        Write-Host "2. Run this script again to add to PATH" -ForegroundColor White
    }
    "2" {
        Write-Host "Attempting Chocolatey install..." -ForegroundColor Green
        try {
            choco install lua -y
            Write-Host "✅ Lua installed successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Chocolatey not found or installation failed" -ForegroundColor Red
            Write-Host "   Install Chocolatey from: https://chocolatey.org/" -ForegroundColor Yellow
        }
    }
    "3" {
        Write-Host "Attempting Scoop install..." -ForegroundColor Green
        try {
            scoop install lua
            Write-Host "✅ Lua installed successfully!" -ForegroundColor Green
        } catch {
            Write-Host "❌ Scoop not found or installation failed" -ForegroundColor Red
            Write-Host "   Install Scoop from: https://scoop.sh/" -ForegroundColor Yellow
        }
    }
    "4" {
        Write-Host "Skipping installation." -ForegroundColor Yellow
        Write-Host "Remember to install Lua before starting the backend!" -ForegroundColor Yellow
    }
    default {
        Write-Host "Invalid choice. Exiting." -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Verify Lua is installed: lua -v" -ForegroundColor White
Write-Host "   2. Start the backend: npm start" -ForegroundColor White
Write-Host "   3. Open obfuscator.html in your browser" -ForegroundColor White
