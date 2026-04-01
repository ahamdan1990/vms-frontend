import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { usePermissions } from '../../hooks/usePermissions';
import {
  FunnelIcon,
  ChartBarIcon,
  DocumentTextIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Redux actions and selectors
import {
  fetchComprehensiveReport,
  exportComprehensiveReport,
  fetchStatistics,
  exportStatistics,
  setFilters,
  resetFilters,
  setPagination,
  selectComprehensiveReport,
  selectStatistics,
  selectFilters,
  selectPagination,
  selectExporting
} from '../../store/slices/reportsSlice';

// Components
import Card from '../../components/common/Card/Card';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import DateRangePicker from '../../components/common/DateRangePicker/DateRangePicker';
import Table from '../../components/common/Table/Table';
import Pagination from '../../components/common/Pagination/Pagination';
import LoadingSpinner from '../../components/common/LoadingSpinner/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState/EmptyState';
import Badge from '../../components/common/Badge/Badge';
import Tabs from '../../components/common/Tabs/Tabs';
import ExportButton from '../../components/reports/ExportButton';

// Permissions
import { REPORT_PERMISSIONS } from '../../constants/permissions';

// Services
import locationService from '../../services/locationService';
import visitPurposeService from '../../services/visitPurposeService';
import departmentService from '../../services/departmentService';
import userService from '../../services/userService';
import formatters from '../../utils/formatters';
import { parseLocalDateString, toLocalDateString } from '../../utils/dateUtils';

/**
 * Admin Reports Page
 * Comprehensive reporting interface with advanced filtering, statistics, and export capabilities
 */
const AdminReportsPage = () => {
  const { t } = useTranslation('reports');
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();

  // Check permissions
  const canGenerateReports = hasPermission(REPORT_PERMISSIONS.GENERATE_ALL);
  const canExportReports = hasPermission(REPORT_PERMISSIONS.EXPORT);

  // Redux state
  const { data: reportData, loading: reportLoading, error: reportError } = useSelector(selectComprehensiveReport);
  const { data: statisticsData, loading: statsLoading } = useSelector(selectStatistics);
  const filters = useSelector(selectFilters);
  const pagination = useSelector(selectPagination);
  const exporting = useSelector(selectExporting);

  // Local state
  const [showFilters, setShowFilters] = useState(true);
  const [activeTab, setActiveTab] = useState('report');
  const [locations, setLocations] = useState([]);
  const [visitPurposes, setVisitPurposes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hosts, setHosts] = useState([]);
  const [loadingFilters, setLoadingFilters] = useState(true);

  // Load dropdown data on mount
  useEffect(() => {
    const loadFilterData = async () => {
      try {
        setLoadingFilters(true);

        // Fetch all dropdown data in parallel
        const [locationsData, purposesData, departmentsData, hostsData] = await Promise.all([
          locationService.getActiveLocations(),
          visitPurposeService.getActiveVisitPurposes(),
          departmentService.getDepartments({ pageSize: 100 }),
          userService.getUsers({ pageSize: 100, isActive: true })
        ]);

        setLocations(locationsData || []);
        setVisitPurposes(purposesData || []);
        setDepartments(departmentsData?.items || []);
        setHosts(hostsData?.items || []);
      } catch (error) {
        console.error('Error loading filter data:', error);
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilterData();
  }, []);

  // Load initial data - only on mount
  useEffect(() => {
    if (canGenerateReports) {
      const params = {
        ...filters,
        ...pagination
      };
      dispatch(fetchComprehensiveReport(params));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canGenerateReports]);

  // Fetch report data
  const handleFetchReport = useCallback(() => {
    const params = {
      ...filters,
      ...pagination
    };
    dispatch(fetchComprehensiveReport(params));
  }, [dispatch, filters, pagination]);

  // Fetch statistics
  const handleFetchStatistics = useCallback(() => {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      locationId: filters.locationId,
      groupBy: 'daily'
    };
    dispatch(fetchStatistics(params));
  }, [dispatch, filters]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    dispatch(setFilters({ [key]: value }));
  };

  // Handle search
  const handleSearch = () => {
    dispatch(setPagination({ pageIndex: 0 })); // Reset to first page
    handleFetchReport();
  };

  // Handle reset filters
  const handleResetFilters = () => {
    dispatch(resetFilters());
    handleFetchReport();
  };

  // Handle export
  const handleExport = () => {
    const params = {
      ...filters,
      sortBy: pagination.sortBy,
      sortDirection: pagination.sortDirection
    };
    dispatch(exportComprehensiveReport(params));
  };

  // Handle statistics export
  const handleExportStatistics = () => {
    const params = {
      startDate: filters.startDate,
      endDate: filters.endDate,
      locationId: filters.locationId,
      groupBy: 'daily'
    };
    dispatch(exportStatistics(params));
  };

  // Handle pagination change
  const handlePageChange = (newPage) => {
    dispatch(setPagination({ pageIndex: newPage }));
    handleFetchReport();
  };

  // Handle sort change
  const handleSortChange = (sortBy) => {
    const newDirection =
      pagination.sortBy === sortBy && pagination.sortDirection === 'asc' ? 'desc' : 'asc';

    dispatch(setPagination({ sortBy, sortDirection: newDirection }));
    handleFetchReport();
  };

  // Switch tabs
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'statistics' && !statisticsData) {
      handleFetchStatistics();
    }
  };

  const statusTranslationKeys = {
    Draft: 'draft',
    Submitted: 'submitted',
    UnderReview: 'underReview',
    Approved: 'approved',
    Rejected: 'rejected',
    Cancelled: 'cancelled',
    Expired: 'expired',
    Active: 'active',
    Completed: 'completed'
  };

  const getStatusLabel = (status) => {
    const key = statusTranslationKeys[status];
    return key ? t(`filters.statusOptions.${key}`) : status;
  };

  const formatDateTime = (value) => {
    if (!value) return '-';
    return formatters.formatDateTime(value);
  };

  // Table columns
  const columns = [
    {
      key: 'visitorName',
      header: t('table.columns.visitorName'),
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="font-medium text-gray-900 dark:text-gray-100">{row.visitorName}</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">{row.company}</div>
        </div>
      )
    },
    {
      key: 'hostName',
      header: t('table.columns.host'),
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-gray-100">{row.hostName}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{row.hostDepartment}</div>
        </div>
      )
    },
    {
      key: 'locationName',
      header: t('table.columns.location'),
      sortable: true
    },
    {
      key: 'visitPurpose',
      header: t('table.columns.purpose'),
      sortable: false
    },
    {
      key: 'scheduledStartTime',
      header: t('table.columns.scheduled', { defaultValue: 'Scheduled' }),
      sortable: true,
      render: (value, row) => (
        <div>
          <div className="text-sm text-gray-900 dark:text-gray-100">{formatDateTime(row.scheduledStartTime)}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{formatDateTime(row.scheduledEndTime)}</div>
        </div>
      )
    },
    {
      key: 'checkedInAt',
      header: t('table.columns.checkIn'),
      sortable: true,
      render: (value, row) => formatDateTime(row.checkedInAt)
    },
    {
      key: 'checkedOutAt',
      header: t('table.columns.checkOut'),
      sortable: true,
      render: (value, row) => formatDateTime(row.checkedOutAt)
    },
    {
      key: 'minutesOnSite',
      header: t('table.columns.durationMinutes'),
      sortable: false,
      render: (value, row) => row.minutesOnSite || '-'
    },
    {
      key: 'status',
      header: t('table.columns.status'),
      sortable: true,
      render: (value, row) => (
        <Badge
          variant={
            row.status === 'Active' ? 'success' :
            row.status === 'Completed' ? 'info' :
            row.status === 'Cancelled' ? 'danger' :
            'warning'
          }
        >
          {getStatusLabel(row.status)}
        </Badge>
      )
    }
  ];

  // Tabs configuration
  const tabs = [
    { key: 'report', label: t('tabs.visitorReport'), icon: DocumentTextIcon },
    { key: 'statistics', label: t('tabs.statistics'), icon: ChartBarIcon }
  ];

  if (!canGenerateReports) {
    return (
      <div className="container mx-auto px-4 py-8">
        <EmptyState
          title={t('accessDenied.title')}
          description={t('accessDenied.description')}
          icon={FunnelIcon}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6 text-gray-900 dark:text-gray-100">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">{t('header.title')}</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {t('header.subtitle')}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          icon={<ArrowPathIcon className="w-5 h-5" />}
          onClick={handleFetchReport}
          disabled={reportLoading || statsLoading}
        >
          {t('actions.refresh')}
        </Button>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />

      {/* Report Tab */}
      {activeTab === 'report' && (
        <>
          {/* Filters Card */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-5 h-5 text-gray-500 dark:text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('filters.title')}</h2>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                {showFilters ? t('filters.hide') : t('filters.show')}
              </Button>
            </div>

            {showFilters && (
              <div className="space-y-4">
                {/* First Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <DateRangePicker
                    label={t('filters.dateRange')}
                    startDate={parseLocalDateString(filters.startDate)}
                    endDate={parseLocalDateString(filters.endDate)}
                    onStartDateChange={(date) => handleFilterChange('startDate', toLocalDateString(date))}
                    onEndDateChange={(date) => handleFilterChange('endDate', toLocalDateString(date))}
                    isClearable
                  />

                  <Select
                    label={t('filters.location')}
                    value={filters.locationId || ''}
                    onChange={(e) => handleFilterChange('locationId', e.target.value ? parseInt(e.target.value) : null)}
                    disabled={loadingFilters}
                    options={[
                      { value: '', label: loadingFilters ? t('filters.loading') : t('filters.allLocations') },
                      ...locations.map(loc => ({ value: loc.id, label: loc.name }))
                    ]}
                  />

                  <Select
                    label={t('filters.status')}
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value || null)}
                    options={[
                      { value: '', label: t('filters.allStatuses') },
                      { value: 'Draft', label: t('filters.statusOptions.draft') },
                      { value: 'Submitted', label: t('filters.statusOptions.submitted') },
                      { value: 'UnderReview', label: t('filters.statusOptions.underReview') },
                      { value: 'Approved', label: t('filters.statusOptions.approved') },
                      { value: 'Rejected', label: t('filters.statusOptions.rejected') },
                      { value: 'Cancelled', label: t('filters.statusOptions.cancelled') },
                      { value: 'Expired', label: t('filters.statusOptions.expired') },
                      { value: 'Active', label: t('filters.statusOptions.active') },
                      { value: 'Completed', label: t('filters.statusOptions.completed') }
                    ]}
                  />
                </div>

                {/* Second Row */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Select
                    label={t('filters.visitPurpose')}
                    value={filters.visitPurposeId || ''}
                    onChange={(e) => handleFilterChange('visitPurposeId', e.target.value ? parseInt(e.target.value) : null)}
                    disabled={loadingFilters}
                    options={[
                      { value: '', label: loadingFilters ? t('filters.loading') : t('filters.allPurposes') },
                      ...visitPurposes.map(vp => ({ value: vp.id, label: vp.name }))
                    ]}
                  />

                  <Select
                    label={t('filters.host')}
                    value={filters.hostId || ''}
                    onChange={(e) => handleFilterChange('hostId', e.target.value ? parseInt(e.target.value) : null)}
                    disabled={loadingFilters}
                    options={[
                      { value: '', label: loadingFilters ? t('filters.loading') : t('filters.allHosts') },
                      ...hosts.map(host => ({ value: host.id, label: `${host.firstName} ${host.lastName}` }))
                    ]}
                  />

                  <Select
                    label={t('filters.department')}
                    value={filters.department || ''}
                    onChange={(e) => handleFilterChange('department', e.target.value || null)}
                    disabled={loadingFilters}
                    options={[
                      { value: '', label: loadingFilters ? t('filters.loading') : t('filters.allDepartments') },
                      ...departments.map(dept => ({ value: dept.name, label: dept.name }))
                    ]}
                  />

                  <Input
                    label={t('filters.search')}
                    placeholder={t('filters.searchPlaceholder')}
                    value={filters.searchTerm || ''}
                    onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                    leftIcon={<MagnifyingGlassIcon className="w-5 h-5" />}
                  />
                </div>

                {/* Quick Filters */}
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.checkedInOnly || false}
                    onChange={(e) => handleFilterChange('checkedInOnly', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900"
                  />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('filters.quick.checkedInOnly')}</span>
                  </label>

                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.checkedOutOnly || false}
                    onChange={(e) => handleFilterChange('checkedOutOnly', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900"
                  />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('filters.quick.checkedOutOnly')}</span>
                  </label>

                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800/60 transition-colors">
                    <input
                      type="checkbox"
                      checked={filters.overdueOnly || false}
                    onChange={(e) => handleFilterChange('overdueOnly', e.target.checked)}
                    className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-900"
                  />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{t('filters.quick.overdueOnly')}</span>
                  </label>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <Button
                    variant="primary"
                    onClick={handleSearch}
                    disabled={reportLoading}
                    loading={reportLoading}
                  >
                    {t('actions.applyFilters')}
                  </Button>

                  <Button
                    variant="ghost"
                    onClick={handleResetFilters}
                    icon={<XMarkIcon className="w-5 h-5" />}
                  >
                    {t('actions.reset')}
                  </Button>

                  {canExportReports && (
                    <div className="ms-auto">
                      <ExportButton
                        onExport={handleExport}
                        loading={exporting}
                        disabled={!reportData?.visitors?.length}
                      />
                    </div>
                  )}
                </div>
              </div>
            )}
          </Card>

          {/* Summary Stats */}
          {reportData?.summary && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <Card className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('summary.totalRecords')}</div>
                <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">{reportData.summary.totalRecords}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('summary.checkedIn')}</div>
                <div className="text-2xl font-bold text-green-600">{reportData.summary.totalCheckedIn}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('summary.checkedOut')}</div>
                <div className="text-2xl font-bold text-blue-600">{reportData.summary.totalCheckedOut}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('summary.overdue')}</div>
                <div className="text-2xl font-bold text-red-600">{reportData.summary.totalOverdue}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('summary.pending')}</div>
                <div className="text-2xl font-bold text-yellow-600">{reportData.summary.totalPending}</div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500 dark:text-gray-400">{t('summary.active')}</div>
                <div className="text-2xl font-bold text-indigo-600">{reportData.summary.totalActive}</div>
              </Card>
            </div>
          )}

          {/* Data Table */}
          <Card className="p-6">
            {/* Table Header with Record Info */}
            {reportData?.visitors?.length > 0 && (
              <div className="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('table.recordsTitle')}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {t('table.recordsInfo', {
                      showing: reportData.visitors.length,
                      total: reportData.pagination?.totalRecords || 0,
                      page: (reportData.pagination?.pageIndex || 0) + 1,
                      totalPages: reportData.pagination?.totalPages || 1
                    })}
                  </p>
                </div>
              </div>
            )}

            {reportLoading ? (
              <div className="flex justify-center items-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : reportError ? (
              <EmptyState
                title={t('states.errorTitle')}
                description={reportError}
                icon={DocumentTextIcon}
              />
            ) : !reportData?.visitors?.length ? (
              <EmptyState
                title={t('states.noDataTitle')}
                description={t('states.noDataDescription')}
                icon={DocumentTextIcon}
              />
            ) : (
              <>
                <Table
                  columns={columns}
                  data={reportData.visitors}
                  sortBy={pagination.sortBy}
                  sortDirection={pagination.sortDirection}
                  onSort={handleSortChange}
                />

                {reportData.pagination && (
                  <div className="mt-6">
                    <Pagination
                      currentPage={reportData.pagination.pageIndex}
                      totalPages={reportData.pagination.totalPages}
                      onPageChange={handlePageChange}
                      pageSize={reportData.pagination.pageSize}
                      totalRecords={reportData.pagination.totalRecords}
                    />
                  </div>
                )}
              </>
            )}
          </Card>
        </>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{t('statistics.title')}</h2>
            {canExportReports && (
              <ExportButton
                onExport={handleExportStatistics}
                loading={exporting}
                disabled={!statisticsData}
                label={t('statistics.export')}
              />
            )}
          </div>

          {statsLoading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : statisticsData ? (
            <div className="space-y-6">
              {/* Overall Statistics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 rounded-lg border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-900/20">
                  <div className="text-sm text-blue-600 dark:text-blue-300 font-medium">{t('statistics.cards.totalVisitors')}</div>
                  <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{statisticsData.totalVisitors}</div>
                </div>
                <div className="p-4 rounded-lg border border-green-200 dark:border-green-900/60 bg-green-50 dark:bg-green-900/20">
                  <div className="text-sm text-green-600 dark:text-green-300 font-medium">{t('statistics.cards.checkInRate')}</div>
                  <div className="text-2xl font-bold text-green-900 dark:text-green-100">{statisticsData.checkInRate?.toFixed(1)}%</div>
                </div>
                <div className="p-4 rounded-lg border border-purple-200 dark:border-purple-900/60 bg-purple-50 dark:bg-purple-900/20">
                  <div className="text-sm text-purple-600 dark:text-purple-300 font-medium">{t('statistics.cards.avgDuration')}</div>
                  <div className="text-2xl font-bold text-purple-900 dark:text-purple-100">{t('statistics.cards.avgDurationValue', { value: statisticsData.averageDurationMinutes })}</div>
                </div>
                <div className="p-4 rounded-lg border border-orange-200 dark:border-orange-900/60 bg-orange-50 dark:bg-orange-900/20">
                  <div className="text-sm text-orange-600 dark:text-orange-300 font-medium">{t('statistics.cards.noShows')}</div>
                  <div className="text-2xl font-bold text-orange-900 dark:text-orange-100">{statisticsData.totalNoShow}</div>
                </div>
              </div>

              {/* Location Breakdown */}
              {statisticsData.byLocation?.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('statistics.byLocationTitle')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {statisticsData.byLocation.map((loc, idx) => (
                      <div key={idx} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900/40">
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900 dark:text-gray-100">{loc.locationName}</span>
                          <Badge variant="info">{loc.percentage.toFixed(1)}%</Badge>
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {t('statistics.locationItem', { visitors: loc.visitorCount, checkedIn: loc.checkedInCount })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top Hosts */}
              {statisticsData.topHosts?.length > 0 && (
                <div>
                  <h3 className="text-md font-semibold text-gray-900 dark:text-gray-100 mb-3">{t('statistics.topHostsTitle')}</h3>
                  <div className="space-y-2">
                    {statisticsData.topHosts.slice(0, 5).map((host, idx) => (
                      <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-lg">
                        <span className="font-medium text-gray-900 dark:text-gray-100">{host.hostName}</span>
                        <span className="text-sm text-gray-600 dark:text-gray-300">{t('statistics.hostVisitors', { count: host.visitorCount })}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <EmptyState
              title={t('statistics.emptyTitle')}
              description={t('statistics.emptyDescription')}
              icon={ChartBarIcon}
              action={
                <Button onClick={handleFetchStatistics}>
                  {t('statistics.generate')}
                </Button>
              }
            />
          )}
        </Card>
      )}
    </div>
  );
};

export default AdminReportsPage;
