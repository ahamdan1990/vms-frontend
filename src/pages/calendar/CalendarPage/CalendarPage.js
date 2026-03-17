// src/pages/calendar/CalendarPage/CalendarPage.js
import React, { useEffect, useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { CalendarView } from '../../../components/calendar';
import Button from '../../../components/common/Button/Button';
import Select from '../../../components/common/Select/Select';
import Modal from '../../../components/common/Modal/Modal';
import Badge from '../../../components/common/Badge/Badge';
import { useToast } from '../../../hooks/useNotifications';
import { usePermissions } from '../../../hooks/usePermissions';

// Icons
import {
  CalendarDaysIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PlusCircleIcon
} from '@heroicons/react/24/outline';

// Redux
import { getTimeSlots } from '../../../store/slices/timeSlotsSlice';
import { getLocations } from '../../../store/slices/locationsSlice';
import { selectTimeSlotsList, selectTimeSlotsListLoading } from '../../../store/selectors/timeSlotsSelectors';
import { selectLocationsList } from '../../../store/selectors/locationSelectors';

// Services
import timeSlotsService from '../../../services/timeSlotsService';

/**
 * Calendar Page for visualizing and booking time slots
 */
const CalendarPage = () => {
  const { t, i18n } = useTranslation(['calendar', 'common']);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const toast = useToast();
  const { user: userPermissions } = usePermissions();
  const locale = i18n.language === 'ar' ? 'ar' : 'en-US';

  // Redux state
  const timeSlots = useSelector(selectTimeSlotsList);
  const loading = useSelector(selectTimeSlotsListLoading);
  const locations = useSelector(selectLocationsList);

  // Local state
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookings, setBookings] = useState({});
  const [loadingBookings, setLoadingBookings] = useState(false);

  // Check permissions
  const canCreate = userPermissions.canCreate;
  const canManageSlots = userPermissions.canUpdate || userPermissions.canEdit;

  // Initialize data
  useEffect(() => {
    dispatch(getTimeSlots({ activeOnly: true }));
    dispatch(getLocations());
  }, [dispatch]);

  // Load bookings for current view when time slots or location changes
  useEffect(() => {
    if (timeSlots.length > 0) {
      loadBookingsData();
    }
  }, [timeSlots, selectedLocationId]);

  // Load booking data
  const loadBookingsData = async () => {
    try {
      setLoadingBookings(true);
      // Here you would fetch actual booking counts from the API
      // For now, we'll use mock data
      const mockBookings = {};

      // You can implement actual API calls here:
      // const bookingData = await timeSlotsService.getTimeSlotBookings(...)

      setBookings(mockBookings);
    } catch (error) {
      console.error('Failed to load bookings:', error);
    } finally {
      setLoadingBookings(false);
    }
  };

  // Handle location change
  const handleLocationChange = (locationId) => {
    setSelectedLocationId(locationId ? parseInt(locationId) : null);
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };

  // Handle time slot selection
  const handleTimeSlotSelect = useCallback((timeSlot, date) => {
    setSelectedTimeSlot(timeSlot);
    setSelectedDate(date);
    setShowBookingModal(true);
  }, []);

  // Handle create invitation
  const handleCreateInvitation = () => {
    navigate('/invitations/create', {
      state: {
        preselectedTimeSlotId: selectedTimeSlot?.id,
        preselectedDate: selectedDate,
        // Use the time slot's location if available, otherwise use the filter location
        preselectedLocationId: selectedTimeSlot?.locationId || selectedLocationId
      }
    });
    setShowBookingModal(false);
  };

  // Handle manage time slots
  const handleManageTimeSlots = () => {
    navigate('/time-slots');
  };

  // Filter time slots by location
  const filteredTimeSlots = selectedLocationId
    ? timeSlots.filter(slot => slot.locationId === selectedLocationId)
    : timeSlots;

  // Location options
  const locationOptions = [
    { value: '', label: t('calendar:filters.allLocations') },
    ...locations.map(location => ({
      value: location.id.toString(),
      label: location.name
    }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-3">
            <CalendarDaysIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            <span>{t('calendar:title')}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300">{t('calendar:subtitle')}</p>
        </div>

        <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
          {canManageSlots && (
            <Button
              variant="outline"
              onClick={handleManageTimeSlots}
            >
              {t('calendar:buttons.manageTimeSlots')}
            </Button>
          )}
          {canCreate && (
            <Button
              onClick={() => navigate('/invitations/create')}
            >
              <PlusCircleIcon className="w-5 h-5 me-2" />
              {t('calendar:buttons.createInvitation')}
            </Button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900/70 rounded-2xl shadow-sm border border-gray-200 dark:border-slate-800 p-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-200">
              {t('calendar:filters.filterByLocation')}
            </label>
            <Select
              value={selectedLocationId?.toString() || ''}
              onChange={(e) => handleLocationChange(e.target.value)}
              options={locationOptions}
              className="w-full sm:w-64"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <ClockIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
              <span>{t('calendar:filters.timeSlotsAvailable', { count: filteredTimeSlots.length })}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar View */}
      <div className="bg-white dark:bg-slate-950/50 rounded-2xl shadow-md border border-gray-200 dark:border-slate-900/80 p-6">
        <CalendarView
          timeSlots={filteredTimeSlots}
          bookings={bookings}
          loading={loading || loadingBookings}
          selectedDate={selectedDate}
          selectedTimeSlot={selectedTimeSlot}
          locationId={selectedLocationId}
          onDateSelect={handleDateSelect}
          onTimeSlotSelect={handleTimeSlotSelect}
        />
      </div>

      {/* Booking Modal */}
      <Modal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        title={t('calendar:modal.bookTimeSlot')}
        size="md"
      >
        {selectedTimeSlot && selectedDate && (
          <div className="space-y-6">
            {/* Time Slot Details */}
            <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
              <h3 className="font-medium text-gray-900 mb-3">{selectedTimeSlot.name}</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-600 mb-1">{t('calendar:modal.date')}</div>
                  <div className="font-medium text-gray-900">
                    {selectedDate.toLocaleDateString(locale, {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>

                <div>
                  <div className="text-gray-600 mb-1">{t('calendar:modal.time')}</div>
                  <div className="font-medium text-gray-900 flex items-center gap-1">
                    <ClockIcon className="w-4 h-4" />
                    <span>
                      {timeSlotsService.formatTimeForDisplay(selectedTimeSlot.startTime)} - {timeSlotsService.formatTimeForDisplay(selectedTimeSlot.endTime)}
                    </span>
                  </div>
                </div>

                {selectedTimeSlot.locationName && (
                  <div>
                    <div className="text-gray-600 mb-1">{t('calendar:modal.location')}</div>
                    <div className="font-medium text-gray-900 flex items-center gap-1">
                      <MapPinIcon className="w-4 h-4" />
                      <span>{selectedTimeSlot.locationName}</span>
                    </div>
                  </div>
                )}

                <div>
                  <div className="text-gray-600 mb-1">{t('calendar:modal.capacity')}</div>
                  <div className="font-medium text-gray-900 flex items-center gap-1">
                    <UserGroupIcon className="w-4 h-4" />
                    <span>{t('calendar:modal.visitorsMax', { count: selectedTimeSlot.maxVisitors })}</span>
                  </div>
                </div>
              </div>

              {selectedTimeSlot.bufferMinutes > 0 && (
                <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-gray-600">
                  {t('calendar:modal.bufferNote', { minutes: selectedTimeSlot.bufferMinutes })}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setShowBookingModal(false)}
              >
                {t('calendar:buttons.cancel')}
              </Button>
              <Button
                onClick={handleCreateInvitation}
              >
                {t('calendar:buttons.createInvitationForSlot')}
              </Button>
            </div>

            {/* Help Text */}
            <div className="text-sm text-gray-500 text-center">
              {t('calendar:modal.redirectHint')}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default CalendarPage;
