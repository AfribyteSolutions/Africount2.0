#!/bin/bash

# Africount Mobile - APK Build Script
# This script builds a production APK for Android deployment

set -e

echo "🔨 Building Africount Mobile APK..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Verify prerequisites
echo -e "${BLUE}Step 1: Verifying prerequisites...${NC}"
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi

if ! command -v eas &> /dev/null; then
    echo "⚠️  EAS CLI not found. Installing..."
    npm install -g eas-cli
fi

echo -e "${GREEN}✓ Prerequisites verified${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# Step 3: Build APK
echo -e "${BLUE}Step 3: Building APK...${NC}"
echo "Note: This may take 5-15 minutes depending on your internet connection"
echo ""

# Build preview APK (suitable for testing)
eas build --platform android --profile preview

echo ""
echo -e "${GREEN}✓ APK build completed!${NC}"
echo ""

# Step 4: Download APK
echo -e "${BLUE}Step 4: APK Information${NC}"
echo "Your APK has been built and is ready for download."
echo "Check the EAS build dashboard for download links:"
echo "https://expo.dev/builds"
echo ""

# Step 5: Installation instructions
echo -e "${YELLOW}Installation Instructions:${NC}"
echo "1. Download the APK from the EAS dashboard"
echo "2. Transfer to Android device or emulator"
echo "3. Install: adb install path/to/app.apk"
echo "4. Or: Open APK file directly on Android device"
echo ""

echo -e "${GREEN}Build process complete!${NC}"
