// src/components/tasks/TaskToggle.jsx
import React from 'react';

const TaskToggle = ({ activeTab, setActiveTab }) => {
  return (
    <div className="inline-flex p-1 rounded-lg bg-gray-100">
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === 'personal' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={() => setActiveTab('personal')}
      >
        Personal Tasks
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === 'group' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600 hover:text-gray-900'
        }`}
        onClick={() => setActiveTab('group')}
      >
        Group Tasks
      </button>
    </div>
  );
};

export default TaskToggle;