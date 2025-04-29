import React, { useState } from 'react';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import GroupTaskList from '../components/group-tasks/GroupTaskList';
import GroupTaskModal from '../components/group-tasks/GroupTaskModal';
import { FiPlus, FiFilter, FiX, FiUsers, FiList, FiCalendar, FiCheckCircle } from 'react-icons/fi';

/**
 * GroupTasksPage component to manage and display group tasks
 * 
 * @returns {JSX.Element} GroupTasksPage component
 */
const GroupTasksPage = () => {
  // Static mock data
  const mockTasks = [
    {
      id: 1,
      title: 'Complete team project',
      description: 'Finish the quarterly project with the team',
      statusId: 1,
      priorityId: 3,
      dueDate: '2023-08-25',
      createdBy: 1,
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

  const mockFriends = [
    { id: 1, name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1' },
    { id: 2, name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=5' },
    { id: 3, name: 'Mike Johnson', avatar: 'https://i.pravatar.cc/150?img=8' },
    { id: 4, name: 'Sarah Williams', avatar: 'https://i.pravatar.cc/150?img=9' }
  ];

  const mockPriorities = [
    { id: 1, name: 'Low', color: 'success' },
    { id: 2, name: 'Medium', color: 'warning' },
    { id: 3, name: 'High', color: 'danger' }
  ];

  const mockStatuses = [
    { id: 1, name: 'To Do', color: 'secondary' },
    { id: 2, name: 'In Progress', color: 'primary' },
    { id: 3, name: 'Done', color: 'success' }
  ];

  const mockTags = [
    { id: 1, name: 'Work', color: 'primary' },
    { id: 2, name: 'Personal', color: 'success' },
    { id: 3, name: 'Study', color: 'warning' },
    { id: 4, name: 'Health', color: 'danger' }
  ];

  // State management
  const [tasks, setTasks] = useState(mockTasks);
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Filter tasks based on active tab and search query
  const filteredTasks = tasks.filter(task => {
    // Filter by tab
    if (activeTab === 'active') {
      if (task.statusId === 3) return false; // Not done
    } else if (activeTab === 'completed') {
      if (task.statusId !== 3) return false; // Done
    }
    
    // Filter by search query
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(query)) {
        return false;
      }
    }
    
    return true;
  });

  /**
   * Creates a new task
   */
  const handleCreateTask = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  /**
   * Edits an existing task
   * @param {Object} task - The task to edit
   */
  const handleEditTask = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  /**
   * Submits a task (create or update)
   * @param {Object} taskData - The task data to submit
   */
  const handleSubmitTask = (taskData) => {
    if (editingTask) {
      // Update existing task
      const updatedTasks = tasks.map(task => 
        task.id === editingTask.id ? { ...task, ...taskData } : task
      );
      setTasks(updatedTasks);
    } else {
      // Create new task
      const newTask = {
        ...taskData,
        id: tasks.length + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setTasks([...tasks, newTask]);
    }
    
    setIsModalOpen(false);
  };

  /**
   * Deletes a task
   * @param {number} taskId - The ID of the task to delete
   */
  const handleDeleteTask = (taskId) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      setTasks(tasks.filter(task => task.id !== taskId));
    }
  };

  /**
   * Closes the task modal
   */
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTask(null);
  };

  /**
   * Maps a task to the format needed by the modal
   * @param {Object} task - The task to map
   * @returns {Object} The mapped task
   */
  const mapTaskForModal = (task) => {
    return {
      id: task.id,
      title: task.title,
      description: task.description || '',
      dueDate: task.dueDate || '',
      priority: task.priorityId,
      status: task.statusId,
      assignees: task.assignees || [],
      tags: task.tagIds || []
    };
  };

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
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Group Tasks</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">Collaborate with your team</p>
              </div>
            </div>
            
            <Button 
              variant="primary"
              size="md"
              icon={FiPlus} 
              onClick={handleCreateTask}
            >
              Create Task
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <FiFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <FiX />
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <Card>
            <div className="flex gap-3 items-center">
              <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                <FiList className="text-blue-600 dark:text-blue-400 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Total Tasks</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.length}</h2>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex gap-3 items-center">
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                <FiCalendar className="text-yellow-600 dark:text-yellow-400 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">In Progress</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.statusId === 2).length}</h2>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex gap-3 items-center">
              <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                <FiCheckCircle className="text-green-600 dark:text-green-400 text-xl" />
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Completed</p>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{tasks.filter(t => t.statusId === 3).length}</h2>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
          <button 
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'all' 
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('all')}
          >
            All Tasks
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs ml-2">
              {tasks.length}
            </span>
          </button>
          
          <button 
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'active' 
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('active')}
          >
            Active
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs ml-2">
              {tasks.filter(t => t.statusId !== 3).length}
            </span>
          </button>
          
          <button 
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'completed' 
              ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
            onClick={() => setActiveTab('completed')}
          >
            Completed
            <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs ml-2">
              {tasks.filter(t => t.statusId === 3).length}
            </span>
          </button>
        </div>

        {/* Task List */}
        <div className="mt-6">
          <GroupTaskList 
            tasks={filteredTasks}
            statuses={mockStatuses}
            priorities={mockPriorities}
            friends={mockFriends}
            tags={mockTags}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
          
          {filteredTasks.length === 0 && (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <FiList className="text-blue-600 dark:text-blue-400 text-2xl" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No tasks found</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                {searchQuery 
                  ? "No tasks match your search criteria" 
                  : activeTab === 'completed' 
                    ? "You haven't completed any tasks yet" 
                    : activeTab === 'active' 
                      ? "You don't have any active tasks" 
                      : "You don't have any tasks yet"}
              </p>
              <Button 
                variant="outline" 
                onClick={handleCreateTask}
                icon={FiPlus}
              >
                Create a task
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <GroupTaskModal 
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitTask}
          initialValues={editingTask ? mapTaskForModal(editingTask) : null}
          friends={mockFriends}
          priorities={mockPriorities}
          statuses={mockStatuses}
          tags={mockTags}
        />
      )}
    </div>
  );
};

export default GroupTasksPage; 