// src/components/calendar/CalendarView/CalendarView.js
import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import timeSlotsService from '../../../services/timeSlotsService';

/**
 * Calendar View Component for Time Slot Visualization
 * Displays time slots in a weekly calendar grid with availability indicators
 */
const CalendarView = ({
  onDateSelect,
  onTimeSlotSelect,
  selectedDate = null,
  selectedTimeSlot = null,
  locationId = null,
  loading = false,
  timeSlots = [],
  bookings = {},
  className = ''
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('week'); // 'week' or 'day'

  // Get the week dates
  const weekDates = useMemo(() => {
    const dates = [];
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      dates.push(date);
    }

    return dates;
  }, [currentDate]);

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + (direction * 7));
    setCurrentDate(newDate);
  };

  // Navigate to previous/next day
  const navigateDay = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + direction);
    setCurrentDate(newDate);
  };

  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Check if a date is today
  const isToday = (date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  // Check if a date is selected
  const isSelected = (date) => {
    if (!selectedDate) return false;
    const selected = new Date(selectedDate);
    return date.toDateString() === selected.toDateString();
  };

  // Get time slots for a specific date
  const getTimeSlotsForDate = (date) => {
    return timeSlots.filter(slot => {
      // Check if slot is active and applicable to this date
      if (!slot.isActive) return false;
      if (locationId && slot.locationId !== locationId) return false;
      return timeSlotsService.isActiveOnDate(slot, date);
    }).sort((a, b) => {
      // Sort by start time
      return timeSlotsService.parseTimeOnly(a.startTime) - timeSlotsService.parseTimeOnly(b.startTime);
    });
  };

  // Get availability for a time slot on a specific date
  const getAvailability = (timeSlot, date) => {
    const dateKey = date.toISOString().split('T')[0];
    const slotBookings = bookings[`${timeSlot.id}_${dateKey}`] || { count: 0 };
    const available = timeSlot.maxVisitors - (slotBookings.count || 0);
    const utilizationRate = timeSlot.maxVisitors > 0 ? slotBookings.count / timeSlot.maxVisitors : 0;

    return {
      available,
      total: timeSlot.maxVisitors,
      utilizationRate,
      status: available <= 0 ? 'full' : utilizationRate >= 0.8 ? 'warning' : 'available'
    };
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (onDateSelect) {
      onDateSelect(date);
    }
  };

  // Handle time slot click
  const handleTimeSlotClick = (timeSlot, date) => {
    if (onTimeSlotSelect) {
      onTimeSlotSelect(timeSlot, date);
    }
  };

  // Render time slot card
  const TimeSlotCard = ({ timeSlot, date }) => {
    const availability = getAvailability(timeSlot, date);
    const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
    const isDisabled = isPast || availability.status === 'full';

    return (
      <motion.button
        type="button"
        whileHover={{ scale: isDisabled ? 1 : 1.02 }}
        whileTap={{ scale: isDisabled ? 1 : 0.98 }}
        onClick={() => !isDisabled && handleTimeSlotClick(timeSlot, date)}
        disabled={isDisabled}
        className={`
          w-full p-3 rounded-lg border-2 text-left transition-all
          ${selectedTimeSlot?.id === timeSlot.id && isSelected(date)
            ? 'border-blue-500 bg-blue-50'
            : availability.status === 'full'
            ? 'border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed'
            : isPast
            ? 'border-gray-200 bg-gray-50 opacity-40 cursor-not-allowed'
            : availability.status === 'warning'
            ? 'border-yellow-300 bg-yellow-50 hover:border-yellow-400'
            : 'border-green-300 bg-green-50 hover:border-green-400'
          }
        `}
      >
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <ClockIcon className="w-4 h-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-900">
              {timeSlotsService.formatTimeForDisplay(timeSlot.startTime)}
            </span>
          </div>
          <Badge
            variant={
              availability.status === 'full' ? 'error' :
              availability.status === 'warning' ? 'warning' : 'success'
            }
            size="xs"
          >
            {availability.available}/{availability.total}
          </Badge>
        </div>

        <div className="text-xs text-gray-600 line-clamp-1">
          {timeSlot.name}
        </div>

        {timeSlot.locationName && (
          <div className="flex items-center space-x-1 mt-1 text-xs text-gray-500">
            <MapPinIcon className="w-3 h-3" />
            <span className="truncate">{timeSlot.locationName}</span>
          </div>
        )}

        <div className="mt-2 w-full bg-gray-200 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              availability.status === 'full' ? 'bg-red-500' :
              availability.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'
            }`}
            style={{ width: `${availability.utilizationRate * 100}%` }}
          />
        </div>
      </motion.button>
    );
  };

  // Week View
  const renderWeekView = () => (
    <div className="grid grid-cols-7 gap-4">
      {weekDates.map((date, index) => {
        const daySlots = getTimeSlotsForDate(date);
        const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));

        return (
          <div key={index} className="space-y-3">
            {/* Date Header */}
            <button
              onClick={() => handleDateClick(date)}
              className={`
                w-full p-3 rounded-lg border-2 transition-all
                ${isToday(date)
                  ? 'border-blue-500 bg-blue-50'
                  : isSelected(date)
                  ? 'border-blue-300 bg-blue-50'
                  : isPast
                  ? 'border-gray-200 bg-gray-50 opacity-60'
                  : 'border-gray-300 hover:border-blue-300'
                }
              `}
            >
              <div className="text-xs text-gray-600 font-medium uppercase">
                {date.toLocaleDateString('en-US', { weekday: 'short' })}
              </div>
              <div className={`text-2xl font-bold ${isToday(date) ? 'text-blue-600' : 'text-gray-900'}`}>
                {date.getDate()}
              </div>
              {isToday(date) && (
                <div className="text-xs text-blue-600 font-medium">Today</div>
              )}
            </button>

            {/* Time Slots */}
            <div className="space-y-2 min-h-[200px]">
              {daySlots.length > 0 ? (
                daySlots.map(slot => (
                  <TimeSlotCard key={slot.id} timeSlot={slot} date={date} />
                ))
              ) : (
                <div className="text-center py-8 text-sm text-gray-400">
                  No slots
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );

  // Day View
  const renderDayView = () => {
    const daySlots = getTimeSlotsForDate(currentDate);

    return (
      <div className="space-y-4">
        {/* Date Header */}
        <div className="bg-white rounded-lg border-2 border-blue-500 p-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 font-medium uppercase">
              {currentDate.toLocaleDateString('en-US', { weekday: 'long' })}
            </div>
            <div className="text-4xl font-bold text-gray-900 my-2">
              {currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
            {isToday(currentDate) && (
              <Badge variant="info" size="sm">Today</Badge>
            )}
          </div>
        </div>

        {/* Time Slots */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {daySlots.length > 0 ? (
            daySlots.map(slot => (
              <TimeSlotCard key={slot.id} timeSlot={slot} date={currentDate} />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <ClockIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Time Slots Available</h3>
              <p className="text-gray-600">There are no time slots configured for this date.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewMode === 'week' ? navigateWeek(-1) : navigateDay(-1)}
            >
              <ChevronLeftIcon className="w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
            >
              Today
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => viewMode === 'week' ? navigateWeek(1) : navigateDay(1)}
            >
              <ChevronRightIcon className="w-5 h-5" />
            </Button>
          </div>

          <div className="text-lg font-semibold text-gray-900">
            {viewMode === 'week' ? (
              <>
                {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </>
            ) : (
              currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'week' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('week')}
          >
            Week
          </Button>
          <Button
            variant={viewMode === 'day' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setViewMode('day')}
          >
            Day
          </Button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Calendar Grid */}
      {!loading && (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === 'week' ? renderWeekView() : renderDayView()}
          </motion.div>
        </AnimatePresence>
      )}

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span className="text-gray-600">Limited</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-gray-600">Full</span>
        </div>
      </div>
    </div>
  );
};

CalendarView.propTypes = {
  onDateSelect: PropTypes.func,
  onTimeSlotSelect: PropTypes.func,
  selectedDate: PropTypes.oneOfType([PropTypes.string, PropTypes.instanceOf(Date)]),
  selectedTimeSlot: PropTypes.object,
  locationId: PropTypes.number,
  loading: PropTypes.bool,
  timeSlots: PropTypes.arrayOf(PropTypes.object),
  bookings: PropTypes.object,
  className: PropTypes.string
};

export default CalendarView;
