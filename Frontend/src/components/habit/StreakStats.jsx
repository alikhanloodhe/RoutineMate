// components/habit/StreakStats.jsx
import React from 'react';

const StreakStats = ({ currentStreak, bestStreak, totalCompletions, totalDays }) => {
  const completionRate = totalDays > 0 ? Math.round((totalCompletions / totalDays) * 100) : 0;
  
  const stats = [
    { 
      label: 'Current Streak', 
      value: `${currentStreak} day${currentStreak !== 1 ? 's' : ''}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-orange-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-orange-50 to-amber-50 border-l-4 border-orange-400'
    },
    { 
      label: 'Best Streak', 
      value: `${bestStreak} day${bestStreak !== 1 ? 's' : ''}`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-purple-50 to-indigo-50 border-l-4 border-purple-400'
    },
    { 
      label: 'Completion Rate', 
      value: `${completionRate}%`,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
          <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-blue-50 to-cyan-50 border-l-4 border-blue-400'
    },
    { 
      label: 'Total Completions', 
      value: totalCompletions,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
        </svg>
      ),
      color: 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-400'
    }
  ];
  
  return (
    <div className="bg-white rounded-xl shadow-md p-5 mb-8 border border-gray-100">
      <h3 className="font-semibold text-xl mb-5 text-gray-800">Streak Information</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className={`p-4 rounded-lg shadow-sm ${stat.color}`}>
            <div className="flex items-center mb-2">
              {stat.icon}
              <div className="text-gray-600 text-sm font-medium ml-2">{stat.label}</div>
            </div>
            <div className="font-bold text-2xl text-gray-800">{stat.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StreakStats;