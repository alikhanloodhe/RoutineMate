// src/components/tasks/TaskToggle.jsx
import React from 'react';

const TaskToggle = ({ activeTab, setActiveTab }) => {
  return (
    <div className="inline-flex p-1 rounded-lg bg-gray-100 dark:bg-gray-800">
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === 'personal' 
            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        onClick={() => setActiveTab('personal')}
      >
        Personal Tasks
      </button>
      <button
        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
          activeTab === 'group' 
            ? 'bg-white dark:bg-gray-700 shadow-sm text-gray-900 dark:text-gray-100' 
            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
        onClick={() => setActiveTab('group')}
      >
        Group Tasks
      </button>
    </div>
  );
};

export default TaskToggle;