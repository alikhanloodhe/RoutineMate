import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Check, X, Clock, Calendar, AlertCircle } from 'lucide-react';

const RoutineItem = ({ 
  routine, 
  onEdit, 
  onDelete, 
  onComplete, 
  onToggleActive
}) => {
  // Get today's date and check if it's one of the routine's days
  const today = new Date();
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];
  
  // Handle both daysOfWeek and days properties, and ensure it's an array
  const routineDays = routine.daysOfWeek || routine.days || [];
  const isToday = Array.isArray(routineDays) && routineDays.includes(dayOfWeek);
  
  // Check if routine was completed today
  const today_str = today.toISOString().split('T')[0];
  const completedToday = routine.completionData?.history?.some(
    h => h.date === today_str && h.completed
  );

  // Check if routine is currently active (based on current time)
  const now = new Date();
  const currentTime = now.toTimeString().substring(0, 5); // Format: HH:MM
  const startTime = routine.startTime || routine.start_time;
  const endTime = routine.endTime || routine.end_time;
  
  const isActive = isToday && 
                   startTime && endTime &&
                   startTime <= currentTime && 
                   endTime > currentTime;

  // Format time from 24h to 12h format
  const formatTime = (time24h) => {
    if (!time24h) return 'N/A';
    
    try {
      const [hours, minutes] = time24h.split(':').map(num => parseInt(num, 10));
      if (isNaN(hours) || isNaN(minutes)) return 'Invalid time';
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error, time24h);
      return 'Invalid time';
    }
  };

  // Format frequency (days of week) as text
  const formatFrequency = () => {
    if (!Array.isArray(routineDays)) return "Not set";
    
    if (routineDays.length === 7) {
      return "Daily";
    } else if (routineDays.length === 0) {
      return "Never";
    } else if (routineDays.length === 2 && 
              routineDays.includes("Sat") && 
              routineDays.includes("Sun")) {
      return "Weekends";
    } else if (routineDays.length === 5 && 
              !routineDays.includes("Sat") && 
              !routineDays.includes("Sun")) {
      return "Weekdays";
    } else {
      return routineDays.join(", ");
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority) => {
    if (!priority) return 'text-gray-600 bg-gray-50';
    
    switch (priority.toString().toUpperCase()) {
      case 'HIGH':
        return 'text-red-600 bg-red-50';
      case 'MEDIUM':
        return 'text-orange-600 bg-orange-50';
      case 'LOW':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
      className={`border rounded-xl shadow-sm overflow-hidden mb-3 ${
        isActive 
          ? 'border-[#4A2BAF] bg-[#4A2BAF]/5' 
          : completedToday 
          ? 'border-green-500 bg-green-50' 
          : 'border-gray-200 bg-white hover:border-[#4A2BAF]/30'
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          {/* Left side with checkbox */}
          <div className="flex items-center space-x-3">
            {isToday && (
              <button 
                onClick={() => onComplete(routine.id || routine.routine_id, !completedToday)}
                className="w-5 h-5 flex-shrink-0 transition-all duration-200"
              >
                {completedToday ? (
                  <div className="w-5 h-5 rounded-md bg-[#4A2BAF] flex items-center justify-center text-white">
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <div className="w-5 h-5 rounded-md border border-gray-300 hover:border-[#4A2BAF]"></div>
                )}
              </button>
            )}
            
            {/* Title and category */}
            <div>
              <h3 className={`font-medium ${
                isActive 
                  ? 'text-[#4A2BAF]' 
                  : completedToday 
                  ? 'text-green-700' 
                  : 'text-gray-800'
              }`}>
                {routine.title}
              </h3>
              <div className="text-xs text-gray-500 flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100`}>
                  {routine.category || 'Uncategorized'}
                </span>
                <span className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {formatTime(startTime)} - {formatTime(endTime)}
                </span>
              </div>
            </div>
          </div>
          
          {/* Status badge */}
          {isActive && (
            <span className="text-xs px-2 py-1 rounded-full bg-[#4A2BAF] text-white flex items-center">
              <span className="w-2 h-2 bg-white rounded-full mr-1 animate-pulse"></span>
              Active Now
            </span>
          )}
          
          {/* Action buttons */}
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit(routine.id || routine.routine_id)}
              className="p-1.5 text-gray-400 hover:text-[#4A2BAF] hover:bg-[#4A2BAF]/5 rounded-md transition-colors"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={() => onDelete(routine.id || routine.routine_id)}
              className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        {/* Additional details */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <div className="flex items-center text-gray-500">
            <Calendar className="w-3 h-3 mr-1" />
            <span>{formatFrequency()}</span>
            
            {/* Priority indicator */}
            <span className={`ml-2 px-2 py-0.5 rounded-full ${getPriorityColor(routine.priority)}`}>
              {routine.priority || 'No'} Priority
            </span>
          </div>
          
          {/* Streak info */}
          {routine.completionData && routine.completionData.streak > 0 && (
            <div className="flex items-center text-[#4A2BAF]">
              <motion.span 
                initial={{ scale: 1 }}
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ 
                  duration: 1.5, 
                  repeat: Infinity, 
                  repeatType: "reverse" 
                }}
                className="bg-[#4A2BAF]/10 px-2 py-0.5 rounded-full font-medium flex items-center"
              >
                🔥 {routine.completionData.streak} day streak
              </motion.span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default RoutineItem; 