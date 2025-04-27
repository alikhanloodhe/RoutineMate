import React, { useState } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import Tasks from './IndividualTasks';
import GroupTasksPage from './GroupTasksPage';
import TaskToggle from '../components/tasks/TaskToggle';

export default function TaskLayout() {
  const [activeTab, setActiveTab] = useState('personal');

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Tasks</h1>

        {/* Toggle Button */}
        <div className="mb-6">
          <TaskToggle activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        {/* Conditional Rendering */}
        <div>
          {activeTab === 'personal' ? (
            <Tasks />
          ) : (
            <GroupTasksPage />
          )}
        </div>
      </main>
    </div>
  );
}
