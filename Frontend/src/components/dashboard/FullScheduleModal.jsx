import React, { useRef, useEffect, useState } from 'react';
import { FiX, FiClock, FiCalendar, FiArrowUp, FiArrowDown, FiTag, FiAlertTriangle, FiEye, FiEyeOff } from 'react-icons/fi';
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
  const [showCompleted, setShowCompleted] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    
    return () => clearInterval(timer);
  }, []);
  
  // Types and their corresponding icons and colors
  const typeConfig = {
    routine: { color: 'bg-purple-100 text-purple-700', icon: <FiCalendar className="mr-2" /> },
    task: { color: 'bg-blue-100 text-blue-700', icon: <FiClock className="mr-2" /> },
    habit: { color: 'bg-green-100 text-green-700', icon: <FiCalendar className="mr-2" /> },
    goal: { color: 'bg-orange-100 text-orange-700', icon: <FiCalendar className="mr-2" /> },
    suggested: { color: 'bg-gray-100 text-gray-600', icon: <FiClock className="mr-2" /> }
  };
  
  // Toggle completed items visibility
  const toggleCompletedVisibility = () => {
    setShowCompleted(!showCompleted);
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
  
  // Parse time string to 24-hour minutes
  const parseTimeToMinutes = (timeString) => {
    if (!timeString) return -1;
    
    try {
      const [timePart, ampm] = timeString.split(' ');
      let [hours, minutes] = timePart.split(':').map(Number);
      
      // Convert to 24-hour format
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    } catch (error) {
      console.error('Error parsing time:', error);
      return -1;
    }
  };
  
  // Find the current time slot index to scroll to
  const getCurrentTimeSlotIndex = () => {
    if (!schedule || schedule.length === 0) {
      return -1;
    }
    
    // Get current time in minutes (24-hour format)
    const now = new Date();
    const currentTimeMinutes = now.getHours() * 60 + now.getMinutes();
    
    // Find the item that contains the current time
    return schedule.findIndex((item) => {
      const startMinutes = parseTimeToMinutes(item.time);
      const endMinutes = parseTimeToMinutes(item.endTime);
      
      if (startMinutes === -1 || endMinutes === -1) return false;
      
      return currentTimeMinutes >= startMinutes && currentTimeMinutes <= endMinutes;
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
  
  // Filter and sort items based on completion status
  const filteredSchedule = [...schedule]
    .filter(item => showCompleted || !item.completed)
    .sort((a, b) => {
      return parseTime(a.time) - parseTime(b.time);
    });
    
  const filteredTasksWithoutTime = tasksWithoutTime.filter(task =>
    showCompleted || !task.completed
  );
  
  const filteredHabitsWithoutTime = habitsWithoutTime.filter(habit =>
    showCompleted || !habit.completed
  );
  
  const filteredGoalsWithoutTime = goalsWithoutTime.filter(goal =>
    showCompleted || !goal.completed
  );
  
  // Get current time index
  const currentTimeIndex = getCurrentTimeSlotIndex();
  const hasCurrentTimeActivity = currentTimeIndex !== -1;
  
  // Format current time for display
  const formatCurrentTime = () => {
    return currentTime.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  };
  
  // Scroll to current time slot
  const scrollToCurrentTime = () => {
    if (hasCurrentTimeActivity && currentTimeRef.current) {
      currentTimeRef.current.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'center' 
      });
    }
  };
  
  // Count total items (filtered)
  const totalItems = filteredSchedule.length + 
    filteredTasksWithoutTime.length + 
    filteredHabitsWithoutTime.length + 
    filteredGoalsWithoutTime.length;

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
            
            {/* Fixed control bar at the top */}
            <div className="border-b sticky top-0 bg-white z-20">
              {/* Action buttons row */}
              <div className="flex justify-between items-center px-6 py-3">
                <div className="flex items-center gap-2">
                  {hasCurrentTimeActivity && (
                    <button 
                      onClick={scrollToCurrentTime}
                      className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"
                    >
                      <FiClock className="mr-1.5" />
                      Current Time
                    </button>
                  )}
                  
                  <button
                    onClick={toggleCompletedVisibility}
                    className="flex items-center px-3 py-1.5 rounded-md text-sm font-medium bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
                    title={showCompleted ? "Hide completed items" : "Show completed items"}
                  >
                    {showCompleted ? <FiEyeOff className="mr-1.5" /> : <FiEye className="mr-1.5" />}
                    {showCompleted ? "Hide Completed" : "Show Completed"}
                  </button>
                </div>
                <div className="text-sm text-gray-500">
                  <span className="mr-3">{formatCurrentTime()}</span>
                  {totalItems} items
                </div>
              </div>
              
              {/* Current time indicator appears only if we found a current time slot */}
              {hasCurrentTimeActivity && (
                <div className="bg-red-100 border-y border-red-500 p-2 z-10 flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse mr-2"></div>
                  <span className="text-red-700 text-sm font-medium">Current Activity: {filteredSchedule[currentTimeIndex]?.title}</span>
                </div>
              )}
            </div>
            
            <div className="overflow-y-auto px-6 py-4 flex-grow">
              {/* Time-slotted activities */}
              {filteredSchedule.length > 0 ? (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Scheduled Activities</h3>
                  <div className="space-y-3 mb-8">
                    {filteredSchedule.map((item, index) => {
                      // Check if this item contains current time
                      const now = new Date();
                      const currentMinutes = now.getHours() * 60 + now.getMinutes();
                      const startMinutes = parseTimeToMinutes(item.time);
                      const endMinutes = parseTimeToMinutes(item.endTime);
                      const isCurrentTimeSlot = startMinutes !== -1 && endMinutes !== -1 && 
                                               currentMinutes >= startMinutes && currentMinutes <= endMinutes;
                      
                      return (
                        <div 
                          key={`${item.type}-${item.id}`}
                          ref={isCurrentTimeSlot ? currentTimeRef : null}
                          className={`p-4 rounded-lg border ${
                            isCurrentTimeSlot 
                              ? 'border-red-300 bg-red-50' 
                              : item.completed
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h4 className={`font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                                {item.title}
                                {isCurrentTimeSlot && (
                                  <span className="ml-2 text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">Now</span>
                                )}
                              </h4>
                              <div className="flex items-center mt-1 text-sm text-gray-500">
                                <FiClock className="mr-1.5 h-3.5 w-3.5" />
                                {item.interval}
                              </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-sm ${typeConfig[item.type]?.color || 'bg-gray-100 text-gray-700'}`}>
                              {item.completed ? `${item.type} (Completed)` : item.type}
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
                      );
                    })}
                  </div>
                </>
              ) : filteredSchedule.length === 0 && schedule.length > 0 ? (
                <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
                  <p className="text-gray-500">All scheduled activities are completed and filtered out</p>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center mb-8">
                  <p className="text-gray-500">No scheduled activities for today</p>
                </div>
              )}
              
              {/* Tasks without time slots */}
              {filteredTasksWithoutTime.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Tasks for Today</h3>
                  <div className="space-y-3 mb-8">
                    {filteredTasksWithoutTime.map((task) => (
                      <div 
                        key={`task-${task.id}`}
                        className={`p-4 rounded-lg border ${
                          task.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className={`font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                              {task.title}
                            </h4>
                            {task.description && (
                              <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                            )}
                          </div>
                          
                          <div className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-700">
                            {task.completed ? 'Task (Completed)' : 'Task'}
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
              {filteredHabitsWithoutTime.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Habits for Today</h3>
                  <div className="space-y-3 mb-8">
                    {filteredHabitsWithoutTime.map((habit) => (
                      <div 
                        key={`habit-${habit.id}`}
                        className={`p-4 rounded-lg border ${
                          habit.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className={`font-medium ${habit.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                              {habit.title}
                            </h4>
                          </div>
                          
                          <div className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                            {habit.completed ? 'Habit (Completed)' : `${habit.frequency === 'daily' ? 'Daily' : 'Weekly'} Habit`}
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
              {filteredGoalsWithoutTime.length > 0 && (
                <>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Goals for Today</h3>
                  <div className="space-y-3">
                    {filteredGoalsWithoutTime.map((goal) => (
                      <div 
                        key={`goal-${goal.id}`}
                        className={`p-4 rounded-lg border ${
                          goal.completed 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className={`font-medium ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                              {goal.title}
                            </h4>
                          </div>
                          
                          <div className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700">
                            {goal.completed ? 'Goal (Completed)' : 'Goal'}
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
                  <h3 className="text-lg font-medium text-gray-800 mb-2">
                    {showCompleted ? 'No Activities for Today' : 'All Activities Completed'}
                  </h3>
                  <p className="text-gray-500">
                    {showCompleted 
                      ? "You don't have any scheduled activities, tasks, habits, or goals for today."
                      : "All your activities for today are completed. Toggle 'Show Completed' to view them."}
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