import React, { useState, useEffect } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import { motion } from 'framer-motion';
import { FiSearch, FiChevronLeft, FiChevronRight, FiArrowLeft, FiDownload, FiClock } from 'react-icons/fi';

const TaskHistory = ({ goBack }) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [timeFilter, setTimeFilter] = useState('All Time');
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample history data
  const historyData = [
    {
      id: 1,
      name: 'Website Redesign',
      status: 'Completed',
      completionDate: 'May 1, 2025',
      estimatedTime: '4h 30m',
      actualTime: '4h 15m',
      performance: 'On Track'
    },
    {
      id: 2,
      name: 'Content Writing',
      status: 'Completed',
      completionDate: 'Apr 28, 2025',
      estimatedTime: '2h 00m',
      actualTime: '2h 45m',
      performance: 'Delayed'
    },
    {
      id: 3,
      name: 'Mobile App Testing',
      status: 'Completed',
      completionDate: 'Apr 25, 2025',
      estimatedTime: '3h 00m',
      actualTime: '2h 30m',
      performance: 'Early'
    }
  ];

  const [filteredHistory, setFilteredHistory] = useState(historyData);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Filter tasks based on search and time filter
  useEffect(() => {
    let filtered = [...historyData];
    
    if (searchQuery) {
      filtered = filtered.filter(task => 
        task.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // For a real app, you would implement time-based filtering here
    
    setFilteredHistory(filtered);
  }, [searchQuery, timeFilter]);

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

  const totalPages = Math.ceil(filteredHistory.length / 10);

  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      <div className="flex h-[calc(100vh-60px)]">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header with back button */}
            <div className="flex items-center mb-6">
              <button 
                onClick={goBack}
                className="p-2 mr-3 rounded-full hover:bg-gray-100"
              >
                <FiArrowLeft className="text-gray-700" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-[#1C1C1C] flex items-center">
                  <FiClock className="mr-2" />
                  Task History
                </h1>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <motion.div 
                className="bg-white p-4 rounded-xl shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Total Tasks</span>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-[#1C1C1C]">248</span>
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
                className="bg-white p-4 rounded-xl shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Avg. Completion Rate</span>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-[#1C1C1C]">92%</span>
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
                className="bg-white p-4 rounded-xl shadow-sm"
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="flex flex-col">
                  <span className="text-sm text-gray-500">Productivity Score</span>
                  <div className="flex items-center">
                    <span className="text-3xl font-bold text-[#1C1C1C]">8.5/10</span>
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
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div className="relative mb-4 md:mb-0 max-w-md">
                <FiSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search tasks..." 
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(e.target.value)}
                >
                  <option value="All Time">All Time</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="Last Month">Last Month</option>
                </select>
                <button className="flex items-center px-4 py-2 bg-[#5D4EFF] text-white rounded-md shadow-sm hover:bg-[#4A2BAF] transition-colors">
                  <FiDownload className="mr-2" />
                  Export
                </button>
              </div>
            </div>

            {/* Tasks Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-6">
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
                          {task.estimatedTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500">
                        <span className="text-sm">
                          {task.actualTime}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        <div className="flex items-center justify-end">
                          {getPerformanceIcon(task.performance)}
                          <span className={`${getPerformanceColor(task.performance)}`}>
                            {task.performance}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing <span className="font-medium">1-3</span> of <span className="font-medium">248</span> tasks
              </div>
              <div className="flex items-center space-x-2">
                <button 
                  className="p-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                >
                  <FiChevronLeft />
                </button>
                <span className="inline-flex">
                  {currentPage > 1 && (
                    <button 
                      className="px-3 py-1 rounded-md"
                      onClick={() => setCurrentPage(1)}
                    >
                      1
                    </button>
                  )}
                  
                  {currentPage > 3 && <span className="px-2 py-1">...</span>}
                  
                  {currentPage > 2 && (
                    <button 
                      className="px-3 py-1 rounded-md"
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      {currentPage - 1}
                    </button>
                  )}
                  
                  <button className="px-3 py-1 rounded-md bg-[#5D4EFF] text-white">
                    {currentPage}
                  </button>
                  
                  {currentPage < totalPages - 1 && (
                    <button 
                      className="px-3 py-1 rounded-md"
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      {currentPage + 1}
                    </button>
                  )}
                  
                  {currentPage < totalPages - 2 && <span className="px-2 py-1">...</span>}
                  
                  {currentPage < totalPages && (
                    <button 
                      className="px-3 py-1 rounded-md"
                      onClick={() => setCurrentPage(totalPages)}
                    >
                      {totalPages}
                    </button>
                  )}
                </span>
                <button 
                  className="p-2 border border-gray-300 rounded-md text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                >
                  <FiChevronRight />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TaskHistory; 