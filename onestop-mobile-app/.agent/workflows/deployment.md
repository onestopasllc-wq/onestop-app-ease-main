---
description: How to generate Android APK and iOS build files for the OneStop mobile app.
---

# Mobile Application Deployment

This workflow explains how to generate the final build files for Android and iOS.

## Prerequisites

### Android
- Flutter SDK installed and configured.
- Android Studio with Android SDK.
- (Recommended) Keystore configured in `android/key.properties` for production.

### iOS
- **macOS is required** for iOS builds.
- Xcode installed.
- Apple Developer Account (for distribution).

---

## 1. Clean and Prepare
Before any build, it is highly recommended to clean the project to ensure no stale artifacts remain.

```bash
flutter clean
flutter pub get
```

## 2. Generate Android APK
This command generates the Android application package file.

```bash
# Standard Release APK
flutter build apk --release

# Optional: Split APK (for smaller file size per device)
flutter build apk --split-per-abi
```

**Output Path:**
`build/app/outputs/flutter-apk/app-release.apk`

---

## 3. Generate iOS Build
You must be on a Mac to run these commands.

```bash
# Prepare iOS build directory
flutter build ios --release

# Generate IPA for App Store or AdHoc distribution
# This requires a valid distribution certificate in Xcode
flutter build ipa --release
```

**Output Path:**
`build/ios/ipa/`

---

## 4. Troubleshooting

- **Signing Errors**: If the build fails due to signing, ensure your Android Keystore or iOS Provisioning Profiles are correctly configured in `android/app/build.gradle` or Xcode.
- **Dependency Issues**: If you see dependency errors, try `flutter pub cache repair`.
- **Deno/Supabase Functions**: Ensure your Supabase functions are deployed before building the app if they have changed.
