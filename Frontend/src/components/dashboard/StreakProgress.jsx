import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckSquare, Flame } from 'lucide-react';
import axios from 'axios';

const StreakProgress = ({ routineStreak, taskStreak, habitStreak }) => {
  // State to track the fetched habit streak data
  const [habitStreakData, setHabitStreakData] = useState({
    current: 0,
    longest: 0
  });
  
  // State to track the fetched routine streak data
  const [routineStreakData, setRoutineStreakData] = useState({
    current: 0,
    longest: 0
  });
  
  // State to track the fetched task streak data
  const [taskStreakData, setTaskStreakData] = useState({
    current: 0,
    longest: 0
  });
  
  // Fetch streak data from the backend
  useEffect(() => {
    const fetchStreakData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        // Fetch habit streak data
        const habitResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/habit-tracking/streaks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setHabitStreakData(habitResponse.data);
        
        // Fetch routine streak data
        const routineResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/routines/streaks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setRoutineStreakData(routineResponse.data);
        
        // Fetch task streak data
        const taskResponse = await axios.get(`${import.meta.env.VITE_API_URL}/api/tasks/streaks`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setTaskStreakData(taskResponse.data);
      } catch (error) {
        console.error('Error fetching streak data:', error);
      }
    };
    
    fetchStreakData();
  }, []);
  
  const streaks = [
    {
      type: 'Routines',
      current: routineStreakData.current || routineStreak.current,
      longest: routineStreakData.longest || routineStreak.longest,
      icon: <Calendar className="h-5 w-5" />,
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      type: 'Tasks',
      current: taskStreakData.current || taskStreak.current,
      longest: taskStreakData.longest || taskStreak.longest,
      icon: <CheckSquare className="h-5 w-5" />,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50'
    },
    {
      type: 'Habits',
      current: habitStreakData.current || habitStreak.current,
      longest: habitStreakData.longest || habitStreak.longest,
      icon: <Flame className="h-5 w-5" />,
      color: 'from-orange-500 to-orange-600',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <motion.div 
      className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <h2 className="text-lg font-medium mb-6">Consistency Streaks</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {streaks.map((streak, index) => (
          <motion.div
            key={streak.type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className={`${streak.bgColor} rounded-xl p-4`}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`text-white p-2 rounded-lg bg-gradient-to-r ${streak.color}`}>
                {streak.icon}
              </div>
              <h3 className="font-medium text-gray-800">{streak.type}</h3>
            </div>
            
            <div className="text-3xl font-bold text-gray-800 mb-1">
              {streak.current} Days
            </div>
            
            <div className="text-sm text-gray-600">
              {streak.current > 0 ? (
                <span className="text-green-600">Keep it going!</span>
              ) : (
                <span>Start your streak today!</span>
              )}
            </div>
            
            {streak.longest > 0 && (
              <div className="mt-2 text-xs text-gray-500">
                Longest: {streak.longest} days
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default StreakProgress; 