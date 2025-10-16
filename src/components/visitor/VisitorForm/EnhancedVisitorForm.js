// src/components/visitor/VisitorForm/EnhancedVisitorForm.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux imports
import { getLocations } from '../../../store/slices/locationsSlice';
import { getVisitPurposes } from '../../../store/slices/visitPurposesSlice';
import { selectLocationsList } from '../../../store/selectors/locationSelectors';
import { selectVisitPurposesList } from '../../../store/selectors/visitPurposeSelectors';

// Services
import visitorDocumentService from '../../../services/visitorDocumentService';
import visitorNoteService from '../../../services/visitorNoteService';

// Components
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Badge from '../../common/Badge/Badge';
import Card from '../../common/Card/Card';
import PhotoUpload from '../../common/PhotoUpload/PhotoUpload';
import FileUpload from '../../common/FileUpload/FileUpload';
import AutocompleteInput from '../../common/AutocompleteInput/AutocompleteInput';

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
  CameraIcon,
  FolderIcon,
  MapPinIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Enhanced Visitor Form Component
 * Includes photo upload, document management, location and visit purpose selection
 * Multi-step form with comprehensive visitor management
 */
const EnhancedVisitorForm = ({
  initialData = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null,
  isEdit = false
}) => {
  const dispatch = useDispatch();

  // Redux selectors
  const locations = useSelector(selectLocationsList);
  const visitPurposes = useSelector(selectVisitPurposesList);
  
  // Load supporting data
  useEffect(() => {
    dispatch(getLocations({ pageSize: 1000, isActive: true }));
    dispatch(getVisitPurposes({ pageSize: 1000, isActive: true }));
  }, [dispatch]);

  // Form state
  const [formData, setFormData] = useState({
    // Basic Information
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    company: '',
    jobTitle: '',
    
    // Photo
    photo: null,
    
    // Documents
    documents: [],
    
    // Location & Purpose
    preferredLocationId: null,
    frequentLocations: [],
    commonVisitPurposeId: null,
    
    // Address Information
    address: {
      street1: '',
      street2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      addressType: 'Home'
    },
    
    // Personal Details
    dateOfBirth: '',
    governmentId: '',
    governmentIdType: 'Passport',
    nationality: '',
    language: 'en-US',
    
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
  
  // Document and photo management state
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [documentError, setDocumentError] = useState(null);
  const [photoError, setPhotoError] = useState(null);
  const [uploadInfo, setUploadInfo] = useState(null);

  // Form steps configuration
  const steps = [
    {
      id: 'basic',
      title: 'Basic Information',
      icon: UserIcon,
      description: 'Name, contact details, and company information'
    },
    {
      id: 'photo_documents',
      title: 'Photo & Documents',
      icon: CameraIcon,
      description: 'Profile photo and identification documents'
    },
    {
      id: 'location_purpose',
      title: 'Location & Purpose',
      icon: MapPinIcon,
      description: 'Preferred locations and common visit purposes'
    },
    {
      id: 'address',
      title: 'Address',
      icon: GlobeAltIcon,
      description: 'Contact address information'
    },
    {
      id: 'personal',
      title: 'Personal Details',
      icon: IdentificationIcon,
      description: 'Government ID, nationality, and personal information'
    },
    {
      id: 'requirements',
      title: 'Special Requirements',
      icon: ShieldCheckIcon,
      description: 'Dietary, accessibility, and security requirements'
    },
    {
      id: 'contacts',
      title: 'Emergency Contacts',
      icon: UserGroupIcon,
      description: 'Emergency contact information'
    }
  ];

  // Initialize form with initial data
  useEffect(() => {
    if (initialData) {
      setFormData({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phoneNumber: initialData.phoneNumber || '',
        company: initialData.company || '',
        jobTitle: initialData.jobTitle || '',
        photo: initialData.photo || null,
        documents: initialData.documents || [],
        preferredLocationId: initialData.preferredLocationId || null,
        frequentLocations: initialData.frequentLocations || [],
        commonVisitPurposeId: initialData.commonVisitPurposeId || null,
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
        dietaryRequirements: initialData.dietaryRequirements || '',
        accessibilityRequirements: initialData.accessibilityRequirements || '',
        securityClearance: initialData.securityClearance || '',
        isVip: initialData.isVip || false,
        notes: initialData.notes || '',
        externalId: initialData.externalId || '',
        emergencyContacts: initialData.emergencyContacts || []
      });

      // Set selected objects for autocomplete
      if (initialData.preferredLocationId && locations) {
        const location = locations.find(l => l.id === initialData.preferredLocationId);
        setSelectedLocation(location);
      }
      if (initialData.commonVisitPurposeId && visitPurposes) {
        const purpose = visitPurposes.find(p => p.id === initialData.commonVisitPurposeId);
        setSelectedVisitPurpose(purpose);
      }
    }
  }, [initialData, locations, visitPurposes]);

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
            photo: photos.length > 0 ? photos[0] : null, // Use first photo as profile photo
            documents: otherDocuments
          }));

          // Load upload info
          const uploadInfoData = await visitorDocumentService.getUploadInfo(initialData.id);
          setUploadInfo(uploadInfoData);
        } catch (error) {
          setDocumentError('Failed to load existing documents: ' + extractErrorMessage(error));
        }
      } else if (!isEdit) {
        // For new visitors, just load upload info (using visitor ID 1 as placeholder)
        try {
          const uploadInfoData = await visitorDocumentService.getUploadInfo(1);
          setUploadInfo(uploadInfoData);
        } catch (error) {
          // Ignore error for new visitors, upload info is not critical
          console.warn('Failed to load upload info:', error);
        }
      }
    };

    loadDocumentsAndUploadInfo();
  }, [isEdit, initialData?.id]);

  // Handle form field changes
  const handleChange = (field, value) => {
    if (field.includes('.')) {
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

    // Clear field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  // Handle photo upload
  const handlePhotoUpload = async (photoData) => {
    if (!initialData?.id) {
      // For new visitors, just store photo locally until visitor is created
      setFormData(prev => ({
        ...prev,
        photo: photoData
      }));
      return;
    }

    try {
      setUploadingPhoto(true);
      setPhotoError(null);

      // Upload photo as document
      const result = await visitorDocumentService.uploadVisitorPhoto(
        initialData.id,
        photoData.file,
        {
          description: 'Visitor profile photo',
          isSensitive: false,
          isRequired: false
        }
      );

      setFormData(prev => ({
        ...prev,
        photo: {
          ...photoData,
          id: result.id,
          filePath: result.filePath
        }
      }));
    } catch (error) {
      setPhotoError(extractErrorMessage(error));
    } finally {
      setUploadingPhoto(false);
    }
  };

  // Handle photo removal
  const handlePhotoRemove = async () => {
    const currentPhoto = formData.photo;
    
    // Remove from UI immediately
    setFormData(prev => ({
      ...prev,
      photo: null
    }));

    // If photo was uploaded to server, delete it
    if (currentPhoto?.id && initialData?.id) {
      try {
        await visitorDocumentService.deleteVisitorDocument(
          initialData.id,
          currentPhoto.id,
          false // soft delete
        );
      } catch (error) {
        // If deletion fails, restore the photo in UI
        setFormData(prev => ({
          ...prev,
          photo: currentPhoto
        }));
        setPhotoError('Failed to remove photo: ' + extractErrorMessage(error));
      }
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (documentData) => {
    if (!initialData?.id) {
      // For new visitors, just store document locally until visitor is created
      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, { ...documentData, id: Date.now() }]
      }));
      return;
    }

    try {
      setUploadingDocument(true);
      setDocumentError(null);

      const result = await visitorDocumentService.uploadVisitorDocument(
        initialData.id,
        documentData.file,
        documentData.title || documentData.file.name,
        documentData.documentType || 'Other',
        {
          description: documentData.description,
          isSensitive: documentData.isSensitive || false,
          isRequired: documentData.isRequired || false,
          tags: documentData.tags
        }
      );

      setFormData(prev => ({
        ...prev,
        documents: [...prev.documents, result]
      }));
    } catch (error) {
      setDocumentError(extractErrorMessage(error));
    } finally {
      setUploadingDocument(false);
    }
  };

  // Handle document removal
  const handleDocumentRemove = async (documentId) => {
    const documentToRemove = formData.documents.find(doc => doc.id === documentId);
    
    // Remove from UI immediately
    setFormData(prev => ({
      ...prev,
      documents: prev.documents.filter(doc => doc.id !== documentId)
    }));

    // If document was uploaded to server, delete it
    if (documentToRemove?.filePath && initialData?.id) {
      try {
        await visitorDocumentService.deleteVisitorDocument(
          initialData.id,
          documentId,
          false // soft delete
        );
      } catch (error) {
        // If deletion fails, restore the document in UI
        setFormData(prev => ({
          ...prev,
          documents: [...prev.documents, documentToRemove]
        }));
        setDocumentError('Failed to remove document: ' + extractErrorMessage(error));
      }
    }
  };

  // Handle location selection
  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    handleChange('preferredLocationId', location?.id || null);
  };

  // Handle visit purpose selection
  const handleVisitPurposeSelect = (visitPurpose) => {
    setSelectedVisitPurpose(visitPurpose);
    handleChange('commonVisitPurposeId', visitPurpose?.id || null);
  };

  // Add emergency contact
  const addEmergencyContact = () => {
    const newContact = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      relationship: '',
      phoneNumber: '',
      email: '',
      isPrimary: formData.emergencyContacts.length === 0
    };
    
    setFormData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
  };

  // Update emergency contact
  const updateEmergencyContact = (contactId, field, value) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(contact =>
        contact.id === contactId 
          ? { ...contact, [field]: value }
          : contact
      )
    }));
  };

  // Remove emergency contact
  const removeEmergencyContact = (contactId) => {
    setFormData(prev => {
      const updatedContacts = prev.emergencyContacts.filter(contact => contact.id !== contactId);
      
      // If we removed the primary contact, make the first remaining contact primary
      if (updatedContacts.length > 0 && !updatedContacts.some(contact => contact.isPrimary)) {
        updatedContacts[0].isPrimary = true;
      }
      
      return {
        ...prev,
        emergencyContacts: updatedContacts
      };
    });
  };

  // Set primary emergency contact
  const setPrimaryContact = (contactId) => {
    setFormData(prev => ({
      ...prev,
      emergencyContacts: prev.emergencyContacts.map(contact => ({
        ...contact,
        isPrimary: contact.id === contactId
      }))
    }));
  };

  // Validation functions
  const validateStep = (stepId) => {
    const errors = {};

    switch (stepId) {
      case 'basic':
        if (!formData.firstName?.trim()) {
          errors.firstName = 'First name is required';
        } else if (formData.firstName.length > 50) {
          errors.firstName = 'First name must be less than 50 characters';
        }

        if (!formData.lastName?.trim()) {
          errors.lastName = 'Last name is required';
        } else if (formData.lastName.length > 50) {
          errors.lastName = 'Last name must be less than 50 characters';
        }

        if (!formData.email?.trim()) {
          errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          errors.email = 'Please enter a valid email address';
        } else if (formData.email.length > 100) {
          errors.email = 'Email must be less than 100 characters';
        }

        if (formData.phoneNumber && !/^\+?[\d\s\-\(\)]+$/.test(formData.phoneNumber)) {
          errors.phoneNumber = 'Please enter a valid phone number';
        }

        if (formData.company && formData.company.length > 100) {
          errors.company = 'Company name must be less than 100 characters';
        }

        if (formData.jobTitle && formData.jobTitle.length > 100) {
          errors.jobTitle = 'Job title must be less than 100 characters';
        }
        break;

      case 'photo_documents':
        // Photo and documents are optional, but validate if provided
        break;

      case 'location_purpose':
        // Location and visit purpose are optional
        break;

      case 'address':
        // Address validation (optional but validate format if provided)
        if (formData.address.street1 && formData.address.street1.length > 100) {
          errors['address.street1'] = 'Street address must be less than 100 characters';
        }
        if (formData.address.city && formData.address.city.length > 50) {
          errors['address.city'] = 'City must be less than 50 characters';
        }
        if (formData.address.state && formData.address.state.length > 50) {
          errors['address.state'] = 'State must be less than 50 characters';
        }
        if (formData.address.postalCode && formData.address.postalCode.length > 20) {
          errors['address.postalCode'] = 'Postal code must be less than 20 characters';
        }
        if (formData.address.country && formData.address.country.length > 50) {
          errors['address.country'] = 'Country must be less than 50 characters';
        }
        break;

      case 'personal':
        if (formData.dateOfBirth) {
          const birthDate = new Date(formData.dateOfBirth);
          const today = new Date();
          const age = Math.floor((today - birthDate) / (365.25 * 24 * 60 * 60 * 1000));
          
          if (age < 16) {
            errors.dateOfBirth = 'Visitor must be at least 16 years old';
          } else if (age > 120) {
            errors.dateOfBirth = 'Please enter a valid date of birth';
          }
        }

        if (formData.governmentId && formData.governmentId.length > 50) {
          errors.governmentId = 'Government ID must be less than 50 characters';
        }

        if (formData.nationality && formData.nationality.length > 50) {
          errors.nationality = 'Nationality must be less than 50 characters';
        }
        break;

      case 'requirements':
        if (formData.dietaryRequirements && formData.dietaryRequirements.length > 500) {
          errors.dietaryRequirements = 'Dietary requirements must be less than 500 characters';
        }

        if (formData.accessibilityRequirements && formData.accessibilityRequirements.length > 500) {
          errors.accessibilityRequirements = 'Accessibility requirements must be less than 500 characters';
        }

        if (formData.securityClearance && formData.securityClearance.length > 100) {
          errors.securityClearance = 'Security clearance must be less than 100 characters';
        }

        if (formData.notes && formData.notes.length > 1000) {
          errors.notes = 'Notes must be less than 1000 characters';
        }
        break;

      case 'contacts':
        // Emergency contacts validation
        formData.emergencyContacts.forEach((contact, index) => {
          if (!contact.firstName?.trim()) {
            errors[`emergencyContacts.${index}.firstName`] = 'First name is required';
          }
          if (!contact.lastName?.trim()) {
            errors[`emergencyContacts.${index}.lastName`] = 'Last name is required';
          }
          if (!contact.relationship?.trim()) {
            errors[`emergencyContacts.${index}.relationship`] = 'Relationship is required';
          }
          if (!contact.phoneNumber?.trim()) {
            errors[`emergencyContacts.${index}.phoneNumber`] = 'Phone number is required';
          } else if (!/^\+?[\d\s\-\(\)]+$/.test(contact.phoneNumber)) {
            errors[`emergencyContacts.${index}.phoneNumber`] = 'Please enter a valid phone number';
          }
        });

        // Ensure at least one emergency contact
        if (formData.emergencyContacts.length === 0) {
          errors.emergencyContacts = 'At least one emergency contact is required';
        }

        // Ensure exactly one primary contact
        const primaryContacts = formData.emergencyContacts.filter(contact => contact.isPrimary);
        if (primaryContacts.length === 0 && formData.emergencyContacts.length > 0) {
          errors.emergencyContacts = 'Please designate one primary emergency contact';
        } else if (primaryContacts.length > 1) {
          errors.emergencyContacts = 'Only one primary emergency contact is allowed';
        }
        break;

      default:
        break;
    }

    return errors;
  };

  // Navigation functions
  const goToStep = (stepIndex) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  const goToNextStep = () => {
    const currentStepId = steps[currentStep].id;
    const stepErrors = validateStep(currentStepId);

    if (Object.keys(stepErrors).length === 0) {
      setCompletedSteps(prev => new Set([...prev, currentStepId]));
      setFormErrors({});
      goToStep(currentStep + 1);
    } else {
      setFormErrors(stepErrors);
      // Mark all fields in this step as touched
      Object.keys(stepErrors).forEach(field => {
        setTouched(prev => ({ ...prev, [field]: true }));
      });
    }
  };

  const goToPreviousStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate all steps
    const allErrors = {};
    steps.forEach(step => {
      const stepErrors = validateStep(step.id);
      Object.assign(allErrors, stepErrors);
    });

    if (Object.keys(allErrors).length > 0) {
      setFormErrors(allErrors);
      // Go to first step with errors
      const firstErrorStep = steps.findIndex(step => 
        Object.keys(allErrors).some(error => error.includes(step.id))
      );
      if (firstErrorStep !== -1) {
        setCurrentStep(firstErrorStep);
      }
      return;
    }

    // Prepare submission data
    const submissionData = {
      ...formData,
      preferredLocationId: selectedLocation?.id || null,
      commonVisitPurposeId: selectedVisitPurpose?.id || null
    };

    try {
      await onSubmit(submissionData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };