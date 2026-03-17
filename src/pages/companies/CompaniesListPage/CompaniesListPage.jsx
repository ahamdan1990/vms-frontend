import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('system');
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
      setError(err.message || t('companies.failedLoad'));
      console.error('Error loading companies:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, filters, t]);

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
      setError(err.message || t('companies.failedCreate'));
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
      setError(err.message || t('companies.failedUpdate'));
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
      setError(err.message || t('companies.failedDelete'));
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
      setError(err.message || t('companies.failedVerify'));
      console.error('Error verifying company:', err);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      header: t('companies.columns.company'),
      sortable: true,
      render: (value, company) => (
        <div>
          <div className="flex items-center gap-2">
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
      header: t('companies.columns.industry'),
      sortable: true,
      render: (value, company) => (
        <span className="text-sm text-gray-900">
          {company.industry || '-'}
        </span>
      )
    },
    {
      key: 'contactPersonName',
      header: t('companies.columns.contactPerson'),
      render: (value, company) => (
        <div className="text-sm text-gray-900">
          {company.contactPersonName ? (
            <>
              <div>{company.contactPersonName}</div>
              {company.email && (
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <EnvelopeIcon className="w-3 h-3 me-1" />
                  {company.email}
                </div>
              )}
              {company.phoneNumber && (
                <div className="text-xs text-gray-500 flex items-center mt-1">
                  <PhoneIcon className="w-3 h-3 me-1" />
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
      header: t('companies.columns.verification'),
      sortable: true,
      render: (value, company) => (
        <div className="flex items-center gap-2">
          <Badge
            variant={company.isVerified ? 'success' : 'secondary'}
            size="sm"
          >
            {company.isVerified ? t('companies.verified') : t('companies.unverified')}
          </Badge>
          {!company.isVerified && canUpdate && (
            <button
              onClick={() => handleVerifyCompany(company.id)}
              className="text-blue-600 hover:text-blue-900 text-xs font-medium"
              title={t('companies.verify')}
            >
              {t('companies.verify')}
            </button>
          )}
        </div>
      )
    },
    {
      key: 'visitorCount',
      header: t('companies.columns.visitors'),
      sortable: true,
      render: (value, company) => (
        <span className="text-sm font-medium text-gray-900">
          {company.visitorCount || 0}
        </span>
      )
    },
    {
      key: 'isActive',
      header: t('companies.columns.status'),
      sortable: true,
      render: (value, company) => (
        <Badge
          variant={company.isActive ? 'success' : 'secondary'}
          size="sm"
        >
          {company.isActive ? t('companies.active') : t('companies.inactive')}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: t('companies.columns.actions'),
      width: '120px',
      sortable: false,
      render: (value, company) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewingCompany(company);
              setShowViewModal(true);
            }}
            className="text-gray-600 hover:text-gray-900 transition-colors"
            title={t('common:buttons.view')}
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
              title={t('common:buttons.edit')}
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
              title={t('common:buttons.delete')}
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
        <h2 className="text-xl font-bold text-gray-900">{t('companies.accessDenied')}</h2>
        <p className="text-gray-500 mt-2">{t('companies.accessDeniedDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('companies.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('companies.subtitle')}
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
            {t('companies.createButton')}
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
              placeholder={t('companies.searchPlaceholder')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              icon={<FunnelIcon className="w-5 h-5" />}
            >
              {t('companies.filters')}
            </Button>

            {filters.searchTerm && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                {t('companies.clearFilters')}
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
                    {t('companies.verificationStatus')}
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
                    <option value="">{t('companies.all')}</option>
                    <option value="true">{t('companies.verified')}</option>
                    <option value="false">{t('companies.unverified')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('companies.sortBy')}
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, sortBy: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Name">{t('companies.sortByName')}</option>
                    <option value="Code">{t('companies.sortByCode')}</option>
                    <option value="CreatedOn">{t('companies.sortByCreatedDate')}</option>
                    <option value="VisitorCount">{t('companies.sortByVisitorCount')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('companies.sortDirection')}
                  </label>
                  <select
                    value={filters.sortDirection}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, sortDirection: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">{t('companies.ascending')}</option>
                    <option value="desc">{t('companies.descending')}</option>
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
            <h3 className="text-lg font-medium text-gray-900">{t('companies.emptyMessage')}</h3>
            <p className="text-gray-500 mt-2">{t('companies.emptyDesc')}</p>
          </div>
        ) : (
          <Table
            data={companies}
            columns={columns}
            loading={loading}
            emptyMessage={t('companies.emptyMessage')}
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
        title={t('companies.details.title')}
        size="lg"
      >
        {viewingCompany && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('companies.details.companyName')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('companies.details.companyCode')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.code}</p>
              </div>
            </div>

            {viewingCompany.industry && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('companies.details.industry')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.industry}</p>
              </div>
            )}

            {viewingCompany.description && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('companies.details.description')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingCompany.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {viewingCompany.contactPersonName && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('companies.details.contactPerson')}</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingCompany.contactPersonName}</p>
                </div>
              )}
              {viewingCompany.email && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('companies.details.email')}</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingCompany.email}</p>
                </div>
              )}
              {viewingCompany.phoneNumber && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">{t('companies.details.phone')}</label>
                  <p className="mt-1 text-sm text-gray-900">{viewingCompany.phoneNumber}</p>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('companies.details.verificationStatus')}</label>
                <div className="mt-1">
                  <Badge variant={viewingCompany.isVerified ? 'success' : 'secondary'} size="sm">
                    {viewingCompany.isVerified ? t('companies.verified') : t('companies.unverified')}
                  </Badge>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('companies.details.status')}</label>
                <div className="mt-1">
                  <Badge variant={viewingCompany.isActive ? 'success' : 'secondary'} size="sm">
                    {viewingCompany.isActive ? t('companies.active') : t('companies.inactive')}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingCompany(null);
                }}
              >
                {t('companies.details.close')}
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
                  {t('companies.details.edit')}
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
        title={showCreateModal ? t('companies.createTitle') : t('companies.editTitle')}
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
        title={t('companies.deleteTitle')}
        message={
          currentCompany
            ? t('companies.deleteMessage', { name: currentCompany.name })
            : t('common:confirm.delete')
        }
        confirmText={t('companies.deleteConfirm')}
        cancelText={t('companies.cancel')}
        variant="danger"
        loading={formLoading}
      />
    </div>
  );
};

// Company Form Component
const CompanyForm = ({ initialData, onSubmit, onCancel, loading, error }) => {
  const { t } = useTranslation('system');
  const [formState, setFormState] = useState(initialData || {
    name: '',
    code: '',
    website: '',
    industry: '',
    taxId: '',
    contactPersonName: '',
    email: '',
    phoneNumber: '',
    street1: '',
    street2: '',
    city: '',
    state: '',
    postalCode: '',
    country: '',
    employeeCount: '',
    description: ''
  });

  const [activeTab, setActiveTab] = useState('basic');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formState,
      employeeCount: formState.employeeCount ? parseInt(formState.employeeCount) : null
    };
    onSubmit(submitData);
  };

  const tabs = [
    { id: 'basic', label: t('companies.form.tabBasic') },
    { id: 'contact', label: t('companies.form.tabContact') },
    { id: 'address', label: t('companies.form.tabAddress') }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="max-h-[60vh] overflow-y-auto px-1">
        {/* Basic Info Tab */}
        {activeTab === 'basic' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('companies.form.companyName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formState.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.companyNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('companies.form.companyCode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formState.code || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.companyCodePlaceholder')}
                  disabled={!!initialData}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.industry')}</label>
                <input
                  type="text"
                  name="industry"
                  value={formState.industry || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.industryPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.employeeCount')}</label>
                <input
                  type="number"
                  name="employeeCount"
                  value={formState.employeeCount || ''}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.employeeCountPlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.website')}</label>
                <input
                  type="url"
                  name="website"
                  value={formState.website || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.websitePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.taxId')}</label>
                <input
                  type="text"
                  name="taxId"
                  value={formState.taxId || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.taxIdPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.descriptionLabel')}</label>
              <textarea
                name="description"
                value={formState.description || ''}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('companies.form.descriptionPlaceholder')}
              />
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.contactPersonName')}</label>
              <input
                type="text"
                name="contactPersonName"
                value={formState.contactPersonName || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('companies.form.contactPersonNamePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.contactEmail')}</label>
              <input
                type="email"
                name="email"
                value={formState.email || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('companies.form.contactEmailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.contactPhone')}</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formState.phoneNumber || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('companies.form.contactPhonePlaceholder')}
              />
            </div>
          </div>
        )}

        {/* Address Tab */}
        {activeTab === 'address' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.street1')}</label>
              <input
                type="text"
                name="street1"
                value={formState.street1 || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('companies.form.street1Placeholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.street2')}</label>
              <input
                type="text"
                name="street2"
                value={formState.street2 || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('companies.form.street2Placeholder')}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.city')}</label>
                <input
                  type="text"
                  name="city"
                  value={formState.city || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.cityPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.stateProvince')}</label>
                <input
                  type="text"
                  name="state"
                  value={formState.state || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.stateProvincePlaceholder')}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.postalCode')}</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formState.postalCode || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.postalCodePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('companies.form.country')}</label>
                <input
                  type="text"
                  name="country"
                  value={formState.country || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('companies.form.countryPlaceholder')}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel} type="button">
          {t('companies.form.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? t('companies.form.update') : t('companies.form.create')}
        </Button>
      </div>
    </form>
  );
};

export default CompaniesListPage;
