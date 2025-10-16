import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// Components
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import SearchInput from '../../common/SearchInput/SearchInput';
import Select from '../../common/Select/Select';
import Pagination from '../../common/Pagination/Pagination';
import LoadingSpinner from '../../common/LoadingSpinner/LoadingSpinner';
import CameraCard from '../CameraCard/CameraCard';
import CameraFilters from '../CameraFilters/CameraFilters';
import CameraForm from '../CameraForm/CameraForm';
import ConfirmDialog from '../../common/ConfirmDialog/ConfirmDialog';

// Redux actions
import {
  fetchCameras,
  updateSearchTerm,
  updateFilters,
  updateSorting,
  updatePagination,
  selectCamera,
  deselectCamera,
  selectAllCameras,
  deselectAllCameras,
  deleteCamera,
  toggleFilters,
  setViewMode,
  clearSuccessMessage,
  testCameraConnection,
  performHealthCheck
} from '../../../store/slices/camerasSlice';

// Constants and utilities
import { CAMERA_CONSTANTS } from '../../../constants/cameraConstants';
import useDebounce from '../../../hooks/useDebounce';
import { formatDateTime } from '../../../utils/dateUtils';
import { hasPermission } from '../../../utils/authUtils';

// Icons
import {
  PlusIcon,
  FunnelIcon,
  EyeIcon,
  Squares2X2Icon,
  ListBulletIcon,
  MapIcon,
  ArrowPathIcon,
  CheckIcon,
  XMarkIcon,
  AdjustmentsHorizontalIcon,
  SignalIcon
} from '@heroicons/react/24/outline';/**
 * CameraList - Main component for displaying and managing cameras
 * Features: List/Grid views, filtering, sorting, pagination, bulk operations
 */
const CameraList = () => {
  const dispatch = useDispatch();
  
  // Redux state
  const {
    list: cameras,
    total,
    pageIndex,
    pageSize,
    searchTerm,
    filters,
    sortBy,
    sortDirection,
    viewMode,
    selectedCameraIds,
    showFilters,
    listLoading,
    operationLoading,
    listError,
    lastSuccessMessage,
    statistics
  } = useSelector(state => state.cameras);

  // Local state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCamera, setEditingCamera] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingCamera, setDeletingCamera] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Fetch cameras when dependencies change
  useEffect(() => {
    dispatch(fetchCameras());
  }, [dispatch, debouncedSearchTerm, filters, sortBy, sortDirection, pageIndex, pageSize]);

  // Handle success message display
  useEffect(() => {
    if (lastSuccessMessage) {
      const timer = setTimeout(() => {
        dispatch(clearSuccessMessage());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [lastSuccessMessage, dispatch]);

  // Event handlers
  const handleSearch = useCallback((value) => {
    dispatch(updateSearchTerm(value));
    dispatch(updatePagination({ pageIndex: 0 })); // Reset to first page
  }, [dispatch]);

  const handleFilterChange = useCallback((newFilters) => {
    dispatch(updateFilters(newFilters));
    dispatch(updatePagination({ pageIndex: 0 }));
  }, [dispatch]);

  const handleSort = useCallback((field) => {
    const newDirection = sortBy === field && sortDirection === 'asc' ? 'desc' : 'asc';
    dispatch(updateSorting({ sortBy: field, sortDirection: newDirection }));
  }, [dispatch, sortBy, sortDirection]);

  const handlePageChange = useCallback((newPageIndex, newPageSize) => {
    dispatch(updatePagination({ pageIndex: newPageIndex, pageSize: newPageSize }));
  }, [dispatch]);

  const handleViewModeChange = useCallback((mode) => {
    dispatch(setViewMode(mode));
  }, [dispatch]);

  const handleCameraSelect = useCallback((cameraId, selected) => {
    if (selected) {
      dispatch(selectCamera(cameraId));
    } else {
      dispatch(deselectCamera(cameraId));
    }
  }, [dispatch]);

  const handleSelectAll = useCallback((selected) => {
    if (selected) {
      dispatch(selectAllCameras());
    } else {
      dispatch(deselectAllCameras());
    }
  }, [dispatch]);

  const handleRefresh = useCallback(() => {
    dispatch(fetchCameras());
    setLastRefresh(new Date());
  }, [dispatch]);

  const handleCreate = useCallback(() => {
    if (!hasPermission('Camera.Create')) return;
    setShowCreateModal(true);
  }, []);

  const handleEdit = useCallback((camera) => {
    if (!hasPermission('Camera.Update')) return;
    setEditingCamera(camera);
    setShowEditModal(true);
  }, []);

  const handleDelete = useCallback((camera) => {
    if (!hasPermission('Camera.Delete')) return;
    setDeletingCamera(camera);
    setShowDeleteModal(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (deletingCamera) {
      await dispatch(deleteCamera({ id: deletingCamera.id }));
      setShowDeleteModal(false);
      setDeletingCamera(null);
    }
  }, [dispatch, deletingCamera]);

  const handleTestConnection = useCallback(async (cameraId) => {
    if (!hasPermission('Camera.TestConnection')) return;
    await dispatch(testCameraConnection({ id: cameraId }));
  }, [dispatch]);

  const handleHealthCheck = useCallback(async (cameraId) => {
    if (!hasPermission('Camera.HealthCheck')) return;
    await dispatch(performHealthCheck(cameraId));
  }, [dispatch]);

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Camera Management</h1>
      
      {/* Add more UI components here */}
      <div className="space-y-4">
        {cameras.map((camera) => (
          <div key={camera.id} className="p-4 bg-white rounded-lg shadow">
            {camera.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CameraList;