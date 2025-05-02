import React from 'react';

const ReminderTimePicker = ({ id, label, value, onChange }) => {
  return (
    <div>
      <label htmlFor={id} className="block font-medium mb-1">{label}</label>
      <input
        id={id}
        type="time"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <p className="mt-1 text-xs text-gray-500">
        Choose a time to receive reminders
      </p>
    </div>
  );
};

export default ReminderTimePicker; 