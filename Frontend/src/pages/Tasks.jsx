// src/pages/Tasks.jsx
import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import TaskToggle from '../components/tasks/TaskToggle';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/tasks/TaskModal';
import { PlusCircle } from 'lucide-react';

const Tasks = () => {
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('personal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState(null);
  const [tasks, setTasks] = useState([ ]);
  useEffect(() => {
    const fetchTasks = async () => {
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
      const saveTaskToBackend = async (taskData) => {
        try {
          const res = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/AddTask`,{
              method : 'POST',
              headers: {
                      'Content-Type': 'application/json',
                      'authorization': `Bearer ${token}`
              },
              body: JSON.stringify(taskData),
          }
          );
          const data = await res.json();
  
        if (res.ok) {
          alert('Task Added Successfully');
        } else {
          alert(data.message || 'Error from backend');
        }
          
          console.log('Task data to be sent to backend:', taskData);
          // For now, we'll just add the task to our local state
          setTasks([...tasks, { ...taskData, id: Date.now() }]);
        } catch (error) {
          console.error('Error saving task:', error);
        }
      };
      
      // Call the function to save the task
      saveTaskToBackend(taskData);
      console.log('Creating new task:', taskData);
      // For now, we'll just add the task to our local state
      setTasks([...tasks, { ...taskData, id: Date.now() }]);
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
        alert('Task updated!');
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

      // Here you would make your fetch API call
      // Example:
      // const response = await fetch(`/api/tasks/${taskId}/subtasks`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ subtask }),
      // });

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <button
              onClick={() => {
                setTaskToEdit(null); // Ensure we're creating a new task, not editing
                setIsModalOpen(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <PlusCircle size={18} className="mr-2" />
              Add Task
            </button>
          </div>
          
          <div className="mb-6">
            <TaskToggle activeTab={activeTab} setActiveTab={setActiveTab} />
          </div>
          
          {activeTab === 'personal' ? (
            <TaskList 
              tasks={tasks} 
              onUpdateTask={handleUpdateTask}
              onDeleteTask={deleteTaskFromBackend}
              onAddSubtask={addSubtaskToTask}
            />
          ) : (
            <div className="bg-white rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-800 mb-2">Group Tasks</h3>
              <p className="text-gray-600">Group tasks feature is coming soon!</p>
            </div>
          )}
        </div>
      </main>
      
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