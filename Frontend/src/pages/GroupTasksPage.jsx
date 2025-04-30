import React, { useState, useEffect } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Spinner from '../components/ui/Spinner';
import GroupTaskList from '../components/group-tasks/GroupTaskList';
import GroupTaskForm from '../components/group-tasks/GroupTaskForm';
import { FiPlus, FiFilter, FiX, FiUsers, FiList } from 'react-icons/fi';

/**
 * GroupTasksPage component to manage and display group tasks
 * 
 * @returns {JSX.Element} GroupTasksPage component
 */
const GroupTasksPage = () => {
  const token = localStorage.getItem('token');
  // State management
  const [tasks, setTasks] = useState([]);
  const [friends, setFriends] = useState([]);
  const [priorities, setPriorities] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  // Fetch tasks, friends, and reference data
  useEffect(() => {
    fetchInitialData();
  }, []);

  /**
   * Fetches all initial data needed for the page
   * This would be replaced with actual API calls in a real implementation
   */
  const fetchInitialData = async () => {
    setLoading(true);
    
    try {
      // Simulate API calls
      // TODO: Replace with actual API calls to your backend
      await Promise.all([
        fetchPriorities(),
        fetchStatuses(),
        fetchTags(),
        fetchFriends(),
        fetchTasks()
      ]);
    } catch (error) {
      console.error("Error fetching data:", error);
      // TODO: Add proper error handling
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fetches priority data
   * @returns {Promise} Promise resolving to priority data
   */
  const fetchPriorities = async () => {
    // Simulate API call
    // TODO: Replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        const data = [
          { id: 1, name: 'Low', color: 'success' },
          { id: 2, name: 'Medium', color: 'warning' },
          { id: 3, name: 'High', color: 'danger' }
        ];
        setPriorities(data);
        console.log("These are priorities");
        console.log(priorities);
        resolve(data);
      }, 300);
    });
  };
 
  /**
   * Fetches status data
   * @returns {Promise} Promise resolving to status data
   */
  const fetchStatuses = async () => {
    // Simulate API call
    // TODO: Replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        const data = [
          { id: 1, name: 'To Do', color: 'secondary' },
          { id: 2, name: 'In Progress', color: 'primary' },
          { id: 3, name: 'Done', color: 'success' }
        ];
        setStatuses(data);
        resolve(data);
      }, 300);
    });
  };

  /**
   * Fetches tag data
   * @returns {Promise} Promise resolving to tag data
   */
  const fetchTags = async () => {
    // Simulate API call
    // TODO: Replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        const data = [
          { id: 1, name: 'Work', color: 'primary' },
          { id: 2, name: 'Personal', color: 'success' },
          { id: 3, name: 'Study', color: 'warning' },
          { id: 4, name: 'Health', color: 'danger' }
        ];
        setTags(data);
        resolve(data);
      }, 300);
    });
  };

  const fetchFriends = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/getFriends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) {
      setFriends(data)};
    } catch (error) {
      console.error('Error fetching friends:', error);
    }
  };
  /**
   * Fetches task data
   * @returns {Promise} Promise resolving to task data
   */
  const fetchTasks = async () => {
    // Simulate API call
    // TODO: Replace with actual API call
    return new Promise(resolve => {
      setTimeout(() => {
        const data = [
          {
            id: 1,
            title: 'Complete team project',
            description: 'Finish the quarterly project with the team',
            statusId: 1,
            priorityId: 3,
            dueDate: '2023-08-25',
            createdBy: 1, // User_id Admin user_id
            groupId: null,
            createdAt: '2023-07-15T10:00:00Z',
            updatedAt: '2023-07-15T10:00:00Z',
            assignees: [1, 2, 3],
            tagIds: [1]
          },
          {
            id: 2,
            title: 'Team workout session',
            description: 'Weekly team building exercise',
            statusId: 2,
            priorityId: 2,
            dueDate: '2023-08-10',
            createdBy: 2,
            groupId: null,
            createdAt: '2023-07-16T09:30:00Z',
            updatedAt: '2023-07-16T15:45:00Z',
            assignees: [2, 4],
            tagIds: [2, 4]
          },
          {
            id: 3,
            title: 'Research new technologies',
            description: 'Collaborative research on emerging tech for next sprint',
            statusId: 1,
            priorityId: 1,
            dueDate: '2023-09-01',
            createdBy: 3,
            groupId: null,
            createdAt: '2023-07-17T14:20:00Z',
            updatedAt: '2023-07-17T14:20:00Z',
            assignees: [1, 3, 4],
            tagIds: [3]
          }
        ];
        setTasks(data);
        resolve(data);
      }, 300);
    });
  };

  // Filter tasks based on active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === 'active') {
      return task.statusId !== 3; // Not done
    } else if (activeTab === 'completed') {
      return task.statusId === 3; // Done
    }
    return true; // All tasks
  });

  /**
   * Creates a new task
   */
  const handleCreateTask = () => {
    setEditingTask(null);
    setShowForm(true);
  };

  /**
   * Edits an existing task
   * @param {Object} task - The task to edit
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  /**
   * Submits a task (create or update)
   * @param {Object} taskData - The task data to submit
   */
  const handleSubmitTask = (taskData) => {
    // TODO: Replace with actual API calls

    if (editingTask) {
      // Update existing task
      updateTask(taskData);
    } else {
      // Create new task
      createTask(taskData);
    }
    
    setShowForm(false);
    setEditingTask(null);
  };

  /**
   * Creates a new task
   * @param {Object} taskData - The task data to create
   */
  const createTask = (taskData) => {
    // TODO: Replace with actual API call
    const newId = Math.max(0, ...tasks.map(t => t.id)) + 1;
    const now = new Date().toISOString();
    // Logic to Add Group Task
    // But before that we have to structure group Task syntactically with the db
    const newTask = { 
      ...taskData, 
      id: newId,
      createdAt: now,
      updatedAt: now,
      createdBy: 1 // Current user ID would come from auth context
    };
    
    setTasks([...tasks, newTask]);
  };

  /**
   * Updates an existing task
   * @param {Object} taskData - The task data to update
   */
  const updateTask = (taskData) => {
    // TODO: Replace with actual API call
    setTasks(tasks.map(task => 
      task.id === editingTask.id ? { ...taskData, id: task.id } : task
    ));
  };

  /**
   * Deletes a task
   * @param {number} taskId - The ID of the task to delete
   */
  const handleDeleteTask = (taskId) => {
    // TODO: Replace with actual API call
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  /**
   * Cancels the task form
   */
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingTask(null);
  };

  /**
   * Maps a task for the form
   * @param {Object} task - The task to map
   * @returns {Object} The mapped task data
   */
  const mapTaskForForm = (task) => {
    if (!task) return null;
    return {
      id: task.id,
      title: task.title,
      description: task.description,
      due_date: task.dueDate,
      priority_id: task.priorityId,
      status_id: task.statusId,
      assignees: task.assignees || [],
      tags: task.tagIds || []
    };
  };

  // Show loading spinner while data is being fetched
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
                <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group Tasks</h1>
            </div>
            
            <Button 
              onClick={handleCreateTask} 
              variant="primary"
              size="md"
              icon={FiPlus}
            >
              Add Group Task
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <Tabs
            tabs={[
              { id: 'all', label: 'All Tasks', icon: FiList },
              { id: 'active', label: 'Active', count: tasks.filter(t => t.statusId !== 3).length },
              { id: 'completed', label: 'Completed', count: tasks.filter(t => t.statusId === 3).length }
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />
        </div>

        {showForm && (
          <Card 
            className="mb-6"
            shadow="card"
            header={
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {editingTask ? 'Edit Group Task' : 'Create New Group Task'}
              </h2>
            }
          >
            <GroupTaskForm
              task={mapTaskForForm(editingTask)}
              priorities={priorities}
              statuses={statuses}
              tags={tags}
              friends={friends}
              onSubmit={handleSubmitTask}
              onCancel={handleCancelForm}
              submitLabel={editingTask ? 'Update Task' : 'Add Task'}
            />
          </Card>
        )}

        <GroupTaskList
          tasks={filteredTasks}
          priorities={priorities}
          statuses={statuses}
          tags={tags}
          friends={friends}
          onEdit={handleEditTask}
          onDelete={handleDeleteTask}
        />
      </div>
    </div>
  );
};

export default GroupTasksPage; 