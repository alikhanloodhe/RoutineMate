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
        
        console.log('FULL API RESPONSE:', response);
        console.log('Productivity trend API response:', response.data);

        // Process the API response data
        if (response.data) {
          // Use weeklyData and change directly from response
          if (Array.isArray(response.data.weeklyData)) {
            setWeeklyData(response.data.weeklyData);
            console.log('Weekly data extracted:', response.data.weeklyData);
            
            // Use change value directly from response
            setChange(response.data.change || 0);
            console.log('Change value:', response.data.change);
          }
          
          // Use detailedStats from response
          if (Array.isArray(response.data.detailedStats)) {
            setDetailedStats(response.data.detailedStats);
            console.log('Detailed stats set:', response.data.detailedStats);
          } else {
            console.warn('Invalid detailedStats format in API response');
            
            // Use fallback mock data in this case
            useMockData();
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
          console.warn('No data received from productivity trend API');
          // Use mock data as fallback
          useMockData();
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching productivity trend data:', err);
        setError('Failed to load productivity trend data');
        setLoading(false);
        
        // Use mock data in case of error
        useMockData();
      }
    };
    
    // Helper function to set mock data when needed
    const useMockData = () => {
      console.log('Using mock data');
      const mockData = [
        {
          weekLabel: '2023-05-12',
          productivityScore: 65,
          tasks: { completed: 1, due: 5 },
          milestones: { completed: 0, due: 0 },
          routines: { completed: 4, total: 18 },
          habits: { completed: 2, opportunities: 2 },
          hasRealData: true
        },
        {
          weekLabel: '2023-05-05',
          productivityScore: 88,
          tasks: { completed: 10, due: 8 },
          milestones: { completed: 3, due: 5 },
          routines: { completed: 12, total: 18 },
          habits: { completed: 9, opportunities: 9 },
          hasRealData: true
        },
        {
          weekLabel: '2023-04-28',
          productivityScore: 67,
          tasks: { completed: 0, due: 1 },
          milestones: { completed: 1, due: 1 },
          routines: { completed: 0, total: 0 },
          habits: { completed: 1, opportunities: 1 },
          hasRealData: true
        }
      ];
      
      setWeeklyData(mockData.map(week => week.productivityScore));
      setDetailedStats(mockData);
      setChange(mockData[0].productivityScore - mockData[1].productivityScore);
    };
    
    fetchProductivityTrend();
  }, []);

  // Calculate if change is positive
  const isPositive = change >= 0;

  // Generate appropriate week labels based on user account age
  const getWeekLabels = () => {
    // If we have detailed stats, use them to generate date-based labels
    if (detailedStats && detailedStats.length > 0) {
      // Create array to hold labels, ordered from oldest to newest
      const labels = [];
      
      // Process detailedStats to display from oldest to newest (chronologically left to right)
      // No need to reverse - SQL query already orders them DESC, so oldest is at the end of array
      [...detailedStats].reverse().forEach(stat => {
        if (stat && (stat.week_label || stat.weekLabel)) {
          // Format date to like "Apr 28" or "May 5"
          const dateStr = stat.week_label || stat.weekLabel;
          const date = new Date(dateStr);
          const formattedDate = date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
          });
          labels.push(formattedDate);
        } else {
          labels.push("N/A");
        }
      });
      
      // Pad with N/A if we have less than 4 weeks (at the beginning)
      while (labels.length < 4) {
        labels.unshift("N/A");
      }
      
      console.log('Generated chart labels:', labels);
      return labels;
    }
    
    // Fallback to generic week labels
    return ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
  };

  // Maps formatted date strings (like "May 5") to the corresponding details
  const createDateDetailsMap = () => {
    const map = {};
    
    if (detailedStats && detailedStats.length > 0) {
      detailedStats.forEach(stat => {
        if (stat) {
          const dateStr = stat.week_label || stat.weekLabel;
          if (dateStr) {
            const date = new Date(dateStr);
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
            
            map[formattedDate] = stat;
          }
        }
      });
    }
    
    console.log('Date to details map:', map);
    return map;
  };
  
  // Create the lookup table once
  const dateDetailsMap = createDateDetailsMap();

  // Prepare the data for the chart
  const prepareChartData = () => {
    console.log('Preparing chart data with detailedStats:', detailedStats);
    
    // Create a simple mapping of date strings to scores for direct lookup
    const dateToScoreMap = {};
    
    if (detailedStats && detailedStats.length > 0) {
      // Create mapping of formatted dates to scores
      detailedStats.forEach(stat => {
        if (stat) {
          const dateStr = stat.week_label || stat.weekLabel;
          if (dateStr) {
            const date = new Date(dateStr);
            const formattedDate = date.toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            });
            
            // Map the formatted date to its score (use productivityScore directly from data)
            const score = stat.productivity_score || stat.productivityScore;
            dateToScoreMap[formattedDate] = score || null;
            console.log(`Mapped ${formattedDate} to score ${dateToScoreMap[formattedDate]}`);
          }
        }
      });
    }
    
    // Get labels that will be used in the chart
    const chartLabels = getWeekLabels();
    console.log('Chart labels:', chartLabels);
    
    // Map each label to its corresponding score
    const chartData = chartLabels.map(label => {
      const score = dateToScoreMap[label] !== undefined ? dateToScoreMap[label] : null;
      console.log(`Label ${label} maps to score ${score}`);
      return score;
    });
    
    console.log('Final chart data:', chartData);
    return chartData;
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

  console.log('Final chart configuration:', data);

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
          title: function(context) {
            return context[0].label;
          },
          label: function(context) {
            const pointLabel = context.chart.data.labels[context.dataIndex];
            console.log('Tooltip requested for:', pointLabel);
            
            // Look up the details for this date directly from our map
            const details = dateDetailsMap[pointLabel];
            console.log('Found details:', details);
            
            if (details) {
              // Support both property name formats
              const score = details.productivity_score || details.productivityScore;
              const tasksCompleted = details.tasks_completed || (details.tasks ? details.tasks.completed : 0);
              const tasksDue = details.tasks_due || (details.tasks ? details.tasks.due : 0);
              const milestonesCompleted = details.milestones_completed || (details.milestones ? details.milestones.completed : 0);
              const milestonesDue = details.milestones_due || (details.milestones ? details.milestones.due : 0);
              const routinesCompleted = details.routines_completed || (details.routines ? details.routines.completed : 0);
              const routinesTotal = details.routines_total || (details.routines ? details.routines.total : 0);
              const habitsCompleted = details.habits_completed || (details.habits ? details.habits.completed : 0);
              const habitsOpportunities = details.habits_opportunities || (details.habits ? details.habits.opportunities : 0);
              
              return [
                `Score: ${score}%`,
                `Tasks: ${tasksCompleted}/${tasksDue}`,
                `Milestones: ${milestonesCompleted}/${milestonesDue}`,
                `Routines: ${routinesCompleted}/${routinesTotal}`,
                `Habits: ${habitsCompleted}/${habitsOpportunities}`
              ];
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
      // Latest week is the first one in the array
      const latestWeek = detailedStats[0];
      // Support both property name formats
      return latestWeek.productivity_score || latestWeek.productivityScore || null;
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
    const hasAnyRealData = detailedStats.some(stat => {
      const score = stat.productivity_score || stat.productivityScore;
      return score > 0;
    });
    
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
            {/* Display stats in chronological order (oldest to newest) */}
            {[...detailedStats].reverse().map((stat, index) => {
              // Support both property name formats
              const weekLabel = stat.week_label || stat.weekLabel;
              const score = stat.productivity_score || stat.productivityScore;
              const tasksCompleted = stat.tasks_completed || (stat.tasks ? stat.tasks.completed : 0);
              const tasksDue = stat.tasks_due || (stat.tasks ? stat.tasks.due : 0);
              const milestonesCompleted = stat.milestones_completed || (stat.milestones ? stat.milestones.completed : 0);
              const milestonesDue = stat.milestones_due || (stat.milestones ? stat.milestones.due : 0);
              const routinesCompleted = stat.routines_completed || (stat.routines ? stat.routines.completed : 0);
              const routinesTotal = stat.routines_total || (stat.routines ? stat.routines.total : 0);
              const habitsCompleted = stat.habits_completed || (stat.habits ? stat.habits.completed : 0);
              const habitsOpportunities = stat.habits_opportunities || (stat.habits ? stat.habits.opportunities : 0);
              
              return (
                <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="px-2 py-2 font-medium">{formatDate(weekLabel)}</td>
                  <td className="px-2 py-2">
                    <span className={tasksCompleted / (tasksDue || 1) >= 0.7 ? 'text-green-600' : 
                                     tasksCompleted / (tasksDue || 1) >= 0.4 ? 'text-yellow-500' : 'text-red-500'}>
                      {tasksCompleted}/{tasksDue}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className={milestonesCompleted / (milestonesDue || 1) >= 0.7 ? 'text-green-600' : 
                                     milestonesCompleted / (milestonesDue || 1) >= 0.4 ? 'text-yellow-500' : 'text-red-500'}>
                      {milestonesCompleted}/{milestonesDue}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className={routinesCompleted / (routinesTotal || 1) >= 0.7 ? 'text-green-600' : 
                                     routinesCompleted / (routinesTotal || 1) >= 0.4 ? 'text-yellow-500' : 'text-red-500'}>
                      {routinesCompleted}/{routinesTotal}
                    </span>
                  </td>
                  <td className="px-2 py-2">
                    <span className={habitsCompleted / (habitsOpportunities || 1) >= 0.7 ? 'text-green-600' : 
                                     habitsCompleted / (habitsOpportunities || 1) >= 0.4 ? 'text-yellow-500' : 'text-red-500'}>
                      {habitsCompleted}/{habitsOpportunities}
                    </span>
                  </td>
                  <td className={`px-2 py-2 font-bold ${getScoreColor(score)}`}>
                    {score ? `${score}%` : 'N/A'}
                  </td>
                </tr>
              );
            })}
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