// src/components/invitation/InvitationForm/InvitationForm.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { debounce } from 'lodash';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Card from '../../common/Card/Card';
import Badge from '../../common/Badge/Badge';
import AutocompleteInput from '../../common/AutocompleteInput/AutocompleteInput';
import { CapacityValidator } from '../../capacity';
import Modal from '../../common/Modal/Modal';
import LocationForm from '../../forms/LocationForm/LocationForm';
import VisitorQuickCreateForm from '../../visitor/VisitorQuickCreateForm/VisitorQuickCreateForm';

// Services
import timeSlotsService from '../../../services/timeSlotsService';
import visitorService from '../../../services/visitorService';

// Selectors
import { selectVisitorsList } from '../../../store/selectors/visitorSelectors';
import { selectLocationsList } from '../../../store/selectors/locationSelectors';
import { selectVisitPurposesList } from '../../../store/selectors/visitPurposeSelectors';
import { selectIsOperator, selectUser } from '../../../store/selectors/authSelectors';

// Services (additional)
import userService from '../../../services/userService';

// Redux actions
import { createLocation, getActiveLocations } from '../../../store/slices/locationsSlice';
import { getVisitors, addVisitorToList } from '../../../store/slices/visitorsSlice';

// Icons
import {
  UserIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  DocumentTextIcon,
  StarIcon,
  ShieldCheckIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Comprehensive Invitation Form Component
 * Handles both create and edit operations for invitations
 * Multi-step form with validation and visitor/location selection
 */
const InvitationForm = ({
  initialData = null,
  preselectedData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation(['invitations', 'common']);

  // Redux selectors for autocomplete data
  const visitors = useSelector(selectVisitorsList);
  const locations = useSelector(selectLocationsList);
  const visitPurposes = useSelector(selectVisitPurposesList);
  const isOperator = useSelector(selectIsOperator);
  const currentUser = useSelector(selectUser);

  // Location creation modal state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationCreating, setLocationCreating] = useState(false);
  const [locationError, setLocationError] = useState(null);

  // Visitor creation modal state
  const [showVisitorModal, setShowVisitorModal] = useState(false);
  const [visitorCreating, setVisitorCreating] = useState(false);
  const [visitorError, setVisitorError] = useState(null);
  const [visitorCreateTarget, setVisitorCreateTarget] = useState('single'); // 'single' | 'group'

  // Form state
  const [formData, setFormData] = useState({
    // Required fields
    visitorId: null,
    visitorIds: [], // For group invitations
    subject: '',
    scheduledStartTime: '',
    scheduledEndTime: '',

    // Optional fields
    visitPurposeId: null,
    locationId: null,
    timeSlotId: null, // Added for calendar integration
    type: 'Single',
    message: '',
    expectedVisitorCount: 1,
    specialInstructions: '',

    // Requirements
    requiresEscort: false,
    requiresBadge: false,
    needsParking: false,
    parkingInstructions: '',

    // Template and submission
    templateId: null,
    submitForApproval: false,

    // Host (only used when operator creates an invitation)
    hostId: null
  });

  // Time slot state
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

  // Ref to track if we've applied preselected time slot times
  const hasAppliedPreselectedTimes = useRef(false);

  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [selectedVisitor, setSelectedVisitor] = useState(null);
  const [selectedVisitors, setSelectedVisitors] = useState([]); // For group invitations
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedVisitPurpose, setSelectedVisitPurpose] = useState(null);
  const [selectedHost, setSelectedHost] = useState(null);
  const [hostSearchTerm, setHostSearchTerm] = useState('');
  const [hostSearchResults, setHostSearchResults] = useState([]);
  const [searchingHosts, setSearchingHosts] = useState(false);

  // Capacity validation state
  const [capacityValid, setCapacityValid] = useState(true);
  const [capacityResult, setCapacityResult] = useState(null);

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        visitorId: initialData.visitorId || null,
        subject: initialData.subject || '',
        scheduledStartTime: formatDateTimeForInput(initialData.scheduledStartTime),
        scheduledEndTime: formatDateTimeForInput(initialData.scheduledEndTime),
        visitPurposeId: initialData.visitPurposeId || null,
        locationId: initialData.locationId || null,
        timeSlotId: initialData.timeSlotId || null,
        type: initialData.type || 'Single',
        message: initialData.message || '',
        expectedVisitorCount: initialData.expectedVisitorCount || 1,
        specialInstructions: initialData.specialInstructions || '',
        requiresEscort: initialData.requiresEscort ?? false,
        requiresBadge: initialData.requiresBadge ?? false,
        needsParking: initialData.needsParking ?? false,
        parkingInstructions: initialData.parkingInstructions || '',
        templateId: initialData.templateId || null,
        submitForApproval: false
      });

      // Set selected objects for autocomplete
      if (initialData.visitor) {
        setSelectedVisitor(initialData.visitor);
      }
      if (initialData.location) {
        setSelectedLocation(initialData.location);
      }
      if (initialData.visitPurpose) {
        setSelectedVisitPurpose(initialData.visitPurpose);
      }
    }
  }, [initialData]);

  // Handle preselected data from calendar navigation
  useEffect(() => {
    if (preselectedData && !isEdit) {
      setFormData(prev => {
        const updates = {};

        // Set location if provided
        if (preselectedData.locationId) {
          updates.locationId = preselectedData.locationId;

          // Find and set the selected location object
          const location = locations.find(loc => loc.id === preselectedData.locationId);
          if (location) {
            setSelectedLocation(location);
          }
        }

        // Set scheduled date/time if provided
        if (preselectedData.scheduledDate) {
          // Convert the date to a datetime-local format
          const date = new Date(preselectedData.scheduledDate);

          // If we have a specific time from a time slot, we'll use it
          // Otherwise, set it to 9 AM by default
          if (!date.getHours()) {
            date.setHours(9, 0, 0, 0);
          }

          updates.scheduledStartTime = formatDateTimeForInput(date);

          // Set end time to 1 hour later by default
          const endDate = new Date(date);
          endDate.setHours(endDate.getHours() + 1);
          updates.scheduledEndTime = formatDateTimeForInput(endDate);
        }

        // Set time slot if provided
        if (preselectedData.timeSlotId) {
          updates.timeSlotId = preselectedData.timeSlotId;
        }

        return { ...prev, ...updates };
      });
    }
  }, [preselectedData, isEdit, locations]);

  // Revalidate time and location fields when they change to clear errors
  useEffect(() => {
    // Only revalidate if field has been touched
    if (!touched.scheduledStartTime && !touched.scheduledEndTime && !touched.locationId) {
      return;
    }

    setFormErrors(prev => {
      const newErrors = { ...prev };

      // Revalidate scheduledStartTime
      if (touched.scheduledStartTime) {
        if (!formData.scheduledStartTime) {
          newErrors.scheduledStartTime = t('validation.startTimeRequired');
        } else if (new Date(formData.scheduledStartTime) <= new Date()) {
          newErrors.scheduledStartTime = t('validation.startTimeInPast');
        } else {
          delete newErrors.scheduledStartTime;
        }
      }

      // Revalidate scheduledEndTime
      if (touched.scheduledEndTime) {
        if (!formData.scheduledEndTime) {
          newErrors.scheduledEndTime = t('validation.endTimeRequired');
        } else if (formData.scheduledStartTime && new Date(formData.scheduledEndTime) <= new Date(formData.scheduledStartTime)) {
          newErrors.scheduledEndTime = t('validation.endTimeBeforeStart');
        } else {
          // Check duration
          const startTime = new Date(formData.scheduledStartTime);
          const endTime = new Date(formData.scheduledEndTime);
          const durationHours = (endTime - startTime) / (1000 * 60 * 60);

          if (durationHours > 24) {
            newErrors.scheduledEndTime = t('validation.durationTooLong');
          } else if (durationHours < 0.25) {
            newErrors.scheduledEndTime = t('validation.durationTooShort');
          } else {
            delete newErrors.scheduledEndTime;
          }
        }
      }

      // Revalidate locationId
      if (touched.locationId) {
        if (!formData.locationId) {
          newErrors.locationId = t('validation.locationRequired');
        } else {
          delete newErrors.locationId;
        }
      }

      return newErrors;
    });
  }, [formData.scheduledStartTime, formData.scheduledEndTime, formData.locationId, touched.scheduledStartTime, touched.scheduledEndTime, touched.locationId]);

  // Fetch available time slots when location and date change
  useEffect(() => {
    const fetchAvailableTimeSlots = async () => {
      // Require at least a location to fetch slots
      if (!formData.locationId) {
        setAvailableTimeSlots([]);
        return;
      }

      try {
        setLoadingTimeSlots(true);

        let slots;
        if (formData.scheduledStartTime) {
          // Date is known — fetch with availability counts for that specific date
          const date = new Date(formData.scheduledStartTime).toISOString();
          slots = await timeSlotsService.getAvailableTimeSlots({
            date,
            locationId: formData.locationId
          });
        } else {
          // No date yet — fetch all active slots for the location
          const result = await timeSlotsService.getTimeSlots({
            locationId: formData.locationId,
            activeOnly: true,
            pageSize: 100
          });
          slots = result?.items || [];
        }

        setAvailableTimeSlots(slots || []);

        // If editing or preselected timeSlotId exists, find and set the selected slot
        if (formData.timeSlotId && slots) {
          const slot = slots.find(s => s.id === formData.timeSlotId);
          if (slot) {
            setSelectedTimeSlot(slot);

            // If this is from preselected data (not edit mode), also update the times
            // Only do this once to avoid infinite loops
            if (preselectedData && !isEdit && !hasAppliedPreselectedTimes.current) {
              const currentDate = new Date(formData.scheduledStartTime);
              const [startHours, startMinutes] = slot.startTime.split(':').map(Number);
              const [endHours, endMinutes] = slot.endTime.split(':').map(Number);

              const newStartTime = new Date(currentDate);
              newStartTime.setHours(startHours, startMinutes, 0, 0);

              const newEndTime = new Date(currentDate);
              newEndTime.setHours(endHours, endMinutes, 0, 0);

              // Update form data with time slot's times
              setFormData(prev => ({
                ...prev,
                scheduledStartTime: formatDateTimeForInput(newStartTime),
                scheduledEndTime: formatDateTimeForInput(newEndTime)
              }));

              // Mark that we've applied the times
              hasAppliedPreselectedTimes.current = true;
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch available time slots:', error);
        setAvailableTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchAvailableTimeSlots();
  }, [formData.locationId, formData.scheduledStartTime, formData.timeSlotId, preselectedData, isEdit]);

  // Validation functions
  const validateField = (field, value) => {
    switch (field) {
      case 'visitorId':
        if (!value && formData.type === 'Single') return t('validation.visitorRequired');
        break;
      case 'visitorIds':
        if (formData.type === 'Group' && (!value || value.length === 0)) return t('validation.groupVisitorRequired');
        break;
      case 'subject':
        if (!value?.trim()) return t('validation.subjectRequired');
        if (value.length > 200) return t('validation.subjectTooLong');
        break;
      case 'locationId':
        if (!value) return t('validation.locationRequired');
        break;
      case 'scheduledStartTime':
        if (!value) return t('validation.startTimeRequired');
        if (new Date(value) <= new Date()) return t('validation.startTimeInPast');
        break;
      case 'scheduledEndTime':
        if (!value) return t('validation.endTimeRequired');
        if (formData.scheduledStartTime && new Date(value) <= new Date(formData.scheduledStartTime)) {
          return t('validation.endTimeBeforeStart');
        }
        break;
      case 'expectedVisitorCount':
        if (value < 1) return t('validation.visitorCountMin');
        if (value > 100) return t('validation.visitorCountMax');
        break;
      case 'message':
        if (value && value.length > 1000) return t('validation.messageTooLong');
        break;
      case 'specialInstructions':
        if (value && value.length > 500) return t('validation.specialInstructionsTooLong');
        break;
      case 'parkingInstructions':
        if (value && value.length > 200) return t('validation.parkingInstructionsTooLong');
        break;
      default:
        break;
    }
    return null;
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate all required and conditional fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    // Cross-field validation
    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      const startTime = new Date(formData.scheduledStartTime);
      const endTime = new Date(formData.scheduledEndTime);
      const durationHours = (endTime - startTime) / (1000 * 60 * 60);
      
      if (durationHours > 24) {
        errors.scheduledEndTime = t('validation.durationTooLong');
      } else if (durationHours < 0.25) {
        errors.scheduledEndTime = t('validation.durationTooShort');
      }
    }

    // Parking validation
    if (formData.needsParking && !formData.parkingInstructions?.trim()) {
      errors.parkingInstructions = t('validation.parkingInstructionsRequired');
    }

    return errors;
  };

  // Handle form field changes
  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle field blur
  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate field on blur and update error state (add or remove)
    const error = validateField(field, formData[field]);
    setFormErrors(prev => {
      const newErrors = { ...prev };
      if (error) {
        newErrors[field] = error;
      } else {
        delete newErrors[field]; // Remove error if field is now valid
      }
      return newErrors;
    });
  };

  // Handle capacity validation changes
  const handleCapacityValidation = (result) => {
    setCapacityResult(result);
    setCapacityValid(result?.isAvailable || false);
    
    // If an alternative was selected, update the form data
    if (result?.alternativeSelected && result?.selectedAlternative) {
      const alternative = result.selectedAlternative;
      if (alternative.dateTime) {
        handleChange('scheduledStartTime', alternative.dateTime);
        
        // Calculate end time based on duration or default to 1 hour
        const startTime = new Date(alternative.dateTime);
        const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Default 1 hour
        handleChange('scheduledEndTime', endTime.toISOString().slice(0, 16));
      }
      
      // Update time slot if provided
      if (alternative.timeSlotId) {
        handleChange('timeSlotId', alternative.timeSlotId);
      }
    }
  };

  // Handle visitor selection with auto-population of preferences
  const handleVisitorSelect = (visitor) => {
    setSelectedVisitor(visitor);
    handleChange('visitorId', visitor?.id || null);
    
    // Auto-populate location and visit purpose from visitor preferences
    if (visitor) {
      // Set preferred location if available and not already set
      if (visitor.preferredLocation && !selectedLocation) {
        setSelectedLocation(visitor.preferredLocation);
        handleChange('locationId', visitor.preferredLocation.id);
      }
      
      // Set default visit purpose if available and not already set
      if (visitor.defaultVisitPurpose && !selectedVisitPurpose) {
        setSelectedVisitPurpose(visitor.defaultVisitPurpose);
        handleChange('visitPurposeId', visitor.defaultVisitPurpose.id);
      }
    }
  };

  // Handle adding visitor to group
  const handleAddVisitorToGroup = (visitor) => {
    if (visitor && !selectedVisitors.find(v => v.id === visitor.id)) {
      const updatedVisitors = [...selectedVisitors, visitor];
      setSelectedVisitors(updatedVisitors);
      handleChange('visitorIds', updatedVisitors.map(v => v.id));
      handleChange('expectedVisitorCount', updatedVisitors.length);
    }
  };

  // Handle removing visitor from group
  const handleRemoveVisitorFromGroup = (visitorId) => {
    const updatedVisitors = selectedVisitors.filter(v => v.id !== visitorId);
    setSelectedVisitors(updatedVisitors);
    handleChange('visitorIds', updatedVisitors.map(v => v.id));
    handleChange('expectedVisitorCount', Math.max(1, updatedVisitors.length));
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    handleChange('locationId', location?.id || null);
  };

  // Handle visit purpose selection
  const handleVisitPurposeSelect = (visitPurpose) => {
    setSelectedVisitPurpose(visitPurpose);
    handleChange('visitPurposeId', visitPurpose?.id || null);
  };

  // Debounced host search (for Receptionist creating an invitation)
  const debouncedHostSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setHostSearchResults([]);
        return;
      }
      setSearchingHosts(true);
      try {
        const response = await userService.searchHosts(searchTerm, { limit: 10 });
        const hosts = Array.isArray(response)
          ? response
          : response?.items || response?.data?.items || [];
        setHostSearchResults(hosts);
      } catch (error) {
        console.error('Host search failed:', error);
        setHostSearchResults([]);
      } finally {
        setSearchingHosts(false);
      }
    }, 300),
    []
  );

  const handleHostSearch = (value) => {
    setHostSearchTerm(value);
    debouncedHostSearch(value);
  };

  const handleHostSelect = (host) => {
    setSelectedHost(host);
    const displayName = host.fullName || `${host.firstName || ''} ${host.lastName || ''}`.trim() || host.email || '';
    setHostSearchTerm(displayName);
    setHostSearchResults([]);
    handleChange('hostId', host.id);
  };

  const handleClearHost = () => {
    setSelectedHost(null);
    setHostSearchTerm('');
    setHostSearchResults([]);
    handleChange('hostId', null);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = (timeSlot) => {
    setSelectedTimeSlot(timeSlot);
    handleChange('timeSlotId', timeSlot?.id || null);

    // If a time slot is selected, update start and end times based on the slot's times
    if (timeSlot) {
      // Use existing date if set, otherwise default to today
      const currentDate = formData.scheduledStartTime
        ? new Date(formData.scheduledStartTime)
        : new Date();

      // Parse the time slot's start time (format: "HH:MM:SS")
      const [startHours, startMinutes] = timeSlot.startTime.split(':').map(Number);
      const [endHours, endMinutes] = timeSlot.endTime.split(':').map(Number);

      // Create new date objects with the time slot's times
      const newStartTime = new Date(currentDate);
      newStartTime.setHours(startHours, startMinutes, 0, 0);

      const newEndTime = new Date(currentDate);
      newEndTime.setHours(endHours, endMinutes, 0, 0);

      // Update the form data
      setFormData(prev => ({
        ...prev,
        scheduledStartTime: formatDateTimeForInput(newStartTime),
        scheduledEndTime: formatDateTimeForInput(newEndTime),
        timeSlotId: timeSlot.id
      }));
    }
  };

  // Handle opening location creation modal
  const handleOpenLocationModal = () => {
    setShowLocationModal(true);
    setLocationError(null);
  };

  // Handle closing location creation modal
  const handleCloseLocationModal = () => {
    setShowLocationModal(false);
    setLocationError(null);
  };

  // Handle location creation
  const handleCreateLocation = async (locationData) => {
    setLocationCreating(true);
    setLocationError(null);

    try {
      const result = await dispatch(createLocation(locationData)).unwrap();

      // Refresh locations list
      await dispatch(getActiveLocations()).unwrap();

      // Auto-select the newly created location
      setSelectedLocation(result);
      handleChange('locationId', result.id);

      // Close modal
      setShowLocationModal(false);
      setLocationCreating(false);
    } catch (error) {
      console.error('Failed to create location:', error);
      setLocationError(error.message || t('errors.createLocationFailed'));
      setLocationCreating(false);
    }
  };

  // Handle opening visitor creation modal
  const handleOpenVisitorModal = (target = 'single') => {
    setVisitorCreateTarget(target);
    setShowVisitorModal(true);
    setVisitorError(null);
  };

  // Handle closing visitor creation modal
  const handleCloseVisitorModal = () => {
    setShowVisitorModal(false);
    setVisitorError(null);
  };

  // Handle creating a new visitor from the modal
  const handleCreateVisitor = async (visitorData, invitationData = null, assetData = {}) => {
    setVisitorCreating(true);
    setVisitorError(null);
    try {
      const { photoFile, documentFiles } = assetData;
      const result = await visitorService.createVisitorWithAssets(
        visitorData,
        photoFile,
        documentFiles || [],
        invitationData
      );

      const createdVisitor = result?.visitor || result;

      // Optimistically inject the new visitor into the Redux list so the
      // autocomplete reflects it immediately without a full 1000-record reload.
      dispatch(addVisitorToList(createdVisitor));

      // Auto-select the new visitor
      if (visitorCreateTarget === 'group') {
        handleAddVisitorToGroup(createdVisitor);
      } else {
        handleVisitorSelect(createdVisitor);
      }

      setShowVisitorModal(false);
      return createdVisitor;
    } catch (error) {
      setVisitorError(error);
      throw error;
    } finally {
      setVisitorCreating(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    const allTouched = Object.keys(formData).reduce((acc, key) => {
      acc[key] = true;
      return acc;
    }, {});
    setTouched(allTouched);

    // Validate form
    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Check capacity validation
    if (!capacityValid && capacityResult && !capacityResult.isAvailable) {
      setFormErrors(prev => ({
        ...prev,
        capacity: t('form.capacityError')
      }));
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      scheduledStartTime: new Date(formData.scheduledStartTime).toISOString(),
      scheduledEndTime: new Date(formData.scheduledEndTime).toISOString(),
      // Include hostId only when set (operator selected a different host)
      hostId: formData.hostId || undefined
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  // Helper to set preset times
  const setPresetTime = (startHour, durationHours) => {
    const now = new Date();
    const today = new Date();
    const startDate = new Date(today);
    startDate.setHours(startHour, 0, 0, 0);

    // Check if the time is in the past
    if (startDate < now) {
      // If the time is in the past, use tomorrow instead
      startDate.setDate(startDate.getDate() + 1);

      // Show a notification to the user
      if (typeof ErrorService !== 'undefined') {
        console.warn(`Selected time ${startHour}:00 is in the past. Using tomorrow's date instead.`);
      }
    }

    const endDate = new Date(startDate);
    endDate.setHours(startHour + durationHours, 0, 0, 0);

    // Format for datetime-local input (local time, not UTC)
    handleChange('scheduledStartTime', formatDateTimeForLocalInput(startDate));
    handleChange('scheduledEndTime', formatDateTimeForLocalInput(endDate));

    // Clear selected time slot since the user manually chose a preset time
    setSelectedTimeSlot(null);
    handleChange('timeSlotId', null);
  };

  // Helper to format datetime for datetime-local input (local time)
  const formatDateTimeForLocalInput = (date) => {
    if (!date) return '';
    try {
      const d = new Date(date);
      // Get local time components
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');

      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Helper to format datetime for display (from ISO string to local time)
  const formatDateTimeForInput = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return formatDateTimeForLocalInput(date);
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Helper to calculate visit duration
  const getVisitDuration = () => {
    if (formData.scheduledStartTime && formData.scheduledEndTime) {
      const start = new Date(formData.scheduledStartTime);
      const end = new Date(formData.scheduledEndTime);
      const durationMs = end - start;
      const durationHours = durationMs / (1000 * 60 * 60);
      return durationHours > 0 ? durationHours.toFixed(1) : 0;
    }
    return 0;
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700 rounded-md p-4">
          <div className="text-sm text-red-700 dark:text-red-300">
            {Array.isArray(error) ? (
              <ul className="list-disc list-inside space-y-1">
                {error.map((err, index) => (
                  <li key={index}>{extractErrorMessage(err)}</li>
                ))}
              </ul>
            ) : (
              extractErrorMessage(error)
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <DocumentTextIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('form.sections.basicInfo')}</h3>
          </div>

          <div className="space-y-4">
            <Input
              label={t('form.fields.subject')}
              type="text"
              value={formData.subject}
              onChange={(e) => handleChange('subject', e.target.value)}
              onBlur={() => handleBlur('subject')}
              error={touched.subject ? formErrors.subject : undefined}
              required
              maxLength={200}
              placeholder={t('form.fields.subjectPlaceholder')}
            />

            {/* Host Selection — visible to Receptionist (operator) only when creating a new invitation */}
            {isOperator && !isEdit && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('form.fields.host', 'Host')} <span className="text-red-500">*</span>
                </label>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t('form.fields.hostHint', 'Select the staff member who is hosting this visitor. Leave blank to assign yourself as host.')}
                </p>
                {selectedHost ? (
                  <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center flex-shrink-0">
                        <UserIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedHost.fullName || `${selectedHost.firstName || ''} ${selectedHost.lastName || ''}`.trim()}
                        </p>
                        {selectedHost.email && (
                          <p className="text-xs text-gray-500 dark:text-gray-400">{selectedHost.email}</p>
                        )}
                      </div>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={handleClearHost} icon={<XMarkIcon className="w-4 h-4" />}>
                      {t('common:buttons.change', 'Change')}
                    </Button>
                  </div>
                ) : (
                  <div className="relative">
                    <Input
                      placeholder={t('form.fields.searchHostPlaceholder', 'Search by name or email… (type 2+ characters)')}
                      value={hostSearchTerm}
                      onChange={(e) => handleHostSearch(e.target.value)}
                      leftIcon={<MagnifyingGlassIcon className="w-4 h-4" />}
                    />
                    {searchingHosts && (
                      <div className="absolute end-3 top-3">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {hostSearchResults.length > 0 && (
                      <div className="absolute z-20 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-52 overflow-y-auto">
                        {hostSearchResults.map((host, index) => {
                          const displayName = host.fullName || `${host.firstName || ''} ${host.lastName || ''}`.trim() || host.email || '';
                          return (
                            <button
                              key={host.id ?? host.email ?? index}
                              type="button"
                              onClick={() => handleHostSelect(host)}
                              className="w-full text-start p-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                            >
                              <p className="text-sm font-medium text-gray-900 dark:text-white">{displayName}</p>
                              {host.email && <p className="text-xs text-gray-500 dark:text-gray-400">{host.email}</p>}
                              {host.department && <p className="text-xs text-gray-400 dark:text-gray-500">{host.department}</p>}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
                {!selectedHost && currentUser && (
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {t('form.fields.hostSelfHint', 'If no host is selected, you ({{name}}) will be set as the host.', { name: currentUser.fullName || currentUser.firstName })}
                  </p>
                )}
              </div>
            )}

            {/* Visitor Selection */}
            {formData.type === 'Single' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  {t('form.fields.visitor')} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <AutocompleteInput
                      options={visitors}
                      value={selectedVisitor}
                      onChange={handleVisitorSelect}
                      getOptionLabel={(visitor) => `${visitor.fullName}`}
                      getOptionDescription={(visitor) => visitor.email}
                      placeholder={t('form.fields.searchVisitorPlaceholder')}
                      error={touched.visitorId ? formErrors.visitorId : undefined}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleOpenVisitorModal('single')}
                    className="whitespace-nowrap"
                    title={t('form.addVisitorTitle')}
                  >
                    {t('form.addButton')}
                  </Button>
                </div>
                {touched.visitorId && formErrors.visitorId && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.visitorId}</p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('form.fields.visitors')} <span className="text-red-500">*</span>
                </label>
                
                {/* Add Visitor Input */}
                <div className="mb-3">
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <AutocompleteInput
                        options={visitors}
                        value={null}
                        onChange={handleAddVisitorToGroup}
                        getOptionLabel={(visitor) => `${visitor.firstName} ${visitor.lastName}`}
                        getOptionDescription={(visitor) => visitor.email}
                        placeholder={t('form.fields.searchGroupVisitorPlaceholder')}
                      />
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleOpenVisitorModal('group')}
                      className="whitespace-nowrap"
                      title={t('form.addVisitorTitle')}
                    >
                      {t('form.addButton')}
                    </Button>
                  </div>
                </div>

                {/* Selected Visitors List */}
                {selectedVisitors.length > 0 && (
                  <div className="space-y-2 mb-3">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                      {t('form.selectedVisitors', { count: selectedVisitors.length })}
                    </p>
                    <div className="border border-gray-200 dark:border-gray-700 rounded-md max-h-40 overflow-y-auto bg-white dark:bg-gray-900/30">
                      {selectedVisitors.map((visitor) => (
                        <div
                          key={visitor.id}
                          className="flex items-center justify-between p-3 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-sm font-medium text-blue-600 dark:text-blue-300">
                                {visitor.firstName?.[0]}{visitor.lastName?.[0]}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {visitor.firstName} {visitor.lastName}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{visitor.email}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveVisitorFromGroup(visitor.id)}
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 p-1"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Expected Visitor Count Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {t('form.fields.expectedTotalVisitors')}
                  </label>
                  <Input
                    type="number"
                    min="1"
                    value={formData.expectedVisitorCount}
                    onChange={(e) => handleChange('expectedVisitorCount', parseInt(e.target.value) || 1)}
                    className="w-full"
                    placeholder={t('form.fields.totalVisitorCountPlaceholder')}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t('form.fields.expectedTotalVisitorsHint')}
                  </p>
                </div>

                {touched.visitorIds && formErrors.visitorIds && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.visitorIds}</p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  {t('form.fields.visitPurpose')}
                </label>
                <AutocompleteInput
                  options={visitPurposes}
                  value={selectedVisitPurpose}
                  onChange={handleVisitPurposeSelect}
                  getOptionLabel={(purpose) => purpose.name}
                  getOptionDescription={(purpose) => purpose.description}
                  placeholder={t('form.fields.visitPurposePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 dark:text-gray-300">
                  {t('form.fields.location')} <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <AutocompleteInput
                      options={locations}
                      value={selectedLocation}
                      onChange={handleLocationSelect}
                      onBlur={() => handleBlur('locationId')}
                      getOptionLabel={(location) => location.name}
                      getOptionDescription={(location) => location.description}
                      placeholder={t('form.fields.locationPlaceholder')}
                      error={touched.locationId ? formErrors.locationId : undefined}
                      required
                    />
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleOpenLocationModal}
                    className="whitespace-nowrap"
                    title={t('form.addLocationTitle')}
                  >
                    {t('form.addButton')}
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('form.fields.invitationType')}
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500"
              >
                <option value="Single">{t('type.singleVisitor')}</option>
                <option value="Group">{t('type.groupVisit')}</option>
                <option value="Recurring">{t('type.recurringVisit')}</option>
                <option value="WalkIn">{t('type.walkIn')}</option>
              </select>
            </div>

              <Input
                label={t('form.fields.expectedVisitorCount')}
                type="number"
                min="1"
                max="100"
                value={formData.expectedVisitorCount}
                onChange={(e) => handleChange('expectedVisitorCount', parseInt(e.target.value) || 1)}
                onBlur={() => handleBlur('expectedVisitorCount')}
                error={touched.expectedVisitorCount ? formErrors.expectedVisitorCount : undefined}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('form.fields.message')}
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                onBlur={() => handleBlur('message')}
                rows={3}
                maxLength={1000}
                placeholder={t('form.fields.messagePlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 ${
                  touched.message && formErrors.message
                    ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-gray-100'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              />
              {touched.message && formErrors.message && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.message}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('form.charCount', { current: formData.message.length, max: 1000 })}
              </p>
            </div>
          </div>
        </Card>

        {/* Schedule */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <CalendarIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('form.sections.schedule')}</h3>
          </div>

          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 rounded-md">
            <p className="text-sm text-blue-800 dark:text-blue-200">
              📅 <strong>{t('form.dateTimeInfo')}</strong>
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Input
                label={t('form.fields.startDateTime')}
                type="datetime-local"
                value={formData.scheduledStartTime}
                onChange={(e) => {
                  handleChange('scheduledStartTime', e.target.value);
                  // Manual edit breaks time slot association
                  setSelectedTimeSlot(null);
                  handleChange('timeSlotId', null);
                }}
                onBlur={() => handleBlur('scheduledStartTime')}
                error={touched.scheduledStartTime ? formErrors.scheduledStartTime : undefined}
                min={new Date().toISOString().slice(0, 16)} // Prevent past dates
                // Removed step constraint for maximum flexibility
                required
                placeholder={t('form.fields.dateTimePlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('form.fields.startDateTimeHint')}
              </p>
            </div>

            <div>
              <Input
                label={t('form.fields.endDateTime')}
                type="datetime-local"
                value={formData.scheduledEndTime}
                onChange={(e) => {
                  handleChange('scheduledEndTime', e.target.value);
                  // Manual edit breaks time slot association
                  setSelectedTimeSlot(null);
                  handleChange('timeSlotId', null);
                }}
                onBlur={() => handleBlur('scheduledEndTime')}
                error={touched.scheduledEndTime ? formErrors.scheduledEndTime : undefined}
                min={formData.scheduledStartTime || new Date().toISOString().slice(0, 16)} // Must be after start time
                // Removed step constraint for maximum flexibility
                required
                placeholder={t('form.fields.dateTimePlaceholder')}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('form.fields.endDateTimeHint')}
              </p>
            </div>
          </div>

          {/* Quick Time Presets */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-200 mb-2">{t('form.quickTimePresets')}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{t('form.pastTimeNote')}</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setPresetTime(9, 1)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('form.presets.morningOneHour')}
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(10, 2)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('form.presets.lateMorningTwoHours')}
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(14, 1)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('form.presets.afternoonOneHour')}
              </button>
              <button
                type="button"
                onClick={() => setPresetTime(15, 2)}
                className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                {t('form.presets.afternoonTwoHours')}
              </button>
            </div>
          </div>

          {getVisitDuration() > 0 && (
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 rounded-md">
              <div className="flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-900 dark:text-blue-200">
                  {t('form.visitDuration', { hours: getVisitDuration() })}
                </span>
              </div>
            </div>
          )}
        </Card>

        {/* Time Slot Selection */}
        {formData.locationId && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ClockIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('form.sections.availableTimeSlots')}</h3>
              {loadingTimeSlots && (
                <span className="text-sm text-gray-500 dark:text-gray-400">{t('form.timeSlots.loading')}</span>
              )}
            </div>

            {!loadingTimeSlots && availableTimeSlots.length === 0 && (
              <div className="text-sm text-gray-500 dark:text-gray-400 p-4 bg-gray-50 dark:bg-slate-900/60 rounded-md">
                {t('form.timeSlots.noSlots')}
              </div>
            )}

            {!loadingTimeSlots && availableTimeSlots.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {t('form.timeSlots.selectOptional')}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableTimeSlots.map((slot) => {
                    const isSelected = selectedTimeSlot?.id === slot.id;
                    const availableSpots = (slot.maxVisitors || 0) - (slot.currentBookings || 0);
                    const utilizationRate = slot.maxVisitors > 0 ? (slot.currentBookings || 0) / slot.maxVisitors : 0;
                    const isFull = availableSpots <= 0;
                    const isLimited = utilizationRate >= 0.8 && !isFull;

                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => !isFull && handleTimeSlotSelect(isSelected ? null : slot)}
                        disabled={isFull}
                        className={`
                          p-4 rounded-lg border-2 text-start transition-all
                          ${isSelected
                            ? 'border-blue-500 bg-blue-50 dark:border-blue-400 dark:bg-blue-500/10'
                            : isFull
                            ? 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-slate-900/60 opacity-60 cursor-not-allowed'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-500/10 cursor-pointer'
                          }
                        `}
                      >
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900 dark:text-gray-100">
                          {slot.name}
                        </div>
                          {isSelected && (
                            <span className="px-2 py-1 text-xs font-medium bg-blue-500 text-white rounded">
                              {t('form.timeSlots.selected')}
                            </span>
                          )}
                          {isFull && !isSelected && (
                            <span className="px-2 py-1 text-xs font-medium bg-red-500 text-white rounded">
                              {t('form.timeSlots.full')}
                            </span>
                          )}
                          {isLimited && !isSelected && !isFull && (
                            <span className="px-2 py-1 text-xs font-medium bg-yellow-500 text-white rounded">
                              {t('form.timeSlots.limited')}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                          {timeSlotsService.formatTimeForDisplay(slot.startTime)} - {timeSlotsService.formatTimeForDisplay(slot.endTime)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-300">
                          <span className={`
                            ${isFull ? 'text-red-600' : isLimited ? 'text-yellow-600' : 'text-green-600'}
                          `}>
                            {t('form.timeSlots.spotsAvailable', { available: availableSpots, max: slot.maxVisitors })}
                          </span>
                          {slot.bufferMinutes > 0 && (
                            <span className="text-gray-500 dark:text-gray-400">
                              {t('form.timeSlots.bufferMinutes', { minutes: slot.bufferMinutes })}
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedTimeSlot && (
                  <div className="mt-3 p-3 bg-blue-50 border border-blue-200 dark:bg-blue-900/20 dark:border-blue-700 rounded-md">
                    <p className="text-sm text-blue-900 dark:text-blue-100">
                      {t('form.timeSlots.selectedInfo', {
                        name: selectedTimeSlot.name,
                        start: timeSlotsService.formatTimeForDisplay(selectedTimeSlot.startTime),
                        end: timeSlotsService.formatTimeForDisplay(selectedTimeSlot.endTime)
                      })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* Capacity Validation */}
        {formData.scheduledStartTime && (
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('form.sections.capacityCheck')}</h3>
            </div>

            <CapacityValidator
              locationId={formData.locationId}
              timeSlotId={formData.timeSlotId}
              dateTime={formData.scheduledStartTime ? new Date(formData.scheduledStartTime).toISOString() : null}
              endDateTime={formData.scheduledEndTime ? new Date(formData.scheduledEndTime).toISOString() : null}
              expectedVisitors={formData.expectedVisitorCount || 1}
              isVipRequest={false}
              excludeInvitationId={isEdit ? initialData?.id : null}
              onValidationChange={handleCapacityValidation}
              autoValidate={true}
              showAlternatives={true}
              className="w-full"
            />
          </Card>
        )}

        {/* Requirements */}
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <ShieldCheckIcon className="w-6 h-6 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">{t('form.sections.requirementsAccess')}</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresEscort}
                    onChange={(e) => handleChange('requiresEscort', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('form.fields.requiresEscort')}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('form.fields.requiresEscortHint')}</p>
                  </div>
                </label>

                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.requiresBadge}
                    onChange={(e) => handleChange('requiresBadge', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{t('form.fields.requiresBadge')}</span>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{t('form.fields.requiresBadgeHint')}</p>
                  </div>
                </label>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={formData.needsParking}
                    onChange={(e) => handleChange('needsParking', e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                  />
                    <div>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{t('form.fields.needsParking')}</span>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{t('form.fields.needsParkingHint')}</p>
                    </div>
                  </label>

                {isEdit && (
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={formData.submitForApproval}
                      onChange={(e) => handleChange('submitForApproval', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded"
                    />
                      <div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{t('form.fields.submitForApproval')}</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{t('form.fields.submitForApprovalHint')}</p>
                      </div>
                    </label>
                )}
              </div>
            </div>

            {formData.needsParking && (
              <Input
                label={t('form.fields.parkingInstructions')}
                type="text"
                value={formData.parkingInstructions}
                onChange={(e) => handleChange('parkingInstructions', e.target.value)}
                onBlur={() => handleBlur('parkingInstructions')}
                error={touched.parkingInstructions ? formErrors.parkingInstructions : undefined}
                maxLength={200}
                placeholder={t('form.fields.parkingInstructionsPlaceholder')}
                required={formData.needsParking}
              />
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('form.fields.specialInstructions')}
              </label>
              <textarea
                value={formData.specialInstructions}
                onChange={(e) => handleChange('specialInstructions', e.target.value)}
                onBlur={() => handleBlur('specialInstructions')}
                rows={3}
                maxLength={500}
                placeholder={t('form.fields.specialInstructionsPlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 ${
                  touched.specialInstructions && formErrors.specialInstructions
                    ? 'border-red-300 dark:border-red-500 bg-red-50 dark:bg-red-900/20 text-gray-900 dark:text-gray-100'
                    : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                }`}
              />
              {touched.specialInstructions && formErrors.specialInstructions && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{formErrors.specialInstructions}</p>
              )}
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {t('form.charCount', { current: formData.specialInstructions.length, max: 500 })}
              </p>
            </div>
          </div>
        </Card>

        {/* Form Errors */}
        {formErrors.capacity && (
          <div className="bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-red-800 dark:text-red-200">{t('form.capacityIssue')}</h4>
                <p className="text-sm text-red-700 dark:text-red-300 mt-1">{formErrors.capacity}</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            {t('form.buttons.cancel')}
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading || Object.keys(formErrors).length > 0}
          >
            {isEdit ? t('form.buttons.update') : t('form.buttons.create')}
          </Button>
        </div>

        {/* Debug info for development */}
        {process.env.NODE_ENV === 'development' && Object.keys(formErrors).length > 0 && (
          <div className="mt-4 bg-red-50 border border-red-200 dark:bg-red-900/30 dark:border-red-700 rounded p-3 text-sm text-red-700 dark:text-red-300">
            <strong>{t('form.validationErrors', { count: Object.keys(formErrors).length })}</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              {Object.entries(formErrors).map(([field, error]) => (
                <li key={field}>
                  <strong>{field}:</strong> {error}
                </li>
              ))}
            </ul>
          </div>
        )}
      </form>

      {/* Location Creation Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={handleCloseLocationModal}
        title={t('modals.createNewLocation')}
        size="lg"
      >
        <LocationForm
          onSubmit={handleCreateLocation}
          onCancel={handleCloseLocationModal}
          loading={locationCreating}
          error={locationError}
          isEdit={false}
        />
      </Modal>

      {/* Visitor Quick-Create Modal */}
      <Modal
        isOpen={showVisitorModal}
        onClose={handleCloseVisitorModal}
        title={t('modals.addNewVisitor')}
        size="md"
      >
        <VisitorQuickCreateForm
          onSubmit={handleCreateVisitor}
          onCancel={handleCloseVisitorModal}
          loading={visitorCreating}
          error={visitorError}
        />
      </Modal>
    </div>
  );
};

// PropTypes validation
InvitationForm.propTypes = {
  initialData: PropTypes.object,
  preselectedData: PropTypes.shape({
    timeSlotId: PropTypes.number,
    scheduledDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
    locationId: PropTypes.number
  }),
  onSubmit: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.array,
    PropTypes.object
  ]),
  isEdit: PropTypes.bool
};

export default InvitationForm;
