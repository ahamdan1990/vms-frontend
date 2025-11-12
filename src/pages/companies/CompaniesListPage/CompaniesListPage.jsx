import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

// Services
import companyService from '../../../services/companyService';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Badge from '../../../components/common/Badge/Badge';
import Card from '../../../components/common/Card/Card';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  XCircleIcon,
  BuildingOffice2Icon,
  EnvelopeIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

/**
 * Companies Management Page
 * Manages company CRUD operations with search, filtering, and verification
 */
const CompaniesListPage = () => {
  // Hooks
  const { isAdmin, systemConfig } = usePermissions();

  // Permissions - Allow admin users to manage companies
  const canRead = isAdmin || systemConfig.canRead;
  const canCreate = isAdmin;
  const canUpdate = isAdmin;
  const canDelete = isAdmin;

  // Local state
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentCompany, setCurrentCompany] = useState(null);
  const [viewingCompany, setViewingCompany] = useState(null);
  const [formData, setFormData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    searchTerm: '',
    isVerified: null,
    sortBy: 'Name',
    sortDirection: 'asc'
  });

  // Load companies
  const loadCompanies = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await companyService.getCompanies({
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        ...filters
      });

      if (response && response.companies) {
        setCompanies(response.companies);
        if (response.totalRecords) {
          setPagination(prev => ({ ...prev, total: response.totalRecords }));
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to load companies');
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, filters]);

  // Load companies on mount and when filters change
  useEffect(() => {
    if (canRead) {
      loadCompanies();
    }
  }, [loadCompanies, canRead]);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm: searchInput }));
      setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Handle create company
  const handleCreateCompany = async (companyDataToCreate) => {
    try {
      setFormLoading(true);
      setError(null);
      await companyService.createCompany(companyDataToCreate);
      setShowCreateModal(false);
      setFormData(null);
      await loadCompanies();
    } catch (err) {
      setError(err.message || 'Failed to create company');
      console.error('Error creating company:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update company
  const handleUpdateCompany = async (companyDataToUpdate) => {
    try {
      setFormLoading(true);
      setError(null);
      await companyService.updateCompany(currentCompany.id, companyDataToUpdate);
      setShowEditModal(false);
      setCurrentCompany(null);
      setFormData(null);
      await loadCompanies();
    } catch (err) {
      setError(err.message || 'Failed to update company');
      console.error('Error updating company:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete company
  const handleDeleteCompany = async () => {
    try {
      setFormLoading(true);
      setError(null);
      await companyService.deleteCompany(currentCompany.id);
      setShowDeleteModal(false);
      setCurrentCompany(null);
      await loadCompanies();
    } catch (err) {
      setError(err.message || 'Failed to delete company');
      console.error('Error deleting company:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle verify company
  const handleVerifyCompany = async (companyId) => {
    try {
      setError(null);
      await companyService.verifyCompany(companyId);
      await loadCompanies();
    } catch (err) {
      setError(err.message || 'Failed to verify company');
      console.error('Error verifying company:', err);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Company',
      sortable: true,
      render: (value, company) => (
        <div>
          <div className="flex items-center space-x-2">
            <div className="flex-shrink-0">
              <BuildingOffice2Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">{company.name}</span>
              {company.code && (
                <div className="text-sm text-gray-500">{company.code}</div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'industry',
      header: 'Industry',
      sortable: true,
      render: (value, company) => (
        <span className="text-sm text-gray-900">
          {company.industry || '-'}
        </span>
      )
    },
    {
      key: 'contactPersonName',
      header: 'Contact Person',
      render: (value, company) => (
        <div className="text-sm text-gray-900">
          {company.contactPersonName ? (
            <>
              <div>{company.contactPersonName}</div>
              {company.email && (
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <EnvelopeIcon className="w-3 h-3 mr-1" />
                  {company.email}
                </div>
              )}
              {company.phoneNumber && (
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <PhoneIcon className="w-3 h-3 mr-1" />
                  {company.phoneNumber}
                </div>
              )}
            </>
          ) : (
            '-'
          )}
        </div>
      )
    },
    {
      key: 'isVerified',
      header: 'Verification',
      sortable: true,
      render: (value, company) => (
        <div className="flex items-center space-x-2">
          <Badge
            variant={company.isVerified ? 'success' : 'secondary'}
            size="sm"
          >
            {company.isVerified ? 'Verified' : 'Unverified'}
          </Badge>
          {!company.isVerified && canUpdate && (
            <button
              onClick={() => handleVerifyCompany(company.id)}
              className="text-blue-600 hover:text-blue-900 text-xs font-medium"
              title="Verify company"
            >
              Verify
            </button>
          )}
        </div>
      )
    },
    {
      key: 'visitorCount',
      header: 'Visitors',
      sortable: true,
      render: (value, company) => (
        <span className="text-sm font-medium text-gray-900">
          {company.visitorCount || 0}
        </span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      sortable: true,
      render: (value, company) => (
        <Badge
          variant={company.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {company.isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      width: '120px',
      sortable: false,
      render: (value, company) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setViewingCompany(company);
              setShowViewModal(true);
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title="View details"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
          {canUpdate && (
            <button
              onClick={() => {
                setCurrentCompany(company);
                setFormData(company);
                setShowEditModal(true);
              }}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title="Edit company"
            >
              <PencilIcon className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => {
                setCurrentCompany(company);
                setShowDeleteModal(true);
              }}
              className="text-red-600 hover:text-red-900 transition-colors"
              title="Delete company"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          )}
        </div>
      )
    }
  ];

  const handleResetFilters = () => {
    setSearchInput('');
    setFilters({
      searchTerm: '',
      isVerified: null,
      sortBy: 'Name',
      sortDirection: 'asc'
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  if (!canRead) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">You don't have permission to view companies</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage company information and verify company details
          </p>
        </div>
        {canCreate && (
          <Button
            onClick={() => {
              setFormData(null);
              setShowCreateModal(true);
            }}
            icon={<PlusIcon className="w-5 h-5" />}
          >
            Add Company
          </Button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Search and Filters */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search companies..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              icon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              Filters
            </Button>

            {filters.searchTerm && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Expanded Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t border-gray-200"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Status
                  </label>
                  <select
                    value={filters.isVerified === null ? '' : filters.isVerified}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        isVerified: e.target.value === '' ? null : e.target.value === 'true'
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">All</option>
                    <option value="true">Verified</option>
                    <option value="false">Unverified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort By
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, sortBy: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Name">Name</option>
                    <option value="Code">Code</option>
                    <option value="CreatedOn">Created Date</option>
                    <option value="VisitorCount">Visitor Count</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sort Direction
                  </label>
                  <select
                    value={filters.sortDirection}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, sortDirection: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">Ascending</option>
                    <option value="desc">Descending</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>

      {/* Main Content */}
      <Card>
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : companies.length === 0 ? (
          <div className="text-center py-12">
            <BuildingOffice2Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No companies found</h3>
            <p className="text-gray-500 mt-2">Get started by creating a new company</p>
          </div>
        ) : (
          <Table
            data={companies}
            columns={columns}
            loading={loading}
            emptyMessage="No companies found"
            className="companies-table"
          />
        )}
      </Card>

      {/* View Company Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingCompany(null);
        }}
        title="Company Details"
        size="lg"
      >
        {viewingCompany && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Code</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.code}</p>
              </div>
            </div>

            {viewingCompany.industry && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Industry</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.industry}</p>
              </div>
            )}

            {viewingCompany.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingCompany.contactPersonName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Contact Person</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingCompany.contactPersonName}</p>
                </div>
              )}
              {viewingCompany.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingCompany.email}</p>
                </div>
              )}
              {viewingCompany.phoneNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingCompany.phoneNumber}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Verification Status</label>
                <div className="mt-1">
                  <Badge variant={viewingCompany.isVerified ? 'success' : 'secondary'} size="sm">
                    {viewingCompany.isVerified ? 'Verified' : 'Unverified'}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">
                  <Badge variant={viewingCompany.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingCompany.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingCompany(null);
                }}
              >
                Close
              </Button>
              {canUpdate && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    setCurrentCompany(viewingCompany);
                    setFormData(viewingCompany);
                    setShowEditModal(true);
                  }}
                >
                  Edit
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={showCreateModal || showEditModal}
        onClose={() => {
          setShowCreateModal(false);
          setShowEditModal(false);
          setFormData(null);
          setCurrentCompany(null);
        }}
        title={showCreateModal ? 'Create Company' : 'Edit Company'}
        size="lg"
      >
        <CompanyForm
          initialData={formData}
          onSubmit={showCreateModal ? handleCreateCompany : handleUpdateCompany}
          onCancel={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setFormData(null);
            setCurrentCompany(null);
          }}
          loading={formLoading}
          error={error}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCurrentCompany(null);
        }}
        onConfirm={handleDeleteCompany}
        title="Delete Company"
        message={
          currentCompany
            ? `Are you sure you want to delete "${currentCompany.name}"? This cannot be undone.`
            : 'Are you sure you want to delete this company?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={formLoading}
      />
    </div>
  );
};

// Placeholder CompanyForm component
const CompanyForm = ({ initialData, onSubmit, onCancel, loading, error }) => {
  const [formState, setFormState] = useState(initialData || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Name *</label>
        <input
          type="text"
          name="name"
          required
          value={formState.name || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Company Code *</label>
        <input
          type="text"
          name="code"
          required
          value={formState.code || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Industry</label>
        <input
          type="text"
          name="industry"
          value={formState.industry || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          name="description"
          value={formState.description || ''}
          onChange={handleChange}
          rows="3"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Contact Person</label>
          <input
            type="text"
            name="contactPersonName"
            value={formState.contactPersonName || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            name="email"
            value={formState.email || ''}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel} type="button">
          Cancel
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? 'Update' : 'Create'}
        </Button>
      </div>
    </form>
  );
};

export default CompaniesListPage;
