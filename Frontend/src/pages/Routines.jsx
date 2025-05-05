import React, { useState, useEffect } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import { motion } from 'framer-motion';
import { PlusCircle, Calendar, List, Clock, AlarmClock } from 'lucide-react';

// Import custom components
import RoutineList from '../components/routine/RoutineList';
import RoutineForm from '../components/routine/RoutineForm';
import FilterBar from '../components/routine/FilterBar';
import StatsPanel from '../components/routine/StatsPanel';


// Mock data for initial routines
const initialRoutines = [
  {
    id: 1,
    title: "Morning Workout",
    description: "30 minutes cardio + strength training",
    startTime: "06:00",
    endTime: "07:00",
    category: "Physical",
    active: true,
    daysOfWeek: ["Mon", "Wed", "Fri"],
    priority: "High",
    createdAt: "2025-03-15",
    completionData: {
      streak: 7,
      lastCompleted: "2025-04-08",
      completionRate: 85,
      history: [
        { date: "2025-04-08", completed: true },
        { date: "2025-04-06", completed: true },
        { date: "2025-04-05", completed: false },
        { date: "2025-04-03", completed: true },
        { date: "2025-04-01", completed: true },
      ]
    }
  },
  {
    id: 2,
    title: "Study Session",
    description: "Focus on advanced database concepts",
    startTime: "19:00",
    endTime: "20:30",
    category: "Mental",
    active: true,
    daysOfWeek: ["Mon", "Tue", "Thu"],
    priority: "Medium",
    createdAt: "2025-03-20",
    completionData: {
      streak: 3,
      lastCompleted: "2025-04-08",
      completionRate: 70,
      history: [
        { date: "2025-04-08", completed: true },
        { date: "2025-04-04", completed: true },
        { date: "2025-04-02", completed: false },
        { date: "2025-04-01", completed: true },
      ]
    }
  },
  {
    id: 3,
    title: "Meditation",
    description: "Mindfulness practice for mental clarity",
    startTime: "21:00",
    endTime: "21:20",
    category: "Spiritual",
    active: true,
    daysOfWeek: ["Mon", "Wed", "Fri", "Sun"],
    priority: "Low",
    createdAt: "2025-03-25",
    completionData: {
      streak: 9,
      lastCompleted: "2025-04-07",
      completionRate: 92,
      history: [
        { date: "2025-04-07", completed: true },
        { date: "2025-04-05", completed: true },
        { date: "2025-04-03", completed: true },
        { date: "2025-04-01", completed: true },
      ]
    }
  }
];


const Routines = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [routines, setRoutines] = useState(initialRoutines);
  const [filteredRoutines, setFilteredRoutines] = useState(initialRoutines);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // Changed default to "list" from "timetable"
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());


  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
  // Initialize today's date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Effect to apply search
  useEffect(() => {
    let result = [...routines];

    // Apply search term
    if (searchTerm.trim() !== "") {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(routine =>
        routine.title.toLowerCase().includes(lowercaseSearch) ||
        routine.description.toLowerCase().includes(lowercaseSearch) ||
        routine.category.toLowerCase().includes(lowercaseSearch)
      );
    }

    setFilteredRoutines(result);
  }, [routines, searchTerm]);

  // Get routines for today
  const getTodayRoutines = () => {
    return routines.filter(routine =>
      routine.active && routine.daysOfWeek.includes(dayOfWeek)
    );
  };

  // Get current active routine based on time
  const getCurrentRoutines = () => {
    const now = currentTime;
    const timeStr = now.toTimeString().substring(0, 5); // Format: HH:MM

    return getTodayRoutines().filter(routine => {
      return routine.startTime <= timeStr && routine.endTime > timeStr;
    });
  };

  // Get upcoming routines for today
  const getUpcomingRoutines = () => {
    const now = currentTime;
    const timeStr = now.toTimeString().substring(0, 5); // Format: HH:MM

    return getTodayRoutines()
      .filter(routine => routine.startTime > timeStr)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  };

  // Get completed routines for today
  const getCompletedRoutines = () => {
    return getTodayRoutines().filter(routine =>
      routine.completionData?.history?.some(
        h => h.date === todayStr && h.completed
      )
    );
  };

  // Get time slots for timetable
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
    }
    return slots;
  };

  // Get weekly schedule from Sunday to Saturday
  const getWeeklySchedule = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get first day of week (Sunday)
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay());

    const weekSchedule = weekdays.map((day, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];

      // Get routines for this day
      const dayRoutines = routines.filter(routine =>
        routine.active && routine.daysOfWeek.includes(day)
      );
      return {
        day,
        date,
        dateStr,
        routines: dayRoutines,
        isToday: date.toDateString() === today.toDateString()
      };
    });

    return weekSchedule;
  };

  // Handler functions
  const addRoutine = (newRoutine) => {
    // Create a new routine with a unique ID and current date
    const routineWithId = {
      ...newRoutine,
      id: Date.now(),
      createdAt: new Date().toISOString().split('T')[0],
      completionData: {
        streak: 0,
        lastCompleted: null,
        completionRate: 0,
        history: []
      }
    };

    setRoutines([...routines, routineWithId]);
    setShowAddForm(false);
  };

  const editRoutine = (id) => {
    const routineToEdit = routines.find(r => r.id === id);
    if (routineToEdit) {
      setEditingRoutineId(id);
      setIsEditMode(true);
      setShowAddForm(true);
    }
  };

  const updateRoutine = (updatedRoutine) => {
    setRoutines(routines.map(r =>
      r.id === updatedRoutine.id ? updatedRoutine : r
    ));
    setIsEditMode(false);
    setEditingRoutineId(null);
    setShowAddForm(false);
  };

  const deleteRoutine = (id) => {
    // Simple confirmation
    if (showConfirmDelete === id) {
      setRoutines(routines.filter(r => r.id !== id));
      setShowConfirmDelete(null);
    } else {
      setShowConfirmDelete(id);
    }
  };

  const markRoutineComplete = (id, completed = true, dateStr = todayStr) => {
    setRoutines(routines.map(routine => {
      if (routine.id === id) {
        // Remove existing entry for the date if any
        const filteredHistory = routine.completionData.history.filter(
          h => h.date !== dateStr
        );

        // Add new entry for the date
        const newHistory = [
          { date: dateStr, completed },
          ...filteredHistory
        ];

        // Calculate new streak if it's today's completion
        let streak = routine.completionData.streak;

        if (dateStr === todayStr) {
          if (completed) {
            // If marking as complete, increment streak
            streak += 1;
          } else {
            // If marking as incomplete, reset streak
            streak = 0;
          }
        }

        // Calculate new completion rate based on history
        const totalEntries = newHistory.length;
        const completedEntries = newHistory.filter(h => h.completed).length;
        const completionRate = totalEntries === 0
          ? 0
          : Math.round((completedEntries / totalEntries) * 100);

        return {
          ...routine,
          completionData: {
            ...routine.completionData,
            streak,
            lastCompleted: completed ? dateStr : routine.completionData.lastCompleted,
            completionRate,
            history: newHistory
          }
        };
      }
      return routine;
    }));
  };

  const toggleRoutineActive = (id) => {
    setRoutines(routines.map(routine => {
      if (routine.id === id) {
        return {
          ...routine,
          active: !routine.active
        };
      }
      return routine;
    }));
  };

  // Format time from 24h to 12h format
  const formatTime = (time24h) => {
    const [hours, minutes] = time24h.split(':');
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours % 12 || 12;
    return `${hours12}:${minutes} ${period}`;
  };

  // Get the routine being edited
  const routineToEdit = isEditMode ? routines.find(r => r.id === editingRoutineId) : null;

  // Current active routines
  const currentRoutines = getCurrentRoutines();
  const upcomingRoutines = getUpcomingRoutines();
  const weeklySchedule = getWeeklySchedule();
  const timeSlots = getTimeSlots();


  return (
    <div className="min-h-screen bg-[#fffcfc]">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />

      <div className="flex h-[calc(100vh-60px)]">
        <Sidebar sidebarOpen={sidebarOpen} />

        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="min-h-screen bg-gray-50">
              {/* Header */}
              <header className="bg-[#4A2BAF] text-white py-4  top-0 z-10 shadow-md">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                  <h1 className="text-2xl font-bold">Your Daily Routines</h1>
                  <p className="text-sm opacity-80">Organize and track your schedule effectively</p>
                </div>
              </header>

              <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Stats Panel */}
                <StatsPanel routines={routines} />

                {/* Now Section - Show what's happening now - Moved up */}
                <div className="mb-6">
                  <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <AlarmClock className="h-5 w-5 text-[#4A2BAF] mr-2" />
                        <span>Happening Now</span>
                      </h3>
                      <span className="text-sm text-gray-500">
                        {currentTime.toLocaleTimeString('en-US', {
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </span>
                    </div>

                    {currentRoutines.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        <p>No active routines at the moment</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {upcomingRoutines.length > 0
                            ? `Next routine starts at ${formatTime(upcomingRoutines[0].startTime)}`
                            : "No more routines scheduled for today"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {currentRoutines.map(routine => (
                          <div key={routine.id} className="flex items-center justify-between p-3 bg-[#4A2BAF]/5 border-l-4 border-[#4A2BAF] rounded-r-md">
                            <div>
                              <h4 className="font-medium text-gray-800">{routine.title}</h4>
                              <p className="text-sm text-gray-500">
                                {formatTime(routine.startTime)} - {formatTime(routine.endTime)}
                              </p>
                            </div>

                            <button
                              onClick={() => markRoutineComplete(routine.id, true)}
                              className="px-3 py-1 bg-[#4A2BAF] text-white text-sm rounded-md hover:bg-[#3A1C9F] transition-colors"
                            >
                              Complete
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Upcoming routines */}
                    {upcomingRoutines.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Coming Up Next</h4>
                        <div className="space-y-2">
                          {upcomingRoutines.slice(0, 3).map(routine => (
                            <div key={routine.id} className="flex items-center justify-between p-2 border-l-2 border-gray-200 rounded-r-md pl-3">
                              <div>
                                <h5 className="font-medium text-gray-700">{routine.title}</h5>
                                <p className="text-xs text-gray-500">
                                  {formatTime(routine.startTime)} - {formatTime(routine.endTime)}
                                </p>
                              </div>
                              <span className="text-xs text-gray-400">
                                in {Math.round((new Date(`2000-01-01T${routine.startTime}`) - new Date(`2000-01-01T${currentTime.toTimeString().substring(0, 5)}`)) / 60000)} min
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Main section title with Add Routine button */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                  <h2 className="text-xl font-semibold text-gray-800">
                    {viewMode === "timetable" ? "Weekly Schedule" : "All Routines"}
                  </h2>

                  {/* Add Routine Button moved to same line as title */}
                  <button
                    onClick={() => {
                      setShowAddForm(true);
                      setIsEditMode(false);
                      setEditingRoutineId(null);
                    }}
                    className="flex items-center bg-[#4A2BAF] text-white px-4 py-2 rounded-md hover:bg-[#3A1C9F] transition-colors"
                  >
                    <PlusCircle className="h-5 w-5 mr-1" />
                    <span>Add New Routine</span>
                  </button>
                </div>

                {/* Search bar - only in list view */}
                {viewMode === "list" && (
                  <FilterBar
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                  />
                )}

                {/* View Mode Tabs - Moved below search */}
                <div className="flex border-b border-gray-200 mb-4 mt-4 overflow-x-auto">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${viewMode === "list"
                        ? "border-[#4A2BAF] text-[#4A2BAF]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <List className="h-4 w-4 mr-1" />
                    List View
                  </button>

                  <button
                    onClick={() => setViewMode("timetable")}
                    className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${viewMode === "timetable"
                        ? "border-[#4A2BAF] text-[#4A2BAF]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                  >
                    <Clock className="h-4 w-4 mr-1" />
                    Weekly Schedule
                  </button>
                </div>

                {/* List View */}
                {viewMode === "list" && (
                  <RoutineList
                    routines={filteredRoutines}
                    isEditMode={isEditMode}
                    onEdit={editRoutine}
                    onToggleActive={toggleRoutineActive}
                    onDelete={(id) => setShowConfirmDelete(id)}
                    onComplete={markRoutineComplete}
                  />
                )}

                {/* Timetable View with improved slot heights and card sizes */}
                {viewMode === "timetable" && (
                  <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <div className="min-w-[768px] lg:w-full">
                        {/* Day headers */}
                        <div className="grid grid-cols-8 border-b border-gray-200">
                          <div className="py-2 px-3 text-center font-medium text-sm text-gray-600 border-r border-gray-200">
                            Time
                          </div>
                          {weeklySchedule.map(day => (
                            <div
                              key={day.day}
                              className={`py-2 px-1 text-center ${day.isToday ? 'bg-[#4A2BAF]/5' : ''}`}
                            >
                              <div className={`text-sm font-medium ${day.isToday ? 'text-[#4A2BAF]' : 'text-gray-800'}`}>
                                {day.day}
                              </div>
                              <div className={`text-xs ${day.isToday ? 'text-[#4A2BAF]' : 'text-gray-500'}`}>
                                {day.date.getDate()}
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Time slots with variable heights */}
                        {timeSlots.map((timeSlot, index) => {
                          const currentHour = currentTime.getHours().toString().padStart(2, '0');
                          const isCurrentHour = timeSlot.startsWith(currentHour);

                          // Check if this slot has routines in any day
                          const hasRoutinesInSlot = weeklySchedule.some(day => {
                            return day.routines.some(routine => {
                              const routineHour = routine.startTime.split(':')[0];
                              return routineHour === timeSlot.split(':')[0];
                            });
                          });

                          // Calculate height class based on content - increased height for cards
                          const heightClass = hasRoutinesInSlot ? "min-h-32 md:min-h-40" : "min-h-8 sm:min-h-10";

                          return (
                            <div
                              key={timeSlot}
                              className={`grid grid-cols-8 border-b border-gray-200 ${isCurrentHour ? 'bg-[#4A2BAF]/5' : index % 2 === 0 ? 'bg-gray-50' : ''
                                } ${heightClass}`}
                            >
                              <div className="py-2 px-2 text-center text-xs font-medium text-gray-600 border-r border-gray-200">
                                {formatTime(timeSlot)}
                              </div>

                              {weeklySchedule.map(day => {
                                // Get routines that occur during this time slot
                                const slotRoutines = day.routines.filter(routine => {
                                  const routineHour = routine.startTime.split(':')[0];
                                  return routineHour === timeSlot.split(':')[0];
                                });

                                // Check if any routines were completed on this day
                                const completedRoutines = slotRoutines.filter(routine =>
                                  routine.completionData?.history?.some(
                                    h => h.date === day.dateStr && h.completed
                                  )
                                );

                                return (
                                  <div
                                    key={`${day.day}-${timeSlot}`}
                                    className={`p-1 h-full ${day.isToday ? 'bg-[#4A2BAF]/5' : ''}`}
                                  >
                                    {slotRoutines.map(routine => {
                                      const isCompleted = routine.completionData?.history?.some(
                                        h => h.date === day.dateStr && h.completed
                                      );

                                      return (
                                        <div
                                          key={routine.id}
                                          className={`p-2 rounded mb-1 h-full flex flex-col ${isCompleted
                                              ? 'bg-green-100 border-l-2 border-green-500'
                                              : 'bg-[#4A2BAF]/10 border-l-2 border-[#4A2BAF]'
                                            }`}
                                        >
                                          <div className="font-medium text-sm">{routine.title}</div>
                                          <div className="text-gray-500 text-xs mt-auto">
                                            {formatTime(routine.startTime)} - {formatTime(routine.endTime)}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                );
                              })}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Add/Edit Form Modal with close button and scrollable content */}
                {showAddForm && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                      <div className="flex justify-between items-center p-4 border-b">
                        <h2 className="text-xl font-bold text-[#4A2BAF]">
                          {isEditMode ? "Edit Routine" : "Add New Routine"}
                        </h2>
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>

                      <div className="p-6 overflow-y-auto">
                        <RoutineForm
                          isEdit={isEditMode}
                          initialValues={isEditMode ? routineToEdit : null}
                          onSubmit={isEditMode ? updateRoutine : addRoutine}
                          onCancel={() => setShowAddForm(false)}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Confirm Delete Modal */}
                {showConfirmDelete && (
                  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                      <h3 className="text-lg font-bold mb-2">Delete Routine</h3>
                      <p className="mb-4 text-gray-600">
                        Are you sure you want to delete this routine? This action cannot be undone.
                      </p>

                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowConfirmDelete(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            deleteRoutine(showConfirmDelete);
                            setShowConfirmDelete(null);
                          }}
                          className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Routines; 