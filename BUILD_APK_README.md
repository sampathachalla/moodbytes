# Building Android APK Locally - Step by Step Guide

This document explains how to build an Android APK locally for the MoodBytes React Native Expo project.

## Prerequisites

### 1. Android SDK Setup
The Android SDK was already installed via Android Studio, located at:
```
~/Library/Android/sdk
```

### 2. Environment Variables
Set up the following environment variables:
```bash
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

## Step-by-Step Build Process

### Step 1: Install Dependencies
```bash
cd /Users/sampath/Desktop/MoodBytes/Template
npm install
```

### Step 2: Fix Missing Splash Screen Resources
The build initially failed because the splash screen logo was referenced in the Android styles but the drawable resource didn't exist.

**Problem**: 
- `android/app/src/main/res/values/styles.xml` referenced `@drawable/splashscreen_logo`
- But the actual drawable files were missing from the drawable directories

**Solution**: Copy the splash screen logo from assets to all drawable density directories:
```bash
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-hdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-mdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png
```

### Step 3: Build the APK
Navigate to the android directory and run the Gradle build command:
```bash
cd android
./gradlew assembleRelease
```

## Build Configuration

### Project Structure
- **Package Name**: `com.moodbytes.app`
- **App Name**: ModeBytes
- **Version**: 1.0.0
- **Target SDK**: 36
- **Min SDK**: 24
- **Build Tools**: 36.0.0

### Key Files Modified
1. **Splash Screen Resources**: Added splash screen logo to all drawable density folders
2. **Colors**: `android/app/src/main/res/values/colors.xml` - defines splash screen background color
3. **Styles**: `android/app/src/main/res/values/styles.xml` - defines splash screen theme

## Build Output

### Successful Build Result
```
BUILD SUCCESSFUL in 3m 43s
728 actionable tasks: 122 executed, 606 up-to-date
```

### Generated APK
- **Location**: `android/app/build/outputs/apk/release/app-release.apk`
- **Size**: ~101 MB (101,039,109 bytes)
- **Type**: Release APK (signed with debug keystore)
- **Package**: `com.moodbytes.app`

## Installation Instructions

### On Android Device:
1. Transfer the APK file to your Android device
2. Enable "Install from Unknown Sources" in device settings
3. Open the APK file on your device and install

### APK File Location:
```
/Users/sampath/Desktop/MoodBytes/Template/android/app/build/outputs/apk/release/app-release.apk
```

## Troubleshooting

### Common Issues and Solutions:

1. **Missing Splash Screen Resources**
   - **Error**: `resource drawable/splashscreen_logo not found`
   - **Solution**: Copy splash screen logo to all drawable density directories

2. **Android SDK Not Found**
   - **Error**: `ANDROID_HOME not set`
   - **Solution**: Set environment variables as shown in Prerequisites

3. **Gradle Build Failures**
   - **Solution**: Clean build and try again:
     ```bash
     cd android
     ./gradlew clean
     ./gradlew assembleRelease
     ```

## Build Commands Summary

```bash
# Set up environment
export ANDROID_HOME=~/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools

# Install dependencies
npm install

# Fix splash screen resources
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-hdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-mdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-xhdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-xxhdpi/splashscreen_logo.png
cp assets/images/splashscreen_logo.png android/app/src/main/res/drawable-xxxhdpi/splashscreen_logo.png

# Build APK
cd android
./gradlew assembleRelease
```

## Notes

- The APK is signed with a debug keystore, suitable for testing only
- For production releases, you'll need to create a proper release keystore
- The build process took approximately 3 minutes and 43 seconds
- All dependencies were successfully resolved and compiled
- The app includes Firebase integration, React Native modules, and Expo modules

## Project Dependencies

Key dependencies that were built into the APK:
- React Native 0.81.4
- Expo SDK ~54.0.0
- Firebase Authentication
- React Navigation
- NativeWind (Tailwind CSS)
- Various Expo modules (Location, Image, etc.)

---

**Build Date**: October 8, 2024  
**Build Time**: ~3m 43s  
**APK Size**: 101 MB  
**Status**: ✅ Successful
