import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { useAuth } from '../../../hooks/useAuth';
import { usePermissions } from '../../../hooks/usePermissions';

// Redux actions and selectors
import {
  fetchAuditLogs,
  fetchUserActivity,
  fetchSystemEvents,
  fetchSecurityEvents,
  searchAuditLogs,
  exportAuditLogs,
  updateFilters,
  resetFilters,
  setSelectedCategory,
  clearErrors
} from '../../../store/slices/auditSlice';

import {
  selectAuditLogs,
  selectUserActivity,
  selectSystemEvents,
  selectSecurityEvents,
  selectSearchResults,
  selectAuditPagination,
  selectAuditFilters,
  selectSelectedCategory,
  selectAuditLoading,
  selectAuditErrors
} from '../../../store/slices/auditSlice';

// Permissions
import { AUDIT_PERMISSIONS } from '../../../constants/permissions';

// Components
import Card from '../../../components/common/Card/Card';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import Select from '../../../components/common/Select/Select';
import Badge from '../../../components/common/Badge/Badge';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../../components/common/EmptyState/EmptyState';
import Table from '../../../components/common/Table/Table';
import Pagination from '../../../components/common/Pagination/Pagination';
import { toast } from 'react-hot-toast';

// Icons
import {
  DocumentTextIcon,
  MagnifyingGlassIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  UserIcon,
  ShieldCheckIcon,
  ComputerDesktopIcon
} from '@heroicons/react/24/outline';

// Debug component (remove in production)
import PaginationDebugger from '../../../debug/PaginationDebugger';

const AuditPage = () => {
  const dispatch = useDispatch();
  const { user } = useAuth();
  const { hasPermission } = usePermissions();

  // Selectors
  const auditLogs = useSelector(selectAuditLogs);
  const userActivity = useSelector(selectUserActivity);
  const systemEvents = useSelector(selectSystemEvents);
  const securityEvents = useSelector(selectSecurityEvents);
  const searchResults = useSelector(selectSearchResults);
  const pagination = useSelector(selectAuditPagination);
  const filters = useSelector(selectAuditFilters);
  const selectedCategory = useSelector(selectSelectedCategory);
  const loading = useSelector(selectAuditLoading);
  const errors = useSelector(selectAuditErrors);

  // Local state
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Get current data based on active tab
  const getCurrentData = () => {
    switch (activeTab) {
      case 'user':
        return userActivity;
      case 'system':
        return systemEvents;
      case 'security':
        return securityEvents;
      default:
        return filters.searchTerm ? searchResults : auditLogs;
    }
  };

  // Get current loading state based on active tab
  const getCurrentLoading = () => {
    switch (activeTab) {
      case 'user':
        return loading.userActivityLoading;
      case 'system':
        return loading.systemEventsLoading;
      case 'security':
        return loading.securityEventsLoading;
      default:
        return filters.searchTerm ? loading.searchLoading : loading.listLoading;
    }
  };

  // Get current error state based on active tab
  const getCurrentError = () => {
    switch (activeTab) {
      case 'user':
        return errors.userActivityError;
      case 'system':
        return errors.systemEventsError;
      case 'security':
        return errors.securityEventsError;
      default:
        return filters.searchTerm ? errors.searchError : errors.listError;
    }
  };

  const currentData = getCurrentData();
  const currentLoading = getCurrentLoading();
  const currentError = getCurrentError();

  // Permissions
  const canRead = hasPermission(AUDIT_PERMISSIONS.READ);
  const canExport = hasPermission(AUDIT_PERMISSIONS.EXPORT);
  const canViewUserActivity = hasPermission(AUDIT_PERMISSIONS.VIEW_USER_ACTIVITY);
  const canViewSystemEvents = hasPermission(AUDIT_PERMISSIONS.VIEW_SYSTEM_EVENTS);
  const canViewSecurityEvents = hasPermission(AUDIT_PERMISSIONS.VIEW_SECURITY_EVENTS);

  // Load audit logs on mount
  useEffect(() => {
    if (canRead) {
      dispatch(fetchAuditLogs({ 
        pageIndex: 0, // Start from page 0 (API uses 0-based indexing)
        pageSize: pagination.pageSize,
        ...filters 
      }));
    }
  }, [dispatch, canRead]); // Remove pagination.pageIndex from dependencies

  // Tab configuration
  const tabs = [
    {
      id: 'all',
      name: 'All Logs',
      icon: DocumentTextIcon,
      show: canRead
    },
    {
      id: 'user',
      name: 'User Activity',
      icon: UserIcon,
      show: canViewUserActivity
    },
    {
      id: 'system',
      name: 'System Events',
      icon: ComputerDesktopIcon,
      show: canViewSystemEvents
    },
    {
      id: 'security',
      name: 'Security Events',
      icon: ShieldCheckIcon,
      show: canViewSecurityEvents
    }
  ];

  const visibleTabs = tabs.filter(tab => tab.show);

  // Handle tab change
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    
    // Reset to first page when switching tabs
    const params = { 
      pageIndex: 0, // Always start from page 0 (API uses 0-based)
      pageSize: pagination.pageSize,
      ...filters 
    };
    
    switch (tabId) {
      case 'user':
        if (canViewUserActivity) {
          dispatch(fetchUserActivity(params));
        }
        break;
      case 'system':
        if (canViewSystemEvents) {
          dispatch(fetchSystemEvents(params));
        }
        break;
      case 'security':
        if (canViewSecurityEvents) {
          dispatch(fetchSecurityEvents(params));
        }
        break;
      default:
        dispatch(fetchAuditLogs(params));
    }
  };

  // Handle search
  const handleSearch = (searchTerm) => {
    dispatch(updateFilters({ searchTerm }));
    if (searchTerm) {
      dispatch(searchAuditLogs({ 
        searchTerm, 
        params: { pageIndex: 0, pageSize: pagination.pageSize } 
      }));
    } else {
      // Clear search and reload current tab
      handleTabChange(activeTab);
    }
  };

  // Handle export
  const handleExport = async (format = 'csv') => {
    if (!canExport) return;
    
    try {
      await dispatch(exportAuditLogs({ 
        format,
        ...filters,
        includeDetails: true 
      })).unwrap();
      toast.success(`Audit logs exported as ${format.toUpperCase()}`);
    } catch (error) {
      toast.error('Failed to export audit logs');
    }
  };

  // Handle pagination
  const handlePageChange = (pageNumber) => {
    // Convert 1-based page number to 0-based pageIndex for API
    const pageIndex = pageNumber - 1;
    const params = { pageIndex, pageSize: pagination.pageSize, ...filters };
    
    switch (activeTab) {
      case 'user':
        if (canViewUserActivity) {
          dispatch(fetchUserActivity(params));
        }
        break;
      case 'system':
        if (canViewSystemEvents) {
          dispatch(fetchSystemEvents(params));
        }
        break;
      case 'security':
        if (canViewSecurityEvents) {
          dispatch(fetchSecurityEvents(params));
        }
        break;
      default:
        if (filters.searchTerm) {
          dispatch(searchAuditLogs({ 
            searchTerm: filters.searchTerm, 
            params 
          }));
        } else {
          dispatch(fetchAuditLogs(params));
        }
    }
  };

  // Table columns
  const columns = [
    {
      key: 'timestamp',
      header: 'Timestamp',
      sortable: true,
      render: (value) => new Date(value).toLocaleString()
    },
    {
      key: 'category',
      header: 'Category',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'action',
      header: 'Action',
      sortable: true,
      render: (value) => (
        <Badge variant="primary" size="sm">
          {value}
        </Badge>
      )
    },
    {
      key: 'userName',
      header: 'User',
      sortable: true,
      render: (value) => value || 'System'
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <div className="max-w-xs truncate" title={value}>
          {value}
        </div>
      )
    },
    {
      key: 'severity',
      header: 'Severity',
      sortable: true,
      render: (value) => {
        const colors = {
          'Low': 'secondary',
          'Medium': 'warning',
          'High': 'danger',
          'Critical': 'danger'
        };
        return (
          <Badge variant={colors[value] || 'secondary'} size="sm">
            {value}
          </Badge>
        );
      }
    }
  ];

  if (!canRead) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-600">
              You don't have permission to view audit logs.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Debug Component - Remove in Production */}
      {/*process.env.NODE_ENV === 'development' && <PaginationDebugger />*/}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
          <p className="text-gray-600 mt-1">View system activity and security events</p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Export Buttons */}
          {canExport && (
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('csv')}
                disabled={loading.exportLoading}
                className="flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('xlsx')}
                disabled={loading.exportLoading}
                className="flex items-center gap-2"
              >
                <ArrowDownTrayIcon className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
          )}
          
          {/* Filter Toggle */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <FunnelIcon className="h-4 w-4" />
            Filters
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Card className="p-0">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {visibleTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabChange(tab.id)}
                  className={`
                    flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
                    ${isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }
                  `}
                >
                  <Icon className="h-4 w-4" />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </Card>

      {/* Filters */}
      {showFilters && (
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search"
              type="text"
              placeholder="Search logs..."
              value={filters.searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              icon={MagnifyingGlassIcon}
            />
            
            <Select
              label="Category"
              value={filters.category}
              onChange={(e) => dispatch(updateFilters({ category: e.target.value }))}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'Authentication', label: 'Authentication' },
                { value: 'Authorization', label: 'Authorization' },
                { value: 'Configuration', label: 'Configuration' },
                { value: 'UserManagement', label: 'User Management' },
                { value: 'SystemOperation', label: 'System Operations' }
              ]}
            />
            
            <Select
              label="Severity"
              value={filters.severity}
              onChange={(e) => dispatch(updateFilters({ severity: e.target.value }))}
              options={[
                { value: '', label: 'All Severities' },
                { value: 'Low', label: 'Low' },
                { value: 'Medium', label: 'Medium' },
                { value: 'High', label: 'High' },
                { value: 'Critical', label: 'Critical' }
              ]}
            />
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => dispatch(resetFilters())}
                className="w-full"
              >
                Reset Filters
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Loading State */}
      {currentLoading && (
        <Card>
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </Card>
      )}

      {/* Error State */}
      {currentError && (
        <Card className="border-red-200 bg-red-50">
          <div className="p-4">
            <div className="flex items-center gap-2 text-red-800">
              <ExclamationTriangleIcon className="h-5 w-5" />
              <span className="font-medium">Error loading audit logs</span>
            </div>
            <p className="text-red-700 mt-1">
              {Array.isArray(currentError) 
                ? currentError[0] 
                : typeof currentError === 'object' 
                  ? currentError.message || 'An error occurred'
                  : currentError
              }
            </p>
          </div>
        </Card>
      )}

      {/* Empty State */}
      {!currentLoading && currentData.length === 0 && (
        <EmptyState
          icon={DocumentTextIcon}
          title="No audit logs found"
          description={filters.searchTerm ? "Try adjusting your search criteria" : "No audit logs have been recorded yet"}
        />
      )}

      {/* Audit Logs Table */}
      {!currentLoading && currentData.length > 0 && (
        <Card className="p-0">
          <Table
            columns={columns}
            data={currentData}
            loading={currentLoading}
          />
          
          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200">
            <Pagination
              currentPage={pagination.pageIndex + 1} // Convert 0-based to 1-based
              totalItems={pagination.totalCount}
              pageSize={pagination.pageSize}
              onPageChange={handlePageChange}
            />
          </div>
        </Card>
      )}
    </div>
  );
};

export default AuditPage;