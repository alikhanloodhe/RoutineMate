// components/habit/FrequencySelector.jsx
import React from 'react';

const FrequencySelector = ({ value, onChange }) => {
  const [frequency, setFrequency] = React.useState(value || 'daily');
  const [selectedDays, setSelectedDays] = React.useState(value === 'custom' ? [] : []);
  
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  const handleFrequencyChange = (newFrequency) => {
    setFrequency(newFrequency);
    
    if (newFrequency === 'custom') {
      onChange(newFrequency, selectedDays);
    } else {
      onChange(newFrequency);
    }
  };
  
  const toggleDay = (day) => {
    const newSelectedDays = selectedDays.includes(day)
      ? selectedDays.filter(d => d !== day)
      : [...selectedDays, day];
    
    setSelectedDays(newSelectedDays);
    onChange('custom', newSelectedDays);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col space-y-2">
        <label className="font-medium">Frequency</label>
        <div className="flex space-x-2">
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${frequency === 'daily' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => handleFrequencyChange('daily')}
          >
            Daily
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${frequency === 'weekly' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => handleFrequencyChange('weekly')}
          >
            Weekly
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${frequency === 'custom' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'}`}
            onClick={() => handleFrequencyChange('custom')}
          >
            Custom
          </button>
        </div>
      </div>
      
      {frequency === 'custom' && (
        <div className="space-y-2">
          <label className="font-medium">Select Days</label>
          <div className="flex flex-wrap gap-2">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                className={`w-14 h-14 rounded-full flex items-center justify-center ${
                  selectedDays.includes(day) ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-800'
                }`}
                onClick={() => toggleDay(day)}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FrequencySelector; 