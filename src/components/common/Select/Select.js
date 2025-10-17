import classNames from 'classnames';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  error,
  disabled = false,
  loading = false, // ✅ Extract loading prop to prevent it from being passed to DOM
  className,
  ...props
}) => {
  const selectClasses = classNames(
    'w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm',
    'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
    'disabled:bg-gray-50 disabled:text-gray-500',
    {
      'border-red-300 focus:ring-red-500 focus:border-red-500': error
    },
    className
  );

  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
    <select
      className={selectClasses}
      value={value}
      onChange={onChange}
      disabled={disabled || loading}
      {...props}
    >
      {options.length > 0 ? (
        options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))
      ) : (
        props.children
      )}
    </select>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default Select;