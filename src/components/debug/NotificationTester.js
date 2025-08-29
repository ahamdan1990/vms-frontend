// Test component to verify notification styling - Add this to any page for testing
import React from 'react';
import { useDispatch } from 'react-redux';
import { 
  showSuccessToast, 
  showErrorToast, 
  showWarningToast, 
  showInfoToast 
} from '../../store/slices/notificationSlice';

const NotificationTester = () => {
  const dispatch = useDispatch();

  const testNotifications = () => {
    // Test different notification types with delay
    dispatch(showSuccessToast(
      'Success!', 
      'Your visitor check-in was completed successfully.'
    ));

    setTimeout(() => {
      dispatch(showWarningToast(
        'Warning', 
        'Visitor John Doe is 15 minutes overdue for checkout.'
      ));
    }, 1000);

    setTimeout(() => {
      dispatch(showInfoToast(
        'Information', 
        'New security policy update available in the admin panel.'
      ));
    }, 2000);

    setTimeout(() => {
      dispatch(showErrorToast(
        'Error', 
        'Failed to connect to the visitor management server.'
      ));
    }, 3000);
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Notification Style Test
      </h3>
      <button
        onClick={testNotifications}
        className="btn btn-primary"
      >
        Test All Notification Types
      </button>
      <p className="text-sm text-gray-600 mt-2">
        Click to test success, warning, info, and error notifications
      </p>
    </div>
  );
};

export default NotificationTester;