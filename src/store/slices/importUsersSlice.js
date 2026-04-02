// src/store/slices/importUsersSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import importUsersService from '../../services/importUsersService';
import { handleApiError } from '../../services/errorService';

// ── Async thunks ─────────────────────────────────────────────────────────────

/**
 * Validates the uploaded file (dry-run) and returns row-level results.
 * This powers the Preview step (Step 3) of the wizard.
 */
export const validateImportFile = createAsyncThunk(
  'importUsers/validateFile',
  async (file, { rejectWithValue }) => {
    try {
      return await importUsersService.validateFile(file);
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

/**
 * Executes the actual import after the user clicks "Confirm Import".
 */
export const executeImport = createAsyncThunk(
  'importUsers/execute',
  async ({ file, skipInvalidRows }, { rejectWithValue }) => {
    try {
      return await importUsersService.importUsers(file, { skipInvalidRows, dryRun: false });
    } catch (err) {
      return rejectWithValue(handleApiError(err));
    }
  }
);

// ── Wizard steps ──────────────────────────────────────────────────────────────
// 1 = Download Template
// 2 = Upload File
// 3 = Preview & Fix
// 4 = Confirm
// 5 = Result

const initialState = {
  isOpen: false,
  step: 1,

  // Step 2 — selected file
  selectedFile: null,        // File object (not serializable — stored outside Redux normally,
                             // but kept here as a reference for the slice's thunks)
  selectedFileName: null,    // string — safe to serialize
  selectedFileSize: null,    // number

  // Step 3 — validation result from backend
  validationResult: null,    // ImportValidationResultDto
  validationLoading: false,
  validationError: null,

  // Derived from validationResult for UI
  validRows: [],
  invalidRows: [],

  // Step 4 — user's decision
  skipInvalidRows: true,     // If true, import valid rows even if some are invalid

  // Step 5 — import result
  importResult: null,        // ImportUsersResultDto
  importLoading: false,
  importError: null,
};

const importUsersSlice = createSlice({
  name: 'importUsers',
  initialState,

  reducers: {
    openImportModal(state) {
      Object.assign(state, initialState);
      state.isOpen = true;
      state.step = 1;
    },

    closeImportModal(state) {
      Object.assign(state, initialState);
    },

    goToStep(state, action) {
      state.step = action.payload;
    },

    goBack(state) {
      if (state.step > 1) state.step -= 1;
    },

    setSelectedFile(state, action) {
      const { name, size } = action.payload;
      state.selectedFileName = name;
      state.selectedFileSize = size;
      // Reset downstream state when a new file is chosen
      state.validationResult = null;
      state.validationError = null;
      state.validRows = [];
      state.invalidRows = [];
      state.importResult = null;
      state.importError = null;
    },

    clearSelectedFile(state) {
      state.selectedFileName = null;
      state.selectedFileSize = null;
      state.validationResult = null;
      state.validationError = null;
      state.validRows = [];
      state.invalidRows = [];
    },

    setSkipInvalidRows(state, action) {
      state.skipInvalidRows = action.payload;
    },

    clearValidationError(state) {
      state.validationError = null;
    },

    clearImportError(state) {
      state.importError = null;
    },
  },

  extraReducers: (builder) => {
    // ── validateImportFile ──────────────────────────────────────────────────
    builder
      .addCase(validateImportFile.pending, (state) => {
        state.validationLoading = true;
        state.validationError = null;
        state.validationResult = null;
        state.validRows = [];
        state.invalidRows = [];
      })
      .addCase(validateImportFile.fulfilled, (state, action) => {
        state.validationLoading = false;
        state.validationResult = action.payload;

        const rows = action.payload.rowResults ?? [];
        state.validRows   = rows.filter(r => !r.fieldErrors?.length && r.status !== 'skipped');
        state.invalidRows = rows.filter(r =>  r.fieldErrors?.length  || r.status === 'skipped');

        // Advance to preview step
        state.step = 3;
      })
      .addCase(validateImportFile.rejected, (state, action) => {
        state.validationLoading = false;
        state.validationError = action.payload ?? 'Failed to validate file.';
      });

    // ── executeImport ───────────────────────────────────────────────────────
    builder
      .addCase(executeImport.pending, (state) => {
        state.importLoading = true;
        state.importError = null;
        state.importResult = null;
      })
      .addCase(executeImport.fulfilled, (state, action) => {
        state.importLoading = false;
        state.importResult = action.payload;
        state.step = 5;
      })
      .addCase(executeImport.rejected, (state, action) => {
        state.importLoading = false;
        state.importError = action.payload ?? 'Import failed. Please try again.';
      });
  },
});

export const {
  openImportModal,
  closeImportModal,
  goToStep,
  goBack,
  setSelectedFile,
  clearSelectedFile,
  setSkipInvalidRows,
  clearValidationError,
  clearImportError,
} = importUsersSlice.actions;

export default importUsersSlice.reducer;

// ── Selectors ─────────────────────────────────────────────────────────────────

export const selectImportIsOpen        = (s) => s.importUsers.isOpen;
export const selectImportStep          = (s) => s.importUsers.step;
export const selectImportFileName      = (s) => s.importUsers.selectedFileName;
export const selectImportFileSize      = (s) => s.importUsers.selectedFileSize;
export const selectValidationResult    = (s) => s.importUsers.validationResult;
export const selectValidationLoading   = (s) => s.importUsers.validationLoading;
export const selectValidationError     = (s) => s.importUsers.validationError;
export const selectValidRows           = (s) => s.importUsers.validRows;
export const selectInvalidRows         = (s) => s.importUsers.invalidRows;
export const selectSkipInvalidRows     = (s) => s.importUsers.skipInvalidRows;
export const selectImportResult        = (s) => s.importUsers.importResult;
export const selectImportLoading       = (s) => s.importUsers.importLoading;
export const selectImportError         = (s) => s.importUsers.importError;
