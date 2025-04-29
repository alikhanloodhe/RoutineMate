// src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react';
import Spinner from '../components/ui/Spinner';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/tasks/TaskModal';
import Button from '../components/ui/Button';
import { FiCheck, FiCalendar, FiPlus, FiList } from 'react-icons/fi';

const Tasks = () => {
  const token = localStorage.getItem('token');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState([ ]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all', 'active', 'completed'

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/fetchTasks`, {
          headers: {
            'authorization': `Bearer ${localStorage.getItem('token')}`, // if using JWT
            'Content-Type': 'application/json'
          }
        });
        const data = await res.json();
        const formatted = data.map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate || task.due_date,
          priority: task.priority.toLowerCase(),
          tags: task.tags, // should be an array
          status: task.status,
          subtasks: task.subtasks.map(st => ({
            title: st.title,
            completed: st.completed
          }))
        }));
        console.log(formatted);
        setTasks(formatted);
        console.log(Object.isFrozen(formatted));
        // setTasks(data);
        
        console.log("First Task:", data[0]);
        console.log(tasks);
      } catch (err) {
        console.error('Failed to fetch tasks:', err);
      }finally {
        setLoading(false);
      }
    };

    fetchTasks();
  },[]);
  
  // Function to handle saving a new task or updating an existing one
  const handleSaveTask = (taskData) => {
    // Check if it's an update or a new task

    if (taskData.id) {
      // Update existing task
      updateTaskInBackend(taskData);
    } else {
      // Create new task
      createTaskInBackend(taskData);
    }
  };

  // Function to create a new task
  const createTaskInBackend = async (taskData) => {

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/AddTask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });
  
      const data = await res.json();
  
      if (res.ok) {
        alert('Task Added Successfully');
        // Add the new task to local state
        setTasks(prevTasks => [...prevTasks, { ...taskData, id: Date.now() }]);
      } else {
        alert(data.msg || 'Error from backend');
      }
  
      console.log('Task data sent to backend:', taskData);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };
  

  // Function to update an existing task
  const updateTaskInBackend = async (taskData) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/editTask/${taskData.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'authorization': `Bearer ${token}`
        },
        body: JSON.stringify(taskData)
      });
    
      const data = await res.json();
      if (res.ok) {
        // alert('Task updated!');
        console.log('Task Updated')
      } else {
        alert(data.error || 'Error updating task');
      }
      
      console.log('Updating task:', taskData);

      // Update task in local state
      setTasks(tasks.map(task => 
        task.id === taskData.id ? taskData : task
      ));
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  // Function to delete a task
  const deleteTaskFromBackend = async (taskId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/deleteTask/${taskId}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (res.ok) {
        alert('Task Deleted Successfully');
        setTasks(tasks.filter(task => task.id !== taskId));
      } else {
        alert(data.message || 'Error from backend');
      }
      
      
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  // Function to add a subtask to an existing task
  const addSubtaskToTask = async (taskId, subtask) => {
    try {
      const taskToUpdate = tasks.find(task => task.id === taskId);
      if (!taskToUpdate) return;

      const updatedTask = {
        ...taskToUpdate,
        subtasks: [...taskToUpdate.subtasks, subtask]
      };

      console.log('Adding subtask to task:', taskId, subtask);
      
      // Update task in local state
      updateTaskInBackend(updatedTask);
    } catch (error) {
      console.error('Error adding subtask:', error);
    }
  };

  // Function to handle task update (including changing status)
  const handleUpdateTask = (taskId, updatedTaskData, openEditModal = false) => {
    if (openEditModal) {
      // Open edit modal with task data
      setTaskToEdit(updatedTaskData);
      setIsModalOpen(true);
    } else {
      // Just update the task without opening modal
      updateTaskInBackend(updatedTaskData);
    }
  };

  // Close modal and reset taskToEdit
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setTaskToEdit(null);
  };

  // Filter tasks based on activeFilter
  const filteredTasks = tasks.filter(task => {
    if (activeFilter === 'active') {
      return task.status !== 'Completed';
    } else if (activeFilter === 'completed') {
      return task.status === 'Completed';
    }
    return true; // 'all' filter
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg">
                <FiCalendar className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Tasks</h1>
            </div>
            
            <Button 
              onClick={() => {
                setTaskToEdit(null);
                setIsModalOpen(true);
              }}
              variant="primary"
              size="md"
              icon={FiPlus}
            >
              Add Task
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs / Filters */}
        <div className="mb-6">
          <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeFilter === 'all'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FiList />
                <span>All Tasks</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  {tasks.length}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveFilter('active')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeFilter === 'active'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FiCalendar />
                <span>Active</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  {tasks.filter(t => t.status !== 'Completed').length}
                </span>
              </div>
            </button>
            
            <button
              onClick={() => setActiveFilter('completed')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                activeFilter === 'completed'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                  : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FiCheck />
                <span>Completed</span>
                <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                  {tasks.filter(t => t.status === 'Completed').length}
                </span>
              </div>
            </button>
          </div>
        </div>

        <TaskList
          tasks={filteredTasks}
          onUpdateTask={handleUpdateTask}
          onDeleteTask={deleteTaskFromBackend}
          onAddSubtask={addSubtaskToTask}
        />
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTask}
        taskToEdit={taskToEdit}
      />
    </div>
  );
};

export default Tasks;