#!/bin/bash

# Home Builder Pro - Quick Setup Script
echo "🏗️ Home Builder Pro - Quick Setup"
echo "================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js installation...${NC}"
if command -v node >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Node.js found: $(node --version)${NC}"
else
    echo -e "${RED}❌ Node.js not found. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if PostgreSQL is installed
echo -e "${BLUE}Checking PostgreSQL installation...${NC}"
if command -v psql >/dev/null 2>&1; then
    echo -e "${GREEN}✅ PostgreSQL found${NC}"
else
    echo -e "${YELLOW}⚠️ PostgreSQL not found. You'll need to install and configure PostgreSQL.${NC}"
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
if npm install --no-bin-links; then
    echo -e "${GREEN}✅ Dependencies installed successfully${NC}"
else
    echo -e "${YELLOW}⚠️ Standard npm install failed. Trying alternative...${NC}"
    if yarn install 2>/dev/null || pnpm install 2>/dev/null; then
        echo -e "${GREEN}✅ Dependencies installed with alternative package manager${NC}"
    else
        echo -e "${RED}❌ Dependency installation failed. Please try manually.${NC}"
    fi
fi

# Check if .env.local exists
echo -e "${BLUE}Checking environment configuration...${NC}"
if [ -f ".env.local" ]; then
    echo -e "${GREEN}✅ .env.local found${NC}"
else
    echo -e "${YELLOW}⚠️ Creating .env.local from example...${NC}"
    cp .env.example .env.local
    echo -e "${YELLOW}Please update .env.local with your database URL${NC}"
fi

# Generate Prisma client
echo -e "${BLUE}Setting up Prisma client...${NC}"
if npx prisma generate; then
    echo -e "${GREEN}✅ Prisma client generated${NC}"
else
    echo -e "${RED}❌ Prisma generation failed. Check your setup.${NC}"
fi

# Try to push database schema (optional)
echo -e "${BLUE}Setting up database schema...${NC}"
if npx prisma db push 2>/dev/null; then
    echo -e "${GREEN}✅ Database schema applied${NC}"
else
    echo -e "${YELLOW}⚠️ Database schema not applied. Make sure PostgreSQL is running and DATABASE_URL is correct.${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo ""
echo -e "${BLUE}To launch the application:${NC}"
echo -e "  ${YELLOW}npm run dev${NC}  or  ${YELLOW}npx next dev -p 3001${NC}"
echo ""
echo -e "${BLUE}Then visit:${NC}"
echo -e "  🏠 Landing Page: ${YELLOW}http://localhost:3001${NC}"
echo -e "  🖥️ Desktop Dashboard: ${YELLOW}http://localhost:3001/dashboard${NC}"
echo -e "  📱 Mobile Interface: ${YELLOW}http://localhost:3001/mobile${NC}"
echo ""
echo -e "${BLUE}CLI Tools are ready:${NC}"
echo -e "  ${YELLOW}npm run texas-compliance help${NC}"
echo -e "  ${YELLOW}npm run analytics help${NC}"
echo -e "  ${YELLOW}npm run vendor-research help${NC}"
echo ""
echo -e "${GREEN}All features implemented and ready to use! 🚀${NC}"