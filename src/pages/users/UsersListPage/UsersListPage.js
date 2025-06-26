import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { getUsers, updateFilters, showCreateModal } from '../../../store/slices/usersSlice';
import { formatName, formatDate } from '../../../utils/formatters';
import Table from '../../../components/common/Table/Table';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import LoadingSpinner from '../../../components/common/LoadingSpinner/LoadingSpinner';
import { USER_ROUTES } from '../../../routes/routeConstants';

const UsersListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const {
    list: users,
    total,
    pagination,
    filters,
    listLoading,
    listError
  } = useSelector(state => state.users);

  const [searchTerm, setSearchTerm] = useState(filters.searchTerm || '');

  useEffect(() => {
    dispatch(getUsers());
  }, [dispatch]);

  const handleSearch = (e) => {
    e.preventDefault();
    dispatch(updateFilters({ searchTerm, pageIndex: 0 }));
    dispatch(getUsers());
  };

  const handlePageChange = (pageIndex) => {
    dispatch(updateFilters({ pageIndex }));
    dispatch(getUsers());
  };

  const handlePageSizeChange = (pageSize) => {
    dispatch(updateFilters({ pageSize, pageIndex: 0 }));
    dispatch(getUsers());
  };

  const handleSort = (sortConfig) => {
    dispatch(updateFilters({
      sortBy: sortConfig.key,
      sortDescending: sortConfig.direction === 'desc'
    }));
    dispatch(getUsers());
  };

  const columns = [
    {
      key: 'fullName',
      title: 'Name',
      sortable: true,
      render: (_, user) => (
        <div>
          <div className="font-medium text-gray-900">
            {formatName(user.firstName, user.lastName)}
          </div>
          <div className="text-sm text-gray-500">{user.email}</div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Role',
      sortable: true,
      render: (role) => (
        <span className={`badge badge-role-${role.toLowerCase()}`}>
          {role}
        </span>
      )
    },
    {
      key: 'department',
      title: 'Department',
      sortable: true,
      render: (department) => department || '-'
    },
    {
      key: 'isActive',
      title: 'Status',
      sortable: true,
      render: (isActive) => (
        <span className={`badge ${isActive ? 'badge-success' : 'badge-gray'}`}>
          {isActive ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      key: 'createdOn',
      title: 'Created',
      sortable: true,
      render: (date) => formatDate(date, 'MMM dd, yyyy')
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (_, user) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(USER_ROUTES.getDetailRoute(user.id))}
          >
            View
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(USER_ROUTES.getEditRoute(user.id))}
          >
            Edit
          </Button>
        </div>
      )
    }
  ];

  if (listError) {
    return (
      <div className="text-center py-12">
        <div className="text-red-500 mb-4">Error loading users</div>
        <Button onClick={() => dispatch(getUsers())}>
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-600">Manage system users and their permissions</p>
        </div>
        
        <Button
          variant="primary"
          onClick={() => navigate(USER_ROUTES.CREATE)}
        >
          Create User
        </Button>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="p-6 border-b border-gray-200">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="search"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="🔍"
              />
            </div>
            <Button type="submit" variant="outline">
              Search
            </Button>
          </form>
        </div>

        <div className="p-6">
          {listLoading ? (
            <LoadingSpinner text="Loading users..." />
          ) : (
            <Table
              columns={columns}
              data={users}
              onSort={handleSort}
              pagination={{
                currentPage: pagination.pageIndex + 1,
                totalPages: pagination.totalPages,
                totalItems: total,
                pageSize: pagination.pageSize,
                onPageChange: (page) => handlePageChange(page - 1),
                onPageSizeChange: handlePageSizeChange
              }}
              emptyMessage="No users found"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default UsersListPage;