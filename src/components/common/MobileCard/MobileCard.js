// src/components/common/MobileCard/MobileCard.js
// QUICK WIN #3: Mobile-Responsive Card Component (20 minutes)

import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';
import Badge from '../Badge/Badge';

const MobileCard = ({ 
  data, 
  fields = [], 
  actions = [], 
  onClick,
  className = '' 
}) => {
  const handleCardClick = (e) => {
    // Don't trigger card click if clicking on actions
    if (e.target.closest('[data-mobile-card-action]')) {
      return;
    }
    if (onClick) {
      onClick(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white rounded-lg border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow duration-200 ${
        onClick ? 'cursor-pointer' : ''
      } ${className}`}
      onClick={handleCardClick}
    >
      {/* Primary Content */}
      <div className="space-y-3">
        {fields.map((field, index) => (
          <MobileCardField key={field.key || index} field={field} data={data} />
        ))}
      </div>

      {/* Actions */}
      {actions.length > 0 && (
        <div className="flex items-center justify-end space-x-2 mt-4 pt-3 border-t border-gray-100">
          {actions.map((action, index) => (
            <div key={index} data-mobile-card-action>
              {action}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

const MobileCardField = ({ field, data }) => {
  const value = field.render ? field.render(data[field.key], data) : data[field.key];
  
  if (!value && field.hideEmpty) {
    return null;
  }

  const displayValue = value || field.emptyText || '-';

  return (
    <div className={`flex ${field.layout === 'stacked' ? 'flex-col space-y-1' : 'items-center justify-between'}`}>
      <div className={`text-sm font-medium text-gray-600 ${field.layout === 'stacked' ? '' : 'flex-shrink-0'}`}>
        {field.label}
      </div>
      
      <div className={`text-sm text-gray-900 ${field.layout === 'stacked' ? '' : 'text-right flex-1 min-w-0'}`}>
        {typeof displayValue === 'string' ? (
          <span className={field.truncate ? 'truncate' : ''}>{displayValue}</span>
        ) : (
          displayValue
        )}
      </div>
    </div>
  );
};

// Specialized components for common use cases
export const VisitorMobileCard = ({ visitor, actions = [] }) => {
  const visitorFields = [
    {
      key: 'name',
      label: 'Name',
      layout: 'stacked',
      render: (value, visitor) => (
        <div className="flex items-center space-x-2">
          <span className="font-semibold text-gray-900">{visitor.fullName}</span>
          {visitor.isVip && <Badge color="yellow" size="xs">VIP</Badge>}
          {visitor.isBlacklisted && <Badge color="red" size="xs">Blacklisted</Badge>}
        </div>
      )
    },
    {
      key: 'company',
      label: 'Company',
      emptyText: 'No company'
    },
    {
      key: 'email',
      label: 'Email',
      truncate: true
    },
    {
      key: 'phoneNumber',
      label: 'Phone',
      hideEmpty: true
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, visitor) => (
        <Badge 
          color={visitor.isActive ? 'green' : 'gray'} 
          size="sm"
        >
          {visitor.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    }
  ];

  return (
    <MobileCard 
      data={visitor}
      fields={visitorFields}
      actions={actions}
    />
  );
};

export const InvitationMobileCard = ({ invitation, actions = [] }) => {
  const invitationFields = [
    {
      key: 'visitorName',
      label: 'Visitor',
      layout: 'stacked',
      render: (value, invitation) => (
        <span className="font-semibold text-gray-900">{invitation.visitorName}</span>
      )
    },
    {
      key: 'purpose',
      label: 'Purpose',
      emptyText: 'General visit'
    },
    {
      key: 'visitDate',
      label: 'Date',
      render: (value) => value ? new Date(value).toLocaleDateString() : '-'
    },
    {
      key: 'status',
      label: 'Status',
      render: (value, invitation) => {
        const statusColors = {
          'Pending': 'yellow',
          'Approved': 'green', 
          'Rejected': 'red',
          'Completed': 'gray'
        };
        return (
          <Badge 
            color={statusColors[invitation.status] || 'gray'} 
            size="sm"
          >
            {invitation.status}
          </Badge>
        );
      }
    }
  ];

  return (
    <MobileCard 
      data={invitation}
      fields={invitationFields}
      actions={actions}
    />
  );
};

MobileCard.propTypes = {
  data: PropTypes.object.isRequired,
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      layout: PropTypes.oneOf(['inline', 'stacked']),
      hideEmpty: PropTypes.bool,
      emptyText: PropTypes.string,
      truncate: PropTypes.bool
    })
  ),
  actions: PropTypes.arrayOf(PropTypes.node),
  onClick: PropTypes.func,
  className: PropTypes.string
};

MobileCardField.propTypes = {
  field: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired
};

export default MobileCard;