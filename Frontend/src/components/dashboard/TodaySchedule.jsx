import React from 'react';
import { FiChevronRight, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const TodaySchedule = ({ schedule }) => {
  return (
    <motion.div 
      className="bg-white p-6 rounded-xl shadow-sm h-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
      whileHover={{ 
        y: -5,
        boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
        transition: { duration: 0.2 }
      }}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h2 className="text-lg font-medium text-[#1C1C1C]">Today's Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">Your upcoming activities</p>
        </div>
        <div className="p-3 bg-[#4A2BAF]/10 rounded-xl">
          <FiClock className="h-6 w-6 text-[#4A2BAF]" />
        </div>
      </div>
      
      <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 mb-2">
        {Array.isArray(schedule) && schedule.map((item) => (
          <div key={item.id} className="flex items-center border-l-4 border-[#4A2BAF]/70 pl-3 py-2 bg-gray-50 rounded-r-lg">
            <div className={`w-3 h-3 rounded-full mr-3 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${item.completed ? 'line-through text-gray-400' : 'text-gray-800'}`}>{item.title}</p>
              <p className="text-xs text-gray-500">{item.time}</p>
            </div>
            <div className="px-2 py-1 rounded-md text-xs bg-[#4A2BAF]/10 text-[#4A2BAF]">
              {item.type}
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-2">
        <Link to="/routines" className="text-sm font-medium text-[#4A2BAF] hover:text-[#5D4EFF] flex items-center">
          View full schedule <FiChevronRight className="ml-1 h-4 w-4" />
        </Link>
      </div>
    </motion.div>
  );
};

export default TodaySchedule; 