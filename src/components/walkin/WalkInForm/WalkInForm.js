// src/components/walkin/WalkInForm/WalkInForm.js
import React, { useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

// Services
import visitorService from '../../../services/visitorService';
import invitationService from '../../../services/invitationService';
import userService from '../../../services/userService';

// Redux
import { getLocations } from '../../../store/slices/locationsSlice';
import { getVisitPurposes } from '../../../store/slices/visitPurposesSlice';
import { selectLocationsList } from '../../../store/selectors/locationSelectors';
import { selectVisitPurposesList } from '../../../store/selectors/visitPurposeSelectors';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import Card from '../../common/Card/Card';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import AutocompleteInput from '../../common/AutocompleteInput/AutocompleteInput';
import DocumentScanner from '../../scanner/DocumentScanner';

// Icons
import {
  MagnifyingGlassIcon,
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  MapPinIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  XMarkIcon,
  DocumentIcon,
  TrashIcon,
  PhotoIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Walk-In Form Component
 * 3-step registration flow for walk-in visitors:
 * 1. Lookup - Search for existing visitor by phone/email
 * 2. Visitor Details - Capture/confirm visitor information
 * 3. Visit Information - Assign host, purpose, location, duration
 */
const WalkInForm = ({
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  initialPhoto = null
}) => {
  const dispatch = useDispatch();

  // Redux selectors
  const locations = useSelector(selectLocationsList);
  const visitPurposes = useSelector(selectVisitPurposesList);

  // Load locations and visit purposes
  useEffect(() => {
    dispatch(getLocations());
    dispatch(getVisitPurposes());
  }, [dispatch]);

  // ===== FORM STATE =====
  const [currentStep, setCurrentStep] = useState(1); // 1, 2, 3
  const [validationErrors, setValidationErrors] = useState({});

  // Step 1: Lookup state
  const [lookupValue, setLookupValue] = useState('');
  const [lookupType, setLookupType] = useState('phone'); // 'phone' | 'email'
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [existingVisitor, setExistingVisitor] = useState(null);
  const [pendingInvitations, setPendingInvitations] = useState([]);

  // Step 2: Visitor data state
  const [visitorData, setVisitorData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    phoneCountryCode: '961',
    email: '',
    company: '',
    jobTitle: ''
  });

  // Step 3: Visit data state
  const [visitData, setVisitData] = useState({
    hostId: null,
    hostName: '',
    visitPurposeId: null,
    visitPurposeName: '',
    locationId: null,
    locationName: '',
    duration: 60, // minutes
    notes: ''
  });

  // Host search state
  const [hostSearchTerm, setHostSearchTerm] = useState('');
  const [hostSearchResults, setHostSearchResults] = useState([]);
  const [searchingHosts, setSearchingHosts] = useState(false);

  // Document scanning state
  const [scannedDocuments, setScannedDocuments] = useState([]);
  const [showDocumentScanner, setShowDocumentScanner] = useState(false);

  // ===== STEP 1: VISITOR LOOKUP =====

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (value, type) => {
      if (!value || value.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearching(true);
      try {
        // For phone searches, try with and without formatting
        let searchTerm = value.trim();
        console.log('🔍 Searching for visitors with term:', searchTerm, 'type:', type);

        const response = await visitorService.getVisitors({
          searchTerm,
          pageSize: 10,
          sortBy: 'CreatedOn',
          sortDirection: 'desc'
        });

        console.log('✅ Search response:', response);
        console.log('🔍 Search URL used:', `/api/visitors?searchTerm=${searchTerm}`);

        // Handle both response.items and response.data.items structures
        const visitors = response.items || response.data?.items || [];
        console.log('📋 Found visitors:', visitors.length, visitors);

        if (visitors.length === 0 && type === 'phone') {
          console.log('⚠️ No results for phone search. Try checking backend search logic.');
          console.log('💡 Search term:', searchTerm);
          console.log('💡 Expected to match phone numbers like: +96103988760, 03988760, etc.');
        }

        setSearchResults(visitors);
      } catch (error) {
        console.error('❌ Visitor search failed:', error);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300),
    []
  );

  // Handle lookup value change
  const handleLookupChange = (value) => {
    setLookupValue(value);
    setExistingVisitor(null);
    setPendingInvitations([]);
    debouncedSearch(value, lookupType);
  };

  // Handle selecting an existing visitor
  const handleSelectVisitor = async (visitor) => {
    setExistingVisitor(visitor);
    setSearchResults([]);
    setLookupValue('');

    // Parse fullName if firstName/lastName not available
    let firstName = visitor.firstName || '';
    let lastName = visitor.lastName || '';

    if (!firstName && !lastName && visitor.fullName) {
      const nameParts = visitor.fullName.trim().split(' ');
      firstName = nameParts[0] || '';
      lastName = nameParts.slice(1).join(' ') || '';
    }

    // Auto-fill visitor data
    setVisitorData({
      firstName,
      lastName,
      phoneNumber: visitor.phoneNumber || '',
      phoneCountryCode: visitor.phoneCountryCode || '961',
      email: visitor.email?.value || visitor.email || '',
      company: visitor.company || '',
      jobTitle: visitor.jobTitle || ''
    });

    // Check for pending invitations
    try {
      const invitationsResponse = await invitationService.getInvitations({
        visitorId: visitor.id,
        status: 'Pending',
        pageSize: 10
      });

      const pending = invitationsResponse.data?.items || [];
      if (pending.length > 0) {
        setPendingInvitations(pending);
      }
    } catch (error) {
      console.error('Failed to check pending invitations:', error);
    }
  };

  // Handle creating new visitor
  const handleCreateNewVisitor = () => {
    setExistingVisitor(null);
    setSearchResults([]);
    setPendingInvitations([]);
    setVisitorData({
      firstName: '',
      lastName: '',
      phoneNumber: lookupType === 'phone' ? lookupValue : '',
      phoneCountryCode: '961',
      email: lookupType === 'email' ? lookupValue : '',
      company: '',
      jobTitle: ''
    });
    setCurrentStep(2);
  };

  // ===== STEP 2: VISITOR DETAILS =====

  const handleVisitorDataChange = (field, value) => {
    setVisitorData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateVisitorData = () => {
    const errors = {};

    if (!visitorData.firstName?.trim()) {
      errors.firstName = 'First name is required';
    }
    if (!visitorData.lastName?.trim()) {
      errors.lastName = 'Last name is required';
    }
    if (!visitorData.phoneNumber?.trim()) {
      errors.phoneNumber = 'Phone number is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== STEP 3: VISIT INFORMATION =====

  // Debounced host search
  const debouncedHostSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setHostSearchResults([]);
        return;
      }

      setSearchingHosts(true);
      try {
        console.log('🔍 Searching for hosts with term:', searchTerm);
        const response = await userService.getUsers({
          searchTerm,
          role: 'Host',
          pageSize: 10,
          sortBy: 'CreatedOn',
          sortDirection: 'desc'
        });

        console.log('✅ Host search response:', response);
        // Handle both response.items and response.data.items structures
        const hosts = response.items || response.data?.items || [];
        console.log('📋 Found hosts:', hosts.length, hosts);
        setHostSearchResults(hosts);
      } catch (error) {
        console.error('❌ Host search failed:', error);
        setHostSearchResults([]);
      } finally {
        setSearchingHosts(false);
      }
    }, 300),
    []
  );

  const handleHostSearch = (searchTerm) => {
    setHostSearchTerm(searchTerm);
    debouncedHostSearch(searchTerm);
  };

  const handleSelectHost = (host) => {
    setVisitData(prev => ({
      ...prev,
      hostId: host.id,
      hostName: host.fullName || `${host.firstName} ${host.lastName}`
    }));
    setHostSearchTerm('');
    setHostSearchResults([]);

    // Clear validation error
    if (validationErrors.hostId) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.hostId;
        return newErrors;
      });
    }
  };

  const handleVisitDataChange = (field, value) => {
    setVisitData(prev => ({ ...prev, [field]: value }));

    // Update display name for location
    if (field === 'locationId' && value) {
      const location = locations.find(l => l.id === parseInt(value));
      setVisitData(prev => ({ ...prev, locationName: location?.name || '' }));
    }

    // Update display name for purpose
    if (field === 'visitPurposeId' && value) {
      const purpose = visitPurposes.find(p => p.id === parseInt(value));
      setVisitData(prev => ({ ...prev, visitPurposeName: purpose?.name || '' }));
    }

    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateVisitData = () => {
    const errors = {};

    if (!visitData.hostId) {
      errors.hostId = 'Host is required';
    }
    if (!visitData.locationId) {
      errors.locationId = 'Location is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ===== DOCUMENT SCANNING =====

  const handleDocumentScanned = (documentData) => {
    const documents = Array.isArray(documentData) ? documentData : [documentData];
    setScannedDocuments(prev => [...prev, ...documents]);
    setShowDocumentScanner(false);
  };

  const handleRemoveDocument = (index) => {
    setScannedDocuments(prev => prev.filter((_, i) => i !== index));
  };

  // ===== NAVIGATION =====

  const handleNext = () => {
    if (currentStep === 1) {
      // From lookup to visitor details
      if (existingVisitor) {
        setCurrentStep(2);
      } else {
        handleCreateNewVisitor();
      }
    } else if (currentStep === 2) {
      // From visitor details to visit info
      if (validateVisitorData()) {
        setCurrentStep(3);
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateVisitData()) {
      return;
    }

    // Prepare submission data
    const submissionData = {
      existingVisitorId: existingVisitor?.id || null,
      visitorData: {
        ...visitorData,
        photo: initialPhoto
      },
      visitData: {
        ...visitData,
        // Default purpose to "Walk-in" if not selected
        visitPurposeId: visitData.visitPurposeId ||
          visitPurposes.find(p => p.name.toLowerCase().includes('walk'))?.id ||
          null
      },
      scannedDocuments
    };

    await onSubmit(submissionData);
  };

  // ===== RENDER HELPERS =====

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      {[1, 2, 3].map((step) => (
        <React.Fragment key={step}>
          <div className="flex items-center">
            <div className={`
              flex items-center justify-center w-10 h-10 rounded-full border-2 font-medium transition-all
              ${currentStep >= step
                ? 'bg-blue-600 border-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-400 dark:text-gray-500'
              }
            `}>
              {currentStep > step ? (
                <CheckCircleIconSolid className="w-6 h-6" />
              ) : (
                <span>{step}</span>
              )}
            </div>
            <div className="ml-2 hidden sm:block">
              <p className={`text-sm font-medium ${
                currentStep >= step
                  ? 'text-gray-900 dark:text-white'
                  : 'text-gray-400 dark:text-gray-500'
              }`}>
                {step === 1 && 'Lookup'}
                {step === 2 && 'Visitor Details'}
                {step === 3 && 'Visit Info'}
              </p>
            </div>
          </div>
          {step < 3 && (
            <div className={`w-12 sm:w-16 h-0.5 mx-2 ${
              currentStep > step ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
            }`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  const renderStep1 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <MagnifyingGlassIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Find Visitor
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Search by phone or email to check if visitor exists
        </p>
      </div>

      {/* Lookup Type Toggle */}
      <div className="flex justify-center space-x-2 mb-4">
        <Button
          variant={lookupType === 'phone' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            setLookupType('phone');
            setLookupValue('');
            setSearchResults([]);
          }}
          icon={<PhoneIcon className="w-4 h-4" />}
        >
          Phone
        </Button>
        <Button
          variant={lookupType === 'email' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => {
            setLookupType('email');
            setLookupValue('');
            setSearchResults([]);
          }}
          icon={<EnvelopeIcon className="w-4 h-4" />}
        >
          Email
        </Button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Input
          type={lookupType === 'phone' ? 'tel' : 'email'}
          placeholder={lookupType === 'phone' ? '+961 70 123 456' : 'visitor@example.com'}
          value={lookupValue}
          onChange={(e) => handleLookupChange(e.target.value)}
          icon={lookupType === 'phone' ? PhoneIcon : EnvelopeIcon}
          autoFocus
        />
        {searching && (
          <div className="absolute right-3 top-3">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card className="p-4">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Found {searchResults.length} visitor{searchResults.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-2">
            {searchResults.map((visitor) => (
              <button
                key={visitor.id}
                onClick={() => handleSelectVisitor(visitor)}
                className="w-full text-left p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <UserIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {visitor.firstName} {visitor.lastName}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {visitor.phoneNumber || visitor.email?.value || visitor.email}
                    </p>
                    {visitor.company && (
                      <p className="text-xs text-gray-500 dark:text-gray-500">
                        {visitor.company}
                      </p>
                    )}
                  </div>
                  <ArrowRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Existing Visitor Selected */}
      {existingVisitor && (
        <Card className="p-4 border-2 border-blue-500 dark:border-blue-400">
          <div className="flex items-start space-x-3">
            <CheckCircleIconSolid className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                Visitor Found
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {existingVisitor.firstName} {existingVisitor.lastName}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {existingVisitor.phoneNumber || existingVisitor.email?.value}
              </p>
              {existingVisitor.company && (
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {existingVisitor.company}
                </p>
              )}
            </div>
          </div>

          {/* Pending Invitations Warning */}
          {pendingInvitations.length > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-md">
              <div className="flex items-start space-x-2">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Pending Invitation Detected
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    This visitor has {pendingInvitations.length} pending invitation{pendingInvitations.length > 1 ? 's' : ''} awaiting approval.
                  </p>
                  {pendingInvitations[0] && (
                    <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                      Scheduled: {new Date(pendingInvitations[0].scheduledStartTime).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="mt-4 flex space-x-2">
            <Button
              onClick={handleNext}
              className="flex-1"
              icon={<ArrowRightIcon className="w-4 h-4" />}
            >
              Continue with this visitor
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setExistingVisitor(null);
                setPendingInvitations([]);
                setLookupValue('');
              }}
              icon={<XMarkIcon className="w-4 h-4" />}
            >
              Clear
            </Button>
          </div>
        </Card>
      )}

      {/* Not Found - Create New */}
      {lookupValue && !searching && searchResults.length === 0 && !existingVisitor && (
        <Card className="p-4 border-2 border-dashed border-gray-300 dark:border-gray-600">
          <div className="text-center">
            <UserIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              No visitor found
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
              Create a new visitor profile for this walk-in
            </p>
            <Button
              onClick={handleCreateNewVisitor}
              icon={<ArrowRightIcon className="w-4 h-4" />}
            >
              Create New Visitor
            </Button>
          </div>
        </Card>
      )}

      {/* Skip Lookup */}
      {!existingVisitor && !lookupValue && (
        <div className="text-center pt-4">
          <Button
            variant="outline"
            onClick={handleCreateNewVisitor}
            icon={<ArrowRightIcon className="w-4 h-4" />}
          >
            Skip Lookup - Create New Visitor
          </Button>
        </div>
      )}
    </motion.div>
  );

  const renderStep2 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <UserIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Visitor Details
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {existingVisitor ? 'Confirm visitor information' : 'Enter visitor information'}
        </p>
      </div>

      {initialPhoto?.url && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative w-full sm:w-32 h-48 sm:h-32 rounded-xl overflow-hidden bg-white shadow-inner">
              <img
                src={initialPhoto.url}
                alt="Captured visitor"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 inline-flex items-center space-x-1 bg-black/60 text-white text-xs px-2 py-0.5 rounded-full">
                <PhotoIcon className="w-4 h-4" />
                <span>Attached</span>
              </div>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-200 space-y-1">
              <p className="text-base font-semibold text-gray-900 dark:text-white">Visitor profile photo ready</p>
              <p className="text-gray-600 dark:text-gray-300">
                Resolution: {initialPhoto.width || '--'} x {initialPhoto.height || '--'} px
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                This picture will be stored as the visitor&apos;s profile photo. Need a retake? Go back and choose "Start with Photo Capture".
              </p>
            </div>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="First Name"
          placeholder="John"
          value={visitorData.firstName}
          onChange={(e) => handleVisitorDataChange('firstName', e.target.value)}
          error={validationErrors.firstName}
          required
          icon={UserIcon}
        />
        <Input
          label="Last Name"
          placeholder="Doe"
          value={visitorData.lastName}
          onChange={(e) => handleVisitorDataChange('lastName', e.target.value)}
          error={validationErrors.lastName}
          required
          icon={UserIcon}
        />
      </div>

      <Input
        label="Phone Number"
        type="tel"
        placeholder="+961 70 123 456"
        value={visitorData.phoneNumber}
        onChange={(e) => handleVisitorDataChange('phoneNumber', e.target.value)}
        error={validationErrors.phoneNumber}
        required
        icon={PhoneIcon}
      />

      <Input
        label="Email (Optional)"
        type="email"
        placeholder="visitor@example.com"
        value={visitorData.email}
        onChange={(e) => handleVisitorDataChange('email', e.target.value)}
        icon={EnvelopeIcon}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Company (Optional)"
          placeholder="ABC Corp"
          value={visitorData.company}
          onChange={(e) => handleVisitorDataChange('company', e.target.value)}
          icon={BuildingOfficeIcon}
        />
        <Input
          label="Job Title (Optional)"
          placeholder="Manager"
          value={visitorData.jobTitle}
          onChange={(e) => handleVisitorDataChange('jobTitle', e.target.value)}
          icon={UserGroupIcon}
        />
      </div>

      {/* Document Scanning Section */}
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
        <div className="flex items-center justify-between mb-3">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            ID Documents (Optional)
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDocumentScanner(true)}
            icon={<DocumentIcon className="w-4 h-4" />}
          >
            Scan Document
          </Button>
        </div>

        {scannedDocuments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {scannedDocuments.map((doc, index) => (
              <div key={index} className="relative group">
                <img
                  src={doc.url}
                  alt={`Document ${index + 1}`}
                  className="w-full h-24 object-cover rounded-lg border border-gray-200 dark:border-gray-700"
                />
                <button
                  onClick={() => handleRemoveDocument(index)}
                  className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <TrashIcon className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 left-1 right-1 bg-black bg-opacity-60 text-white text-xs px-2 py-1 rounded text-center">
                  Doc {index + 1}
                </div>
              </div>
            ))}
          </div>
        )}

        {scannedDocuments.length === 0 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            No documents scanned yet. Scan ID or other documents for verification.
          </p>
        )}
      </div>

      {existingVisitor && (
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
          <p className="text-sm text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Changes will update the existing visitor profile.
          </p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button
          onClick={handleNext}
          icon={<ArrowRightIcon className="w-4 h-4" />}
        >
          Continue
        </Button>
      </div>
    </motion.div>
  );

  const renderStep3 = () => (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-6"
    >
      <div className="text-center mb-6">
        <DocumentTextIcon className="w-16 h-16 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Visit Information
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Where is the visitor going and why?
        </p>
      </div>

      {/* Host Search */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Visiting Host <span className="text-red-500">*</span>
        </label>
        {visitData.hostId ? (
          <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg">
            <div className="flex items-center space-x-2">
              <UserIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {visitData.hostName}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setVisitData(prev => ({ ...prev, hostId: null, hostName: '' }))}
              icon={<XMarkIcon className="w-4 h-4" />}
            >
              Change
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              placeholder="Search host by name..."
              value={hostSearchTerm}
              onChange={(e) => handleHostSearch(e.target.value)}
              icon={MagnifyingGlassIcon}
              error={validationErrors.hostId}
            />
            {searchingHosts && (
              <div className="absolute right-3 top-3">
                <LoadingSpinner size="sm" />
              </div>
            )}
            {hostSearchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {hostSearchResults.map((host) => (
                  <button
                    key={host.id}
                    onClick={() => handleSelectHost(host)}
                    className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                  >
                    <p className="font-medium text-gray-900 dark:text-white">
                      {host.fullName || `${host.firstName} ${host.lastName}`}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {host.email}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Location Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Location <span className="text-red-500">*</span>
        </label>
        <select
          value={visitData.locationId || ''}
          onChange={(e) => handleVisitDataChange('locationId', e.target.value)}
          className={`
            w-full px-4 py-2.5 rounded-lg border
            bg-white dark:bg-gray-800
            ${validationErrors.locationId
              ? 'border-red-300 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600'
            }
            text-gray-900 dark:text-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          `}
        >
          <option value="">Select location...</option>
          {locations.map((location) => (
            <option key={location.id} value={location.id}>
              {location.name}
            </option>
          ))}
        </select>
        {validationErrors.locationId && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">
            {validationErrors.locationId}
          </p>
        )}
      </div>

      {/* Visit Purpose Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Visit Purpose (Optional)
        </label>
        <select
          value={visitData.visitPurposeId || ''}
          onChange={(e) => handleVisitDataChange('visitPurposeId', e.target.value)}
          className="
            w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          "
        >
          <option value="">Select purpose... (defaults to Walk-in)</option>
          {visitPurposes.map((purpose) => (
            <option key={purpose.id} value={purpose.id}>
              {purpose.name}
            </option>
          ))}
        </select>
      </div>

      {/* Duration Select */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Expected Duration
        </label>
        <select
          value={visitData.duration}
          onChange={(e) => handleVisitDataChange('duration', parseInt(e.target.value))}
          className="
            w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all
          "
        >
          <option value={30}>30 minutes</option>
          <option value={60}>1 hour</option>
          <option value={120}>2 hours</option>
          <option value={240}>4 hours</option>
          <option value={480}>Full day</option>
        </select>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes (Optional)
        </label>
        <textarea
          value={visitData.notes}
          onChange={(e) => handleVisitDataChange('notes', e.target.value)}
          placeholder="Any additional information..."
          rows={3}
          className="
            w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600
            bg-white dark:bg-gray-800 text-gray-900 dark:text-white
            focus:ring-2 focus:ring-blue-500 focus:border-transparent
            transition-all resize-none
          "
        />
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="flex justify-between pt-4">
        <Button
          variant="outline"
          onClick={handleBack}
          disabled={loading}
          icon={<ArrowLeftIcon className="w-4 h-4" />}
        >
          Back
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          icon={loading ? <LoadingSpinner size="sm" /> : <CheckCircleIcon className="w-5 h-5" />}
        >
          {loading ? 'Processing...' : 'Check In & Print Badge'}
        </Button>
      </div>
    </motion.div>
  );

  return (
    <div className="max-w-2xl mx-auto">
      {renderStepIndicator()}

      <AnimatePresence mode="wait">
        {currentStep === 1 && <div key="step1">{renderStep1()}</div>}
        {currentStep === 2 && <div key="step2">{renderStep2()}</div>}
        {currentStep === 3 && <div key="step3">{renderStep3()}</div>}
      </AnimatePresence>

      {/* Cancel Button */}
      <div className="text-center mt-6">
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel Walk-in Registration
        </Button>
      </div>

      {/* Document Scanner Modal */}
      {showDocumentScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className="max-w-4xl w-full">
            <DocumentScanner
              onDocumentScanned={handleDocumentScanned}
              onCancel={() => setShowDocumentScanner(false)}
              documentType="ID"
            />
          </div>
        </div>
      )}
    </div>
  );
};

WalkInForm.propTypes = {
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.string,
  initialPhoto: PropTypes.object
};

export default WalkInForm;
