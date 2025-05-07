import React, { useState, useEffect } from 'react';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import TaskHistory from './TaskHistory';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import { FiFilter, FiPlus, FiChevronDown, FiX, FiClock, FiList, FiCheck } from 'react-icons/fi';
import { useTimer } from '../context/TimerContext';

const Tasks = () => {
  const token = localStorage.getItem('token');
  const { activeTimer, tasks: contextTasks, startTimer, closeTimer, updateTasks } = useTimer();
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
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use tasks from context
  const [tasks, setTasks] = useState([]);
  
  // Update local tasks when context tasks change
  useEffect(() => {
    if (contextTasks && contextTasks.length > 0) {
      setTasks(contextTasks);
      setIsLoading(false);
    }
  }, [contextTasks]);
  
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/fetchTasks`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to fetch tasks: ${response.status}`);
        }

        const data = await response.json();
        console.log('Tasks fetched:', data);
        setTasks(data);
        
        // Update tasks in context WITHOUT triggering another fetch
        updateTasks(data, false);
        
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message || 'Failed to load tasks');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTasks();
    // Only run this effect once on mount
  }, []);

  const [filteredTasks, setFilteredTasks] = useState(tasks);

  // Add a fetch tasks function to allow refreshing from anywhere
  const fetchTasks = async () => {
    try {
      setError(null);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/fetchTasks`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to fetch tasks: ${response.status}`);
      }

      const data = await response.json();
      setTasks(data);
      
      // Update tasks in context WITHOUT triggering another fetch
      updateTasks(data, false);
      
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message || 'Failed to load tasks');
      throw error;
    }
  };

  const toggleTaskCompletion = async (taskId) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;
  
    const newStatus = taskToUpdate.status === 'completed' || taskToUpdate.completed ? 'pending' : 'completed';
  
    try {
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        completed: newStatus === 'completed',
        updated_at: new Date().toISOString(),
      };
    
      await handleSaveEdit(updatedTask);
    } catch (error) {
      console.error('Error toggling task completion:', error);
      alert('Failed to update task status. Please try again.');
    }
  };
  
  const toggleSubtaskCompletion = async (taskId, subtaskId) => {
    try {
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
    
            return {
              ...task,
              subtasks: updatedSubtasks,
              updated_at: new Date().toISOString()
            };
          }
          return task;
        });
    
        // Update tasks in context
        updateTasks(updatedTasks, false);
        
        return updatedTasks;
      });
      
      // Get the updated task from state
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (taskToUpdate) {
        // Call backend update
        await handleSaveEdit(taskToUpdate);
      }
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
      alert('Failed to update subtask status. Please try again.');
      // Reload tasks to reset state
      fetchTasks();
    }
  };
  

  const addSubtask = async (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
  
    try {
      setTasks(prevTasks => {
        const updatedTasks = prevTasks.map(task => {
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
    
            return {
              ...task,
              subtasks: [...task.subtasks, newSubtask],
              updated_at: new Date().toISOString()
            };
          }
          return task;
        });
        
        // Update tasks in context
        updateTasks(updatedTasks, false);
    
        return updatedTasks;
      });
      
      // Get the updated task with the new subtask
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (taskToUpdate) {
        // Call backend update
        await handleSaveEdit(taskToUpdate);
      }
    } catch (error) {
      console.error('Error adding subtask:', error);
      alert('Failed to add subtask. Please try again.');
      // Reload tasks to reset state
      fetchTasks();
    }
  };
  
  const createTask = async (newTask) => {
    try {
      setIsLoading(true);
      console.log('Creating task:', newTask);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/AddTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newTask),
      });
  
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Error creating task');
      }
      
      alert('Task Added Successfully');
      // Fetch all tasks to ensure consistency with backend
      await fetchTasks();
      
    } catch (error) {
      console.error('Error creating task:', error);
      alert(error.message || 'Error creating task. Please try again.');
    } finally {
      setIsLoading(false);
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
          return task.completed || task.status === 'completed';
        } else if (filters.status === 'Pending') {
          return !task.completed && task.status !== 'completed';
        }
        return true;
      });
    }
    
    if (filters.category) {
      result = result.filter(task => task.category === filters.category);
    }

    // Apply sorting
    if (sortOption === 'newest') {
      result.sort((a, b) => new Date(b.created_at || b.createdAt) - new Date(a.created_at || a.createdAt));
    } else if (sortOption === 'oldest') {
      result.sort((a, b) => new Date(a.created_at || a.createdAt) - new Date(b.created_at || b.createdAt));
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
      result.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
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
    try {
      const taskId = editedTask?.id || selectedTask?.id;
    
      if (!taskId) {
        throw new Error('No valid task ID provided');
      }
    
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/updateTask/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editedTask || selectedTask),
      });
    
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update task: ${response.status}`);
      }
    
      // Update local state and context
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? { ...task, ...(editedTask || selectedTask) } : task
      );
      setTasks(updatedTasks);
      updateTasks(updatedTasks, false);
    
      // Close modal only if editing from modal
      if (selectedTask) {
        setShowEditTaskModal(false);
        setSelectedTask(null);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      alert(error.message || 'Failed to update task. Please try again.');
      throw error;
    }
  };
  

  const handleDeleteTask = async (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        setIsLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/deleteTask/${taskId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to delete task: ${response.status}`);
        }

        // Remove the task from local state and context
        const updatedTasks = tasks.filter(task => task.id !== taskId);
        setTasks(updatedTasks);
        updateTasks(updatedTasks, false);
        
        // If the deleted task has an active timer, close it
        if (activeTimer === taskId) {
          await closeTimer();
        }
        
        alert('Task deleted successfully');
      } catch (error) {
        console.error('Error deleting task:', error);
        alert(error.message || 'Failed to delete task. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (showTaskHistory) {
    return <TaskHistory goBack={() => setShowTaskHistory(false)} />;
  }

  return (
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Task Management Header with Create Task button */}
          <PageHeader
            title="Task Management"
            subtitle="Organize and track your tasks efficiently"
            rightContent={
              <div className="flex gap-2">
                <button
                  onClick={() => setShowTaskHistory(!showTaskHistory)}
                  className="flex items-center px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm"
                >
                  <FiClock className="mr-1.5 h-4 w-4" />
                  {showTaskHistory ? 'Current Tasks' : 'Task History'}
                </button>
                
                <button
                  onClick={() => setShowCreateTaskModal(true)}
                  className="flex items-center px-4 py-2 bg-[#4A2BAF] text-white rounded-md hover:bg-[#3A1C9F] transition-colors text-sm"
                >
                  <FiPlus className="mr-1.5 h-4 w-4" />
                  Create Task
                </button>
              </div>
            }
          />
          
          {/* Error message display */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <button 
                onClick={() => fetchTasks().catch(err => console.error('Error refetching tasks:', err))} 
                className="text-sm underline mt-1"
              >
                Try again
              </button>
            </div>
          )}
          
          {/* Loading indicator */}
          {isLoading && tasks.length === 0 && (
            <div className="flex justify-center items-center py-10">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A2BAF]"></div>
            </div>
          )}
          
          {/* Main content */}
          {!isLoading && (
            <>
              {/* Filter and Sort controls */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap gap-3 items-center">
                  {/* Filter Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                      className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FiFilter className="mr-1.5 h-4 w-4 text-gray-500" />
                      Filter
                      <FiChevronDown className="ml-1.5 h-4 w-4 text-gray-500" />
                    </button>
                    
                    {/* Filter dropdown */}
                    {showFilterDropdown && renderFilterDropdown()}
                  </div>
                  
                  {/* Sort Button */}
                  <div className="relative">
                    <button
                      onClick={() => setShowSortDropdown(!showSortDropdown)}
                      className="flex items-center px-3 py-2 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors text-sm"
                    >
                      <FiList className="mr-1.5 h-4 w-4 text-gray-500" />
                      Sort: {sortOption === 'newest' ? 'Newest' : sortOption === 'oldest' ? 'Oldest' : 'Priority'}
                      <FiChevronDown className="ml-1.5 h-4 w-4 text-gray-500" />
                    </button>
                    
                    {/* Sort dropdown */}
                    {showSortDropdown && renderSortDropdown()}
                  </div>
                  
                  {/* Active filters display */}
                  {activeFilters.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-2 items-center">
                      <span className="text-xs text-gray-500">Active filters:</span>
                      {activeFilters.map((filter, index) => (
                        <div key={index} className="flex items-center bg-[#4A2BAF]/10 text-[#4A2BAF] px-2 py-1 rounded-full text-xs">
                          <span>{filter.value}</span>
                          <button 
                            className="ml-1 p-0.5 rounded-full hover:bg-[#4A2BAF]/20"
                            onClick={() => removeFilter(filter.type)}
                          >
                            <FiX className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {activeTimer && (
                  <div className="flex items-center gap-2 bg-[#4A2BAF]/5 px-3 py-1.5 rounded-md text-sm">
                    <div className="flex items-center text-[#4A2BAF]">
                      <FiClock className="h-4 w-4 mr-1.5 animate-pulse" />
                      <span className="font-medium">Active timer!</span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Tasks Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredTasks.length > 0 ? (
                  filteredTasks.map(task => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onComplete={() => toggleTaskCompletion(task.id)}
                      onDelete={() => handleDeleteTask(task.id)}
                      onEdit={() => handleEditTask(task)}
                      onToggleSubtask={(subtaskId) => toggleSubtaskCompletion(task.id, subtaskId)}
                      onAddSubtask={(subtaskTitle) => addSubtask(task.id, subtaskTitle)}
                      onStartTimer={() => startTimer(task.id)}
                      isTimerActive={activeTimer === task.id}
                    />
                  ))
                ) : (
                  <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                    <div className="bg-gray-100 rounded-full p-3 mb-4">
                      <FiCheck className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-700 mb-1">No tasks found</h3>
                    <p className="text-gray-500 mb-4 max-w-md">
                      {tasks.length === 0
                        ? "You haven't created any tasks yet. Get started by creating your first task!"
                        : "No tasks match your current filters. Try adjusting your filter criteria."}
                    </p>
                    {tasks.length === 0 && (
                      <button
                        onClick={() => setShowCreateTaskModal(true)}
                        className="flex items-center px-4 py-2 bg-[#4A2BAF] text-white rounded-md hover:bg-[#3A1C9F] transition-colors text-sm"
                      >
                        <FiPlus className="mr-1.5 h-4 w-4" />
                        Create Task
                      </button>
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </motion.div>
        
        {/* Create Task Modal */}
        {showCreateTaskModal && (
          <CreateTaskModal
            onClose={() => setShowCreateTaskModal(false)}
            onCreateTask={createTask}
          />
        )}
        
        {/* Edit Task Modal */}
        {showEditTaskModal && selectedTask && (
          <EditTaskModal
            task={selectedTask}
            onClose={() => setShowEditTaskModal(false)}
            onSave={handleSaveEdit}
          />
        )}
      </div>
    </div>
  );
};

export default Tasks; 