import React from 'react';
import { motion } from 'framer-motion';

const WeeklyActivityChart = () => {
  // Mock data for weekly activity
  const weekData = [
    { day: 'Mon', routines: 3, tasks: 2, habits: 1 },
    { day: 'Tue', routines: 2, tasks: 3, habits: 2 },
    { day: 'Wed', routines: 3, tasks: 1, habits: 2 },
    { day: 'Thu', routines: 4, tasks: 2, habits: 3 },
    { day: 'Fri', routines: 2, tasks: 4, habits: 2 },
    { day: 'Sat', routines: 1, tasks: 2, habits: 1 },
    { day: 'Sun', routines: 3, tasks: 1, habits: 2 },
  ];

  // Maximum value for scaling
  const maxValue = 5;

  return (
    <motion.div 
      className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6 h-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Weekly Activity</h2>
        <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">Last 7 days</span>
      </div>

      <div className="relative h-60">
        {/* Y-axis grid lines */}
        {[...Array(maxValue + 1)].map((_, i) => (
          <div 
            key={i} 
            className="absolute w-full border-t border-gray-200 border-dashed flex items-center justify-end"
            style={{ 
              bottom: `${(i / maxValue) * 100}%`, 
              height: '1px' 
            }}
          >
            <span className="text-xs text-gray-500 mr-2">{maxValue - i}</span>
          </div>
        ))}

        {/* Bars */}
        <div className="absolute inset-0 pt-6 flex justify-between items-end">
          {weekData.map((day, index) => (
            <div key={index} className="flex items-end justify-center gap-1 w-1/7 px-1">
              {/* Routines bar */}
              <motion.div 
                className="w-3 bg-[#4A2BAF] rounded-t"
                style={{ height: `${(day.routines / maxValue) * 100}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.routines / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.2 + (index * 0.05) }}
              ></motion.div>
              
              {/* Tasks bar */}
              <motion.div 
                className="w-3 bg-[#10B981] rounded-t"
                style={{ height: `${(day.tasks / maxValue) * 100}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.tasks / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.05) }}
              ></motion.div>
              
              {/* Habits bar */}
              <motion.div 
                className="w-3 bg-[#F59E0B] rounded-t"
                style={{ height: `${(day.habits / maxValue) * 100}%` }}
                initial={{ height: 0 }}
                animate={{ height: `${(day.habits / maxValue) * 100}%` }}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.05) }}
              ></motion.div>
              
              {/* X-axis label */}
              <div className="absolute bottom-0 text-xs text-gray-500 mt-2 translate-y-6">{day.day}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex justify-center mt-8 space-x-6">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#4A2BAF] rounded-sm mr-2"></div>
          <span className="text-xs text-gray-700">Routines</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#10B981] rounded-sm mr-2"></div>
          <span className="text-xs text-gray-700">Tasks</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-[#F59E0B] rounded-sm mr-2"></div>
          <span className="text-xs text-gray-700">Habits</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WeeklyActivityChart; 