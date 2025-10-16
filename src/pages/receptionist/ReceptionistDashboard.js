// src/pages/receptionist/ReceptionistDashboard.js
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Services
import visitorService from '../../services/visitorService';
import invitationService from '../../services/invitationService';
import visitorDocumentService from '../../services/visitorDocumentService';

// Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Badge from '../../components/common/Badge/Badge';
import QrCodeScanner from '../../components/checkin/QrCodeScanner/QrCodeScanner';
import VisitorForm from '../../components/visitor/VisitorForm/VisitorForm';
import CameraCapture from '../../components/camera/CameraCapture';
import DocumentScanner from '../../components/scanner/DocumentScanner';

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
  XCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleIconSolid,
  ClockIcon as ClockIconSolid
} from '@heroicons/react/24/solid';

// Utils
import formatters from '../../utils/formatters';
import { extractErrorMessage } from '../../utils/errorUtils';

/**
 * Receptionist Dashboard Component
 * Central interface for receptionist operations including:
 * - Walk-in visitor registration
 * - QR code scanning for check-ins
 * - Active visitor management
 * - Photo capture and document handling
 */
const ReceptionistDashboard = () => {
  // State management
  const [activeTab, setActiveTab] = useState('overview'); // 'overview', 'walk-in', 'scanner', 'active', 'documents'
  const [todayStats, setTodayStats] = useState({
    expectedVisitors: 0,
    checkedIn: 0,
    pendingCheckOut: 0,
    walkIns: 0
  });
  
  // Walk-in registration state
  const [showWalkInForm, setShowWalkInForm] = useState(false);
  const [walkInLoading, setWalkInLoading] = useState(false);
  const [walkInError, setWalkInError] = useState(null);
  const [showCameraCapture, setShowCameraCapture] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  
  // Document scanning state
  const [showDocumentScanner, setShowDocumentScanner] = useState(false);
  const [scannedDocuments, setScannedDocuments] = useState([]);
  const [selectedVisitorForDocs, setSelectedVisitorForDocs] = useState(null);
  
  // Scanner state
  const [scannerActive, setScannerActive] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [scanError, setScanError] = useState(null);
  
  // Active visitors state
  const [activeVisitors, setActiveVisitors] = useState([]);
  const [activeVisitorsLoading, setActiveVisitorsLoading] = useState(false);

  // Load dashboard data
  useEffect(() => {
    loadDashboardData();
    loadActiveVisitors();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Get today's invitations for stats
      const today = new Date();
      const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      const todayInvitations = await invitationService.getInvitations({
        startDate: startOfDay.toISOString(),
        endDate: endOfDay.toISOString(),
        pageSize: 1000 // Get all for counting
      });

      setTodayStats({
        expectedVisitors: todayInvitations.data?.totalCount || 0,
        checkedIn: todayInvitations.data?.items?.filter(inv => inv.status === 'CheckedIn').length || 0,
        pendingCheckOut: todayInvitations.data?.items?.filter(inv => inv.status === 'CheckedIn').length || 0,
        walkIns: todayInvitations.data?.items?.filter(inv => inv.type === 'WalkIn').length || 0
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    }
  };

  const loadActiveVisitors = async () => {
    try {
      setActiveVisitorsLoading(true);
      const active = await invitationService.getActiveInvitations();
      setActiveVisitors(active.data?.items || []);
    } catch (error) {
      console.error('Failed to load active visitors:', error);
    } finally {
      setActiveVisitorsLoading(false);
    }
  };

  // Handle photo capture from camera
  const handlePhotoCapture = (photoData) => {
    setCapturedPhoto(photoData);
    setShowCameraCapture(false);
  };

  // Handle starting walk-in registration
  const handleStartWalkInRegistration = () => {
    setShowWalkInForm(true);
    setShowCameraCapture(false);
    setCapturedPhoto(null);
    setWalkInError(null);
  };

  // Handle starting camera capture
  const handleStartCameraCapture = () => {
    setShowCameraCapture(true);
    setShowWalkInForm(false);
  };

  // Handle walk-in visitor registration
  const handleWalkInRegistration = async (visitorData) => {
    try {
      setWalkInLoading(true);
      setWalkInError(null);

      // Include captured photo in visitor data
      const visitorPayload = {
        ...visitorData,
        photo: capturedPhoto ? {
          file: capturedPhoto.file,
          url: capturedPhoto.url
        } : null
      };

      // Create visitor
      const visitor = await visitorService.createVisitor(visitorPayload);

      // Upload photo if captured
      if (capturedPhoto) {
        try {
          await visitorDocumentService.uploadVisitorPhoto(visitor.id, capturedPhoto.file, {
            description: 'Walk-in visitor photo captured by receptionist',
            isSensitive: false,
            isRequired: false
          });
        } catch (photoError) {
          console.warn('Failed to upload photo:', photoError);
          // Continue with registration even if photo upload fails
        }
      }

      // Create expedited invitation for walk-in
      const invitation = await invitationService.createInvitation({
        visitorId: visitor.id,
        subject: 'Walk-in Visit',
        type: 'WalkIn',
        scheduledStartTime: new Date().toISOString(),
        scheduledEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
        requiresApproval: false, // Walk-ins get expedited approval
        submitForApproval: true
      });

      // Auto-approve for walk-ins (if user has permission)
      try {
        await invitationService.approveInvitation(invitation.id, 'Walk-in visitor - expedited approval');
      } catch (approvalError) {
        console.warn('Could not auto-approve walk-in, manual approval needed');
      }

      // Reset form state
      setShowWalkInForm(false);
      setShowCameraCapture(false);
      setCapturedPhoto(null);
      
      // Refresh data
      loadDashboardData();
      loadActiveVisitors();
      
      return { success: true, visitor, invitation };
    } catch (error) {
      setWalkInError(extractErrorMessage(error));
      throw error;
    } finally {
      setWalkInLoading(false);
    }
  };

  // Handle QR code scanning
  const handleQrScan = async (qrData) => {
    try {
      setScanError(null);
      
      // Validate QR code
      const validationResult = await invitationService.validateQrCode(qrData);
      
      if (validationResult.isValid) {
        // Process check-in
        const checkInResult = await invitationService.checkInInvitation(qrData, 'QR code scan check-in');
        setScanResult(checkInResult);
        loadDashboardData();
        loadActiveVisitors();
      } else {
        setScanError('Invalid QR code or expired invitation');
      }
    } catch (error) {
      setScanError(extractErrorMessage(error));
    }
  };

  // Handle visitor check-out
  const handleCheckOut = async (invitationId) => {
    try {
      await invitationService.checkOutInvitation(invitationId, 'Manual check-out by receptionist');
      loadDashboardData();
      loadActiveVisitors();
    } catch (error) {
      console.error('Check-out failed:', error);
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

  // Render stats cards
  const renderStatsCards = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Expected Visitors</h3>
            <p className="text-3xl font-bold text-blue-600">{todayStats.expectedVisitors}</p>
          </div>
          <ClockIconSolid className="w-12 h-12 text-blue-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Checked In</h3>
            <p className="text-3xl font-bold text-green-600">{todayStats.checkedIn}</p>
          </div>
          <CheckCircleIconSolid className="w-12 h-12 text-green-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Pending Check-out</h3>
            <p className="text-3xl font-bold text-orange-600">{todayStats.pendingCheckOut}</p>
          </div>
          <UsersIcon className="w-12 h-12 text-orange-500" />
        </div>
      </Card>

      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Walk-ins Today</h3>
            <p className="text-3xl font-bold text-purple-600">{todayStats.walkIns}</p>
          </div>
          <UserPlusIcon className="w-12 h-12 text-purple-500" />
        </div>
      </Card>
    </div>
  );

  // Render tab navigation
  const renderTabNavigation = () => (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
      {[
        { id: 'overview', label: 'Overview', icon: EyeIcon },
        { id: 'scanner', label: 'QR Scanner', icon: QrCodeIcon },
        { id: 'walk-in', label: 'Walk-in Registration', icon: UserPlusIcon },
        { id: 'documents', label: 'Document Scanner', icon: DocumentTextIcon },
        { id: 'active', label: 'Active Visitors', icon: UsersIcon }
      ].map(tab => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-colors ${
            activeTab === tab.id
              ? 'bg-white text-blue-600 shadow-sm'
              : 'text-gray-600 hover:text-gray-800'
          }`}
        >
          <tab.icon className="w-5 h-5" />
          <span>{tab.label}</span>
        </button>
      ))}
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Receptionist Dashboard</h1>
        <p className="text-gray-600 mt-2">Manage visitor check-ins, walk-in registrations, and daily operations</p>
      </div>

      {renderStatsCards()}
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
              <h2 className="text-xl font-semibold mb-4">QR Code Scanner</h2>
              <QrCodeScanner
                onScan={handleQrScan}
                loading={false}
                className="max-w-md mx-auto"
              />
              {scanError && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600">{scanError}</p>
                </div>
              )}
              {scanResult && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-green-600">Check-in successful!</p>
                </div>
              )}
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
              <h2 className="text-xl font-semibold mb-4">Walk-in Visitor Registration</h2>
              
              {showCameraCapture ? (
                <div>
                  <div className="mb-4">
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Capture Visitor Photo</h3>
                    <p className="text-sm text-gray-600">Take a photo of the visitor for their profile</p>
                  </div>
                  <CameraCapture
                    onPhotoCapture={handlePhotoCapture}
                    onCancel={() => setShowCameraCapture(false)}
                    maxWidth={400}
                    maxHeight={400}
                    quality={0.8}
                  />
                </div>
              ) : !showWalkInForm ? (
                <div className="text-center py-8">
                  <UserPlusIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">Register a Walk-in Visitor</h3>
                  <p className="text-gray-500 mb-6">Create a new visitor profile and invitation for unscheduled visitors</p>
                  
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
                      Skip Photo - Go to Registration Form
                    </Button>
                  </div>

                  {/* Show captured photo if available */}
                  {capturedPhoto && (
                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-center justify-center space-x-4">
                        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={capturedPhoto.url} 
                            alt="Captured visitor photo" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-green-800">Photo captured successfully!</p>
                          <p className="text-xs text-green-600">Click "Start Registration" to continue</p>
                        </div>
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
                  )}
                </div>
              ) : (
                <div>
                  {/* Show captured photo summary */}
                  {capturedPhoto && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                          <img 
                            src={capturedPhoto.url} 
                            alt="Captured visitor photo" 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-blue-800">Visitor photo captured</p>
                          <p className="text-xs text-blue-600">Photo will be attached to visitor profile</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={handleStartCameraCapture}
                          icon={<CameraIcon className="w-4 h-4" />}
                        >
                          Retake
                        </Button>
                      </div>
                    </div>
                  )}

                  <VisitorForm
                    onSubmit={handleWalkInRegistration}
                    onCancel={() => {
                      setShowWalkInForm(false);
                      setCapturedPhoto(null);
                    }}
                    loading={walkInLoading}
                    error={walkInError}
                    isEdit={false}
                    createInvitation={true}
                    invitationDefaults={{
                      type: 'WalkIn',
                      subject: 'Walk-in Visit',
                      requiresApproval: false
                    }}
                    initialPhoto={capturedPhoto}
                  />
                </div>
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
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Active Visitors</h2>
              {activeVisitorsLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading active visitors...</p>
                </div>
              ) : activeVisitors.length === 0 ? (
                <div className="text-center py-8">
                  <UsersIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">No Active Visitors</h3>
                  <p className="text-gray-500">No visitors are currently checked in</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {activeVisitors.map(invitation => (
                    <div key={invitation.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold">
                              {invitation.visitor?.firstName?.[0]}{invitation.visitor?.lastName?.[0]}
                            </span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {invitation.visitor?.fullName || 'Unknown Visitor'}
                            </h3>
                            <p className="text-gray-500 text-sm">{invitation.visitor?.company}</p>
                            <p className="text-gray-500 text-sm">
                              Host: {invitation.host?.fullName || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge color="green">Checked In</Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCheckOut(invitation.id)}
                            icon={<ArrowLeftOnRectangleIcon className="w-4 h-4" />}
                          >
                            Check Out
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
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
    </div>
  );
};

export default ReceptionistDashboard;
