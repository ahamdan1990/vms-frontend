import { createSelector } from '@reduxjs/toolkit';

// Base selectors
export const selectUsersState = (state) => state.users;
export const selectUsersList = (state) => state.users.list;
export const selectUsersTotal = (state) => state.users.total;
export const selectUsersPagination = (state) => state.users.pagination;
export const selectUsersFilters = (state) => state.users.filters;
export const selectCurrentUser = (state) => state.users.currentUser;
export const selectSelectedUsers = (state) => state.users.selectedUsers;
export const selectAvailableRoles = (state) => state.users.availableRoles;
export const selectUserStats = (state) => state.users.userStats;

// Loading selectors
export const selectUsersLoading = (state) => state.users.loading;
export const selectUsersListLoading = (state) => state.users.listLoading;
export const selectUsersCreateLoading = (state) => state.users.createLoading;
export const selectUsersUpdateLoading = (state) => state.users.updateLoading;
export const selectUsersDeleteLoading = (state) => state.users.deleteLoading;

// Error selectors
export const selectUsersError = (state) => state.users.error;
export const selectUsersListError = (state) => state.users.listError;
export const selectUsersCreateError = (state) => state.users.createError;
export const selectUsersUpdateError = (state) => state.users.updateError;
export const selectUsersDeleteError = (state) => state.users.deleteError;

// Modal selectors
export const selectShowCreateModal = (state) => state.users.showCreateModal;
export const selectShowEditModal = (state) => state.users.showEditModal;
export const selectShowDeleteModal = (state) => state.users.showDeleteModal;
export const selectShowActivityModal = (state) => state.users.showActivityModal;

// User activity selectors
export const selectUserActivity = (state) => state.users.userActivity;
export const selectUserActivityData = (state) => state.users.userActivity.data;
export const selectUserActivityLoading = (state) => state.users.userActivity.loading;
export const selectUserActivityError = (state) => state.users.userActivity.error;
export const selectUserActivityPagination = (state) => state.users.userActivity.pagination;

// Derived selectors
export const selectUsersWithRoleInfo = createSelector(
  [selectUsersList, selectAvailableRoles],
  (users, roles) => {
    const roleMap = roles.reduce((acc, role) => {
      acc[role.name] = role;
      return acc;
    }, {});

    return users.map(user => ({
      ...user,
      roleInfo: roleMap[user.role] || null,
      displayName: user.fullName || `${user.firstName} ${user.lastName}`,
      initials: user.firstName && user.lastName ? 
        `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase() : 
        user.email?.charAt(0).toUpperCase() || '?'
    }));
  }
);

export const selectUserById = createSelector(
  [selectUsersList, (state, userId) => userId],
  (users, userId) => users.find(user => user.id === userId) || null
);

export const selectUsersByRole = createSelector(
  [selectUsersList],
  (users) => {
    return users.reduce((acc, user) => {
      if (!acc[user.role]) {
        acc[user.role] = [];
      }
      acc[user.role].push(user);
      return acc;
    }, {});
  }
);

export const selectUsersByDepartment = createSelector(
  [selectUsersList],
  (users) => {
    return users.reduce((acc, user) => {
      const dept = user.department || 'No Department';
      if (!acc[dept]) {
        acc[dept] = [];
      }
      acc[dept].push(user);
      return acc;
    }, {});
  }
);

export const selectUsersByStatus = createSelector(
  [selectUsersList],
  (users) => {
    return users.reduce((acc, user) => {
      const status = user.isActive ? 'Active' : 'Inactive';
      if (!acc[status]) {
        acc[status] = [];
      }
      acc[status].push(user);
      return acc;
    }, {});
  }
);

export const selectActiveUsers = createSelector(
  [selectUsersList],
  (users) => users.filter(user => user.isActive)
);

export const selectInactiveUsers = createSelector(
  [selectUsersList],
  (users) => users.filter(user => !user.isActive)
);

export const selectLockedUsers = createSelector(
  [selectUsersList],
  (users) => users.filter(user => user.isLockedOut)
);

export const selectAdminUsers = createSelector(
  [selectUsersList],
  (users) => users.filter(user => user.role === 'Administrator')
);

export const selectStaffUsers = createSelector(
  [selectUsersList],
  (users) => users.filter(user => user.role === 'Staff')
);

export const selectOperatorUsers = createSelector(
  [selectUsersList],
  (users) => users.filter(user => user.role === 'Operator')
);

export const selectUsersNeedingPasswordChange = createSelector(
  [selectUsersList],
  (users) => users.filter(user => user.mustChangePassword)
);

export const selectRecentlyCreatedUsers = createSelector(
  [selectUsersList],
  (users) => {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    return users.filter(user => 
      new Date(user.createdOn) > sevenDaysAgo
    ).sort((a, b) => new Date(b.createdOn) - new Date(a.createdOn));
  }
);

export const selectRecentlyActiveUsers = createSelector(
  [selectUsersList],
  (users) => {
    return users
      .filter(user => user.lastLoginDate)
      .sort((a, b) => new Date(b.lastLoginDate) - new Date(a.lastLoginDate))
      .slice(0, 10);
  }
);

// Pagination selectors
export const selectHasNextPage = createSelector(
  [selectUsersPagination],
  (pagination) => pagination.hasNext
);

export const selectHasPreviousPage = createSelector(
  [selectUsersPagination],
  (pagination) => pagination.hasPrevious
);

export const selectCurrentPage = createSelector(
  [selectUsersPagination],
  (pagination) => pagination.pageIndex + 1 // Convert to 1-based
);

export const selectTotalPages = createSelector(
  [selectUsersPagination],
  (pagination) => pagination.totalPages
);

export const selectPageSize = createSelector(
  [selectUsersPagination],
  (pagination) => pagination.pageSize
);

// Filter selectors
export const selectActiveFilters = createSelector(
  [selectUsersFilters],
  (filters) => {
    const activeFilters = {};
    
    if (filters.searchTerm) activeFilters.search = filters.searchTerm;
    if (filters.role) activeFilters.role = filters.role;
    if (filters.status) activeFilters.status = filters.status;
    if (filters.department) activeFilters.department = filters.department;
    
    return activeFilters;
  }
);

export const selectHasActiveFilters = createSelector(
  [selectActiveFilters],
  (activeFilters) => Object.keys(activeFilters).length > 0
);

export const selectFilteredUsersCount = createSelector(
  [selectUsersTotal, selectHasActiveFilters],
  (total, hasFilters) => hasFilters ? total : null
);

// Selection selectors
export const selectSelectedUsersCount = createSelector(
  [selectSelectedUsers],
  (selectedUsers) => selectedUsers.length
);

export const selectHasSelectedUsers = createSelector(
  [selectSelectedUsersCount],
  (count) => count > 0
);

export const selectIsAllUsersSelected = createSelector(
  [selectSelectedUsersCount, selectUsersList],
  (selectedCount, users) => selectedCount > 0 && selectedCount === users.length
);

export const selectSelectedUsersData = createSelector(
  [selectUsersList, selectSelectedUsers],
  (users, selectedIds) => users.filter(user => selectedIds.includes(user.id))
);

export const selectCanBulkDelete = createSelector(
  [selectSelectedUsersData],
  (selectedUsers) => {
    // Can't delete administrators or your own account
    return selectedUsers.length > 0 && 
           selectedUsers.every(user => user.role !== 'Administrator');
  }
);

export const selectCanBulkActivate = createSelector(
  [selectSelectedUsersData],
  (selectedUsers) => {
    return selectedUsers.length > 0 && 
           selectedUsers.some(user => !user.isActive);
  }
);

export const selectCanBulkDeactivate = createSelector(
  [selectSelectedUsersData],
  (selectedUsers) => {
    return selectedUsers.length > 0 && 
           selectedUsers.some(user => user.isActive && user.role !== 'Administrator');
  }
);

// Statistics selectors
export const selectUsersStatsSummary = createSelector(
  [selectUserStats, selectUsersList],
  (stats, users) => {
    if (stats) return stats;
    
    // Calculate from current list if stats not available
    const summary = {
      total: users.length,
      active: users.filter(u => u.isActive).length,
      inactive: users.filter(u => !u.isActive).length,
      locked: users.filter(u => u.isLockedOut).length,
      byRole: {},
      byDepartment: {}
    };
    
    users.forEach(user => {
      // Role counts
      summary.byRole[user.role] = (summary.byRole[user.role] || 0) + 1;
      
      // Department counts
      const dept = user.department || 'No Department';
      summary.byDepartment[dept] = (summary.byDepartment[dept] || 0) + 1;
    });
    
    return summary;
  }
);

export const selectTopDepartments = createSelector(
  [selectUsersStatsSummary],
  (stats) => {
    if (!stats?.byDepartment) return [];
    
    return Object.entries(stats.byDepartment)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([department, count]) => ({ department, count }));
  }
);

export const selectRoleDistribution = createSelector(
  [selectUsersStatsSummary],
  (stats) => {
    if (!stats?.byRole) return [];
    
    return Object.entries(stats.byRole)
      .map(([role, count]) => ({ 
        role, 
        count, 
        percentage: stats.total > 0 ? ((count / stats.total) * 100).toFixed(1) : 0 
      }));
  }
);

// Search and sorting selectors
export const selectSortedUsers = createSelector(
  [selectUsersWithRoleInfo, selectUsersFilters],
  (users, filters) => {
    let sortedUsers = [...users];
    
    if (filters.sortBy) {
      sortedUsers.sort((a, b) => {
        let aValue = a[filters.sortBy];
        let bValue = b[filters.sortBy];
        
        // Handle null/undefined values
        if (aValue == null) aValue = '';
        if (bValue == null) bValue = '';
        
        // Convert to string for comparison
        aValue = aValue.toString().toLowerCase();
        bValue = bValue.toString().toLowerCase();
        
        if (filters.sortDescending) {
          return bValue.localeCompare(aValue);
        } else {
          return aValue.localeCompare(bValue);
        }
      });
    }
    
    return sortedUsers;
  }
);

export const selectUsersTableData = createSelector(
  [selectSortedUsers, selectSelectedUsers],
  (users, selectedUsers) => {
    return users.map(user => ({
      ...user,
      isSelected: selectedUsers.includes(user.id),
      statusBadge: {
        text: user.isActive ? 'Active' : 'Inactive',
        variant: user.isActive ? 'success' : 'secondary'
      },
      lockBadge: user.isLockedOut ? {
        text: 'Locked',
        variant: 'danger'
      } : null,
      passwordBadge: user.mustChangePassword ? {
        text: 'Password Change Required',
        variant: 'warning'
      } : null,
      lastLoginFormatted: user.lastLoginDate ? 
        new Date(user.lastLoginDate).toLocaleDateString() : 
        'Never',
      createdOnFormatted: new Date(user.createdOn).toLocaleDateString()
    }));
  }
);

// Export all selectors
export default {
  // Base selectors
  selectUsersState,
  selectUsersList,
  selectUsersTotal,
  selectUsersPagination,
  selectUsersFilters,
  selectCurrentUser,
  selectSelectedUsers,
  selectAvailableRoles,
  selectUserStats,
  
  // Loading selectors
  selectUsersLoading,
  selectUsersListLoading,
  selectUsersCreateLoading,
  selectUsersUpdateLoading,
  selectUsersDeleteLoading,
  
  // Error selectors
  selectUsersError,
  selectUsersListError,
  selectUsersCreateError,
  selectUsersUpdateError,
  selectUsersDeleteError,
  
  // Modal selectors
  selectShowCreateModal,
  selectShowEditModal,
  selectShowDeleteModal,
  selectShowActivityModal,
  
  // Activity selectors
  selectUserActivity,
  selectUserActivityData,
  selectUserActivityLoading,
  selectUserActivityError,
  selectUserActivityPagination,
  
  // Derived selectors
  selectUsersWithRoleInfo,
  selectUserById,
  selectUsersByRole,
  selectUsersByDepartment,
  selectUsersByStatus,
  selectActiveUsers,
  selectInactiveUsers,
  selectLockedUsers,
  selectAdminUsers,
  selectStaffUsers,
  selectOperatorUsers,
  selectUsersNeedingPasswordChange,
  selectRecentlyCreatedUsers,
  selectRecentlyActiveUsers,
  
  // Pagination selectors
  selectHasNextPage,
  selectHasPreviousPage,
  selectCurrentPage,
  selectTotalPages,
  selectPageSize,
  
  // Filter selectors
  selectActiveFilters,
  selectHasActiveFilters,
  selectFilteredUsersCount,
  
  // Selection selectors
  selectSelectedUsersCount,
  selectHasSelectedUsers,
  selectIsAllUsersSelected,
  selectSelectedUsersData,
  selectCanBulkDelete,
  selectCanBulkActivate,
  selectCanBulkDeactivate,
  
  // Statistics selectors
  selectUsersStatsSummary,
  selectTopDepartments,
  selectRoleDistribution,
  
  // Table selectors
  selectSortedUsers,
  selectUsersTableData
};