# Unified Notification System - Implementation Plan

## **Phase 1: Backup & Preparation (30 minutes)**

### 1.1 Create Backup
```bash
# Create backup of current files
mkdir -p backup/components/notifications
mkdir -p backup/store/slices
mkdir -p backup/hooks

cp src/components/notifications/* backup/components/notifications/
cp src/store/slices/notificationSlice.js backup/store/slices/
cp src/store/slices/uiSlice.js backup/store/slices/
cp src/App.js backup/
```

### 1.2 Review Dependencies
- Ensure `@heroicons/react` is installed
- Verify `framer-motion` is available
- Check Redux Toolkit version

## **Phase 2: Replace Redux Slices (1 hour)**

### 2.1 Replace notificationSlice.js
```bash
# Replace the file with unified version
cp unifiedNotificationSlice.js src/store/slices/notificationSlice.js
```

### 2.2 Remove Notification Logic from uiSlice.js
Edit `src/store/slices/uiSlice.js`:
```javascript
// REMOVE these from initialState:
notifications: {
  unreadCount: 0,
  items: []
}

// REMOVE these actions:
setNotificationCount,
setNotifications, 
addNotification,
markNotificationAsRead
```

### 2.3 Update rootReducer.js
Ensure it imports the updated notification slice:
```javascript
import notificationReducer from './slices/notificationSlice';
// Should work without changes
```

## **Phase 3: Install New Components (1 hour)**

### 3.1 Add New Hook
```bash
cp useNotifications.js src/hooks/
```

### 3.2 Replace Notification Components
```bash
# Replace existing files
cp NotificationProvider.js src/components/notifications/
cp ToastContainer.js src/components/notifications/
cp Toast.js src/components/notifications/

# Keep NotificationCenter.js but update imports if needed
```

### 3.3 Update App.js
```bash
cp AppUpdated.js src/App.js
```

## **Phase 4: Update Component Imports (30 minutes)**

### 4.1 Find All Toast Usage
```bash
# Search for old toast usage
grep -r "useToast" src/ --exclude-dir=node_modules
grep -r "ToastProvider" src/ --exclude-dir=node_modules
grep -r "addToast" src/ --exclude-dir=node_modules
```

### 4.2 Update Imports Across Components
Replace old imports:
```javascript
// OLD
import { useToast } from '../components/notifications/ToastManager';
import { addToast } from '../store/slices/notificationSlice';

// NEW  
import { useNotifications, useToast } from '../hooks/useNotifications';
```

## **Phase 5: Testing & Validation (1 hour)**

### 5.1 Test Basic Functionality
- [ ] App starts without errors
- [ ] Toast notifications appear
- [ ] Notification center works
- [ ] SignalR integration functional

### 5.2 Test Notification Types
- [ ] Success toasts
- [ ] Error toasts  
- [ ] Warning toasts
- [ ] Info toasts
- [ ] Visitor notifications
- [ ] Security alerts

### 5.3 Test Integration Points
- [ ] API calls trigger notifications
- [ ] SignalR real-time notifications
- [ ] Desktop notifications (if permitted)
- [ ] Notification persistence
- [ ] Mark as read functionality

## **Phase 6: Cleanup (30 minutes)**

### 6.1 Remove Old Files
```bash
# Only after confirming everything works
rm backup/components/notifications/ToastManager.js
rm backup/components/notifications/ToastNotification.js  
rm src/components/common/Notification/Notification.js
```

### 6.2 Update Documentation
- Update component documentation
- Add usage examples for new hooks
- Document notification types and priorities

## **Common Migration Patterns**

### Old Pattern:
```javascript
import { useToast } from '../components/notifications/ToastManager';

const { success, error } = useToast();
success('Operation completed!');
```

### New Pattern:
```javascript
import { useToast } from '../hooks/useNotifications';

const { success, error } = useToast();
success('Success!', 'Operation completed successfully');
```

### For Complex Notifications:
```javascript
import { useNotifications } from '../hooks/useNotifications';

const { toast, visitor, system } = useNotifications();

// Simple toast
toast.success('Title', 'Message');

// Domain-specific
visitor.checkedIn('John Doe', 'Jane Smith');
system.invitationSent('user@example.com');
```

## **Rollback Plan**

If issues occur:
```bash
# Restore backups
cp backup/App.js src/
cp backup/store/slices/* src/store/slices/
cp backup/components/notifications/* src/components/notifications/
```

## **Success Criteria**

- ✅ Single source of truth for all notifications
- ✅ Consistent API across the application  
- ✅ No duplicate notification systems
- ✅ Real-time notifications work
- ✅ Desktop notifications function
- ✅ Performance improvement (fewer re-renders)
- ✅ Maintainable and scalable architecture