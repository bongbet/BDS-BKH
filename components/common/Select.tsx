import React from 'react';

interface SelectOption<T> {
  value: T;
  label: string;
}

// FIX: Adjust generic type `T` to be compatible with HTMLSelectElement's value
interface SelectProps<T extends string | number> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  id: string;
  options: SelectOption<T>[];
  error?: string;
  defaultOptionLabel?: string;
  className?: string;
  name?: string;
  // The 'value' prop on the actual <select> element should be a string.
  // We allow `T | ''` for React component value to accommodate initial empty state.
  value?: T | '';
  onChange?: React.ChangeEventHandler<HTMLSelectElement>;
  // FIX: Add required prop to the interface
  required?: boolean;
}

const Select = <T extends string | number>({
  label,
  id,
  options,
  error,
  defaultOptionLabel = 'Chọn...',
  className = '',
  // FIX: Explicitly destructure value
  value,
  // FIX: Destructure required prop
  required,
  ...props
}: SelectProps<T>) => {
  const selectClasses = `
    block w-full px-3 py-2 mt-1
    border border-gray-300 rounded-md shadow-sm
    focus:ring-indigo-500 focus:border-indigo-500
    sm:text-sm
    ${error ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : ''}
    ${className}
  `;

  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      {/* FIX: Ensure the value passed to the select element is always a string, defaulting to '' */}
      {/* FIX: Pass required prop to the select element */}
      <select id={id} className={selectClasses} value={value ?? ''} required={required} {...props}>
        <option value="">{defaultOptionLabel}</option>
        {options.map((option) => (
          // FIX: Ensure option value is always a string
          <option key={String(option.value)} value={String(option.value)}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export default Select;