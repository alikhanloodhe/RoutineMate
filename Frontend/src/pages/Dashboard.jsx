// src/pages/Dashboard.jsx
import React from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import DashboardContent from '../components/Dashboard/DashboardContent';

const Dashboard = ({name}) => {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar name  = {name}/>
      <main className="flex-1 overflow-y-auto">
        <DashboardContent name = {name}/>
      </main>
    </div>
  );
};

export default Dashboard;