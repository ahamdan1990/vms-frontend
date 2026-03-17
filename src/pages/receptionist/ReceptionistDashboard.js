// src/pages/receptionist/ReceptionistDashboard.js
import React, { useState, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
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
  EyeIcon,
  UsersIcon,
  CameraIcon,
  DocumentTextIcon,
  ArrowRightOnRectangleIcon,
  ArrowLeftOnRectangleIcon,
  XCircleIcon,
  ArrowDownTrayIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';

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
  const { t } = useTranslation(['receptionist', 'common']);
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
        t('receptionist:notifications.overdueTitle'),
        t('receptionist:notifications.overdueMessage', { count: current }),
        { duration: 7000 }
      );
      lastOverdueNotificationTime.current = now;
    } else if (current === 0 && previous > 0) {
      // Always show the "cleared" notification when all overdue visitors check out
      toast.success(t('receptionist:notifications.overdueCleared'), t('receptionist:notifications.overdueClearedDesc'), { duration: 4000 });
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
        t('receptionist:toasts.reportDownloaded'),
        t('receptionist:toasts.reportDownloadedDesc'),
        { duration: 5000 }
      );
    } catch (error) {
      const errorMessage = extractErrorMessage(error) || t('receptionist:toasts.unableToExport');
      toast.error(t('receptionist:toasts.exportFailed'), errorMessage, { duration: 6000 });
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
          toast.success(t('receptionist:notifications.visitorCheckedIn', { name: data.visitorName }));
        } else {
          toast.info(t('receptionist:notifications.visitorCheckedOut', { name: data.visitorName }));
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
      
      if (validationResult.detectionAvailable === false) {
        console.log('Face detection service is disabled/unavailable, skipping validation');

        toast.success(
          t('receptionist:toasts.photoAccepted'),
          validationResult.message || t('receptionist:toasts.faceDetectionUnavailable'),
          { duration: 3000 }
        );

        // Continue the flow without blocking
      } else if (!validationResult.faceDetected) {
        toast.error(
          t('receptionist:toasts.noFaceDetected'),
          validationResult.message || t('receptionist:toasts.noFaceDetectedDesc'),
          { duration: 6000 }
        );
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
            t('receptionist:toasts.returningVisitor'),
            t('receptionist:toasts.returningVisitorDesc', { name: recognizedVisitorData.fullName }),
            { duration: 5000 }
          );
          setRecognizedVisitor(recognizedVisitorData);
        } else {
          // New visitor
          console.log('No matching visitor found - new visitor');
          toast.success(
            t('receptionist:toasts.faceDetected'),
            t('receptionist:toasts.faceDetectedDesc'),
            { duration: 3000 }
          );
          setRecognizedVisitor(null);
        }
      } catch (searchError) {
        // Face recognition failed or unavailable - proceed as new visitor
        console.warn('Face recognition search failed:', searchError);
        toast.success(
          t('receptionist:toasts.faceDetected'),
          t('receptionist:toasts.faceDetectedDesc'),
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
                          t('receptionist:toasts.photoValidationFailedDefault');

      toast.error(
        t('receptionist:toasts.validationFailed'),
        errorMessage + t('receptionist:toasts.validationFailedSuffix'),
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
                  t('receptionist:toasts.faceRecognitionError'),
                  photoResult.warningMessage,
                  { duration: 10000 }
                );
                break;
              case 'PartialSuccess':
                toast.warning(
                  t('receptionist:toasts.partialSuccess'),
                  photoResult.warningMessage,
                  { duration: 7000 }
                );
                break;
              case 'ServiceUnavailable':
                toast.info(
                  t('receptionist:toasts.faceDetectionUnavailableTitle'),
                  photoResult.warningMessage,
                  { duration: 6000 }
                );
                break;
              default:
                if (photoResult.warningMessage) {
                  toast.warning(t('receptionist:toasts.photoUploadWarning'), photoResult.warningMessage, { duration: 6000 });
                }
            }
          } else if (photoResult && photoResult.faceDetected && photoResult.faceRecognitionEnabled) {
            // Success case - face detected and recognition enabled
            toast.success(
              t('receptionist:toasts.photoUploaded'),
              t('receptionist:toasts.photoUploadedDesc'),
              { duration: 4000 }
            );
          }
        } catch (photoError) {
          console.error('Failed to upload profile photo:', photoError);

          // Extract error message from API response
          const errorMessage = photoError.response?.data?.errors?.[0] ||
                              photoError.response?.data?.message ||
                              photoError.message ||
                              t('receptionist:toasts.photoUploadFailedDefault');

          // Note: "No face detected" errors should NOT happen here since we validate
          // the photo before accepting it. This is just a safety net.
          toast.error(
            t('receptionist:toasts.photoUploadFailed'),
            errorMessage + t('receptionist:toasts.photoUploadFailedDesc'),
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
              description: t('receptionist:walkIn.walkInDocumentDescription', {
                type: doc.documentType || t('receptionist:walkIn.defaultDocumentType')
              }),
              documentType: doc.documentType || t('receptionist:walkIn.defaultDocumentType'),
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
        subject: t('receptionist:walkIn.walkInSubject', {
          purpose: visitData.visitPurposeName || t('receptionist:walkIn.defaultPurpose')
        }),
        type: 'walkin',  // Identify walk-ins with distinct type
        expectedVisitorCount: 1,
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date(Date.now() + visitData.duration * 60 * 1000).toISOString(),
        requiresApproval: false, // Walk-ins bypass approval
        submitForApproval: false,
        notes: visitData.notes || t('receptionist:systemNotes.walkInRegistered')
      });
      
      // Step 4: Auto-approve (receptionist has permission)
      try {
        await invitationService.approveInvitation(
          invitation.id,
          t('receptionist:systemNotes.walkInAutoApproved')
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
          notes: t('receptionist:systemNotes.walkInImmediateCheckIn')
        })).unwrap();
      } catch (checkInError) {
        console.error('Check-in failed:', checkInError);
        // Still show success - visitor and invitation created
        toast.warning(
          t('receptionist:toasts.checkInRequiresApproval'),
          t('receptionist:toasts.checkInRequiresApprovalDesc'),
          { duration: 6000 }
        );
      }

      // Step 6: Show success message with badge printing option
      const visitorName = `${visitor.firstName} ${visitor.lastName}`;

      toast.success(
        t('receptionist:toasts.walkInSuccessful'),
        t('receptionist:toasts.walkInSuccessDesc', {
          name: visitorName,
          action: checkInResult ? t('receptionist:toasts.checkedIn') : t('receptionist:toasts.registered'),
          host: visitData.hostName
        }),
        {
          duration: 8000,
          actions: [
            {
              label: t('receptionist:toasts.printBadge'),
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
      toast.error(t('receptionist:toasts.walkInFailed'), errorMessage, { duration: 6000 });
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
          notes: t('receptionist:systemNotes.qrCheckIn')
        })).unwrap();

        toast.success(
          t('receptionist:toasts.checkInSuccessful'),
          t('receptionist:toasts.checkInSuccessDesc', { name: result?.visitor?.fullName || t('receptionist:activeVisitors.visitorLabel') }),
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
            message: errorMessage || t('receptionist:scanner.checkInFailed'),
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
            message: t('receptionist:invitationModal.notFoundTitle'),
            details: t('receptionist:invitationModal.notFoundDesc')
          });
          setShowInvitationDetailsModal(true);
        }
      } catch (error) {
        console.error('Failed to fetch invitation details:', error);
        const errorMessage = extractErrorMessage(error);

        if (error.response?.status === 404 || errorMessage?.includes('not found')) {
          setInvitationDetailsError({
            message: t('receptionist:scanner.invitationReferenceNotFound', { reference: qrData }),
            details: t('receptionist:invitationModal.notFoundDesc')
          });
        } else {
          setInvitationDetailsError({
            message: errorMessage || t('receptionist:scanner.failedLoadInvitationDetails'),
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
      return t('receptionist:scanner.errorDetails.tooEarly');
    } else if (errorMessage.includes('expired') || errorMessage.includes('scheduled to end')) {
      return t('receptionist:scanner.errorDetails.expired');
    } else if (errorMessage.includes('not found') || errorMessage.includes('404')) {
      return t('receptionist:scanner.errorDetails.notFound');
    } else if (errorMessage.includes('Only approved invitations') || errorMessage.includes('not been approved') || errorMessage.includes('not approved')) {
      return t('receptionist:scanner.errorDetails.notApproved');
    } else if (errorMessage.includes('already checked in')) {
      return t('receptionist:scanner.errorDetails.alreadyCheckedIn');
    }
    return null;
  };

  // Handle manual confirmation of check-in
  const handleConfirmCheckIn = async (invitationReference, notes = '') => {
    try {
      const result = await dispatch(checkInInvitation({
        invitationReference,
        notes: notes || t('receptionist:systemNotes.manualConfirmationCheckIn')
      })).unwrap();

      setShowInvitationDetailsModal(false);
      setInvitationDetailsData(null);
      setInvitationDetailsError(null);

      toast.success(
        t('receptionist:toasts.checkInSuccessful'),
        t('receptionist:toasts.checkInSuccessDesc', { name: result?.visitor?.fullName || t('receptionist:activeVisitors.visitorLabel') }),
        { duration: 5000 }
      );

      // Refresh data
      await dispatch(getActiveInvitations());
      await loadDashboardData();
    } catch (error) {
      console.error('Confirmed check-in failed:', error);
      const errorMessage = extractErrorMessage(error);
      toast.error(t('receptionist:toasts.checkInFailed'), errorMessage, { duration: 6000 });
    }
  };

  const handleQuickCheckIn = async (invitation) => {
    try {
      await dispatch(checkInInvitation({
        invitationReference: invitation.invitationNumber || invitation.id?.toString(),
        notes: t('receptionist:systemNotes.quickCheckIn')
      })).unwrap();

      toast.success(t('receptionist:toasts.checkInSuccessful'), t('receptionist:toasts.checkInSuccessDesc', { name: t('receptionist:activeVisitors.visitorLabel') }));
      loadDashboardData();
      dispatch(getActiveInvitations());
    } catch (error) {
      toast.error(t('receptionist:toasts.checkInFailed'), extractErrorMessage(error));
    }
  };

  // Handle visitor check-out
  const handleCheckOut = async (id) => {
    try {
      await dispatch(checkOutInvitation({
        id,
        notes: t('receptionist:systemNotes.manualCheckOut')
      })).unwrap();

      toast.success(t('receptionist:toasts.checkOutSuccessful'), t('receptionist:toasts.checkOutSuccessDesc'));

      loadDashboardData();
      dispatch(getActiveInvitations());
    } catch (error) {
      console.error('Check-out failed:', error);
      toast.error(t('receptionist:toasts.checkOutFailed'), extractErrorMessage(error));
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
              t('receptionist:documents.scannedDocumentName', { id: Date.now() }),
              doc.type || 'Other',
              {
                description: t('receptionist:documents.scannedByReceptionistOn', { time: doc.timestamp.toLocaleString() }),
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
      link.download = doc.originalFileName || doc.fileName || t('receptionist:documents.defaultDownloadName');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  const activeVisitorsColumns = createActiveVisitorColumns({
    t,
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
          {t('receptionist:activeVisitors.details')}
        </Button>
        {canCheckIn && (
          <Button
            variant="success"
            size="sm"
            onClick={() => handleQuickCheckIn(invitation)}
            icon={<ArrowRightOnRectangleIcon className="w-4 h-4" />}
          >
            {t('receptionist:activeVisitors.checkIn')}
          </Button>
        )}
        {isCheckedIn && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleCheckOut(invitation.id)}
            icon={<ArrowLeftOnRectangleIcon className="w-4 h-4" />}
          >
            {t('receptionist:activeVisitors.checkOut')}
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-md">
              <ClockIconSolid className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('receptionist:stats.expectedVisitors')}</p>
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-md">
              <CheckCircleIconSolid className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('receptionist:stats.checkedIn')}</p>
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-md">
              <UsersIcon className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('receptionist:stats.pendingCheckOut')}</p>
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
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-md">
              <UserPlusIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('receptionist:stats.walkInsToday')}</p>
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
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${todayStats.overdueVisitors > 0 ? 'bg-red-100 dark:bg-red-900/50' : 'bg-gray-100 dark:bg-gray-800'}`}>
              <ClockIcon className={`w-6 h-6 ${todayStats.overdueVisitors > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-300'}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t('receptionist:stats.overdueVisitors')}</p>
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
      <nav className="-mb-px flex min-w-max gap-4">
        {[
          { id: 'overview', label: t('receptionist:tabs.overview'), icon: EyeIcon },
          { id: 'scanner', label: t('receptionist:tabs.scanner'), icon: QrCodeIcon },
          { id: 'walk-in', label: t('receptionist:tabs.walkIn'), icon: UserPlusIcon },
          { id: 'active', label: t('receptionist:tabs.active', { count: todayStats.pendingCheckOut }), icon: UsersIcon },
          { id: 'documents', label: t('receptionist:tabs.documents'), icon: DocumentTextIcon }
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
            <div className="flex items-center gap-2">
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('receptionist:dashboard.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('receptionist:dashboard.subtitle')}</p>
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
            {t('receptionist:dashboard.refresh')}
          </Button>
          {canExportInBuildingReport && (
            <Button
              onClick={handleInBuildingExport}
              loading={exportingReport}
              icon={<ArrowDownTrayIcon className="w-4 h-4" />}
            >
              {t('receptionist:dashboard.exportInBuilding')}
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
              <h2 className="text-xl font-semibold mb-4">{t('receptionist:overview.quickActions')}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button
                  onClick={() => setActiveTab('scanner')}
                  icon={<QrCodeIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  {t('receptionist:overview.scanQrCode')}
                </Button>
                <Button
                  onClick={() => setActiveTab('walk-in')}
                  icon={<UserPlusIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  {t('receptionist:overview.registerWalkIn')}
                </Button>
                <Button
                  onClick={() => setActiveTab('documents')}
                  icon={<DocumentTextIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  {t('receptionist:overview.scanDocuments')}
                </Button>
                <Button
                  onClick={() => setActiveTab('active')}
                  icon={<UsersIcon className="w-5 h-5" />}
                  className="h-20"
                >
                  {t('receptionist:overview.viewActiveVisitors')}
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-4">{t('receptionist:scanner.title')}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-md mx-auto">
                  {t('receptionist:scanner.description')}
                </p>

                {/* Auto/Manual Check-in Mode Toggle */}
                <div className="flex justify-center items-center gap-4 mb-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={autoCheckInMode}
                      onChange={(e) => setAutoCheckInMode(e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {t('receptionist:scanner.autoCheckInMode')}
                    </span>
                  </label>
                </div>

                <Button
                  onClick={() => setShowScannerModal(true)}
                  icon={<QrCodeIcon className="w-5 h-5" />}
                  size="lg"
                  className="mx-auto"
                >
                  {t('receptionist:scanner.openScanner')}
                </Button>

                {scanError && (
                  <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md max-w-md mx-auto">
                    <p className="text-red-600 dark:text-red-300 text-sm">{scanError}</p>
                  </div>
                )}
                {scanResult && (
                  <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md max-w-md mx-auto">
                    <p className="text-green-600 dark:text-green-300">{t('receptionist:scanner.checkInSuccessful')}</p>
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
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">{t('receptionist:walkIn.sectionTitle')}</h2>

              {showCameraCapture ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('receptionist:walkIn.captureTitle')}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{t('receptionist:walkIn.captureSubtitle')}</p>
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
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">{t('receptionist:walkIn.registerTitle')}</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">{t('receptionist:walkIn.registerSubtitle')}</p>

                  {/* Walk-in registration options */}
                  <div className="space-y-4 max-w-md mx-auto">
                    {/* Start with photo capture */}
                    <Button
                      onClick={handleStartCameraCapture}
                      icon={<CameraIcon className="w-5 h-5" />}
                      className="w-full"
                    >
                      {t('receptionist:walkIn.startWithPhoto')}
                    </Button>

                    {/* Skip photo and go to form */}
                    <Button
                      onClick={handleStartWalkInRegistration}
                      variant="outline"
                      icon={<DocumentTextIcon className="w-5 h-5" />}
                      className="w-full"
                    >
                      {t('receptionist:walkIn.skipPhoto')}
                    </Button>
                  </div>

                  {/* Show captured photo if available */}
                  {capturedPhoto && (
                    <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-200 dark:bg-gray-700 ring-2 ring-white shadow">
                            <img
                              src={capturedPhoto.url}
                              alt={t('receptionist:walkIn.capturedPhotoAlt')}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="text-start">
                            <p className="text-sm font-semibold text-green-800 dark:text-green-300">{t('receptionist:walkIn.photoCapturedSuccess')}</p>
                            <p className="text-xs text-green-600 dark:text-green-400">{t('receptionist:walkIn.photoCapturedSubtitle')}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            size="sm"
                            onClick={handleStartRegistrationWithPhoto}
                            icon={<DocumentTextIcon className="w-4 h-4" />}
                          >
                            {t('receptionist:walkIn.startRegistration')}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setCapturedPhoto(null)}
                            icon={<XCircleIcon className="w-4 h-4" />}
                          >
                            {t('receptionist:walkIn.remove')}
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
                      emptyMessage={t('receptionist:activeVisitors.noActiveVisitorsTable')}
                    />
                  </div>
                )
              ) : (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">{t('receptionist:activeVisitors.noActiveVisitors')}</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    {t('receptionist:activeVisitors.noActiveVisitorsDesc')}
                  </p>
                </div>
              )}
            </Card>

            {/* Expanded Details Modal for Documents */}
            {expandedVisitorId && (
              <Modal
                isOpen={!!expandedVisitorId}
                onClose={() => setExpandedVisitorId(null)}
                title={t('receptionist:documents.visitorDocuments')}
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
                              <div className="flex items-center gap-2">
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
                            <div className="flex items-center gap-1">
                              {doc.isSensitive && (
                                <Badge variant="warning" size="xs">{t('receptionist:documents.sensitive')}</Badge>
                              )}
                              {doc.isRequired && (
                                <Badge variant="info" size="xs">{t('receptionist:documents.required')}</Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <button
                              onClick={() => handlePreviewDocument(expandedVisitorId, doc)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
                            >
                              <EyeIcon className="w-3.5 h-3.5" />
                              <span>{t('receptionist:documents.preview')}</span>
                            </button>
                            <button
                              onClick={() => handleDownloadDocument(expandedVisitorId, doc)}
                              className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                            >
                              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
                              <span>{t('receptionist:documents.download')}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t('receptionist:documents.noDocuments')}</p>
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
              <h2 className="text-xl font-semibold mb-4">{t('receptionist:documents.sectionTitle')}</h2>
              
              {showDocumentScanner ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{t('receptionist:documents.scanScannerTitle')}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedVisitorForDocs 
                        ? t('receptionist:documents.scanningFor', { name: selectedVisitorForDocs.fullName })
                        : t('receptionist:documents.scanningLocal')
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
                  <h3 className="text-lg font-medium text-gray-700 mb-2">{t('receptionist:documents.scanTitle')}</h3>
                  <p className="text-gray-500 mb-6">
                    {t('receptionist:documents.scanSubtitle')}
                  </p>
                  
                  <div className="space-y-4 max-w-md mx-auto">
                    <Button
                      onClick={() => handleStartDocumentScanning()}
                      icon={<DocumentTextIcon className="w-5 h-5" />}
                      className="w-full"
                    >
                      {t('receptionist:documents.startScanning')}
                    </Button>
                    
                    <div className="text-sm text-gray-600">
                      <p className="mb-2"><strong>{t('receptionist:documents.supportedTypes')}</strong></p>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {[
                          t('receptionist:documents.types.idCards'),
                          t('receptionist:documents.types.passports'),
                          t('receptionist:documents.types.visas'),
                          t('receptionist:documents.types.permits'),
                          t('receptionist:documents.types.certificates')
                        ].map(type => (
                          <Badge key={type} color="gray" size="sm">{type}</Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Recent scanned documents */}
                  {scannedDocuments.length > 0 && (
                    <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h4 className="font-medium text-blue-900 mb-2">
                        {t('receptionist:documents.recentScans', { count: scannedDocuments.length })}
                      </h4>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {scannedDocuments.slice(0, 6).map((doc, index) => (
                          <div key={doc.id} className="relative">
                            <img 
                              src={doc.url} 
                              alt={t('receptionist:documents.scanAlt', { index: index + 1 })}
                              className="w-full h-16 object-cover rounded border cursor-pointer hover:opacity-75"
                              onClick={() => window.open(doc.url, '_blank')}
                            />
                            <Badge 
                              color="blue" 
                              size="xs" 
                              className="absolute bottom-0 end-0 transform translate-x-1 translate-y-1"
                            >
                              {index + 1}
                            </Badge>
                          </div>
                        ))}
                      </div>
                      {scannedDocuments.length > 6 && (
                        <p className="text-xs text-blue-600 mt-2">
                          {t('receptionist:documents.moreDocuments', { count: scannedDocuments.length - 6 })}
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
          title={t('receptionist:scanner.modalTitle')}
          size="lg"
        >
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              {t('receptionist:scanner.modalDescription')}
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
