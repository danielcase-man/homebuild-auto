#!/bin/bash
# Home Builder Pro Launch Script
# Handles dependency installation and app launch

set -e

echo "🏗️  Home Builder Pro Launch Script"
echo "=================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in project directory. Please run this script from the home-builder-app folder."
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js version: $(node --version)"
echo "✅ npm version: $(npm --version)"

# Function to install dependencies
install_deps() {
    echo ""
    echo "📦 Installing dependencies..."
    
    # Clean install if node_modules exists and has issues
    if [ -d "node_modules" ]; then
        echo "🧹 Cleaning existing node_modules..."
        rm -rf node_modules package-lock.json 2>/dev/null || true
    fi
    
    # Install dependencies with timeout and error handling
    echo "⏳ Running npm install (this may take a few minutes)..."
    npm install --legacy-peer-deps --no-audit --no-fund || {
        echo "❌ npm install failed. Trying alternative approach..."
        npm install --force || {
            echo "❌ Installation failed. Please check your internet connection and try again."
            exit 1
        }
    }
    
    echo "✅ Dependencies installed successfully"
}

# Function to launch the app
launch_app() {
    echo ""
    echo "🚀 Launching Home Builder Pro..."
    echo "📍 App will be available at: http://localhost:3001"
    echo "📍 Network access at: http://$(hostname -I | awk '{print $1}'):3001"
    echo ""
    echo "Press Ctrl+C to stop the server"
    echo "=================================="
    
    # Try multiple launch methods
    if command -v npx &> /dev/null; then
        npx next dev -p 3001 || npm run dev || node node_modules/.bin/next dev -p 3001
    else
        npm run dev || node node_modules/.bin/next dev -p 3001
    fi
}

# Main execution
main() {
    # Check if dependencies need to be installed
    if [ ! -d "node_modules" ] || [ ! -f "node_modules/.package-lock.json" ]; then
        install_deps
    else
        echo "✅ Dependencies already installed"
    fi
    
    # Launch the application
    launch_app
}

# Handle script interruption
trap 'echo -e "\n🛑 Launch script interrupted"; exit 0' INT TERM

# Run main function
main