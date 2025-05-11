import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProductivityTrend = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weeklyData, setWeeklyData] = useState([65, 72, 68, 76]); // Default mock data
  const [change, setChange] = useState(8); // Default change percentage
  const [detailedStats, setDetailedStats] = useState([]); // Detailed stats for each week
  const [fullWeeks, setFullWeeks] = useState(4); // Number of full weeks user has been active
  const [isNewUser, setIsNewUser] = useState(false); // Whether the user is new
  const [userCreatedAt, setUserCreatedAt] = useState(null); // When the user created their account

  useEffect(() => {
    const fetchProductivityTrend = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          console.log('No token found, using mock data');
          setLoading(false);
          return;
        }
        
        console.log('Fetching productivity trend data...');
        const apiUrl = `${import.meta.env.VITE_API_URL}/api/dashboard/productivity-trend`;
        
        // Get client's timezone offset in minutes for consistent date handling
        const timezoneOffset = new Date().getTimezoneOffset();
        
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Timezone-Offset': timezoneOffset
          }
        });
        
        console.log('Productivity trend API response:', response.data);
        
        if (response.data && Array.isArray(response.data.weeklyData)) {
          setWeeklyData(response.data.weeklyData);
          setChange(response.data.change || 0);
          
          if (response.data.detailedStats) {
            setDetailedStats(response.data.detailedStats);
          }
          
          // Set the number of full weeks the user has been active
          if (response.data.fullWeeks !== undefined) {
            setFullWeeks(response.data.fullWeeks);
          }
          
          // Check if the user is new
          if (response.data.isNewUser !== undefined) {
            setIsNewUser(response.data.isNewUser);
          }
          
          // Set user created at date
          if (response.data.userCreatedAt) {
            setUserCreatedAt(new Date(response.data.userCreatedAt));
          }
        } else {
          console.warn('Invalid data format received from productivity trend API');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching productivity trend:', err);
        setError('Failed to load productivity trend data');
        setLoading(false);
      }
    };
    
    fetchProductivityTrend();
  }, []);

  // Calculate if change is positive
  const isPositive = change >= 0;

  // Generate appropriate week labels based on user account age
  const getWeekLabels = () => {
    // If we don't have full 4 weeks of data yet
    if (fullWeeks < 4 && userCreatedAt) {
      // For new users, show labels relative to when they joined
      const labels = [];
      
      for (let i = 0; i < 4; i++) {
        if (i < fullWeeks) {
          // For active weeks, show "Week 1", "Week 2", etc.
          // The weeks should be ordered from oldest to newest (left to right)
          labels.push(`Week ${fullWeeks - i}`);
        } else {
          // For weeks before the user joined, show "N/A"
          labels.push("N/A");
        }
      }
      // Reverse the labels to show oldest first
      return labels.reverse();
    }
    
    // Default labels for users with 4+ weeks of data
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  };

  // Prepare the data for the chart, removing connections between active and inactive weeks
  const prepareChartData = () => {
    // Create the dataset without connecting inactive weeks
    let processedData = [];
    
    // If we have detailed stats for the weeks, display in chronological order (oldest to newest)
    if (detailedStats && detailedStats.length) {
      // Reverse the detailed stats to show oldest first
      const orderedStats = [...detailedStats].reverse();
      
      for (let i = 0; i < weeklyData.length; i++) {
        const stat = orderedStats[i];
        
        // For active weeks, use the actual score
        if (stat && stat.hasData) {
          processedData.push(stat.productivityScore);
        } else {
          // For inactive weeks, use null to create a gap in the line
          processedData.push(null);
        }
      }
    } else {
      // If no detailed stats, use the raw data but reverse it
      processedData = [...weeklyData].reverse();
    }
    
    return processedData;
  };

  const data = {
    labels: getWeekLabels(),
    datasets: [
      {
        label: 'Completion Rate',
        data: prepareChartData(),
        borderColor: '#4A2BAF',
        backgroundColor: 'rgba(74, 43, 175, 0.1)',
        tension: 0.3,
        fill: 'start',
        // Add a custom pointStyle function to show different point styles for weeks without data
        pointStyle: (ctx) => {
          if (detailedStats && detailedStats[ctx.dataIndex]) {
            return detailedStats[ctx.dataIndex].hasData ? 'circle' : 'cross';
          }
          return 'circle';
        },
        // Set point radius based on whether the week has data
        pointRadius: (ctx) => {
          // For data points that have null value (gaps in the line)
          if (ctx.raw === null) return 0;
          
          if (detailedStats && detailedStats[ctx.dataIndex]) {
            return detailedStats[ctx.dataIndex].hasData ? 4 : 0;
          }
          return 4;
        },
        // Set border color for points
        pointBackgroundColor: '#4A2BAF',
        pointBorderColor: '#FFFFFF',
        // Don't show line segment to/from null values
        spanGaps: false
      }
    ]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        mode: 'index',
        intersect: false,
        callbacks: {
          label: function(context) {
            // Use the reversed index to match our chronological display
            const weekIndex = detailedStats.length - 1 - context.dataIndex;
            const weekStats = detailedStats[weekIndex];
            
            // For weeks where the user wasn't active yet
            if (!weekStats || !weekStats.hasData) {
              return 'Not active during this week';
            }
            
            return `Completion Rate: ${context.raw || 0}%`;
          },
          // Add detailed stats to tooltip if available
          afterLabel: function(context) {
            // Use the reversed index to match our chronological display
            const weekIndex = detailedStats.length - 1 - context.dataIndex;
            if (detailedStats && detailedStats[weekIndex] && detailedStats[weekIndex].hasData) {
              const stats = detailedStats[weekIndex];
              
              // Only show stats that have data
              const tooltipLines = [];
              
              if (stats.tasks.total > 0) {
                tooltipLines.push(`Tasks: ${stats.tasks.completed}/${stats.tasks.total}`);
              }
              
              if (stats.routines.total > 0) {
                tooltipLines.push(`Routines: ${stats.routines.completed}/${stats.routines.total}`);
              }
              
              if (stats.habits.opportunities > 0) {
                // Cap habit completions to opportunities to avoid showing illogical ratios like 14/7
                const cappedHabitCompletions = Math.min(stats.habits.completed, stats.habits.opportunities);
                tooltipLines.push(`Habits: ${cappedHabitCompletions}/${stats.habits.opportunities}`);
              }
              
              return tooltipLines.length > 0 ? tooltipLines : ['No activities recorded'];
            }
            return null;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function(value) {
            return value + '%';
          },
          stepSize: 20
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)'
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    elements: {
      point: {
        radius: 4,
        hoverRadius: 6
      },
      line: {
        borderWidth: 3
      }
    }
  };

  // Generate appropriate message based on user account age
  const getChangeMessage = () => {
    if (isNewUser || fullWeeks < 2) {
      return "Welcome! Start tracking your productivity";
    }
    
    // Don't show change if it's absurdly high from a small data sample
    if (Math.abs(change) > 50) {
      return "Building your productivity history...";
    }
    
    return `${isPositive ? '↑' : '↓'} ${Math.abs(change)}% from last week`;
  };

  // Find the most recent week's score
  const getCurrentScore = () => {
    if (!detailedStats || detailedStats.length === 0) return null;
    
    const activeWeeks = detailedStats.filter(week => week.hasData);
    if (activeWeeks.length === 0) return null;
    
    // Return the most recent week's score
    return activeWeeks[0].productivityScore;
  };

  // Get appropriate color based on the score
  const getScoreColor = (score) => {
    if (score === null) return 'text-gray-500';
    if (score >= 70) return 'text-green-600';
    if (score >= 40) return 'text-amber-500';
    return 'text-red-500';
  };

  const currentScore = getCurrentScore();

  return (
    <motion.div 
      className="bg-white text-gray-800 rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Productivity Trend</h2>
        <div className="flex items-center space-x-4">
          {currentScore !== null && (
            <div className={`text-sm font-medium ${getScoreColor(currentScore)}`}>
              Current: {currentScore}%
            </div>
          )}
          <div className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'} flex items-center`}>
            {getChangeMessage()}
          </div>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-[200px]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : error ? (
        <div className="flex justify-center items-center h-[200px] text-red-500">
          {error}
        </div>
      ) : (
        <div className="h-[200px]">
          <Line data={data} options={options} />
        </div>
      )}
      
      {isNewUser && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Start completing tasks, routines, and habits to see your productivity trend
        </div>
      )}
      
      {!isNewUser && fullWeeks < 4 && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Your full productivity history will appear after you've been active for 4 weeks
        </div>
      )}
    </motion.div>
  );
};

export default ProductivityTrend; 