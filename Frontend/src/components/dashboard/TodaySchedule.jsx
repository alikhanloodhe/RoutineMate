import React, { useState, useRef, useEffect } from 'react';
import { FiChevronRight, FiClock, FiCalendar, FiRefreshCw, FiInfo, FiCheckCircle, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion } from 'framer-motion';
import FullScheduleModal from './FullScheduleModal';
import SmartScheduleInsightsModal from './SmartScheduleInsightsModal';
import geminiService from '../../services/geminiService';
import dashboardService from '../../services/dashboardService';

const TodaySchedule = () => {
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [schedule, setSchedule] = useState([]);
  const [originalSchedule, setOriginalSchedule] = useState([]);
  const [tasksWithoutTime, setTasksWithoutTime] = useState([]);
  const [habitsWithoutTime, setHabitsWithoutTime] = useState([]);
  const [goalsWithoutTime, setGoalsWithoutTime] = useState([]);
  const [todayInfo, setTodayInfo] = useState({ date: '', dayOfWeek: '' });
  const [insights, setInsights] = useState([]);
  const [isAiMode, setIsAiMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [aiScheduleSaved, setAiScheduleSaved] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);
  const [showCompleted, setShowCompleted] = useState(true);

  const scheduleContainerRef = useRef(null);
  const currentItemRef = useRef(null);
  
useEffect(() => {
  const fetchTodaySchedule = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getTodaySchedule();

      setSchedule(data.schedule || []);
      setOriginalSchedule(data.schedule || []);
      setTasksWithoutTime(data.tasksWithoutTime || []);
      setHabitsWithoutTime(data.habitsWithoutTime || []);
      setGoalsWithoutTime(data.goalsWithoutTime || []);
      setTodayInfo(data.today || { date: '', dayOfWeek: '' });
      setIsAiMode(false);
    } catch (error) {
      console.error('Error fetching today\'s schedule:', error);
      setError('Failed to load your schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  fetchTodaySchedule();
}, [refreshKey]);

  // Format time interval for display
  const formatTimeInterval = (start, end) => {
    if (start && end) {
      return `${start} - ${end}`;
    }
    return start || '';
  };

  // Generate smart schedule using Gemini API
  const generateSmartSchedule = async () => {
    setLoading(true);
    setError(null);
    setAiScheduleSaved(false);

    try {
      // Call the Gemini API service - no need to pass the current data as the API will fetch it
      const result = await geminiService.generateOptimizedSchedule();

      if (result.schedule) {
        setSchedule(result.schedule);
      }

      if (result.insights) {
        // Convert insights string to array if it's a string
        if (typeof result.insights === 'string') {
          // Split by sentences or paragraphs
          const insightsArray = result.insights
            .split(/(?<=[.!?])\s+/)
            .filter(insight => insight.trim().length > 0);
          setInsights(insightsArray);
        } else if (Array.isArray(result.insights)) {
          setInsights(result.insights);
        } else {
          // Default insights if none provided
          setInsights([
            "Your most productive hours appear to be in the morning - we've scheduled focused work then.",
            "We've distributed high-priority tasks throughout the day to maintain energy levels.",
            "Habit activities are scheduled during natural breaks to reinforce daily routines.",
            "We've created buffer time between meetings to allow for preparation and reflection.",
            "Your evening is optimized for low-energy tasks and relaxation activities."
          ]);
        }
      } else {
        // Default insights if none provided
        setInsights([
          "Your most productive hours appear to be in the morning - we've scheduled focused work then.",
          "We've distributed high-priority tasks throughout the day to maintain energy levels.",
          "Habit activities are scheduled during natural breaks to reinforce daily routines.",
          "We've created buffer time between meetings to allow for preparation and reflection.",
          "Your evening is optimized for low-energy tasks and relaxation activities."
        ]);
      }

      setIsAiMode(true);
    } catch (error) {
      console.error('Error generating smart schedule:', error);
      setError('Failed to generate your optimized schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Reset to user's original schedule
  const handleReset = () => {
    setSchedule(originalSchedule);
    setIsAiMode(false);
    setError(null);
    setAiScheduleSaved(false);
  };

  // Show insights modal
  const handleInsights = () => {
    setShowInsights(true);
  };

  // View full schedule
  const handleViewFullSchedule = () => {
    setShowFullSchedule(true);
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 1: return "bg-red-100 text-red-800"; // P1
      case 2: return "bg-orange-100 text-orange-800"; // P2
      case 3: return "bg-blue-100 text-blue-800"; // P3
      case 4: return "bg-green-100 text-green-800"; // P4
      default: return "bg-gray-100 text-gray-600"; // Default
    }
  };

  // Get type tag styling
  const getTypeTagStyle = (type) => {
    switch (type) {
      case 'routine':
        return "bg-purple-100 text-purple-700";
      case 'task':
        return "bg-blue-100 text-blue-700";
      case 'habit':
        return "bg-green-100 text-green-700";
      case 'goal':
        return "bg-orange-100 text-orange-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  // Get priority label (P1, P2, etc)
  const getPriorityLabel = (priority) => {
    return priority ? `P${priority}` : '';
  };

  // Toggle completed items visibility
  const toggleCompletedVisibility = () => {
    setShowCompleted(!showCompleted);
  };

  // Combined and sorted schedule items with completed filter applied
  const allScheduleItems = [...schedule]
    .filter(item => showCompleted || !item.completed)
    .sort((a, b) => {
      // Sort by start time
      const timeA = a.time ? new Date(`1970/01/01 ${a.time.replace(' AM', 'AM').replace(' PM', 'PM')}`) : new Date(0);
      const timeB = b.time ? new Date(`1970/01/01 ${b.time.replace(' AM', 'AM').replace(' PM', 'PM')}`) : new Date(0);
      return timeA - timeB;
    });

  // Filter tasks based on completion status
  const filteredTasksWithoutTime = tasksWithoutTime.filter(task =>
    showCompleted || !task.completed
  );

  // Filter habits based on completion status
  const filteredHabitsWithoutTime = habitsWithoutTime.filter(habit =>
    showCompleted || !habit.completed
  );
  
  // Filter goals based on completion status
  const filteredGoalsWithoutTime = goalsWithoutTime.filter(goal =>
    showCompleted || !goal.completed
  );

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <>
      {/* Main Schedule Card */}
      <motion.div
        className="bg-white p-6 rounded-xl shadow-sm h-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        whileHover={{
          y: -5,
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.2 }
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-medium text-[#1C1C1C]">
                {isAiMode ? 'Smart Schedule' : 'Today\'s Schedule'}
              </h2>
              {isAiMode && (
                <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded-full">
                  AI
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isAiMode ? 'Optimized for your productivity' : `${todayInfo.dayOfWeek}, ${todayInfo.date}`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleCompletedVisibility}
              className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-600"
              title={showCompleted ? "Hide completed items" : "Show completed items"}
            >
              {showCompleted ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
            <div className="p-3 bg-[#4A2BAF]/10 rounded-xl">
              <FiClock className="h-6 w-6 text-[#4A2BAF]" />
            </div>
          </div>
        </div>

        <div className="space-y-3 max-h-[320px] overflow-y-auto pr-2 mb-2 custom-scrollbar" ref={scheduleContainerRef}>
          {/* Scheduled items (with time) */}
          {allScheduleItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className={`flex items-center border-l-4 ${item.completed ? 'border-green-500' : 'border-[#4A2BAF]/70'} pl-3 py-2 bg-gray-50 rounded-r-lg`}
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${item.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-medium ${item.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {item.title}
                  </p>
                  {item.priority && (
                    <span className={`px-2 py-0.5 rounded-md text-xs font-medium mx-2 ${getPriorityColor(item.priority)}`}>
                      {getPriorityLabel(item.priority)}
                    </span>
                  )}
                  {item.type === 'habit' && item.completed && (
                    <span className="px-2 py-0.5 text-xs rounded-md bg-green-100 text-green-800">
                      Completed
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatTimeInterval(item.time, item.endTime)}
                </p>
              </div>
              <div className={`px-2 py-1 rounded-md text-xs ${getTypeTagStyle(item.type)}`}>
                {item.type}
              </div>
            </div>
          ))}

          {/* Tasks without time */}
          {filteredTasksWithoutTime.map((task) => (
            <div
              key={`task-${task.id}`}
              className={`flex items-center border-l-4 ${task.completed ? 'border-green-500' : 'border-[#4A2BAF]/70'} pl-3 py-2 bg-gray-50 rounded-r-lg`}
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${task.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {task.title}
                  </p>
                  <div className="flex items-center space-x-1">
                    {task.priority && (
                      <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                    )}
                    <span className={`px-2 py-0.5 text-xs rounded-md ${task.status === 'completed' ? 'bg-green-100 text-green-800' :
                        task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {task.status === 'completed' ? 'Completed' :
                        task.status === 'in_progress' ? 'In Progress' :
                          'Pending'}
                    </span>
                  </div>
                </div>
                {task.dueDate && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="mr-1">Due:</span>
                    <span className={task.completed ? 'line-through' : ''}>
                      {task.dueDate}
                    </span>
                  </p>
                )}
              </div>
              <div className="px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-700">
                task
              </div>
            </div>
          ))}

          {/* Habits without time */}
          {filteredHabitsWithoutTime.map((habit) => (
            <div
              key={`habit-${habit.id}`}
              className={`flex items-center border-l-4 ${habit.completed ? 'border-green-500' : 'border-[#4A2BAF]/70'} pl-3 py-2 bg-gray-50 rounded-r-lg`}
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${habit.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-medium ${habit.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {habit.title}
                  </p>
                  <span className={`px-2 py-0.5 text-xs rounded-md ${habit.completed ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                    }`}>
                    {habit.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
                {habit.frequency && (
                  <p className="text-xs text-gray-500 mt-1">
                    {habit.frequency.charAt(0).toUpperCase() + habit.frequency.slice(1)}
                  </p>
                )}
              </div>
              <div className="px-2 py-1 rounded-md text-xs bg-green-100 text-green-700">
                habit
              </div>
            </div>
          ))}

          {/* Goals without time */}
          {filteredGoalsWithoutTime.map((goal) => (
            <div
              key={`goal-${goal.id}`}
              className={`flex items-center border-l-4 ${goal.completed ? 'border-green-500' : 'border-[#4A2BAF]/70'} pl-3 py-2 bg-gray-50 rounded-r-lg`}
            >
              <div className={`w-3 h-3 rounded-full mr-3 ${goal.completed ? 'bg-green-500' : 'bg-gray-300'}`}></div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <p className={`text-sm font-medium ${goal.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                    {goal.title}
                  </p>
                  {goal.status && (
                    <span className={`px-2 py-0.5 text-xs rounded-md ${goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                        goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {goal.status === 'completed' ? 'Completed' :
                        goal.status === 'in_progress' ? 'In Progress' :
                          'Not Started'}
                    </span>
                  )}
                </div>
                {goal.dueDate && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center">
                    <span className="mr-1">Due:</span>
                    <span className={goal.completed ? 'line-through' : ''}>
                      {goal.dueDate}
                    </span>
                  </p>
                )}
              </div>
              <div className="px-2 py-1 rounded-md text-xs bg-orange-100 text-orange-700">
                goal
              </div>
            </div>
          ))}

          {/* No activities message */}
          {allScheduleItems.length === 0 &&
            filteredTasksWithoutTime.length === 0 &&
            filteredHabitsWithoutTime.length === 0 &&
            filteredGoalsWithoutTime.length === 0 && (
              <div className="py-8 text-center">
                <p className="text-gray-500">No activities scheduled for today</p>
              </div>
            )}
        </div>

        <div className="flex justify-between items-center mt-4 pt-2 border-t border-gray-100">
          {isAiMode ? (
            <button
              onClick={handleReset}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <FiRefreshCw className="h-4 w-4 mr-1" />
              Reset
            </button>
          ) : (
            <button 
  onClick={generateSmartSchedule}
  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white 
             bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 
             rounded-xl shadow-sm hover:shadow-md transition duration-300 hover:scale-105"
>
  <FiClock className="h-3.5 w-3.5" />
  <span>
    Optimize With <b className="font-semibold">AI</b>
  </span>
</button>
  
          )}

          {isAiMode && (
            <button
              onClick={handleInsights}
              className="flex items-center text-sm text-gray-500 hover:text-gray-700"
            >
              <FiInfo className="h-4 w-4 mr-1" />
              Insights
            </button>
          )}

          <button
            onClick={handleViewFullSchedule}
            className="text-sm font-medium text-[#4A2BAF] hover:text-[#5D4EFF] flex items-center"
          >
            View full schedule <FiChevronRight className="ml-1 h-4 w-4" />
          </button>
        </div>
      </motion.div>

      {/* Full Schedule Modal */}
      <FullScheduleModal
        isOpen={showFullSchedule}
        onClose={() => setShowFullSchedule(false)}
        schedule={schedule}
        tasksWithoutTime={tasksWithoutTime}
        habitsWithoutTime={habitsWithoutTime}
        goalsWithoutTime={goalsWithoutTime}
        today={todayInfo}
      />

      {/* Insights Modal */}
      <SmartScheduleInsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        insights={insights}
        schedule={schedule}
      />
    </>
  );
};

export default TodaySchedule;