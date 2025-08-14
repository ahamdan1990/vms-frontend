// Enhanced Settings Management Component
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';

// Components
import Card from '../../common/Card/Card';
import Button from '../../common/Button/Button';
import Modal from '../../common/Modal/Modal';
import Badge from '../../common/Badge/Badge';
import Table from '../../common/Table/Table';
import Input from '../../common/Input/Input';

// Icons
import {
  MapPinIcon,
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon,
  CogIcon
} from '@heroicons/react/24/outline';

// Redux
import { 
  selectLocationsList, 
  selectLocationsLoading,
  selectLocationsError 
} from '../../../store/selectors/locationSelectors';
import { 
  selectVisitPurposesList, 
  selectVisitPurposesLoading,
  selectVisitPurposesError 
} from '../../../store/selectors/visitPurposeSelectors';
import { 
  getLocations, 
  createLocation, 
  updateLocation, 
  deleteLocation 
} from '../../../store/slices/locationsSlice';
import { 
  getVisitPurposes, 
  createVisitPurpose, 
  updateVisitPurpose, 
  deleteVisitPurpose 
} from '../../../store/slices/visitPurposesSlice';

const SystemManagement = () => {
  const dispatch = useDispatch();

  // Redux state
  const locations = useSelector(selectLocationsList);
  const locationsLoading = useSelector(selectLocationsLoading);
  const locationsError = useSelector(selectLocationsError);
  
  const visitPurposes = useSelector(selectVisitPurposesList);
  const visitPurposesLoading = useSelector(selectVisitPurposesLoading);
  const visitPurposesError = useSelector(selectVisitPurposesError);

  // Local state
  const [activeTab, setActiveTab] = useState('locations');
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showPurposeModal, setShowPurposeModal] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);
  const [editingPurpose, setEditingPurpose] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteItem, setDeleteItem] = useState(null);

  // Form states
  const [locationForm, setLocationForm] = useState({
    name: '',
    description: '',
    capacity: '',
    floor: '',
    building: '',
    isActive: true
  });

  const [purposeForm, setPurposeForm] = useState({
    name: '',
    description: '',
    isActive: true
  });

  // Load data on mount
  React.useEffect(() => {
    dispatch(getLocations({ pageSize: 1000 }));
    dispatch(getVisitPurposes({ pageSize: 1000 }));
  }, [dispatch]);

  // Location management
  const handleLocationSubmit = async () => {
    try {
      if (editingLocation) {
        await dispatch(updateLocation({ id: editingLocation.id, ...locationForm })).unwrap();
      } else {
        await dispatch(createLocation(locationForm)).unwrap();
      }
      setShowLocationModal(false);
      resetLocationForm();
      dispatch(getLocations({ pageSize: 1000 }));
    } catch (error) {
      console.error('Location operation failed:', error);
    }
  };

  // Visit purpose management
  const handlePurposeSubmit = async () => {
    try {
      if (editingPurpose) {
        await dispatch(updateVisitPurpose({ id: editingPurpose.id, ...purposeForm })).unwrap();
      } else {
        await dispatch(createVisitPurpose(purposeForm)).unwrap();
      }
      setShowPurposeModal(false);
      resetPurposeForm();
      dispatch(getVisitPurposes({ pageSize: 1000 }));
    } catch (error) {
      console.error('Visit purpose operation failed:', error);
    }
  };

  // Delete operations
  const handleDelete = async () => {
    try {
      if (deleteItem.type === 'location') {
        await dispatch(deleteLocation(deleteItem.id)).unwrap();
        dispatch(getLocations({ pageSize: 1000 }));
      } else if (deleteItem.type === 'purpose') {
        await dispatch(deleteVisitPurpose(deleteItem.id)).unwrap();
        dispatch(getVisitPurposes({ pageSize: 1000 }));
      }
      setShowDeleteModal(false);
      setDeleteItem(null);
    } catch (error) {
      console.error('Delete operation failed:', error);
    }
  };

  // Helper functions
  const resetLocationForm = () => {
    setLocationForm({
      name: '',
      description: '',
      capacity: '',
      floor: '',
      building: '',
      isActive: true
    });
    setEditingLocation(null);
  };

  const resetPurposeForm = () => {
    setPurposeForm({
      name: '',
      description: '',
      isActive: true
    });
    setEditingPurpose(null);
  };

  const openLocationModal = (location = null) => {
    if (location) {
      setEditingLocation(location);
      setLocationForm({
        name: location.name || '',
        description: location.description || '',
        capacity: location.capacity || '',
        floor: location.floor || '',
        building: location.building || '',
        isActive: location.isActive ?? true
      });
    } else {
      resetLocationForm();
    }
    setShowLocationModal(true);
  };

  const openPurposeModal = (purpose = null) => {
    if (purpose) {
      setEditingPurpose(purpose);
      setPurposeForm({
        name: purpose.name || '',
        description: purpose.description || '',
        isActive: purpose.isActive ?? true
      });
    } else {
      resetPurposeForm();
    }
    setShowPurposeModal(true);
  };

  const openDeleteModal = (item, type) => {
    setDeleteItem({ ...item, type });
    setShowDeleteModal(true);
  };

  // Table columns
  const locationColumns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, location) => (
        <div className="flex items-center space-x-3">
          <MapPinIcon className="w-5 h-5 text-gray-400" />
          <div>
            <div className="font-medium text-gray-900">{value}</div>
            {location.building && (
              <div className="text-sm text-gray-500">{location.building}</div>
            )}
          </div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <span className="text-gray-600">{value || 'No description'}</span>
      )
    },
    {
      key: 'capacity',
      header: 'Capacity',
      render: (value) => (
        <span className="text-gray-900">{value || 'N/A'}</span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value, location) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openLocationModal(location)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit location"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(location, 'location')}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete location"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  const purposeColumns = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, purpose) => (
        <div className="flex items-center space-x-3">
          <ClipboardDocumentListIcon className="w-5 h-5 text-gray-400" />
          <div className="font-medium text-gray-900">{value}</div>
        </div>
      )
    },
    {
      key: 'description',
      header: 'Description',
      render: (value) => (
        <span className="text-gray-600">{value || 'No description'}</span>
      )
    },
    {
      key: 'isActive',
      header: 'Status',
      render: (value) => (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (value, purpose) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => openPurposeModal(purpose)}
            className="text-blue-600 hover:text-blue-900 transition-colors"
            title="Edit visit purpose"
          >
            <PencilIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => openDeleteModal(purpose, 'purpose')}
            className="text-red-600 hover:text-red-900 transition-colors"
            title="Delete visit purpose"
          >
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <CogIcon className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Management</h1>
          <p className="text-gray-600">Manage locations and visit purposes</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('locations')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'locations'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <MapPinIcon className="w-4 h-4" />
              <span>Locations</span>
            </div>
          </button>
          <button
            onClick={() => setActiveTab('purposes')}
            className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
              activeTab === 'purposes'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center space-x-2">
              <ClipboardDocumentListIcon className="w-4 h-4" />
              <span>Visit Purposes</span>
            </div>
          </button>
        </nav>
      </div>

      {/* Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'locations' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Locations</h2>
                <p className="text-gray-600">Manage building locations and meeting rooms</p>
              </div>
              <Button
                onClick={() => openLocationModal()}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Add Location
              </Button>
            </div>

            <Table
              data={locations}
              columns={locationColumns}
              loading={locationsLoading}
              error={locationsError}
              emptyMessage="No locations found. Add your first location to get started."
            />
          </Card>
        )}

        {activeTab === 'purposes' && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Visit Purposes</h2>
                <p className="text-gray-600">Manage types of visits and meeting purposes</p>
              </div>
              <Button
                onClick={() => openPurposeModal()}
                icon={<PlusIcon className="w-4 h-4" />}
              >
                Add Purpose
              </Button>
            </div>

            <Table
              data={visitPurposes}
              columns={purposeColumns}
              loading={visitPurposesLoading}
              error={visitPurposesError}
              emptyMessage="No visit purposes found. Add your first purpose to get started."
            />
          </Card>
        )}
      </motion.div>

      {/* Location Modal */}
      <Modal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        title={editingLocation ? 'Edit Location' : 'Add Location'}
        size="md"
        closeOnBackdrop={false}
        closeOnEscape={false}
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowLocationModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleLocationSubmit}>
              {editingLocation ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={locationForm.name}
            onChange={(e) => setLocationForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Conference Room A"
            required
          />
          <Input
            label="Description"
            type="text"
            value={locationForm.description}
            onChange={(e) => setLocationForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Large conference room with video equipment"
          />
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Capacity"
              type="number"
              value={locationForm.capacity}
              onChange={(e) => setLocationForm(prev => ({ ...prev, capacity: e.target.value }))}
              placeholder="10"
            />
            <Input
              label="Floor"
              type="text"
              value={locationForm.floor}
              onChange={(e) => setLocationForm(prev => ({ ...prev, floor: e.target.value }))}
              placeholder="2nd Floor"
            />
          </div>
          <Input
            label="Building"
            type="text"
            value={locationForm.building}
            onChange={(e) => setLocationForm(prev => ({ ...prev, building: e.target.value }))}
            placeholder="Main Building"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="locationActive"
              checked={locationForm.isActive}
              onChange={(e) => setLocationForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="locationActive" className="text-sm text-gray-700">
              Active location
            </label>
          </div>
        </div>
      </Modal>

      {/* Visit Purpose Modal */}
      <Modal
        isOpen={showPurposeModal}
        onClose={() => setShowPurposeModal(false)}
        title={editingPurpose ? 'Edit Visit Purpose' : 'Add Visit Purpose'}
        size="md"
        closeOnBackdrop={false}
        closeOnEscape={false}
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowPurposeModal(false)}
            >
              Cancel
            </Button>
            <Button onClick={handlePurposeSubmit}>
              {editingPurpose ? 'Update' : 'Create'}
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            type="text"
            value={purposeForm.name}
            onChange={(e) => setPurposeForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Business Meeting"
            required
          />
          <Input
            label="Description"
            type="text"
            value={purposeForm.description}
            onChange={(e) => setPurposeForm(prev => ({ ...prev, description: e.target.value }))}
            placeholder="General business meetings and discussions"
          />
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="purposeActive"
              checked={purposeForm.isActive}
              onChange={(e) => setPurposeForm(prev => ({ ...prev, isActive: e.target.checked }))}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="purposeActive" className="text-sm text-gray-700">
              Active purpose
            </label>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Confirm Delete"
        size="sm"
        variant="danger"
        footer={
          <div className="flex justify-end space-x-3">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-gray-600">
          Are you sure you want to delete "{deleteItem?.name}"? This action cannot be undone.
        </p>
      </Modal>
    </div>
  );
};

export default SystemManagement;
