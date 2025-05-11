import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const WeeklyActivityChart = () => {
  // State for weekly activity data
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maxValue, setMaxValue] = useState(5); // Default max scale
  const [hoveredDay, setHoveredDay] = useState(null);
  
  // Get day abbreviations from dates - Fixed to use local timezone
  const getDayAbbreviation = (dateString) => {
    // Create a date object from the string using local timezone
    const date = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[date.getDay()];
  };
  
  // Helper to ensure consistent date format - Fixed to use local timezone
  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  
  useEffect(() => {
    const fetchWeeklyActivity = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, using mock data');
          // Mock data for development
          const mockData = [
            { date: '2023-07-10', day: 'Mon', routines: 2, tasks: 2, habits: 1 },
            { date: '2023-07-11', day: 'Tue', routines: 2, tasks: 3, habits: 2 },
            { date: '2023-07-12', day: 'Wed', routines: 3, tasks: 1, habits: 2 },
            { date: '2023-07-13', day: 'Thu', routines: 4, tasks: 2, habits: 3 },
            { date: '2023-07-14', day: 'Fri', routines: 2, tasks: 4, habits: 2 },
            { date: '2023-07-15', day: 'Sat', routines: 1, tasks: 2, habits: 1 },
            { date: '2023-07-16', day: 'Sun', routines: 3, tasks: 1, habits: 2 },
          ];
          
          setWeeklyData(mockData);
          
          // Calculate max value for the chart scale
          const maxCount = mockData.reduce((max, day) => {
            const dayMax = Math.max(day.routines, day.tasks, day.habits);
            return dayMax > max ? dayMax : max;
          }, 0);
          
          // Ensure scale is at least 5 or rounded up to the nearest whole number if larger
          setMaxValue(Math.max(5, Math.ceil(maxCount)));
          setLoading(false);
          return;
        }
        
        console.log('Fetching weekly activity data...');
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/dashboard/weekly-activity`;
        
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        console.log('API response:', response.data);
        
        if (!response.data || !response.data.weeklyData || !Array.isArray(response.data.weeklyData)) {
          console.error('Invalid data format received:', response.data);
          setError('Invalid data format received from server');
          setLoading(false);
          return;
        }
        
        // Ensure all data values are numbers
        const processedData = response.data.weeklyData.map(item => ({
          ...item,
          routines: parseInt(item.routines || 0),
          tasks: parseInt(item.tasks || 0),
          habits: parseInt(item.habits || 0)
        }));
        
        console.log('Final processed weekly activity data:', processedData);
        
        if (processedData.length === 0) {
          console.error('No data after processing');
          const mockData = getMockData();
          setWeeklyData(mockData);
          setMaxValue(5);
        } else {
          setWeeklyData(processedData);
          
          // Calculate max value for the chart scale
          const maxCount = processedData.reduce((max, day) => {
            const dayMax = Math.max(day.routines, day.tasks, day.habits);
            return dayMax > max ? dayMax : max;
          }, 0);
          
          // Dynamically set the scale: default minimum of 5, or rounded up to next whole number
          // Add 1 to give some headroom at the top of the chart
          setMaxValue(Math.max(5, Math.ceil(maxCount) + 1));
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching weekly activity data:', err);
        // Use mock data on error
        const mockData = getMockData();
        setWeeklyData(mockData);
        setMaxValue(5);
        setLoading(false);
      }
    };
    
    const getMockData = () => {
      return [
        { date: '2023-07-10', day: 'Mon', routines: 0, tasks: 2, habits: 1 },
        { date: '2023-07-11', day: 'Tue', routines: 2, tasks: 3, habits: 2 },
        { date: '2023-07-12', day: 'Wed', routines: 3, tasks: 1, habits: 2 },
        { date: '2023-07-13', day: 'Thu', routines: 3, tasks: 2, habits: 3 },
        { date: '2023-07-14', day: 'Fri', routines: 2, tasks: 4, habits: 2 },
        { date: '2023-07-15', day: 'Sat', routines: 1, tasks: 2, habits: 1 },
        { date: '2023-07-16', day: 'Sun', routines: 3, tasks: 1, habits: 2 },
      ];
    };
    
    fetchWeeklyActivity();
  }, []);

  // Format date to display in tooltip
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Find today's data to highlight
  const todayIndex = weeklyData.length > 0 ? 
    weeklyData.findIndex(item => {
      const itemDate = new Date(item.date).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];
      return itemDate === today;
    }) : -1;

  // Day tooltip component
  const DayTooltip = ({ day, index }) => {
    if (index !== hoveredDay) return null;
    
    const formattedDate = formatDateForDisplay(day.date);
    const total = day.routines + day.tasks + day.habits;
    
    return (
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded px-3 py-2 z-10 w-40 shadow-lg pointer-events-none">
        <div className="font-medium mb-1">{formattedDate}</div>
        <div className="grid grid-cols-2 gap-x-2 gap-y-1">
          <div className="text-indigo-300">Routines:</div>
          <div className="text-right">{day.routines}</div>
          <div className="text-emerald-300">Tasks:</div>
          <div className="text-right">{day.tasks}</div>
          <div className="text-amber-300">Habits:</div>
          <div className="text-right">{day.habits}</div>
          <div className="font-medium border-t border-gray-600 pt-1 mt-1">Total:</div>
          <div className="text-right font-medium border-t border-gray-600 pt-1 mt-1">{total}</div>
        </div>
        <div className="absolute left-1/2 transform -translate-x-1/2 top-full w-0 h-0 border-l-8 border-r-8 border-t-8 border-transparent border-t-gray-800"></div>
      </div>
    );
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{ minHeight: '490px' }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Weekly Activity</h2>
        <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">Last 7 days</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-94">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-94 text-red-500">{error}</div>
      ) : (
        <div className="h-91">
          {/* Chart grid and content */}
          <div className="h-full">
            {/* Main chart container */}
            <div className="relative h-75">
              {/* Y-axis labels and grid lines */}
              {/* Dynamic Y-axis scale with 5 evenly distributed points including 0 */}
              {[...Array(6)].map((_, i) => {
                const value = Math.round((maxValue / 5) * i);
                return (
                  <div 
                    key={i} 
                    className="absolute w-full border-t border-gray-200 flex items-center"
                    style={{ 
                      bottom: `${(i / 5) * 100}%`, 
                      height: '1px' 
                    }}
                  >
                    <span className="text-xs text-gray-500 mr-2">{value}</span>
                  </div>
                );
              })}

              {/* X-axis baseline */}
              <div className="absolute w-full border-t border-gray-300 bottom-0 left-0"></div>
              
              {/* Bars container */}
              <div className="grid grid-cols-7 h-full gap-1 pr-2">
                {weeklyData.slice(0, 7).map((day, index) => (
                  <div 
                    key={index} 
                    className="flex flex-col h-full relative"
                    onMouseEnter={() => setHoveredDay(index)}
                    onMouseLeave={() => setHoveredDay(null)}
                  >
                    {/* Tooltip */}
                    <DayTooltip day={day} index={index} />
                    
                    {/* Day column with bars */}
                    <div className="h-full flex items-end justify-center gap-1 relative">
                      {/* Routines bar */}
                      <motion.div 
                        className={`w-3 ${index === todayIndex ? 'bg-indigo-700' : 'bg-indigo-600'} rounded-t transition-all duration-200 hover:opacity-90`}
                        style={{ height: `${(day.routines / maxValue) * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.routines / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                      ></motion.div>
                      
                      {/* Tasks bar */}
                      <motion.div 
                        className={`w-3 ${index === todayIndex ? 'bg-emerald-600' : 'bg-emerald-500'} rounded-t transition-all duration-200 hover:opacity-90`}
                        style={{ height: `${(day.tasks / maxValue) * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.tasks / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                      ></motion.div>
                      
                      {/* Habits bar */}
                      <motion.div 
                        className={`w-3 ${index === todayIndex ? 'bg-amber-600' : 'bg-amber-500'} rounded-t transition-all duration-200 hover:opacity-90`}
                        style={{ height: `${(day.habits / maxValue) * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.habits / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                      ></motion.div>
                    </div>
                    
                    {/* Hover overlay to make entire column clickable */}
                    <div 
                      className="absolute inset-0 cursor-pointer" 
                      style={{ backgroundColor: 'rgba(0,0,0,0)' }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* X-axis labels - positioned directly on the axis line */}
            <div className="grid grid-cols-7 gap-1 pr-2 mt-1">
              {weeklyData.slice(0, 7).map((day, index) => (
                <div key={index} className={`text-center ${index === todayIndex ? 'font-bold' : ''}`}>
                  <span className={`text-xs ${index === todayIndex ? 'text-gray-800' : 'text-gray-600'}`}>
                    {day.day}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center mt-4 space-x-6">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-indigo-600 rounded-sm mr-2"></div>
              <span className="text-xs text-gray-700">Routines</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-emerald-500 rounded-sm mr-2"></div>
              <span className="text-xs text-gray-700">Tasks</span>
            </div>
            <div className="flex items-center">
              <div className="w-3 h-3 bg-amber-500 rounded-sm mr-2"></div>
              <span className="text-xs text-gray-700">Habits</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default WeeklyActivityChart; 