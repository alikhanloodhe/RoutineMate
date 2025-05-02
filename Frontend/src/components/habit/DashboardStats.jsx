// components/habit/DashboardStats.jsx
import React from 'react';

const DashboardStats = ({ totalHabits, activeStreaks, successRate }) => {
  const stats = [
    { 
      title: 'Total Habits', 
      value: totalHabits, 
      color: 'from-blue-500 to-indigo-600',
      lightColor: 'from-blue-50 to-indigo-50',
      borderColor: 'border-blue-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    { 
      title: 'Active Streaks', 
      value: activeStreaks, 
      color: 'from-green-500 to-emerald-600',
      lightColor: 'from-green-50 to-emerald-50',
      borderColor: 'border-green-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    { 
      title: 'Success Rate', 
      value: `${successRate}%`, 
      color: 'from-purple-500 to-violet-600',
      lightColor: 'from-purple-50 to-violet-50',
      borderColor: 'border-purple-400',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
          className={`relative overflow-hidden bg-gradient-to-r ${stat.lightColor} border-l-4 ${stat.borderColor} rounded-xl shadow-sm p-4`}
        >
          <div className="flex items-center mb-2 z-10 relative">
            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-sm`}>
              {stat.icon}
            </div>
            <div className="ml-4">
              <p className="text-gray-500 text-sm font-medium">{stat.title}</p>
              <h4 className="text-2xl font-bold text-gray-800">{stat.value}</h4>
            </div>
          </div>
          <div className="absolute -right-6 -top-6 w-24 h-24 opacity-10 rounded-full bg-gradient-to-br from-gray-500 to-gray-300"></div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;