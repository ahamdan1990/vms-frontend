import { createSelector } from '@reduxjs/toolkit';

// Base selector
const selectInvitationsState = (state) => state.invitations;

// Basic selectors
export const selectInvitationsList = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.list
);

export const selectInvitationsTotal = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.total
);

export const selectInvitationsPageIndex = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.pageIndex
);

export const selectInvitationsPageSize = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.pageSize
);

export const selectCurrentInvitation = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.currentInvitation
);

export const selectInvitationsFilters = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.filters
);

// Loading selectors
export const selectInvitationsLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.loading
);

export const selectInvitationsListLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.listLoading
);

export const selectInvitationsCreateLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.createLoading
);

export const selectInvitationsUpdateLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.updateLoading
);

export const selectInvitationsDeleteLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.deleteLoading
);

export const selectInvitationsApprovalLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.approvalLoading
);

export const selectInvitationsQrLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.qrLoading
);

export const selectInvitationsCheckInLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.checkInLoading
);

// Error selectors
export const selectInvitationsError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.error
);

export const selectInvitationsListError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.listError
);

export const selectInvitationsCreateError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.createError
);

export const selectInvitationsUpdateError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.updateError
);

export const selectInvitationsDeleteError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.deleteError
);

export const selectInvitationsApprovalError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.approvalError
);

export const selectInvitationsQrError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.qrError
);

export const selectInvitationsCheckInError = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.checkInError
);

// Modal selectors
export const selectShowCreateModal = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.showCreateModal
);

export const selectShowEditModal = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.showEditModal
);

export const selectShowDeleteModal = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.showDeleteModal
);

export const selectShowDetailsModal = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.showDetailsModal
);

export const selectShowApprovalModal = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.showApprovalModal
);

export const selectShowQrModal = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.showQrModal
);

// Selection selectors
export const selectSelectedInvitations = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.selectedInvitations
);

// Special lists selectors
export const selectPendingApprovals = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.pendingApprovals
);

export const selectPendingApprovalsLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.pendingApprovalsLoading
);

export const selectActiveInvitations = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.activeInvitations
);

export const selectActiveInvitationsLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.activeInvitationsLoading
);

export const selectUpcomingInvitations = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.upcomingInvitations
);

export const selectUpcomingInvitationsLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.upcomingInvitationsLoading
);

export const selectInvitationTemplates = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.templates
);

export const selectInvitationTemplatesLoading = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.templatesLoading
);

// QR code data
export const selectQrCodeData = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.qrCodeData
);

// QR code Image
export const selectQrCodeImage = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.qrCodeImage
);


// Check-in data
export const selectCheckInData = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.checkInData
);

// Computed selectors with business logic

// Filtered and sorted invitations
export const selectFilteredInvitations = createSelector(
  [selectInvitationsList, selectInvitationsFilters],
  (invitations, filters) => {
    let filtered = [...invitations];

    // Apply text search
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(invitation => 
        invitation.subject?.toLowerCase().includes(searchLower) ||
        invitation.visitor?.firstName?.toLowerCase().includes(searchLower) ||
        invitation.visitor?.lastName?.toLowerCase().includes(searchLower) ||
        invitation.visitor?.email?.toLowerCase().includes(searchLower) ||
        invitation.host?.firstName?.toLowerCase().includes(searchLower) ||
        invitation.host?.lastName?.toLowerCase().includes(searchLower) ||
        invitation.invitationNumber?.toLowerCase().includes(searchLower)
      );
    }

    // Apply status filter
    if (filters.status) {
      filtered = filtered.filter(invitation => invitation.status === filters.status);
    }

    // Apply type filter
    if (filters.type) {
      filtered = filtered.filter(invitation => invitation.type === filters.type);
    }

    // Apply host filter
    if (filters.hostId) {
      filtered = filtered.filter(invitation => invitation.hostId === filters.hostId);
    }

    // Apply visitor filter
    if (filters.visitorId) {
      filtered = filtered.filter(invitation => invitation.visitorId === filters.visitorId);
    }

    // Apply visit purpose filter
    if (filters.visitPurposeId) {
      filtered = filtered.filter(invitation => invitation.visitPurposeId === filters.visitPurposeId);
    }

    // Apply location filter
    if (filters.locationId) {
      filtered = filtered.filter(invitation => invitation.locationId === filters.locationId);
    }

    // Apply date filters
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter(invitation => 
        new Date(invitation.scheduledStartTime) >= startDate
      );
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      filtered = filtered.filter(invitation => 
        new Date(invitation.scheduledEndTime) <= endDate
      );
    }

    // Apply special filters
    if (filters.pendingApprovalsOnly) {
      filtered = filtered.filter(invitation => 
        invitation.status === 'Submitted' || invitation.status === 'UnderReview'
      );
    }

    if (filters.activeOnly) {
      filtered = filtered.filter(invitation => invitation.status === 'Active');
    }

    if (filters.expiredOnly) {
      filtered = filtered.filter(invitation => invitation.status === 'Expired');
    }

    // Apply deleted filter
    if (!filters.includeDeleted) {
      filtered = filtered.filter(invitation => !invitation.isDeleted);
    }

    return filtered;
  }
);

// Invitations grouped by status
export const selectInvitationsByStatus = createSelector(
  [selectInvitationsList],
  (invitations) => {
    const grouped = {};
    
    invitations.forEach(invitation => {
      const status = invitation.status || 'Draft';
      if (!grouped[status]) {
        grouped[status] = [];
      }
      grouped[status].push(invitation);
    });

    return grouped;
  }
);

// Invitations grouped by date
export const selectInvitationsByDate = createSelector(
  [selectInvitationsList],
  (invitations) => {
    const grouped = {};
    
    invitations.forEach(invitation => {
      const date = new Date(invitation.scheduledStartTime).toDateString();
      if (!grouped[date]) {
        grouped[date] = [];
      }
      grouped[date].push(invitation);
    });

    return grouped;
  }
);

// Today's invitations
export const selectTodaysInvitations = createSelector(
  [selectInvitationsList],
  (invitations) => {
    const today = new Date();
    const todayStr = today.toDateString();
    
    return invitations.filter(invitation => {
      const invitationDate = new Date(invitation.scheduledStartTime).toDateString();
      return invitationDate === todayStr;
    });
  }
);

// Overdue invitations (past scheduled time but not completed)
export const selectOverdueInvitations = createSelector(
  [selectInvitationsList],
  (invitations) => {
    const now = new Date();
    
    return invitations.filter(invitation => {
      const scheduledEnd = new Date(invitation.scheduledEndTime);
      return scheduledEnd < now && 
             invitation.status !== 'Completed' && 
             invitation.status !== 'Cancelled' &&
             invitation.status !== 'Expired';
    });
  }
);

// Selection state helpers
export const selectIsInvitationSelected = createSelector(
  [selectSelectedInvitations, (state, id) => id],
  (selectedIds, id) => {
    return selectedIds.includes(id);
  }
);

export const selectHasSelectedInvitations = createSelector(
  [selectSelectedInvitations],
  (selectedIds) => selectedIds.length > 0
);

export const selectSelectedInvitationsCount = createSelector(
  [selectSelectedInvitations],
  (selectedIds) => selectedIds.length
);

export const selectSelectedInvitationsData = createSelector(
  [selectInvitationsList, selectSelectedInvitations],
  (invitations, selectedIds) => {
    return invitations.filter(invitation => selectedIds.includes(invitation.id));
  }
);

// Pagination helpers
export const selectInvitationsPagination = createSelector(
  [selectInvitationsPageIndex, selectInvitationsPageSize, selectInvitationsTotal],
  (pageIndex, pageSize, total) => {
    const totalPages = Math.ceil(total / pageSize);
    const hasPreviousPage = pageIndex > 0;
    const hasNextPage = pageIndex < totalPages - 1;
    const start = pageIndex * pageSize + 1;
    const end = Math.min((pageIndex + 1) * pageSize, total);

    return {
      pageIndex,
      pageSize,
      totalPages,
      hasPreviousPage,
      hasNextPage,
      start,
      end,
      total
    };
  }
);

// Status-based business logic
export const selectCanApproveInvitation = createSelector(
  [selectCurrentInvitation],
  (invitation) => {
    if (!invitation) return false;
    return invitation.status === 'Submitted' || invitation.status === 'UnderReview';
  }
);

export const selectCanEditInvitation = createSelector(
  [selectCurrentInvitation],
  (invitation) => {
    if (!invitation) return false;
    return invitation.status === 'Draft' || invitation.status === 'Rejected';
  }
);

export const selectCanCancelInvitation = createSelector(
  [selectCurrentInvitation],
  (invitation) => {
    if (!invitation) return false;
    return invitation.status !== 'Cancelled' && 
           invitation.status !== 'Completed' && 
           invitation.status !== 'Expired';
  }
);

export const selectCanCheckInInvitation = createSelector(
  [selectCurrentInvitation],
  (invitation) => {
    if (!invitation) return false;
    const now = new Date();
    const scheduledStart = new Date(invitation.scheduledStartTime);
    const scheduledEnd = new Date(invitation.scheduledEndTime);
    
    return invitation.status === 'Approved' && 
           now >= scheduledStart && 
           now <= scheduledEnd;
  }
);

export const selectCanGenerateQr = createSelector(
  [selectCurrentInvitation],
  (invitation) => {
    if (!invitation) return false;
    return invitation.status === 'Approved';
  }
);

// Statistics
export const selectInvitationStatistics = createSelector(
  [selectInvitationsList],
  (invitations) => {
    const total = invitations.length;
    const draft = invitations.filter(i => i.status === 'Draft').length;
    const submitted = invitations.filter(i => i.status === 'Submitted').length;
    const underReview = invitations.filter(i => i.status === 'UnderReview').length;
    const approved = invitations.filter(i => i.status === 'Approved').length;
    const rejected = invitations.filter(i => i.status === 'Rejected').length;
    const cancelled = invitations.filter(i => i.status === 'Cancelled').length;
    const expired = invitations.filter(i => i.status === 'Expired').length;
    const active = invitations.filter(i => i.status === 'Active').length;
    const completed = invitations.filter(i => i.status === 'Completed').length;

    // By type
    const single = invitations.filter(i => i.type === 'Single').length;
    const group = invitations.filter(i => i.type === 'Group').length;
    const recurring = invitations.filter(i => i.type === 'Recurring').length;
    const walkIn = invitations.filter(i => i.type === 'WalkIn').length;

    return {
      total,
      byStatus: {
        draft,
        submitted,
        underReview,
        approved,
        rejected,
        cancelled,
        expired,
        active,
        completed
      },
      byType: {
        single,
        group,
        recurring,
        walkIn
      },
      pendingApproval: submitted + underReview,
      activeToday: active,
      upcomingApproved: approved
    };
  }
);

// Data freshness helpers
export const selectInvitationsLastUpdated = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.lastUpdated
);

export const selectPendingApprovalsLastFetch = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.pendingApprovalsLastFetch
);

export const selectActiveInvitationsLastFetch = createSelector(
  [selectInvitationsState],
  (invitations) => invitations.activeInvitationsLastFetch
);

// Helper for getting invitation by ID
export const selectInvitationById = createSelector(
  [selectInvitationsList, (state, id) => id],
  (invitations, id) => {
    return invitations.find(invitation => invitation.id === id);
  }
);

// Current invitation status helpers
export const selectCurrentInvitationStatus = createSelector(
  [selectCurrentInvitation],
  (invitation) => invitation?.status || null
);

export const selectCurrentInvitationCanBeModified = createSelector(
  [selectCurrentInvitation],
  (invitation) => {
    if (!invitation) return false;
    return ['Draft', 'Rejected'].includes(invitation.status);
  }
);

// Time-based helpers
export const selectInvitationsNeedingAttention = createSelector(
  [selectInvitationsList],
  (invitations) => {
    const now = new Date();
    const oneHourFromNow = new Date(now.getTime() + 60 * 60 * 1000);
    
    return invitations.filter(invitation => {
      const scheduledStart = new Date(invitation.scheduledStartTime);
      
      // Invitations starting within an hour that are approved but not checked in
      return invitation.status === 'Approved' && 
             scheduledStart <= oneHourFromNow && 
             scheduledStart > now;
    });
  }
);