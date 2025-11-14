import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import Button from '../common/Button/Button';

/**
 * Export Button Component for Reports
 * Reusable button with export functionality and loading states
 */
const ExportButton = ({
  onExport,
  loading = false,
  disabled = false,
  label = 'Export CSV',
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onExport}
      disabled={disabled || loading}
      loading={loading}
      icon={<ArrowDownTrayIcon className="w-5 h-5" />}
      iconPosition="left"
      className={classNames('gap-2', className)}
      {...props}
    >
      {loading ? 'Exporting...' : label}
    </Button>
  );
};

ExportButton.propTypes = {
  onExport: PropTypes.func.isRequired,
  loading: PropTypes.bool,
  disabled: PropTypes.bool,
  label: PropTypes.string,
  variant: PropTypes.oneOf(['primary', 'secondary', 'success', 'danger', 'warning', 'ghost']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string
};

export default ExportButton;
