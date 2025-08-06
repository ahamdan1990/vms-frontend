import React from 'react';
import Input from '../Input/Input';

/**
 * AddressForm component for capturing address information
 * Used in user profile and other address entry forms
 */
const AddressForm = ({ 
  addressData, 
  onChange, 
  errors = {}, 
  disabled = false,
  required = false,
  showTitle = true 
}) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="space-y-4">
      {showTitle && (
        <div className="border-b border-gray-200 pb-2 mb-4">
          <h4 className="text-md font-medium text-gray-900">Address Information</h4>
          <p className="text-sm text-gray-600 mt-1">Your physical address details</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <Input
            label="Street Address"
            name="street1"
            value={addressData.street1 || ''}
            onChange={handleChange}
            error={errors.street1}
            disabled={disabled}
            required={required}
            placeholder="123 Main Street"
          />
        </div>

        <div className="md:col-span-2">
          <Input
            label="Street Address Line 2"
            name="street2"
            value={addressData.street2 || ''}
            onChange={handleChange}
            error={errors.street2}
            disabled={disabled}
            placeholder="Apartment, suite, unit, building, floor, etc."
          />
        </div>

        <Input
          label="City"
          name="city"
          value={addressData.city || ''}
          onChange={handleChange}
          error={errors.city}
          disabled={disabled}
          required={required && addressData.street1}
          placeholder="New York"
        />

        <Input
          label="State/Province"
          name="state"
          value={addressData.state || ''}
          onChange={handleChange}
          error={errors.state}
          disabled={disabled}
          required={required && addressData.street1}
          placeholder="NY"
        />

        <Input
          label="ZIP/Postal Code"
          name="postalCode"
          value={addressData.postalCode || ''}
          onChange={handleChange}
          error={errors.postalCode}
          disabled={disabled}
          required={required && addressData.street1}
          placeholder="10001"
        />

        <Input
          label="Country"
          name="country"
          value={addressData.country || ''}
          onChange={handleChange}
          error={errors.country}
          disabled={disabled}
          required={required && addressData.street1}
          placeholder="United States"
        />
      </div>
    </div>
  );
};

export default AddressForm;