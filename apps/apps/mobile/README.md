# Africount Mobile - React Native Companion App

Offline-first mobile application for Africount, enabling field agents and remote team members to access financial data and record transactions without internet connectivity.

## Features

### Core Capabilities
- **Offline-First Architecture**: Full functionality without internet connection
- **Automatic Sync**: Seamless synchronization when connection is restored
- **Real-Time Collaboration**: Comments and mentions on transactions and budgets
- **Multi-Language Support**: 5 languages (English, French, Spanish, Swahili, Arabic)
- **Multi-Currency**: 13+ currencies with automatic conversion
- **Role-Based Access**: Admin, Manager, Agent permissions

### Modules
1. **Dashboard**: Quick overview of financial metrics
2. **Transactions**: Record, view, and manage financial transactions
3. **Budgets**: Monitor budget allocation and spending
4. **Projects**: Track project budgets and financial performance
5. **Analytics**: View charts and financial insights
6. **Settings**: User preferences and workspace configuration

## Architecture

### Offline-First Sync Engine
```
┌─────────────────────────────────────────┐
│  React Native Frontend (Expo)           │
│  - Navigation (React Navigation)        │
│  - UI Components (React Native)         │
│  - State Management (AsyncStorage)      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Offline Sync Engine                    │
│  - SQLite local database                │
│  - Sync queue management                │
│  - Conflict resolution                  │
│  - Change tracking                      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  API Client with Fallback               │
│  - Online: HTTP requests to backend     │
│  - Offline: Read from SQLite cache      │
│  - Queue operations for later sync      │
└──────────────────┬──────────────────────┘
                   │
┌──────────────────▼──────────────────────┐
│  Africount Backend (Express.js + tRPC)  │
│  - 102 tRPC procedures                  │
│  - 51 database tables                   │
│  - Multi-tenant architecture            │
└─────────────────────────────────────────┘
```

### Database Schema (SQLite)

**Cache Tables:**
- `transactions_cache` - Cached transaction data
- `budgets_cache` - Cached budget information
- `projects_cache` - Cached project data

**Sync Tables:**
- `sync_queue` - Pending operations awaiting sync
- `sync_metadata` - Sync status and timestamps

## Installation

### Prerequisites
- Node.js 18+ and npm/pnpm
- Expo CLI: `npm install -g expo-cli`
- iOS: Xcode (for iOS development)
- Android: Android Studio (for Android development)

### Setup

```bash
# Clone the repository
cd africount-mobile

# Install dependencies
npm install

# Start the development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for production
npm run build:android
npm run build:ios
```

## Usage

### Authentication
1. Launch the app
2. Enter your Africount credentials
3. Select your workspace
4. App syncs available data and enables offline access

### Recording Transactions Offline
1. Navigate to Transactions tab
2. Tap "+ Add Transaction"
3. Fill in transaction details
4. Tap "Save"
4. Transaction is queued locally
5. When online, changes sync automatically

### Monitoring Sync Status
- Blue banner shows pending changes count
- Yellow banner indicates offline mode
- Sync status visible in Settings tab

## Development

### Project Structure
```
africount-mobile/
├── src/
│   ├── App.tsx                 # Main app component with navigation
│   ├── screens/                # Screen components
│   │   ├── LoginScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── TransactionsScreen.tsx
│   │   ├── BudgetsScreen.tsx
│   │   ├── ProjectsScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── lib/
│       ├── offlineSync.ts      # Offline sync engine
│       ├── apiClient.ts        # API client with fallback
│       └── currencyFormatter.ts # Currency utilities
├── app.json                    # Expo configuration
├── package.json                # Dependencies
└── README.md                   # This file
```

### Key Files

**offlineSync.ts** - Offline-First Sync Engine
- Manages SQLite local database
- Queues operations for sync
- Handles conflict resolution
- Tracks sync status

**apiClient.ts** - API Client with Fallback
- Makes HTTP requests when online
- Falls back to cached data when offline
- Queues operations for sync
- Handles authentication

## API Integration

### Connecting to Backend
```typescript
import { apiClient } from './lib/apiClient';

// Set authentication token
apiClient.setToken('your-auth-token');

// Make requests (works online and offline)
const response = await apiClient.get('/api/trpc/transaction.list');

// Sync pending changes when online
await apiClient.syncPendingChanges();
```

### Sync Status Monitoring
```typescript
import { offlineSyncEngine } from './lib/offlineSync';

// Get current sync status
const status = offlineSyncEngine.getSyncStatus();
console.log(`Pending changes: ${status.pendingChanges}`);
console.log(`Last sync: ${status.lastSyncTime}`);
```

## Performance Optimization

### Caching Strategy
- **Transactions**: Cache last 1000 records
- **Budgets**: Cache all active budgets
- **Projects**: Cache all workspace projects
- **Metadata**: Update sync timestamps

### Offline Capabilities
- View cached data without internet
- Record new transactions offline
- Edit cached records
- Delete records (marked for sync)
- Full search and filtering on cached data

## Security

### Authentication
- OAuth 2.0 with Manus OAuth provider
- Secure token storage in AsyncStorage
- Automatic token refresh
- Session timeout after 30 minutes

### Data Protection
- SQLite encryption (optional)
- HTTPS for all API calls
- Secure headers on requests
- HMAC signature verification

## Troubleshooting

### Sync Issues
```typescript
// Check sync queue
const queue = offlineSyncEngine.getSyncQueue();
console.log('Pending items:', queue);

// Clear cache and resync
await offlineSyncEngine.clearCache();
await apiClient.syncPendingChanges();
```

### Offline Mode
- Check network connectivity
- Verify cached data exists
- Review sync status banner
- Check app logs for errors

## Testing

### Unit Tests
```bash
npm test
```

### Integration Tests
```bash
npm run test:integration
```

### Manual Testing Checklist
- [ ] Login with valid credentials
- [ ] View dashboard offline
- [ ] Add transaction offline
- [ ] Sync when online
- [ ] Switch languages
- [ ] Change currency
- [ ] Logout and login

## Deployment

### iOS App Store
```bash
npm run build:ios
# Submit to App Store Connect
```

### Google Play Store
```bash
npm run build:android
# Submit to Google Play Console
```

### Build Configuration
- App name: Africount
- Bundle ID (iOS): com.africount.mobile
- Package name (Android): com.africount.mobile
- Version: 1.0.0
- Supported languages: EN, FR, ES, SW, AR

## Future Enhancements

1. **Biometric Authentication**: Fingerprint/Face ID login
2. **Push Notifications**: Real-time alerts for approvals
3. **Offline Analytics**: Charts and reports without internet
4. **Voice Recording**: Record transaction notes with voice
5. **Barcode Scanning**: Scan receipts and invoices
6. **Advanced Sync**: Differential sync for large datasets
7. **Offline Maps**: Download maps for location tracking
8. **Document Management**: Attach receipts and invoices

## Support

For issues or feature requests, contact: support@africount.com

## License

Proprietary - All rights reserved © 2024 Africount
