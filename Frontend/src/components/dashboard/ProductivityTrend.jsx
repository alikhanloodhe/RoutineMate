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
        
        const response = await axios.get(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`
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
    // If we have detailed stats, use them to generate date-based labels
    if (detailedStats && detailedStats.length > 0) {
      // Create array to hold labels, with oldest week first (reversed)
      const labels = [];
      
      // Create a copy of detailedStats and reverse to get oldest first
      const orderedStats = [...detailedStats].reverse();
      
      orderedStats.forEach((stat, index) => {
        if (stat && stat.weekLabel) {
          // Format date to like "Apr 28" or "May 5"
          const date = new Date(stat.weekLabel);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          labels.push(formattedDate);
        } else {
          labels.push("N/A");
        }
      });
      
      // Pad with N/A if we have less than 4 weeks
      while (labels.length < 4) {
        labels.unshift("N/A");
      }
      
      return labels;
    }
    
    // Fallback to generic week labels
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
      
      for (let i = 0; i < orderedStats.length; i++) {
        const stat = orderedStats[i];
        
        // For active weeks, use the actual score
        if (stat && stat.hasRealData) {
          processedData.push(stat.productivityScore);
        } else {
          // For inactive weeks, use null to create a gap in the line
          processedData.push(null);
        }
      }
      
      // Pad with nulls if we have less than 4 weeks
      while (processedData.length < 4) {
        processedData.unshift(null);
      }
    } else {
      // If no detailed stats, use the raw data but reverse it
      processedData = [...weeklyData].reverse();
    }
    
    return processedData;
  };

  // Get the chart data
  const data = {
    labels: getWeekLabels(),
    datasets: [
      {
        label: 'Productivity Score',
        data: prepareChartData(),
        fill: {
          target: 'origin',
          above: 'rgba(75, 192, 192, 0.2)',
        },
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(75, 192, 192, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHitRadius: 10,
        tension: 0.4,
        spanGaps: false // Do not connect points with null data
      }
    ]
  };

  // Chart options
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            // Get the week from detailed stats
            if (detailedStats && detailedStats.length) {
              const statIndex = detailedStats.length - 1 - context.dataIndex;
              const stat = statIndex >= 0 && statIndex < detailedStats.length ? detailedStats[statIndex] : null;
              
              if (stat && stat.hasRealData) {
                return [
                  `Score: ${stat.productivityScore}%`,
                  `Tasks: ${stat.tasks.completed}/${stat.tasks.due}`,
                  stat.milestones && `Milestones: ${stat.milestones.completed}/${stat.milestones.due}`,
                  `Routines: ${stat.routines.completed}/${stat.routines.total}`,
                  `Habits: ${stat.habits.completed}/${stat.habits.opportunities}`
                ].filter(Boolean);
              }
            }
            
            return `Score: ${context.raw}%`;
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
          }
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    }
  };

  // Get the most recent productivity score, carefully handling possible empty data
  const getCurrentScore = () => {
    if (detailedStats && detailedStats.length > 0) {
      const latestWeek = detailedStats[0];
      return latestWeek.hasRealData ? latestWeek.productivityScore : null;
    }
    
    if (weeklyData && weeklyData.length > 0) {
      return weeklyData[0];
    }
    
    return null;
  };

  const currentScore = getCurrentScore();

  // Get a color based on the score
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600'; // Excellent
    if (score >= 60) return 'text-emerald-500'; // Good
    if (score >= 40) return 'text-yellow-500'; // Adequate
    if (score >= 20) return 'text-orange-500'; // Needs improvement
    return 'text-red-500'; // Poor
  };

  // Get a message about the productivity change
  const getChangeMessage = () => {
    if (change === 0) return 'No change';
    
    const arrow = isPositive ? '↑' : '↓';
    const absChange = Math.abs(change);
    
    if (absChange < 5) {
      return `${arrow} ${absChange}% Slight ${isPositive ? 'increase' : 'decrease'}`;
    } else if (absChange < 15) {
      return `${arrow} ${absChange}% ${isPositive ? 'Improving' : 'Decreasing'}`;
    } else {
      return `${arrow} ${absChange}% Significant ${isPositive ? 'improvement' : 'decrease'}`;
    }
  };

  // Format a date for display in the table
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
  };

  // Render a details table for all metrics
  const renderMetricsTable = () => {
    if (!detailedStats || detailedStats.length === 0) {
      return null;
    }

    // Only show the table if we have real data
    const hasAnyRealData = detailedStats.some(stat => stat.hasRealData);
    if (!hasAnyRealData) {
      return null;
    }

    return (
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600">
          <thead className="text-xs text-gray-700 bg-gray-100">
            <tr>
              <th className="px-2 py-2">Week</th>
              <th className="px-2 py-2">Tasks</th>
              <th className="px-2 py-2">Milestones</th>
              <th className="px-2 py-2">Routines</th>
              <th className="px-2 py-2">Habits</th>
              <th className="px-2 py-2">Score</th>
            </tr>
          </thead>
          <tbody>
            {detailedStats.map((stat, index) => (
              <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-2 py-2 font-medium">{formatDate(stat.weekLabel)}</td>
                <td className="px-2 py-2">
                  {stat.hasRealData ? 
                    <span className={stat.taskScore >= 70 ? 'text-green-600' : stat.taskScore >= 40 ? 'text-yellow-500' : 'text-red-500'}>
                      {stat.tasks.completed}/{stat.tasks.due} ({stat.taskScore}%)
                    </span> : 'N/A'}
                </td>
                <td className="px-2 py-2">
                  {stat.hasRealData && stat.milestones ? 
                    <span className={stat.milestoneScore >= 70 ? 'text-green-600' : stat.milestoneScore >= 40 ? 'text-yellow-500' : 'text-red-500'}>
                      {stat.milestones.completed}/{stat.milestones.due} ({stat.milestoneScore}%)
                    </span> : 'N/A'}
                </td>
                <td className="px-2 py-2">
                  {stat.hasRealData ? 
                    <span className={stat.routineScore >= 70 ? 'text-green-600' : stat.routineScore >= 40 ? 'text-yellow-500' : 'text-red-500'}>
                      {stat.routines.completed}/{stat.routines.total} ({stat.routineScore}%)
                    </span> : 'N/A'}
                </td>
                <td className="px-2 py-2">
                  {stat.hasRealData ? 
                    <span className={stat.habitScore >= 70 ? 'text-green-600' : stat.habitScore >= 40 ? 'text-yellow-500' : 'text-red-500'}>
                      {stat.habits.completed}/{stat.habits.opportunities} ({stat.habitScore}%)
                    </span> : 'N/A'}
                </td>
                <td className={`px-2 py-2 font-bold ${getScoreColor(stat.productivityScore)}`}>
                  {stat.hasRealData ? `${stat.productivityScore}%` : 'N/A'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

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
      
      {renderMetricsTable()}
      
      {isNewUser && (
        <div className="mt-3 text-xs text-gray-500 text-center">
          Start completing tasks, routines, habits, and goal milestones to see your productivity trend
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