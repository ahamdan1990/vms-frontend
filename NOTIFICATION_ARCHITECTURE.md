# Unified Notification System Architecture

## Core Principles
1. **Single Source of Truth** - All notifications managed by `notificationSlice.js` only
2. **Consistent API** - One hook (`useNotifications`) for all notification operations
3. **Type Safety** - Centralized notification types and interfaces
4. **Performance** - Optimized rendering and minimal re-renders
5. **Scalability** - Easy to extend with new notification types

## System Components

### 1. Redux State Management
- **Primary**: `notificationSlice.js` (enhanced)
- **Remove**: Notification logic from `uiSlice.js`
- **Consolidate**: All notification state in single slice

### 2. Component Architecture
- **NotificationProvider** - Top-level provider component
- **ToastContainer** - Renders temporary toast notifications
- **NotificationCenter** - Persistent notification panel
- **NotificationButton** - Bell icon with badge

### 3. Hook API
- **useNotifications()** - Primary hook for all notification operations
- **useToast()** - Specialized hook for toast notifications

### 4. Integration Points
- **SignalR** - Real-time notifications
- **Service Worker** - Desktop/push notifications
- **API** - Persistent notification storage

## Implementation Plan

### Phase 1: Consolidate Redux State (Day 1)
1. Remove notification logic from `uiSlice.js`
2. Enhance `notificationSlice.js` with unified state
3. Update all components to use single slice

### Phase 2: Create Unified Components (Day 1-2)
1. Build `NotificationProvider` wrapper
2. Refactor `ToastContainer` for Redux integration
3. Update `NotificationCenter` for consistency

### Phase 3: Implement Hooks (Day 2)
1. Create `useNotifications` hook
2. Migrate all components to use unified hook
3. Remove old Context-based systems

### Phase 4: Testing & Optimization (Day 3)
1. Test all notification scenarios
2. Performance optimization
3. Clean up unused code
