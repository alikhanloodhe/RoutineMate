import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronLeft, FiChevronRight, FiArrowLeft, FiClock } from 'react-icons/fi';
import PageHeader from '../components/ui/PageHeader';

const TaskHistory = ({ goBack }) => {
  // State for filters and pagination
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  // State for API data
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalCompletedTasks: 0,
    completionRate: 0,
    productivityScore: 0
  });
  const [pagination, setPagination] = useState({
    totalPages: 1,
    totalItems: 0
  });

  // Debounce search query
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);

  // Convert front-end time filter to API parameter
  const getTimeFrameParam = (filter) => {
    switch(filter) {
      case 'This Week': return 'this-week';
      case 'This Month': return 'this-month';
      case 'Last Month': return 'last-month';
      case 'All Time': 
      default: return 'all-time';
    }
  };

  // Fetch task history data from API with proper error handling
  const fetchTaskHistory = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }
      
      const timeFrameParam = getTimeFrameParam(timeFilter);
      const apiUrl = `${import.meta.env.VITE_API_URL}/api/Tasks/taskHistory?page=${currentPage}&timeFrame=${timeFrameParam}&search=${encodeURIComponent(debouncedSearchQuery)}`;
      
      console.log('Fetching task history from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Task history API response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `Failed to fetch task history: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        throw new Error(errorMessage);
      }
      
      const data = await response.json();
      console.log('Task history data received:', data);
      
      if (!data || !data.tasks) {
        console.error('Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }
      
      setFilteredHistory(data.tasks || []);
      setStats({
        totalCompletedTasks: data.stats?.totalCompletedTasks || 0,
        completionRate: data.stats?.completionRate || 0,
        productivityScore: data.stats?.productivityScore || 0
      });
      setPagination(data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0 });
    } catch (error) {
      console.error('Error fetching task history:', error);
      setError(error.message || 'Failed to load task history');
      setFilteredHistory([]);
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, timeFilter, debouncedSearchQuery]);
  
  // Fetch data on initial load and when filters change
  useEffect(() => {
    fetchTaskHistory();
  }, [fetchTaskHistory]);

  const getPerformanceColor = (performance) => {
    switch(performance) {
      case 'On Track':
        return 'text-green-600';
      case 'Delayed':
        return 'text-orange-500';
      case 'Early':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const getPerformanceIcon = (performance) => {
    switch(performance) {
      case 'On Track':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      case 'Delayed':
        return <div className="w-2 h-2 rounded-full bg-orange-500 mr-2"></div>;
      case 'Early':
        return <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>;
      default:
        return null;
    }
  };

  // Format time values for display
  const formatTimeString = (timeStr) => {
    if (!timeStr || timeStr === 'Not set' || timeStr === 'Not tracked') {
      return timeStr;
    }
    
    // If it has a formatted property, use that
    if (typeof timeStr === 'object' && timeStr.formatted) {
      return timeStr.formatted;
    }
    
    // If it's already a formatted string with h and m
    if (typeof timeStr === 'string' && timeStr.includes('h') && timeStr.includes('m')) {
      return timeStr;
    }
    
    // Handle the format from backend "X hours Y minutes"
    if (typeof timeStr === 'string') {
      const hoursMatch = timeStr.match(/(\d+)\s*hours?/);
      const minutesMatch = timeStr.match(/(\d+)\s*minutes?/);
      
      const hours = hoursMatch ? parseInt(hoursMatch[1]) : 0;
      const minutes = minutesMatch ? parseInt(minutesMatch[1]) : 0;
      
      return `${hours}h ${minutes}m`;
    }
    
    // For any other format
    return 'Unknown';
  };

  return (
    <div className="bg-gray-50 min-h-screen w-full" id="task-history-container">
      <div className="px-4 sm:px-6 py-6">
        {/* Header with back button */}
        <div className="flex items-center mb-6">
          <button 
            onClick={goBack}
            className="p-2 mr-3 rounded-full hover:bg-gray-100"
          >
            <FiArrowLeft className="text-gray-700" />
          </button>
          <PageHeader
            title="Task History"
            subtitle="View and analyze your completed tasks"
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 overflow-x-auto">
            <motion.div 
              className="bg-white p-4 rounded-xl shadow-sm min-w-[200px]"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Total Tasks</span>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-[#1C1C1C]">{stats.totalCompletedTasks}</span>
                  <div className="ml-auto p-2 bg-blue-100 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9 5H7C6.46957 5 5.96086 5.21071 5.58579 5.58579C5.21071 5.96086 5 6.46957 5 7V19C5 19.5304 5.21071 20.0391 5.58579 20.4142C5.96086 20.7893 6.46957 21 7 21H17C17.5304 21 18.0391 20.7893 18.4142 20.4142C18.7893 20.0391 19 19.5304 19 19V7C19 6.46957 18.7893 5.96086 18.4142 5.58579C18.0391 5.21071 17.5304 5 17 5H15" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 5C9 4.46957 9.21071 3.96086 9.58579 3.58579C9.96086 3.21071 10.4696 3 11 3H13C13.5304 3 14.0391 3.21071 14.4142 3.58579C14.7893 3.96086 15 4.46957 15 5C15 5.53043 14.7893 6.03914 14.4142 6.41421C14.0391 6.78929 13.5304 7 13 7H11C10.4696 7 9.96086 6.78929 9.58579 6.41421C9.21071 6.03914 9 5.53043 9 5Z" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M9 14L11 16L15 12" stroke="#4F46E5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white p-4 rounded-xl shadow-sm min-w-[200px]"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Avg. Completion Rate</span>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-[#1C1C1C]">{stats.completionRate.toFixed(1)}%</span>
                  <div className="ml-auto p-2 bg-green-100 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M3 3V21H21" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 5L12 12L9 9L4 14" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 9V5H15" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              className="bg-white p-4 rounded-xl shadow-sm min-w-[200px] sm:col-span-2 lg:col-span-1"
              whileHover={{ y: -5, transition: { duration: 0.2 } }}
            >
              <div className="flex flex-col">
                <span className="text-sm text-gray-500">Productivity Score</span>
                <div className="flex items-center">
                  <span className="text-3xl font-bold text-[#1C1C1C]">{stats.productivityScore.toFixed(1)}/10</span>
                  <div className="ml-auto p-2 bg-purple-100 rounded-lg">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M11.4806 3.49883C11.6728 3.01215 12.3272 3.01215 12.5193 3.49883L14.6453 8.61028C14.7263 8.80504 14.9095 8.93811 15.1195 8.95497L20.638 9.39736C21.1596 9.43735 21.3719 10.0598 20.9653 10.3853L16.7974 13.7634C16.6349 13.8932 16.5628 14.1038 16.6116 14.304L17.874 19.7016C17.9888 20.2102 17.4586 20.6106 17.0103 20.3405L12.3383 17.6518C12.1637 17.5506 11.9462 17.5506 11.7716 17.6518L7.09965 20.3405C6.6514 20.6106 6.1212 20.2102 6.23597 19.7016L7.49835 14.304C7.54714 14.1038 7.47509 13.8932 7.31259 13.7634L3.14466 10.3853C2.73807 10.0598 2.95029 9.43735 3.47191 9.39736L8.99037 8.95497C9.20046 8.93811 9.38365 8.80504 9.46461 8.61028L11.4806 3.49883Z" stroke="#8B5CF6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
            <div className="relative w-full md:max-w-md">
              <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search tasks..." 
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex-shrink-0">
              <select 
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent w-full"
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="All Time">All Time</option>
                <option value="This Week">This Week</option>
                <option value="This Month">This Month</option>
                <option value="Last Month">Last Month</option>
              </select>
            </div>
          </div>

          {/* Error message display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <button 
                onClick={() => fetchTaskHistory()} 
                className="text-sm underline mt-1"
              >
                Try again
              </button>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A2BAF]"></div>
            </div>
          )}

          {/* Tasks Table */}
          {!isLoading && (
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
              {filteredHistory.length > 0 ? (
                <div className="overflow-x-auto w-full">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Task Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estimated Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actual Time
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredHistory.map((task) => (
                        <motion.tr 
                          key={task.id}
                          whileHover={{ backgroundColor: '#f9fafb' }}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="bg-blue-100 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                                <code className="text-blue-600">&lt;/&gt;</code>
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">{task.name}</div>
                                <div className="text-xs text-gray-500">Completed on {task.completionDate}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            <span className="text-sm">
                              {formatTimeString(task.estimatedTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                            <span className="text-sm font-medium">
                              {formatTimeString(task.actualTime)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right">
                            <div className="flex items-center justify-end">
                              {getPerformanceIcon(task.performance)}
                              <span className={`text-sm font-medium ${getPerformanceColor(task.performance)}`}>
                                {task.performance}
                              </span>
                            </div>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <FiClock className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-1">No completed tasks found</h3>
                  <p className="text-gray-500 mb-4 max-w-md">
                    You don't have any completed tasks in the selected time period.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Pagination */}
          {!isLoading && pagination.totalPages > 1 && (
            <div className="flex justify-center items-center space-x-1 flex-wrap my-6">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FiChevronLeft />
              </button>
              
              {/* Page numbers - show limited on mobile */}
              <div className="hidden sm:flex space-x-1">
                {[...Array(pagination.totalPages)].map((_, i) => {
                  // On mobile, only show current +/- 1 and first/last pages
                  const pageNum = i + 1;
                  
                  // Always show current page, first and last page, and +/- 1 from current
                  const showPage = pageNum === 1 || 
                                  pageNum === pagination.totalPages || 
                                  Math.abs(pageNum - currentPage) <= 1;
                  
                  // Insert ellipsis where needed
                  if (!showPage) {
                    if (pageNum === 2 || pageNum === pagination.totalPages - 1) {
                      return (
                        <span key={`ellipsis-${i}`} className="px-3 py-2">...</span>
                      );
                    }
                    return null;
                  }
                  
                  return (
                    <button
                      key={i}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`px-3 py-2 rounded-md ${
                        currentPage === i + 1
                          ? 'bg-[#5D4EFF] text-white'
                          : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              
              {/* Mobile-friendly current page indicator */}
              <span className="flex sm:hidden items-center px-3 py-2 text-gray-600">
                Page {currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 rounded-md bg-white border border-gray-300 text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <FiChevronRight />
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TaskHistory; 