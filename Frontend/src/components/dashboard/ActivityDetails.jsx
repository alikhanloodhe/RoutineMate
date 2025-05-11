import React, { useState, useEffect } from 'react';
import { X, Calendar, CheckSquare, Target, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityDetails = ({ isOpen, onClose }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Simulate fetching activities from backend
  useEffect(() => {
    if (isOpen) {
      // Mock data - would be replaced with actual API call
      const fetchActivities = async () => {
        try {
          setLoading(true);
          // This would be replaced with an actual API call:
          // const response = await axios.get(`${API_URL}/api/activities`, {
          //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          // });
          
          // Mock data for development
          const mockActivities = [
            { id: 1, type: 'task', description: 'Completed "Morning Workout" task', time: 'Today, 8:30 AM' },
            { id: 2, type: 'goal', description: 'Updated goal "Read 10 books"', time: 'Yesterday, 7:45 PM' },
            { id: 3, type: 'routine', description: 'Created new routine "Evening Meditation"', time: '2 days ago, 9:15 PM' },
            { id: 4, type: 'task', description: 'Completed "Weekly Planning" task', time: '3 days ago, 10:00 AM' },
            { id: 5, type: 'routine', description: 'Missed routine "Morning Yoga"', time: '4 days ago, 7:00 AM' },
            { id: 6, type: 'goal', description: 'Created goal "Learn Spanish"', time: '5 days ago, 8:20 PM' },
            { id: 7, type: 'task', description: 'Completed "Email Follow-ups" task', time: '1 week ago, 2:15 PM' },
            { id: 8, type: 'routine', description: 'Completed routine "Daily Reading"', time: '1 week ago, 9:00 PM' },
          ];
          
          // Simulate backend delay
          setTimeout(() => {
            setActivities(mockActivities);
            setLoading(false);
          }, 800);
        } catch (error) {
          console.error('Error fetching activities:', error);
          setLoading(false);
        }
      };
      
      fetchActivities();
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
                  <option value="goal">Goals</option>
                </select>
              </div>
            </div>
            
            {/* Activity List */}
            <div className="flex-grow overflow-y-auto p-4">
              {loading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => (
                    <motion.div 
                      key={activity.id}
                      className="flex items-start p-3 hover:bg-gray-50 rounded-lg transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getIconBackground(activity.type)} flex items-center justify-center mr-3`}>
                        {getIconComponent(activity.type)}
                      </div>
                      <div className="flex-grow">
                        <p className="text-sm font-medium text-gray-800">{activity.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No activities found</p>
                </div>
              )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t text-xs text-gray-500 text-center">
              Showing {filteredActivities.length} of {activities.length} activities
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActivityDetails; 