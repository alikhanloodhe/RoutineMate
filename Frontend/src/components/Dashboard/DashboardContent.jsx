// src/components/dashboard/DashboardContent.jsx
import React from 'react';
import DashboardCard from './DashboardCard';
import { CheckCircle2, Clock, CalendarCheck, Star } from 'lucide-react';

const DashboardContent = ({name}) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-600 text-xl" >Welcome back {name}! Here's an overview of your progress.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard 
          title="Completed Tasks" 
          value="12" // This value would be fetched from database
          icon={<CheckCircle2 size={24} />} 
          color="green" 
        />
        <DashboardCard 
          title="Current Routines" 
          value="3" 
          icon={<Clock size={24} />} 
          color="blue" 
        />
        <DashboardCard 
          title="Streak Days" 
          value="7" 
          icon={<CalendarCheck size={24} />} 
          color="purple" 
        />
        <DashboardCard 
          title="Achievement Points" 
          value="240" 
          icon={<Star size={24} />} 
          color="amber" 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Recent Activities</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <Clock size={18} />
                </div>
                <div>
                  <p className="font-medium">Morning Workout Completed</p>
                  <p className="text-sm text-gray-500">Today, 7:30 AM</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Upcoming Tasks</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((_, index) => (
              <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="font-medium">Review Project Proposal</p>
                    <p className="text-sm text-gray-500">Tomorrow, 2:00 PM</p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Work
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;