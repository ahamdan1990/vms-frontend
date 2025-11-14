import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { usePermissions } from '../../hooks/usePermissions';
import {
  ExclamationTriangleIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

// Redux
import {
  fetchInBuildingReport,
  exportInBuildingReport,
  selectInBuildingReport,
  selectExporting
} from '../../store/slices/reportsSlice';

// Components
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';
import Card from '../common/Card/Card';
import LoadingSpinner from '../common/LoadingSpinner/LoadingSpinner';
import Badge from '../common/Badge/Badge';

// Permissions
import { EMERGENCY_PERMISSIONS } from '../../constants/permissions';

/**
 * Emergency Report Button for Receptionists
 * Quick access button to view and export who is currently in the building
 * Designed for emergency situations with fast access
 */
const EmergencyReportButton = ({ className = '' }) => {
  const dispatch = useDispatch();
  const { hasPermission } = usePermissions();

  // Permissions
  const canViewRoster = hasPermission(EMERGENCY_PERMISSIONS.VIEW_ROSTER);
  const canExport = hasPermission(EMERGENCY_PERMISSIONS.EXPORT);

  // Redux state
  const { data: reportData, loading } = useSelector(selectInBuildingReport);
  const exporting = useSelector(selectExporting);

  // Local state
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle open modal and fetch data
  const handleOpen = () => {
    setIsModalOpen(true);
    dispatch(fetchInBuildingReport());
  };

  // Handle export
  const handleExport = () => {
    dispatch(exportInBuildingReport());
  };

  // Handle close
  const handleClose = () => {
    setIsModalOpen(false);
  };

  if (!canViewRoster) {
    return null; // Don't show button if no permission
  }

  return (
    <>
      {/* Emergency Button */}
      <Button
        variant="danger"
        size="md"
        icon={<ExclamationTriangleIcon className="w-5 h-5" />}
        onClick={handleOpen}
        className={`animate-pulse-slow ${className}`}
      >
        Emergency Roster
      </Button>

      {/* Emergency Report Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleClose}
        title={
          <div className="flex items-center gap-2">
            <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
            <span>Who Is In The Building</span>
          </div>
        }
        size="xl"
      >
        <div className="space-y-4">
          {/* Alert Banner */}
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ExclamationTriangleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900">Emergency Report</h4>
                <p className="text-sm text-red-700 mt-1">
                  This report shows all visitors currently inside the building.
                  Use this information for emergency evacuations or security purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Report Content */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : reportData ? (
            <>
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 bg-blue-50">
                  <div className="flex items-center gap-2">
                    <UserGroupIcon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="text-sm text-blue-600 font-medium">Total Inside</div>
                      <div className="text-2xl font-bold text-blue-900">{reportData.totalVisitors}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-red-50">
                  <div className="flex items-center gap-2">
                    <ExclamationTriangleIcon className="w-5 h-5 text-red-600" />
                    <div>
                      <div className="text-sm text-red-600 font-medium">Overdue</div>
                      <div className="text-2xl font-bold text-red-900">{reportData.overdueVisitors}</div>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 bg-gray-50">
                  <div>
                    <div className="text-sm text-gray-600 font-medium">Updated</div>
                    <div className="text-sm font-bold text-gray-900">
                      {new Date(reportData.lastUpdated).toLocaleTimeString()}
                    </div>
                  </div>
                </Card>
              </div>

              {/* Visitor List */}
              <div className="border rounded-lg overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="text-sm font-semibold text-gray-900">
                    Current Occupants ({reportData.occupants?.length || 0})
                  </h3>
                </div>

                <div className="max-h-96 overflow-y-auto">
                  {reportData.occupants?.length > 0 ? (
                    <div className="divide-y">
                      {reportData.occupants.map((occupant, idx) => (
                        <div
                          key={idx}
                          className="px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-gray-900">
                                  {occupant.visitorName}
                                </span>
                                {occupant.isOverdue && (
                                  <Badge variant="danger" size="sm">Overdue</Badge>
                                )}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                {occupant.company && (
                                  <span className="mr-3">{occupant.company}</span>
                                )}
                                <span>Host: {occupant.hostName}</span>
                              </div>
                              <div className="text-xs text-gray-500 mt-1">
                                <span>Checked in: {new Date(occupant.checkedInAt).toLocaleString()}</span>
                                <span className="mx-2">•</span>
                                <span>{occupant.minutesOnSite} min on-site</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {occupant.locationName}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="px-4 py-12 text-center text-gray-500">
                      <UserGroupIcon className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                      <p>No visitors currently in the building</p>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No data available
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-between pt-4 border-t">
            <Button
              variant="ghost"
              onClick={handleClose}
              icon={<XMarkIcon className="w-5 h-5" />}
            >
              Close
            </Button>

            <div className="flex items-center gap-3">
              <Button
                variant="secondary"
                onClick={() => dispatch(fetchInBuildingReport())}
                disabled={loading}
                icon={<UserGroupIcon className="w-5 h-5" />}
              >
                Refresh
              </Button>

              {canExport && reportData?.occupants?.length > 0 && (
                <Button
                  variant="primary"
                  onClick={handleExport}
                  disabled={exporting}
                  loading={exporting}
                  icon={<ArrowDownTrayIcon className="w-5 h-5" />}
                >
                  {exporting ? 'Exporting...' : 'Export CSV'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default EmergencyReportButton;
