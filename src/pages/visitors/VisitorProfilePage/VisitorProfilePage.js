// src/pages/visitors/VisitorProfilePage/VisitorProfilePage.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../hooks/usePermissions';
import { useToast } from '../../../hooks/useNotifications';

// Redux
import {
  getVisitorById,
  updateVisitor,
  deleteVisitor,
  clearError,
  markAsVip,
  removeVipStatus,
  blacklistVisitor,
  removeBlacklist
} from '../../../store/slices/visitorsSlice';
import { selectCurrentVisitor, selectVisitorsLoading, selectVisitorsUpdateLoading } from '../../../store/selectors/visitorSelectors';
import { setPageTitle } from '../../../store/slices/uiSlice';

// Invitation actions
import { createInvitation } from '../../../store/slices/invitationsSlice';

// Services
import visitorService from '../../../services/visitorService';
import visitorDocumentService from '../../../services/visitorDocumentService';
import visitorNoteService from '../../../services/visitorNoteService';

// Components
import Button from '../../../components/common/Button/Button';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import DocumentPreview from '../../../components/documents/DocumentPreview';
import DocumentManager from '../../../components/visitor/DocumentManager/DocumentManager';
import VisitorForm from '../../../components/visitor/VisitorForm/VisitorForm';
import EmergencyContactsList from '../../../components/visitor/EmergencyContactsList/EmergencyContactsList';
import AddNoteModal from '../../../components/visitor/AddNoteModal/AddNoteModal';
import InvitationForm from '../../../components/invitation/InvitationForm/InvitationForm';

// Icons
import {
  UserIcon,
  DocumentTextIcon,
  PhotoIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
  StarIcon as StarIconOutline,
  ShieldExclamationIcon,
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  IdentificationIcon,
  GlobeAltIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  CloudArrowDownIcon,
  EyeIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Utils
import { formatDateTime, formatDate } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Comprehensive Visitor Profile Page
 * Replaces the basic details modal with full profile functionality
 */
const VisitorProfilePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();
  const toast = useToast();
  const { t } = useTranslation(['visitors', 'common']);

  const [hasUnsavedEditChanges, setHasUnsavedEditChanges] = useState(false);

  // Redux state
  const visitor = useSelector(selectCurrentVisitor);
  const loading = useSelector(selectVisitorsLoading);
  const updateLoading = useSelector(selectVisitorsUpdateLoading);

  // Local state
  const [activeTab, setActiveTab] = useState('overview');
  const [documents, setDocuments] = useState([]);
  const [notes, setNotes] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);
  const [photoUploading, setPhotoUploading] = useState(false);

  // Modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDocumentViewer, setShowDocumentViewer] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showAddNoteModal, setShowAddNoteModal] = useState(false);
  const [showBlacklistModal, setShowBlacklistModal] = useState(false);
  const [blacklistReason, setBlacklistReason] = useState('');
  const [statusChangeLoading, setStatusChangeLoading] = useState(false);
  const [showCreateInvitationModal, setShowCreateInvitationModal] = useState(false);

  // Tab configuration
  const tabs = [
    { id: 'overview', name: t('visitors:profile.tabs.overview'), icon: UserIcon, description: 'Basic information and status' },
    { id: 'documents', name: t('visitors:profile.tabs.documents'), icon: DocumentTextIcon, description: 'Uploaded documents and files' },
    { id: 'notes', name: t('visitors:profile.tabs.notes'), icon: ClipboardDocumentListIcon, description: 'Visitor notes and history' },
    { id: 'emergency', name: t('visitors:profile.tabs.emergencyContacts'), icon: UserGroupIcon, description: 'Emergency contact information' },
    { id: 'activity', name: t('visitors:profile.tabs.activity'), icon: ChartBarIcon, description: 'Visit history and statistics' }
  ];

  // Load visitor data on component mount
  useEffect(() => {
    dispatch(setPageTitle(t('visitors:profile.title')));
    if (id) {
      dispatch(getVisitorById(parseInt(id)));
    }

    return () => {
      dispatch(clearError());
    };
  }, [dispatch, id, t]);

  // Load additional data when visitor is loaded
  useEffect(() => {
    if (visitor?.id) {
      loadDocuments();
      loadNotes();
    }
  }, [visitor?.id]);

  // Load documents
  const loadDocuments = async () => {
    if (!visitor?.id) return;

    setDocumentsLoading(true);
    try {
      const docs = await visitorDocumentService.getVisitorDocuments(visitor.id);
      setDocuments(docs);
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Load notes
  const loadNotes = async () => {
    if (!visitor?.id) return;

    setNotesLoading(true);
    try {
      const visitorNotes = await visitorNoteService.getVisitorNotes(visitor.id);
      setNotes(visitorNotes);
    } catch (error) {
      console.error('Failed to load notes:', error);
    } finally {
      setNotesLoading(false);
    }
  };

  // Handle profile photo upload
  const handleUploadPhoto = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !visitor?.id) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!validTypes.includes(file.type)) {
      alert(t('visitors:photo.invalidType'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(t('visitors:photo.tooLarge'));
      return;
    }

    setPhotoUploading(true);
    try {
      const photoResult = await visitorService.uploadVisitorPhoto(visitor.id, file);

      // Reload visitor data to get updated photo URL
      await dispatch(getVisitorById(visitor.id));

      // Handle face detection feedback for non-critical warnings
      if (photoResult && photoResult.warningMessage) {
        switch (photoResult.warningType) {
          case 'ServiceError':
            toast.error(
              t('visitors:photo.serviceError'),
              photoResult.warningMessage,
              { duration: 10000 }
            );
            break;
          case 'PartialSuccess':
            toast.warning(
              t('visitors:photo.partialSuccess'),
              photoResult.warningMessage,
              { duration: 7000 }
            );
            break;
          case 'ServiceUnavailable':
            toast.info(
              t('visitors:photo.serviceUnavailable'),
              photoResult.warningMessage,
              { duration: 6000 }
            );
            break;
          default:
            if (photoResult.warningMessage) {
              toast.warning(t('visitors:photo.uploadWarning'), photoResult.warningMessage, { duration: 6000 });
            }
        }
      } else if (photoResult && photoResult.faceDetected && photoResult.faceRecognitionEnabled) {
        // Success case - face detected and recognition enabled
        toast.success(
          t('visitors:photo.uploadedSuccessfully'),
          t('visitors:photo.faceDetected'),
          { duration: 4000 }
        );
      } else {
        // Default success message
        toast.success(t('visitors:photo.uploaded'), t('visitors:photo.uploadedMessage'), { duration: 3000 });
      }

      // Clear the file input
      event.target.value = '';
    } catch (error) {
      console.error('Failed to upload photo:', error);

      // Extract error message from API response
      const errorMessage = error.response?.data?.errors?.[0] ||
                          error.response?.data?.message ||
                          extractErrorMessage(error) ||
                          t('visitors:photo.uploadFailed');

      // Check if it's a "no face detected" error
      if (errorMessage.toLowerCase().includes('no face detected')) {
        // Critical error - user must upload a different photo
        toast.error(
          t('visitors:photo.noFaceDetected'),
          t('visitors:photo.noFaceMessage'),
          { duration: 0 } // Don't auto-dismiss, let user read and acknowledge
        );
      } else {
        // Other errors
        toast.error(
          t('visitors:photo.uploadFail'),
          errorMessage,
          { duration: 6000 }
        );
      }

      // Don't clear the file input so user knows it failed
      // They can select a new file
    } finally {
      setPhotoUploading(false);
    }
  };

  // Handle profile photo remove
  const handleRemovePhoto = async () => {
    if (!visitor?.id || !visitor.profilePhotoUrl) return;

    if (!window.confirm(t('visitors:photo.confirmRemove'))) {
      return;
    }

    setPhotoUploading(true);
    try {
      await visitorService.removeVisitorPhoto(visitor.id);

      // Reload visitor data to get updated photo URL (will be null)
      await dispatch(getVisitorById(visitor.id));
    } catch (error) {
      console.error('Failed to remove photo:', error);
      alert(t('visitors:photo.removeFailed', { error: extractErrorMessage(error) }));
    } finally {
      setPhotoUploading(false);
    }
  };

  // Handle visitor update
  const handleUpdateVisitor = async (updatedData) => {
    try {
            await dispatch(updateVisitor({
              id: visitor.id,
              visitorData: updatedData
            })).unwrap();

      setHasUnsavedEditChanges(false);
      setShowEditModal(false);
      // Reload visitor data
      dispatch(getVisitorById(visitor.id));
    } catch (error) {
      console.error('Failed to update visitor:', error);
    }
  };

  // Handle visitor deletion
  const handleDeleteVisitor = async () => {
    try {
      await dispatch(deleteVisitor({ id: visitor.id })).unwrap();
      navigate('/visitors');
    } catch (error) {
      console.error('Failed to delete visitor:', error);
    }
  };

  // Handle document view
  const handleViewDocument = (document) => {
    setSelectedDocument(document);
    setShowDocumentViewer(true);
  };

  // Handle document download
  const handleDownloadDocument = async (document) => {
    try {
      const blob = await visitorDocumentService.downloadVisitorDocument(visitor.id, document.id);
      const url = window.URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = document.originalFileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to download document:', error);
    }
  };

  // Handle document upload
  const handleUploadDocument = async (file, metadata) => {
    try {
      const uploadedDocument = await visitorDocumentService.uploadVisitorDocument(
        visitor.id,
        file,
        metadata.title,
        metadata.documentType,
        {
          description: metadata.description,
          isSensitive: metadata.isSensitive,
          isRequired: metadata.isRequired,
          tags: metadata.tags
        }
      );

      // Reload documents
      loadDocuments();

      return uploadedDocument;
    } catch (error) {
      console.error('Failed to upload document:', error);
      throw error;
    }
  };

  // Handle document deletion
  const handleDeleteDocument = async (documentId) => {
    try {
      await visitorDocumentService.deleteVisitorDocument(visitor.id, documentId, false);

      // Reload documents
      loadDocuments();
    } catch (error) {
      console.error('Failed to delete document:', error);
      throw error;
    }
  };

  // Handle add note
  const handleAddNote = async (noteData) => {
    if (!visitor?.id) return;

    try {
      await visitorNoteService.createVisitorNote(visitor.id, noteData);

      // Reload notes
      await loadNotes();

      // Close modal
      setShowAddNoteModal(false);
    } catch (error) {
      console.error('Failed to add note:', error);
      throw error;
    }
  };

  // Handle mark as VIP
  const handleMarkAsVip = async () => {
    setStatusChangeLoading(true);
    try {
      await dispatch(markAsVip(visitor.id)).unwrap();

      // Reload visitor data
      dispatch(getVisitorById(visitor.id));
    } catch (error) {
      console.error('Failed to mark as VIP:', error);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Handle remove VIP status
  const handleRemoveVipStatus = async () => {
    setStatusChangeLoading(true);
    try {
      await dispatch(removeVipStatus(visitor.id)).unwrap();

      // Reload visitor data
      dispatch(getVisitorById(visitor.id));
    } catch (error) {
      console.error('Failed to remove VIP status:', error);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Handle blacklist visitor
  const handleBlacklistVisitor = async () => {
    if (!blacklistReason.trim()) return;

    setStatusChangeLoading(true);
    try {
      await dispatch(blacklistVisitor({
        id: visitor.id,
        reason: blacklistReason
      })).unwrap();

      // Close modal and reset
      setShowBlacklistModal(false);
      setBlacklistReason('');

      // Reload visitor data
      dispatch(getVisitorById(visitor.id));
    } catch (error) {
      console.error('Failed to blacklist visitor:', error);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Handle remove from blacklist
  const handleRemoveBlacklist = async () => {
    setStatusChangeLoading(true);
    try {
      await dispatch(removeBlacklist(visitor.id)).unwrap();

      // Reload visitor data
      dispatch(getVisitorById(visitor.id));
    } catch (error) {
      console.error('Failed to remove from blacklist:', error);
    } finally {
      setStatusChangeLoading(false);
    }
  };

  // Handle create invitation
  const handleCreateInvitation = async (invitationData) => {
    try {
      await dispatch(createInvitation({
        ...invitationData,
        visitorId: visitor.id
      })).unwrap();

      setShowCreateInvitationModal(false);
      console.log('✅ Invitation created successfully!');
    } catch (error) {
      console.error('Failed to create invitation:', error);
      throw error;
    }
  };

  // Get visitor status badge
  const getVisitorStatusBadge = (visitor) => {
    if (visitor.isBlacklisted) {
      return <Badge variant="danger" size="sm">{t('visitors:status.blacklisted')}</Badge>;
    }
    if (visitor.isVip) {
      return <Badge variant="success" size="sm">{t('visitors:vipBadge')}</Badge>;
    }
    return <Badge variant="info" size="sm">{t('visitors:status.standard')}</Badge>;
  };

  if (loading && !visitor) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!visitor) {
    return (
      <div className="text-center py-12 text-gray-900 dark:text-gray-100">
        <ExclamationTriangleIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{t('visitors:profile.notFound.title')}</h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {t('visitors:profile.notFound.message')}
        </p>
        <Button onClick={() => navigate('/visitors')} variant="outline">
          <ArrowLeftIcon className="w-4 h-4 me-2" />
          {t('visitors:backToList')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={() => navigate('/visitors')}
              variant="outline"
              size="sm"
            >
              <ArrowLeftIcon className="w-4 h-4 me-2" />
              {t('visitors:backToList')}
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}
              </h1>
              <div className="flex items-center gap-2 mt-1">
                {getVisitorStatusBadge(visitor)}
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {t('visitors:profile.createdOn', { date: formatDate(visitor.createdOn) })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {/* Create Invitation Button - Primary Action */}
            {hasPermission('Invitation.Create') && !visitor.isBlacklisted && (
              <Button
                onClick={() => setShowCreateInvitationModal(true)}
                variant="primary"
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <PlusIcon className="w-4 h-4 me-2" />
                {t('visitors:actions.createInvitation')}
              </Button>
            )}

            {/* VIP Status Button */}
            {hasPermission('Visitor.MarkAsVip') && !visitor.isVip && !visitor.isBlacklisted && (
              <Button
                onClick={handleMarkAsVip}
                variant="outline"
                size="sm"
                loading={statusChangeLoading}
                className="text-yellow-600 hover:text-yellow-700 border-yellow-300 hover:border-yellow-400 dark:text-yellow-300 dark:hover:text-yellow-200 dark:border-yellow-500 dark:hover:border-yellow-400"
              >
                <StarIconOutline className="w-4 h-4 me-2" />
                {t('visitors:actions.markVip')}
              </Button>
            )}

            {hasPermission('Visitor.RemoveVipStatus') && visitor.isVip && (
              <Button
                onClick={handleRemoveVipStatus}
                variant="outline"
                size="sm"
                loading={statusChangeLoading}
                className="text-gray-600 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <StarIconSolid className="w-4 h-4 me-2 text-yellow-500" />
                {t('visitors:actions.removeVip')}
              </Button>
            )}

            {/* Blacklist Status Button */}
            {hasPermission('Visitor.Blacklist') && !visitor.isBlacklisted && (
              <Button
                onClick={() => setShowBlacklistModal(true)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-300 hover:border-red-400 dark:text-red-400 dark:hover:text-red-300 dark:border-red-500 dark:hover:border-red-400"
              >
                <ShieldExclamationIcon className="w-4 h-4 me-2" />
                {t('visitors:actions.blacklist')}
              </Button>
            )}

            {hasPermission('Visitor.RemoveBlacklist') && visitor.isBlacklisted && (
              <Button
                onClick={handleRemoveBlacklist}
                variant="outline"
                size="sm"
                loading={statusChangeLoading}
                className="text-green-600 hover:text-green-700 border-green-300 hover:border-green-400"
              >
                <ShieldExclamationIcon className="w-4 h-4 me-2" />
                {t('visitors:actions.removeBlacklist')}
              </Button>
            )}

            {hasPermission('Visitor.Update') && (
              <Button
                onClick={() => setShowEditModal(true)}
                variant="outline"
                size="sm"
              >
                <PencilIcon className="w-4 h-4 me-2" />
                {t('common:buttons.edit')}
              </Button>
            )}
            {hasPermission('Visitor.Delete') && (
              <Button
                onClick={() => setShowDeleteModal(true)}
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 border-red-200 hover:border-red-300 dark:text-red-400 dark:hover:text-red-300 dark:border-red-500"
              >
                <TrashIcon className="w-4 h-4 me-2" />
                {t('common:buttons.delete')}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Profile Header Card */}
      <Card className="mb-8">
        <div className="p-6">
          <div className="flex items-start gap-6">
            {/* Profile Photo */}
            <div className="flex-shrink-0">
              <div className="relative group">
                {visitor.profilePhotoUrl ? (
                  <img
                    src={visitor.profilePhotoUrl}
                    alt={`${visitor.firstName} ${visitor.lastName}`}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white dark:border-slate-700 shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div
                  className={`w-24 h-24 rounded-full bg-gray-200 dark:bg-slate-700 border-4 border-white dark:border-slate-700 shadow-lg flex items-center justify-center ${visitor.profilePhotoUrl ? 'hidden' : 'flex'}`}
                >
                  <UserIcon className="w-8 h-8 text-gray-400 dark:text-gray-200" />
                </div>

                {/* Photo upload/remove overlay */}
                {hasPermission('Visitor.Update') && (
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50 rounded-full">
                    <div className="flex gap-2">
                      <label
                        htmlFor="photo-upload"
                        className="cursor-pointer p-2 bg-white dark:bg-gray-900 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={t('visitors:profile.uploadPhotoTitle')}
                      >
                        <PhotoIcon className="w-4 h-4 text-gray-700 dark:text-gray-200" />
                        <input
                          id="photo-upload"
                          type="file"
                          accept="image/*"
                          onChange={handleUploadPhoto}
                          className="hidden"
                          disabled={photoUploading}
                        />
                      </label>
                      {visitor.profilePhotoUrl && (
                        <button
                          onClick={handleRemovePhoto}
                          className="p-2 bg-white dark:bg-gray-900 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          title={t('visitors:profile.removePhotoTitle')}
                          disabled={photoUploading}
                        >
                          <TrashIcon className="w-4 h-4 text-red-600 dark:text-red-400" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {photoUploading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full">
                    <LoadingSpinner size="sm" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="flex-1 min-w-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <EnvelopeIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">{visitor.email}</span>
                  </div>
                  {visitor.phoneNumber && (
                    <div className="flex items-center gap-2">
                      <PhoneIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{visitor.phoneNumber}</span>
                    </div>
                  )}
                  {visitor.company && (
                    <div className="flex items-center gap-2">
                      <BuildingOfficeIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{visitor.company}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {visitor.nationality && (
                    <div className="flex items-center gap-2">
                      <GlobeAltIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">{visitor.nationality}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <ChartBarIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                    <span className="text-sm text-gray-900 dark:text-gray-100">{t('visitors:profile.visitCount', { count: visitor.visitCount })}</span>
                  </div>
                  {visitor.lastVisitDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4 text-gray-400 dark:text-gray-300" />
                      <span className="text-sm text-gray-900 dark:text-gray-100">
                        {t('visitors:profile.lastVisit', { date: formatDate(visitor.lastVisitDate) })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Navigation Tabs */}
      <div className="mb-6">
        <nav className="flex gap-8 border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:border-blue-400 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 hover:border-gray-200 dark:hover:border-gray-600'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.name}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderTabContent()}
        </motion.div>
      </AnimatePresence>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title={t('visitors:modals.editTitle')}
        size="full"
        hasUnsavedChanges={hasUnsavedEditChanges}
        confirmCloseMessage={t('visitors:profile.confirmCloseUnsaved')}
      >
        <VisitorForm
          initialData={visitor}
          onSubmit={handleUpdateVisitor}
          onCancel={() => setShowEditModal(false)}
          onFormChange={setHasUnsavedEditChanges}
          loading={updateLoading}
          isEdit={true}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteVisitor}
        title={t('visitors:modals.deleteTitle')}
        message={t('visitors:modals.deleteMessage', { name: visitor.fullName || `${visitor.firstName} ${visitor.lastName}` })}
        confirmText={t('common:buttons.delete')}
        cancelText={t('common:buttons.cancel')}
        variant="danger"
        loading={updateLoading}
      />

      {/* Document Preview Modal */}
      {selectedDocument && (
        <DocumentPreview
          visitorId={visitor.id}
          document={selectedDocument}
          isOpen={showDocumentViewer}
          onClose={() => {
            setShowDocumentViewer(false);
            setSelectedDocument(null);
          }}
        />
      )}

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={showAddNoteModal}
        onClose={() => setShowAddNoteModal(false)}
        onSubmit={handleAddNote}
        loading={notesLoading}
      />

      {/* Blacklist Modal */}
      <Modal
        isOpen={showBlacklistModal}
        onClose={() => {
          setShowBlacklistModal(false);
          setBlacklistReason('');
        }}
        title={t('visitors:modals.blacklistTitle')}
        size="md"
      >
        <div className="p-6">
          <div className="mb-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {t('visitors:modals.blacklistAboutTo', { name: visitor.fullName || `${visitor.firstName} ${visitor.lastName}` })}
            </p>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              {t('visitors:modals.blacklistReason')} <span className="text-red-500 dark:text-red-400">*</span>
            </label>
            <textarea
              value={blacklistReason}
              onChange={(e) => setBlacklistReason(e.target.value)}
              rows={3}
              placeholder={t('visitors:modals.blacklistReasonPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 transition-colors duration-200"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => {
                setShowBlacklistModal(false);
                setBlacklistReason('');
              }}
              disabled={statusChangeLoading}
            >
              {t('common:buttons.cancel')}
            </Button>
            <Button
              variant="danger"
              onClick={handleBlacklistVisitor}
              loading={statusChangeLoading}
              disabled={!blacklistReason.trim()}
            >
              {t('visitors:modals.blacklistTitle')}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Invitation Modal */}
      <Modal
        isOpen={showCreateInvitationModal}
        onClose={() => setShowCreateInvitationModal(false)}
        title={`${t('visitors:actions.createInvitation')} - ${visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}`}
        size="full"
      >
        <InvitationForm
          initialData={{
            visitorId: visitor.id
          }}
          onSubmit={handleCreateInvitation}
          onCancel={() => setShowCreateInvitationModal(false)}
          loading={false}
          isEdit={false}
        />
      </Modal>
    </div>
  );

  // Render tab content based on active tab
  function renderTabContent() {
    switch (activeTab) {
      case 'overview':
        return renderOverviewTab();
      case 'documents':
        return renderDocumentsTab();
      case 'notes':
        return renderNotesTab();
      case 'emergency':
        return renderEmergencyTab();
      case 'activity':
        return renderActivityTab();
      default:
        return renderOverviewTab();
    }
  }

  // Overview Tab
  function renderOverviewTab() {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <UserIcon className="w-5 h-5" />
              <span>{t('visitors:profile.personalInfo')}</span>
            </h3>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.firstName')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.firstName}</div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.lastName')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.lastName}</div>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.email')}</span>
                <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.email}</div>
              </div>
              {visitor.phoneNumber && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.phone')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.phoneNumber}</div>
                </div>
              )}
              {visitor.dateOfBirth && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.dateOfBirth')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">
                    {formatDate(visitor.dateOfBirth)} {visitor.age && `(${t('visitors:fields.age', { age: visitor.age })})`}
                  </div>
                </div>
              )}
              {visitor.nationality && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.nationality')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.nationality}</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Professional Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <BuildingOfficeIcon className="w-5 h-5" />
              <span>{t('visitors:profile.professionalInfo')}</span>
            </h3>
            <div className="space-y-3">
              {visitor.company && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.company')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.company}</div>
                </div>
              )}
              {visitor.jobTitle && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.jobTitle')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.jobTitle}</div>
                </div>
              )}
              {visitor.securityClearance && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.securityClearance')}</span>
                  <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.securityClearance}</div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Address Information */}
        {visitor.address && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-5 h-5" />
                <span>{t('visitors:profile.address')}</span>
              </h3>
              <div className="text-sm text-gray-900 dark:text-gray-100">
                {visitor.address.street1 && <div>{visitor.address.street1}</div>}
                {visitor.address.street2 && <div>{visitor.address.street2}</div>}
                <div>
                  {visitor.address.city && `${visitor.address.city}, `}
                  {visitor.address.state && `${visitor.address.state} `}
                  {visitor.address.postalCode}
                </div>
                {visitor.address.country && <div>{visitor.address.country}</div>}
              </div>
            </div>
          </Card>
        )}

        {/* Government ID */}
        {(visitor.governmentId || visitor.governmentIdType) && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
                <IdentificationIcon className="w-5 h-5" />
                <span>{t('visitors:profile.governmentId')}</span>
              </h3>
              <div className="space-y-3">
                {visitor.governmentIdType && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.idType')}</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.governmentIdType}</div>
                  </div>
                )}
                {visitor.governmentId && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:fields.idNumber')}</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.governmentId}</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Special Requirements */}
        {(visitor.dietaryRequirements || visitor.accessibilityRequirements) && (
          <Card>
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('visitors:profile.specialReqs')}</h3>
              <div className="space-y-3">
                {visitor.dietaryRequirements && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:profile.dietaryReqs')}</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.dietaryRequirements}</div>
                  </div>
                )}
                {visitor.accessibilityRequirements && (
                  <div>
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">{t('visitors:profile.accessibilityReqs')}</span>
                    <div className="text-sm text-gray-900 dark:text-gray-100">{visitor.accessibilityRequirements}</div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* Notes */}
        {visitor.notes && (
          <Card className="lg:col-span-2">
            <div className="p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('visitors:profile.tabs.notes')}</h3>
              <div className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{visitor.notes}</div>
            </div>
          </Card>
        )}
      </div>
    );
  }

  // Documents Tab
  function renderDocumentsTab() {
    return (
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm p-4 sm:p-6">
        <DocumentManager
          visitorId={visitor.id}
          documents={documents}
          loading={documentsLoading}
          onUpload={handleUploadDocument}
          onDelete={handleDeleteDocument}
          onDownload={handleDownloadDocument}
          onRefresh={loadDocuments}
          allowedTypes={['Passport', 'National ID', 'Driver License', 'Visa', 'Work Permit', 'Health Certificate', 'Background Check', 'Photo', 'Other']}
          maxFileSize={10 * 1024 * 1024} // 10MB
          allowedExtensions={['.pdf', '.jpg', '.jpeg', '.png', '.gif', '.doc', '.docx', '.bmp', '.tiff']}
        />
      </div>
    );
  }

  // Notes Tab
  function renderNotesTab() {
    return (
      <div>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">{t('visitors:notes.title')}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{t('visitors:notes.subtitle')}</p>
          </div>
          {hasPermission('VisitorNote.Create') && (
            <Button
              onClick={() => setShowAddNoteModal(true)}
              variant="primary"
              size="sm"
              icon={<PlusIcon className="w-4 h-4" />}
            >
              {t('visitors:notes.addNote')}
            </Button>
          )}
        </div>

        {notesLoading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : notes.length === 0 ? (
          <Card>
            <div className="p-12 text-center">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">{t('visitors:notes.noNotes')}</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{t('visitors:notes.noNotesMessage')}</p>
              {hasPermission('VisitorNote.Create') && (
                <Button
                  onClick={() => setShowAddNoteModal(true)}
                  variant="primary"
                  size="sm"
                  icon={<PlusIcon className="w-4 h-4" />}
                >
                  {t('visitors:notes.addFirstNote')}
                </Button>
              )}
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {notes.map((note) => (
              <Card key={note.id}>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                          {note.title || t('visitors:notes.untitledNote')}
                        </h4>
                        {note.category && (
                          <Badge variant="info" size="sm">{note.category}</Badge>
                        )}
                        {note.priority && note.priority !== 'Medium' && (
                          <Badge
                            variant={
                              note.priority === 'Critical' || note.priority === 'High'
                                ? 'danger'
                                : 'secondary'
                            }
                            size="sm"
                          >
                            {note.priority}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                        {note.content}
                      </p>
                      {note.tags && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {note.tags.split(',').map((tag, idx) => (
                            <span
                              key={idx}
                              className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded"
                            >
                              {tag.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      {note.isFlagged && (
                        <Badge variant="warning" size="sm">{t('visitors:notes.flagged')}</Badge>
                      )}
                      {note.isConfidential && (
                        <Badge variant="danger" size="sm">{t('visitors:notes.confidential')}</Badge>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {t('visitors:notes.by', { name: note.createdByName || t('visitors:notes.unknownAuthor'), date: formatDateTime(note.createdAt || note.createdOn) })}
                    </span>
                    {note.modifiedAt && note.modifiedAt !== note.createdAt && (
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {t('visitors:notes.modified', { date: formatDateTime(note.modifiedAt || note.modifiedOn) })}
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Emergency Contacts Tab
  function renderEmergencyTab() {
    return (
      <div>
        <EmergencyContactsList
          visitorId={visitor.id}
          visitorName={visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}
          showHeader={true}
          isEmbedded={false}
        />
      </div>
    );
  }

  // Activity Tab
  function renderActivityTab() {
    return (
      <div className="space-y-6">
        {/* Visit Statistics */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5" />
              <span>{t('visitors:activity.visitStatistics')}</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/40">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-300">{visitor.visitCount}</div>
                <div className="text-sm text-blue-800 dark:text-blue-100/80">{t('visitors:activity.totalVisits')}</div>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-100 dark:border-green-900/40">
                <div className="text-2xl font-bold text-green-600 dark:text-green-300">
                  {visitor.lastVisitDate ? formatDate(visitor.lastVisitDate) : t('visitors:activity.never')}
                </div>
                <div className="text-sm text-green-800 dark:text-green-100/80">{t('visitors:activity.lastVisit')}</div>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-100 dark:border-purple-900/40">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-300">
                  {formatDate(visitor.createdOn)}
                </div>
                <div className="text-sm text-purple-800 dark:text-purple-100/80">{t('visitors:activity.firstRegistered')}</div>
              </div>
            </div>
          </div>
        </Card>

        {/* Status History */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('visitors:activity.statusHistory')}</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800/50 rounded-lg border border-gray-100 dark:border-slate-700">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{t('visitors:activity.visitorCreated')}</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {formatDateTime(visitor.createdOn)}
                </span>
              </div>

              {visitor.isVip && (
                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-100 dark:border-yellow-900/40">
                  <div className="flex items-center gap-2">
                    <StarIconSolid className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">{t('visitors:activity.markedAsVip')}</span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">{t('visitors:activity.vipStatusActive')}</span>
                </div>
              )}

              {visitor.isBlacklisted && (
                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-100 dark:border-red-900/40">
                  <div className="flex items-center gap-2">
                    <ShieldExclamationIcon className="w-4 h-4 text-red-500" />
                    <span className="text-sm font-medium">{t('visitors:activity.blacklisted')}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(visitor.blacklistedOn)}
                    </div>
                    {visitor.blacklistReason && (
                      <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                        {t('visitors:activity.blacklistReason', { reason: visitor.blacklistReason })}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Recent Activity Placeholder */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">{t('visitors:activity.recentActivity')}</h3>
            <div className="text-center py-8">
              <ClipboardDocumentListIcon className="w-12 h-12 text-gray-400 dark:text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">
                {t('visitors:activity.recentActivityPlaceholder')}
              </p>
            </div>
          </div>
        </Card>
      </div>
    );
  }
};

export default VisitorProfilePage;
