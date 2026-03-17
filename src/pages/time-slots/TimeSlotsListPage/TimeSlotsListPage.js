// src/pages/time-slots/TimeSlotsListPage/TimeSlotsListPage.js
import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../hooks/usePermissions';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  ClockIcon,
  CalendarDaysIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Redux actions
import {
  getTimeSlots,
  createTimeSlot,
  updateTimeSlot,
  deleteTimeSlot,
  getAvailableTimeSlots,
  updateFilters,
  resetFilters,
  setSelectedTimeSlots,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showAvailabilityModal,
  hideAvailabilityModal,
  clearError
} from '../../../store/slices/timeSlotsSlice';

import { getLocations } from '../../../store/slices/locationsSlice';

// Import selectors
import {
  selectTimeSlotsList,
  selectTimeSlotsTotal,
  selectTimeSlotsPagination,
  selectTimeSlotsFilters,
  selectTimeSlotsListLoading,
  selectTimeSlotsCreateLoading,
  selectTimeSlotsUpdateLoading,
  selectTimeSlotsDeleteLoading,
  selectTimeSlotsListError,
  selectTimeSlotsCreateError,
  selectTimeSlotsUpdateError,
  selectTimeSlotsDeleteError,
  selectCurrentTimeSlot,
  selectSelectedTimeSlots,
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectShowAvailabilityModal,
  selectAvailableSlotsList,
  selectAvailableSlotsLoading,
  selectAvailableSlotsError
} from '../../../store/selectors/timeSlotsSelectors';

import { selectLocationsList } from '../../../store/selectors/locationSelectors';

// Notification hook
import { useToast } from '../../../hooks/useNotifications';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Table from '../../../components/common/Table/Table';
import Pagination from '../../../components/common/Pagination/Pagination';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import Badge from '../../../components/common/Badge/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import TimeSlotForm from '../../../components/time-slots/TimeSlotForm/TimeSlotForm';

// Services
import timeSlotsService from '../../../services/timeSlotsService';

// Utils
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Time Slots Management Page with comprehensive CRUD operations
 */
const TimeSlotsListPage = () => {
  const { t, i18n } = useTranslation('system');
  const dispatch = useDispatch();
  const { user: userPermissions } = usePermissions();
  const toast = useToast();

  // Local state
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [showBulkConfirm, setShowBulkConfirm] = useState(false);
  const [availabilityDate, setAvailabilityDate] = useState(new Date().toISOString().split('T')[0]);
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewingTimeSlot, setViewingTimeSlot] = useState(null);

  // Redux state using selectors
  const timeSlots = useSelector(selectTimeSlotsList);
  const total = useSelector(selectTimeSlotsTotal);
  const pagination = useSelector(selectTimeSlotsPagination);
  const filters = useSelector(selectTimeSlotsFilters);
  const listLoading = useSelector(selectTimeSlotsListLoading);
  const createLoading = useSelector(selectTimeSlotsCreateLoading);
  const updateLoading = useSelector(selectTimeSlotsUpdateLoading);
  const deleteLoading = useSelector(selectTimeSlotsDeleteLoading);
  const listError = useSelector(selectTimeSlotsListError);
  const createError = useSelector(selectTimeSlotsCreateError);
  const updateError = useSelector(selectTimeSlotsUpdateError);
  const deleteError = useSelector(selectTimeSlotsDeleteError);
  const currentTimeSlot = useSelector(selectCurrentTimeSlot);
  const selectedTimeSlots = useSelector(selectSelectedTimeSlots);
  const isCreateModalOpen = useSelector(selectShowCreateModal);
  const isEditModalOpen = useSelector(selectShowEditModal);
  const isDeleteModalOpen = useSelector(selectShowDeleteModal);
  const isAvailabilityModalOpen = useSelector(selectShowAvailabilityModal);
  const availableSlotsList = useSelector(selectAvailableSlotsList);
  const availableSlotsLoading = useSelector(selectAvailableSlotsLoading);
  const availableSlotsError = useSelector(selectAvailableSlotsError);

  // Redux state - Locations
  const locations = useSelector(selectLocationsList);
  const locationsLoading = useSelector(state => state.locations.loading);

  // Check permissions
  const canRead = userPermissions.canActivate;
  const canCreate = userPermissions.canCreate;
  const canEdit = userPermissions.canUpdate || userPermissions.canEdit;
  const canDelete = userPermissions.canDelete;

  // Initialize data
  useEffect(() => {
    if (canRead) {
      dispatch(getTimeSlots());
      dispatch(getLocations());
    }
  }, [dispatch, canRead]);

  // Handle search input changes with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchInput !== filters.searchTerm) {
        handleFilterChange({ searchTerm: searchInput });
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchInput, filters.searchTerm]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    dispatch(updateFilters(newFilters));
    dispatch(getTimeSlots({ ...filters, ...newFilters, pageIndex: 0 }));
  };

  // Handle pagination
  const handlePageChange = (newPageIndex) => {
    dispatch(getTimeSlots({ ...filters, pageIndex: newPageIndex }));
  };

  // Handle sorting
  const handleSort = (sortBy, sortDirection) => {
    handleFilterChange({ sortBy, sortDirection });
  };

  // Handle row selection
  const handleRowSelect = (selectedRowIds) => {
    dispatch(setSelectedTimeSlots(selectedRowIds));
  };

  // Handle create time slot
  const handleCreateTimeSlot = async (timeSlotData) => {
    try {
      await dispatch(createTimeSlot(timeSlotData)).unwrap();
      toast.success(t('common:alerts.success'), t('timeSlots.createSuccess'));
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(t('common:alerts.error'), t('timeSlots.failedCreate', { error: errorMessage }));
    }
  };

  // Handle update time slot
  const handleUpdateTimeSlot = async (timeSlotData) => {
    try {
      await dispatch(updateTimeSlot({ 
        id: currentTimeSlot.id, 
        timeSlotData 
      })).unwrap();
      toast.success(t('common:alerts.success'), t('timeSlots.updateSuccess'));
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(t('common:alerts.error'), t('timeSlots.failedUpdate', { error: errorMessage }));
    }
  };

  // Handle delete time slot
  const handleDeleteTimeSlot = async (hardDelete = false) => {
    try {
      await dispatch(deleteTimeSlot({ 
        id: currentTimeSlot.id, 
        hardDelete 
      })).unwrap();
      toast.success(
        t('common:alerts.success'),
        t('timeSlots.deleteSuccess', {
          action: hardDelete ? t('timeSlots.deletedPermanently') : t('timeSlots.deactivated')
        })
      );
      dispatch(hideDeleteModal());
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(t('common:alerts.error'), t('timeSlots.failedDelete', { error: errorMessage }));
    }
  };

  // Handle bulk actions
  const handleBulkAction = async () => {
    if (!bulkAction || selectedTimeSlots.length === 0) return;

    try {
      if (bulkAction === 'delete') {
        const promises = selectedTimeSlots.map(id => 
          dispatch(deleteTimeSlot({ id, hardDelete: false })).unwrap()
        );
        await Promise.all(promises);
        toast.success(t('common:alerts.success'), t('timeSlots.bulkDeactivated', { count: selectedTimeSlots.length }));
      }
      
      dispatch(clearSelections());
      dispatch(getTimeSlots(filters)); // Refresh list
    } catch (error) {
      const errorMessage = extractErrorMessage(error);
      toast.error(t('common:alerts.error'), t('timeSlots.bulkFailed', { error: errorMessage }));
    } finally {
      setShowBulkConfirm(false);
      setBulkAction('');
    }
  };

  // Helper function to get day names from active days string
  const getActiveDayNames = useCallback((activeDaysString) => {
    if (!activeDaysString) return t('timeSlots.daysNone');

    const dayNames = {
      1: new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 1))),
      2: new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 2))),
      3: new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 3))),
      4: new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 4))),
      5: new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 5))),
      6: new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 6))),
      7: new Intl.DateTimeFormat(i18n.language === 'ar' ? 'ar' : 'en-US', { weekday: 'long' }).format(new Date(Date.UTC(2024, 0, 7)))
    };
    
    try {
      const days = activeDaysString
        .split(',')
        .map(day => parseInt(day.trim()))
        .filter(day => day >= 1 && day <= 7)
        .sort((a, b) => a - b)
        .map(day => dayNames[day])
        .filter(Boolean);

      return days.length > 0 ? days.join(', ') : t('timeSlots.daysNone');
    } catch (error) {
      console.error('Error parsing active days:', error);
      return t('timeSlots.daysInvalidFormat');
    }
  }, [i18n.language, t]);

  // Handle check availability
  const handleCheckAvailability = () => {
    if (availabilityDate) {
      dispatch(getAvailableTimeSlots({ 
        date: availabilityDate,
        locationId: filters.locationId 
      }));
    }
  };

  // Handle time slot actions (view, edit, delete)
  const handleTimeSlotAction = useCallback((action, timeSlot) => {
    switch (action) {
      case 'view':
        setViewingTimeSlot(timeSlot);
        setShowViewModal(true);
        break;
      case 'availability':
        dispatch(showAvailabilityModal({ timeSlot, date: availabilityDate }));
        break;
      case 'edit':
        dispatch(showEditModal(timeSlot));
        break;
      case 'delete':
        dispatch(showDeleteModal(timeSlot));
        break;
      default:
        break;
    }
  }, [dispatch, availabilityDate]);

  // Clear errors when modals open/close
  useEffect(() => {
    if (!isCreateModalOpen && !isEditModalOpen && !isDeleteModalOpen) {
      dispatch(clearError());
    }
  }, [isCreateModalOpen, isEditModalOpen, isDeleteModalOpen, dispatch]);

  // Location options for filter
  const locationOptions = useMemo(() => [
    { value: '', label: t('timeSlots.allLocations') },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name
    }))
  ], [locations, t]);

  // Table columns configuration
  const columns = useMemo(() => [
    {
      key: 'name',
      header: t('timeSlots.columns.timeSlot'),
      sortable: true,
      render: (value, timeSlot) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{timeSlot.name}</div>
          {timeSlot.locationName && (
            <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center mt-1">
              <svg className="w-4 h-4 me-1 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {timeSlot.locationName}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'timeRange',
      header: t('timeSlots.columns.timeRange'),
      sortable: true,
      render: (value, timeSlot) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="font-medium text-gray-900 dark:text-gray-100">
              {timeSlotsService.formatTimeForDisplay(timeSlot.startTime)} - {timeSlotsService.formatTimeForDisplay(timeSlot.endTime)}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {t('timeSlots.duration', { count: timeSlotsService.calculateDuration(timeSlot.startTime, timeSlot.endTime) })}
          </div>
        </div>
      )
    },
    {
      key: 'capacity',
      header: t('timeSlots.columns.capacity'),
      sortable: true,
      render: (value, timeSlot) => (
        <div className="space-y-2">
          <div className="flex items-center justify-center gap-2">
            <Badge variant="info" size="sm">
              {t('timeSlots.max', { count: timeSlot.maxVisitors })}
            </Badge>
          </div>
          {timeSlot.bufferMinutes > 0 && (
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {t('timeSlots.buffer', { count: timeSlot.bufferMinutes })}
            </div>
          )}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
            <div
              className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
              style={{ width: '0%' }}
            />
          </div>
        </div>
      )
    },
    {
      key: 'activeDays',
      header: t('timeSlots.columns.activeDays'),
      sortable: false,
      render: (value, timeSlot) => (
        <div className="space-y-1">
          <div className="flex items-center gap-1 text-sm">
            <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
            </svg>
            <span className="text-gray-600 dark:text-gray-300">
              {getActiveDayNames(timeSlot.activeDays)}
            </span>
          </div>
        </div>
      )
    },
    {
      key: 'status',
      header: t('timeSlots.columns.status'),
      sortable: true,
      render: (value, timeSlot) => (
        <Badge 
          variant={timeSlot.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {timeSlot.isActive ? t('timeSlots.active') : t('timeSlots.inactive')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('timeSlots.columns.actions'),
      width: '120px',
      sortable: false,
      render: (value, timeSlot) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTimeSlotAction('view', timeSlot)}
            className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
            title={t('common:buttons.view')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          <button
            onClick={() => handleTimeSlotAction('availability', timeSlot)}
            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300 transition-colors"
            title={t('timeSlots.checkAvailability')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          {canEdit && (
            <button
              onClick={() => handleTimeSlotAction('edit', timeSlot)}
              className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              title={t('common:buttons.edit')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleTimeSlotAction('delete', timeSlot)}
              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              title={t('common:buttons.delete')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      )
    }
  ], [canEdit, canDelete, handleTimeSlotAction, t]);
  
  if (!canRead) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center px-4">
        <div className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">{t('timeSlots.accessDenied')}</h3>
          <p className="text-gray-600 dark:text-gray-400">{t('timeSlots.accessDeniedDesc')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
      <div className="container mx-auto px-4 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t('timeSlots.title')}</h1>
          <p className="text-gray-600 dark:text-gray-400">{t('timeSlots.subtitle')}</p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => dispatch(showAvailabilityModal())}
          >
            {t('timeSlots.checkAvailability')}
          </Button>
          
          {canCreate && (
            <Button
              onClick={() => dispatch(showCreateModal())}
              loading={createLoading}
            >
              {t('timeSlots.createButton')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder={t('timeSlots.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full"
            />
          </div>
          
          <div className="flex gap-3">
            <Select
              value={filters.locationId || ''}
              onChange={(e) => handleFilterChange({ locationId: e.target.value || null })}
              options={locationOptions}
              loading={locationsLoading}
              className="w-48"
            />
            
            <Select
              value={filters.activeOnly ? 'true' : 'false'}
              onChange={(e) => handleFilterChange({ activeOnly: e.target.value === 'true' })}
              options={[
                { value: 'true', label: t('timeSlots.activeOnly') },
                { value: 'false', label: t('timeSlots.allTimeSlots') }
              ]}
              className="w-36"
            />
            
            <Button
              variant="outline"
              onClick={() => {
                dispatch(resetFilters());
                setSearchInput('');
              }}
            >
              {t('timeSlots.reset')}
            </Button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTimeSlots.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm text-blue-700 dark:text-blue-200">
              {t('timeSlots.bulkSelected', {
                count: selectedTimeSlots.length
              })}
            </span>
            
            <div className="flex gap-2">
              {canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setBulkAction('delete');
                    setShowBulkConfirm(true);
                  }}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  {t('timeSlots.deactivateSelected')}
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => dispatch(clearSelections())}
              >
                {t('timeSlots.clearSelection')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        {listError ? (
          <div className="p-6 text-center">
            <p className="text-red-600">{t('timeSlots.errorLoading', { error: listError })}</p>
            <Button
              variant="outline"
              onClick={() => dispatch(getTimeSlots(filters))}
              className="mt-4"
            >
              {t('timeSlots.retry')}
            </Button>
          </div>
        ) : (
          <Table
            data={timeSlots}
            columns={columns}
            loading={listLoading}
            selectable={canDelete}
            selectedRows={selectedTimeSlots}
            onSelectionChange={handleRowSelect}
            onSort={handleSort}
            sortBy={filters.sortBy}
            sortDirection={filters.sortDirection}
            emptyMessage={t('timeSlots.emptyMessage')}
          />
        )}

        {/* Pagination */}
        {total > 0 && (
          <div className="border-t border-gray-200 px-6 py-4">
            <Pagination
              currentPage={pagination.pageIndex + 1}
              totalItems={total}
              pageSize={pagination.pageSize}
              onPageChange={(newPage) => handlePageChange(newPage - 1)}
              showPageSizeSelector={false}
            />
          </div>
        )}
      </div>

      {/* Modals */}
      
      {/* Create Time Slot Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => dispatch(hideCreateModal())}
        title={t('timeSlots.createTitle')}
        size="xl"
      >
        <TimeSlotForm
          onSubmit={handleCreateTimeSlot}
          onCancel={() => dispatch(hideCreateModal())}
          loading={createLoading}
          error={createError}
          submitText={t('timeSlots.createTitle')}
        />
      </Modal>

      {/* Edit Time Slot Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => dispatch(hideEditModal())}
        title={t('timeSlots.editTitle')}
        size="xl"
      >
        {currentTimeSlot && (
          <TimeSlotForm
            timeSlot={currentTimeSlot}
            onSubmit={handleUpdateTimeSlot}
            onCancel={() => dispatch(hideEditModal())}
            loading={updateLoading}
            error={updateError}
            submitText={t('timeSlots.editTitle')}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => dispatch(hideDeleteModal())}
        onConfirm={() => handleDeleteTimeSlot(false)}
        title={t('timeSlots.deactivateTitle')}
        message={
          currentTimeSlot
            ? t('timeSlots.deactivateMessage', { name: currentTimeSlot.name })
            : t('timeSlots.deactivateMessageGeneric')
        }
        confirmText={t('timeSlots.deactivateConfirm')}
        variant="warning"
        loading={deleteLoading}
      />

      {/* Availability Check Modal */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => dispatch(hideAvailabilityModal())}
        title={t('timeSlots.availabilityTitle')}
        size="lg"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label={t('timeSlots.dateLabel')}
              value={availabilityDate}
              onChange={(e) => setAvailabilityDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
            />
            
            <Select
              label={t('timeSlots.locationLabel')}
              value={filters.locationId || ''}
              onChange={(e) => handleFilterChange({ locationId: e.target.value || null })}
              options={locationOptions}
              loading={locationsLoading}
            />
          </div>

          <Button
            onClick={handleCheckAvailability}
            loading={availableSlotsLoading}
            disabled={!availabilityDate}
            className="w-full"
          >
            {t('timeSlots.checkButton')}
          </Button>

          {/* Available Slots Results */}
          {availableSlotsList && availableSlotsList.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900 dark:text-gray-100">{t('timeSlots.availableSlots')}</h4>
              <div className="grid gap-3">
                {availableSlotsList.map((slot) => (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900/40"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{slot.name}</span>
                        {slot.locationName && (
                          <Badge variant="neutral" size="sm">{slot.locationName}</Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {timeSlotsService.formatTimeForDisplay(slot.startTime)} - {timeSlotsService.formatTimeForDisplay(slot.endTime)}
                      </div>
                    </div>
                    
                    <div className="text-end">
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {t('timeSlots.availableOf', { available: slot.availableSlots, max: slot.maxVisitors })}
                      </div>
                      <Badge
                        variant={slot.isAvailable ? 'success' : 'error'}
                        size="sm"
                      >
                        {slot.isAvailable ? t('timeSlots.available') : t('timeSlots.full')}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {availableSlotsError && (
            <div className="text-center py-4">
              <p className="text-red-600 dark:text-red-400">{t('timeSlots.errorLoading', { error: availableSlotsError })}</p>
            </div>
          )}

          {!availableSlotsLoading && (!availableSlotsList || availableSlotsList.length === 0) && availabilityDate && (
            <div className="text-center py-8">
              <EmptyState
                title={t('timeSlots.noAvailableSlots')}
                description={t('timeSlots.noAvailableDesc')}
              />
            </div>
          )}
        </div>
      </Modal>
      
      {/* View TimeSlot Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingTimeSlot(null);
        }}
        title={t('timeSlots.details.title')}
        size="lg"
      >
        {viewingTimeSlot && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('timeSlots.details.name')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingTimeSlot.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('timeSlots.details.status')}</label>
                <div className="mt-1">
                  <Badge variant={viewingTimeSlot.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingTimeSlot.isActive ? t('timeSlots.active') : t('timeSlots.inactive')}
                  </Badge>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('timeSlots.details.timeRange')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {timeSlotsService.formatTimeForDisplay(viewingTimeSlot.startTime)} - {timeSlotsService.formatTimeForDisplay(viewingTimeSlot.endTime)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {t('timeSlots.details.duration', { count: timeSlotsService.calculateDuration(viewingTimeSlot.startTime, viewingTimeSlot.endTime) })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('timeSlots.details.capacity')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                  {t('timeSlots.details.maxVisitors', { count: viewingTimeSlot.maxVisitors })}
                </p>
                {viewingTimeSlot.bufferMinutes > 0 && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('timeSlots.details.bufferTime', { count: viewingTimeSlot.bufferMinutes })}
                  </p>
                )}
              </div>
            </div>
            
            {viewingTimeSlot.locationName && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('timeSlots.details.location')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingTimeSlot.locationName}</p>
              </div>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('timeSlots.details.activeDays')}</label>
              <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">
                {getActiveDayNames(viewingTimeSlot.activeDays)}
              </p>
            </div>
            
            {viewingTimeSlot.displayOrder !== undefined && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{t('timeSlots.details.displayOrder')}</label>
                <p className="mt-1 text-sm text-gray-900 dark:text-gray-100">{viewingTimeSlot.displayOrder}</p>
              </div>
            )}
            
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingTimeSlot(null);
                }}
              >
                {t('timeSlots.details.close')}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  handleTimeSlotAction('availability', viewingTimeSlot);
                }}
              >
                {t('timeSlots.details.checkAvailability')}
              </Button>
              {canEdit && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    handleTimeSlotAction('edit', viewingTimeSlot);
                  }}
                >
                  {t('timeSlots.details.edit')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
      
      {/* Bulk Confirm Modal */}
      <ConfirmModal
        isOpen={showBulkConfirm}
        onClose={() => setShowBulkConfirm(false)}
        onConfirm={handleBulkAction}
        title={t('timeSlots.bulkConfirmTitle')}
        message={t('timeSlots.bulkConfirmMessage', {
          action: bulkAction,
          count: selectedTimeSlots.length
        })}
        confirmText={t('timeSlots.bulkConfirm')}
        variant="warning"
      />
    </div>
    </div>
  );
};

export default TimeSlotsListPage;
