import React, { useRef, useEffect } from 'react';
import { FiX, FiClock, FiCalendar, FiArrowUp, FiArrowDown, FiTag, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const FullScheduleModal = ({ 
  isOpen, 
  onClose, 
  schedule, 
  tasksWithoutTime = [], 
  habitsWithoutTime = [], 
  goalsWithoutTime = [],
  today = { date: '', dayOfWeek: '', fullDate: '' }
}) => {
  const modalRef = useRef(null);
  const currentTimeRef = useRef(null);
  
  // Types and their corresponding icons and colors
  const typeConfig = {
    routine: { color: 'bg-purple-100 text-purple-700', icon: <FiCalendar className="mr-2" /> },
    task: { color: 'bg-blue-100 text-blue-700', icon: <FiClock className="mr-2" /> },
    habit: { color: 'bg-green-100 text-green-700', icon: <FiCalendar className="mr-2" /> },
    goal: { color: 'bg-orange-100 text-orange-700', icon: <FiCalendar className="mr-2" /> },
    suggested: { color: 'bg-gray-100 text-gray-600', icon: <FiClock className="mr-2" /> }
  };
  
  // Priority colors
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 1: return "bg-red-100 text-red-800";
      case 2: return "bg-orange-100 text-orange-800";
      case 3: return "bg-blue-100 text-blue-800";
      case 4: return "bg-green-100 text-green-800";
      case 5: return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };
  
  // Category colors
  const getCategoryColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-700";
    
    const lowerCaseCategory = category?.toLowerCase();
    
    if (lowerCaseCategory?.includes('physical')) 
      return "bg-emerald-100 text-emerald-800";
    if (lowerCaseCategory?.includes('mental')) 
      return "bg-indigo-100 text-indigo-800";
    if (lowerCaseCategory?.includes('social')) 
      return "bg-amber-100 text-amber-800";
    if (lowerCaseCategory?.includes('spiritual')) 
      return "bg-purple-100 text-purple-800";
    
    return "bg-gray-100 text-gray-700";
  };
  
  // Find the current time slot index to scroll to
  const getCurrentTimeSlotIndex = () => {
    if (!schedule || schedule.length === 0) {
      return -1;
    }
    
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes(); // Current time in minutes
    
    // Find the current or next upcoming time slot
    return schedule.findIndex((item) => {
      try {
        if (!item.time || !item.endTime) return false;
        
        // Parse start time
        const [startTimePart, startAmpm] = item.time.split(' ');
        const [startHours, startMinutes] = startTimePart.split(':').map(Number);
        
        // Parse end time
        const [endTimePart, endAmpm] = item.endTime.split(' ');
        let endHours = 0, endMinutes = 0;
        if (endTimePart) {
          [endHours, endMinutes] = endTimePart.split(':').map(Number);
        } else {
          // If no end time, assume it's 1 hour after start
          endHours = startHours;
          endMinutes = startMinutes + 60;
          if (endMinutes >= 60) {
            endHours += Math.floor(endMinutes / 60);
            endMinutes = endMinutes % 60;
          }
        }
        
        // Convert to 24-hour format
        let startTotalMinutes = startHours * 60 + startMinutes;
        if (startAmpm === 'PM' && startHours < 12) startTotalMinutes += 12 * 60;
        if (startAmpm === 'AM' && startHours === 12) startTotalMinutes -= 12 * 60;
        
        let endTotalMinutes = endHours * 60 + endMinutes;
        if (endAmpm === 'PM' && endHours < 12) endTotalMinutes += 12 * 60;
        if (endAmpm === 'AM' && endHours === 12) endTotalMinutes -= 12 * 60;
        
        // Return true if current time is within this time slot
        return currentTime >= startTotalMinutes && currentTime <= endTotalMinutes;
      } catch (error) {
        console.error('Error parsing time:', error);
        return false;
      }
    });
  };
  
  // Scroll to the current time slot when the modal opens
  useEffect(() => {
    if (isOpen && modalRef.current && currentTimeRef.current) {
      currentTimeRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  }, [isOpen]);
  
  // Convert time string to Date object
  const parseTime = (timeString) => {
    if (!timeString) return new Date(0); // Return epoch time for items without time
    
    const [timePart, ampm] = timeString.split(' ');
    let [hours, minutes] = timePart.split(':').map(Number);
    
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  };
  
  // Sort schedule by time
  const sortedSchedule = [...schedule].sort((a, b) => {
    return parseTime(a.time) - parseTime(b.time);
  });
  
  // Get current time index
  const currentTimeIndex = getCurrentTimeSlotIndex();
  
  // Format current time for display
  const formatCurrentTime = () => {
    return new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  // Scroll to current time slot
  const scrollToCurrentTime = () => {
    if (currentTimeRef.current) {
      currentTimeRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };
  
  // Count total items
  const totalItems = schedule.length + tasksWithoutTime.length + habitsWithoutTime.length + goalsWithoutTime.length;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
            ref={modalRef}
          >
            <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-purple-100 to-purple-50">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Today's Full Schedule</h2>
                <p className="text-gray-600 mt-1">
                  {today.dayOfWeek}, {today.fullDate || today.date}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-white/50 transition-colors"
              >
                <FiX className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            
            <div className="overflow-y-auto px-6 py-4 flex-grow">
              {/* Action buttons row */}
              <div className="flex justify-between items-center mb-4 sticky top-0 bg-white z-10 py-2 border-b">
                <div className="flex items-center">
                  <button 
                    onClick={scrollToCurrentTime}
                    className={`flex items-center px-3 py-1.5 rounded-md text-sm font-medium ${
                      currentTimeIndex >= 0 
                        ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    } transition-colors`}
                  >
                    <FiClock className="mr-1.5" />
                    Current Time
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  {totalItems} items
                </div>
              </div>
              
              {/* Current time indicator appears only if we found a current time slot */}
              {currentTimeIndex >= 0 && (
                <div className="sticky top-[52px] mb-4 bg-red-100 border border-red-500 rounded-md p-2 z-10 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                  <span className="text-red-700 text-sm font-medium">Current Time: {formatCurrentTime()}</span>
                </div>
              )}
              
              {/* Time-slotted activities */}
              {sortedSchedule.length > 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Scheduled Activities</h3>
                  <div className="space-y-3 mb-8">
                    {sortedSchedule.map((item, index) => (
                      <div 
                        key={`${item.type}-${item.id}`}
                        ref={index === currentTimeIndex ? currentTimeRef : null}
                        className={`p-4 rounded-lg border ${
                          index === currentTimeIndex 
                            ? 'border-red-300 bg-red-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{item.title}</h4>
                            <div className="flex items-center mt-1 text-sm text-gray-500">
                              <FiClock className="mr-1.5 h-3.5 w-3.5" />
                              {item.interval}
                            </div>
                          </div>
                          
                          <div className={`px-3 py-1 rounded-full text-sm ${typeConfig[item.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                            {item.type}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.priority && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}>
                              Priority {item.priority}
                            </span>
                          )}
                          
                          {item.category && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(item.category)}`}>
                              {item.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
                  <p className="text-gray-500">No scheduled activities for today</p>
                </div>
              )}
              
              {/* Tasks without time slots */}
              {tasksWithoutTime.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Tasks for Today</h3>
                  <div className="space-y-3 mb-8">
                    {tasksWithoutTime.map((task) => (
                      <div 
                        key={`task-${task.id}`}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{task.title}</h4>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                          </div>
                          
                          <div className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                            Task
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 mt-3">
                          {task.priority && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                              Priority {task.priority}
                            </span>
                          )}
                          
                          {task.category && (
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(task.category)}`}>
                              {task.category}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Habits without time slots */}
              {habitsWithoutTime.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Habits for Today</h3>
                  <div className="space-y-3 mb-8">
                    {habitsWithoutTime.map((habit) => (
                      <div 
                        key={`habit-${habit.id}`}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{habit.title}</h4>
                          </div>
                          
                          <div className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                            {habit.frequency === 'daily' ? 'Daily' : 'Weekly'} Habit
                          </div>
                        </div>
                        
                        {habit.category && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(habit.category)}`}>
                              {habit.category}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Goals without time slots */}
              {goalsWithoutTime.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Goals for Today</h3>
                  <div className="space-y-3">
                    {goalsWithoutTime.map((goal) => (
                      <div 
                        key={`goal-${goal.id}`}
                        className="p-4 rounded-lg border border-gray-200 hover:bg-gray-50"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800">{goal.title}</h4>
                          </div>
                          
                          <div className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
                            Goal
                          </div>
                        </div>
                        
                        {goal.category && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getCategoryColor(goal.category)}`}>
                              {goal.category}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
              
              {/* Empty state */}
              {totalItems === 0 && (
                <div className="bg-gray-50 rounded-lg p-8 text-center">
                  <FiCalendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-800 mb-2">No Activities for Today</h3>
                  <p className="text-gray-500">
                    You don't have any scheduled activities, tasks, habits, or goals for today.
                  </p>
                </div>
              )}
            </div>
            
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md text-gray-700 font-medium transition-colors"
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default FullScheduleModal; 