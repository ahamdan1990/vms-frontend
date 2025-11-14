// src/pages/receptionist/ReceptionistDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux imports
import {
  checkInInvitation,
  checkOutInvitation,
  getActiveInvitations
} from '../../store/slices/invitationsSlice';

// Selectors
import {
  selectActiveInvitations,
  selectActiveInvitationsLoading
} from '../../store/selectors/invitationSelectors';

// Services
import visitorService from '../../services/visitorService';
import invitationService from '../../services/invitationService';
import dashboardService from '../../services/dashboardService';
import reportService from '../../services/reportService';
import visitorDocumentService from '../../services/visitorDocumentService';

// Hooks
import { useToast } from '../../hooks/useNotifications';
import { useSignalR } from '../../hooks/useSignalR';
import { usePermissions } from '../../hooks/usePermissions';

// SignalR Handlers
import DashboardEventHandler from '../../services/signalr/handlers/DashboardEventHandler';
import NotificationEventHandler from '../../services/signalr/handlers/NotificationEventHandler';

// Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Badge from '../../components/common/Badge/Badge';
import Modal from '../../components/common/Modal/Modal';
import Table from '../../components/common/Table/Table';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import QrCodeScanner from '../../components/checkin/QrCodeScanner/QrCodeScanner';
import InvitationDetailsModal from '../../components/checkin/InvitationDetailsModal/InvitationDetailsModal';
import VisitorForm from '../../components/visitor/VisitorForm/VisitorForm';
import WalkInForm from '../../components/walkin/WalkInForm/WalkInForm';
import CameraCapture from '../../components/camera/CameraCapture';
import DocumentScanner from '../../components/scanner/DocumentScanner';
import DocumentPreview from '../../components/documents/DocumentPreview';

// Icons
import {
  UserPlusIcon,
  QrCodeIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  UsersIcon,
  CameraIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  XCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowDownTrayIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';

// Utils
import formatters from '../../utils/formatters';
import { extractErrorMessage } from '../../utils/errorUtils';
import {
  createActiveVisitorColumns,
  formatVisitorInfo,
  formatVisitInfo,
  formatCheckInStatus,
  getStatusBadge
} from '../../components/visitor/activeVisitorUtils';

/**
 * Receptionist Dashboard Component
 * Central interface for receptionist operations including:
 * - Walk-in visitor registration
 * - QR code scanning for check-ins
 * - Active visitor management
 * - Photo capture and document handling
 */
const ReceptionistDashboard = () => {
  const dispatch = useDispatch();
  const toast = useToast();
  const { isConnected, host, operator, security, admin } = useSignalR();
  const { emergency, report: reportPermissions } = usePermissions();

  // Redux selectors
  const activeInvitationsFromRedux = useSelector(selectActiveInvitations);
  const activeInvitationsLoading = useSelector(selectActiveInvitationsLoading);
  const { isMobile } = useSelector(state => state.ui);

  // State management
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'walk-in', 'scanner', 'active', 'documents'
  const [todayStats, setTodayStats] = useState({
    expectedVisitors: 0,
    checkedIn: 0,
    pendingCheckOut: 0,
    walkIns: 0,
    overdueVisitors: 0
  });

  // Walk-in registration state
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState(null);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const [recognizedVisitor, setRecognizedVisitor] = useState(null);

  // Document scanning state
  const [showDocumentScanner, setShowDocumentScanner] = useState(false);
  const [scannedDocuments, setScannedDocuments] = useState([]);
  const [selectedVisitorForDocs, setSelectedVisitorForDocs] = useState(null);

  // Scanner state - Modal based like CheckInDashboard
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [exportingReport, setExportingReport] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  const [showInvitationDetailsModal, setShowInvitationDetailsModal] = useState(false);
  const [invitationDetailsData, setInvitationDetailsData] = useState(null);
  const [invitationDetailsError, setInvitationDetailsError] = useState(null);
  const [loadingInvitationDetails, setLoadingInvitationDetails] = useState(false);
  const [autoCheckInMode, setAutoCheckInMode] = useState(false);

  // Active visitors state
  const [expandedVisitorId, setExpandedVisitorId] = useState(null);
  const [visitorDocuments, setVisitorDocuments] = useState({});
  const [loadingDocuments, setLoadingDocuments] = useState({});

  // Document preview state
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [previewVisitorId, setPreviewVisitorId] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const overdueNotificationRef = useRef(0);
  const canExportInBuildingReport = emergency?.canExport || reportPermissions?.canExport;
  const lastOverdueNotificationTime = useRef(null);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    dispatch(getActiveInvitations());
  }, [dispatch]);

  useEffect(() => {
    const current = todayStats.overdueVisitors ?? 0;
    const previous = overdueNotificationRef.current ?? 0;
    const now = Date.now();
    const fifteenMinutesInMs = 15 * 60 * 1000; // 15 minutes in milliseconds

    // Check if 15 minutes have passed since the last notification
    const canShowNotification = !lastOverdueNotificationTime.current ||
                                 (now - lastOverdueNotificationTime.current) >= fifteenMinutesInMs;

    if (current > 0 && canShowNotification) {
      // Show notification if there are overdue visitors and 15 minutes have passed
      toast.warning(
        'Overdue Visitors',
        `${current} visitor${current === 1 ? '' : 's'} have exceeded their scheduled checkout time.`,
        { duration: 7000 }
      );
      lastOverdueNotificationTime.current = now;
    } else if (current === 0 && previous > 0) {
      // Always show the "cleared" notification when all overdue visitors check out
      toast.success('Overdue Cleared', 'All overdue visitors have checked out.', { duration: 4000 });
      lastOverdueNotificationTime.current = null; // Reset timer when cleared
    }

    overdueNotificationRef.current = current;
  }, [todayStats.overdueVisitors, toast]);

  const loadDashboardData = async () => {
    try {
      const metricsResponse = await dashboardService.getDashboardData();
      const metricsData = metricsResponse?.data || metricsResponse || {};

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const todayInvitationsResponse = await invitationService.getInvitations({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
        pageSize: 1000
      });

      // Extract items from the response - extractApiData already unwraps the data layer
      const todayInvitations = todayInvitationsResponse?.items || todayInvitationsResponse || [];
      const checkedInToday = todayInvitations.filter(inv => inv.checkedInAt);
      const pendingCheckOutToday = checkedInToday.filter(inv => !inv.checkedOutAt);
      const walkInsToday = todayInvitations.filter(inv => (inv.type || '').toLowerCase() === 'walkin');

      const stats = {
        expectedVisitors: todayInvitations.length,
        checkedIn: checkedInToday.length,
        pendingCheckOut: pendingCheckOutToday.length,
        walkIns: walkInsToday.length,
        overdueVisitors: metricsData.overdueVisitors ?? 0
      };

      setTodayStats(prev => ({
        ...prev,
        ...stats
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const handleInBuildingExport = async () => {
    if (!canExportInBuildingReport || exportingReport) {
      return;
    }

    setExportingReport(true);
    try {
      await reportService.exportInBuildingReport();
      toast.success(
        'Report Downloaded',
        'The in-building report has been downloaded successfully.',
        { duration: 5000 }
      );
    } catch (error) {
      const errorMessage = extractErrorMessage(error) || 'Unable to export the report right now.';
      toast.error('Export Failed', errorMessage, { duration: 6000 });
    } finally {
      setExportingReport(false);
    }
  };

  // Note: We DON'T calculate stats from activeInvitationsFromRedux because:
  // - getActiveInvitations() only returns invitations with status='Active'
  // - It doesn't include all invitations needed for accurate stats
  // - We need loadDashboardData() which fetches ALL today's invitations
  // The activeInvitations from Redux is only used for the Active Visitors table

  // ===== SIGNALR REAL-TIME UPDATES =====
  // Subscribe to dashboard metrics updates
  useEffect(() => {
    const unsubscribe = DashboardEventHandler.subscribe((eventType, data, hubName) => {
      console.log('📊 Dashboard event received:', eventType, data);

      if (eventType === 'dashboard-update') {
        // Only update if data is meaningful (not all zeros/undefined)
        // This prevents empty SignalR events from overwriting correct stats
        const hasValidData = data && (
          (data.expectedVisitors && data.expectedVisitors > 0) ||
          (data.checkedIn && data.checkedIn > 0) ||
          (data.pendingCheckOut && data.pendingCheckOut > 0) ||
          (data.walkIns && data.walkIns > 0) ||
          (data.overdueVisitors !== undefined && data.overdueVisitors !== null)
        );

        if (hasValidData) {
          setTodayStats(prev => ({
            ...prev,
            ...data
          }));
        }
      } else if (eventType === 'queue-update') {
        // Handle queue updates if needed
        console.log('Queue update:', data);
      }
    });

    return unsubscribe;
  }, []);

  // Subscribe to visitor check-in/check-out events
  useEffect(() => {
    const unsubscribe = NotificationEventHandler.subscribe((eventType, data, hubName) => {
      console.log('🔔 Notification event received:', eventType, data);

      if (eventType === 'visitor-checked-in' || eventType === 'visitor-checked-out') {
        // Refresh dashboard data and active invitations
        loadDashboardData();
        dispatch(getActiveInvitations());

        // Show toast notification
        if (eventType === 'visitor-checked-in') {
          toast.success(`Visitor ${data.visitorName} checked in`);
        } else {
          toast.info(`Visitor ${data.visitorName} checked out`);
        }
      }
    });

    return unsubscribe;
  }, [dispatch, toast]);

  // Handle photo capture from camera
  const handlePhotoCapture = async (photoData) => {
    try {
      // Step 1: Validate photo for face detection before accepting
      console.log('Validating captured photo for face detection...');
      const validationResult = await visitorService.validatePhoto(photoData.file);

      if (!validationResult.faceDetected) {
        // Face not detected - show error and keep camera open
        toast.error(
          'No Face Detected',
          'No face was detected in the captured photo. Please retake the photo with a clearly visible face.',
          { duration: 0 } // Don't auto-dismiss
        );
        // Don't accept the photo, keep camera open for retry
        return;
      }

      // Face detected successfully
      console.log('Face detected successfully:', validationResult);

      // Step 2: Check if this face belongs to a known visitor
      console.log('Searching for visitor by face recognition...');
      let recognizedVisitorData = null;

      try {
        recognizedVisitorData = await visitorService.searchVisitorByPhoto(photoData.file);

        if (recognizedVisitorData) {
          // Known visitor recognized!
          console.log('Returning visitor recognized:', recognizedVisitorData);
          toast.success(
            'Returning Visitor Recognized!',
            `Welcome back, ${recognizedVisitorData.fullName}! Your information has been pre-filled.`,
            { duration: 5000 }
          );
          setRecognizedVisitor(recognizedVisitorData);
        } else {
          // New visitor
          console.log('No matching visitor found - new visitor');
          toast.success(
            'Face Detected',
            'Face detected successfully! Proceeding to registration form.',
            { duration: 3000 }
          );
          setRecognizedVisitor(null);
        }
      } catch (searchError) {
        // Face recognition failed or unavailable - proceed as new visitor
        console.warn('Face recognition search failed:', searchError);
        toast.success(
          'Face Detected',
          'Face detected successfully! Proceeding to registration form.',
          { duration: 3000 }
        );
        setRecognizedVisitor(null);
      }

      setCapturedPhoto(photoData);
      setShowCameraCapture(false);
    } catch (error) {
      console.error('Failed to validate photo:', error);

      // Extract error message
      const errorMessage = error.response?.data?.errors?.[0] ||
                          error.response?.data?.message ||
                          error.message ||
                          'Failed to validate the photo.';

      toast.error(
        'Validation Failed',
        errorMessage + ' Please try again.',
        { duration: 6000 }
      );

      // Don't accept the photo, keep camera open for retry
    }
  };

  // Handle starting walk-in registration
  const handleStartWalkInRegistration = () => {
    setShowWalkInForm(true);
    setShowCameraCapture(false);
    setCapturedPhoto(null);
    setRecognizedVisitor(null);
    setWalkInError(null);
  };

  // Handle starting camera capture
  const handleStartCameraCapture = () => {
    setShowCameraCapture(true);
    setShowWalkInForm(false);
    setRecognizedVisitor(null);
  };

  const handleStartRegistrationWithPhoto = () => {
    setShowWalkInForm(true);
    setShowCameraCapture(false);
    // Don't clear recognizedVisitor here - we need it for pre-population!
    setWalkInError(null);
  };

  // Handle walk-in visitor registration with immediate check-in
  const handleWalkInRegistration = async (walkInData) => {
    try {
      setWalkInLoading(true);
      setWalkInError(null);

      // Step 1: Create or update visitor
      let visitor;
      if (walkInData.existingVisitorId) {
        // Update existing visitor if needed
        visitor = await visitorService.updateVisitor(
          walkInData.existingVisitorId,
          walkInData.visitorData
        );
      } else {
        // Create new visitor
        visitor = await visitorService.createVisitor(walkInData.visitorData);
      }

      // Step 2: Upload photo if captured (use profile photo endpoint)
      if (capturedPhoto) {
        try {
          const photoResult = await visitorService.uploadVisitorPhoto(visitor.id, capturedPhoto.file);

          // Handle face detection feedback for non-critical warnings
          if (photoResult && photoResult.warningMessage) {
            switch (photoResult.warningType) {
              case 'ServiceError':
                toast.error(
                  'Face Recognition Service Error',
                  photoResult.warningMessage,
                  { duration: 10000 }
                );
                break;
              case 'PartialSuccess':
                toast.warning(
                  'Partial Success',
                  photoResult.warningMessage,
                  { duration: 7000 }
                );
                break;
              case 'ServiceUnavailable':
                toast.info(
                  'Face Detection Unavailable',
                  photoResult.warningMessage,
                  { duration: 6000 }
                );
                break;
              default:
                if (photoResult.warningMessage) {
                  toast.warning('Photo Upload Warning', photoResult.warningMessage, { duration: 6000 });
                }
            }
          } else if (photoResult && photoResult.faceDetected && photoResult.faceRecognitionEnabled) {
            // Success case - face detected and recognition enabled
            toast.success(
              'Photo Uploaded',
              'Face detected successfully. Face recognition is enabled for this visitor.',
              { duration: 4000 }
            );
          }
        } catch (photoError) {
          console.error('Failed to upload profile photo:', photoError);

          // Extract error message from API response
          const errorMessage = photoError.response?.data?.errors?.[0] ||
                              photoError.response?.data?.message ||
                              photoError.message ||
                              'Failed to upload the profile photo.';

          // Note: "No face detected" errors should NOT happen here since we validate
          // the photo before accepting it. This is just a safety net.
          toast.error(
            'Photo Upload Failed',
            errorMessage + ' The visitor was created but without a photo.',
            { duration: 8000 }
          );
          // Continue with registration - photo was already validated, this is likely a different error
        }
      }

      // Step 2.5: Upload scanned documents if any
      if (walkInData.scannedDocuments && walkInData.scannedDocuments.length > 0) {
        try {
          for (const doc of walkInData.scannedDocuments) {
            await visitorDocumentService.uploadVisitorDocument(visitor.id, doc.file || doc.blob, {
              description: `Walk-in ID document - ${doc.documentType || 'ID'}`,
              documentType: doc.documentType || 'ID',
              isSensitive: true,
              isRequired: false
            });
          }
        } catch (docError) {
          console.warn('Failed to upload scanned documents:', docError);
          // Continue with registration even if document upload fails
        }
      }

      // Step 3: Create invitation with all visit details
      const visitData = walkInData.visitData;
      const normalizeId = (value) => {
        if (value === null || value === undefined || value === '') return null;
        const parsed = Number(value);
        return Number.isNaN(parsed) ? null : parsed;
      };

      const hostId = normalizeId(visitData.hostId) ?? visitData.hostId;
      const visitPurposeId = normalizeId(visitData.visitPurposeId);
      const locationId = normalizeId(visitData.locationId);

      const invitation = await invitationService.createInvitation({
        visitorId: visitor.id,
        hostId,
        visitPurposeId: visitPurposeId || null,
        locationId: locationId || null,
        subject: `Walk-in Visit - ${visitData.visitPurposeName || 'General'}`,
        type: 'walkin',  // Identify walk-ins with distinct type
        expectedVisitorCount: 1,
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date(Date.now() + visitData.duration * 60 * 1000).toISOString(),
        requiresApproval: false, // Walk-ins bypass approval
        submitForApproval: false,
        notes: visitData.notes || 'Walk-in visitor - registered by receptionist'
      });
      
      // Step 4: Auto-approve (receptionist has permission)
      try {
        await invitationService.approveInvitation(
          invitation.id,
          'Walk-in visitor - auto-approved by receptionist'
        );
      } catch (approvalError) {
        console.warn('Could not auto-approve walk-in:', approvalError);
        // Continue anyway - may need manual approval
      }

      // Step 5: Immediate check-in
      let checkInResult;
      try {
        checkInResult = await dispatch(checkInInvitation({
          invitationReference: invitation.invitationNumber || invitation.id.toString(),
          notes: 'Walk-in visitor - immediate check-in by receptionist'
        })).unwrap();
      } catch (checkInError) {
        console.error('Check-in failed:', checkInError);
        // Still show success - visitor and invitation created
        toast.warning(
          'Check-in Requires Approval',
          'Visitor registered successfully but requires approval before check-in.',
          { duration: 6000 }
        );
      }

      // Step 6: Show success message with badge printing option
      const visitorName = `${visitor.firstName} ${visitor.lastName}`;

      toast.success(
        'Walk-in Successful',
        `${visitorName} has been ${checkInResult ? 'checked in' : 'registered'} successfully. Host ${visitData.hostName} has been notified.`,
        {
          duration: 8000,
          actions: [
            {
              label: 'Print Badge',
              onClick: () => {
                window.open(
                  `/print/badge/${invitation.id}`,
                  'badge-print',
                  'width=400,height=600'
                );
              }
            }
          ]
        }
      );

      // Reset form state
      setShowWalkInForm(false);
      setShowCameraCapture(false);
      setCapturedPhoto(null);

      // Refresh dashboard data
      loadDashboardData();
      dispatch(getActiveInvitations());

      return {
        success: true,
        visitor,
        invitation,
        checkInResult,
        badgePrintUrl: `/print/badge/${invitation.id}`
      };
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      setWalkInError(errorMessage);
      toast.error('Walk-in Failed', errorMessage, { duration: 6000 });
      throw error;
    } finally {
      setWalkInLoading(false);
    }
  };

  // Handle QR code scan - same as CheckInDashboard
  const handleQrScan = async (qrData) => {
    // Close scanner modal immediately
    setShowScannerModal(false);

    // Small delay to ensure modal closes properly
    await new Promise(resolve => setTimeout(resolve, 100));

    // AUTO CHECK-IN MODE: Process immediately
    if (autoCheckInMode) {
      try {
        const result = await dispatch(checkInInvitation({
          invitationReference: qrData,
          notes: 'QR Code Check-in by receptionist'
        })).unwrap();

        toast.success(
          'Check-in Successful',
          `${result?.visitor?.fullName || 'Visitor'} has been checked in successfully.`,
          { duration: 5000 }
        );

        // Refresh data
        await dispatch(getActiveInvitations());
        await loadDashboardData();
      } catch (error) {
        console.error('QR check-in failed:', error);
        const errorMessage = extractErrorMessage(error);

        // Try to fetch invitation details to show in modal
        try {
          const invitationDetails = await invitationService.getInvitationByReference(qrData);
          setInvitationDetailsData(invitationDetails);
          setInvitationDetailsError(null);
        } catch (fetchError) {
          setInvitationDetailsData(null);
          setInvitationDetailsError({
            message: errorMessage || 'Check-in failed',
            details: getErrorDetails(errorMessage)
          });
        }
        setShowInvitationDetailsModal(true);
      }
    }
    // MANUAL CONFIRMATION MODE: Fetch details first
    else {
      setLoadingInvitationDetails(true);
      setInvitationDetailsError(null);
      setInvitationDetailsData(null);

      try {
        const invitationDetails = await invitationService.getInvitationByReference(qrData);
        if (invitationDetails) {
          setInvitationDetailsData(invitationDetails);
          setShowInvitationDetailsModal(true);
        } else {
          setInvitationDetailsError({
            message: 'Invitation Not Found',
            details: 'The scanned QR code does not match any invitation in the system.'
          });
          setShowInvitationDetailsModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch invitation details:', error);
        const errorMessage = extractErrorMessage(error);

        if (error.response?.status === 404 || errorMessage?.includes('not found')) {
          setInvitationDetailsError({
            message: `Invitation with reference '${qrData}' not found.`,
            details: 'The scanned QR code does not match any invitation in the system.'
          });
        } else {
          setInvitationDetailsError({
            message: errorMessage || 'Failed to load invitation details',
            details: getErrorDetails(errorMessage)
          });
        }
        setShowInvitationDetailsModal(true);
      } finally {
        setLoadingInvitationDetails(false);
      }
    }
  };

  // Helper function to extract error details
  const getErrorDetails = (errorMessage) => {
    if (!errorMessage) return null;

    if (errorMessage.includes('too early') || errorMessage.includes('scheduled for')) {
      return 'This invitation is scheduled for a future time. Check-in is allowed starting 2 hours before the scheduled time.';
    } else if (errorMessage.includes('expired') || errorMessage.includes('scheduled to end')) {
      return 'This invitation has expired and can no longer be used for check-in.';
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return 'The scanned QR code does not match any invitation in the system.';
    } else if (errorMessage.includes('Only approved invitations') || errorMessage.includes('not been approved') || errorMessage.includes('not approved')) {
      return 'This invitation must be approved before check-in is allowed.';
    } else if (errorMessage.includes('already checked in')) {
      return 'This visitor has already been checked in.';
    }
    return null;
  };

  // Handle manual confirmation of check-in
  const handleConfirmCheckIn = async (invitationReference, notes = '') => {
    try {
      const result = await dispatch(checkInInvitation({
        invitationReference,
        notes: notes || 'Manual confirmation check-in by receptionist'
      })).unwrap();

      setShowInvitationDetailsModal(false);
      setInvitationDetailsData(null);
      setInvitationDetailsError(null);

      toast.success(
        'Check-in Successful',
        `${result?.visitor?.fullName || 'Visitor'} has been checked in successfully.`,
        { duration: 5000 }
      );

      // Refresh data
      await dispatch(getActiveInvitations());
      await loadDashboardData();
    } catch (error) {
      console.error('Confirmed check-in failed:', error);
      const errorMessage = extractErrorMessage(error);
      toast.error('Check-in Failed', errorMessage, { duration: 6000 });
    }
  };

  const handleQuickCheckIn = async (invitation) => {
    try {
      await dispatch(checkInInvitation({
        invitationReference: invitation.invitationNumber || invitation.id?.toString(),
        notes: 'Quick check-in by receptionist'
      })).unwrap();

      toast.success('Check-in Successful', 'Visitor checked in successfully');
      loadDashboardData();
      dispatch(getActiveInvitations());
    } catch (error) {
      toast.error('Check-in Failed', extractErrorMessage(error));
    }
  };

  // Handle visitor check-out
  const handleCheckOut = async (id) => {
    try {
      await dispatch(checkOutInvitation({
        id,
        notes: 'Manual check-out by receptionist'
      })).unwrap();

      toast.success('Check-out Successful', 'Visitor has been checked out successfully.');

      loadDashboardData();
      dispatch(getActiveInvitations());
    } catch (error) {
      console.error('Check-out failed:', error);
      toast.error('Check-out Failed', extractErrorMessage(error));
    }
  };

  // Handle document scanning
  const handleDocumentScanned = async (documents) => {
    setScannedDocuments(documents);
    setShowDocumentScanner(false);
    
    // If a visitor is selected, auto-upload documents
    if (selectedVisitorForDocs) {
      try {
        for (const doc of documents) {
          if (!doc.uploaded) {
            const file = new File([doc.blob], `scanned-${doc.id}.jpg`, {
              type: 'image/jpeg',
              lastModified: doc.timestamp.getTime()
            });

            await visitorDocumentService.uploadVisitorDocument(
              selectedVisitorForDocs.id,
              file,
              `Scanned Document ${Date.now()}`,
              doc.type || 'Other',
              {
                description: `Document scanned by receptionist on ${doc.timestamp.toLocaleString()}`,
                isSensitive: false,
                isRequired: false,
                tags: 'scanned,receptionist'
              }
            );
          }
        }
      } catch (error) {
        console.error('Failed to upload scanned documents:', error);
      }
    }
  };

  // Handle starting document scanning for a visitor
  const handleStartDocumentScanning = (visitor = null) => {
    setSelectedVisitorForDocs(visitor);
    setShowDocumentScanner(true);
    setActiveTab('documents');
  };

  // Handle toggling visitor details
  const handleToggleVisitorDetails = async (visitorId) => {
    if (expandedVisitorId === visitorId) {
      setExpandedVisitorId(null);
      return;
    }

    setExpandedVisitorId(visitorId);

    // Load documents if not already loaded
    if (!visitorDocuments[visitorId]) {
      try {
        setLoadingDocuments(prev => ({ ...prev, [visitorId]: true }));
        const response = await visitorDocumentService.getVisitorDocuments(visitorId);
        setVisitorDocuments(prev => ({ ...prev, [visitorId]: response.data || [] }));
      } catch (error) {
        console.error('Failed to load visitor documents:', error);
        setVisitorDocuments(prev => ({ ...prev, [visitorId]: [] }));
      } finally {
        setLoadingDocuments(prev => ({ ...prev, [visitorId]: false }));
      }
    }
  };

  // Handle document preview
  const handlePreviewDocument = (visitorId, doc) => {
    setPreviewVisitorId(visitorId);
    setSelectedDocument(doc);
    setIsPreviewOpen(true);
  };

  const handleClosePreview = () => {
    setIsPreviewOpen(false);
    setSelectedDocument(null);
    setPreviewVisitorId(null);
  };

  // Handle document download
  const handleDownloadDocument = async (visitorId, doc) => {
    try {
      const blob = await visitorDocumentService.downloadVisitorDocument(visitorId, doc.id);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalFileName || doc.fileName || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const activeVisitorsColumns = createActiveVisitorColumns({
    onViewDetails: (invitation) => handleToggleVisitorDetails(invitation.visitor?.id),
    onQuickCheckIn: handleQuickCheckIn,
    onQuickCheckOut: (invitation) => handleCheckOut(invitation.id),
    showSelection: true
  });

  const renderActiveVisitorCard = (invitation) => (
    <Card key={invitation.id} className="p-4 space-y-4">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 min-w-0">{formatVisitorInfo(invitation)}</div>
          {getStatusBadge(invitation)}
        </div>
        <div className="space-y-3">
          {formatVisitInfo(invitation)}
          {formatCheckInStatus(invitation)}
        </div>
      </div>
      {renderMobileActionButtons(invitation)}
    </Card>
  );

  const renderMobileActionButtons = (invitation) => {
    const isCheckedIn = invitation.checkedInAt && !invitation.checkedOutAt;
    const canCheckIn = invitation.status === 'Approved' && !invitation.checkedInAt;

    return (
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleToggleVisitorDetails(invitation.visitor?.id)}
          icon={<EyeIcon className="w-4 h-4" />}
        >
          Details
        </Button>
        {canCheckIn && (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleQuickCheckIn(invitation)}
            icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          >
            Check In
          </Button>
        )}
        {isCheckedIn && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleCheckOut(invitation.id)}
            icon={<ArrowLeftOnRectangleIcon className="w-4 h-4" />}
          >
            Check Out
          </Button>
        )}
      </div>
    );
  };

  const showCompactActiveView = isMobile;

  // Render stats cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
              <ClockIconSolid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expected Visitors</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.expectedVisitors}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
              <CheckCircleIconSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Checked In</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.checkedIn}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-md">
              <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Check-out</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.pendingCheckOut}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
              <UserPlusIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Walk-ins Today</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{todayStats.walkIns}</p>
            </div>
          </div>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-md ${todayStats.overdueVisitors > 0 ? 'bg-red-100 dark:bg-red-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <ClockIcon className={`w-6 h-6 ${todayStats.overdueVisitors > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue Visitors</p>
              <p className={`text-2xl font-bold ${todayStats.overdueVisitors > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                {todayStats.overdueVisitors}
              </p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
      <nav className="-mb-px flex min-w-max space-x-4">
        {[
          { id: 'overview', label: 'Overview', icon: EyeIcon },
          { id: 'scanner', label: 'QR Scanner', icon: QrCodeIcon },
          { id: 'walk-in', label: 'Walk-in Registration', icon: UserPlusIcon },
          { id: 'active', label: `Active Visitors (${todayStats.pendingCheckOut})`, icon: UsersIcon },
          { id: 'documents', label: 'Documents', icon: DocumentTextIcon }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-shrink-0 py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </div>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Receptionist Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage visitor check-ins, walk-in registrations, and daily operations</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            onClick={() => {
              loadDashboardData();
              dispatch(getActiveInvitations());
            }}
            icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          >
            Refresh
          </Button>
          {canExportInBuildingReport && (
            <Button
              onClick={handleInBuildingExport}
              loading={exportingReport}
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              Export Who's In Building
            </Button>
          )}
        </div>
      </div>

      {/* Statistics Cards */}
      {renderStatsCards()}

      {/* Tab Navigation */}
      {renderTabNavigation()}

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveTab('scanner')}
                  icon={<QrCodeIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  Scan QR Code
                </Button>
                <Button
                  onClick={() => setActiveTab('walk-in')}
                  icon={<UserPlusIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  Register Walk-in
                </Button>
                <Button
                  onClick={() => setActiveTab('documents')}
                  icon={<DocumentTextIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  Scan Documents
                </Button>
                <Button
                  onClick={() => setActiveTab('active')}
                  icon={<UsersIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  View Active Visitors
                </Button>
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'scanner' && (
          <motion.div
            key="scanner"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <div className="text-center py-12">
                <QrCodeIcon className="w-24 h-24 text-gray-400 dark:text-gray-500 mx-auto mb-6" />
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">QR Code Scanner</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  Scan visitor QR codes for quick check-in. Click the button below to open the scanner.
                </p>

                {/* Auto/Manual Check-in Mode Toggle */}
                <div className="flex justify-center items-center space-x-4 mb-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCheckInMode}
                      onChange={(e) => setAutoCheckInMode(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Auto Check-in Mode
                    </span>
                  </label>
                </div>

                <Button
                  onClick={() => setShowScannerModal(true)}
                  icon={<QrCodeIcon className="w-5 h-5" />}
                  size="lg"
                  className="mx-auto"
                >
                  Open QR Scanner
                </Button>

                {scanError && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md max-w-md mx-auto">
                    <p className="text-red-600 dark:text-red-300 text-sm">{scanError}</p>
                  </div>
                )}
                {scanResult && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md max-w-md mx-auto">
                    <p className="text-green-600 dark:text-green-300">Check-in successful!</p>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}

        {activeTab === 'walk-in' && (
          <motion.div
            key="walk-in"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Walk-in Visitor Registration</h2>

              {showCameraCapture ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Capture Visitor Photo</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Take a photo of the visitor for their profile</p>
                  </div>
                  <CameraCapture
                    onPhotoCapture={handlePhotoCapture}
                    onCancel={() => setShowCameraCapture(false)}
                    maxWidth={400}
                    maxHeight={400}
                    quality={0.8}
                    autoStart={true}
                  />
                </div>
              ) : !showWalkInForm ? (
                <div className="text-center py-8">
                  <UserPlusIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Register a Walk-in Visitor</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">Quick 3-step registration for unscheduled visitors</p>

                  {/* Walk-in registration options */}
                  <div className="space-y-4 max-w-md mx-auto">
                    {/* Start with photo capture */}
                    <Button
                      onClick={handleStartCameraCapture}
                      icon={<CameraIcon className="w-5 h-5" />}
                      className="w-full"
                    >
                      Start with Photo Capture
                    </Button>

                    {/* Skip photo and go to form */}
                    <Button
                      onClick={handleStartWalkInRegistration}
                      variant="outline"
                      icon={<DocumentTextIcon className="w-5 h-5" />}
                      className="w-full"
                    >
                      Skip Photo - Start Registration
                    </Button>
                  </div>

                  {/* Show captured photo if available */}
                  {capturedPhoto && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-white shadow">
                            <img
                              src={capturedPhoto.url}
                              alt="Captured visitor photo"
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-300">Photo captured successfully!</p>
                            <p className="text-xs text-green-600 dark:text-green-400">Start the registration form when you are ready.</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Button
                            size="sm"
                            onClick={handleStartRegistrationWithPhoto}
                            icon={<DocumentTextIcon className="w-4 h-4" />}
                          >
                            Start Registration
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCapturedPhoto(null)}
                            icon={<XCircleIcon className="w-4 h-4" />}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <WalkInForm
                  onSubmit={handleWalkInRegistration}
                  onCancel={() => {
                    setShowWalkInForm(false);
                    setCapturedPhoto(null);
                    setRecognizedVisitor(null);
                  }}
                  loading={walkInLoading}
                  error={walkInError}
                  initialPhoto={capturedPhoto}
                  recognizedVisitor={recognizedVisitor}
                />
              )}
            </Card>
          </motion.div>
        )}

        {activeTab === 'active' && (
          <motion.div
            key="active"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              {activeInvitationsLoading ? (
                <div className="flex justify-center items-center py-12">
                  <LoadingSpinner size="lg" />
                </div>
              ) : activeInvitationsFromRedux && activeInvitationsFromRedux.length > 0 ? (
                showCompactActiveView ? (
                  <div className="space-y-4">
                    {activeInvitationsFromRedux.map(renderActiveVisitorCard)}
                  </div>
                ) : (
                  <div className="-mx-4 sm:mx-0 overflow-x-auto">
                    <Table
                      data={activeInvitationsFromRedux}
                      columns={activeVisitorsColumns}
                      emptyMessage="No active visitors"
                    />
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No active visitors</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Visitors will appear here when they check in.
                  </p>
                </div>
              )}
            </Card>

            {/* Expanded Details Modal for Documents */}
            {expandedVisitorId && (
              <Modal
                isOpen={!!expandedVisitorId}
                onClose={() => setExpandedVisitorId(null)}
                title="Visitor Documents"
                size="lg"
              >
                <div className="p-4">
                  {loadingDocuments[expandedVisitorId] ? (
                    <div className="flex items-center justify-center py-8">
                      <LoadingSpinner size="md" />
                    </div>
                  ) : (visitorDocuments[expandedVisitorId] || []).length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {(visitorDocuments[expandedVisitorId] || []).map((doc) => (
                        <div key={doc.id} className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center space-x-2">
                                <DocumentTextIcon className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {doc.documentName}
                                </p>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {doc.documentType} • {doc.formattedFileSize}
                              </p>
                              {doc.description && (
                                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 truncate">
                                  {doc.description}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              {doc.isSensitive && (
                                <Badge variant="warning" size="xs">Sensitive</Badge>
                              )}
                              {doc.isRequired && (
                                <Badge variant="info" size="xs">Required</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handlePreviewDocument(expandedVisitorId, doc)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                              <span>Preview</span>
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(expandedVisitorId, doc)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                              <span>Download</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">No documents available for this visitor.</p>
                    </div>
                  )}
                </div>
              </Modal>
            )}
          </motion.div>
        )}

        {activeTab === 'documents' && (
          <motion.div
            key="documents"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Document Scanner</h2>
              
              {showDocumentScanner ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Scan Visitor Documents</h3>
                    <p className="text-sm text-gray-600">
                      {selectedVisitorForDocs 
                        ? `Scanning documents for ${selectedVisitorForDocs.fullName}` 
                        : 'Scan documents that will be saved locally'
                      }
                    </p>
                  </div>
                  
                  <DocumentScanner
                    onDocumentScanned={handleDocumentScanned}
                    onCancel={() => setShowDocumentScanner(false)}
                    visitorId={selectedVisitorForDocs?.id}
                    documentType="Other"
                    autoUpload={Boolean(selectedVisitorForDocs)}
                  />
                </div>
              ) : (
                <div className="text-center py-8">
                  <DocumentTextIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Scan Visitor Documents</h3>
                  <p className="text-gray-500 mb-6">
                    Use your device camera to scan visitor documents like IDs, passports, or other required paperwork
                  </p>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                    <Button
                      onClick={() => handleStartDocumentScanning()}
                      icon={<DocumentTextIcon className="w-5 h-5" />}
                      className="w-full"
                    >
                      Start Document Scanning
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-2"><strong>Supported document types:</strong></p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {['ID Cards', 'Passports', 'Visas', 'Permits', 'Certificates'].map(type => (
                          <Badge key={type} color="gray" size="sm">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent scanned documents */}
                  {scannedDocuments.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Recent Scans ({scannedDocuments.length})
                      </h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {scannedDocuments.slice(0, 6).map((doc, index) => (
                          <div key={doc.id} className="relative">
                            <img 
                              src={doc.url} 
                              alt={`Scan ${index + 1}`}
                              className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-75"
                              onClick={() => window.open(doc.url, '_blank')}
                            />
                            <Badge 
                              color="blue" 
                              size="xs" 
                              className="absolute bottom-0 right-0 transform translate-x-1 translate-y-1"
                            >
                              {index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {scannedDocuments.length > 6 && (
                        <p className="text-xs text-blue-600 mt-2">
                          +{scannedDocuments.length - 6} more documents
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* QR Scanner Modal */}
      {showScannerModal && (
        <Modal
          isOpen={showScannerModal}
          onClose={() => setShowScannerModal(false)}
          title="Scan QR Code"
          size="lg"
        >
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Point your camera at the visitor's QR code
            </p>
            <QrCodeScanner
              key={showScannerModal ? 'scanner-open' : 'scanner-closed'}
              onScan={handleQrScan}
              loading={false}
            />
          </div>
        </Modal>
      )}

      {/* Invitation Details Modal */}
      <InvitationDetailsModal
        isOpen={showInvitationDetailsModal}
        onClose={() => {
          setShowInvitationDetailsModal(false);
          setInvitationDetailsData(null);
          setInvitationDetailsError(null);
        }}
        invitation={invitationDetailsData}
        error={invitationDetailsError}
        onConfirmCheckIn={handleConfirmCheckIn}
        loading={loadingInvitationDetails}
      />

      {/* Document Preview Modal */}
      {selectedDocument && previewVisitorId && (
        <DocumentPreview
          visitorId={previewVisitorId}
          document={selectedDocument}
          isOpen={isPreviewOpen}
          onClose={handleClosePreview}
        />
      )}
    </div>
  );
};

export default ReceptionistDashboard;
