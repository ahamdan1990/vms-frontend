// src/pages/users/ProfilePage/ProfilePage.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';
import { 
  updateUser,
  getUserActivity,
  clearError
} from '../../../store/slices/usersSlice';
import { 
  changePassword,
  getUserSessions,
  terminateSession,
  getCurrentUser,
  clearError as clearAuthError
} from '../../../store/slices/authSlice';
import { showSuccessToast, showErrorToast } from '../../../store/slices/notificationSlice';
import { setPageTitle } from '../../../store/slices/uiSlice';
import { formatName, formatDate, formatDateTime } from '../../../utils/formatters';
import { validatePasswordChange, validateUserData } from '../../../utils/validators';
import userService from '../../../services/userService';
import fileUploadService from '../../../services/fileUploadService';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import Table from '../../../components/common/Table/Table';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import AddressForm from '../../../components/common/AddressForm/AddressForm';
import ProfilePhotoUpload from '../../../components/common/ProfilePhotoUpload/ProfilePhotoUpload';

/**
 * Professional Profile Page for current user self-management
 * Enhanced with Lebanese address and phone number support
 */
const ProfilePage = () => {
  const dispatch = useDispatch();
  const { 
    user, 
    userId, 
    userName, 
    userEmail, 
    userRole,
    loading: authLoading,
    sessions
  } = useAuth();
  
  const { profile: profilePermissions } = usePermissions();
  
  // Redux state
  const {
    updateLoading,
    updateError,
    userActivity
  } = useSelector(state => state.users);

  // Local state for tabs
  const [activeTab, setActiveTab] = useState('profile');
  
  // Enhanced profile editing state with all fields
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',

    // Enhanced phone fields
    phoneNumber: '',
    phoneCountryCode: '961', // Default to Lebanon
    phoneType: 'Mobile',
    
    // User preferences
    timeZone: 'Asia/Beirut',
    language: 'en-US',
    theme: 'light',
    
    // Work information
    department: '',
    jobTitle: '',
    employeeId: '',
    
    // Enhanced address fields
    addressType: 'Home',
    street1: '',
    street2: '',
    city: '',
    state: '', // For backend compatibility
    governorate: '', // Lebanon-specific
    postalCode: '',
    country: 'Lebanon',
    latitude: '',
    longitude: '',
    
    // Profile photo
    profilePhotoUrl: '',
    
    // Status (required by backend)
    status: 'Active',

    //Dates
    createdOn:'',
    passwordChangedDate: ""
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState({});

  // Activity state
  const [activityPage, setActivityPage] = useState(0);

  // Session management state
  const [showTerminateModal, setShowTerminateModal] = useState(false);
  const [sessionToTerminate, setSessionToTerminate] = useState(null);

  // Preferences state
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'en-US',
    timeZone: 'Asia/Beirut'
  });
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  // Initialize page
  useEffect(() => {
    dispatch(setPageTitle('My Profile'));
    loadProfileData();

    return () => {
      dispatch(clearError());
      dispatch(clearAuthError());
    };
  }, [dispatch]);

  // Enhanced profile data loading
  const loadProfileData = async () => {
    try {
      setProfileLoading(true);
      const profile = await userService.getCurrentUserProfile();
      
      console.log('Loaded profile data:', profile); // Debug log
      
      setProfileData({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        email: profile.email || '',
        
        // Enhanced phone fields
        phoneNumber: profile.phoneNumber || '',
        phoneCountryCode: profile.phoneCountryCode || '961',
        phoneType: profile.phoneType || 'Mobile',
        
        // User preferences
        timeZone: profile.timeZone || 'Asia/Beirut',
        language: profile.language || 'en-US',
        theme: profile.theme || 'light',
        
        // Work information
        department: profile.department || '',
        jobTitle: profile.jobTitle || '',
        employeeId: profile.employeeId || '',
        
        // Enhanced address fields
        addressType: profile.addressType || 'Home',
        street1: profile.street1 || '',
        street2: profile.street2 || '',
        city: profile.city || '',
        state: profile.state || profile.governorate || '', // Support both
        governorate: profile.governorate || profile.state || '', // Lebanon-specific
        postalCode: profile.postalCode || '',
        country: profile.country || 'Lebanon',
        latitude: profile.latitude || '',
        longitude: profile.longitude || '',
        
        // Profile photo
        profilePhotoUrl: profile.profilePhotoUrl || '',
        
        // Status (required by backend)
        status: profile.isActive ? 'Active' : 'Inactive',

        //Dates
        createdOn: profile.createdOn || '',
        passwordChangedDate: profile.passwordChangedDate || ""
      });
      
      setPreferences({
        theme: profile.theme || 'light',
        language: profile.language || 'en-US',
        timeZone: profile.timeZone || 'Asia/Beirut'
      });
    } catch (error) {
      console.error('Failed to load profile:', error);
      dispatch(showErrorToast('Error', 'Failed to load profile data'));
    } finally {
      setProfileLoading(false);
    }
  };

  // Load data based on active tab
  useEffect(() => {
    if (activeTab === 'activity') {
      dispatch(getUserActivity({ 
        id: userId, 
        pageIndex: activityPage, 
        pageSize: 20 
      }));
    } else if (activeTab === 'security') {
      dispatch(getUserSessions());
    }
  }, [activeTab, userId, activityPage, dispatch]);

  // Handle profile form changes
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle password form changes
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    
    // Clear field error when user starts typing
    if (passwordErrors[name]) {
      setPasswordErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Handle preferences changes
  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  // Enhanced save profile with all fields
  const handleSaveProfile = async () => {
    try {
      setProfileLoading(true);
      
      // Prepare submission data with status field and governorate mapping
      const submissionData = {
        ...profileData,
        // Map governorate to state for backend compatibility
        state: profileData.governorate || profileData.state,
        // Ensure status is included
        status: profileData.status || 'Active',
        // Convert status to isActive boolean for backend
        isActive: profileData.status === 'Active'
      };
      
      // Validate profile data
      const validation = validateUserData(submissionData, true);
      if (!validation.isValid) {
        setProfileErrors(validation.errors);
        dispatch(showErrorToast('Validation Error', 'Please fix the errors in the form'));
        return;
      }

      console.log('Submitting profile data:', submissionData); // Debug log

      await userService.updateCurrentUserProfile(submissionData);
      dispatch(showSuccessToast('Success', 'Profile updated successfully'));
      setIsEditingProfile(false);
      setProfileErrors({});
      
      // Reload profile data to get updated values
      await loadProfileData();
      
      // Refresh auth state to update header
      dispatch(getCurrentUser());
    } catch (error) {
      console.error('Profile update failed:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update profile';
      dispatch(showErrorToast('Error', errorMessage));
      
      // If there are specific field errors, show them
      if (error.response?.data?.errors) {
        setProfileErrors(error.response.data.errors);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  // Save preferences
  const handleSavePreferences = async () => {
    try {
      setPreferencesLoading(true);
      await userService.updateCurrentUserPreferences(preferences);
      dispatch(showSuccessToast('Success', 'Preferences updated successfully'));
    } catch (error) {
      console.error('Preferences update failed:', error);
      dispatch(showErrorToast('Error', 'Failed to update preferences'));
    } finally {
      setPreferencesLoading(false);
    }
  };

  // Profile photo upload handler
  const handlePhotoUpload = async (file) => {
    try {
      // Validate file
      const validation = fileUploadService.validateImageFile(file);
      if (!validation.isValid) {
        throw new Error(validation.error);
      }

      // Upload photo
      const photoUrl = await fileUploadService.uploadProfilePhoto(file);
      console.log('Photo uploaded, returned URL:', photoUrl); // Debug log
      dispatch(showSuccessToast('Success', 'Profile photo uploaded successfully'));
      
      // Reload profile data to get updated photo URL
      await loadProfileData();
      
      // Refresh auth state so header gets updated
      await dispatch(getCurrentUser());
      
      return photoUrl;
    } catch (error) {
      console.error('Photo upload failed:', error);
      dispatch(showErrorToast('Error', error.message || 'Failed to upload profile photo'));
      throw error;
    }
  };

  // Profile photo remove handler
  const handlePhotoRemove = async () => {
    try {
      await fileUploadService.removeProfilePhoto();
      dispatch(showSuccessToast('Success', 'Profile photo removed successfully'));
      
      // Reload profile data to update UI
      await loadProfileData();
      
      // Refresh auth state so header gets updated
      await dispatch(getCurrentUser());
    } catch (error) {
      console.error('Photo removal failed:', error);
      dispatch(showErrorToast('Error', 'Failed to remove profile photo'));
      throw error;
    }
  };

  // Enhanced address form changes handler
  const handleAddressChange = (fieldName, value) => {
    setProfileData(prev => {
      const newData = { ...prev, [fieldName]: value };
      
      // If governorate changes, also update state for backend compatibility
      if (fieldName === 'governorate') {
        newData.state = value;
      }
      
      return newData;
    });
    
    // Clear field error when user starts typing
    if (profileErrors[fieldName]) {
      setProfileErrors(prev => ({ ...prev, [fieldName]: null }));
    }
  };

  // Change password
  const handleChangePassword = async () => {
    try {
      // Validate password data
      const validation = validatePasswordChange(passwordData);
      if (!validation.isValid) {
        setPasswordErrors(validation.errors);
        return;
      }

      await dispatch(changePassword(passwordData)).unwrap();
      dispatch(showSuccessToast('Success', 'Password changed successfully'));
      setIsChangingPassword(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      setPasswordErrors({});
    } catch (error) {
      dispatch(showErrorToast('Error', 'Failed to change password'));
    }
  };

  // Terminate session
  const handleTerminateSession = async () => {
    try {
      await dispatch(terminateSession(sessionToTerminate.sessionId)).unwrap();
      dispatch(showSuccessToast('Success', 'Session terminated successfully'));
      setShowTerminateModal(false);
      setSessionToTerminate(null);
    } catch (error) {
      dispatch(showErrorToast('Error', 'Failed to terminate session'));
    }
  };

  // Activity table columns
  const activityColumns = [
    {
      key: 'action',
      header: 'Event',
      sortable: true,
      render: (action) => (
        <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {action}
        </span>
      )
    },
    {
      key: 'description',
      header: 'Description',
      sortable: false
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      sortable: false,
      render: (ip) => ip || '-'
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      sortable: true,
      render: (timestamp) => formatDateTime(timestamp)
    }
  ];

  // Sessions table columns
  const sessionColumns = [
    {
      key: 'deviceInfo',
      header: 'Device',
      sortable: false,
      render: (deviceInfo, session) => (
        <div>
          <div className="font-medium text-gray-900">{deviceInfo || 'Unknown Device'}</div>
          <div className="text-sm text-gray-500">{session.browser || 'Unknown Browser'}</div>
        </div>
      )
    },
    {
      key: 'ipAddress',
      header: 'IP Address',
      sortable: false,
      render: (ip) => ip || '-'
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      sortable: true,
      render: (lastActivity) => formatDateTime(lastActivity)
    },
    {
      key: 'isCurrent',
      header: 'Status',
      sortable: false,
      render: (isCurrent) => (
        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
          isCurrent 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {isCurrent ? 'Current' : 'Active'}
        </span>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, session) => (
        !session.isCurrent && (
          <Button
            variant="danger"
            size="sm"
            onClick={() => {
              setSessionToTerminate(session);
              setShowTerminateModal(true);
            }}
          >
            Terminate
          </Button>
        )
      )
    }
  ];

  // Tab configuration
  const tabs = [
    { 
      id: 'profile', 
      label: 'Profile', 
      icon: '👤',
      description: 'Manage your personal information'
    },
    { 
      id: 'security', 
      label: 'Security', 
      icon: '🔐',
      description: 'Password and session management'
    },
    { 
      id: 'activity', 
      label: 'Activity', 
      icon: '📊',
      description: 'View your account activity'
    },
    { 
      id: 'preferences', 
      label: 'Preferences', 
      icon: '⚙️',
      description: 'Customize your experience'
    }
  ];

  const TabButton = ({ tab, isActive, onClick }) => (
    <button
      onClick={() => onClick(tab.id)}
      className={`
        flex items-center space-x-3 w-full px-4 py-3 text-left rounded-lg transition-all duration-200
        ${isActive 
          ? 'bg-blue-50 text-blue-700 border-2 border-blue-200 shadow-sm' 
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50 border-2 border-transparent'
        }
      `}
    >
      <span className="text-xl">{tab.icon}</span>
      <div>
        <div className="font-medium">{tab.label}</div>
        <div className="text-xs text-gray-500">{tab.description}</div>
      </div>
    </button>
  );

  const ProfileField = React.memo(({ label, value, isEditing, name, type = 'text', onChange, error, ...props }) => {
    // Ensure error is always a string or null
    const errorMessage = error && typeof error === 'object' ? error.message || JSON.stringify(error) : error;
    
    return (
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
        {isEditing ? (
          <Input
            type={type}
            name={name}
            value={value || ''}
            onChange={onChange}
            error={errorMessage}
            {...props}
          />
        ) : (
          <p className="text-gray-900 py-2.5 px-4 bg-gray-50 rounded-lg">
            {value || 'Not provided'}
          </p>
        )}
      </div>
    );
  });

  if (authLoading || profileLoading || !user) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <div className="flex items-center space-x-4">
          {/* Profile Avatar */}
          <div className="relative">
            {profileData.profilePhotoUrl ? (
              <>
                <img
                  src={profileData.profilePhotoUrl}
                  alt="Profile"
                  className="w-16 h-16 object-cover rounded-full border-2 border-gray-200"
                  onError={(e) => {
                    console.error('Failed to load profile photo:', profileData.profilePhotoUrl);
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                  onLoad={(e) => {
                    console.log('Profile photo loaded successfully:', profileData.profilePhotoUrl);
                    e.target.nextSibling.style.display = 'none';
                  }}
                />
                <div 
                  className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold"
                  style={{ display: 'none' }}
                >
                  {user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || ''}
                </div>
              </>
            ) : (
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
                {user.firstName?.charAt(0) || '?'}{user.lastName?.charAt(0) || ''}
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {formatName(user.firstName, user.lastName)}
            </h1>
            <div className="flex items-center space-x-4 mt-1">
              <p className="text-gray-600">{userEmail}</p>
              <span className="px-3 py-1 text-sm font-medium text-purple-700 bg-purple-100 rounded-full border border-purple-200">
                {userRole}
              </span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar Navigation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-1"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <TabButton
                  key={tab.id}
                  tab={tab}
                  isActive={activeTab === tab.id}
                  onClick={setActiveTab}
                />
              ))}
            </nav>
          </div>
        </motion.div>

        {/* Main Content */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-3"
        >
          <div className="bg-white rounded-xl shadow-lg border border-gray-100">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="p-6"
              >
                {/* Profile Tab */}
                {activeTab === 'profile' && (
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
                        <p className="text-gray-600 text-sm mt-1">Manage your account details</p>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {isEditingProfile ? (
                          <>
                            <Button
                              variant="secondary"
                              onClick={() => {
                                setIsEditingProfile(false);
                                setProfileErrors({});
                                // Reset form data
                                loadProfileData();
                              }}
                              disabled={profileLoading}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="primary"
                              onClick={handleSaveProfile}
                              loading={profileLoading}
                            >
                              Save Changes
                            </Button>
                          </>
                        ) : (
                          <Button
                            variant="primary"
                            onClick={() => setIsEditingProfile(true)}
                            loading={profileLoading}
                            icon={
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            }
                          >
                            Edit Profile
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Profile Photo Section */}
                    <div className="mb-8 p-6 bg-gray-50 rounded-lg">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Profile Photo</h4>
                      <div className="flex justify-center">
                        <ProfilePhotoUpload
                          currentPhotoUrl={profileData.profilePhotoUrl}
                          userInitials={`${user?.firstName?.charAt(0) || ''}${user?.lastName?.charAt(0) || ''}`}
                          onPhotoUpload={handlePhotoUpload}
                          onPhotoRemove={handlePhotoRemove}
                          disabled={!isEditingProfile}
                          size="large"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <ProfileField
                        label="First Name"
                        value={profileData.firstName}
                        isEditing={isEditingProfile}
                        name="firstName"
                        onChange={handleProfileChange}
                        error={profileErrors.firstName}
                        required
                      />
                      
                      <ProfileField
                        label="Last Name"
                        value={profileData.lastName}
                        isEditing={isEditingProfile}
                        name="lastName"
                        onChange={handleProfileChange}
                        error={profileErrors.lastName}
                        required
                      />
                      
                      <ProfileField
                        label="Email Address"
                        value={profileData.email}
                        isEditing={isEditingProfile}
                        name="email"
                        type="email"
                        onChange={handleProfileChange}
                        error={profileErrors.email}
                        required
                      />
                      
                      <ProfileField
                        label="Phone Number"
                        value={profileData.phoneNumber}
                        isEditing={isEditingProfile}
                        name="phoneNumber"
                        type="tel"
                        onChange={handleProfileChange}
                        error={profileErrors.phoneNumber}
                        placeholder="03 962 114"
                      />
                      
                      <ProfileField
                        label="Department"
                        value={profileData.department}
                        isEditing={isEditingProfile}
                        name="department"
                        onChange={handleProfileChange}
                        error={profileErrors.department}
                      />
                      
                      <ProfileField
                        label="Job Title"
                        value={profileData.jobTitle}
                        isEditing={isEditingProfile}
                        name="jobTitle"
                        onChange={handleProfileChange}
                        error={profileErrors.jobTitle}
                      />
                    </div>

                    {/* Enhanced Address Section */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Address Information</h4>
                      
                      {isEditingProfile ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <ProfileField
                            label="Street Address"
                            value={profileData.street1}
                            isEditing={isEditingProfile}
                            name="street1"
                            onChange={handleProfileChange}
                            error={profileErrors.street1}
                            placeholder="Building name, Street name"
                          />
                          
                          <ProfileField
                            label="Address Line 2 (Optional)"
                            value={profileData.street2}
                            isEditing={isEditingProfile}
                            name="street2"
                            onChange={handleProfileChange}
                            error={profileErrors.street2}
                            placeholder="Floor, Apartment, Unit"
                          />
                          
                          <ProfileField
                            label="City"
                            value={profileData.city}
                            isEditing={isEditingProfile}
                            name="city"
                            onChange={handleProfileChange}
                            error={profileErrors.city}
                            placeholder="e.g., Beirut, Tripoli, Sidon"
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Governorate</label>
                            <select
                              name="governorate"
                              value={profileData.governorate}
                              onChange={handleProfileChange}
                              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Select Governorate</option>
                              <option value="Beirut">Beirut</option>
                              <option value="Mount Lebanon">Mount Lebanon</option>
                              <option value="North Lebanon">North Lebanon</option>
                              <option value="South Lebanon">South Lebanon</option>
                              <option value="Beqaa">Beqaa</option>
                              <option value="Akkar">Akkar</option>
                              <option value="Baalbek-Hermel">Baalbek-Hermel</option>
                              <option value="Nabatieh">Nabatieh</option>
                            </select>
                            {profileErrors.governorate && (
                              <p className="text-red-600 text-sm mt-1">{profileErrors.governorate}</p>
                            )}
                          </div>
                          
                          <ProfileField
                            label="Postal Code (Optional)"
                            value={profileData.postalCode}
                            isEditing={isEditingProfile}
                            name="postalCode"
                            onChange={handleProfileChange}
                            error={profileErrors.postalCode}
                            placeholder="e.g., 1107-2180"
                          />
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                            <select
                              name="country"
                              value={profileData.country}
                              onChange={handleProfileChange}
                              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Lebanon">🇱🇧 Lebanon</option>
                              <option value="Syria">🇸🇾 Syria</option>
                              <option value="Jordan">🇯🇴 Jordan</option>
                              <option value="United States">🇺🇸 United States</option>
                              <option value="Canada">🇨🇦 Canada</option>
                              <option value="Other">🌍 Other</option>
                            </select>
                          </div>

                            <ProfileField
                              label="Latitude (Optional)"
                              value={profileData.latitude}
                              isEditing={isEditingProfile}
                              name="latitude"
                              onChange={handleProfileChange}
                              error={profileErrors.latitude}
                              placeholder="e.g., 33.8885"
                            />

                            <ProfileField
                              label="Longitude (Optional)"
                              value={profileData.longitude}
                              isEditing={isEditingProfile}
                              name="longitude"
                              onChange={handleProfileChange}
                              error={profileErrors.longitude}
                              placeholder="e.g., 35.47490"
                            />
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <ProfileField
                            label="Street Address"
                            value={profileData.street1}
                            isEditing={false}
                          />
                          <ProfileField
                            label="City"
                            value={profileData.city}
                            isEditing={false}
                          />
                          <ProfileField
                            label="Governorate"
                            value={profileData.governorate}
                            isEditing={false}
                          />
                          <ProfileField
                            label="Country"
                            value={profileData.country}
                            isEditing={false}
                          />
                          <ProfileField
                            label="Latitude"
                            value={profileData.latitude}
                            isEditing={false}
                          />
                          <ProfileField
                            label="Longitude"
                            value={profileData.longitude}
                            isEditing={false}
                          />
                          <ProfileField
                            label="Postal Code"
                            value={profileData.postalCode}
                            isEditing={false}
                          />
                          <ProfileField
                            label="Address Type"
                            value={profileData.addressType}
                            isEditing={false}
                          />
                        </div>
                      )}
                    </div>

                    {/* Account Information (Read Only) */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <h4 className="text-md font-medium text-gray-900 mb-4">Account Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                          <p className="text-gray-900 py-2.5 px-4 bg-gray-50 rounded-lg">{userRole}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                          <p className="text-gray-900 py-2.5 px-4 bg-gray-50 rounded-lg">{profileData.employeeId || 'Not assigned'}</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Member Since</label>
                          <p className="text-gray-900 py-2.5 px-4 bg-gray-50 rounded-lg">
                            {console.log(profileData)}
                            {formatDate(profileData.createdOn || profileData.createdDate || profileData.registrationDate)}
                          </p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Last Login</label>
                          <p className="text-gray-900 py-2.5 px-4 bg-gray-50 rounded-lg">
                            {profileData.lastLoginDate ? formatDateTime(profileData.lastLoginDate) : 'Never'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h3>
                    
                    <div className="space-y-8">
                      {/* Password Change Section */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-md font-medium text-gray-900">Password</h4>
                            <p className="text-sm text-gray-600 mt-1">Keep your account secure with a strong password</p>
                          </div>
                          
                          <Button
                            variant={isChangingPassword ? "secondary" : "primary"}
                            onClick={() => {
                              setIsChangingPassword(!isChangingPassword);
                              if (isChangingPassword) {
                                setPasswordData({
                                  currentPassword: '',
                                  newPassword: '',
                                  confirmPassword: ''
                                });
                                setPasswordErrors({});
                              }
                            }}
                          >
                            {isChangingPassword ? 'Cancel' : 'Change Password'}
                          </Button>
                        </div>

                        {isChangingPassword && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-4"
                          >
                            <Input
                              type="password"
                              label="Current Password"
                              name="currentPassword"
                              value={passwordData.currentPassword}
                              onChange={handlePasswordChange}
                              error={passwordErrors.currentPassword}
                              required
                            />
                            
                            <Input
                              type="password"
                              label="New Password"
                              name="newPassword"
                              value={passwordData.newPassword}
                              onChange={handlePasswordChange}
                              error={passwordErrors.newPassword}
                              required
                              showPasswordToggle
                            />
                            
                            <Input
                              type="password"
                              label="Confirm New Password"
                              name="confirmPassword"
                              value={passwordData.confirmPassword}
                              onChange={handlePasswordChange}
                              error={passwordErrors.confirmPassword}
                              required
                            />
                            
                            <div className="flex justify-end">
                              <Button
                                variant="primary"
                                onClick={handleChangePassword}
                                disabled={!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword}
                              >
                                Update Password
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </div>

                      {/* Active Sessions */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Active Sessions</h4>
                        <p className="text-sm text-gray-600 mb-4">Manage your active login sessions across devices</p>
                        
                        <Table
                          columns={sessionColumns}
                          data={sessions || []}
                          emptyMessage="No active sessions found"
                          size="sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Activity Tab */}
                {activeTab === 'activity' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Account Activity</h3>
                    <p className="text-gray-600 text-sm mb-6">Track your recent account activity and login history</p>
                    
                    <Table
                      columns={activityColumns}
                      data={userActivity.data || []}
                      loading={userActivity.loading}
                      error={userActivity.error}
                      emptyMessage="No activity found"
                      pagination={{
                        currentPage: activityPage + 1,
                        totalPages: userActivity.pagination?.totalPages || 0,
                        onPageChange: (page) => setActivityPage(page - 1)
                      }}
                    />
                  </div>
                )}

                {/* Preferences Tab */}
                {activeTab === 'preferences' && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h3>
                    <p className="text-gray-600 text-sm mb-6">Customize your experience and notification settings</p>
                    
                    <div className="space-y-8">
                      {/* Appearance */}
                      <div className="bg-gray-50 rounded-lg p-6">
                        <h4 className="text-md font-medium text-gray-900 mb-4">Appearance</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
                            <div className="flex space-x-4">
                              {['light', 'dark', 'auto'].map(theme => (
                                <label key={theme} className="flex items-center space-x-2 cursor-pointer">
                                  <input
                                    type="radio"
                                    name="theme"
                                    value={theme}
                                    checked={preferences.theme === theme}
                                    onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                  />
                                  <span className="text-sm text-gray-700 capitalize">{theme}</span>
                                </label>
                              ))}
                            </div>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Language</label>
                            <select
                              value={preferences.language}
                              onChange={(e) => handlePreferenceChange('language', e.target.value)}
                              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="en-US">🇺🇸 English (US)</option>
                              <option value="ar-LB">🇱🇧 Arabic (Lebanon)</option>
                              <option value="ar-SA">🇸🇦 Arabic (Standard)</option>
                              <option value="en-GB">🇬🇧 English (UK)</option>
                              <option value="fr-FR">🇫🇷 French</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Time Zone</label>
                            <select
                              value={preferences.timeZone}
                              onChange={(e) => handlePreferenceChange('timeZone', e.target.value)}
                              className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="Asia/Beirut">🇱🇧 Beirut Time (EET)</option>
                              <option value="Asia/Damascus">🇸🇾 Damascus</option>
                              <option value="Asia/Amman">🇯🇴 Amman</option>
                              <option value="UTC">UTC</option>
                              <option value="America/New_York">Eastern Time</option>
                              <option value="America/Los_Angeles">Pacific Time</option>
                              <option value="Europe/London">London</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      {/* Save Preferences */}
                      <div className="flex justify-end mt-6">
                        <Button 
                          variant="primary" 
                          onClick={handleSavePreferences}
                          loading={preferencesLoading}
                        >
                          Save Preferences
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Terminate Session Modal */}
      <ConfirmModal
        isOpen={showTerminateModal}
        onClose={() => setShowTerminateModal(false)}
        onConfirm={handleTerminateSession}
        title="Terminate Session"
        message={`Are you sure you want to terminate this session? The user will be logged out from that device.`}
        confirmText="Terminate"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  );
};

export default ProfilePage;