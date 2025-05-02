import React, { useState, useEffect } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import TaskCard from '../components/tasks/TaskCard';
import TaskTimer from '../components/tasks/TaskTimer';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import TaskHistory from './TaskHistory';
import { motion } from 'framer-motion';
import { FiFilter, FiPlus, FiChevronDown, FiX, FiClock, FiList, FiCheck } from 'react-icons/fi';

const Tasks = () => {
  const token = localStorage.getItem('token');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTimer, setActiveTimer] = useState(null);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [sortOption, setSortOption] = useState('newest');
  const [filters, setFilters] = useState({
    priority: null,
    status: null,
    category: null
  });
  const [activeFilters, setActiveFilters] = useState([]);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskHistory, setShowTaskHistory] = useState(false);
  
  // Sample task data
  const [tasks, setTasks] = useState([]);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/fetchTasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }

        const data = await response.json();
        console.log(data);
        // console.log(data[1].estimated_time.hours);
        setTasks(data);
        
        // Check for any active sessions after fetching tasks
        checkForActiveSessions(data);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      }
    };

    fetchTasks();
  }, []);
  
  // Check for any active sessions that weren't properly closed
  const checkForActiveSessions = (taskList) => {
    // Loop through local storage to find any active sessions
    let activateTimerForTask = null;
    
    for (const task of taskList) {
      const savedSession = localStorage.getItem(`task_session_${task.id}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (session.isRunning) {
          // We found an active session, set this as the active timer
          activateTimerForTask = task.id;
          break;
        }
      }
    }
    
    // If we found an active session, set it as the active timer
    if (activateTimerForTask) {
      console.log('Found active session for task:', activateTimerForTask);
      setActiveTimer(activateTimerForTask);
    }
  };

  const [filteredTasks, setFilteredTasks] = useState(tasks);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const startTimer = async (taskId) => {
    // Check if there's already a timer running
    if (activeTimer && activeTimer !== taskId) {
      await closeTimer(); // Close the current timer before starting a new one
    }
    
    try {
      // Start a new session in the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/startSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId })
      });
      
      if (!response.ok) {
        throw new Error('Failed to start timer session');
      }
      
      const data = await response.json();
      
      // Store session info in localStorage
      console.log('Session started:', data);
      const sessionInfo = {
        sessionId: data.sessionData.session_id,
        startTime: new Date(data.sessionData.start_time).getTime(),
        taskId,
        isRunning: true
      };
      
      localStorage.setItem(`task_session_${taskId}`, JSON.stringify(sessionInfo));
      setActiveTimer(taskId);
      
    } catch (error) {
      console.error('Error starting timer:', error);
      // Fallback to local timer if backend fails
      const sessionInfo = {
        sessionId: null, // No backend session ID
        startTime: new Date().getTime(),
        taskId,
        isRunning: true
      };
      
      localStorage.setItem(`task_session_${taskId}`, JSON.stringify(sessionInfo));
      setActiveTimer(taskId);
    }
  };

  const closeTimer = async () => {
    if (activeTimer) {
      // End the session and update the task's time spent
      const savedSession = localStorage.getItem(`task_session_${activeTimer}`);
      console.log('Closing timer, saved session:', savedSession);
      
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const endTime = new Date().getTime();
        const totalSeconds = Math.floor((endTime - session.startTime) / 1000);
        
        try {
          // Try to save the session to the backend
          let response;
          
          if (session.sessionId) {
            // If we have a session ID, end the session in the backend
            console.log('Ending session with ID:', session.sessionId);
            response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/endSession`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ sessionId: session.sessionId })
            });
          } else {
            // If we don't have a session ID (e.g., if the backend was down when we started),
            // create a new completed session with the calculated duration
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const duration = `${hours}h ${minutes}m`;
            
            console.log('Creating new completed session with duration:', duration);
            response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/endSession`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                taskId: activeTimer, 
                duration 
              })
            });
          }
          
          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`Failed to end timer session: ${errorData.error || response.statusText}`);
          }
          
          const data = await response.json();
          console.log('Session ended successfully:', data);
          
        } catch (error) {
          console.error('Error ending timer session:', error);
          // Continue with local time tracking even if backend fails
        }
        
        // Update the task's timeSpent in the local state
        setTasks(prevTasks => prevTasks.map(task => {
          if (task.id === activeTimer) {
            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const currentTimeSpent = task.timeSpent || '0h 0m';
            
            // Parse current timeSpent
            const currentHoursMatch = currentTimeSpent.match(/(\d+)h/);
            const currentMinutesMatch = currentTimeSpent.match(/(\d+)m/);
            const currentHours = currentHoursMatch ? parseInt(currentHoursMatch[1]) : 0;
            const currentMinutes = currentMinutesMatch ? parseInt(currentMinutesMatch[1]) : 0;
            
            // Add the new time to the current time
            const totalHours = currentHours + hours;
            const totalMinutes = currentMinutes + minutes;
            const adjustedHours = totalHours + Math.floor(totalMinutes / 60);
            const adjustedMinutes = totalMinutes % 60;
            
            const newTimeSpent = `${adjustedHours}h ${adjustedMinutes}m`;
            
            return {
              ...task,
              timeSpent: newTimeSpent,
              updated_at: new Date().toISOString()
            };
          }
          return task;
        }));
        
        localStorage.removeItem(`task_session_${activeTimer}`);
      }
    }
    
    setActiveTimer(null);
    return Promise.resolve(); // Return a promise for chaining
  };

  const toggleTaskCompletion = (taskId) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;
  
    const newStatus = taskToUpdate.status === 'completed' || taskToUpdate.completed ? 'pending' : 'completed';
  
    const updatedTask = {
      ...taskToUpdate,
      status: newStatus,
      completed: newStatus === 'completed',
      updated_at: new Date().toISOString(),
    };
  
    handleSaveEdit(updatedTask); // 🔁 reuse existing edit logic to update backend
  };
  
  const toggleSubtaskCompletion = (taskId, subtaskId) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(task => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map(subtask => {
            if (subtask.id === subtaskId) {
              const newStatus = subtask.status === 'completed' || subtask.completed ? 'pending' : 'completed';
              return {
                ...subtask,
                status: newStatus,
                completed: newStatus === 'completed'
              };
            }
            return subtask;
          });
  
          const updatedTask = {
            ...task,
            subtasks: updatedSubtasks,
            updated_at: new Date().toISOString()
          };
  
          // Call backend update
          handleSaveEdit(updatedTask);
  
          return updatedTask;
        }
        return task;
      });
  
      return updatedTasks;
    });
  };
  

  const addSubtask = (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
  
    setTasks(prevTasks => {
      return prevTasks.map(task => {
        if (task.id === taskId) {
          const newSubtaskId = task.subtasks.length
            ? Math.max(...task.subtasks.map(st => st.id)) + 1
            : 1;
  
          const newSubtask = {
            id: newSubtaskId,
            name: subtaskTitle,
            title: subtaskTitle, // For UI compatibility
            status: 'pending',
            completed: false,
            estimated_time: null
          };
  
          const updatedTask = {
            ...task,
            subtasks: [...task.subtasks, newSubtask],
            updated_at: new Date().toISOString()
          };
  
          // Update backend
          handleSaveEdit(updatedTask);
  
          return updatedTask;
        }
        return task;
      });
    });
  };
  
  

  const createTask = async (newTask) => {
     // Here new Task created

    console.log(newTask);
    
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/AddTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
  
      const data = await res.json();
      const task_id = data.taskId;
      
      if (res.ok) {
        alert('Task Added Successfully');
        // Add the new task to local state

        setTasks(prevTasks => [...prevTasks, { ...newTask, id: task_id}]);
      } else {
        alert(data.msg || 'Error from backend');
      }
  
      console.log('Task data sent to backend:', newTask);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const applyFilter = (filterType, value) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
    
    // Add to active filters if not already there
    if (value) {
      const filterExists = activeFilters.some(f => f.type === filterType);
      if (!filterExists) {
        setActiveFilters(prev => [...prev, { type: filterType, value }]);
      } else {
        setActiveFilters(prev => 
          prev.map(f => f.type === filterType ? { ...f, value } : f)
        );
      }
    }
    setShowFilterDropdown(false);
  };

  const removeFilter = (filterType) => {
    setFilters(prev => ({ ...prev, [filterType]: null }));
    setActiveFilters(prev => prev.filter(f => f.type !== filterType));
  };

  const applySorting = (option) => {
    setSortOption(option);
    setShowSortDropdown(false);
  };

  // Apply filters and sorting whenever they change
  useEffect(() => {
    let result = [...tasks];
    
    // Apply filters
    if (filters.priority) {
      result = result.filter(task => task.priority === filters.priority);
    }
    
    if (filters.status) {
      result = result.filter(task => {
        if (filters.status === 'Completed') {
          return task.completed;
        } else if (filters.status === 'Pending') {
          return !task.completed;
        }
        return true;
      });
    }
    
    if (filters.category) {
      result = result.filter(task => task.category === filters.category);
    }

    // Apply sorting
    if (sortOption === 'newest') {
      result.sort((a, b) => b.createdAt - a.createdAt);
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => a.createdAt - b.createdAt);
    } else if (sortOption === 'priority-high') {
      result.sort((a, b) => {
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } else if (sortOption === 'priority-low') {
      result.sort((a, b) => {
        const priorityOrder = { 'High': 0, 'Medium': 1, 'Low': 2 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } else if (sortOption === 'alphabetical') {
      result.sort((a, b) => a.title.localeCompare(b.title));
    }
    
    setFilteredTasks(result);
  }, [filters, tasks, sortOption]);

  // Available filter options
  const filterOptions = {
    priority: ['High', 'Medium', 'Low'],
    status: ['Pending', 'Completed'],
    category: ['Work', 'Finance', 'Meetings', 'Personal']
  };

  // Available sort options
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'priority-high', label: 'Priority (High to Low)' },
    { id: 'priority-low', label: 'Priority (Low to High)' },
    { id: 'alphabetical', label: 'Alphabetical' }
  ];
  
  const renderFilterDropdown = () => {
    return (
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Filter Tasks</h3>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2">PRIORITY</h4>
          <div className="space-y-2">
            {filterOptions.priority.map(priority => (
              <div 
                key={priority} 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => applyFilter('priority', priority)}
              >
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  priority === 'High' ? 'bg-red-500' : 
                  priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm">{priority}</span>
                {filters.priority === priority && (
                  <div className="ml-auto">
                    <FiCheck className="text-[#5D4EFF]" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <h4 className="text-xs font-medium text-gray-500 mb-2">STATUS</h4>
          <div className="space-y-2">
            {filterOptions.status.map(status => (
              <div 
                key={status} 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => applyFilter('status', status)}
              >
                <span className="text-sm">{status}</span>
                {filters.status === status && (
                  <div className="ml-auto">
                    <FiCheck className="text-[#5D4EFF]" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
        
        <div className="p-3">
          <h4 className="text-xs font-medium text-gray-500 mb-2">CATEGORY</h4>
          <div className="space-y-2">
            {filterOptions.category.map(category => (
              <div 
                key={category} 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => applyFilter('category', category)}
              >
                <span className="text-sm">{category}</span>
                {filters.category === category && (
                  <div className="ml-auto">
                    <FiCheck className="text-[#5D4EFF]" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSortDropdown = () => {
    return (
      <div className="absolute right-0 mt-2 w-64 bg-white rounded-md shadow-lg z-10 overflow-hidden">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-medium text-gray-700">Sort Tasks</h3>
        </div>
        <div className="p-3">
          <div className="space-y-2">
            {sortOptions.map(option => (
              <div 
                key={option.id} 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => applySorting(option.id)}
              >
                <span className="text-sm">{option.label}</span>
                {sortOption === option.id && (
                  <div className="ml-auto">
                    <FiCheck className="text-[#5D4EFF]" size={14} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const handleEditTask = (task) => {
    setSelectedTask(task);
    setShowEditTaskModal(true);
  };

  const handleSaveEdit = async (editedTask) => {
    const taskId = editedTask?.id || selectedTask?.id;
  
    if (!taskId) {
      console.error('No valid task ID provided');
      return;
    }
  
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/updateTask/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedTask || selectedTask),
      });
  
      if (!response.ok) {
        throw new Error('Failed to update task');
      }
  
      setTasks(prevTasks =>
        prevTasks.map(task => (task.id === taskId ? { ...task, ...(editedTask || selectedTask) } : task))
      );
  
      // Close modal only if editing from modal
      if (selectedTask) {
        setShowEditTaskModal(false);
        setSelectedTask(null);
      }
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };
  

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/deleteTask/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete task');
        }

        // Remove the task from the local state
        setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      } catch (error) {
        console.error('Error deleting task:', error);
      }
    }
  };

  // If showing task history, render the TaskHistory component
 
  // Close active sessions when unmounting
  useEffect(() => {
    return () => {
      // Close any active timer when component unmounts
      if (activeTimer) {
        closeTimer();
      }
    };
  }, [activeTimer]);
  
  if (showTaskHistory) {
    return <TaskHistory goBack={() => setShowTaskHistory(false)} />;
  }


  return (
    <div className="min-h-screen bg-[#f8f9fa]">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      <div className="flex h-[calc(100vh-60px)]">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6">
              <div>
                <h1 className="text-2xl font-bold text-[#1C1C1C]">My Tasks</h1>
                <p className="text-gray-600">Manage your personal tasks and track progress</p>
              </div>
              <div className="flex mt-4 md:mt-0 space-x-2">
                <div className="relative">
                  <button 
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white shadow-sm hover:bg-gray-50"
                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                  >
                    <FiFilter className="mr-2" />
                    <span>Filter</span>
                    <FiChevronDown className="ml-2" size={14} />
                  </button>
                  {showFilterDropdown && renderFilterDropdown()}
                </div>
                <div className="relative">
                  <button 
                    className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white shadow-sm hover:bg-gray-50"
                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                  >
                    <span>Sort</span>
                    <FiChevronDown className="ml-2" size={14} />
                  </button>
                  {showSortDropdown && renderSortDropdown()}
                </div>
                <button 
                  className="flex items-center px-4 py-2 bg-[#5D4EFF] text-white rounded-md text-sm shadow-sm hover:bg-[#4A2BAF] transition-colors"
                  onClick={() => setShowCreateTaskModal(true)}
                >
                  <FiPlus className="mr-2" />
                  <span>Create Task</span>
                </button>
              </div>
            </div>

            {/* Additional button row */}
            <div className="flex mb-6 space-x-2">
              <button 
                className="flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm text-gray-700 bg-white shadow-sm hover:bg-gray-50"
                onClick={() => setShowTaskHistory(true)}
              >
                <FiList className="mr-2" />
                <span>Show History</span>
              </button>

            </div>

            {/* Active filters */}
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {activeFilters.map((filter, index) => (
                  <div key={index} className="flex items-center px-3 py-1 bg-white border border-gray-200 rounded-full text-sm">
                    <span className="mr-2">{filter.type.charAt(0).toUpperCase() + filter.type.slice(1)}: {filter.value}</span>
                    <FiX 
                      className="cursor-pointer" 
                      onClick={() => removeFilter(filter.type)}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Task cards section */}
            {filteredTasks.length > 0 ? (
              <div className="space-y-4">
                {filteredTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onStartTimer={startTimer} 
                    onToggleCompletion={toggleTaskCompletion}
                    onToggleSubtask={toggleSubtaskCompletion}
                    onAddSubtask={addSubtask}
                    onEdit={handleEditTask}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                <div className="bg-[#5D4EFF]/5 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#5D4EFF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                </div>
                <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">No Tasks Found</h2>
                <p className="text-gray-500 max-w-md mb-6">
                  {activeFilters.length > 0 
                    ? "No tasks match your current filters. Try changing or removing some filters."
                    : "Create your first task to start building productive habits"}
                </p>
                <button 
                  className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                  onClick={() => setShowCreateTaskModal(true)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Create Task
                </button>
              </div>
            )}

            {/* Timer component */}
            {activeTimer && (
              <TaskTimer 
                task={tasks.find(t => t.id === activeTimer)} 
                onClose={closeTimer} 
              />
            )}

            {/* Create Task Modal */}
            <CreateTaskModal 
              isOpen={showCreateTaskModal}
              onClose={() => setShowCreateTaskModal(false)}
              onCreateTask={createTask}
            />

            {showEditTaskModal && (
              <EditTaskModal
                isOpen={showEditTaskModal}
                onClose={() => {
                  setShowEditTaskModal(false);
                  setSelectedTask(null);
                }}
                task={selectedTask}
                onSave={handleSaveEdit}
              />
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Tasks; 