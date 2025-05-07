import React from 'react';
import { FiChevronRight, FiCalendar, FiCheckSquare, FiTarget } from 'react-icons/fi';
import { motion } from 'framer-motion';

const RecentActivity = ({ activities }) => {
  // Define icon mapping
  const getIconComponent = (type) => {
    switch (type) {
      case 'task':
        return <FiCheckSquare />;
      case 'goal':
        return <FiTarget />;
      case 'routine':
      default:
        return <FiCalendar />;
    }
  };

  // Define background color mapping
  const getIconBackground = (type) => {
    switch (type) {
      case 'task':
        return 'bg-[#4A2BAF]/10 text-[#4A2BAF]';
      case 'goal':
        return 'bg-[#5D4EFF]/10 text-[#5D4EFF]';
      case 'routine':
      default:
        return 'bg-[#111827]/10 text-[#111827]';
    }
  };

  return (
    <motion.div 
      className="bg-white rounded-xl shadow-sm p-6 mb-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
    >
      <h2 className="text-lg font-medium text-[#1C1C1C] mb-4">Recent Activity</h2>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div 
            key={index}
            className="flex items-start"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.5 + (index * 0.1) }}
            whileHover={{ x: 5, transition: { duration: 0.2 } }}
          >
            <div className={`flex-shrink-0 w-10 h-10 rounded-full ${getIconBackground(activity.type)} flex items-center justify-center mr-3`}>
              {getIconComponent(activity.type)}
            </div>
            <div>
              <p className="text-sm font-medium text-[#1C1C1C]">{activity.description}</p>
              <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
            </div>
          </motion.div>
        ))}
      </div>
      
      <div className="mt-4 pt-4 border-t">
        <motion.a 
          href="#" 
          className="text-sm font-medium text-[#4A2BAF] hover:text-[#5D4EFF] flex items-center"
          whileHover={{ x: 5, transition: { duration: 0.2 } }}
        >
          View all activity <FiChevronRight className="ml-1 h-4 w-4" />
        </motion.a>
      </div>
    </motion.div>
  );
};

export default RecentActivity; 