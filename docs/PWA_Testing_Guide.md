# PWA Testing Guide

## Overview

This guide provides comprehensive testing procedures for the Chatrix PWA implementation, covering all features and edge cases.

## 🧪 Testing Checklist

### ✅ Basic PWA Requirements

#### Manifest Testing
- [ ] Manifest accessible at `/manifest.webmanifest`
- [ ] Contains all required fields (name, icons, start_url, display)
- [ ] Icons load correctly in browser
- [ ] Theme colors applied correctly

#### Service Worker Testing
- [ ] Service worker registers successfully
- [ ] No console errors during registration
- [ ] Service worker updates automatically
- [ ] Cache strategies working as expected

#### HTTPS Testing
- [ ] App only works over HTTPS in production
- [ ] All resources loaded securely
- [ ] No mixed content warnings

### ✅ Installation Testing

#### Desktop Installation (Chrome/Edge)
1. Open app in Chrome/Edge
2. Wait for install prompt to appear (may take a few seconds)
3. Click "Install App" button
4. Verify app opens in standalone window
5. Check app appears in OS app list
6. Test uninstallation process

#### Mobile Installation (Android)
1. Open app in Chrome mobile
2. Tap install banner or "Add to Home Screen"
3. Verify app icon appears on home screen
4. Launch app from home screen
5. Confirm standalone display mode

#### Mobile Installation (iOS Safari)
1. Open app in Safari
2. Tap Share button → "Add to Home Screen"
3. Verify app icon appears on home screen
4. Launch app from home screen
5. Confirm minimal-ui display mode

### ✅ Offline Functionality Testing

#### Network Simulation
1. **Chrome DevTools Method**:
   - Open DevTools → Network tab
   - Select "Offline" from throttling dropdown
   - Test app functionality

2. **Physical Disconnection**:
   - Disconnect WiFi/ethernet
   - Turn off mobile data
   - Test app functionality

#### Offline Features to Test
- [ ] App loads when offline
- [ ] Previously loaded chats accessible
- [ ] Offline banner appears
- [ ] Network status indicator shows offline
- [ ] Message queue functionality works
- [ ] Graceful degradation of features

#### Cache Testing
- [ ] Static assets load from cache
- [ ] API responses cached appropriately
- [ ] Cache size displayed correctly
- [ ] Cache clearing works properly

### ✅ Push Notification Testing

#### Permission Testing
- [ ] Notification permission requested appropriately
- [ ] Permission granted/denied handled gracefully
- [ ] Settings allow notification control

#### Background Notifications
1. **Setup**:
   - Ensure app is closed/backgrounded
   - Have another user send a message
   - Verify notification appears

2. **Notification Content**:
   - [ ] Title shows sender name
   - [ ] Body shows message content
   - [ ] App icon displays correctly
   - [ ] Click opens correct chat

3. **Notification Actions**:
   - [ ] "View Message" action works
   - [ ] "Dismiss" action works
   - [ ] Click notification opens app

#### Foreground Notifications
- [ ] Toast notifications appear when app is open
- [ ] Actions work correctly
- [ ] Notifications don't duplicate background ones

### ✅ Service Worker Update Testing

#### Manual Update Testing
1. **Trigger Update**:
   - Build new version of app
   - Deploy to server
   - Open existing app instance
   - Wait for update detection

2. **Update Process**:
   - [ ] Update prompt appears
   - [ ] "Reload" button works
   - [ ] New version loads correctly
   - [ ] Old caches cleared

#### Automatic Update Testing
- [ ] Updates detected automatically
- [ ] User prompted appropriately
- [ ] Seamless update experience

### ✅ Cross-Browser Testing

#### Chrome/Chromium
- [ ] Full PWA features work
- [ ] Installation prompt appears
- [ ] Service worker functions correctly
- [ ] Push notifications work

#### Firefox
- [ ] Service worker works
- [ ] Caching functional
- [ ] Install option in browser menu
- [ ] Notifications work (where supported)

#### Safari (Desktop)
- [ ] Service worker works
- [ ] Basic PWA features functional
- [ ] Push notifications work (macOS Big Sur+)

#### Safari (iOS)
- [ ] Add to Home Screen works
- [ ] App launches in standalone mode
- [ ] Service worker functions
- [ ] Limited notification support

#### Edge
- [ ] Full PWA support
- [ ] Installation works
- [ ] All features functional

### ✅ Performance Testing

#### Lighthouse Audit
1. **Run Lighthouse PWA Audit**:
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Select "Progressive Web App"
   - Run audit

2. **Target Scores**:
   - [ ] PWA Score: 90+
   - [ ] Performance: 80+
   - [ ] Accessibility: 90+
   - [ ] Best Practices: 90+
   - [ ] SEO: 90+

#### Cache Performance
- [ ] First load vs cached load comparison
- [ ] Cache hit rates acceptable
- [ ] Cache size within reasonable limits
- [ ] Network requests minimized when offline

#### Bundle Size Analysis
- [ ] Main bundle size reasonable (<1MB)
- [ ] Code splitting effective
- [ ] Unused code eliminated
- [ ] Asset optimization working

### ✅ User Experience Testing

#### Install Prompt UX
- [ ] Prompt appears at appropriate time
- [ ] Prompt is not intrusive
- [ ] Benefits clearly communicated
- [ ] Easy to dismiss or install

#### Offline UX
- [ ] Clear offline indicators
- [ ] Helpful error messages
- [ ] Graceful feature degradation
- [ ] Queue status visible to user

#### Update UX
- [ ] Update prompts user-friendly
- [ ] Clear benefits of updating
- [ ] Non-disruptive update process
- [ ] Fallback if update fails

## 🔧 Testing Tools

### Browser Dev Tools
```javascript
// Service Worker debugging
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Registered SWs:', registrations);
});

// Cache inspection
caches.keys().then(names => {
  console.log('Cache names:', names);
});

// PWA install status
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('Install prompt available');
});
```

### Lighthouse CLI
```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run PWA audit
lighthouse https://your-app.com --only-categories=pwa --output=html

# Run full audit
lighthouse https://your-app.com --output=html
```

### Manual Testing Scripts
```javascript
// Test offline queue
function testOfflineQueue() {
  // Simulate offline message
  if (!navigator.onLine) {
    addMessageToQueue({
      chatId: 'test-chat',
      content: 'Test offline message',
      type: 'message',
      tempId: 'temp-123'
    });
    console.log('Message added to offline queue');
  }
}

// Test notification permissions
function testNotificationPermission() {
  Notification.requestPermission().then(permission => {
    console.log('Notification permission:', permission);
  });
}

// Test cache size
async function testCacheSize() {
  const size = await getCacheSize();
  console.log('Total cache size:', size);
}
```

## 🐛 Common Issues & Solutions

### Issue: Install Prompt Not Showing
**Possible Causes**:
- PWA criteria not met
- HTTPS requirement not satisfied
- Manifest file issues
- User already dismissed prompt

**Testing Steps**:
1. Check browser console for errors
2. Verify manifest in DevTools
3. Ensure HTTPS is active
4. Clear browser data and test again

### Issue: Service Worker Not Updating
**Possible Causes**:
- Browser caching service worker file
- Update mechanism not implemented
- User not accepting update prompts

**Testing Steps**:
1. Force refresh (Ctrl+Shift+R)
2. Clear service worker in DevTools
3. Check update detection logic
4. Verify cache versioning

### Issue: Offline Features Not Working
**Possible Causes**:
- Service worker not registered
- Cache strategies not implemented
- Network detection issues

**Testing Steps**:
1. Verify service worker registration
2. Check cache contents in DevTools
3. Test network event listeners
4. Validate cache strategies

### Issue: Push Notifications Not Working
**Possible Causes**:
- Permissions not granted
- Firebase configuration issues
- Service worker not handling messages
- VAPID keys incorrect

**Testing Steps**:
1. Check notification permissions
2. Verify Firebase configuration
3. Test with Firebase console
4. Validate service worker message handling

## 📊 Testing Metrics

### PWA Compliance
- **Installability**: Can be installed on all supported platforms
- **App-like**: Behaves like a native app
- **Connectivity**: Works offline and with poor connections
- **Re-engagement**: Can re-engage users via push notifications

### Performance Benchmarks
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **First Input Delay**: < 100ms
- **Cumulative Layout Shift**: < 0.1

### Functional Requirements
- **Service Worker**: Registered and functional
- **Manifest**: Valid and complete
- **HTTPS**: Served over secure connection
- **Icons**: Available in required sizes

## 📋 Test Report Template

```markdown
# PWA Test Report - [Date]

## Environment
- **Browser**: [Chrome 96, Firefox 94, etc.]
- **OS**: [Windows 10, macOS 12, Android 11, etc.]
- **Device**: [Desktop, iPhone 12, Samsung Galaxy, etc.]

## Test Results
- [ ] Basic PWA Requirements: PASS/FAIL
- [ ] Installation: PASS/FAIL
- [ ] Offline Functionality: PASS/FAIL
- [ ] Push Notifications: PASS/FAIL
- [ ] Service Worker Updates: PASS/FAIL
- [ ] Performance: PASS/FAIL

## Issues Found
1. **Issue**: [Description]
   - **Severity**: Critical/High/Medium/Low
   - **Steps to Reproduce**: [Steps]
   - **Expected**: [Expected behavior]
   - **Actual**: [Actual behavior]

## Recommendations
- [List of recommendations for improvements]

## Overall Assessment
- **PWA Compliance**: Compliant/Partially Compliant/Non-Compliant
- **User Experience**: Excellent/Good/Fair/Poor
- **Performance**: Excellent/Good/Fair/Poor
```

---

**Testing Framework**: Manual + Automated  
**Last Updated**: January 2025  
**Version**: 1.0.0

*This testing guide ensures comprehensive validation of all PWA features and functionality.* 