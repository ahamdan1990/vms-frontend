import { useState, useCallback, useEffect } from 'react';
import companyService from '../../../services/companyService';
import { BuildingOfficeIcon, PlusIcon } from '@heroicons/react/24/outline';

const CompanyAutocomplete = ({
  value,
  onChange,
  onCreateNew,
  label = 'Company',
  placeholder = 'Search for a company...',
  required = false,
  disabled = false,
  error = null,
  showCreateOption = true,
  className = ''
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  
  // Initialize display value
  useEffect(() => {
    if (value && typeof value === 'object' && value.name) {
      setSearchTerm(value.name);
    } else if (value && typeof value === 'string') {
      setSearchTerm(value);
    } else {
      setSearchTerm('');
    }
  }, [value]);

  // Debounced search
  useEffect(() => {
    if (!searchTerm || searchTerm.length < 2) {
      console.log('🔍 [CompanyAutocomplete] Search term too short or empty:', searchTerm);
      setCompanies([]);
      return;
    }

    console.log('🔍 [CompanyAutocomplete] Starting search for:', searchTerm);

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        console.log('🔍 [CompanyAutocomplete] Calling API with searchTerm:', searchTerm);
        const results = await companyService.searchCompanies(searchTerm, 'All', 10);
        console.log('✅ [CompanyAutocomplete] API returned results:', results);

        // Extract companies array from the result object
        let companiesArray = [];
        if (Array.isArray(results)) {
          companiesArray = results;
          console.log('✅ [CompanyAutocomplete] Result is array, using directly');
        } else if (results && Array.isArray(results.companies)) {
          companiesArray = results.companies;
          console.log('✅ [CompanyAutocomplete] Using results.companies');
        } else if (results && Array.isArray(results.data)) {
          companiesArray = results.data;
          console.log('✅ [CompanyAutocomplete] Using results.data');
        }

        console.log('✅ [CompanyAutocomplete] Final companies array:', companiesArray);
        console.log('✅ [CompanyAutocomplete] Companies count:', companiesArray.length);
        setCompanies(companiesArray);
      } catch (error) {
        console.error('❌ [CompanyAutocomplete] Error searching companies:', error);
        console.error('❌ [CompanyAutocomplete] Error details:', error.response?.data || error.message);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    setSearchTerm(newValue);
    setIsOpen(true);
    setHighlightedIndex(-1);
  };

  const handleSelectCompany = (company) => {
    setSearchTerm(company.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(company);
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    if (onCreateNew) {
      onCreateNew(searchTerm);
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setIsOpen(false);
    setHighlightedIndex(-1);
    onChange(null);
  };

  const handleKeyDown = (e) => {
    const itemsCount = companies.length + (showCreateOption && searchTerm ? 1 : 0);

    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      setHighlightedIndex(0);
      e.preventDefault();
      return;
    }

    if (!isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => (prev < itemsCount - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : itemsCount - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          if (highlightedIndex < companies.length) {
            handleSelectCompany(companies[highlightedIndex]);
          } else if (showCreateOption && searchTerm) {
            handleCreateNew();
          }
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
      default:
        break;
    }
  };

  const handleBlur = () => {
    setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 200);
  };

  return (
    <div className={`relative ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => setIsOpen(true)}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            block w-full pl-10 pr-10 py-2
            border rounded-lg
            bg-white dark:bg-gray-800
            text-gray-900 dark:text-white
            placeholder-gray-400 dark:placeholder-gray-500
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
            disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
            ${error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 dark:border-gray-600'}
          `}
        />

        {searchTerm && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}

        {/* Dropdown */}
        {isOpen && searchTerm && searchTerm.length >= 2 && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-64 overflow-auto">
            {loading ? (
              <div className="px-4 py-3 text-center text-gray-500 dark:text-gray-400">
                <div className="inline-block w-5 h-5 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
                <span className="ml-2">Searching...</span>
              </div>
            ) : (
              <>
                {companies.length > 0 ? (
                  <>
                    {companies.map((company, index) => (
                      <button
                        key={company.id}
                        type="button"
                        onClick={() => handleSelectCompany(company)}
                        className={`
                          w-full px-4 py-3 text-left
                          hover:bg-gray-50 dark:hover:bg-gray-700
                          transition-colors
                          ${index === highlightedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                          ${index === 0 ? 'rounded-t-lg' : ''}
                          border-b border-gray-100 dark:border-gray-700 last:border-b-0
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-semibold text-sm">
                            {company.name?.charAt(0) || company.code?.charAt(0) || 'C'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                                {company.name}
                              </p>
                              {company.isVerified && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                                  Verified
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              {company.code && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  Code: {company.code}
                                </span>
                              )}
                              {company.industry && (
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  • {company.industry}
                                </span>
                              )}
                            </div>
                            {company.contactPersonName && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                Contact: {company.contactPersonName}
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="px-4 py-8 text-center">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      No companies found for "{searchTerm}"
                    </p>
                  </div>
                )}

                {/* Create New Option */}
                {showCreateOption && onCreateNew && searchTerm && (
                  <button
                    type="button"
                    onClick={handleCreateNew}
                    className={`
                      w-full px-4 py-3 text-left
                      bg-gray-50 dark:bg-gray-700/50
                      hover:bg-gray-100 dark:hover:bg-gray-700
                      transition-colors
                      border-t-2 border-blue-200 dark:border-blue-800
                      ${highlightedIndex === companies.length ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                      rounded-b-lg
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                        <PlusIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                          Create new company
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          "{searchTerm}"
                        </p>
                      </div>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>}
    </div>
  );
};

export default CompanyAutocomplete;
