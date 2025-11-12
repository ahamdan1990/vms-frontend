import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
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
      setError(err.message || 'Failed to load departments');
      console.error('Error loading departments:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.pageNumber, pagination.pageSize, filters]);

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
      setError(err.message || 'Failed to create department');
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
      setError(err.message || 'Failed to update department');
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
      setError(err.message || 'Failed to delete department');
      console.error('Error deleting department:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Table columns
  const columns = [
    {
      key: 'name',
      header: 'Department',
      sortable: true,
      render: (value, department) => (
        <div>
          <div className="flex items-center space-x-2">
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
      header: 'Parent Department',
      sortable: false,
      render: (value, department) => (
        <span className="text-sm text-gray-900">
          {department.parentDepartmentName ? (
            <div className="flex items-center">
              <ChevronRightIcon className="w-4 h-4 text-gray-400 mr-1" />
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
      header: 'Manager',
      render: (value, department) => (
        <div className="text-sm text-gray-900">
          {department.managerName ? (
            <div className="flex items-center">
              <UserIcon className="w-4 h-4 text-gray-400 mr-1" />
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
      header: 'Order',
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
      header: 'Actions',
      width: '120px',
      sortable: false,
      render: (value, department) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => {
              setViewingDepartment(department);
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
                setCurrentDepartment(department);
                setFormData(department);
                setShowEditModal(true);
              }}
              className="text-blue-600 hover:text-blue-900 transition-colors"
              title="Edit department"
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
              title="Delete department"
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
        <h2 className="text-xl font-bold text-gray-900">Access Denied</h2>
        <p className="text-gray-500 mt-2">You don't have permission to view departments</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage organizational departments and hierarchical structure
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
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
              Table
            </button>
            <button
              onClick={() => setViewMode('tree')}
              className={`px-3 py-1 text-sm font-medium rounded ${
                viewMode === 'tree'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Tree
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
              Add Department
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
              placeholder="Search departments..."
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
                    Parent Department
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
                    <option value="">All Departments</option>
                    {parentDepartments.map(dept => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
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
                    <option value="DisplayOrder">Display Order</option>
                    <option value="Name">Name</option>
                    <option value="Code">Code</option>
                    <option value="CreatedOn">Created Date</option>
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
        ) : viewMode === 'table' ? (
          departments.length === 0 ? (
            <div className="text-center py-12">
              <Squares2X2Icon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No departments found</h3>
              <p className="text-gray-500 mt-2">Get started by creating a new department</p>
            </div>
          ) : (
            <Table
              data={departments}
              columns={columns}
              loading={loading}
              emptyMessage="No departments found"
              className="departments-table"
            />
          )
        ) : (
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Department Hierarchy</h3>
            {departmentHierarchy.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No departments to display</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Tree view would be implemented here */}
                <div className="text-sm text-gray-600">
                  Tree view coming soon. Currently showing {departmentHierarchy.length} departments.
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
        title="Department Details"
        size="lg"
      >
        {viewingDepartment && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Name</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department Code</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.code || '-'}</p>
              </div>
            </div>

            {viewingDepartment.parentDepartmentName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Parent Department</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.parentDepartmentName}</p>
              </div>
            )}

            {viewingDepartment.managerName && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Manager</label>
                <p className="mt-1 text-sm text-gray-900">{viewingDepartment.managerName}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Display Order</label>
              <p className="mt-1 text-sm text-gray-900">{viewingDepartment.displayOrder || 0}</p>
            </div>

            {viewingDepartment.childDepartments && viewingDepartment.childDepartments.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Child Departments</label>
                <div className="mt-2 space-y-2">
                  {viewingDepartment.childDepartments.map(child => (
                    <div key={child.id} className="text-sm text-gray-900 ml-4">
                      • {child.name}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setShowViewModal(false);
                  setViewingDepartment(null);
                }}
              >
                Close
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
          setCurrentDepartment(null);
        }}
        title={showCreateModal ? 'Create Department' : 'Edit Department'}
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
        title="Delete Department"
        message={
          currentDepartment
            ? `Are you sure you want to delete "${currentDepartment.name}"? This cannot be undone.`
            : 'Are you sure you want to delete this department?'
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        loading={formLoading}
      />
    </div>
  );
};

// Placeholder DepartmentForm component
const DepartmentForm = ({ initialData, parentDepartments, onSubmit, onCancel, loading, error }) => {
  const [formState, setFormState] = useState(initialData || {});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value === '' ? null : value }));
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
        <label className="block text-sm font-medium text-gray-700">Department Name *</label>
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
        <label className="block text-sm font-medium text-gray-700">Department Code</label>
        <input
          type="text"
          name="code"
          value={formState.code || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Parent Department</label>
        <select
          name="parentDepartmentId"
          value={formState.parentDepartmentId || ''}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">None (Root Department)</option>
          {parentDepartments.map(dept => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Display Order</label>
        <input
          type="number"
          name="displayOrder"
          value={formState.displayOrder || 0}
          onChange={handleChange}
          min="0"
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
        />
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

export default DepartmentsListPage;
