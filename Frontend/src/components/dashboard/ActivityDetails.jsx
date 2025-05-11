import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Calendar, CheckSquare, Target, Search, Filter, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getRecentActivities } from '../../services/activityLogService';

const ActivityDetails = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 0,
    totalPages: 1,
    hasMore: true
  });
  
  const observer = useRef();
  const lastActivityElementRef = useCallback(node => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && pagination.hasMore) {
        loadMoreActivities();
      }
    });
    
    if (node) observer.current.observe(node);
  }, [loading, pagination.hasMore]);
  
  // Function to load more activities when scrolling
  const loadMoreActivities = async () => {
    if (!pagination.hasMore || loading) return;
    
    try {
      setLoading(true);
      const nextPage = pagination.currentPage + 1;
      const result = await getRecentActivities(nextPage, 10);
      
      // Append new activities to the existing list
      setActivities(prevActivities => [...prevActivities, ...result.activities]);
      setPagination(result.pagination);
      setLoading(false);
    } catch (err) {
      console.error('Error loading more activities:', err);
      setError('Failed to load more activities. Please try again.');
      setLoading(false);
    }
  };
  
  // Initial data fetch when modal opens
  useEffect(() => {
    if (isOpen) {
      const fetchInitialActivities = async () => {
        try {
          setLoading(true);
          setActivities([]);
          setPagination({
            currentPage: 0,
            totalPages: 1,
            hasMore: true
          });
          
          const result = await getRecentActivities(1, 10);
          setActivities(result.activities);
          setPagination(result.pagination);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching activities:', err);
          setError('Failed to load activities. Please try again.');
          setLoading(false);
        }
      };
      
      fetchInitialActivities();
    }
  }, [isOpen]);

  // Filter activities based on type and search term
  const filteredActivities = activities.filter(activity => {
    const matchesFilter = filter === 'all' || activity.type === filter;
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  // Define icon mapping
  const getIconComponent = (type) => {
    switch (type) {
      case 'task':
        return <CheckSquare className="h-5 w-5" />;
      case 'goal':
        return <Target className="h-5 w-5" />;
      case 'habit':
        return <Clock className="h-5 w-5" />;
      case 'routine':
      default:
        return <Calendar className="h-5 w-5" />;
    }
  };

  // Define background color mapping
  const getIconBackground = (type) => {
    switch (type) {
      case 'task':
        return 'bg-purple-100 text-purple-600';
      case 'goal':
        return 'bg-indigo-100 text-indigo-600';
      case 'habit':
        return 'bg-green-100 text-green-600';
      case 'routine':
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
          <motion.div 
            className="bg-white rounded-xl shadow-lg w-full max-w-3xl max-h-[90vh] flex flex-col"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-medium">Activity History</h2>
              <button 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Search and Filter */}
            <div className="p-4 border-b grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-gray-400" />
                </div>
                <select
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm appearance-none"
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <option value="all">All Activities</option>
                  <option value="task">Tasks</option>
                  <option value="routine">Routines</option>
                  <option value="habit">Habits</option>
                  <option value="goal">Goals</option>
                </select>
              </div>
            </div>
            
            {/* Activity List */}
            <div className="flex-grow overflow-y-auto p-4">
              {activities.length === 0 && loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity, index) => {
                    // Add ref to last item for infinite scrolling
                    const isLastItem = index === filteredActivities.length - 1;
                    return (
                      <motion.div 
                        key={activity.id}
                        className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        ref={isLastItem ? lastActivityElementRef : null}
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getIconBackground(activity.type)} flex items-center justify-center mr-3`}>
                          {getIconComponent(activity.type)}
                        </div>
                        <div className="flex-grow">
                          <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Loading indicator at bottom when fetching more */}
                  {loading && pagination.hasMore && (
                    <div className="flex justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-500"></div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-10">
                  {error ? (
                    <p className="text-red-500">{error}</p>
                  ) : (
                    <p className="text-gray-500">No activities found</p>
                  )}
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t text-xs text-gray-500 text-center">
              {pagination.totalCount > 0 ? (
                `Showing ${filteredActivities.length} of ${pagination.totalCount} activities`
              ) : (
                'No activities available'
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActivityDetails; 