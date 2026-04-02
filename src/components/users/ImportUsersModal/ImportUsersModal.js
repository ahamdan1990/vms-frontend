// src/components/users/ImportUsersModal/ImportUsersModal.js
import React, { useRef, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  ArrowDownTrayIcon,
  ArrowUpTrayIcon,
  DocumentCheckIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

import {
  closeImportModal,
  goToStep,
  goBack,
  setSelectedFile,
  clearSelectedFile,
  setSkipInvalidRows,
  validateImportFile,
  executeImport,
  selectImportStep,
  selectImportFileName,
  selectImportFileSize,
  selectValidationResult,
  selectValidationLoading,
  selectValidationError,
  selectValidRows,
  selectInvalidRows,
  selectSkipInvalidRows,
  selectImportResult,
  selectImportLoading,
  selectImportError,
} from '../../../store/slices/importUsersSlice';

import { getUsers, getUserStats } from '../../../store/slices/usersSlice';
import importUsersService from '../../../services/importUsersService';
import ImportPreviewTable from './ImportPreviewTable';
import { useToast } from '../../../hooks/useNotifications';

// ── Step indicator ────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Template' },
  { number: 2, label: 'Upload' },
  { number: 3, label: 'Preview' },
  { number: 4, label: 'Confirm' },
  { number: 5, label: 'Result' },
];

const StepIndicator = ({ currentStep }) => (
  <div className="flex items-center gap-0 mb-6">
    {STEPS.map((s, i) => {
      const done    = currentStep > s.number;
      const active  = currentStep === s.number;

      return (
        <React.Fragment key={s.number}>
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors
              ${done   ? 'bg-green-500 text-white'
              : active ? 'bg-blue-600 text-white'
              :          'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
              {done ? <CheckCircleSolid className="h-4 w-4" /> : s.number}
            </div>
            <span className={`text-xs font-medium ${active ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`flex-1 h-0.5 mx-1 mb-4 transition-colors
              ${currentStep > s.number ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-700'}`} />
          )}
        </React.Fragment>
      );
    })}
  </div>
);

// ── Main modal ────────────────────────────────────────────────────────────────

const ImportUsersModal = () => {
  const dispatch  = useDispatch();
  const toast     = useToast();
  const fileRef   = useRef(null);

  // File object is kept in a ref (not serializable for Redux)
  const fileObjectRef = useRef(null);

  const step             = useSelector(selectImportStep);
  const fileName         = useSelector(selectImportFileName);
  const fileSize         = useSelector(selectImportFileSize);
  const validationResult = useSelector(selectValidationResult);
  const validationLoading= useSelector(selectValidationLoading);
  const validationError  = useSelector(selectValidationError);
  const validRows        = useSelector(selectValidRows);
  const invalidRows      = useSelector(selectInvalidRows);
  const skipInvalidRows  = useSelector(selectSkipInvalidRows);
  const importResult     = useSelector(selectImportResult);
  const importLoading    = useSelector(selectImportLoading);
  const importError      = useSelector(selectImportError);

  const handleClose = () => dispatch(closeImportModal());

  // ── Step 2: File selection ────────────────────────────────────────────────

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const localCheck = importUsersService.validateFileLocally(file);
    if (!localCheck.isValid) {
      toast.error(localCheck.errors.join(' '));
      return;
    }

    fileObjectRef.current = file;
    dispatch(setSelectedFile({ name: file.name, size: file.size }));
  }, [dispatch, toast]);

  const handleFileDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const localCheck = importUsersService.validateFileLocally(file);
    if (!localCheck.isValid) {
      toast.error(localCheck.errors.join(' '));
      return;
    }

    fileObjectRef.current = file;
    dispatch(setSelectedFile({ name: file.name, size: file.size }));
  }, [dispatch, toast]);

  const handleRemoveFile = () => {
    fileObjectRef.current = null;
    if (fileRef.current) fileRef.current.value = '';
    dispatch(clearSelectedFile());
  };

  // ── Step 2 → 3: Validate ─────────────────────────────────────────────────

  const handleValidate = async () => {
    if (!fileObjectRef.current) {
      toast.error('Please select a file first.');
      return;
    }
    dispatch(validateImportFile(fileObjectRef.current));
  };

  // ── Step 4 → 5: Import ───────────────────────────────────────────────────

  const handleConfirmImport = async () => {
    if (!fileObjectRef.current) {
      toast.error('File reference lost. Please re-upload the file.');
      dispatch(goToStep(2));
      return;
    }

    const result = await dispatch(executeImport({
      file: fileObjectRef.current,
      skipInvalidRows,
    }));

    if (executeImport.fulfilled.match(result)) {
      const { createdCount } = result.payload;
      toast.success(`Import complete — ${createdCount} user(s) created.`);
      // Refresh user list
      dispatch(getUsers());
      dispatch(getUserStats());
    }
  };

  // ── Download handlers ─────────────────────────────────────────────────────

  const handleDownloadTemplate = (format) => {
    importUsersService.downloadTemplate(format).catch(() =>
      toast.error('Failed to download template.')
    );
  };

  const handleDownloadErrorReport = () => {
    if (!validationResult?.rowResults) return;
    importUsersService.downloadErrorReport(
      validationResult.rowResults,
      fileName?.replace(/\.\w+$/, '') ?? 'import'
    );
  };

  const handleDownloadImportErrorReport = () => {
    if (!importResult?.results) return;
    importUsersService.downloadErrorReport(
      importResult.results,
      'import-result'
    );
  };

  // ── Role breakdown for confirm screen ────────────────────────────────────

  const roleBreakdown = validRows.reduce((acc, r) => {
    const role = r.role || 'Unknown';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});

  const welcomeEmailCount = validRows.length; // All valid rows get welcome email by default

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="relative min-h-full flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-4xl"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Import Users
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                Bulk-create users from an Excel or CSV file
              </p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            <StepIndicator currentStep={step} />

            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >

                {/* ── Step 1: Download Template ── */}
                {step === 1 && (
                  <div className="space-y-5">
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                      <h3 className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">
                        Before you start
                      </h3>
                      <p className="text-sm text-blue-700 dark:text-blue-400">
                        Download the template, fill in your users, then upload the file in the next step.
                        The template includes dropdown validation and an example row to guide you.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <TemplateCard
                        title="Excel Template (.xlsx)"
                        description="Recommended. Includes dropdown validation, example row, and an Instructions sheet."
                        icon="📊"
                        onDownload={() => handleDownloadTemplate('xlsx')}
                      />
                      <TemplateCard
                        title="CSV Template (.csv)"
                        description="Simple plain-text format. Open in Excel, Google Sheets, or any text editor."
                        icon="📄"
                        onDownload={() => handleDownloadTemplate('csv')}
                      />
                    </div>

                    <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1.5">
                      <p className="font-medium text-gray-800 dark:text-gray-200">Required columns:</p>
                      <div className="flex flex-wrap gap-2">
                        {['FirstName', 'LastName', 'Email', 'Role', 'Status'].map(col => (
                          <span key={col} className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs rounded font-mono">
                            {col}
                          </span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                        Maximum 500 rows per file · Maximum 5 MB · .xlsx or .csv only
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Step 2: Upload File ── */}
                {step === 2 && (
                  <div className="space-y-4">
                    {/* Drop zone */}
                    <div
                      onDragOver={e => e.preventDefault()}
                      onDrop={handleFileDrop}
                      onClick={() => fileRef.current?.click()}
                      className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                        ${fileName
                          ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-900/10'
                          : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                        }`}
                    >
                      <input
                        ref={fileRef}
                        type="file"
                        accept=".xlsx,.csv"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {fileName ? (
                        <div className="space-y-2">
                          <CheckCircleIcon className="h-10 w-10 text-green-500 mx-auto" />
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{fileName}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {(fileSize / 1024).toFixed(1)} KB
                          </p>
                          <button
                            onClick={e => { e.stopPropagation(); handleRemoveFile(); }}
                            className="text-xs text-red-500 hover:text-red-700 underline"
                          >
                            Remove file
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <ArrowUpTrayIcon className="h-10 w-10 text-gray-400 mx-auto" />
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Drag & drop your file here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Accepts .xlsx and .csv · Max 5 MB · Max 500 rows
                          </p>
                        </div>
                      )}
                    </div>

                    {validationError && (
                      <ErrorAlert message={typeof validationError === 'string' ? validationError : JSON.stringify(validationError)} />
                    )}
                  </div>
                )}

                {/* ── Step 3: Preview & Fix ── */}
                {step === 3 && validationResult && (
                  <div className="space-y-4">
                    {invalidRows.length > 0 && (
                      <div className="flex items-start gap-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                        <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-yellow-800 dark:text-yellow-300">
                          <p className="font-medium">{invalidRows.length} row(s) have errors.</p>
                          <p className="mt-0.5">
                            You can fix the file and re-upload, or proceed importing only the {validRows.length} valid rows.
                          </p>
                          {invalidRows.length > 0 && (
                            <button
                              onClick={handleDownloadErrorReport}
                              className="mt-1.5 text-yellow-700 dark:text-yellow-400 underline text-xs font-medium"
                            >
                              ↓ Download error report
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    <ImportPreviewTable
                      rows={validationResult.rowResults ?? []}
                      validCount={validRows.length}
                      invalidCount={invalidRows.length}
                    />

                    {invalidRows.length > 0 && (
                      <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={skipInvalidRows}
                          onChange={e => dispatch(setSkipInvalidRows(e.target.checked))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700 dark:text-gray-300">
                          Skip invalid rows and import only the {validRows.length} valid row(s)
                        </span>
                      </label>
                    )}
                  </div>
                )}

                {/* ── Step 4: Confirm ── */}
                {step === 4 && (
                  <div className="space-y-5">
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-5 space-y-4">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                        Import summary
                      </h3>

                      <div className="flex items-center gap-3">
                        <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                          {validRows.length}
                        </span>
                        <span className="text-gray-600 dark:text-gray-400 text-sm">
                          users will be created
                        </span>
                      </div>

                      {/* Role breakdown */}
                      <div>
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
                          Role breakdown
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(roleBreakdown).map(([role, count]) => (
                            <span key={role} className="px-3 py-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full text-sm">
                              <span className="font-medium">{role}:</span> {count}
                            </span>
                          ))}
                        </div>
                      </div>

                      {invalidRows.length > 0 && skipInvalidRows && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          <span className="text-yellow-600 dark:text-yellow-400 font-medium">⚠ {invalidRows.length} row(s)</span> with errors will be skipped.
                        </p>
                      )}
                    </div>

                    {/* Warnings */}
                    <div className="space-y-2">
                      {welcomeEmailCount > 0 && (
                        <WarningLine icon="📧">
                          Welcome emails will be sent to <strong>{welcomeEmailCount}</strong> address(es) immediately after import.
                        </WarningLine>
                      )}
                      <WarningLine icon="🔑">
                        Users will receive a temporary password and will be required to change it on first login.
                      </WarningLine>
                      <WarningLine icon="✅">
                        This action cannot be undone. Imported users will be active in the system immediately.
                      </WarningLine>
                    </div>

                    {importError && (
                      <ErrorAlert message={typeof importError === 'string' ? importError : 'Import failed. Please try again.'} />
                    )}
                  </div>
                )}

                {/* ── Step 5: Result ── */}
                {step === 5 && importResult && (
                  <div className="space-y-5">
                    <div className="text-center py-4">
                      {importResult.createdCount === importResult.totalRows - importResult.skippedCount ? (
                        <CheckCircleIcon className="h-14 w-14 text-green-500 mx-auto mb-3" />
                      ) : (
                        <ExclamationTriangleIcon className="h-14 w-14 text-yellow-500 mx-auto mb-3" />
                      )}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Import Complete
                      </h3>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-center">
                      <ResultStat label="Created" value={importResult.createdCount} color="green" />
                      <ResultStat label="Skipped" value={importResult.skippedCount} color="yellow" />
                      <ResultStat label="Failed"  value={importResult.failedCount}  color="red" />
                    </div>

                    {(importResult.failedCount > 0 || importResult.skippedCount > 0) && (
                      <div className="text-center">
                        <button
                          onClick={handleDownloadImportErrorReport}
                          className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          <ArrowDownTrayIcon className="h-4 w-4" />
                          Download error report (CSV)
                        </button>
                      </div>
                    )}
                  </div>
                )}

              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-xl">
            {/* Left: back/cancel */}
            <div className="flex gap-2">
              {step > 1 && step < 5 && (
                <button
                  onClick={() => dispatch(goBack())}
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <ArrowLeftIcon className="h-4 w-4" />
                  Back
                </button>
              )}
              {step < 5 && (
                <button
                  onClick={handleClose}
                  className="px-3 py-2 text-sm text-gray-600 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>

            {/* Right: primary action */}
            <div>
              {step === 1 && (
                <button
                  onClick={() => dispatch(goToStep(2))}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Next: Upload File →
                </button>
              )}

              {step === 2 && (
                <button
                  onClick={handleValidate}
                  disabled={!fileName || validationLoading}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {validationLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Validating…
                    </>
                  ) : (
                    <>
                      <DocumentCheckIcon className="h-4 w-4" />
                      Validate & Preview →
                    </>
                  )}
                </button>
              )}

              {step === 3 && (
                <button
                  onClick={() => dispatch(goToStep(4))}
                  disabled={validRows.length === 0}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {validRows.length === 0
                    ? 'No valid rows to import'
                    : `Proceed to Confirm (${validRows.length} rows) →`}
                </button>
              )}

              {step === 4 && (
                <button
                  onClick={handleConfirmImport}
                  disabled={importLoading || validRows.length === 0}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                >
                  {importLoading ? (
                    <>
                      <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Importing…
                    </>
                  ) : (
                    `Confirm Import (${validRows.length} users)`
                  )}
                </button>
              )}

              {step === 5 && (
                <button
                  onClick={handleClose}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

// ── Helper sub-components ─────────────────────────────────────────────────────

const TemplateCard = ({ title, description, icon, onDownload }) => (
  <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-4 hover:border-blue-400 dark:hover:border-blue-600 transition-colors">
    <div className="text-2xl mb-2">{icon}</div>
    <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-1">{title}</h4>
    <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{description}</p>
    <button
      onClick={onDownload}
      className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:underline font-medium"
    >
      <ArrowDownTrayIcon className="h-4 w-4" />
      Download
    </button>
  </div>
);

const ErrorAlert = ({ message }) => (
  <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-sm text-red-700 dark:text-red-400">
    <XMarkIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
    {message}
  </div>
);

const WarningLine = ({ icon, children }) => (
  <div className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
    <span className="flex-shrink-0">{icon}</span>
    <span>{children}</span>
  </div>
);

const ResultStat = ({ label, value, color }) => {
  const colors = {
    green:  'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red:    'text-red-600 dark:text-red-400',
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4">
      <div className={`text-3xl font-bold ${colors[color]}`}>{value}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</div>
    </div>
  );
};

export default ImportUsersModal;
