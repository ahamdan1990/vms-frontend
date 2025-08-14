import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import emergencyContactService from '../../services/emergencyContactService';
import { handleApiError } from '../../services/errorService';

// Initial state
const initialState = {
  // Contact list for current visitor
  list: [],
  total: 0,
  currentVisitorId: null,
  
  // Current contact being viewed/edited
  currentContact: null,
  
  // Loading states
  loading: false,
  listLoading: false,
  createLoading: false,
  updateLoading: false,
  deleteLoading: false,
  
  // Error states
  error: null,
  listError: null,
  createError: null,
  updateError: null,
  deleteError: null,
  
  // UI state
  showCreateModal: false,
  showEditModal: false,
  showDeleteModal: false,
  
  // Selection state (for bulk operations)
  selectedContacts: [],
  
  // Last updated timestamp
  lastUpdated: null
};

// Async thunks for emergency contact operations

// Get emergency contacts for a visitor
export const getEmergencyContacts = createAsyncThunk(
  'emergencyContacts/getEmergencyContacts',
  async ({ visitorId, includeDeleted = false }, { rejectWithValue }) => {
    try {
      const data = await emergencyContactService.getEmergencyContacts(visitorId, includeDeleted);
      return { data, visitorId };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get emergency contact by ID
export const getEmergencyContactById = createAsyncThunk(
  'emergencyContacts/getEmergencyContactById',
  async ({ visitorId, contactId, includeDeleted = false }, { rejectWithValue }) => {
    try {
      const data = await emergencyContactService.getEmergencyContactById(visitorId, contactId, includeDeleted);
      return data;
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Create new emergency contact
export const createEmergencyContact = createAsyncThunk(
  'emergencyContacts/createEmergencyContact',
  async ({ visitorId, contactData }, { rejectWithValue }) => {
    try {
      const data = await emergencyContactService.createEmergencyContact(visitorId, contactData);
      return { data, visitorId };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Update existing emergency contact
export const updateEmergencyContact = createAsyncThunk(
  'emergencyContacts/updateEmergencyContact',
  async ({ visitorId, contactId, contactData }, { rejectWithValue }) => {
    try {
      const data = await emergencyContactService.updateEmergencyContact(visitorId, contactId, contactData);
      return { data, visitorId };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Delete emergency contact
export const deleteEmergencyContact = createAsyncThunk(
  'emergencyContacts/deleteEmergencyContact',
  async ({ visitorId, contactId, permanentDelete = false }, { rejectWithValue }) => {
    try {
      await emergencyContactService.deleteEmergencyContact(visitorId, contactId, permanentDelete);
      return { contactId, visitorId, permanentDelete };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);

// Get primary emergency contact
export const getPrimaryEmergencyContact = createAsyncThunk(
  'emergencyContacts/getPrimaryEmergencyContact',
  async (visitorId, { rejectWithValue }) => {
    try {
      const data = await emergencyContactService.getPrimaryEmergencyContact(visitorId);
      return { data, visitorId };
    } catch (error) {
      const errorMessage = handleApiError(error);
      return rejectWithValue(errorMessage);
    }
  }
);
// Emergency Contacts slice
const emergencyContactsSlice = createSlice({
  name: 'emergencyContacts',
  initialState,
  reducers: {
    // Selection actions
    setSelectedContacts: (state, action) => {
      state.selectedContacts = action.payload;
    },
    
    toggleContactSelection: (state, action) => {
      const id = action.payload;
      const index = state.selectedContacts.indexOf(id);
      if (index === -1) {
        state.selectedContacts.push(id);
      } else {
        state.selectedContacts.splice(index, 1);
      }
    },
    
    clearSelections: (state) => {
      state.selectedContacts = [];
    },
    
    // Modal actions
    showCreateModal: (state) => {
      state.showCreateModal = true;
    },
    
    hideCreateModal: (state) => {
      state.showCreateModal = false;
    },
    
    showEditModal: (state, action) => {
      state.showEditModal = true;
      state.currentContact = action.payload;
    },
    
    hideEditModal: (state) => {
      state.showEditModal = false;
      state.currentContact = null;
    },
    
    showDeleteModal: (state, action) => {
      state.showDeleteModal = true;
      state.currentContact = action.payload;
    },
    
    hideDeleteModal: (state) => {
      state.showDeleteModal = false;
      state.currentContact = null;
    },
    
    // Error clearing
    clearError: (state) => {
      state.error = null;
      state.listError = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    
    // Set current contact
    setCurrentContact: (state, action) => {
      state.currentContact = action.payload;
    },
    
    // Clear current contact
    clearCurrentContact: (state) => {
      state.currentContact = null;
    },
    
    // Clear all data (when switching visitors)
    clearContactData: (state) => {
      state.list = [];
      state.total = 0;
      state.currentVisitorId = null;
      state.currentContact = null;
      state.selectedContacts = [];
      state.lastUpdated = null;
    }
  },
  
  extraReducers: (builder) => {
    // Get emergency contacts
    builder
      .addCase(getEmergencyContacts.pending, (state) => {
        state.listLoading = true;
        state.listError = null;
      })
      .addCase(getEmergencyContacts.fulfilled, (state, action) => {
        state.listLoading = false;
        const { data, visitorId } = action.payload;
        
        state.list = data || [];
        state.total = data?.length || 0;
        state.currentVisitorId = visitorId;
        state.lastUpdated = Date.now();
        state.listError = null;
      })
      .addCase(getEmergencyContacts.rejected, (state, action) => {
        state.listLoading = false;
        state.listError = action.payload;
        state.list = [];
        state.total = 0;
      })
      
      // Get emergency contact by ID
      .addCase(getEmergencyContactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getEmergencyContactById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentContact = action.payload;
        state.error = null;
      })
      .addCase(getEmergencyContactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentContact = null;
      })
      
      // Create emergency contact
      .addCase(createEmergencyContact.pending, (state) => {
        state.createLoading = true;
        state.createError = null;
      })
      .addCase(createEmergencyContact.fulfilled, (state, action) => {
        state.createLoading = false;
        const { data, visitorId } = action.payload;
        
        // Add to list
        state.list.push(data);
        state.total += 1;
        
        // If this is marked as primary, unmark others
        if (data.isPrimary) {
          state.list.forEach(contact => {
            if (contact.id !== data.id) {
              contact.isPrimary = false;
            }
          });
        }
        
        state.showCreateModal = false;
        state.createError = null;
        state.lastUpdated = Date.now();
      })
      .addCase(createEmergencyContact.rejected, (state, action) => {
        state.createLoading = false;
        state.createError = action.payload;
      })
      
      // Update emergency contact
      .addCase(updateEmergencyContact.pending, (state) => {
        state.updateLoading = true;
        state.updateError = null;
      })
      .addCase(updateEmergencyContact.fulfilled, (state, action) => {
        state.updateLoading = false;
        const { data } = action.payload;
        
        // Update in list
        const index = state.list.findIndex(contact => contact.id === data.id);
        if (index !== -1) {
          state.list[index] = data;
        }
        
        // If this is marked as primary, unmark others
        if (data.isPrimary) {
          state.list.forEach(contact => {
            if (contact.id !== data.id) {
              contact.isPrimary = false;
            }
          });
        }
        
        // Update current contact if it's the same
        if (state.currentContact && state.currentContact.id === data.id) {
          state.currentContact = data;
        }
        
        state.showEditModal = false;
        state.updateError = null;
        state.lastUpdated = Date.now();
      })
      .addCase(updateEmergencyContact.rejected, (state, action) => {
        state.updateLoading = false;
        state.updateError = action.payload;
      })
      
      // Delete emergency contact
      .addCase(deleteEmergencyContact.pending, (state) => {
        state.deleteLoading = true;
        state.deleteError = null;
      })
      .addCase(deleteEmergencyContact.fulfilled, (state, action) => {
        state.deleteLoading = false;
        const { contactId, permanentDelete } = action.payload;
        
        if (permanentDelete) {
          // Remove from list completely
          state.list = state.list.filter(contact => contact.id !== contactId);
          state.total -= 1;
        } else {
          // Mark as inactive (soft delete)
          const index = state.list.findIndex(contact => contact.id === contactId);
          if (index !== -1) {
            state.list[index].isActive = false;
          }
        }
        
        state.showDeleteModal = false;
        state.currentContact = null;
        state.deleteError = null;
        state.lastUpdated = Date.now();
        
        // Remove from selections if selected
        state.selectedContacts = state.selectedContacts.filter(selectedId => selectedId !== contactId);
      })
      .addCase(deleteEmergencyContact.rejected, (state, action) => {
        state.deleteLoading = false;
        state.deleteError = action.payload;
      })
      
      // Get primary emergency contact
      .addCase(getPrimaryEmergencyContact.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrimaryEmergencyContact.fulfilled, (state, action) => {
        state.loading = false;
        const { data } = action.payload;
        state.currentContact = data;
        state.error = null;
      })
      .addCase(getPrimaryEmergencyContact.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.currentContact = null;
      });
  }
});

// Export actions
export const {
  setSelectedContacts,
  toggleContactSelection,
  clearSelections,
  showCreateModal,
  hideCreateModal,
  showEditModal,
  hideEditModal,
  showDeleteModal,
  hideDeleteModal,
  clearError,
  setCurrentContact,
  clearCurrentContact,
  clearContactData
} = emergencyContactsSlice.actions;

// Export reducer
export default emergencyContactsSlice.reducer;