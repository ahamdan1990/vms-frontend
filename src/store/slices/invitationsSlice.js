import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import invitationService from '../../services/invitationService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Main invitation list
  list: [],
  total: 0,
  pageIndex: 0,
  pageSize: 20,
  
  // Current invitation being viewed/edited
  currentInvitation: null,
  
  // Loading states
  loading: false,
  listLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  approvalLoading: false,
  qrLoading: false,
  checkInLoading: false,
  
  // Error states
  error: null,
  listError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  approvalError: null,
  qrError: null,
  checkInError: null,
  
  // Filter state
  filters: {
    searchTerm: '',
    status: null,
    type: null,
    hostId: null,
    visitorId: null,
    visitPurposeId: null,
    locationId: null,
    startDate: '',
    endDate: '',
    includeDeleted: false,
    pendingApprovalsOnly: false,
    activeOnly: false,
    expiredOnly: false,
    sortBy: 'ScheduledStartTime',
    sortDirection: 'desc'
  },
  
  // Modal states
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  showDetailsModal: false,
  showApprovalModal: false,
  showQrModal: false,
  
  // Selection state
  selectedInvitations: [],
  
  // Special invitation lists (cached)
  pendingApprovals: [],
  pendingApprovalsLoading: false,
  pendingApprovalsError: null,
  pendingApprovalsLastFetch: null,
  
  activeInvitations: [],
  activeInvitationsLoading: false,
  activeInvitationsError: null,
  activeInvitationsLastFetch: null,
  
  upcomingInvitations: [],
  upcomingInvitationsLoading: false,
  upcomingInvitationsError: null,
  upcomingInvitationsLastFetch: null,
  
  // Templates
  templates: [],
  templatesLoading: false,
  templatesError: null,
  templatesLastFetch: null,
  
  // QR code data
  qrCodeData: null,

  // QR code image
  qrCodeImage: null,

  // Check-in state
  checkInData: null,
  
  // Statistics
  statistics: null,
  statisticsLoading: false,
  statisticsError: null,
  statisticsLastFetch: null,
  
  // Last updated timestamp
  lastUpdated: null
};

// Async thunks for invitation operations

// Get invitations with filtering and pagination
export const getInvitations = createAsyncThunk(
  'invitations/getInvitations',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await invitationService.getInvitations(params);
      return { data, params };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get invitation by ID
export const getInvitationById = createAsyncThunk(
  'invitations/getInvitationById',
  async ({ id, includeDeleted = false }, { rejectWithValue }) => {
    try {
      const data = await invitationService.getInvitationById(id, includeDeleted);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new invitation
export const createInvitation = createAsyncThunk(
  'invitations/createInvitation',
  async (invitationData, { rejectWithValue }) => {
    try {
      const data = await invitationService.createInvitation(invitationData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update existing invitation
export const updateInvitation = createAsyncThunk(
  'invitations/updateInvitation',
  async ({ id, invitationData }, { rejectWithValue }) => {
    try {
      const data = await invitationService.updateInvitation(id, invitationData);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete invitation
export const deleteInvitation = createAsyncThunk(
  'invitations/deleteInvitation',
  async ({ id, permanentDelete = false }, { rejectWithValue }) => {
    try {
      await invitationService.deleteInvitation(id, permanentDelete);
      return { id, permanentDelete };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Approval workflow thunks

// Submit invitation for approval
export const submitInvitation = createAsyncThunk(
  'invitations/submitInvitation',
  async (id, { rejectWithValue }) => {
    try {
      const data = await invitationService.submitInvitation(id);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Approve invitation
export const approveInvitation = createAsyncThunk(
  'invitations/approveInvitation',
  async ({ id, comments }, { rejectWithValue }) => {
    try {
      const data = await invitationService.approveInvitation(id, comments);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Reject invitation
export const rejectInvitation = createAsyncThunk(
  'invitations/rejectInvitation',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const data = await invitationService.rejectInvitation(id, reason);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Cancel invitation
export const cancelInvitation = createAsyncThunk(
  'invitations/cancelInvitation',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const data = await invitationService.cancelInvitation(id, reason);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// QR code thunks

// Get QR code
export const getQrCode = createAsyncThunk(
  'invitations/getQrCode',
  async (id, { rejectWithValue }) => {
    try {
      const data = await invitationService.getQrCode(id);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get QR code image
export const getInvitationQrCodeImage = createAsyncThunk(
  'invitations/getInvitationQrCodeImage',
  async ({ id, size = 300, branded = false }, { rejectWithValue }) => {
    try {
      console.log(id);
      // Get blob from API
      const blob = await invitationService.getQrImage(id, size, branded);

      // Convert blob → base64
      const base64Data = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result.split(',')[1]); // strip "data:image/png;base64,"
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });

      return base64Data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);


// Check-in/Check-out thunks

// Check in invitation
export const checkInInvitation = createAsyncThunk(
  'invitations/checkInInvitation',
  async ({ invitationReference, notes }, { rejectWithValue }) => {
    try {
      const data = await invitationService.checkInInvitation(invitationReference, notes);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Check out invitation
export const checkOutInvitation = createAsyncThunk(
  'invitations/checkOutInvitation',
  async ({ id, notes }, { rejectWithValue }) => {
    try {
      const data = await invitationService.checkOutInvitation(id, notes);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Special lists thunks

// Get pending approvals
export const getPendingApprovals = createAsyncThunk(
  'invitations/getPendingApprovals',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invitationService.getPendingApprovals();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get active invitations
export const getActiveInvitations = createAsyncThunk(
  'invitations/getActiveInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invitationService.getActiveInvitations();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get upcoming invitations
export const getUpcomingInvitations = createAsyncThunk(
  'invitations/getUpcomingInvitations',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invitationService.getUpcomingInvitations();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get templates
export const getInvitationTemplates = createAsyncThunk(
  'invitations/getInvitationTemplates',
  async (_, { rejectWithValue }) => {
    try {
      const data = await invitationService.getInvitationTemplates();
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get invitation statistics
export const getInvitationStatistics = createAsyncThunk(
  'invitations/getInvitationStatistics',
  async (params = {}, { rejectWithValue }) => {
    try {
      const data = await invitationService.getInvitationStatistics(params);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
// Invitations slice
const invitationsSlice = createSlice({
  name: 'invitations',
  initialState,
  reducers: {
    // Filter actions
    updateFilters: (state, action) => {
      state.filters = {
        ...state.filters,
        ...action.payload
      };
    },
    
    resetFilters: (state) => {
      state.filters = {
        searchTerm: '',
        status: null,
        type: null,
        hostId: null,
        visitorId: null,
        visitPurposeId: null,
        locationId: null,
        startDate: '',
        endDate: '',
        includeDeleted: false,
        pendingApprovalsOnly: false,
        activeOnly: false,
        expiredOnly: false,
        sortBy: 'ScheduledStartTime',
        sortDirection: 'desc'
      };
    },
    
    // Selection actions
    setSelectedInvitations: (state, action) => {
      state.selectedInvitations = action.payload;
    },
    
    toggleInvitationSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedInvitations.indexOf(id);
      if (index === -1) {
        state.selectedInvitations.push(id);
      } else {
        state.selectedInvitations.splice(index, 1);
      }
    },
    
    clearSelections: (state) => {
      state.selectedInvitations = [];
    },
    
    // Modal actions
    showCreateModal: (state) => {
      state.showCreateModal = true;
    },
    
    hideCreateModal: (state) => {
      state.showCreateModal = false;
      state.createError = null;
    },
    
    showEditModal: (state, action) => {
      state.showEditModal = true;
      state.currentInvitation = action.payload;
    },
    
    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentInvitation = null;
      state.updateError = null;
    },
    
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentInvitation = action.payload;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentInvitation = null;
      state.deleteError = null;
    },
    
    showDetailsModal: (state, action) => {
      state.showDetailsModal = true;
      state.currentInvitation = action.payload;
    },
    
    hideDetailsModal: (state) => {
      state.showDetailsModal = false;
      state.currentInvitation = null;
    },
    
    showApprovalModal: (state, action) => {
      state.showApprovalModal = true;
      state.currentInvitation = action.payload;
    },
    
    hideApprovalModal: (state) => {
      state.showApprovalModal = false;
      state.currentInvitation = null;
      state.approvalError = null;
    },
    
    showQrModal: (state, action) => {
      state.showQrModal = true;
      state.currentInvitation = action.payload;
    },
    
    hideQrModal: (state) => {
      state.showQrModal = false;
      state.currentInvitation = null;
      state.qrCodeData = null;
      state.qrError = null;
    },
    
    // Pagination actions
    setPageIndex: (state, action) => {
      state.pageIndex = action.payload;
    },
    
    setPageSize: (state, action) => {
      state.pageSize = action.payload;
      state.pageIndex = 0; // Reset to first page
    },
    
    // Error clearing
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.approvalError = null;
      state.qrError = null;
      state.checkInError = null;
    },
    
    // Set current invitation
    setCurrentInvitation: (state, action) => {
      state.currentInvitation = action.payload;
    },
    
    // Clear current invitation
    clearCurrentInvitation: (state) => {
      state.currentInvitation = null;
    },
    
    // Clear QR data
    clearQrData: (state) => {
      state.qrCodeData = null;
    }
  },
  
  extraReducers: (builder) => {
    // Get invitations
    builder
      .addCase(getInvitations.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getInvitations.fulfilled, (state, action) => {
        state.listLoading = false;
        const { data, params } = action.payload;
        
        state.list = data.items || data;
        state.total = data.totalCount || data.length || 0;
        state.pageIndex = (params.pageNumber || 1) - 1; // Convert to 0-based
        state.lastUpdated = Date.now();
        state.listError = null;
      })
      .addCase(getInvitations.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.list = [];
        state.total = 0;
      })
      
      // Get invitation by ID
      .addCase(getInvitationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getInvitationById.fulfilled, (state, action) => {
        state.loading = false;
        console.log(action.payload)
        state.currentInvitation = action.payload;
        state.error = null;
      })
      .addCase(getInvitationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentInvitation = null;
      })
      
      // Create invitation
      .addCase(createInvitation.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createInvitation.fulfilled, (state, action) => {
        state.createLoading = false;
        
        // Refresh the list after successful creation
        state.showCreateModal = false;
        state.createError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached special lists as they may be affected
        state.pendingApprovalsLastFetch = null;
        state.activeInvitationsLastFetch = null;
        state.upcomingInvitationsLastFetch = null;
        state.statisticsLastFetch = null;
      })
      .addCase(createInvitation.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Update invitation
      .addCase(updateInvitation.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateInvitation.fulfilled, (state, action) => {
        state.updateLoading = false;
        const updatedInvitation = action.payload;
        
        // Update in list
        const index = state.list.findIndex(invitation => invitation.id === updatedInvitation.id);
        if (index !== -1) {
          state.list[index] = updatedInvitation;
        }
        
        // Update current invitation if it's the same
        if (state.currentInvitation && state.currentInvitation.id === updatedInvitation.id) {
          state.currentInvitation = updatedInvitation;
        }
        
        state.showEditModal = false;
        state.updateError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached special lists
        state.pendingApprovalsLastFetch = null;
        state.activeInvitationsLastFetch = null;
        state.upcomingInvitationsLastFetch = null;
      })
      .addCase(updateInvitation.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete invitation
      .addCase(deleteInvitation.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteInvitation.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { id, permanentDelete } = action.payload;
        
        if (permanentDelete) {
          // Remove from list completely
          state.list = state.list.filter(invitation => invitation.id !== id);
          state.total = Math.max(0, state.total - 1);
        } else {
          // Mark as deleted (soft delete)
          const index = state.list.findIndex(invitation => invitation.id === id);
          if (index !== -1) {
            state.list[index].isDeleted = true;
            state.list[index].status = 'Cancelled';
          }
        }
        
        state.showDeleteModal = false;
        state.currentInvitation = null;
        state.deleteError = null;
        state.lastUpdated = Date.now();
        
        // Remove from selections if selected
        state.selectedInvitations = state.selectedInvitations.filter(selectedId => selectedId !== id);
        
        // Clear cached special lists
        state.pendingApprovalsLastFetch = null;
        state.activeInvitationsLastFetch = null;
        state.upcomingInvitationsLastFetch = null;
      })
      .addCase(deleteInvitation.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      
      // Submit invitation
      .addCase(submitInvitation.pending, (state) => {
        state.approvalLoading = true;
        state.approvalError = null;
      })
      .addCase(submitInvitation.fulfilled, (state, action) => {
        state.approvalLoading = false;
        const updatedInvitation = action.payload;
        
        // Update invitation status in list
        const index = state.list.findIndex(invitation => invitation.id === updatedInvitation.id);
        if (index !== -1) {
          state.list[index] = updatedInvitation;
        }
        
        // Update current invitation
        if (state.currentInvitation && state.currentInvitation.id === updatedInvitation.id) {
          state.currentInvitation = updatedInvitation;
        }
        
        state.approvalError = null;
        state.lastUpdated = Date.now();
        
        // Clear pending approvals cache
        state.pendingApprovalsLastFetch = null;
      })
      .addCase(submitInvitation.rejected, (state, action) => {
        state.approvalLoading = false;
        state.approvalError = action.payload;
      })
      
      // Approve invitation
      .addCase(approveInvitation.pending, (state) => {
        state.approvalLoading = true;
        state.approvalError = null;
      })
      .addCase(approveInvitation.fulfilled, (state, action) => {
        state.approvalLoading = false;
        const updatedInvitation = action.payload;
        
        // Update invitation status in list
        const index = state.list.findIndex(invitation => invitation.id === updatedInvitation.id);
        if (index !== -1) {
          state.list[index] = updatedInvitation;
        }
        
        // Update current invitation
        if (state.currentInvitation && state.currentInvitation.id === updatedInvitation.id) {
          state.currentInvitation = updatedInvitation;
        }
        
        state.showApprovalModal = false;
        state.approvalError = null;
        state.lastUpdated = Date.now();
        
        // Clear cached special lists
        state.pendingApprovalsLastFetch = null;
        state.activeInvitationsLastFetch = null;
        state.upcomingInvitationsLastFetch = null;
      })
      .addCase(approveInvitation.rejected, (state, action) => {
        state.approvalLoading = false;
        state.approvalError = action.payload;
      })
      
      // Similar patterns for reject and cancel...
      .addCase(rejectInvitation.pending, (state) => {
        state.approvalLoading = true;
        state.approvalError = null;
      })
      .addCase(rejectInvitation.fulfilled, (state, action) => {
        state.approvalLoading = false;
        const updatedInvitation = action.payload;
        
        const index = state.list.findIndex(invitation => invitation.id === updatedInvitation.id);
        if (index !== -1) {
          state.list[index] = updatedInvitation;
        }
        
        if (state.currentInvitation && state.currentInvitation.id === updatedInvitation.id) {
          state.currentInvitation = updatedInvitation;
        }
        
        state.showApprovalModal = false;
        state.approvalError = null;
        state.lastUpdated = Date.now();
        state.pendingApprovalsLastFetch = null;
      })
      .addCase(rejectInvitation.rejected, (state, action) => {
        state.approvalLoading = false;
        state.approvalError = action.payload;
      })
      
      // Cancel invitation
      .addCase(cancelInvitation.pending, (state) => {
        state.approvalLoading = true;
        state.approvalError = null;
      })
      .addCase(cancelInvitation.fulfilled, (state, action) => {
        state.approvalLoading = false;
        const updatedInvitation = action.payload;
        
        const index = state.list.findIndex(invitation => invitation.id === updatedInvitation.id);
        if (index !== -1) {
          state.list[index] = updatedInvitation;
        }
        
        if (state.currentInvitation && state.currentInvitation.id === updatedInvitation.id) {
          state.currentInvitation = updatedInvitation;
        }
        
        state.approvalError = null;
        state.lastUpdated = Date.now();
        state.activeInvitationsLastFetch = null;
        state.upcomingInvitationsLastFetch = null;
      })
      .addCase(cancelInvitation.rejected, (state, action) => {
        state.approvalLoading = false;
        state.approvalError = action.payload;
      })
      
      // QR code
      .addCase(getQrCode.pending, (state) => {
        state.qrLoading = true;
        state.qrError = null;
      })
      .addCase(getQrCode.fulfilled, (state, action) => {
        state.qrLoading = false;
        state.qrCodeData = action.payload;
        state.qrError = null;
      })
      .addCase(getQrCode.rejected, (state, action) => {
        state.qrLoading = false;
        state.qrError = action.payload;
        state.qrCodeData = null;
      })
      
      //QR Image
      .addCase(getInvitationQrCodeImage.pending, (state) => {
      state.qrLoading = true;
      state.qrError = null;
      })
      .addCase(getInvitationQrCodeImage.fulfilled, (state, action) => {
        state.qrLoading = false;
        state.qrCodeImage = action.payload; // base64 string
      })
      .addCase(getInvitationQrCodeImage.rejected, (state, action) => {
        state.qrLoading = false;
        state.qrError = action.payload || 'Failed to fetch QR code image';
      })
      
      // Check-in
      .addCase(checkInInvitation.pending, (state) => {
        state.checkInLoading = true;
        state.checkInError = null;
      })
      .addCase(checkInInvitation.fulfilled, (state, action) => {
        state.checkInLoading = false;
        state.checkInData = action.payload;
        state.checkInError = null;
        
        // Update invitation status if in list
        const updatedInvitation = action.payload;
        const index = state.list.findIndex(invitation => invitation.id === updatedInvitation.id);
        if (index !== -1) {
          state.list[index] = updatedInvitation;
        }
        
        state.lastUpdated = Date.now();
        state.activeInvitationsLastFetch = null;
      })
      .addCase(checkInInvitation.rejected, (state, action) => {
        state.checkInLoading = false;
        state.checkInError = action.payload;
      })
      
      // Check-out
      .addCase(checkOutInvitation.pending, (state) => {
        state.checkInLoading = true;
        state.checkInError = null;
      })
      .addCase(checkOutInvitation.fulfilled, (state, action) => {
        state.checkInLoading = false;
        const updatedInvitation = action.payload;
        
        const index = state.list.findIndex(invitation => invitation.id === updatedInvitation.id);
        if (index !== -1) {
          state.list[index] = updatedInvitation;
        }
        
        if (state.currentInvitation && state.currentInvitation.id === updatedInvitation.id) {
          state.currentInvitation = updatedInvitation;
        }
        
        state.checkInError = null;
        state.lastUpdated = Date.now();
        state.activeInvitationsLastFetch = null;
      })
      .addCase(checkOutInvitation.rejected, (state, action) => {
        state.checkInLoading = false;
        state.checkInError = action.payload;
      })
      
      // Pending approvals
      .addCase(getPendingApprovals.pending, (state) => {
        state.pendingApprovalsLoading = true;
        state.pendingApprovalsError = null;
      })
      .addCase(getPendingApprovals.fulfilled, (state, action) => {
        state.pendingApprovalsLoading = false;
        state.pendingApprovals = action.payload.items || action.payload;
        state.pendingApprovalsLastFetch = Date.now();
        state.pendingApprovalsError = null;
      })
      .addCase(getPendingApprovals.rejected, (state, action) => {
        state.pendingApprovalsLoading = false;
        state.pendingApprovalsError = action.payload;
      })
      
      // Active invitations
      .addCase(getActiveInvitations.pending, (state) => {
        state.activeInvitationsLoading = true;
        state.activeInvitationsError = null;
      })
      .addCase(getActiveInvitations.fulfilled, (state, action) => {
        state.activeInvitationsLoading = false;
        state.activeInvitations = action.payload.items || action.payload;
        state.activeInvitationsLastFetch = Date.now();
        state.activeInvitationsError = null;
      })
      .addCase(getActiveInvitations.rejected, (state, action) => {
        state.activeInvitationsLoading = false;
        state.activeInvitationsError = action.payload;
      })
      
      // Upcoming invitations
      .addCase(getUpcomingInvitations.pending, (state) => {
        state.upcomingInvitationsLoading = true;
        state.upcomingInvitationsError = null;
      })
      .addCase(getUpcomingInvitations.fulfilled, (state, action) => {
        state.upcomingInvitationsLoading = false;
        state.upcomingInvitations = action.payload.items || action.payload;
        state.upcomingInvitationsLastFetch = Date.now();
        state.upcomingInvitationsError = null;
      })
      .addCase(getUpcomingInvitations.rejected, (state, action) => {
        state.upcomingInvitationsLoading = false;
        state.upcomingInvitationsError = action.payload;
      })
      
      // Templates
      .addCase(getInvitationTemplates.pending, (state) => {
        state.templatesLoading = true;
        state.templatesError = null;
      })
      .addCase(getInvitationTemplates.fulfilled, (state, action) => {
        state.templatesLoading = false;
        state.templates = action.payload;
        state.templatesLastFetch = Date.now();
        state.templatesError = null;
      })
      .addCase(getInvitationTemplates.rejected, (state, action) => {
        state.templatesLoading = false;
        state.templatesError = action.payload;
      })

      // Statistics
      .addCase(getInvitationStatistics.pending, (state) => {
        state.statisticsLoading = true;
        state.statisticsError = null;
      })
      .addCase(getInvitationStatistics.fulfilled, (state, action) => {
        state.statisticsLoading = false;
        state.statistics = action.payload;
        state.statisticsLastFetch = Date.now();
        state.statisticsError = null;
      })
      .addCase(getInvitationStatistics.rejected, (state, action) => {
        state.statisticsLoading = false;
        state.statisticsError = action.payload;
      });
  }
});

// Export actions
export const {
  updateFilters,
  resetFilters,
  setSelectedInvitations,
  toggleInvitationSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  showDetailsModal,
  hideDetailsModal,
  showApprovalModal,
  hideApprovalModal,
  showQrModal,
  hideQrModal,
  setPageIndex,
  setPageSize,
  clearError,
  setCurrentInvitation,
  clearCurrentInvitation,
  clearQrData
} = invitationsSlice.actions;

// Export reducer
export default invitationsSlice.reducer;