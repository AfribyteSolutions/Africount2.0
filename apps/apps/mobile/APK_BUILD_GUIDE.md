# Africount Mobile - APK Build Guide

## Overview

This guide explains how to build and deploy the Africount mobile app as an APK (Android Package) for Android devices.

---

## What is an APK?

An APK (Android Package) is the file format used to distribute Android applications. It contains all the necessary code, resources, and assets needed to run an app on Android devices.

**Types of APK:**
- **APK**: Single architecture package (faster build, larger file)
- **AAB (Android App Bundle)**: Multiple architectures (recommended for Play Store)

---

## Prerequisites

Before building an APK, ensure you have:

1. **Node.js 18+** and npm installed
2. **Expo CLI**: `npm install -g expo-cli`
3. **EAS CLI**: `npm install -g eas-cli`
4. **Expo Account** (free): https://expo.dev
5. **Internet connection** (build runs in cloud)

### Verify Installation
```bash
node --version          # Should be 18+
npm --version           # Should be 8+
expo --version          # Should be latest
eas --version           # Should be 5+
```

---

## Build Methods

### Method 1: Using EAS CLI (Recommended)

EAS (Expo Application Services) builds your app in the cloud, which is the easiest and most reliable method.

#### Step 1: Login to Expo
```bash
eas login
# Or: eas login --username your-username --password your-password
```

#### Step 2: Configure Project
```bash
cd africount-mobile
eas build:configure
# Select Android when prompted
```

#### Step 3: Build APK
```bash
# Build for testing (APK format)
eas build --platform android --profile preview

# Or build for production
eas build --platform android --profile production
```

#### Step 4: Monitor Build
```bash
# View build status
eas build:list

# View build logs
eas build:view <BUILD_ID>
```

#### Step 5: Download APK
- Visit https://expo.dev/builds
- Find your build
- Click "Download" to get the APK

### Method 2: Using Build Script

We've provided a convenient build script:

```bash
chmod +x build-apk.sh
./build-apk.sh
```

This script will:
1. Verify prerequisites
2. Install dependencies
3. Build the APK using EAS
4. Provide download instructions

### Method 3: Local Build (Advanced)

For local builds, you need Android SDK and Java installed:

```bash
# Install Gradle
brew install gradle

# Build locally
expo build:android --type apk

# Or using Expo CLI
expo prebuild --clean
cd android
./gradlew assembleRelease
```

---

## Build Configuration

### app.json Settings

The `app.json` file controls build behavior:

```json
{
  "expo": {
    "name": "Africount",
    "slug": "africount-mobile",
    "version": "1.0.0",
    "android": {
      "package": "com.africount.mobile",
      "versionCode": 1,
      "permissions": [
        "INTERNET",
        "WRITE_EXTERNAL_STORAGE",
        "READ_EXTERNAL_STORAGE"
      ]
    }
  }
}
```

### eas.json Settings

The `eas.json` file configures EAS builds:

```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "aab"
      }
    }
  }
}
```

---

## Build Profiles

### Preview Profile (Testing)
```bash
eas build --platform android --profile preview
```
- Builds APK format
- Faster build time (5-10 minutes)
- Suitable for testing and internal distribution
- Can be installed directly on devices

### Production Profile (App Store)
```bash
eas build --platform android --profile production
```
- Builds AAB format (Android App Bundle)
- Optimized for Play Store
- Smaller download size for users
- Required for Play Store submission

---

## Installation

### On Physical Device

#### Option 1: Direct Installation
1. Download APK to your computer
2. Connect Android device via USB
3. Enable USB debugging on device
4. Run: `adb install path/to/app.apk`

#### Option 2: Email/Download
1. Download APK to device
2. Open file manager
3. Tap APK file to install
4. Grant permissions when prompted

#### Option 3: QR Code
1. Generate QR code from EAS dashboard
2. Scan with Android device
3. Tap link to download and install

### On Android Emulator

```bash
# Start emulator
emulator -avd Pixel_5_API_31

# Install APK
adb install path/to/app.apk

# Or from EAS dashboard, copy download link and use
adb install-multiple <URL>
```

---

## Testing the APK

### Pre-Installation Testing

Before distributing, test the APK:

```bash
# Install on emulator
adb install app.apk

# Run app
adb shell am start -n com.africount.mobile/.MainActivity

# View logs
adb logcat | grep africount

# Uninstall
adb uninstall com.africount.mobile
```

### Functional Testing Checklist

- [ ] App launches without crashes
- [ ] Login screen displays correctly
- [ ] Authentication works
- [ ] Dashboard loads data
- [ ] Transactions can be added
- [ ] Offline mode works
- [ ] Sync functionality works
- [ ] Navigation works smoothly
- [ ] All screens render correctly
- [ ] No memory leaks

### Performance Testing

```bash
# Monitor memory usage
adb shell dumpsys meminfo com.africount.mobile

# Monitor CPU usage
adb shell top -p $(adb shell pidof com.africount.mobile)

# View crash logs
adb logcat *:E | grep africount
```

---

## Troubleshooting

### Build Fails with "No credentials"

```bash
# Solution: Login to Expo
eas login
eas whoami  # Verify login
```

### Build Fails with "Invalid package name"

Ensure `app.json` has valid package name:
```json
{
  "android": {
    "package": "com.africount.mobile"
  }
}
```

### APK Installation Fails

```bash
# Clear app data
adb shell pm clear com.africount.mobile

# Uninstall and reinstall
adb uninstall com.africount.mobile
adb install app.apk
```

### App Crashes on Launch

```bash
# View crash logs
adb logcat | grep FATAL

# Check for missing permissions
# Update app.json with required permissions
```

### Build Takes Too Long

- EAS builds typically take 5-15 minutes
- First build may take longer
- Check build status: `eas build:list`
- View logs: `eas build:view <BUILD_ID>`

---

## Distribution

### Internal Testing

1. Build APK using preview profile
2. Share APK file or download link
3. Testers install on their devices
4. Collect feedback and bug reports

### Beta Testing (Google Play)

1. Create Google Play Console account
2. Create app listing
3. Upload APK to internal testing track
4. Invite testers via email
5. Collect feedback

### Production Release

1. Build AAB using production profile
2. Upload to Google Play Console
3. Complete store listing
4. Submit for review
5. Monitor app performance

---

## Version Management

### Updating Version

When releasing a new version:

1. Update `app.json`:
```json
{
  "version": "1.0.1",
  "android": {
    "versionCode": 2
  }
}
```

2. Build new APK:
```bash
eas build --platform android --profile preview
```

3. Test thoroughly
4. Distribute to testers/users

### Version Code vs Version Name

- **Version Code** (versionCode): Internal number, must increment
- **Version Name** (version): User-facing version (1.0.0, 1.0.1, etc.)

---

## Security

### Signing Configuration

APKs are automatically signed by EAS with a secure key. For local builds:

```bash
# Generate keystore
keytool -genkey -v -keystore africount-release.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias africount-key

# Use in gradle.properties
AFRICOUNT_RELEASE_STORE_FILE=africount-release.keystore
AFRICOUNT_RELEASE_STORE_PASSWORD=your-password
AFRICOUNT_RELEASE_KEY_ALIAS=africount-key
AFRICOUNT_RELEASE_KEY_PASSWORD=your-password
```

### Secure Storage

Never commit keystore files to git:

```bash
# Add to .gitignore
*.keystore
*.jks
gradle.properties
```

---

## Monitoring & Analytics

### Crash Reporting

Set up Sentry for crash monitoring:

```bash
npm install @sentry/react-native
```

### User Analytics

Set up Firebase Analytics:

```bash
npm install react-native-firebase
```

---

## Support

- **EAS Documentation**: https://docs.expo.dev/eas/
- **Android Documentation**: https://developer.android.com/
- **Troubleshooting**: See MOBILE_APP_SETUP.md
- **Support Email**: support@africount.com

---

## Next Steps

1. Build APK using EAS CLI
2. Test on Android device
3. Gather feedback from testers
4. Fix any issues
5. Prepare for Play Store submission

---

**Last Updated:** April 14, 2024
