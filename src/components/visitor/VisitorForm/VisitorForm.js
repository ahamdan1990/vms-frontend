// Enhanced VisitorForm - Part 1: Imports and Initial Setup
// src/components/visitor/VisitorForm/VisitorForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import visitorDocumentService from '../../../services/visitorDocumentService';
import visitorNoteService from '../../../services/visitorNoteService';
import visitorService from '../../../services/visitorService';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import Card from '../../common/Card/Card';
import FileUpload from '../../common/FileUpload/FileUpload';
import AutocompleteInput from '../../common/AutocompleteInput/AutocompleteInput';

// Redux
import { getLocations } from '../../../store/slices/locationsSlice';
import { getVisitPurposes } from '../../../store/slices/visitPurposesSlice';
import { selectLocationsList } from '../../../store/selectors/locationSelectors';
import { selectVisitPurposesList } from '../../../store/selectors/visitPurposeSelectors';

// Utils and validation
import { extractErrorMessage } from '../../../utils/errorUtils';

// Icons
import { 
  UserIcon, 
  BuildingOfficeIcon, 
  IdentificationIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  DocumentTextIcon,
  StarIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon,
  PhotoIcon,
  MapPinIcon,
  ClipboardDocumentListIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { getVisitorById } from '../../../store/slices/visitorsSlice';
import { selectCurrentVisitor } from '../../../store/selectors/visitorSelectors';

/**
 * Enhanced Visitor Form Component with Photo, Documents, Location, and Visit Purpose
 * Handles both create and edit operations for visitors
 * Multi-step form with validation, file uploads, and enhanced selections
 */
const VisitorForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false,
  onFormChange = null // Callback to notify parent of form changes
}) => {
  
  const dispatch = useDispatch();
  
  // Redux selectors
  const locations = useSelector(selectLocationsList);
  const visitPurposes = useSelector(selectVisitPurposesList);

  // Enhanced form state with new fields
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    phoneCountryCode: '961', // Lebanon default
    phoneType: 'Mobile',
    company: '',
    jobTitle: '',
    
    // Photo and Documents
    photo: null,
    photoFile: null,
    documents: [],
    documentFiles: [],
    
    // Location and Visit Purpose
    preferredLocationId: null,
    defaultVisitPurposeId: null,
    
    // Address Information - Enhanced Lebanon Structure
    address: {
      street1: '',
      street2: '',
      city: '',
      governorate: '', // Lebanon uses governorates
      postalCode: '',
      country: 'Lebanon', // Default to Lebanon
      addressType: 'Home'
    },
    
    // Personal Details
    dateOfBirth: '',
    governmentId: '',
    governmentIdType: 'Passport',
    nationality: '',
    language: 'en-US',
    timeZone: 'Asia/Beirut', // Lebanon timezone
    
    // Special Requirements
    dietaryRequirements: '',
    accessibilityRequirements: '',
    securityClearance: '',
    
    // Status & Notes
    isVip: false,
    notes: '',
    externalId: '',
    
    // Emergency Contacts
    emergencyContacts: []
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [formErrors, setFormErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [completedSteps, setCompletedSteps] = useState(new Set());
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedVisitPurpose, setSelectedVisitPurpose] = useState(null);

  // Lebanon-specific data
  const lebaneseGovernorates = [
    'Beirut',
    'Mount Lebanon',
    'North Lebanon',
    'South Lebanon',
    'Beqaa',
    'Akkar',
    'Baalbek-Hermel',
    'Nabatieh'
  ];

  // Invitation creation state
  const [createInvitation, setCreateInvitation] = useState(false);
  const [invitationData, setInvitationData] = useState({
    subject: '',
    scheduledStartTime: '',
    scheduledEndTime: '',
    locationId: null,
    visitPurposeId: null,
    message: '',
    requiresApproval: true,
    requiresEscort: false
  });
  const [invitationErrors, setInvitationErrors] = useState({});
  const [touchedInvitation, setTouchedInvitation] = useState({});

  // Form change tracking
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [initialFormData, setInitialFormData] = useState(null);

  // Load supporting data on mount
  useEffect(() => {
    dispatch(getLocations({ pageSize: 1000, isActive: true }));
    dispatch(getVisitPurposes({ pageSize: 1000, isActive: true }));
  }, [dispatch]);

  // Initialize form with initial data (enhanced)
  useEffect(() => {
    if (initialData) {
      console.log(initialData)
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        phoneCountryCode: initialData.phoneCountryCode || '961',
        phoneType: initialData.phoneType || 'Mobile',
        company: initialData.company || '',
        jobTitle: initialData.jobTitle || '',
        
        // Photo and documents
        photo: initialData.photo || null,
        photoFile: null, // Will be set if editing with existing photo
        documents: initialData.documents || [],
        documentFiles: [],
        
        // Location and visit purpose
        preferredLocationId: initialData.preferredLocationId || null,
        defaultVisitPurposeId: initialData.defaultVisitPurposeId || null,
        
        address: {
          street1: initialData.address?.street1 || '',
          street2: initialData.address?.street2 || '',
          city: initialData.address?.city || '',
          governorate: initialData.address?.state || initialData.address?.governorate || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || 'Lebanon',
          addressType: initialData.address?.addressType || 'Home'
        },
        dateOfBirth: initialData.dateOfBirth ? 
          new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        governmentId: initialData.governmentId || '',
        governmentIdType: initialData.governmentIdType || 'Passport',
        nationality: initialData.nationality || '',
        language: initialData.language || 'en-US',
        timeZone: initialData.timeZone || 'Asia/Beirut',
        dietaryRequirements: initialData.dietaryRequirements || '',
        accessibilityRequirements: initialData.accessibilityRequirements || '',
        securityClearance: initialData.securityClearance || '',
        isVip: initialData.isVip || false,
        notes: initialData.notes || '',
        externalId: initialData.externalId || '',
        emergencyContacts: initialData.emergencyContacts || []
      });

      // Set selected objects for autocomplete
      if (initialData.preferredLocation) {
        setSelectedLocation(initialData.preferredLocation);
      }
      if (initialData.defaultVisitPurpose) {
        setSelectedVisitPurpose(initialData.defaultVisitPurpose);
      }
      
      // Store initial state for change tracking
      setInitialFormData(JSON.parse(JSON.stringify({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        company: initialData.company || '',
        jobTitle: initialData.jobTitle || '',
        photo: initialData.photo || null,
        photoFile: null,
        documents: initialData.documents || [],
        documentFiles: [],
        preferredLocationId: initialData.preferredLocationId || null,
        defaultVisitPurposeId: initialData.defaultVisitPurposeId || null,
        address: {
          street1: initialData.address?.street1 || '',
          street2: initialData.address?.street2 || '',
          city: initialData.address?.city || '',
          state: initialData.address?.state || '',
          postalCode: initialData.address?.postalCode || '',
          country: initialData.address?.country || '',
          addressType: initialData.address?.addressType || 'Home'
        },
        dateOfBirth: initialData.dateOfBirth ? 
          new Date(initialData.dateOfBirth).toISOString().split('T')[0] : '',
        governmentId: initialData.governmentId || '',
        governmentIdType: initialData.governmentIdType || 'Passport',
        nationality: initialData.nationality || '',
        language: initialData.language || 'en-US',
        timeZone: initialData.timeZone || 'Asia/Beirut',
        dietaryRequirements: initialData.dietaryRequirements || '',
        accessibilityRequirements: initialData.accessibilityRequirements || '',
        securityClearance: initialData.securityClearance || '',
        isVip: initialData.isVip || false,
        notes: initialData.notes || '',
        externalId: initialData.externalId || '',
        emergencyContacts: initialData.emergencyContacts || []
      })));
    } else {
      // For new forms, set initial data after component renders
      setTimeout(() => {
        setInitialFormData(JSON.parse(JSON.stringify(formData)));
      }, 100);
    }
  }, [initialData]);

  // Load existing documents and upload info when editing
  useEffect(() => {
    const loadDocumentsAndUploadInfo = async () => {
      if (isEdit && initialData?.id) {
        try {
          // Load existing documents
          const documents = await visitorDocumentService.getVisitorDocuments(initialData.id);
          
          // Separate photos from other documents
          const photos = documents.filter(doc => doc.documentType === 'Photo');
          const otherDocuments = documents.filter(doc => doc.documentType !== 'Photo');
          
          setFormData(prev => ({
            ...prev,
            photo: photos.length > 0 ? photos[0] : prev.photo, // Use first photo as profile photo
            documents: [...prev.documents, ...otherDocuments] // Add to existing documents
          }));
        } catch (error) {
          console.error('Failed to load existing documents:', error);
          // Continue with form operation, document loading is not critical
        }
      }
    };

    loadDocumentsAndUploadInfo();
  }, [isEdit, initialData?.id]);

  // Track form changes
  useEffect(() => {
    if (!initialFormData) return;
    
    const hasChanges = JSON.stringify(formData) !== JSON.stringify(initialFormData) || 
                      (createInvitation && (invitationData.subject || invitationData.scheduledStartTime));
    
    setHasUnsavedChanges(hasChanges);
    
    // Notify parent component of form changes
    if (onFormChange) {
      onFormChange(hasChanges);
    }
  }, [formData, invitationData, createInvitation, initialFormData, onFormChange]);

  // Enhanced form steps configuration
  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: UserIcon,
      description: 'Name, contact details, and company information'
    },
    {
      id: 'photo_docs',
      title: 'Photo & Documents',
      icon: PhotoIcon,
      description: 'Upload visitor photo and identification documents'
    },
    {
      id: 'preferences',
      title: 'Preferences',
      icon: MapPinIcon,
      description: 'Default location and visit purpose preferences'
    },
    {
      id: 'address',
      title: 'Address',
      icon: GlobeAltIcon,
      description: 'Physical address information'
    },
    {
      id: 'personal',
      title: 'Personal Details',
      icon: IdentificationIcon,
      description: 'ID, nationality, and personal information'
    },
    {
      id: 'requirements',
      title: 'Special Requirements',
      icon: ShieldCheckIcon,
      description: 'Dietary, accessibility, and security requirements'
    },
    {
      id: 'emergency',
      title: 'Emergency Contacts',
      icon: UserGroupIcon,
      description: 'Emergency contact information (required)'
    },
    {
      id: 'invitation',
      title: 'Create Invitation',
      icon: ClipboardDocumentListIcon,
      description: 'Optionally create an invitation for this visitor'
    },
    {
      id: 'review',
      title: 'Review & Submit',
      icon: CheckCircleIcon,
      description: 'Review all information before submitting'
    }
  ];

  // Enhanced validation functions
  const validateStep = (stepId) => {
    const errors = {};

    switch (stepId) {
      case 'basic':
        if (!formData.firstName.trim()) {
          errors.firstName = 'First name is required';
        }
        if (!formData.lastName.trim()) {
          errors.lastName = 'Last name is required';
        }
        if (!formData.email.trim()) {
          errors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
          errors.email = 'Email format is invalid';
        }
        if (!formData.phoneNumber.trim()) {
          errors.phoneNumber = 'Phone number is required';
        }
        break;

      case 'photo_docs':
        // Photo is optional but validate if provided
        if (formData.photoFile && formData.photoFile.size > 5 * 1024 * 1024) {
          errors.photo = 'Photo must be less than 5MB';
        }
        // Documents validation
        if (formData.documentFiles.length > 5) {
          errors.documents = 'Maximum 5 documents allowed';
        }
        break;

      case 'preferences':
        // These are optional but can be validated if needed
        break;

      case 'address':
        if (formData.address.street1.trim() && !formData.address.city.trim()) {
          errors['address.city'] = 'City is required when address is provided';
        }
        if (formData.address.street1.trim() && !formData.address.country.trim()) {
          errors['address.country'] = 'Country is required when address is provided';
        }
        break;

      case 'personal':
        if (formData.dateOfBirth) {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = today.getFullYear() - birthDate.getFullYear();
          if (age < 16 || age > 120) {
            errors.dateOfBirth = 'Please enter a valid date of birth';
          }
        }
        break;

      case 'emergency':
        if (formData.emergencyContacts.length === 0) {
          errors.emergencyContacts = 'At least one emergency contact is required';
        } else {
          formData.emergencyContacts.forEach((contact, index) => {
            if (!contact.firstName.trim()) {
              errors[`emergencyContacts.${index}.firstName`] = 'First name is required';
            }
            if (!contact.lastName.trim()) {
              errors[`emergencyContacts.${index}.lastName`] = 'Last name is required';
            }
            if (!contact.phoneNumber.trim()) {
              errors[`emergencyContacts.${index}.phoneNumber`] = 'Phone number is required';
            }
            if (!contact.relationship.trim()) {
              errors[`emergencyContacts.${index}.relationship`] = 'Relationship is required';
            }
          });
        }
        break;

      case 'invitation':
        // Invitation validation is handled separately in validateInvitationForm
        break;
    }

    return errors;
  };

  // Enhanced file upload handlers with API integration
  const handlePhotoUpload = async (files) => {
    if (files.length > 0) {
      const file = files[0];
      
      // Always update local state first
      setFormData(prev => ({
        ...prev,
        photoFile: file
      }));

      // If editing existing visitor, upload to server immediately
      if (isEdit && initialData?.id) {
        try {
          const result = await visitorDocumentService.uploadVisitorPhoto(
            initialData.id,
            file,
            {
              description: 'Visitor profile photo',
              isSensitive: false,
              isRequired: false
            }
          );

          // Update with server response
          setFormData(prev => ({
            ...prev,
            photo: result,
            photoFile: file // Keep file for potential re-upload
          }));
        } catch (error) {
          console.error('Photo upload failed:', error);
          // Keep local file, will be uploaded when visitor is saved
        }
      }
    }
  };

  const handlePhotoRemove = async () => {
    const currentPhoto = formData.photo;
    
    // Remove from UI immediately
    setFormData(prev => ({
      ...prev,
      photo: null,
      photoFile: null
    }));

    // If photo was uploaded to server, delete it
    if (currentPhoto?.id && isEdit && initialData?.id) {
      try {
        await visitorDocumentService.deleteVisitorDocument(
          initialData.id,
          currentPhoto.id,
          false // soft delete
        );
      } catch (error) {
        console.error('Photo deletion failed:', error);
        // Photo removed from UI, but may still exist on server
      }
    }
  };

  const handleDocumentUpload = async (files) => {
    // Always update local state first
    setFormData(prev => ({
      ...prev,
      documentFiles: [...prev.documentFiles, ...files]
    }));

    // If editing existing visitor, upload to server immediately
    if (isEdit && initialData?.id) {
      try {
        const uploadPromises = files.map(file => 
          visitorDocumentService.uploadVisitorDocument(
            initialData.id,
            file,
            file.name,
            'Other', // Default document type
            {
              description: `Document: ${file.name}`,
              isSensitive: false,
              isRequired: false
            }
          )
        );

        const results = await Promise.allSettled(uploadPromises);
        const successful = results.filter(r => r.status === 'fulfilled').map(r => r.value);
        
        // Update documents list with successful uploads
        if (successful.length > 0) {
          setFormData(prev => ({
            ...prev,
            documents: [...prev.documents, ...successful]
          }));
        }
      } catch (error) {
        console.error('Document upload failed:', error);
        // Keep local files, will be uploaded when visitor is saved
      }
    }
  };

  const handleDocumentRemove = async (index) => {
    const documentToRemove = formData.documentFiles[index];
    const serverDocument = formData.documents.find(doc => 
      doc.originalFileName === documentToRemove?.name
    );
    
    // Remove from local state
    setFormData(prev => ({
      ...prev,
      documentFiles: prev.documentFiles.filter((_, i) => i !== index),
      documents: serverDocument ? prev.documents.filter(doc => doc.id !== serverDocument.id) : prev.documents
    }));

    // If document was uploaded to server, delete it
    if (serverDocument?.id && isEdit && initialData?.id) {
      try {
        await visitorDocumentService.deleteVisitorDocument(
          initialData.id,
          serverDocument.id,
          false // soft delete
        );
      } catch (error) {
        console.error('Document deletion failed:', error);
        // Document removed from UI, but may still exist on server
      }
    }
  };

  // Location and visit purpose handlers
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setFormData(prev => ({
      ...prev,
      preferredLocationId: location?.id || null
    }));
  };

  const handleVisitPurposeSelect = (visitPurpose) => {
    setSelectedVisitPurpose(visitPurpose);
    setFormData(prev => ({
      ...prev,
      defaultVisitPurposeId: visitPurpose?.id || null
    }));
  };

  // Helper to set preset invitation data from visitor preferences
  const setInvitationPresets = () => {
    if (formData.preferredLocationId && !invitationData.locationId) {
      handleInvitationChange('locationId', formData.preferredLocationId);
    }
    if (formData.defaultVisitPurposeId && !invitationData.visitPurposeId) {
      handleInvitationChange('visitPurposeId', formData.defaultVisitPurposeId);
    }
    if (!invitationData.subject) {
      const visitorName = `${formData.firstName} ${formData.lastName}`.trim();
      if (visitorName) {
        handleInvitationChange('subject', `Meeting with ${visitorName}`);
      }
    }
  };

  // Invitation form handlers
  const handleInvitationChange = (field, value) => {
    setInvitationData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (invitationErrors[field]) {
      setInvitationErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleInvitationBlur = (field) => {
    setTouchedInvitation(prev => ({
      ...prev,
      [field]: true
    }));
  };

  const validateInvitationField = (field, value) => {
    switch (field) {
      case 'subject':
        if (!value?.trim()) return 'Subject is required';
        if (value.length > 200) return 'Subject must be less than 200 characters';
        break;
      case 'scheduledStartTime':
        if (!value) return 'Start time is required';
        if (new Date(value) <= new Date()) return 'Start time must be in the future';
        break;
      case 'scheduledEndTime':
        if (!value) return 'End time is required';
        if (invitationData.scheduledStartTime && new Date(value) <= new Date(invitationData.scheduledStartTime)) {
          return 'End time must be after start time';
        }
        break;
      default:
        return null;
    }
    return null;
  };

  const validateInvitationForm = () => {
    if (!createInvitation) return {};
    
    const errors = {};
    const requiredFields = ['subject', 'scheduledStartTime', 'scheduledEndTime'];
    
    requiredFields.forEach(field => {
      const error = validateInvitationField(field, invitationData[field]);
      if (error) {
        errors[field] = error;
      }
    });

    return errors;
  };

  // Form field change handlers
  const handleChange = (field, value) => {
    if (field.includes('.')) {
      // Handle nested fields (like address.street1)
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }

    // Clear field error
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));
  };

  // Emergency contact handlers
  const addEmergencyContact = () => {
    const newContact = {
      firstName: '',
      lastName: '',
      phoneNumber: '',
      email: '',
      relationship: '',
      isPrimary: formData.emergencyContacts.length === 0
    };
    
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
  };

  const removeEmergencyContact = (index) => {
    setFormData(prev => {
      const updatedContacts = prev.emergencyContacts.filter((_, i) => i !== index);
      // If we removed the primary contact, make the first one primary
      if (updatedContacts.length > 0 && !updatedContacts.some(c => c.isPrimary)) {
        updatedContacts[0].isPrimary = true;
      }
      return {
        ...prev,
        emergencyContacts: updatedContacts
      };
    });
  };

  const updateEmergencyContact = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map((contact, i) => 
        i === index 
          ? { ...contact, [field]: value }
          : field === 'isPrimary' && value 
            ? { ...contact, isPrimary: false }
            : contact
      )
    }));
  };

  // Step navigation
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const goToNextStep = () => {
    const currentStepId = steps[currentStep].id;
    let stepErrors = validateStep(currentStepId);
    
    // Special handling for invitation step
    if (currentStepId === 'invitation') {
      const invitationValidationErrors = validateInvitationForm();
      if (Object.keys(invitationValidationErrors).length > 0) {
        setInvitationErrors(invitationValidationErrors);
        stepErrors = { ...stepErrors, ...invitationValidationErrors };
      }
    }
    
    if (Object.keys(stepErrors).length === 0) {
      setCompletedSteps(prev => new Set([...prev, currentStepId]));
      setFormErrors({});
      setInvitationErrors({});
      goToStep(currentStep + 1);
    } else {
      setFormErrors(stepErrors);
      Object.keys(stepErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
        if (currentStepId === 'invitation') {
          setTouchedInvitation(prev => ({ ...prev, [field]: true }));
        }
      });
    }
  };

  const goToPreviousStep = () => {
    goToStep(currentStep - 1);
  };

  // Form submission
  const handleSubmit = async () => {
    // Validate all steps
    const allErrors = {};
    steps.forEach(step => {
      if (step.id !== 'review') {
        const stepErrors = validateStep(step.id);
        Object.assign(allErrors, stepErrors);
      }
    });

    // Validate invitation if enabled
    const invitationValidationErrors = validateInvitationForm();
    if (Object.keys(invitationValidationErrors).length > 0) {
      setInvitationErrors(invitationValidationErrors);
      Object.assign(allErrors, invitationValidationErrors);
    }

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      // Go to first step with errors
      const errorStep = steps.findIndex(step => 
        Object.keys(allErrors).some(field => 
          validateStep(step.id)[field]
        )
      );
      if (errorStep !== -1) {
        setCurrentStep(errorStep);
      }
      return;
    }

    // Prepare submission data - clean up form data for backend
    const submissionData = {
      ...formData
    };
    
    // Remove file objects from submission data as they'll be handled separately
    delete submissionData.photoFile;
    delete submissionData.documentFiles;

    // Prepare invitation data if creating invitation
    const invitationSubmissionData = createInvitation ? {
      ...invitationData,
      scheduledStartTime: new Date(invitationData.scheduledStartTime).toISOString(),
      scheduledEndTime: new Date(invitationData.scheduledEndTime).toISOString(),
      type: 'Single',
      expectedVisitorCount: 1
    } : null;

    try {
      if (isEdit) {
        // For editing, use the parent's onSubmit method
        await onSubmit(submissionData, invitationSubmissionData);
      } else {
        // For creating new visitor, use enhanced service method
        const result = await visitorService.createVisitorWithAssets(
          submissionData,
          formData.photoFile,
          formData.documentFiles,
          invitationSubmissionData
        );
        
        // Call parent's onSubmit with the result for any additional handling
        if (onSubmit) {
          await onSubmit(result, invitationSubmissionData);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      throw error; // Re-throw to let parent handle error display
    }
  };

  // Render step content
  const renderStepContent = () => {
    const currentStepId = steps[currentStep].id;

    switch (currentStepId) {
      case 'basic':
        return renderBasicInformation();
      case 'photo_docs':
        return renderPhotoAndDocuments();
      case 'preferences':
        return renderPreferences();
      case 'address':
        return renderAddress();
      case 'personal':
        return renderPersonalDetails();
      case 'requirements':
        return renderSpecialRequirements();
      case 'emergency':
        return renderEmergencyContacts();
      case 'invitation':
        return renderInvitationForm();
      case 'review':
        return renderReview();
      default:
        return null;
    }
  };

  // Step render methods
  const renderBasicInformation = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="First Name"
          type="text"
          value={formData.firstName}
          onChange={(e) => handleChange('firstName', e.target.value)}
          onBlur={() => handleBlur('firstName')}
          error={touched.firstName ? formErrors.firstName : undefined}
          required
          placeholder="Enter first name"
        />

        <Input
          label="Last Name"
          type="text"
          value={formData.lastName}
          onChange={(e) => handleChange('lastName', e.target.value)}
          onBlur={() => handleBlur('lastName')}
          error={touched.lastName ? formErrors.lastName : undefined}
          required
          placeholder="Enter last name"
        />

        <Input
          label="Email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          onBlur={() => handleBlur('email')}
          error={touched.email ? formErrors.email : undefined}
          required
          placeholder="Enter email address"
        />

        {/* Enhanced Phone Number - Lebanon Focused */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Phone Number
          </label>
          
          <div className="flex space-x-2">
            {/* Country Code Selector - Lebanon First */}
            <select
              value={formData.phoneCountryCode}
              onChange={(e) => handleChange('phoneCountryCode', e.target.value)}
              onBlur={() => handleBlur('phoneCountryCode')}
              className="w-32 px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="961">🇱🇧 +961</option>
              <option value="963">🇸🇾 +963</option>
              <option value="962">🇯🇴 +962</option>
              <option value="972">🇮🇱 +972</option>
              <option value="90">🇹🇷 +90</option>
              <option value="20">🇪🇬 +20</option>
              <option value="966">🇸🇦 +966</option>
              <option value="971">🇦🇪 +971</option>
              <option value="965">🇰🇼 +965</option>
              <option value="974">🇶🇦 +974</option>
              <option value="1">🇺🇸 +1</option>
              <option value="44">🇬🇧 +44</option>
              <option value="33">🇫🇷 +33</option>
              <option value="49">🇩🇪 +49</option>
              <option value="39">🇮🇹 +39</option>
            </select>

            {/* Phone Number Input */}
            <div className="flex-1">
              <Input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) => handleChange('phoneNumber', e.target.value)}
                onBlur={() => handleBlur('phoneNumber')}
                error={touched.phoneNumber ? formErrors.phoneNumber : undefined}
                required
                placeholder="71 123 456"
              />
            </div>

            {/* Phone Type Selector */}
            <select
              value={formData.phoneType}
              onChange={(e) => handleChange('phoneType', e.target.value)}
              onBlur={() => handleBlur('phoneType')}
              className="w-32 px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Mobile">📱 Mobile</option>
              <option value="Landline">☎️ Landline</option>
              <option value="Unknown">❓ Unknown</option>
            </select>
          </div>
          
          {touched.phoneNumber && formErrors.phoneNumber && (
            <p className="text-red-600 text-sm mt-1 flex items-center">
              <svg className="w-4 h-4 mr-1.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              {formErrors.phoneNumber}
            </p>
          )}
        </div>

        <Input
          label="Company"
          type="text"
          value={formData.company}
          onChange={(e) => handleChange('company', e.target.value)}
          onBlur={() => handleBlur('company')}
          error={touched.company ? formErrors.company : undefined}
          placeholder="Enter company name"
        />

        <Input
          label="Job Title"
          type="text"
          value={formData.jobTitle}
          onChange={(e) => handleChange('jobTitle', e.target.value)}
          onBlur={() => handleBlur('jobTitle')}
          error={touched.jobTitle ? formErrors.jobTitle : undefined}
          placeholder="Enter job title"
        />
      </div>

      <div className="flex items-center space-x-3">
        <input
          type="checkbox"
          id="isVip"
          checked={formData.isVip}
          onChange={(e) => handleChange('isVip', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="isVip" className="flex items-center space-x-2 text-sm font-medium text-gray-700">
          <StarIconSolid className="w-4 h-4 text-yellow-500" />
          <span>VIP Visitor</span>
        </label>
      </div>
    </div>
  );

  const renderPhotoAndDocuments = () => (
    <div className="space-y-8">
      {/* Photo Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <PhotoIcon className="w-5 h-5" />
          <span>Visitor Photo</span>
        </h3>
        <FileUpload
          onFileSelect={handlePhotoUpload}
          onFileRemove={handlePhotoRemove}
          accept="image/*"
          maxSize={5 * 1024 * 1024} // 5MB
          maxFiles={1}
          files={formData.photoFile ? [formData.photoFile] : []}
          label="Upload Photo"
          description="Upload a clear photo of the visitor for identification"
          error={touched.photo ? formErrors.photo : undefined}
          className="max-w-md"
        />
        <p className="text-sm text-gray-500 mt-2">
          Recommended: High-quality headshot, JPG or PNG format, max 5MB
        </p>
      </div>

      {/* Document Upload */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <DocumentTextIcon className="w-5 h-5" />
          <span>Identification Documents</span>
        </h3>
        <FileUpload
          onFileSelect={handleDocumentUpload}
          onFileRemove={handleDocumentRemove}
          accept="image/*,application/pdf,.doc,.docx"
          maxSize={10 * 1024 * 1024} // 10MB
          maxFiles={5}
          files={formData.documentFiles}
          label="Upload Documents"
          description="Upload ID, passport, or other identification documents"
          error={touched.documents ? formErrors.documents : undefined}
        />
        <p className="text-sm text-gray-500 mt-2">
          Accepted formats: PDF, DOC, DOCX, JPG, PNG. Max 5 files, 10MB each.
        </p>
      </div>
    </div>
  );

  const renderPreferences = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-medium text-gray-900">Default Preferences</h3>
        <p className="text-gray-600">Set default location and visit purpose for faster invitation creation</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Preferred Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Location
          </label>
          <AutocompleteInput
            options={locations || []}
            value={selectedLocation}
            onChange={handleLocationSelect}
            getOptionLabel={(location) => location.name}
            getOptionDescription={(location) => location.description}
            placeholder="Select default location..."
            error={touched.preferredLocationId ? formErrors.preferredLocationId : undefined}
          />
          <p className="text-sm text-gray-500 mt-1">
            The location this visitor typically visits
          </p>
        </div>

        {/* Default Visit Purpose */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Default Visit Purpose
          </label>
          <AutocompleteInput
            options={visitPurposes || []}
            value={selectedVisitPurpose}
            onChange={handleVisitPurposeSelect}
            getOptionLabel={(purpose) => purpose.name}
            getOptionDescription={(purpose) => purpose.description}
            placeholder="Select default visit purpose..."
            error={touched.defaultVisitPurposeId ? formErrors.defaultVisitPurposeId : undefined}
          />
          <p className="text-sm text-gray-500 mt-1">
            The typical reason for this visitor's visits
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <div className="flex items-start space-x-3">
          <ClipboardDocumentListIcon className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-blue-900">Why set preferences?</h4>
            <p className="text-sm text-blue-700 mt-1">
              Default preferences will be automatically selected when creating invitations for this visitor, 
              making the invitation process faster and more consistent.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
  const renderAddress = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="md:col-span-2">
          <Input
            label="Street Address Line 1"
            type="text"
            value={formData.address.street1}
            onChange={(e) => handleChange('address.street1', e.target.value)}
            onBlur={() => handleBlur('address.street1')}
            error={touched['address.street1'] ? formErrors['address.street1'] : undefined}
            placeholder="Enter street address"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Street Address Line 2"
            type="text"
            value={formData.address.street2}
            onChange={(e) => handleChange('address.street2', e.target.value)}
            onBlur={() => handleBlur('address.street2')}
            error={touched['address.street2'] ? formErrors['address.street2'] : undefined}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <Input
          label="City"
          type="text"
          value={formData.address.city}
          onChange={(e) => handleChange('address.city', e.target.value)}
          onBlur={() => handleBlur('address.city')}
          error={touched['address.city'] ? formErrors['address.city'] : undefined}
          placeholder="e.g., Beirut, Tripoli, Sidon"
        />

        {/* Lebanese Governorates */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Governorate
          </label>
          <select
            value={formData.address.governorate}
            onChange={(e) => handleChange('address.governorate', e.target.value)}
            onBlur={() => handleBlur('address.governorate')}
            className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Governorate</option>
            {lebaneseGovernorates.map(governorate => (
              <option key={governorate} value={governorate}>
                {governorate}
              </option>
            ))}
          </select>
          {touched['address.governorate'] && formErrors['address.governorate'] && (
            <p className="text-red-600 text-sm mt-1">{formErrors['address.governorate']}</p>
          )}
        </div>

        <Input
          label="Postal Code (Optional)"
          type="text"
          value={formData.address.postalCode}
          onChange={(e) => handleChange('address.postalCode', e.target.value)}
          onBlur={() => handleBlur('address.postalCode')}
          error={touched['address.postalCode'] ? formErrors['address.postalCode'] : undefined}
          placeholder="e.g., 1107-2180"
          helperText="Lebanon postal codes are optional"
        />

        {/* Enhanced Country Selector - Lebanon and Region First */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            Country
          </label>
          <select
            value={formData.address.country}
            onChange={(e) => handleChange('address.country', e.target.value)}
            onBlur={() => handleBlur('address.country')}
            className="block w-full px-4 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Lebanon">🇱🇧 Lebanon</option>
            <option value="">--- Middle East ---</option>
            <option value="Syria">🇸🇾 Syria</option>
            <option value="Jordan">🇯🇴 Jordan</option>
            <option value="Israel">🇮🇱 Israel</option>
            <option value="Turkey">🇹🇷 Turkey</option>
            <option value="Cyprus">🇨🇾 Cyprus</option>
            <option value="Egypt">🇪🇬 Egypt</option>
            <option value="Saudi Arabia">🇸🇦 Saudi Arabia</option>
            <option value="United Arab Emirates">🇦🇪 United Arab Emirates</option>
            <option value="Kuwait">🇰🇼 Kuwait</option>
            <option value="Qatar">🇶🇦 Qatar</option>
            <option value="Bahrain">🇧🇭 Bahrain</option>
            <option value="Oman">🇴🇲 Oman</option>
            <option value="Iraq">🇮🇶 Iraq</option>
            <option value="Iran">🇮🇷 Iran</option>
            <option value="">--- International ---</option>
            <option value="United States">🇺🇸 United States</option>
            <option value="Canada">🇨🇦 Canada</option>
            <option value="United Kingdom">🇬🇧 United Kingdom</option>
            <option value="France">🇫🇷 France</option>
            <option value="Germany">🇩🇪 Germany</option>
            <option value="Italy">🇮🇹 Italy</option>
            <option value="Australia">🇦🇺 Australia</option>
            <option value="Brazil">🇧🇷 Brazil</option>
            <option value="Other">🌍 Other</option>
          </select>
          {touched['address.country'] && formErrors['address.country'] && (
            <p className="text-red-600 text-sm mt-1">{formErrors['address.country']}</p>
          )}
        </div>
      </div>

      {/* Address Type Selector */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1.5">Address Type</label>
        <select
          value={formData.address.addressType}
          onChange={(e) => handleChange('address.addressType', e.target.value)}
          onBlur={() => handleBlur('address.addressType')}
          className="w-full md:w-48 px-3 py-2.5 text-sm border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="Home">🏠 Home</option>
          <option value="Work">🏢 Work</option>
          <option value="Billing">💳 Billing</option>
          <option value="Shipping">📦 Shipping</option>
          <option value="Other">📍 Other</option>
        </select>
      </div>
    </div>
  );

  const renderPersonalDetails = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Date of Birth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => handleChange('dateOfBirth', e.target.value)}
          onBlur={() => handleBlur('dateOfBirth')}
          error={touched.dateOfBirth ? formErrors.dateOfBirth : undefined}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Government ID Type
          </label>
          <select
            value={formData.governmentIdType}
            onChange={(e) => handleChange('governmentIdType', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Passport">Passport</option>
            <option value="DriverLicense">Driver's License</option>
            <option value="NationalId">National ID</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <Input
          label="Government ID Number"
          type="text"
          value={formData.governmentId}
          onChange={(e) => handleChange('governmentId', e.target.value)}
          onBlur={() => handleBlur('governmentId')}
          error={touched.governmentId ? formErrors.governmentId : undefined}
          placeholder="Enter ID number"
        />

        <Input
          label="Nationality"
          type="text"
          value={formData.nationality}
          onChange={(e) => handleChange('nationality', e.target.value)}
          onBlur={() => handleBlur('nationality')}
          error={touched.nationality ? formErrors.nationality : undefined}
          placeholder="Enter nationality"
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Preferred Language
          </label>
          <select
            value={formData.language}
            onChange={(e) => handleChange('language', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="en-US">English</option>
            <option value="es-ES">Spanish</option>
            <option value="fr-FR">French</option>
            <option value="de-DE">German</option>
            <option value="zh-CN">Chinese</option>
            <option value="ja-JP">Japanese</option>
            <option value="ar-SA">Arabic</option>
          </select>
        </div>

        <Input
          label="External ID"
          type="text"
          value={formData.externalId}
          onChange={(e) => handleChange('externalId', e.target.value)}
          onBlur={() => handleBlur('externalId')}
          error={touched.externalId ? formErrors.externalId : undefined}
          placeholder="Employee ID, customer number, etc."
        />
      </div>
    </div>
  );

  const renderSpecialRequirements = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Dietary Requirements
        </label>
        <textarea
          value={formData.dietaryRequirements}
          onChange={(e) => handleChange('dietaryRequirements', e.target.value)}
          onBlur={() => handleBlur('dietaryRequirements')}
          rows={3}
          placeholder="Any dietary restrictions, allergies, or special meal requirements..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Accessibility Requirements
        </label>
        <textarea
          value={formData.accessibilityRequirements}
          onChange={(e) => handleChange('accessibilityRequirements', e.target.value)}
          onBlur={() => handleBlur('accessibilityRequirements')}
          rows={3}
          placeholder="Wheelchair access, hearing assistance, or other accessibility needs..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Security Clearance
        </label>
        <Input
          type="text"
          value={formData.securityClearance}
          onChange={(e) => handleChange('securityClearance', e.target.value)}
          onBlur={() => handleBlur('securityClearance')}
          error={touched.securityClearance ? formErrors.securityClearance : undefined}
          placeholder="Security clearance level, if applicable"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Additional Notes
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) => handleChange('notes', e.target.value)}
          onBlur={() => handleBlur('notes')}
          rows={4}
          placeholder="Any additional information about this visitor..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );

  const renderEmergencyContacts = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Emergency Contacts</h3>
          <p className="text-gray-600">At least one emergency contact is required</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={addEmergencyContact}
          icon={<PlusIcon className="w-4 h-4" />}
        >
          Add Contact
        </Button>
      </div>

      {formErrors.emergencyContacts && (
        <div className="text-sm text-red-600">{formErrors.emergencyContacts}</div>
      )}

      <div className="space-y-4">
        {formData.emergencyContacts.map((contact, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">
                  Contact {index + 1}
                </span>
                {contact.isPrimary && (
                  <Badge variant="primary" size="xs">Primary</Badge>
                )}
              </div>
              {formData.emergencyContacts.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEmergencyContact(index)}
                  className="text-red-600 hover:text-red-800"
                  icon={<TrashIcon className="w-4 h-4" />}
                />
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="First Name"
                type="text"
                value={contact.firstName}
                onChange={(e) => updateEmergencyContact(index, 'firstName', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.firstName`]}
                required
                placeholder="Enter first name"
              />

              <Input
                label="Last Name"
                type="text"
                value={contact.lastName}
                onChange={(e) => updateEmergencyContact(index, 'lastName', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.lastName`]}
                required
                placeholder="Enter last name"
              />

              <Input
                label="Phone Number"
                type="tel"
                value={contact.phoneNumber}
                onChange={(e) => updateEmergencyContact(index, 'phoneNumber', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.phoneNumber`]}
                required
                placeholder="Enter phone number"
              />

              <Input
                label="Email"
                type="email"
                value={contact.email}
                onChange={(e) => updateEmergencyContact(index, 'email', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.email`]}
                placeholder="Enter email (optional)"
              />

              <Input
                label="Relationship"
                type="text"
                value={contact.relationship}
                onChange={(e) => updateEmergencyContact(index, 'relationship', e.target.value)}
                error={formErrors[`emergencyContacts.${index}.relationship`]}
                required
                placeholder="e.g., Spouse, Parent, Friend"
              />

              <div className="flex items-center space-x-3 mt-6">
                <input
                  type="checkbox"
                  id={`primary-${index}`}
                  checked={contact.isPrimary}
                  onChange={(e) => updateEmergencyContact(index, 'isPrimary', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`primary-${index}`} className="text-sm font-medium text-gray-700">
                  Primary Contact
                </label>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {formData.emergencyContacts.length === 0 && (
        <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
          <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No emergency contacts</h3>
          <p className="mt-1 text-sm text-gray-500">
            Add at least one emergency contact for safety purposes.
          </p>
          <div className="mt-6">
            <Button
              variant="primary"
              onClick={addEmergencyContact}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              Add First Contact
            </Button>
          </div>
        </div>
      )}
    </div>
  );

  const renderInvitationForm = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Create Invitation (Optional)</h3>
        <p className="text-gray-600">You can create an invitation for this visitor immediately after creating their profile</p>
      </div>

      {/* Enable/Disable Invitation Creation */}
      <Card className="p-6">
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="createInvitation"
            checked={createInvitation}
            onChange={(e) => {
              const enabled = e.target.checked;
              setCreateInvitation(enabled);
              if (enabled) {
                // Auto-fill invitation data from visitor preferences
                setTimeout(() => setInvitationPresets(), 100);
              }
            }}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="createInvitation" className="text-sm font-medium text-gray-900">
            Create an invitation for this visitor
          </label>
        </div>
        
        {!createInvitation && (
          <p className="mt-2 text-sm text-gray-500">
            You can always create invitations later from the visitor's profile or the invitations page.
          </p>
        )}
      </Card>

      {/* Invitation Form Fields */}
      <AnimatePresence>
        {createInvitation && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ClipboardDocumentListIcon className="w-6 h-6 text-blue-600" />
                <h4 className="text-lg font-medium text-gray-900">Invitation Details</h4>
              </div>

              <div className="space-y-6">
                {/* Subject */}
                <Input
                  label="Subject"
                  type="text"
                  value={invitationData.subject}
                  onChange={(e) => handleInvitationChange('subject', e.target.value)}
                  onBlur={() => handleInvitationBlur('subject')}
                  error={touchedInvitation.subject ? invitationErrors.subject : undefined}
                  placeholder="Meeting with John Doe"
                  required
                />

                {/* Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Input
                      label="Start Date & Time"
                      type="datetime-local"
                      value={invitationData.scheduledStartTime}
                      onChange={(e) => handleInvitationChange('scheduledStartTime', e.target.value)}
                      onBlur={() => handleInvitationBlur('scheduledStartTime')}
                      error={touchedInvitation.scheduledStartTime ? invitationErrors.scheduledStartTime : undefined}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div>
                    <Input
                      label="End Date & Time"
                      type="datetime-local"
                      value={invitationData.scheduledEndTime}
                      onChange={(e) => handleInvitationChange('scheduledEndTime', e.target.value)}
                      onBlur={() => handleInvitationBlur('scheduledEndTime')}
                      error={touchedInvitation.scheduledEndTime ? invitationErrors.scheduledEndTime : undefined}
                      min={invitationData.scheduledStartTime || new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                </div>

                {/* Location & Purpose */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location
                    </label>
                    <AutocompleteInput
                      options={locations}
                      value={locations.find(l => l.id === invitationData.locationId)}
                      onChange={(location) => handleInvitationChange('locationId', location?.id || null)}
                      getOptionLabel={(location) => location.name}
                      getOptionDescription={(location) => location.description}
                      placeholder="Select location..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Visit Purpose
                    </label>
                    <AutocompleteInput
                      options={visitPurposes}
                      value={visitPurposes.find(p => p.id === invitationData.visitPurposeId)}
                      onChange={(purpose) => handleInvitationChange('visitPurposeId', purpose?.id || null)}
                      getOptionLabel={(purpose) => purpose.name}
                      getOptionDescription={(purpose) => purpose.description}
                      placeholder="Select purpose..."
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Message
                  </label>
                  <textarea
                    value={invitationData.message}
                    onChange={(e) => handleInvitationChange('message', e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Optional message for the visitor..."
                  />
                </div>

                {/* Requirements */}
                <div className="space-y-3">
                  <h5 className="text-sm font-medium text-gray-900">Requirements</h5>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={invitationData.requiresApproval}
                        onChange={(e) => handleInvitationChange('requiresApproval', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Requires approval</span>
                    </label>
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={invitationData.requiresEscort}
                        onChange={(e) => handleInvitationChange('requiresEscort', e.target.checked)}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="text-sm text-gray-700">Requires escort</span>
                    </label>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-medium text-gray-900">Review Information</h3>
        <p className="text-gray-600">Please review all information before submitting</p>
      </div>

      {/* Basic Information Review */}
      <Card className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <UserIcon className="w-5 h-5" />
          <span>Basic Information</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Name:</span>
            <span className="ml-2 text-gray-900">{formData.firstName} {formData.lastName}</span>
            {formData.isVip && <StarIconSolid className="inline w-4 h-4 text-yellow-500 ml-2" />}
          </div>
          <div>
            <span className="font-medium text-gray-700">Email:</span>
            <span className="ml-2 text-gray-900">{formData.email}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Phone:</span>
            <span className="ml-2 text-gray-900">{formData.phoneNumber}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Company:</span>
            <span className="ml-2 text-gray-900">{formData.company || 'Not specified'}</span>
          </div>
        </div>
      </Card>

      {/* Photo and Documents Review */}
      {(formData.photoFile || formData.documentFiles.length > 0) && (
        <Card className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <PhotoIcon className="w-5 h-5" />
            <span>Photo & Documents</span>
          </h4>
          <div className="space-y-4">
            {formData.photoFile && (
              <div>
                <span className="font-medium text-gray-700">Photo:</span>
                <span className="ml-2 text-gray-900">{formData.photoFile.name}</span>
              </div>
            )}
            {formData.documentFiles.length > 0 && (
              <div>
                <span className="font-medium text-gray-700">Documents:</span>
                <ul className="ml-2 mt-1 space-y-1">
                  {formData.documentFiles.map((file, index) => (
                    <li key={index} className="text-gray-900 text-sm">• {file.name}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Preferences Review */}
      {(selectedLocation || selectedVisitPurpose) && (
        <Card className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <MapPinIcon className="w-5 h-5" />
            <span>Preferences</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {selectedLocation && (
              <div>
                <span className="font-medium text-gray-700">Preferred Location:</span>
                <span className="ml-2 text-gray-900">{selectedLocation.name}</span>
              </div>
            )}
            {selectedVisitPurpose && (
              <div>
                <span className="font-medium text-gray-700">Default Visit Purpose:</span>
                <span className="ml-2 text-gray-900">{selectedVisitPurpose.name}</span>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Emergency Contacts Review */}
      <Card className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
          <UserGroupIcon className="w-5 h-5" />
          <span>Emergency Contacts</span>
        </h4>
        <div className="space-y-3">
          {formData.emergencyContacts.map((contact, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-gray-900">
                  {contact.firstName} {contact.lastName}
                </span>
                {contact.isPrimary && <Badge variant="primary" size="xs">Primary</Badge>}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                <div>Phone: {contact.phoneNumber}</div>
                <div>Relationship: {contact.relationship}</div>
                {contact.email && <div>Email: {contact.email}</div>}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Invitation Review */}
      {createInvitation && (
        <Card className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4 flex items-center space-x-2">
            <ClipboardDocumentListIcon className="w-5 h-5" />
            <span>Invitation Details</span>
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Subject:</span>
              <span className="ml-2 text-gray-900">{invitationData.subject || 'Not specified'}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Start Time:</span>
              <span className="ml-2 text-gray-900">
                {invitationData.scheduledStartTime 
                  ? new Date(invitationData.scheduledStartTime).toLocaleString()
                  : 'Not specified'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">End Time:</span>
              <span className="ml-2 text-gray-900">
                {invitationData.scheduledEndTime 
                  ? new Date(invitationData.scheduledEndTime).toLocaleString()
                  : 'Not specified'
                }
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Location:</span>
              <span className="ml-2 text-gray-900">
                {locations.find(l => l.id === invitationData.locationId)?.name || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Purpose:</span>
              <span className="ml-2 text-gray-900">
                {visitPurposes.find(p => p.id === invitationData.visitPurposeId)?.name || 'Not specified'}
              </span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Requirements:</span>
              <div className="ml-2 flex space-x-3">
                {invitationData.requiresApproval && (
                  <Badge variant="warning" size="sm">Requires Approval</Badge>
                )}
                {invitationData.requiresEscort && (
                  <Badge variant="info" size="sm">Requires Escort</Badge>
                )}
                {!invitationData.requiresApproval && !invitationData.requiresEscort && (
                  <span className="text-gray-500">None</span>
                )}
              </div>
            </div>
          </div>
          {invitationData.message && (
            <div className="mt-4">
              <span className="font-medium text-gray-700">Message:</span>
              <p className="mt-1 text-gray-900 text-sm bg-gray-50 p-3 rounded-lg">{invitationData.message}</p>
            </div>
          )}
        </Card>
      )}
    </div>
  );

  // Step progress indicator
  const renderStepProgress = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors duration-200 ${
                index === currentStep
                  ? 'border-blue-600 bg-blue-600 text-white'
                  : completedSteps.has(step.id)
                  ? 'border-green-600 bg-green-600 text-white'
                  : 'border-gray-300 bg-white text-gray-500'
              }`}
            >
              {completedSteps.has(step.id) ? (
                <CheckCircleIcon className="w-6 h-6" />
              ) : (
                <step.icon className="w-5 h-5" />
              )}
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-1 mx-2 transition-colors duration-200 ${
                  completedSteps.has(step.id) ? 'bg-green-600' : 'bg-gray-300'
                }`}
              />
            )}
          </div>
        ))}
      </div>
      <div className="mt-4 text-center">
        <h2 className="text-xl font-semibold text-gray-900">{steps[currentStep].title}</h2>
        <p className="text-gray-600">{steps[currentStep].description}</p>
      </div>
    </div>
  );

  // Main render
  return (
    <div className="max-w-4xl mx-auto">
      {/* Error Display */}
      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-sm text-red-700">
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

      {/* Step Progress */}
      {renderStepProgress()}

      {/* Form Content */}
      <Card className="p-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderStepContent()}
          </motion.div>
        </AnimatePresence>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStep === 0 ? onCancel : goToPreviousStep}
          disabled={loading}
        >
          {currentStep === 0 ? 'Cancel' : 'Previous'}
        </Button>

        <div className="flex space-x-3">
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={goToNextStep}
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              loading={loading}
              disabled={loading}
            >
              {isEdit 
                ? 'Update Visitor' 
                : createInvitation 
                  ? 'Create Visitor & Invitation' 
                  : 'Create Visitor'
              }
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

// PropTypes validation
VisitorForm.propTypes = {
  initialData: PropTypes.object,
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

export default VisitorForm;