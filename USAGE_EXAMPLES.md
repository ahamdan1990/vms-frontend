# Unified Notification System - Usage Examples

## **Basic Toast Notifications**

```javascript
import { useToast } from '../hooks/useNotifications';

const MyComponent = () => {
  const { success, error, warning, info } = useToast();

  const handleSuccess = () => {
    success('Success!', 'Operation completed successfully');
  };

  const handleError = () => {
    error('Error!', 'Something went wrong', { 
      persistent: true,
      actions: [
        { label: 'Retry', onClick: () => console.log('Retry clicked') },
        { label: 'Report', onClick: () => console.log('Report clicked') }
      ]
    });
  };

  const handlePromise = async () => {
    await toast.promise(
      fetch('/api/data').then(res => res.json()),
      {
        loading: 'Fetching data...',
        success: 'Data loaded successfully!',
        error: 'Failed to load data'
      }
    );
  };

  return (
    <div>
      <button onClick={handleSuccess}>Show Success</button>
      <button onClick={handleError}>Show Error</button>
      <button onClick={handlePromise}>Fetch Data</button>
    </div>
  );
};
```

## **Full Notification System**

```javascript
import { useNotifications } from '../hooks/useNotifications';

const VisitorDashboard = () => {
  const { 
    toast, 
    visitor, 
    system, 
    notifications,
    hasUnreadNotifications,
    unreadCount 
  } = useNotifications();

  const handleVisitorCheckIn = (visitorData) => {
    // Show toast notification
    visitor.checkedIn(visitorData.name, visitorData.hostName);
    
    // Add persistent notification
    notifications.add({
      type: 'visitor_checkin',
      title: 'Visitor Checked In',
      message: `${visitorData.name} has arrived`,
      priority: 'medium',
      data: { visitorId: visitorData.id }
    });
  };

  const handleSecurityAlert = () => {
    visitor.securityAlert(
      'Unknown person detected at entrance', 
      'critical'
    );
  };

  const handleExcelImport = (stats) => {
    system.excelProcessed({
      visitors: stats.processedVisitors,
      invitations: stats.sentInvitations
    });
  };

  return (
    <div>
      <div className="header">
        <h1>Dashboard</h1>
        {hasUnreadNotifications && (
          <div className="notification-badge">
            {unreadCount} unread notifications
          </div>
        )}
      </div>
      
      <button onClick={() => handleVisitorCheckIn({ 
        name: 'John Doe', 
        hostName: 'Jane Smith',
        id: '123'
      })}>
        Simulate Check-in
      </button>
      
      <button onClick={handleSecurityAlert}>
        Security Alert
      </button>
      
      <button onClick={() => handleExcelImport({ 
        processedVisitors: 15, 
        sentInvitations: 8 
      })}>
        Excel Import
      </button>
    </div>
  );
};
```

## **Real-time SignalR Integration**

```javascript
// In SignalR connection handler
import { store } from '../store/store';
import { addNotificationWithDesktop } from '../store/slices/unifiedNotificationSlice';

const handleSignalRNotification = (notificationData) => {
  // Dispatch real-time notification with desktop support
  store.dispatch(addNotificationWithDesktop({
    id: notificationData.id,
    type: notificationData.alertType,
    title: notificationData.title,
    message: notificationData.message,
    priority: notificationData.priority,
    data: notificationData.data,
    actions: notificationData.actions
  }));
};
```

## **Custom Notification Types**

```javascript
import { useNotifications } from '../hooks/useNotifications';

const CustomComponent = () => {
  const { toast } = useNotifications();

  const showCustomNotification = () => {
    toast.show({
      type: 'visitor_overdue',
      title: 'Visitor Overdue',
      message: 'John Doe is 15 minutes overdue',
      duration: 0, // Persistent
      actions: [
        { 
          label: 'Call Visitor', 
          onClick: () => window.open('tel:+1234567890'),
          dismissOnClick: false 
        },
        { 
          label: 'Extend Visit', 
          onClick: () => console.log('Extend visit'),
          dismissOnClick: true 
        }
      ]
    });
  };

  return <button onClick={showCustomNotification}>Show Custom</button>;
};
```

## **Notification Center Integration**

```javascript
// NotificationCenter is automatically included in App.js
// Access via useNotifications hook

const Header = () => {
  const { notifications, hasUnreadNotifications, unreadCount } = useNotifications();
  const [centerOpen, setCenterOpen] = useState(false);

  const handleMarkAllRead = () => {
    notifications.markAllAsRead();
  };

  return (
    <div className="header">
      <button 
        onClick={() => setCenterOpen(true)}
        className="notification-button"
      >
        <BellIcon />
        {hasUnreadNotifications && (
          <span className="badge">{unreadCount}</span>
        )}
      </button>
      
      <NotificationCenter 
        isOpen={centerOpen}
        onClose={() => setCenterOpen(false)}
      />
    </div>
  );
};
```

## **Migration Examples**

### Before (Multiple Systems):
```javascript
// OLD - Multiple different approaches
import { useToast } from '../components/notifications/ToastManager';
import { useDispatch } from 'react-redux';
import { addAlert } from '../store/slices/uiSlice';
import { addNotification } from '../store/slices/notificationSlice';

const OldComponent = () => {
  const dispatch = useDispatch();
  const { success } = useToast();
  
  const handleAction = () => {
    // Three different ways to show notifications!
    success('Toast message');
    dispatch(addAlert({ message: 'Alert message' }));
    dispatch(addNotification({ title: 'Notification' }));
  };
};
```

### After (Unified System):
```javascript
// NEW - Single unified approach
import { useNotifications } from '../hooks/useNotifications';

const NewComponent = () => {
  const { toast } = useNotifications();
  
  const handleAction = () => {
    // One way to show notifications
    toast.success('Success!', 'Operation completed successfully');
  };
};
```

## **Performance Optimizations**

```javascript
// Use useToast for simple toast-only components
const SimpleComponent = () => {
  const { success } = useToast(); // Lighter weight
  
  return <button onClick={() => success('Done!')}>Action</button>;
};

// Use useNotifications for complex notification needs
const ComplexComponent = () => {
  const { toast, notifications, visitor } = useNotifications();
  
  // Full notification system access
};
```

## **Testing**

```javascript
// Test helpers for notification system
import { renderWithProviders } from '../test-utils';
import { useNotifications } from '../hooks/useNotifications';

const TestComponent = () => {
  const { toast } = useNotifications();
  
  return (
    <button 
      onClick={() => toast.success('Test', 'Success message')}
      data-testid="success-button"
    >
      Success
    </button>
  );
};

test('shows success notification', () => {
  const { getByTestId, getByText } = renderWithProviders(<TestComponent />);
  
  fireEvent.click(getByTestId('success-button'));
  
  expect(getByText('Test')).toBeInTheDocument();
  expect(getByText('Success message')).toBeInTheDocument();
});
```