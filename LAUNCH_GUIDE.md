# 🏗️ Home Builder Pro - Launch Guide

## Quick Start (Recommended)

### Option 1: Windows (Easiest)
1. **Open File Explorer** and navigate to the project folder
2. **Double-click** `launch.bat`
3. Wait for installation and launch (first time may take 2-3 minutes)
4. **Open browser** to http://localhost:3001

### Option 2: Command Line (Any Platform)
```bash
# Navigate to project directory
cd /mnt/c/Users/danie/home-builder-app

# Make launch script executable (Linux/Mac/WSL)
chmod +x launch.sh

# Run launch script
./launch.sh
```

### Option 3: Manual Launch
```bash
# 1. Navigate to project directory
cd /mnt/c/Users/danie/home-builder-app

# 2. Install dependencies (first time only)
npm install --legacy-peer-deps

# 3. Start the development server
npm run dev
```

---

## Platform-Specific Instructions

### 🪟 Windows Users

**Method 1: Double-click Launch (Easiest)**
1. Open **File Explorer**
2. Navigate to `C:\Users\danie\home-builder-app`
3. **Double-click** `launch.bat`
4. Wait for the console window to show "App will be available at: http://localhost:3001"
5. Open your browser to http://localhost:3001

**Method 2: Command Prompt**
1. Press `Win + R`, type `cmd`, press Enter
2. Run: `cd C:\Users\danie\home-builder-app`
3. Run: `launch.bat`

**Method 3: PowerShell**
1. Press `Win + X`, select "Windows PowerShell"
2. Run: `cd C:\Users\danie\home-builder-app`
3. Run: `.\launch.bat`

### 🐧 Linux/WSL Users

**Method 1: Launch Script**
```bash
cd /mnt/c/Users/danie/home-builder-app
chmod +x launch.sh
./launch.sh
```

**Method 2: Direct Commands**
```bash
cd /mnt/c/Users/danie/home-builder-app
npm install --legacy-peer-deps
npm run dev
```

### 🍎 Mac Users

**Method 1: Terminal**
```bash
cd /mnt/c/Users/danie/home-builder-app  # Adjust path as needed
chmod +x launch.sh
./launch.sh
```

---

## 🔧 Troubleshooting

### Common Issues & Solutions

**Issue: "Permission denied" or "Command not found"**
- **Windows**: Run Command Prompt as Administrator
- **Linux/Mac**: Use `chmod +x launch.sh` then `./launch.sh`

**Issue: "npm install fails"**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install --force --legacy-peer-deps
```

**Issue: "Port 3001 already in use"**
```bash
# Kill existing process
npx kill-port 3001
# Or use different port
npm run dev -- -p 3002
```

**Issue: "TypeScript errors"**
```bash
npm install --save-dev typescript @types/react @types/node
```

**Issue: "Module not found" errors**
```bash
# Reinstall dependencies
npm ci --legacy-peer-deps
```

---

## 🚀 What Happens When You Launch

1. **Dependency Check**: Verifies Node.js and npm are installed
2. **Package Installation**: Installs all required dependencies (first time only)
3. **Server Start**: Launches Next.js development server on port 3001
4. **Auto-open**: Browser should automatically open to the app

## 📱 Accessing the App

- **Local Access**: http://localhost:3001
- **Network Access**: http://[your-ip]:3001 (for mobile testing)
- **PWA Installation**: Available once app loads

## 🎯 App Features Available

✅ **Dynamic Municipal Compliance** - Adapts to project jurisdiction  
✅ **Project Management Dashboard** - Complete project tracking  
✅ **AI-Powered Vendor Research** - Perplexity MCP integration  
✅ **Gmail Communications** - Automated vendor emails  
✅ **Mobile-First PWA** - Works offline and installable  
✅ **Advanced Analytics** - Project insights and reporting  

---

## 🆘 Need Help?

1. **Check the console** for specific error messages
2. **Verify Node.js version**: `node --version` (should be 18+)
3. **Check npm version**: `npm --version` (should be 8+)
4. **Clear cache**: `npm cache clean --force`
5. **Restart**: Close all terminals and try again

## 🔄 Stopping the App

- Press `Ctrl + C` in the terminal/command prompt
- Close the terminal window
- The app will stop automatically

---

*Happy Building! 🏠*