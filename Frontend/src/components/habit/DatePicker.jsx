// components/habit/DatePicker.jsx
import React from 'react';

const DatePicker = ({ value, onChange, label, id, disabled = false }) => {
  // Format date for input
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toISOString().split('T')[0];
  };

  return (
    <div className="flex flex-col space-y-2">
      <label htmlFor={id} className="font-medium">{label}</label>
      <input
        id={id}
        type="date"
        value={formatDate(value)}
        onChange={(e) => onChange(e.target.value)}
        className={`border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${disabled ? 'opacity-70 cursor-not-allowed bg-gray-100' : ''}`}
        disabled={disabled}
      />
    </div>
  );
};

export default DatePicker;