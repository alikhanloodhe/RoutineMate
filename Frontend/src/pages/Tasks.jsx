// src/pages/Tasks.jsx
import React, { useState,useEffect } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import TaskToggle from '../components/tasks/TaskToggle';
import TaskList from '../components/tasks/TaskList';
import TaskModal from '../components/tasks/TaskModal';
import { PlusCircle } from 'lucide-react';

const Tasks = () => {
  const token = localStorage.getItem('token');
  const [activeTab, setActiveTab] = useState('personal');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
    // {
    //   id: 1,
    //   title: 'Complete project proposal',
    //   description: 'Finish the documentation for the client project',
    //   dueDate: '2025-04-25 14:00',
    //   priority: 'high',
    //   tags: ['Work', 'Documentation'],
    //   status: 'To Do',
    //   subtasks: [
    //     { title: 'Outline key points', completed: true },
    //     { title: 'Write introduction', completed: false },
    //   ]
    // }]);

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
    useEffect(() => {
      console.log("Tasks updated:", tasks);
    }, [tasks]);

  const handleSaveTask = (newTask) => {
    // Function to send data to the backend
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
    saveTaskToBackend(newTask);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">Tasks</h1>
            <button
              onClick={() => setIsModalOpen(true)}
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
            <TaskList tasks={tasks} />
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
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
      />
    </div>
  );
};

export default Tasks;