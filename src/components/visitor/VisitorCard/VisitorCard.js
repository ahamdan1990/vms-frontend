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
  ShieldExclamationIcon,
  PlusCircleIcon
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
  onCreateInvitation,
  selected = false,
  onSelect,
  showActions = true,
  showSelection = false,
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
    <div className={`relative bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md dark:hover:shadow-lg transition-all duration-200 ${variantClasses[variant]} ${className} ${selected ? 'ring-2 ring-blue-500 dark:ring-blue-400 border-blue-500 dark:border-blue-400 bg-blue-50/30 dark:bg-blue-900/20' : ''}`}>
      {/* Selection Checkbox */}
      {showSelection && (
        <div className={`absolute ${variant === 'default' ? 'top-3 right-3' : 'top-4 left-4'} z-10`}>
          <label className="flex items-center justify-center cursor-pointer group">
            <input
              type="checkbox"
              checked={selected}
              onChange={(e) => onSelect && onSelect(e.target.checked)}
              className="w-5 h-5 rounded border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-500 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 focus:ring-offset-2 dark:focus:ring-offset-gray-800 cursor-pointer transition-all duration-150 hover:border-blue-400 dark:hover:border-blue-500 checked:border-blue-600 dark:checked:border-blue-500"
              onClick={(e) => e.stopPropagation()}
            />
          </label>
        </div>
      )}

      {/* Grid View (Default) - Vertical Layout */}
      {variant === 'default' ? (
        <div className="flex flex-col space-y-4">
          {/* Profile Photo - Centered */}
          <div className="flex justify-center">
            <div className={`flex-shrink-0 ${photoSize[variant]}`}>
              {(visitor.profilePhotoUrl || visitor.ProfilePhotoUrl) ? (
                <img
                  src={visitor.profilePhotoUrl || visitor.ProfilePhotoUrl}
                  alt={`${visitor.firstName} ${visitor.lastName}`}
                  className={`${photoSize[variant]} rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:shadow-md transition-shadow`}
                  onClick={handleView}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div className={`${photoSize[variant]} rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-600 shadow-sm flex items-center justify-center cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${(visitor.profilePhotoUrl || visitor.ProfilePhotoUrl) ? 'hidden' : 'flex'}`} onClick={handleView}>
                <UserIcon className="w-6 h-6 text-gray-400 dark:text-gray-500" />
              </div>
            </div>
          </div>

          {/* Visitor Information - Centered */}
          <div className="flex-1 min-w-0 text-center">
            {/* Name and Status */}
            <div className="flex flex-col items-center space-y-2 mb-3">
              <h3
                className="font-semibold text-gray-900 dark:text-white cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-base line-clamp-1"
                onClick={handleView}
                title={visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}
              >
                {visitor.fullName || `${visitor.firstName} ${visitor.lastName}`}
              </h3>
              {getStatusBadge()}
            </div>

            {/* Contact Information */}
            <div className="space-y-2 mb-3">
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate" title={visitor.email}>{visitor.email}</span>
              </div>

              {visitor.phoneNumber && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{visitor.phoneNumber}</span>
                </div>
              )}

              {visitor.company && (
                <div className="flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate" title={visitor.company}>{visitor.company}</span>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center justify-center space-x-3 mb-3">
              <span>{visitor.visitCount} visits</span>
              {visitor.lastVisitDate && (
                <>
                  <span>•</span>
                  <span>Last: {formatDate(visitor.lastVisitDate)}</span>
                </>
              )}
            </div>

            {/* Quick Actions - Centered Icons */}
            {showActions && (
              <div className="flex items-center justify-center space-x-2">
                <Button
                  onClick={handleView}
                  variant="ghost"
                  size="sm"
                  className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                  title="View details"
                >
                  <EyeIcon className="w-4 h-4" />
                </Button>

                {onCreateInvitation && !visitor.isBlacklisted && (
                  <Button
                    onClick={() => onCreateInvitation(visitor)}
                    variant="ghost"
                    size="sm"
                    className="text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400"
                    title="Create invitation"
                  >
                    <PlusCircleIcon className="w-4 h-4" />
                  </Button>
                )}

                {onEdit && (
                  <Button
                    onClick={() => onEdit(visitor)}
                    variant="ghost"
                    size="sm"
                    className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400"
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
                    className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
                    title="Delete visitor"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        /* List and Compact Views - Horizontal Layout */
        <div className={`flex items-start space-x-4 ${showSelection ? 'ml-8' : ''}`}>
          {/* Profile Photo */}
          <div className={`flex-shrink-0 ${photoSize[variant]}`}>
            {(visitor.profilePhotoUrl || visitor.ProfilePhotoUrl) ? (
              <img
                src={visitor.profilePhotoUrl || visitor.ProfilePhotoUrl}
                alt={`${visitor.firstName} ${visitor.lastName}`}
                className={`${photoSize[variant]} rounded-full object-cover border-2 border-white shadow-sm`}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className={`${photoSize[variant]} rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-600 shadow-sm flex items-center justify-center ${(visitor.profilePhotoUrl || visitor.ProfilePhotoUrl) ? 'hidden' : 'flex'}`}>
              <UserIcon className={`${variant === 'minimal' ? 'w-4 h-4' : 'w-6 h-6'} text-gray-400 dark:text-gray-500`} />
            </div>
          </div>

          {/* Visitor Information */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <div className="min-w-0 flex-1">
                {/* Name and Status */}
                <div className="flex items-center space-x-2 mb-2">
                  <h3
                    className={`font-medium text-gray-900 dark:text-white truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors ${
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
                      <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                        <EnvelopeIcon className="w-4 h-4 flex-shrink-0" />
                        <span className="truncate">{visitor.email}</span>
                      </div>

                      {visitor.phoneNumber && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <PhoneIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{visitor.phoneNumber}</span>
                        </div>
                      )}

                      {visitor.company && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                          <BuildingOfficeIcon className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{visitor.company}</span>
                        </div>
                      )}
                    </>
                  )}

                  {variant === 'minimal' && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                      {visitor.email}
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {showActions && (
                <div className="flex items-center space-x-1 ml-4">
                  <Button
                    onClick={handleView}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    title="View details"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </Button>

                  {onCreateInvitation && !visitor.isBlacklisted && (
                    <Button
                      onClick={() => onCreateInvitation(visitor)}
                      variant="ghost"
                      size="sm"
                      className="text-green-400 hover:text-green-600 dark:text-green-500 dark:hover:text-green-400"
                      title="Create invitation"
                    >
                      <PlusCircleIcon className="w-4 h-4" />
                    </Button>
                  )}

                  {onEdit && (
                    <Button
                      onClick={() => onEdit(visitor)}
                      variant="ghost"
                      size="sm"
                      className="text-blue-400 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400"
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
                      className="text-red-400 hover:text-red-600 dark:text-red-500 dark:hover:text-red-400"
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
      )}

      {/* Expanded Actions for Default Variant */}
      {variant === 'default' && showActions && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          <div className="flex flex-col space-y-3">
            {/* Main Actions - Centered */}
            <div className="flex items-center justify-center flex-wrap gap-2">
              {onCreateInvitation && !visitor.isBlacklisted && (
                <Button
                  onClick={() => onCreateInvitation(visitor)}
                  variant="primary"
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white flex-1 min-w-[140px]"
                >
                  <PlusCircleIcon className="w-4 h-4 mr-1" />
                  Create Invitation
                </Button>
              )}

              {onToggleVip && (
                <Button
                  onClick={() => onToggleVip(visitor)}
                  variant={visitor.isVip ? "solid" : "outline"}
                  size="sm"
                  className={visitor.isVip ? "bg-yellow-500 hover:bg-yellow-600 text-white flex-1 min-w-[120px]" : "flex-1 min-w-[120px]"}
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
                  className={visitor.isBlacklisted ? "bg-red-500 hover:bg-red-600 text-white flex-1 min-w-[140px]" : "text-red-600 border-red-200 flex-1 min-w-[140px]"}
                >
                  <ShieldExclamationIcon className="w-4 h-4 mr-1" />
                  {visitor.isBlacklisted ? 'Remove Blacklist' : 'Blacklist'}
                </Button>
              )}
            </div>

            {/* Created Date - Centered */}
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Created {formatDate(visitor.createdOn)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// VisitorCard.propTypes = {
//   visitor: PropTypes.shape({
//     id: PropTypes.number.isRequired,
//     firstName: PropTypes.string.isRequired,
//     lastName: PropTypes.string.isRequired,
//     fullName: PropTypes.string,
//     email: PropTypes.string.isRequired,
//     phoneNumber: PropTypes.string,
//     company: PropTypes.string,
//     profilePhotoUrl: PropTypes.string,
//     isVip: PropTypes.bool,
//     isBlacklisted: PropTypes.bool,
//     visitCount: PropTypes.number,
//     lastVisitDate: PropTypes.string,
//     createdOn: PropTypes.string
//   }).isRequired,
//   onEdit: PropTypes.func,
//   onDelete: PropTypes.func,
//   onToggleVip: PropTypes.func,
//   onToggleBlacklist: PropTypes.func,
//   selected: PropTypes.bool,
//   onSelect: PropTypes.func,
//   showActions: PropTypes.bool,
//   showSelection: PropTypes.bool,
//   variant: PropTypes.oneOf(['default', 'compact', 'minimal']),
//   className: PropTypes.string
// };

export default VisitorCard;
