import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../../hooks/usePermissions';

// Services
import departmentService from '../../../services/departmentService';

// Components
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Table from '../../../components/common/Table/Table';
import Modal, { ConfirmModal } from '../../../components/common/Modal/Modal';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import Card from '../../../components/common/Card/Card';

// Icons
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  TrashIcon,
  PencilIcon,
  XCircleIcon,
  Squares2X2Icon,
  UserIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';

/**
 * Departments Management Page
 * Manages department CRUD operations with hierarchical structure support
 */
const DepartmentsListPage = () => {
  const { t, i18n } = useTranslation('system');
  const isRtl = i18n.dir() === 'rtl';
  // Hooks
  const { isAdmin, systemConfig } = usePermissions();

  // Permissions - Allow admin users to manage departments
  const canRead = isAdmin || systemConfig.canRead;
  const canCreate = isAdmin;
  const canUpdate = isAdmin;
  const canDelete = isAdmin;

  // Local state
  const [departments, setDepartments] = useState([]);
  const [departmentHierarchy, setDepartmentHierarchy] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchInput, setSearchInput] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'tree'
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [currentDepartment, setCurrentDepartment] = useState(null);
  const [viewingDepartment, setViewingDepartment] = useState(null);
  const [formData, setFormData] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  const [pagination, setPagination] = useState({
    pageNumber: 1,
    pageSize: 10,
    total: 0
  });
  const [filters, setFilters] = useState({
    searchTerm: '',
    parentDepartmentId: null,
    sortBy: 'DisplayOrder',
    sortDirection: 'asc'
  });
  const [parentDepartments, setParentDepartments] = useState([]);

  // Load departments
  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await departmentService.getDepartments({
        pageNumber: pagination.pageNumber,
        pageSize: pagination.pageSize,
        ...filters
      });

      if (response && response.departments) {
        setDepartments(response.departments);
        if (response.totalRecords) {
          setPagination(prev => ({ ...prev, total: response.totalRecords }));
        }
      }
    } catch (err) {
      setError(err.message || t('departments.failedLoad'));
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, filters, t]);

  // Load department hierarchy
  const loadHierarchy = useCallback(async () => {
    try {
      const response = await departmentService.getDepartmentHierarchy();
      if (response) {
        setDepartmentHierarchy(response);
      }
    } catch (err) {
      console.error('Error loading department hierarchy:', err);
    }
  }, []);

  // Load root departments for parent filter
  const loadRootDepartments = useCallback(async () => {
    try {
      const response = await departmentService.getRootDepartments();
      if (response && response.departments) {
        setParentDepartments(response.departments);
      }
    } catch (err) {
      console.error('Error loading root departments:', err);
    }
  }, []);

  // Load departments on mount and when filters/view mode change
  useEffect(() => {
    if (canRead) {
      if (viewMode === 'table') {
        loadDepartments();
      } else {
        loadHierarchy();
      }
      loadRootDepartments();
    }
  }, [loadDepartments, loadHierarchy, loadRootDepartments, canRead, viewMode]);

  // Handle search input changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(prev => ({ ...prev, searchTerm: searchInput }));
      setPagination(prev => ({ ...prev, pageNumber: 1 }));
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchInput]);

  // Handle create department
  const handleCreateDepartment = async (departmentDataToCreate) => {
    try {
      setFormLoading(true);
      setError(null);
      await departmentService.createDepartment(departmentDataToCreate);
      setShowCreateModal(false);
      setFormData(null);
      await loadDepartments();
      await loadHierarchy();
    } catch (err) {
      setError(err.message || t('departments.failedCreate'));
      console.error('Error creating department:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update department
  const handleUpdateDepartment = async (departmentDataToUpdate) => {
    try {
      setFormLoading(true);
      setError(null);
      await departmentService.updateDepartment(currentDepartment.id, departmentDataToUpdate);
      setShowEditModal(false);
      setCurrentDepartment(null);
      setFormData(null);
      await loadDepartments();
      await loadHierarchy();
    } catch (err) {
      setError(err.message || t('departments.failedUpdate'));
      console.error('Error updating department:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete department
  const handleDeleteDepartment = async () => {
    try {
      setFormLoading(true);
      setError(null);
      await departmentService.deleteDepartment(currentDepartment.id);
      setShowDeleteModal(false);
      setCurrentDepartment(null);
      await loadDepartments();
      await loadHierarchy();
    } catch (err) {
      setError(err.message || t('departments.failedDelete'));
      console.error('Error deleting department:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      header: t('departments.columns.department'),
      sortable: true,
      render: (value, department) => (
        <div>
          <div className="flex items-center gap-2">
            <div className="flex-shrink-0">
              <Squares2X2Icon className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <span className="font-medium text-gray-900">{department.name}</span>
              {department.code && (
                <div className="text-sm text-gray-500">{department.code}</div>
              )}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'parentDepartmentName',
      header: t('departments.columns.parentDepartment'),
      sortable: false,
      render: (value, department) => (
        <span className="text-sm text-gray-900">
          {department.parentDepartmentName ? (
            <div className="flex items-center">
              <ChevronRightIcon className={`w-4 h-4 text-gray-400 me-1 ${isRtl ? 'rotate-180' : ''}`} />
              {department.parentDepartmentName}
            </div>
          ) : (
            <span className="text-gray-500">-</span>
          )}
        </span>
      )
    },
    {
      key: 'managerName',
      header: t('departments.columns.manager'),
      render: (value, department) => (
        <div className="text-sm text-gray-900">
          {department.managerName ? (
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 text-gray-400 me-1" />
              {department.managerName}
            </div>
          ) : (
            '-'
          )}
        </div>
      )
    },
    {
      key: 'displayOrder',
      header: t('departments.columns.order'),
      sortable: true,
      width: '80px',
      render: (value, department) => (
        <span className="text-sm font-medium text-gray-900">
          {department.displayOrder || 0}
        </span>
      )
    },
    {
      key: 'actions',
      header: t('departments.columns.actions'),
      width: '120px',
      sortable: false,
      render: (value, department) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setViewingDepartment(department);
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
                setCurrentDepartment(department);
                setFormData(department);
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
                setCurrentDepartment(department);
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
      parentDepartmentId: null,
      sortBy: 'DisplayOrder',
      sortDirection: 'asc'
    });
    setPagination(prev => ({ ...prev, pageNumber: 1 }));
  };

  if (!canRead) {
    return (
      <div className="text-center py-12">
        <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-gray-900">{t('departments.accessDenied')}</h2>
        <p className="text-gray-500 mt-2">{t('departments.accessDeniedDesc')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('departments.title')}</h1>
          <p className="mt-1 text-sm text-gray-500">
            {t('departments.subtitle')}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          {/* View Mode Toggle */}
          <div className="flex rounded-lg border border-gray-300 p-1">
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'table'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('departments.viewTable')}
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'tree'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('departments.viewTree')}
            </button>
          </div>

          {canCreate && (
            <Button
              onClick={() => {
                setFormData(null);
                setShowCreateModal(true);
              }}
              icon={<PlusIcon className="w-5 h-5" />}
            >
              {t('departments.createButton')}
            </Button>
          )}
        </div>
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
              placeholder={t('departments.searchPlaceholder')}
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
              {t('departments.filters')}
            </Button>

            {filters.searchTerm && (
              <Button
                variant="ghost"
                onClick={handleResetFilters}
              >
                {t('departments.clearFilters')}
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
                    {t('departments.parentDepartment')}
                  </label>
                  <select
                    value={filters.parentDepartmentId || ''}
                    onChange={(e) =>
                      setFilters(prev => ({
                        ...prev,
                        parentDepartmentId: e.target.value ? parseInt(e.target.value) : null
                      }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">{t('departments.allDepartments')}</option>
                    {parentDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('departments.sortBy')}
                  </label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, sortBy: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="DisplayOrder">{t('departments.sortByDisplayOrder')}</option>
                    <option value="Name">{t('departments.sortByName')}</option>
                    <option value="Code">{t('departments.sortByCode')}</option>
                    <option value="CreatedOn">{t('departments.sortByCreatedDate')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('departments.sortDirection')}
                  </label>
                  <select
                    value={filters.sortDirection}
                    onChange={(e) =>
                      setFilters(prev => ({ ...prev, sortDirection: e.target.value }))
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="asc">{t('departments.ascending')}</option>
                    <option value="desc">{t('departments.descending')}</option>
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
        ) : viewMode === 'table' ? (
          departments.length === 0 ? (
            <div className="text-center py-12">
              <Squares2X2Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">{t('departments.emptyMessage')}</h3>
              <p className="text-gray-500 mt-2">{t('departments.emptyDesc')}</p>
            </div>
          ) : (
            <Table
              data={departments}
              columns={columns}
              loading={loading}
              emptyMessage={t('departments.emptyMessage')}
              className="departments-table"
            />
          )
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('departments.hierarchyTitle')}</h3>
            {departmentHierarchy.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>{t('departments.noHierarchy')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Tree view would be implemented here */}
                <div className="text-sm text-gray-600">
                  {t('departments.treeComingSoon', { count: departmentHierarchy.length })}
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* View Department Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setViewingDepartment(null);
        }}
        title={t('departments.details.title')}
        size="lg"
      >
        {viewingDepartment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('departments.details.departmentName')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('departments.details.departmentCode')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.code || '-'}</p>
              </div>
            </div>

            {viewingDepartment.parentDepartmentName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('departments.details.parentDepartment')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.parentDepartmentName}</p>
              </div>
            )}

            {viewingDepartment.managerName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('departments.details.manager')}</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.managerName}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('departments.details.displayOrder')}</label>
              <p className="mt-1 text-sm text-gray-900">{viewingDepartment.displayOrder || 0}</p>
            </div>

            {viewingDepartment.childDepartments && viewingDepartment.childDepartments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('departments.details.childDepartments')}</label>
                <div className="mt-2 space-y-2">
                  {viewingDepartment.childDepartments.map(child => (
                    <div key={child.id} className="text-sm text-gray-900 ms-4">
                      - {child.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingDepartment(null);
                }}
              >
                {t('departments.details.close')}
              </Button>
              {canUpdate && (
                <Button
                  onClick={() => {
                    setShowViewModal(false);
                    setCurrentDepartment(viewingDepartment);
                    setFormData(viewingDepartment);
                    setShowEditModal(true);
                  }}
                >
                  {t('departments.details.edit')}
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
          setCurrentDepartment(null);
        }}
        title={showCreateModal ? t('departments.createTitle') : t('departments.editTitle')}
        size="lg"
      >
        <DepartmentForm
          initialData={formData}
          parentDepartments={parentDepartments}
          onSubmit={showCreateModal ? handleCreateDepartment : handleUpdateDepartment}
          onCancel={() => {
            setShowCreateModal(false);
            setShowEditModal(false);
            setFormData(null);
            setCurrentDepartment(null);
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
          setCurrentDepartment(null);
        }}
        onConfirm={handleDeleteDepartment}
        title={t('departments.deleteTitle')}
        message={
          currentDepartment
            ? t('departments.deleteMessage', { name: currentDepartment.name })
            : t('common:confirm.delete')
        }
        confirmText={t('departments.deleteConfirm')}
        cancelText={t('departments.cancel')}
        variant="danger"
        loading={formLoading}
      />
    </div>
  );
};

// Placeholder DepartmentForm component
const DepartmentForm = ({ initialData, parentDepartments, onSubmit, onCancel, loading, error }) => {
  const { t } = useTranslation('system');
  const [formState, setFormState] = useState(initialData || {
    name: '',
    code: '',
    description: '',
    parentDepartmentId: '',
    email: '',
    phone: '',
    location: '',
    budget: '',
    displayOrder: 0
  });

  const [activeTab, setActiveTab] = useState('basic');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value === '' ? null : value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formState,
      budget: formState.budget ? parseFloat(formState.budget) : null,
      displayOrder: formState.displayOrder ? parseInt(formState.displayOrder) : 0,
      parentDepartmentId: formState.parentDepartmentId ? parseInt(formState.parentDepartmentId) : null
    };
    onSubmit(submitData);
  };

  const tabs = [
    { id: 'basic', label: t('departments.form.tabBasic') },
    { id: 'contact', label: t('departments.form.tabContact') }
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
                  {t('departments.form.departmentName')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  required
                  value={formState.name || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('departments.form.departmentNamePlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  {t('departments.form.departmentCode')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="code"
                  required
                  value={formState.code || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('departments.form.departmentCodePlaceholder')}
                  disabled={!!initialData}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('departments.form.parentDepartment')}</label>
              <select
                name="parentDepartmentId"
                value={formState.parentDepartmentId || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('departments.form.noneRoot')}</option>
                {parentDepartments.map(dept => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('departments.form.budget')}</label>
                <input
                  type="number"
                  name="budget"
                  value={formState.budget || ''}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('departments.form.budgetPlaceholder')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('departments.form.displayOrder')}</label>
                <input
                  type="number"
                  name="displayOrder"
                  value={formState.displayOrder || 0}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('departments.form.displayOrderPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('departments.form.description')}</label>
              <textarea
                name="description"
                value={formState.description || ''}
                onChange={handleChange}
                rows="3"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('departments.form.descriptionPlaceholder')}
              />
            </div>
          </div>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'contact' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('departments.form.departmentEmail')}</label>
              <input
                type="email"
                name="email"
                value={formState.email || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('departments.form.departmentEmailPlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('departments.form.departmentPhone')}</label>
              <input
                type="tel"
                name="phone"
                value={formState.phone || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('departments.form.departmentPhonePlaceholder')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">{t('departments.form.locationOffice')}</label>
              <input
                type="text"
                name="location"
                value={formState.location || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder={t('departments.form.locationPlaceholder')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button variant="outline" onClick={onCancel} type="button">
          {t('departments.form.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {initialData ? t('departments.form.update') : t('departments.form.create')}
        </Button>
      </div>
    </form>
  );
};

export default DepartmentsListPage;

