# Africount Mobile App - Complete Setup & Deployment Guide

## 📋 Table of Contents
1. [Quick Start](#quick-start)
2. [Installation](#installation)
3. [Configuration](#configuration)
4. [Development](#development)
5. [Testing](#testing)
6. [Deployment](#deployment)
7. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Prerequisites
- Node.js 18+ and npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- For iOS: Xcode 14+ and macOS
- For Android: Android Studio and Android SDK

### 5-Minute Setup
```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm start

# 3. Run on simulator
npm run ios          # iOS simulator
npm run android      # Android emulator

# 4. Test offline functionality
# Disable network in simulator and verify app still works
```

---

## Installation

### Step 1: Clone and Install
```bash
cd africount-mobile
npm install
```

### Step 2: Environment Setup
Create `.env` file in project root:
```env
# Backend API Configuration
REACT_APP_API_URL=https://your-africount-backend.com
REACT_APP_OAUTH_URL=https://oauth.manus.im

# App Configuration
REACT_APP_APP_NAME=Africount
REACT_APP_VERSION=1.0.0
```

### Step 3: Verify Installation
```bash
npm start
# Should see Expo dev server running on port 19000
```

---

## Configuration

### app.json Configuration
```json
{
  "expo": {
    "name": "Africount",
    "slug": "africount-mobile",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "ios": {
      "supportsTabletMode": true,
      "bundleIdentifier": "com.africount.mobile"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.africount.mobile"
    }
  }
}
```

### Offline Sync Configuration
Edit `src/lib/offlineSync.ts`:
```typescript
const SYNC_CONFIG = {
  maxRetries: 3,
  retryDelay: 5000,
  batchSize: 50,
  cacheExpiry: 24 * 60 * 60 * 1000, // 24 hours
};
```

---

## Development

### Project Structure
```
africount-mobile/
├── src/
│   ├── App.tsx                    # Main app entry
│   ├── screens/
│   │   ├── LoginScreen.tsx        # Authentication
│   │   ├── DashboardScreen.tsx    # Home dashboard
│   │   ├── TransactionsScreen.tsx # Transaction CRUD
│   │   ├── BudgetsScreen.tsx      # Budget management
│   │   ├── ProjectsScreen.tsx     # Project tracking
│   │   └── SettingsScreen.tsx     # User settings
│   └── lib/
│       ├── offlineSync.ts         # Offline-first engine
│       ├── apiClient.ts           # API client with fallback
│       └── currencyFormatter.ts   # Utilities
├── app.json                       # Expo config
├── package.json                   # Dependencies
└── README.md                      # Documentation
```

### Development Workflow

#### 1. Start Dev Server
```bash
npm start
```

#### 2. Run on Simulator
```bash
# iOS
npm run ios

# Android
npm run android

# Web (for testing)
npm run web
```

#### 3. Hot Reload
- Changes to files automatically reload in simulator
- Press `r` in terminal to manually reload

#### 4. Debug
```bash
# Open React Native Debugger
# Menu → Debugger in Expo app
# Or use Chrome DevTools: http://localhost:19000/debugger-ui
```

---

## Testing

### Manual Testing Checklist

#### Authentication
- [ ] Login with valid credentials
- [ ] Invalid credentials show error
- [ ] Token persists after app restart
- [ ] Logout clears all data

#### Offline Functionality
- [ ] View dashboard offline
- [ ] Add transaction offline
- [ ] Edit transaction offline
- [ ] Delete transaction offline
- [ ] Offline banner displays correctly

#### Sync Functionality
- [ ] Pending changes counter shows
- [ ] Changes sync when online
- [ ] Sync status updates
- [ ] Conflict resolution works
- [ ] Retry on sync failure

#### UI/UX
- [ ] All screens render correctly
- [ ] Navigation works smoothly
- [ ] Forms validate input
- [ ] Loading states display
- [ ] Error messages are clear

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

---

## Deployment

### iOS App Store

#### Prerequisites
- Apple Developer Account ($99/year)
- Mac with Xcode
- Provisioning profiles and certificates

#### Build for iOS
```bash
# Option 1: Using Expo (Recommended)
npm run build:ios

# Option 2: Local build
expo build:ios

# Option 3: Using EAS CLI (Easiest)
eas build --platform ios
```

#### Submit to App Store
1. Open App Store Connect
2. Create new app
3. Upload build using Transporter
4. Fill in app information
5. Submit for review

#### App Store Metadata
- App Name: Africount
- Subtitle: Mobile Financial Suite
- Description: Offline-first financial management app
- Keywords: finance, accounting, budgeting, offline
- Category: Business
- Rating: 4+

### Google Play Store

#### Prerequisites
- Google Play Developer Account ($25 one-time)
- Keystore file for signing

#### Build for Android
```bash
# Using EAS (Recommended)
eas build --platform android

# Or local build
expo build:android
```

#### Generate Keystore
```bash
keytool -genkey -v -keystore africount-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias africount-key
```

#### Submit to Play Store
1. Open Google Play Console
2. Create new app
3. Upload APK/AAB
4. Fill in store listing
5. Add screenshots and description
6. Submit for review

#### Play Store Metadata
- App Name: Africount
- Short Description: Offline financial management
- Full Description: Complete financial suite with offline-first sync
- Category: Finance
- Content Rating: Everyone

### Version Management
```bash
# Update version in app.json
{
  "expo": {
    "version": "1.0.1"
  }
}

# Build and deploy
npm run build:ios
npm run build:android
```

---

## Troubleshooting

### Common Issues

#### "Metro bundler is not running"
```bash
# Solution: Clear cache and restart
npm start -- --clear
```

#### "Offline sync not working"
```bash
# Check sync status
import { offlineSyncEngine } from './lib/offlineSync';
console.log(offlineSyncEngine.getSyncStatus());

# Clear cache
await offlineSyncEngine.clearCache();
```

#### "Authentication token expired"
```bash
# Token auto-refreshes, but if stuck:
await AsyncStorage.removeItem('authToken');
// User will be redirected to login
```

#### "App crashes on startup"
```bash
# Clear app data and cache
# iOS: Settings > General > iPhone Storage > Africount > Delete App
# Android: Settings > Apps > Africount > Storage > Clear Cache/Data

# Then restart app
```

### Performance Optimization

#### Reduce Bundle Size
```bash
# Analyze bundle
npm install -g source-map-explorer
source-map-explorer 'dist/**/*.js'
```

#### Improve Sync Speed
```typescript
// Adjust batch size in offlineSync.ts
const SYNC_CONFIG = {
  batchSize: 100, // Increase for faster sync
};
```

#### Cache Management
```typescript
// Clear old cache
await offlineSyncEngine.clearOldCache(24 * 60 * 60 * 1000);
```

### Debug Logging

Enable debug mode:
```typescript
// In src/App.tsx
const DEBUG = true;

if (DEBUG) {
  console.log('[App] Initializing...');
  console.log('[Sync] Status:', offlineSyncEngine.getSyncStatus());
}
```

---

## API Integration

### Connecting to Africount Backend

#### 1. Set API URL
```typescript
// src/lib/apiClient.ts
const API_BASE_URL = 'https://your-backend.com';
```

#### 2. Authentication
```typescript
import { apiClient } from './lib/apiClient';

// Set token after login
apiClient.setToken(authToken);

// Token auto-includes in all requests
```

#### 3. Making Requests
```typescript
// GET request
const response = await apiClient.get('/api/trpc/transaction.list');

// POST request
const response = await apiClient.post('/api/trpc/transaction.create', {
  description: 'Office supplies',
  amount: 50,
  type: 'expense',
});
```

---

## Monitoring & Analytics

### Error Tracking
```bash
npm install @sentry/react-native
```

### Analytics
```bash
npm install react-native-firebase
```

### Crash Reporting
- Sentry: https://sentry.io
- Firebase Crashlytics: https://firebase.google.com

---

## Support & Resources

- **Documentation**: See README.md
- **Issues**: Report bugs on GitHub
- **Support**: support@africount.com
- **Community**: Discord server

---

## License

Proprietary - All rights reserved © 2024 Africount
