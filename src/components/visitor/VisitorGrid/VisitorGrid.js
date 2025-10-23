// src/components/visitor/VisitorGrid/VisitorGrid.js
import React, { useState } from 'react';
import PropTypes from 'prop-types';

// Components
import VisitorCard from '../VisitorCard/VisitorCard';
import BulkActions from '../BulkActions/BulkActions';
import Button from '../../common/Button/Button';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../common/EmptyState/EmptyState';

// Icons
import {
  Squares2X2Icon,
  ListBulletIcon,
  TableCellsIcon,
  UserIcon
} from '@heroicons/react/24/outline';

/**
 * Visitor Grid Component
 * Provides multiple view options for displaying visitors with bulk operations support
 */
const VisitorGrid = ({
  visitors = [],
  loading = false,
  viewMode = 'grid', // 'grid', 'list', 'compact'
  onViewModeChange,
  onEdit,
  onDelete,
  onToggleVip,
  onToggleBlacklist,
  // Bulk operations
  selectedVisitors = [],
  onSelectionChange,
  onBulkMarkVip,
  onBulkRemoveVip,
  onBulkBlacklist,
  onBulkRemoveBlacklist,
  onBulkDelete,
  onBulkSendInvitation,
  bulkLoading = false,
  // Display options
  showActions = true,
  showViewToggle = true,
  showBulkActions = true,
  allowBulkSelection = true,
  emptyMessage = "No visitors found",
  emptyDescription = "Try adjusting your search criteria or add a new visitor.",
  className = ''
}) => {
  const [localViewMode, setLocalViewMode] = useState(viewMode);

  // Compute selectAll based on selectedVisitors prop (derive from source of truth)
  const selectAll = visitors.length > 0 && selectedVisitors.length === visitors.length;

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setLocalViewMode(mode);
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Handle bulk selection
  const handleSelectAll = () => {
    if (onSelectionChange) {
      if (selectAll) {
        // If currently all selected, deselect all
        onSelectionChange([]);
      } else {
        // If not all selected, select all
        onSelectionChange(visitors.map(v => v.id));
      }
    }
  };

  // Handle individual visitor selection
  const handleVisitorSelection = (visitorId, selected) => {
    if (!onSelectionChange) return;

    let newSelection;
    if (selected) {
      newSelection = [...selectedVisitors, visitorId];
    } else {
      newSelection = selectedVisitors.filter(id => id !== visitorId);
    }

    onSelectionChange(newSelection);
    // Note: selectAll is now computed from selectedVisitors, no need to update state
  };

  // Handle clear selection
  const handleClearSelection = () => {
    if (onSelectionChange) {
      onSelectionChange([]);
    }
    // Note: selectAll is now computed from selectedVisitors, no need to update state
  };

  // Get current view mode
  const currentViewMode = onViewModeChange ? viewMode : localViewMode;

  // View mode configurations
  const viewModes = [
    {
      id: 'grid',
      icon: Squares2X2Icon,
      label: 'Grid View',
      description: 'Card layout with photos'
    },
    {
      id: 'list',
      icon: ListBulletIcon,
      label: 'List View',
      description: 'Compact list layout'
    },
    {
      id: 'compact',
      icon: TableCellsIcon,
      label: 'Compact View',
      description: 'Dense information layout'
    }
  ];

  // Get grid classes based on view mode
  const getGridClasses = () => {
    switch (currentViewMode) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'list':
        return 'space-y-4';
      case 'compact':
        return 'space-y-2';
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  // Get card variant based on view mode
  const getCardVariant = () => {
    switch (currentViewMode) {
      case 'grid':
        return 'default';
      case 'list':
        return 'compact';
      case 'compact':
        return 'minimal';
      default:
        return 'default';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Empty state
  if (!visitors || visitors.length === 0) {
    return (
      <div className={className}>
        {showViewToggle && (
          <div className="mb-6">
            <ViewModeToggle
              modes={viewModes}
              activeMode={currentViewMode}
              onModeChange={handleViewModeChange}
            />
          </div>
        )}
        
        <EmptyState
          icon={UserIcon}
          title="No Visitors Found"
          description={emptyDescription}
          className="py-12"
        />
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Header with View Mode Toggle and Bulk Selection */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          {/* Bulk Selection Controls */}
          {allowBulkSelection && visitors.length > 0 && (
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  Select all ({visitors.length})
                </span>
              </label>
              
              {selectedVisitors.length > 0 && (
                <span className="text-sm text-gray-600">
                  {selectedVisitors.length} selected
                </span>
              )}
            </div>
          )}
          
          {/* View Mode Toggle */}
          {showViewToggle && (
            <ViewModeToggle
              modes={viewModes}
              activeMode={currentViewMode}
              onModeChange={handleViewModeChange}
            />
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {showBulkActions && allowBulkSelection && selectedVisitors.length > 0 && (
        <div className="mb-6">
          <BulkActions
            selectedCount={selectedVisitors.length}
            onClearSelection={handleClearSelection}
            onMarkVip={onBulkMarkVip}
            onRemoveVip={onBulkRemoveVip}
            onBlacklist={onBulkBlacklist}
            onRemoveBlacklist={onBulkRemoveBlacklist}
            onDelete={onBulkDelete}
            onSendInvitation={onBulkSendInvitation}
            loading={bulkLoading}
          />
        </div>
      )}

      {/* Visitors Grid */}
      <div className={getGridClasses()}>
        {visitors.map((visitor) => (
          <VisitorCard
            key={visitor.id}
            visitor={visitor}
            variant={getCardVariant()}
            selected={allowBulkSelection ? selectedVisitors.includes(visitor.id) : false}
            onSelect={allowBulkSelection ? (selected) => handleVisitorSelection(visitor.id, selected) : undefined}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggleVip={onToggleVip}
            onToggleBlacklist={onToggleBlacklist}
            showActions={showActions}
            showSelection={allowBulkSelection}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * View Mode Toggle Component
 */
const ViewModeToggle = ({ modes, activeMode, onModeChange }) => {
  return (
    <div className="flex items-center justify-end">
      <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
        {modes.map((mode) => {
          const Icon = mode.icon;
          return (
            <Button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              variant={activeMode === mode.id ? "solid" : "ghost"}
              size="sm"
              className={`${
                activeMode === mode.id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
              title={mode.description}
            >
              <Icon className="w-4 h-4" />
              <span className="ml-1 hidden sm:inline">{mode.label.split(' ')[0]}</span>
            </Button>
          );
        })}
      </div>
    </div>
  );
};

VisitorGrid.propTypes = {
  visitors: PropTypes.arrayOf(PropTypes.object),
  loading: PropTypes.bool,
  viewMode: PropTypes.oneOf(['grid', 'list', 'compact']),
  onViewModeChange: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleVip: PropTypes.func,
  onToggleBlacklist: PropTypes.func,
  // Bulk operations
  selectedVisitors: PropTypes.arrayOf(PropTypes.number),
  onSelectionChange: PropTypes.func,
  onBulkMarkVip: PropTypes.func,
  onBulkRemoveVip: PropTypes.func,
  onBulkBlacklist: PropTypes.func,
  onBulkRemoveBlacklist: PropTypes.func,
  onBulkDelete: PropTypes.func,
  onBulkSendInvitation: PropTypes.func,
  bulkLoading: PropTypes.bool,
  // Display options
  showActions: PropTypes.bool,
  showViewToggle: PropTypes.bool,
  showBulkActions: PropTypes.bool,
  allowBulkSelection: PropTypes.bool,
  emptyMessage: PropTypes.string,
  emptyDescription: PropTypes.string,
  className: PropTypes.string
};

ViewModeToggle.propTypes = {
  modes: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    label: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired
  })).isRequired,
  activeMode: PropTypes.string.isRequired,
  onModeChange: PropTypes.func.isRequired
};

export default VisitorGrid;
