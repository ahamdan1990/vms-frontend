import { useState, useEffect } from 'react';
import visitorDocumentService from '../../services/visitorDocumentService';
import Button from '../common/Button/Button';
import Modal from '../common/Modal/Modal';

/**
 * DocumentPreview Component
 * Displays document preview based on file type (images, PDFs, etc.)
 *
 * @param {Object} props
 * @param {number} props.visitorId - Visitor ID
 * @param {Object} props.document - Document object with id, fileName, mimeType
 * @param {boolean} props.isOpen - Modal open state
 * @param {Function} props.onClose - Close handler
 */
const DocumentPreview = ({ visitorId, document, isOpen, onClose }) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && document) {
      loadPreview();
    }

    // Cleanup blob URL on unmount
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, document]);

  const loadPreview = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Get preview blob
      const blob = await visitorDocumentService.previewVisitorDocument(visitorId, document.id);
      const url = URL.createObjectURL(blob);
      setPreviewUrl(url);
    } catch (err) {
      console.error('Failed to load document preview:', err);
      setError('Failed to load document preview');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await visitorDocumentService.downloadVisitorDocument(visitorId, document.id);
      const url = URL.createObjectURL(blob);
      // Use window.document to avoid conflict with 'document' prop
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalFileName || document.fileName || 'document';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download document:', err);
      setError('Failed to download document');
    }
  };

  const getFileExtension = (fileName) => {
    return fileName?.split('.').pop().toLowerCase();
  };

  const isImage = (mimeType, fileName) => {
    return mimeType?.startsWith('image/') ||
           ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'tiff', 'webp'].includes(getFileExtension(fileName));
  };

  const isPDF = (mimeType, fileName) => {
    return mimeType === 'application/pdf' || getFileExtension(fileName) === 'pdf';
  };

  const isPreviewable = (mimeType, fileName) => {
    return isImage(mimeType, fileName) || isPDF(mimeType, fileName);
  };

  const renderPreview = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (error) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-red-600">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-medium">{error}</p>
          <Button onClick={loadPreview} variant="secondary" className="mt-4">
            Try Again
          </Button>
        </div>
      );
    }

    const fileName = document.originalFileName || document.fileName;
    const mimeType = document.mimeType || document.contentType;

    if (!isPreviewable(mimeType, fileName)) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-600">
          <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-lg font-medium mb-2">Preview not available</p>
          <p className="text-sm text-gray-500 mb-4">
            This file type cannot be previewed in the browser
          </p>
          <Button onClick={handleDownload}>
            Download to View
          </Button>
        </div>
      );
    }

    if (isImage(mimeType, fileName)) {
      return (
        <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 min-h-96 p-4">
          <img
            src={previewUrl}
            alt={fileName}
            className="max-w-full max-h-[70vh] object-contain rounded shadow-lg"
            onError={() => setError('Failed to load image')}
          />
        </div>
      );
    }

    if (isPDF(mimeType, fileName)) {
      return (
        <div className="w-full h-[70vh]">
          <iframe
            src={previewUrl}
            title={fileName}
            className="w-full h-full border-0 rounded"
            onError={() => setError('Failed to load PDF')}
          />
        </div>
      );
    }

    return null;
  };

  if (!document) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={document.title || document.originalFileName || 'Document Preview'}
      size="xl"
    >
      <div className="space-y-4">
        {/* Document Info */}
        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">File Name:</span>
              <p className="text-gray-900 dark:text-white">{document.originalFileName || document.fileName}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Type:</span>
              <p className="text-gray-900 dark:text-white">{document.documentType}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Size:</span>
              <p className="text-gray-900 dark:text-white">{document.formattedFileSize || 'Unknown'}</p>
            </div>
            <div>
              <span className="font-medium text-gray-700 dark:text-gray-300">Uploaded:</span>
              <p className="text-gray-900 dark:text-white">
                {document.createdAt ? new Date(document.createdAt).toLocaleDateString() : 'Unknown'}
              </p>
            </div>
          </div>
          {document.description && (
            <div className="mt-3">
              <span className="font-medium text-gray-700 dark:text-gray-300">Description:</span>
              <p className="text-gray-900 dark:text-white mt-1">{document.description}</p>
            </div>
          )}
        </div>

        {/* Preview Area */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          {renderPreview()}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button onClick={onClose} variant="secondary">
            Close
          </Button>
          <Button onClick={handleDownload}>
            Download
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default DocumentPreview;
