import React from 'react';
import { motion } from 'framer-motion';

const GoalCard = ({ goal, onView, onEdit, onDelete }) => {
  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Get background color based on category
  const getCategoryBg = (category) => {
    switch (category) {
      case 'health':
        return 'bg-green-100';
      case 'career':
        return 'bg-blue-100';
      case 'education':
        return 'bg-purple-100';
      case 'finance':
        return 'bg-yellow-100';
      case 'personal':
        return 'bg-indigo-100';
      case 'social':
        return 'bg-pink-100';
      default:
        return 'bg-gray-100';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'health':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        );
      case 'career':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        );
      case 'education':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
          </svg>
        );
      case 'finance':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'personal':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'social':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-pink-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  // Find the admin member for group goals
  const findAdmin = () => {
    if (goal.goal_type === 'group' && goal.members && Array.isArray(goal.members)) {
      const admin = goal.members.find(member => member.role === 'admin');
      return admin ? admin.name : 'Unknown Admin';
    }
    return null;
  };

  // Handle click events
  const handleCardClick = () => {
    onView(goal);
  };

  const handleEditClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    onEdit(goal);
  };

  const handleDeleteClick = (e) => {
    e.stopPropagation(); // Prevent card click event
    onDelete(goal);
  };

  // Get admin name if it's a group goal
  const adminName = findAdmin();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-4 hover:shadow-md transition-shadow duration-200 cursor-pointer"
      onClick={handleCardClick}
    >
      <div className="flex justify-between">
        <div className="flex items-start gap-4">
          <div className={`p-2 rounded-lg ${getCategoryBg(goal.category)}`}>
            {getCategoryIcon(goal.category)}
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">
              {goal.title}
            </h3>
            
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(goal.status)}`}>
                {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
              </span>
              <span className="text-xs text-gray-500">
                {formatDate(goal.start_date)} - {formatDate(goal.end_date)}
              </span>
            </div>
            
            {goal.goal_type === 'group' ? (
              <div className="flex items-center mb-2">
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full mr-2">Group</span>
                {adminName && (
                  <span className="text-xs text-gray-600">
                    Admin: {adminName}
                  </span>
                )}
                <span className="text-xs text-gray-500 ml-2">
                  {goal.members?.length || 0} members
                </span>
              </div>
            ) : (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {goal.description}
              </p>
            )}
            
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">Progress:</span>
              <div className="flex-1 bg-gray-200 h-2 rounded-full max-w-[150px] overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] h-full rounded-full" 
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
              <span className="text-sm text-gray-700">{goal.progress}%</span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col gap-2">
          <button 
            onClick={handleEditClick}
            className="text-xs p-1.5 text-[#4A2BAF] hover:bg-[#4A2BAF]/5 rounded-lg transition-colors"
            title="Edit goal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          </button>
          
          <button 
            onClick={handleDeleteClick}
            className="text-xs p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete goal"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default GoalCard; 