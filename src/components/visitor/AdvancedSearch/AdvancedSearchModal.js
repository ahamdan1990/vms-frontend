// src/components/visitor/AdvancedSearch/AdvancedSearchModal.js
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';

// Redux actions and selectors
import {
  advancedSearchVisitors,
  hideAdvancedSearchModal,
  clearAdvancedSearchResults
} from '../../../store/slices/visitorsSlice';

import {
  selectShowAdvancedSearchModal,
  selectAdvancedSearchResults,
  selectAdvancedSearchLoading,
  selectAdvancedSearchError
} from '../../../store/selectors/visitorSelectors';

// Components
import Modal from '../../common/Modal/Modal';
import Button from '../../common/Button/Button';
import Input from '../../common/Input/Input';
import Card from '../../common/Card/Card';
import Badge from '../../common/Badge/Badge';
import Table from '../../common/Table/Table';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';

// Icons
import { 
  MagnifyingGlassIcon,
  XMarkIcon,
  UserIcon,
  BuildingOfficeIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  StarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Utils
import { formatDateTime } from '../../../utils/formatters';
import { extractErrorMessage } from '../../../utils/errorUtils';

/**
 * Advanced Search Modal Component
 * Provides comprehensive search functionality for visitors
 * Includes multiple search criteria and real-time results
 */
const AdvancedSearchModal = ({ onSelectVisitor = null }) => {
  const dispatch = useDispatch();

  // Redux selectors
  const isOpen = useSelector(selectShowAdvancedSearchModal);
  const searchResults = useSelector(selectAdvancedSearchResults);
  const searchLoading = useSelector(selectAdvancedSearchLoading);
  const searchError = useSelector(selectAdvancedSearchError);

  // Local state for search criteria
  const [searchCriteria, setSearchCriteria] = useState({
    searchTerm: '',
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    company: '',
    jobTitle: '',
    nationality: '',
    governmentId: '',
    securityClearance: '',
    isVip: null,
    isBlacklisted: null,
    isActive: true,
    dateOfBirthFrom: '',
    dateOfBirthTo: '',
    createdFrom: '',
    createdTo: '',
    lastVisitFrom: '',
    lastVisitTo: ''
  });

  const [hasSearched, setHasSearched] = useState(false);

  // Clear search when modal opens
  useEffect(() => {
    if (isOpen) {
      dispatch(clearAdvancedSearchResults());
      setHasSearched(false);
    }
  }, [isOpen, dispatch]);

  // Handle search criteria changes
  const handleCriteriaChange = (field, value) => {
    setSearchCriteria(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Reset search criteria
  const resetCriteria = () => {
    setSearchCriteria({
      searchTerm: '',
      firstName: '',
      lastName: '',
      email: '',
      phoneNumber: '',
      company: '',
      jobTitle: '',
      nationality: '',
      governmentId: '',
      securityClearance: '',
      isVip: null,
      isBlacklisted: null,
      isActive: true,
      dateOfBirthFrom: '',
      dateOfBirthTo: '',
      createdFrom: '',
      createdTo: '',
      lastVisitFrom: '',
      lastVisitTo: ''
    });
    dispatch(clearAdvancedSearchResults());
    setHasSearched(false);
  };

  // Handle search submission
  const handleSearch = async () => {
    // Filter out empty values
    const filteredCriteria = Object.entries(searchCriteria).reduce((acc, [key, value]) => {
      if (value !== '' && value !== null && value !== undefined) {
        acc[key] = value;
      }
      return acc;
    }, {});

    if (Object.keys(filteredCriteria).length === 0) {
      return;
    }

    try {
      await dispatch(advancedSearchVisitors(filteredCriteria)).unwrap();
      setHasSearched(true);
    } catch (error) {
      console.error('Advanced search failed:', error);
    }
  };

  // Close modal
  const handleClose = () => {
    dispatch(hideAdvancedSearchModal());
    dispatch(clearAdvancedSearchResults());
    setHasSearched(false);
  };

  // Handle visitor selection
  const handleVisitorSelect = (visitor) => {
    if (onSelectVisitor) {
      onSelectVisitor(visitor);
      handleClose();
    }
  };

  // Helper functions for display
  const getVisitorStatusBadge = (visitor) => {
    if (visitor.isBlacklisted) {
      return <Badge variant="danger" size="sm">Blacklisted</Badge>;
    }
    if (visitor.isVip) {
      return <Badge variant="warning" size="sm">VIP</Badge>;
    }
    if (!visitor.isActive) {
      return <Badge variant="secondary" size="sm">Inactive</Badge>;
    }
    return <Badge variant="success" size="sm">Active</Badge>;
  };

  const formatVisitorName = (visitor) => {
    return (
      <div className="flex items-center space-x-2">
        {visitor.isVip && (
          <StarIconSolid className="w-4 h-4 text-yellow-500" title="VIP Visitor" />
        )}
        <div>
          <div className="font-medium text-gray-900">
            {visitor.firstName} {visitor.lastName}
          </div>
          {visitor.company && (
            <div className="text-sm text-gray-500">{visitor.company}</div>
          )}
        </div>
      </div>
    );
  };

  // Table columns for search results
  const columns = [
    {
      id: 'name',
      header: 'Visitor',
      cell: ({ row }) => formatVisitorName(row.original)
    },
    {
      id: 'contact',
      header: 'Contact',
      cell: ({ row }) => {
        const visitor = row.original;
        return (
          <div className="space-y-1 text-sm">
            {visitor.email && <div>{visitor.email}</div>}
            {visitor.phoneNumber && <div>{visitor.phoneNumber}</div>}
          </div>
        );
      }
    },
    {
      id: 'details',
      header: 'Details',
      cell: ({ row }) => {
        const visitor = row.original;
        return (
          <div className="space-y-1 text-sm">
            {visitor.nationality && <div>🌍 {visitor.nationality}</div>}
            {visitor.securityClearance && <div>🛡️ {visitor.securityClearance}</div>}
          </div>
        );
      }
    },
    {
      id: 'status',
      header: 'Status',
      cell: ({ row }) => getVisitorStatusBadge(row.original)
    },
    {
      id: 'lastVisit',
      header: 'Last Visit',
      cell: ({ row }) => {
        const lastVisit = row.original.lastVisitAt;
        return lastVisit ? (
          <span className="text-sm text-gray-900">
            {formatDateTime(lastVisit)}
          </span>
        ) : (
          <span className="text-sm text-gray-400">Never</span>
        );
      }
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleVisitorSelect(row.original)}
        >
          Select
        </Button>
      ),
      enableSorting: false
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Advanced Visitor Search"
      size="full"
    >
      <div className="space-y-6">
        {/* Error Display */}
        {searchError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">
              {extractErrorMessage(searchError)}
            </div>
          </div>
        )}

        {/* Search Criteria */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-2">
              <MagnifyingGlassIcon className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-medium text-gray-900">Search Criteria</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={resetCriteria}
              icon={<XMarkIcon className="w-4 h-4" />}
            >
              Clear All
            </Button>
          </div>

          <div className="space-y-6">
            {/* General Search */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>General Search</span>
              </h4>
              <Input
                label="Search Term"
                type="text"
                value={searchCriteria.searchTerm}
                onChange={(e) => handleCriteriaChange('searchTerm', e.target.value)}
                placeholder="Search across all fields..."
              />
            </div>

            {/* Personal Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <UserIcon className="w-4 h-4" />
                <span>Personal Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  value={searchCriteria.firstName}
                  onChange={(e) => handleCriteriaChange('firstName', e.target.value)}
                />
                <Input
                  label="Last Name"
                  type="text"
                  value={searchCriteria.lastName}
                  onChange={(e) => handleCriteriaChange('lastName', e.target.value)}
                />
                <Input
                  label="Email"
                  type="email"
                  value={searchCriteria.email}
                  onChange={(e) => handleCriteriaChange('email', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <Input
                  label="Phone Number"
                  type="tel"
                  value={searchCriteria.phoneNumber}
                  onChange={(e) => handleCriteriaChange('phoneNumber', e.target.value)}
                />
                <Input
                  label="Nationality"
                  type="text"
                  value={searchCriteria.nationality}
                  onChange={(e) => handleCriteriaChange('nationality', e.target.value)}
                />
                <Input
                  label="Government ID"
                  type="text"
                  value={searchCriteria.governmentId}
                  onChange={(e) => handleCriteriaChange('governmentId', e.target.value)}
                />
              </div>
            </div>

            {/* Professional Information */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <BuildingOfficeIcon className="w-4 h-4" />
                <span>Professional Information</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Company"
                  type="text"
                  value={searchCriteria.company}
                  onChange={(e) => handleCriteriaChange('company', e.target.value)}
                />
                <Input
                  label="Job Title"
                  type="text"
                  value={searchCriteria.jobTitle}
                  onChange={(e) => handleCriteriaChange('jobTitle', e.target.value)}
                />
              </div>
            </div>

            {/* Status & Security */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Status & Security</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    VIP Status
                  </label>
                  <select
                    value={searchCriteria.isVip === null ? '' : searchCriteria.isVip.toString()}
                    onChange={(e) => handleCriteriaChange('isVip', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Visitors</option>
                    <option value="true">VIP Only</option>
                    <option value="false">Non-VIP Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Blacklist Status
                  </label>
                  <select
                    value={searchCriteria.isBlacklisted === null ? '' : searchCriteria.isBlacklisted.toString()}
                    onChange={(e) => handleCriteriaChange('isBlacklisted', e.target.value === '' ? null : e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Visitors</option>
                    <option value="true">Blacklisted Only</option>
                    <option value="false">Not Blacklisted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Active Status
                  </label>
                  <select
                    value={searchCriteria.isActive.toString()}
                    onChange={(e) => handleCriteriaChange('isActive', e.target.value === 'true')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="true">Active Only</option>
                    <option value="false">All Visitors</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Security Clearance
                  </label>
                  <select
                    value={searchCriteria.securityClearance}
                    onChange={(e) => handleCriteriaChange('securityClearance', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="Standard">Standard</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Top Secret">Top Secret</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Date Ranges */}
            <div>
              <h4 className="font-medium text-gray-900 mb-4 flex items-center space-x-2">
                <GlobeAltIcon className="w-4 h-4" />
                <span>Date Ranges</span>
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date of Birth
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={searchCriteria.dateOfBirthFrom}
                      onChange={(e) => handleCriteriaChange('dateOfBirthFrom', e.target.value)}
                      placeholder="From"
                    />
                    <Input
                      type="date"
                      value={searchCriteria.dateOfBirthTo}
                      onChange={(e) => handleCriteriaChange('dateOfBirthTo', e.target.value)}
                      placeholder="To"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Registration Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={searchCriteria.createdFrom}
                      onChange={(e) => handleCriteriaChange('createdFrom', e.target.value)}
                      placeholder="From"
                    />
                    <Input
                      type="date"
                      value={searchCriteria.createdTo}
                      onChange={(e) => handleCriteriaChange('createdTo', e.target.value)}
                      placeholder="To"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Visit Date
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="date"
                      value={searchCriteria.lastVisitFrom}
                      onChange={(e) => handleCriteriaChange('lastVisitFrom', e.target.value)}
                      placeholder="From"
                    />
                    <Input
                      type="date"
                      value={searchCriteria.lastVisitTo}
                      onChange={(e) => handleCriteriaChange('lastVisitTo', e.target.value)}
                      placeholder="To"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Search Actions */}
          <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
            <Button
              variant="outline"
              onClick={resetCriteria}
            >
              Clear All
            </Button>
            <Button
              onClick={handleSearch}
              loading={searchLoading}
              icon={<MagnifyingGlassIcon className="w-4 h-4" />}
            >
              Search Visitors
            </Button>
          </div>
        </Card>

        {/* Search Results */}
        {(hasSearched || searchLoading) && (
          <Card>
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">Search Results</h3>
                {searchResults && (
                  <Badge variant="info" size="sm">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </Badge>
                )}
              </div>
            </div>

            {searchLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : searchResults && searchResults.length > 0 ? (
              <Table
                data={searchResults}
                columns={columns}
                emptyMessage="No visitors found matching your search criteria"
                className="advanced-search-results-table"
              />
            ) : hasSearched ? (
              <div className="text-center py-12">
                <MagnifyingGlassIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No results found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Try adjusting your search criteria or clearing some filters.
                </p>
              </div>
            ) : null}
          </Card>
        )}
      </div>
    </Modal>
  );
};

// PropTypes validation
AdvancedSearchModal.propTypes = {
  onSelectVisitor: PropTypes.func
};

export default AdvancedSearchModal;