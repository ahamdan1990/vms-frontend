// src/components/visitor/VisitorCard/VisitorCard.js
import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';

// Constants
import { VISITOR_ROUTES } from '../../../constants/routeConstants';

// Components
import Button from '../../common/Button/Button';
import Badge from '../../common/Badge/Badge';

// Icons
import {
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  StarIcon as StarIconOutline,
  ShieldExclamationIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Utils
import { formatDate } from '../../../utils/formatters';

/**
 * Visitor Card Component
 * Displays visitor information in a card format with profile photo
 */
const VisitorCard = ({
  visitor,
  onEdit,
  onDelete,
  onToggleVip,
  onToggleBlacklist,
  showActions = true,
  variant = 'default', // 'default', 'compact', 'minimal'
  className = ''
}) => {
  const navigate = useNavigate();

  // Handle view visitor
  const handleView = () => {
    navigate(VISITOR_ROUTES.getDetailRoute(visitor.id));
  };

  // Get visitor status badge
  const getStatusBadge = () => {
    if (visitor.isBlacklisted) {
      return (
        <Badge variant="danger" size="sm">
          <ShieldExclamationIcon className="w-3 h-3 mr-1" />
          Blacklisted
        </Badge>
      );
    }
    if (visitor.isVip) {
      return (
        <Badge variant="success" size="sm">
          <StarIconSolid className="w-3 h-3 mr-1" />
          VIP
        </Badge>
      );
    }
    return (
      <Badge variant="info" size="sm">
        Standard
      </Badge>
    );
  };

  // Variant-specific styling
  const variantClasses = {
    default: 'p-6',
    compact: 'p-4',
    minimal: 'p-3'
  };

  const photoSize = {
    default: 'w-16 h-16',
    compact: 'w-12 h-12',
    minimal: 'w-10 h-10'
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 ${variantClasses[variant]} ${className}`}>
      <div className="flex items-start space-x-4">
        {/* Profile Photo */}
        <div className={`flex-shrink-0 ${photoSize[variant]}`}>
          {visitor.profilePhotoUrl ? (
            <img
              src={visitor.profilePhotoUrl}
              alt={`${visitor.firstName} ${visitor.lastName}`}
              className={`${photoSize[variant]} rounded-full object-cover border-2 border-white shadow-sm`}
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div className={`${photoSize[variant]} rounded-full bg-gray-100 border-2 border-white shadow-sm flex items-center justify-center ${visitor.profilePhotoUrl ? 'hidden' : 'flex'}`}>
            <UserIcon className={`${variant === 'minimal' ? 'w-4 h-4' : 'w-6 h-6'} text-gray-400`} />
          </div>
        </div>

        {/* Visitor Information */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="min-w-0 flex-1">
              {/* Name and Status */}
              <div className="flex items-center space-x-2 mb-2">
                <h3 
                  className={`font-medium text-gray-900 truncate cursor-pointer hover:text-blue-600 transition-colors ${
                    variant === 'minimal' ? 'text-sm' : 'text-base'
                  }`}
                  onClick={handleView}
                >
                  {visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}
                </h3>
                {getStatusBadge()}
              </div>

              {/* Contact Information */}
              <div className="space-y-1">
                {variant !== 'minimal' && (
                  <>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                      <span className="truncate">{visitor.email}</span>
                    </div>
                    
                    {visitor.phoneNumber && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{visitor.phoneNumber}</span>
                      </div>
                    )}
                    
                    {visitor.company && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{visitor.company}</span>
                      </div>
                    )}
                  </>
                )}

                {variant === 'minimal' && (
                  <div className="text-xs text-gray-500 truncate">
                    {visitor.email}
                  </div>
                )}
              </div>

              {/* Additional Info */}
              {variant === 'default' && (
                <div className="mt-3 text-xs text-gray-500">
                  <div className="flex items-center justify-between">
                    <span>{visitor.visitCount} visits</span>
                    {visitor.lastVisitDate && (
                      <span>Last visit: {formatDate(visitor.lastVisitDate)}</span>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center space-x-1 ml-4">
                <Button
                  onClick={handleView}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600"
                  title="View details"
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>
                
                {onEdit && (
                  <Button
                    onClick={() => onEdit(visitor)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-600"
                    title="Edit visitor"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>
                )}
                
                {onDelete && (
                  <Button
                    onClick={() => onDelete(visitor)}
                    variant="ghost"
                    size="sm"
                    className="text-red-400 hover:text-red-600"
                    title="Delete visitor"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expanded Actions for Default Variant */}
      {variant === 'default' && showActions && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {onToggleVip && (
                <Button
                  onClick={() => onToggleVip(visitor)}
                  variant={visitor.isVip ? "solid" : "outline"}
                  size="sm"
                  className={visitor.isVip ? "bg-yellow-500 hover:bg-yellow-600 text-white" : ""}
                >
                  <StarIconOutline className="w-4 h-4 mr-1" />
                  {visitor.isVip ? 'Remove VIP' : 'Make VIP'}
                </Button>
              )}
              
              {onToggleBlacklist && (
                <Button
                  onClick={() => onToggleBlacklist(visitor)}
                  variant={visitor.isBlacklisted ? "solid" : "outline"}
                  size="sm"
                  className={visitor.isBlacklisted ? "bg-red-500 hover:bg-red-600 text-white" : "text-red-600 border-red-200"}
                >
                  <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                  {visitor.isBlacklisted ? 'Remove Blacklist' : 'Blacklist'}
                </Button>
              )}
            </div>
            
            <div className="text-xs text-gray-500">
              Created {formatDate(visitor.createdOn)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

VisitorCard.propTypes = {
  visitor: PropTypes.shape({
    id: PropTypes.number.isRequired,
    firstName: PropTypes.string.isRequired,
    lastName: PropTypes.string.isRequired,
    fullName: PropTypes.string,
    email: PropTypes.string.isRequired,
    phoneNumber: PropTypes.string,
    company: PropTypes.string,
    profilePhotoUrl: PropTypes.string,
    isVip: PropTypes.bool,
    isBlacklisted: PropTypes.bool,
    visitCount: PropTypes.number,
    lastVisitDate: PropTypes.string,
    createdOn: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onToggleVip: PropTypes.func,
  onToggleBlacklist: PropTypes.func,
  showActions: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
  className: PropTypes.string
};

export default VisitorCard;
