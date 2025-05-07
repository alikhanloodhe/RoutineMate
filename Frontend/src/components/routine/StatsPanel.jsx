import React from 'react';
import { Target, Calendar, Clock, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const StatsPanel = ({ routines }) => {
  // Get today's date 
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
  
  // Calculate statistics
  const calculateStats = () => {
    // Count today's routines
    const todayRoutines = routines.filter(r => 
      r.active && r.daysOfWeek.includes(dayOfWeek)
    ).length;
    
    // Calculate success rate
    const allCompletions = routines.flatMap(routine => 
      routine.completionData?.history || []
    );
    
    const successRate = allCompletions.length === 0
      ? 100
      : Math.round((allCompletions.filter(h => h.completed).length / allCompletions.length) * 100);
    
    // Count completed routines today
    const completedToday = routines.filter(r => 
      r.active && 
      r.daysOfWeek.includes(dayOfWeek) &&
      r.completionData?.history?.some(h => h.date === todayStr && h.completed)
    ).length;
    
    return {
      todayRoutines,
      completedToday,
      successRate
    };
  };
  
  const stats = calculateStats();
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
    >
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Today's Schedule</span>
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Calendar className="h-4 w-4 text-blue-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-800">{stats.todayRoutines}</p>
        <p className="text-sm text-gray-500 mt-1">routines planned</p>
      </motion.div>
      
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Completed</span>
          <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
            <Clock className="h-4 w-4 text-green-600" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-800">{stats.completedToday}</p>
        <p className="text-sm text-gray-500 mt-1">routines today</p>
      </motion.div>
      
      <motion.div 
        whileHover={{ y: -4 }}
        transition={{ type: "spring", stiffness: 300 }}
        className="bg-white rounded-xl shadow-sm p-5 border border-gray-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-700">Success Rate</span>
          <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
            <Award className="h-4 w-4 text-[#4A2BAF]" />
          </div>
        </div>
        <p className="text-2xl font-bold text-gray-800">{stats.successRate}%</p>
        <div className="mt-2 w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${stats.successRate}%` }}
            transition={{ duration: 1, delay: 0.2 }}
            className="h-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] rounded-full"
          ></motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StatsPanel; 