import React, { useState, useEffect } from 'react';
import TaskCard from '../components/tasks/TaskCard';
import CreateTaskModal from '../components/tasks/CreateTaskModal';
import EditTaskModal from '../components/tasks/EditTaskModal';
import TaskHistory from './TaskHistory';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';
import { FiFilter, FiPlus, FiChevronDown, FiX, FiClock, FiList, FiCheck } from 'react-icons/fi';
import { useTimer } from '../context/TimerContext';
import { useToastContext } from '../context/ToastContext';

const Tasks = () => {
  const token = localStorage.getItem('token');
  const { activeTimer, tasks: contextTasks, startTimer, closeTimer, updateTasks } = useTimer();
  const { successToast, errorToast, infoToast } = useToastContext();
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  
  // Add loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Use tasks from context
  const [tasks, setTasks] = useState([]);
  
  // Update local tasks when context tasks change
  useEffect(() => {
    // Skip if the effect is running during component cleanup
    let isMounted = true;
    
    if (isMounted && contextTasks && contextTasks.length > 0) {
      setTasks(contextTasks);
      setIsLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, [contextTasks]);
  
  useEffect(() => {
    const fetchInitialTasks = async () => {
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
        
        // Use setTimeout with a safer pattern
        setTimeout(() => {
          // Only update context if the component is still mounted
          if (document.body.contains(document.getElementById('tasks-container'))) {
            updateTasks(data, true);
          }
        }, 50);
        
      } catch (error) {
        console.error('Error fetching tasks:', error);
        setError(error.message || 'Failed to load tasks');
        errorToast('Failed to load tasks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialTasks();
    // Only run this effect once on mount
  }, []);

  const [filteredTasks, setFilteredTasks] = useState([]);

  // Add a fetch tasks function to alLOW refreshing from anywhere
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
      window.setTimeout(() => {
        updateTasks(data, true);
      }, 0);
      
      return data;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      setError(error.message || 'Failed to load tasks');
      errorToast('Failed to load tasks. Please try again.');
      throw error;
    }
  };

  // Helper function to sanitize task data before sending to the backend
  const sanitizeTaskForUpdate = (task) => {
    const sanitizedTask = { ...task };
    
    // Handle estimated_time object to convert to string format
    if (sanitizedTask.estimated_time && typeof sanitizedTask.estimated_time === 'object') {
      const hours = sanitizedTask.estimated_time.hours || 0;
      const minutes = sanitizedTask.estimated_time.minutes || 0;
      sanitizedTask.estimated_time = `${hours} hours ${minutes} minutes`;
      
      // Remove formatted property if exists
      delete sanitizedTask.estimated_time.formatted;
    }
    
    // Preserve timeSpent instead of removing it
    if (sanitizedTask.timeSpent && typeof sanitizedTask.timeSpent === 'object') {
      // Convert the timeSpent object to a string format if needed
      const hours = sanitizedTask.timeSpent.hours || 0;
      const minutes = sanitizedTask.timeSpent.minutes || 0;
      sanitizedTask.timeSpent = `${hours} hours ${minutes} minutes`;
    }
    
    return sanitizedTask;
  };

  const toggleTaskCompletion = async (taskId) => {
    const taskToUpdate = tasks.find(task => task.id === taskId);
    if (!taskToUpdate) return;
  
    const newStatus = taskToUpdate.status === 'completed' || taskToUpdate.completed ? 'pending' : 'completed';
    
    // If completing a task with an active timer, ask to stop the timer first
    if (activeTimer === taskId && newStatus === 'completed') {
      if (window.confirm('This task has an active timer. Would you like to stop the timer and mark the task as completed?')) {
        // Close the timer first
        await closeTimer();
      } else {
        return; // User cancelled, don't complete the task
      }
    }
  
    try {
      // Create the updated task with the new status
      const updatedTask = {
        ...taskToUpdate,
        status: newStatus,
        completed: newStatus === 'completed',
        updated_at: new Date().toISOString(),
      };
      
      // If we're completing the task, also mark all subtasks as completed
      if (newStatus === 'completed' && updatedTask.subtasks && updatedTask.subtasks.length > 0) {
        updatedTask.subtasks = updatedTask.subtasks.map(subtask => ({
          ...subtask,
          status: 'completed',
          completed: true
        }));
      }
      
      // Sanitize the task data before sending to backend
      const sanitizedTask = sanitizeTaskForUpdate(updatedTask);
      console.log('Sending sanitized task to backend:', sanitizedTask);
      
      // Update in the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/updateTask/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedTask),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update task: ${response.status}`);
      }
    
      // Update in local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      // Update the state first
      setTasks(updatedTasks);
      
      // Show toast notification
      if (newStatus === 'completed') {
        successToast('Task marked as completed!');
      } else {
        infoToast('Task marked as incomplete');
      }
      
      // Use setTimeout with a safer pattern
      setTimeout(() => {
        // Only update context if the component is still mounted
        if (document.body.contains(document.getElementById('tasks-container'))) {
          updateTasks(updatedTasks, true);
        }
      }, 50);
      
    } catch (error) {
      console.error('Error toggling task completion:', error);
      errorToast(error.message || 'Failed to update task status. Please try again.');
      // Reload tasks to reset state
      fetchTasks();
    }
  };
  
  const toggleSubtaskCompletion = async (taskId, subtaskId) => {
    try {
      // First find the task and subtask
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) {
        throw new Error('Task not found');
      }
      
      const subtaskIndex = taskToUpdate.subtasks.findIndex(st => st.id === subtaskId);
      if (subtaskIndex === -1) {
        throw new Error('Subtask not found');
      }
      
      // If this is the task with an active timer, handle differently
      if (activeTimer === taskId) {
        errorToast("Cannot update subtasks while timer is active. Please stop the timer first.");
        return;
      }
      
      // Prepare the updated task
      const updatedSubtasks = [...taskToUpdate.subtasks];
      const newStatus = updatedSubtasks[subtaskIndex].status === 'completed' || updatedSubtasks[subtaskIndex].completed ? 'pending' : 'completed';
      updatedSubtasks[subtaskIndex] = {
        ...updatedSubtasks[subtaskIndex],
        status: newStatus,
        completed: newStatus === 'completed'
      };
      
      const updatedTask = {
        ...taskToUpdate,
        subtasks: updatedSubtasks,
        updated_at: new Date().toISOString()
      };
      
      // If all subtasks are completed, maybe set the task to completed too
      const allSubtasksCompleted = updatedSubtasks.every(st => st.status === 'completed' || st.completed);
      if (allSubtasksCompleted) {
        updatedTask.status = 'completed';
        updatedTask.completed = true;
      }
      
      // Sanitize the task data before sending to backend
      const sanitizedTask = sanitizeTaskForUpdate(updatedTask);
      
      // Update the backend first
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/updateTask/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedTask),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }
      
      // Then update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      // First update component state
      setTasks(updatedTasks);
      
      // Show toast notification
      if (newStatus === 'completed') {
        successToast('Subtask marked as completed!');
      } else {
        infoToast('Subtask marked as incomplete');
      }
      
      // Use setTimeout with a safer pattern
      setTimeout(() => {
        // Only update context if the component is still mounted
        if (document.body.contains(document.getElementById('tasks-container'))) {
          updateTasks(updatedTasks, true);
        }
      }, 50);
      
    } catch (error) {
      console.error('Error toggling subtask completion:', error);
      errorToast('Failed to update subtask status. Please try again.');
      // Reload tasks to reset state
      fetchTasks();
    }
  };
  

  const addSubtask = async (taskId, subtaskTitle) => {
    if (!subtaskTitle.trim()) return;
  
    try {
      // If this is the task with an active timer, handle differently
      if (activeTimer === taskId) {
        errorToast("Cannot add subtasks while timer is active. Please stop the timer first.");
        return;
      }
      
      // Find the task to update
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) {
        throw new Error('Task not found');
      }
      
      // Create new subtask
      const newSubtaskId = taskToUpdate.subtasks.length
        ? Math.max(...taskToUpdate.subtasks.map(st => st.id)) + 1
        : 1;

      const newSubtask = {
        id: newSubtaskId,
        name: subtaskTitle,
        title: subtaskTitle, // For UI compatibility
        status: 'pending',
        completed: false,
        estimated_time: null
      };
      
      // Create updated task
      const updatedTask = {
        ...taskToUpdate,
        subtasks: [...taskToUpdate.subtasks, newSubtask],
        updated_at: new Date().toISOString()
      };
      
      // Sanitize the task data before sending to backend
      const sanitizedTask = sanitizeTaskForUpdate(updatedTask);
      
      // Update the backend first
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/updateTask/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedTask),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`);
      }
      
      // Then update local state
      const updatedTasks = tasks.map(task => 
        task.id === taskId ? updatedTask : task
      );
      
      // First update component state
      setTasks(updatedTasks);
      
      // Show toast notification
      successToast('Subtask added successfully!');
      
      // Then schedule context update for next frame to avoid render conflicts
      window.setTimeout(() => {
        updateTasks(updatedTasks, true);
      }, 0);
      
    } catch (error) {
      console.error('Error adding subtask:', error);
      errorToast('Failed to add subtask. Please try again.');
      // Reload tasks to reset state
      fetchTasks();
    }
  };
  
  const createTask = async (newTask) => {
    try {
      setIsLoading(true);
      console.log('Creating task:', newTask);
      
      // Create a copy of the task and ensure estimatedHours and estimatedMinutes are properly handled
      const taskData = { ...newTask };
      
      // If estimatedHours or estimatedMinutes were sent separately, make sure they're properly converted
      if (!taskData.estimated_time && (taskData.estimatedHours !== undefined || taskData.estimatedMinutes !== undefined)) {
        const hours = Number(taskData.estimatedHours || 0);
        const minutes = Number(taskData.estimatedMinutes || 0);
        // Keep the original fields for the backend
        taskData.estimatedHours = hours;
        taskData.estimatedMinutes = minutes;
        console.log(`Setting estimated time: ${hours}h ${minutes}m`);
      }
      
      // Sanitize the task data before sending to backend
      const sanitizedTask = sanitizeTaskForUpdate(taskData);
      console.log('Sanitized task for creation:', sanitizedTask);
      
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/AddTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedTask),
      });
  
      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.message || 'Error creating task');
      }
      
      successToast('Task created successfully!');
      // Fetch all tasks to ensure consistency with backend
      await fetchTasks();
      
    } catch (error) {
      console.error('Error creating task:', error);
      errorToast(error.message || 'Error creating task. Please try again.');
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
    } else if (sortOption === 'priority-HIGH') {
      result.sort((a, b) => {
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });
    } else if (sortOption === 'priority-LOW') {
      result.sort((a, b) => {
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } else if (sortOption === 'alphabetical') {
      result.sort((a, b) => (a.title || a.name).localeCompare(b.title || b.name));
    }
    
    setFilteredTasks(result);
  }, [filters, tasks, sortOption]);

  // Available filter options
  const filterOptions = {
    priority: ['HIGH', 'MEDIUM', 'LOW'],
    status: ['Pending', 'Completed'],
    category: ['Physical', 'Mental', 'Spiritual', 'Social']
  };

  // Available sort options
  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'priority-HIGH', label: 'Priority (HIGH to LOW)' },
    { id: 'priority-LOW', label: 'Priority (LOW to HIGH)' },
    { id: 'alphabetical', label: 'Alphabetical' }
  ];
  
  const renderFilterDropdown = () => {
    return (
      <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 overfLOW-hidden">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-MEDIUM text-gray-700">Filter Tasks</h3>
        </div>
        
        <div className="p-3 border-b border-gray-200">
          <h4 className="text-xs font-MEDIUM text-gray-500 mb-2">PRIORITY</h4>
          <div className="space-y-2">
            {filterOptions.priority.map(priority => (
              <div 
                key={priority} 
                className="flex items-center cursor-pointer hover:bg-gray-50 p-1 rounded"
                onClick={() => applyFilter('priority', priority)}
              >
                <div className={`w-3 h-3 rounded-full mr-2 ${
                  priority === 'HIGH' ? 'bg-red-500' : 
                  priority === 'MEDIUM' ? 'bg-yelLOW-500' : 'bg-green-500'
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
          <h4 className="text-xs font-MEDIUM text-gray-500 mb-2">STATUS</h4>
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
          <h4 className="text-xs font-MEDIUM text-gray-500 mb-2">CATEGORY</h4>
          <div className="space-y-2 max-h-48 overfLOW-y-auto">
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
      <div className="absolute left-0 mt-2 w-64 bg-white rounded-md shadow-lg z-20 overfLOW-hidden">
        <div className="p-3 border-b border-gray-200">
          <h3 className="text-sm font-MEDIUM text-gray-700">Sort Tasks</h3>
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

  // Add a startTaskTimer function to validate before starting timer
  const startTaskTimer = (taskId) => {
    // Find the task
    const task = tasks.find(t => t.id === taskId);
    
    // Don't alLOW starting timer for completed tasks
    if (task && (task.status === 'completed' || task.completed)) {
      errorToast("Cannot start timer for completed tasks.");
      return;
    }
    
    // Start the timer
    startTimer(taskId);
    
    // Show toast notification
    successToast(`Timer started for task: ${task?.title || 'Selected task'}`);
  };

  const handleSaveEdit = async (editedTask) => {
    try {
      const taskId = editedTask?.id || selectedTask?.id;
    
      if (!taskId) {
        throw new Error('No valid task ID provided');
      }
      
      // Don't alLOW edits on tasks with active timers
      if (activeTimer === taskId) {
        errorToast("Cannot edit task while its timer is active. Please stop the timer first.");
        return;
      }
      
      // Ensure estimated_time is properly formatted for the backend
      let taskToUpdate = { ...editedTask };
      
      // If we have hours/minutes as separate fields, format them properly
      if (editedTask.estimatedHours !== undefined || editedTask.estimatedMinutes !== undefined) {
        const hours = Number(editedTask.estimatedHours || 0);
        const minutes = Number(editedTask.estimatedMinutes || 0);
        taskToUpdate.estimatedHours = hours;
        taskToUpdate.estimatedMinutes = minutes;
        console.log(`Formatting estimated time: ${hours}h ${minutes}m`);
      }
      
      // Sanitize the task before sending to backend
      const sanitizedTask = sanitizeTaskForUpdate(taskToUpdate);
      console.log('Sanitized task for update:', sanitizedTask);
    
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/updateTask/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sanitizedTask),
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
      
      // Show toast notification
      successToast('Task updated successfully!');
      
      // Use setTimeout to schedule the context update with a safer pattern
      setTimeout(() => {
        // Only update context if the component is still mounted
        if (document.body.contains(document.getElementById('tasks-container'))) {
          updateTasks(updatedTasks, true);
        }
      }, 50);
    
      // Close modal only if editing from modal
      if (selectedTask) {
        setShowEditTaskModal(false);
        setSelectedTask(null);
      }
      
      return response.json();
    } catch (error) {
      console.error('Error updating task:', error);
      errorToast(error.message || 'Failed to update task. Please try again.');
      throw error;
    }
  };
  

  const handleDeleteTask = async (taskId) => {
    // Prevent deleting a task that has an active timer
    if (activeTimer === taskId) {
      errorToast("Cannot delete a task while its timer is active. Please stop the timer first.");
      return;
    }
    
    // Simple confirmation using state pattern
    if (showConfirmDelete === taskId) {
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
        
        // Show toast notification
        successToast('Task deleted successfully!');
        
        // Use setTimeout with a safer pattern
        setTimeout(() => {
          // Only update context if the component is still mounted
          if (document.body.contains(document.getElementById('tasks-container'))) {
            updateTasks(updatedTasks, true);
          }
        }, 50);
        
        // Reset confirmation state
        setShowConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting task:', error);
        errorToast(error.message || 'Failed to delete task. Please try again.');
      } finally {
        setIsLoading(false);
      }
    } else {
      setShowConfirmDelete(taskId);
    }
  };

  if (showTaskHistory) {
    return <TaskHistory goBack={() => setShowTaskHistory(false)} />;
  }

  return (
    <div className="bg-gray-50 min-h-screen" id="tasks-container">
      <div className="px-4 py-4">
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
              <div className="mb-6 p-4 bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
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
                        <span className="font-MEDIUM">Active timer!</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Tasks List */}
              <div className="space-y-4">
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
                      onStartTimer={() => startTaskTimer(task.id)}
                      isTimerActive={activeTimer === task.id}
                    />
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="bg-gray-100 rounded-full p-3 mb-4">
                      <FiCheck className="h-6 w-6 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-MEDIUM text-gray-700 mb-1">No tasks found</h3>
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
        
        {/* Confirm Delete Modal */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-2">Delete Task</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete this task? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmDelete(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteTask(showConfirmDelete)}
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
  );
};

export default Tasks; 