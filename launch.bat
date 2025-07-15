@echo off
REM Home Builder Pro Launch Script for Windows
REM Handles dependency installation and app launch

echo.
echo 🏗️  Home Builder Pro Launch Script
echo ==================================

REM Check if we're in the right directory
if not exist "package.json" (
    echo ❌ Error: Not in project directory. Please run this script from the home-builder-app folder.
    pause
    exit /b 1
)

REM Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: Node.js is not installed. Please install Node.js first.
    echo 📥 Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Error: npm is not installed. Please install npm first.
    pause
    exit /b 1
)

echo ✅ Node.js version:
node --version
echo ✅ npm version:
npm --version

REM Check if dependencies need to be installed
if not exist "node_modules" (
    goto :install_deps
) else (
    echo ✅ Dependencies already installed
    goto :launch_app
)

:install_deps
echo.
echo 📦 Installing dependencies...
echo ⏳ Running npm install (this may take a few minutes)...

REM Clean install
if exist "node_modules" rmdir /s /q "node_modules" 2>nul
if exist "package-lock.json" del "package-lock.json" 2>nul

npm install --legacy-peer-deps --no-audit --no-fund
if errorlevel 1 (
    echo ❌ npm install failed. Trying alternative approach...
    npm install --force
    if errorlevel 1 (
        echo ❌ Installation failed. Please check your internet connection and try again.
        pause
        exit /b 1
    )
)

echo ✅ Dependencies installed successfully

:launch_app
echo.
echo 🚀 Launching Home Builder Pro...
echo 📍 App will be available at: http://localhost:3001
echo.
echo Press Ctrl+C to stop the server
echo ==================================

REM Launch the application
npm run dev
if errorlevel 1 (
    echo ❌ Failed to start with npm run dev, trying alternative...
    npx next dev -p 3001
    if errorlevel 1 (
        echo ❌ Failed to start the application
        pause
        exit /b 1
    )
)

pause