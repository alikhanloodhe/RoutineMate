// components/habit/FrequencySelector.jsx
import React from 'react';

const FrequencySelector = ({ value, onChange }) => {
  const [frequency, setFrequency] = React.useState(value || 'daily');
  
  const handleFrequencyChange = (newFrequency) => {
    setFrequency(newFrequency);
    onChange(newFrequency);
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
        </div>
      </div>
    </div>
  );
};

export default FrequencySelector; 