/**
 * Utility functions for form handling and data formatting
 */

/**
 * Handle numeric input change properly
 * Prevents issue with empty input and parseFloat returning NaN
 * 
 * @param {string} value - Input value from form field
 * @param {function} setter - State setter function
 * @param {number} defaultValue - Default value when input is empty (default: 0)
 */
export const handleNumericInputChange = (value, setter, defaultValue = 0) => {
  // Allow empty string for better UX, let blur handler validate
  if (value === '' || value === '-') {
    setter(value); // Keep as string to allow user to type
  } else {
    const numValue = parseFloat(value);
    setter(isNaN(numValue) ? defaultValue : numValue);
  }
};

/**
 * Handle numeric input key events for better UX
 * Allows delete key to clear the field properly
 * 
 * @param {React.KeyboardEvent} e - Keyboard event
 * @param {function} setter - State setter function
 * @param {number} defaultValue - Default value when cleared (default: 0)
 */
export const handleNumericInputKeyDown = (e, setter, defaultValue = 0) => {
  // Handle Delete and Backspace keys when field contains only "0"
  const currentValue = e.target.value;
  
  if ((e.key === 'Delete' || e.key === 'Backspace') && currentValue === '0') {
    e.preventDefault();
    setter(''); // Set to empty string to allow user to type new value
  }
  
  // Allow typing negative sign
  if (e.key === '-' && (currentValue === '' || currentValue === '0')) {
    e.preventDefault();
    setter('-');
  }
  
  // Only allow numbers, decimal point, and minus sign
  if (e.key.length === 1 && !/[\d.-]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Enter', 'ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) {
    e.preventDefault();
  }
};

/**
 * Handle numeric input blur event
 * Ensures valid value when field loses focus
 * 
 * @param {React.FocusEvent} e - Focus event
 * @param {function} setter - State setter function
 * @param {number} defaultValue - Default value when invalid (default: 0)
 */
export const handleNumericInputBlur = (e, setter, defaultValue = 0) => {
  const value = e.target.value;
  
  if (value === '' || value === '-') {
    setter(defaultValue);
  } else {
    const numValue = parseFloat(value);
    setter(isNaN(numValue) ? defaultValue : numValue);
  }
};

/**
 * Get display value for numeric input
 * Returns empty string for 0 to allow better UX
 * 
 * @param {number|string} value - Current value
 * @returns {string} Display value
 */
export const getNumericDisplayValue = (value) => {
  if (value === 0 || value === '0') {
    return '';
  }
  return value.toString();
};

/**
 * Format currency for display
 * 
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'IDR')
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'IDR') => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount || 0);
};

/**
 * Format number with thousands separator
 * 
 * @param {number} number - Number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('id-ID').format(number || 0);
};

/**
 * Parse and validate numeric input
 * 
 * @param {any} value - Value to parse
 * @param {number} defaultValue - Default value if invalid (default: 0)
 * @returns {number} Parsed number
 */
export const parseNumber = (value, defaultValue = 0) => {
  if (value === '' || value === null || value === undefined) {
    return defaultValue;
  }
  
  const parsed = parseFloat(value);
  return isNaN(parsed) ? defaultValue : parsed;
};
