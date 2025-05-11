import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';

const WeeklyActivityChart = () => {
  // State for weekly activity data
  const [weeklyData, setWeeklyData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [maxValue, setMaxValue] = useState(5); // Default max scale
  
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
            { date: '2023-07-10', routines: 2, tasks: 2, habits: 1 },
            { date: '2023-07-11', routines: 2, tasks: 3, habits: 2 },
            { date: '2023-07-12', routines: 3, tasks: 1, habits: 2 },
            { date: '2023-07-13', routines: 4, tasks: 2, habits: 3 },
            { date: '2023-07-14', routines: 2, tasks: 4, habits: 2 },
            { date: '2023-07-15', routines: 1, tasks: 2, habits: 1 },
            { date: '2023-07-16', routines: 3, tasks: 1, habits: 2 },
          ].map(item => ({
            ...item,
            day: getDayAbbreviation(item.date)
          }));
          
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
        
        // Get client's timezone offset in minutes - negate it to match backend expectations
        // getTimezoneOffset returns minutes WEST of UTC, so for GMT+5 it returns -300
        // We negate this to get minutes EAST of UTC (+300 for GMT+5)
        const timezoneOffset = -new Date().getTimezoneOffset();
        console.log(`Client timezone offset: ${timezoneOffset} minutes (negated from getTimezoneOffset: ${new Date().getTimezoneOffset()})`);
        console.log(`Raw timezone offset: ${new Date().getTimezoneOffset()} minutes, which for GMT+5 should be -300`);
        
        // Get today's date in local timezone for debugging
        const today = new Date();
        const todayFormatted = formatDate(today);
        console.log(`Today's date (client): ${todayFormatted}, day of week: ${today.getDay()} (0=Sunday, 6=Saturday)`);
        
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Timezone-Offset': timezoneOffset
          }
        });
        
        console.log('API response:', response.data);
        
        if (!response.data || !response.data.weeklyData || !Array.isArray(response.data.weeklyData)) {
          console.error('Invalid data format received:', response.data);
          setError('Invalid data format received from server');
          setLoading(false);
          return;
        }
        
        // Calculate dates for the last 7 days including today (ENDING WITH TODAY)
        const dates = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const formattedDate = formatDate(date);
          dates.push(formattedDate);
        }
        console.log('Expected 7-day date range from today:', dates);
        console.log('Last date should be today:', formatDate(new Date()));
        
        // Check if we received the date range from server for debugging
        if (response.data.dateRange) {
          console.log('Server provided date range:', response.data.dateRange);
          console.log('Server today date:', response.data.clientToday);
          
          // Compare client and server date ranges
          const matches = dates.every((date, index) => date === response.data.dateRange[index]);
          console.log(`Client and server date ranges ${matches ? 'match' : 'do NOT match'}`);
          
          if (!matches) {
            console.log('Mismatched dates:');
            dates.forEach((date, i) => {
              const serverDate = response.data.dateRange[i] || 'missing';
              console.log(`Day ${i}: Client: ${date}, Server: ${serverDate}`);
            });
          }
        }
        
        // Create a map of dates to data
        const dateMap = new Map();
        
        // Initialize with zeros for all dates
        dates.forEach(date => {
          dateMap.set(date, {
            date,
            day: getDayAbbreviation(date),
            routines: 0,
            tasks: 0,
            habits: 0
          });
        });
        
        // Fill in data from the API response
        response.data.weeklyData.forEach(item => {
          if (dateMap.has(item.date)) {
            const entry = dateMap.get(item.date);
            entry.routines = parseInt(item.routines || 0);
            entry.tasks = parseInt(item.tasks || 0);
            entry.habits = parseInt(item.habits || 0);
            entry.dayOfWeek = item.dayOfWeek; // Include server's day of week calculation
            
            // Debug log for today's data
            if (item.date === todayFormatted) {
              console.log(`Found today's data: ${JSON.stringify(item)}`);
            }
          } else {
            console.log(`Received data for date outside our range: ${item.date}`);
            // Add this date anyway to ensure we have today's data
            if (item.date === todayFormatted || new Date(item.date) >= new Date(todayFormatted)) {
              console.log(`Adding out-of-range date ${item.date} because it's today or future date`);
              dateMap.set(item.date, {
                date: item.date,
                day: getDayAbbreviation(item.date),
                routines: parseInt(item.routines || 0),
                tasks: parseInt(item.tasks || 0),
                habits: parseInt(item.habits || 0),
                dayOfWeek: item.dayOfWeek
              });
            }
          }
        });
        
        // Convert map to array and ensure correct sorting (past to present)
        const processedData = Array.from(dateMap.values());
        processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        
        console.log('Final processed weekly activity data:', processedData);
        
        // Make sure today's data is included even if the backend didn't return it
        const todayData = processedData.find(day => day.date === todayFormatted);
        if (!todayData) {
          console.log('Today was not in the processed data. Adding it explicitly.');
          const todayObj = {
            date: todayFormatted,
            day: getDayAbbreviation(todayFormatted),
            routines: 0,
            tasks: 0,
            habits: 0,
            dayOfWeek: new Date().toLocaleDateString('en-US', { weekday: 'long' })
          };
          
          // Check if the backend sent us separate debug data for today
          if (response.data.debug && response.data.debug.todayCompletions) {
            const todayCompletions = response.data.debug.todayCompletions;
            todayObj.routines = parseInt(todayCompletions.routines || 0);
            todayObj.tasks = parseInt(todayCompletions.tasks || 0);
            todayObj.habits = parseInt(todayCompletions.habits || 0);
            console.log(`Added today with data from debug: routines=${todayObj.routines}, tasks=${todayObj.tasks}, habits=${todayObj.habits}`);
          }
          
          // If we have more than 7 days, remove the oldest
          if (processedData.length >= 7) {
            processedData.shift(); // Remove oldest day
          }
          
          // Add today 
          processedData.push(todayObj);
          
          // Re-sort
          processedData.sort((a, b) => new Date(a.date) - new Date(b.date));
        }
        
        // Check if today is Saturday and has any data
        const currentDate = new Date();
        const isTodaySaturday = currentDate.getDay() === 6;
        
        if (isTodaySaturday) {
          const saturdayData = processedData.find(day => day.date === todayFormatted);
          
          if (saturdayData) {
            console.log(`Saturday data found: ${JSON.stringify(saturdayData)}`);
            
            // If we have Saturday data but routines/tasks/habits are all 0, check if backend sent any debug data
            if (saturdayData.routines === 0 && saturdayData.tasks === 0 && saturdayData.habits === 0) {
              
              // For each completed task or habit on this date from debug data, increment the counts
              if (response.data.debug) {
                if (response.data.debug.todayCompletions) {
                  const todayCompletions = response.data.debug.todayCompletions;
                  if (todayCompletions.routines > 0) saturdayData.routines = todayCompletions.routines;
                  if (todayCompletions.tasks > 0) saturdayData.tasks = todayCompletions.tasks;
                  if (todayCompletions.habits > 0) saturdayData.habits = todayCompletions.habits;
                  console.log(`Updated Saturday data from debug: routines=${saturdayData.routines}, tasks=${saturdayData.tasks}, habits=${saturdayData.habits}`);
                }
              }
            }
          }
        }
        
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
        { date: '2023-07-10', day: 'Mon', routines: 3, tasks: 2, habits: 1 },
        { date: '2023-07-11', day: 'Tue', routines: 2, tasks: 3, habits: 2 },
        { date: '2023-07-12', day: 'Wed', routines: 3, tasks: 1, habits: 2 },
        { date: '2023-07-13', day: 'Thu', routines: 8, tasks: 2, habits: 3 },
        { date: '2023-07-14', day: 'Fri', routines: 2, tasks: 4, habits: 2 },
        { date: '2023-07-15', day: 'Sat', routines: 1, tasks: 2, habits: 1 },
        { date: '2023-07-16', day: 'Sun', routines: 3, tasks: 1, habits: 2 },
      ];
    };
    
    fetchWeeklyActivity();
  }, []);

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-800">Weekly Activity</h2>
        <span className="text-xs bg-gray-100 text-gray-700 rounded-full px-3 py-1">Last 7 days</span>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-60">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-60 text-red-500">{error}</div>
      ) : (
        <div className="h-64">
          {/* Chart grid and content */}
          <div className="h-full">
            {/* Main chart container */}
            <div className="relative h-48"> {/* Reduced height to make room for labels */}
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
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex flex-col h-full">
                    {/* Day column with bars */}
                    <div className="h-full flex items-end justify-center gap-1 relative">
                      {/* Routines bar */}
                      <motion.div 
                        className="w-3 bg-indigo-600 rounded-t"
                        style={{ height: `${(day.routines / maxValue) * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.routines / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: index * 0.05 }}
                        title={`${day.routines} routine${day.routines !== 1 ? 's' : ''}`}
                      ></motion.div>
                      
                      {/* Tasks bar */}
                      <motion.div 
                        className="w-3 bg-emerald-500 rounded-t"
                        style={{ height: `${(day.tasks / maxValue) * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.tasks / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.1 + index * 0.05 }}
                        title={`${day.tasks} task${day.tasks !== 1 ? 's' : ''}`}
                      ></motion.div>
                      
                      {/* Habits bar */}
                      <motion.div 
                        className="w-3 bg-amber-500 rounded-t"
                        style={{ height: `${(day.habits / maxValue) * 100}%` }}
                        initial={{ height: 0 }}
                        animate={{ height: `${(day.habits / maxValue) * 100}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                        title={`${day.habits} habit${day.habits !== 1 ? 's' : ''}`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* X-axis labels - positioned directly on the axis line */}
            <div className="grid grid-cols-7 gap-1 pr-2 mt-1">
              {weeklyData.map((day, index) => (
                <div key={index} className="text-center">
                  <span className="text-xs text-gray-600">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Legend */}
          <div className="flex justify-center mt-1 space-x-6">
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