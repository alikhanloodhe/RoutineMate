// components/habit/DashboardStats.jsx
import React from 'react';

const DashboardStats = ({ totalHabits, activeStreaks, successRate }) => {
  const stats = [
    { 
      title: 'Total Habits', 
      value: totalHabits, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      title: 'Active Streaks', 
      value: activeStreaks, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    },
    { 
      title: 'Success Rate', 
      value: `${successRate}%`, 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className="bg-white rounded-xl shadow-sm p-6"
        >
          <div className="flex items-center">
            <div className="bg-[#4A2BAF]/10 p-3 rounded-lg">
              <div className="text-[#4A2BAF]">
                {stat.icon}
              </div>
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <h4 className="text-xl font-bold text-[#1C1C1C]">{stat.value}</h4>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;