import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import { updateGoal } from '../utils/goalData';
import { MilestoneFormModal, ActivityFormModal } from '../components/goal/activity';

const GoalDetail = () => {
  // removed goal visisbility
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Activity view state
  const [activityView, setActivityView] = useState('feed');
  const [activityFilter, setActivityFilter] = useState('all');
  
  // Modal state
  const [showMilestoneModal, setShowMilestoneModal] = useState(false);
  const [currentMilestone, setCurrentMilestone] = useState(null);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [currentActivity, setCurrentActivity] = useState(null);
  
  const { goalId } = useParams();
  const navigate = useNavigate();

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle milestone related functions
  const handleAddMilestone = () => {
    setCurrentMilestone(null);
    setShowMilestoneModal(true);
  };

  const handleEditMilestone = (milestone) => {
    setCurrentMilestone(milestone);
    setShowMilestoneModal(true);
  };

  const handleMilestoneSubmit = async (milestoneData) => {
    let updatedMilestones;
    
    try {
      if (milestoneData.milestone_id) {
        // Update existing milestone in the UI
        updatedMilestones = goal.milestones.map(m => 
          m.milestone_id === milestoneData.milestone_id ? milestoneData : m
        );
        
        // Update milestone in the backend
        await fetch(`${import.meta.env.VITE_API_URL}/api/goals/updateMilestone/${goalId}/${milestoneData.milestone_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(milestoneData),
        });
      } else {
        // Add new milestone with a new ID
        const newMilestone = {
          ...milestoneData,
          milestone_id: `milestone-${Date.now()}`, // Frontend temporary ID
          created_at: new Date().toISOString()
        };
        
        // Add to UI right away for better UX
        updatedMilestones = [...goal.milestones, newMilestone];
        
        // Save to backend
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/goals/addMilestone/${goalId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newMilestone),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
      }
      
      // Calculate new progress based on completed milestones
      const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
      const totalCount = updatedMilestones.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : goal.progress;
      
      // Update the goal with new milestones and progress
      const updatedGoal = {
        ...goal,
        milestones: updatedMilestones,
        progress: newProgress
      };
      
      // Update state
      setGoal(updatedGoal);
      
      // Update goal progress in the backend
      await fetch(`${import.meta.env.VITE_API_URL}/api/goals/updateGoal/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ progress: newProgress }),
      });
      
      // Keep local state in sync (will be removed once backend API is complete)
      updateGoal(goal.goal_id, updatedGoal);
    } catch (error) {
      console.error('Error with milestone operation:', error);
      alert('Error adding or updating milestone. Please try again.');
    }
    
    // Close the modal
    setShowMilestoneModal(false);
  };

  // Toggle milestone completion status
  const handleToggleMilestoneCompletion = async (milestone) => {
    try {
      const newStatus = milestone.status === 'completed' ? 'pending' : 'completed';
      const updatedMilestone = {
        ...milestone,
        status: newStatus,
        completion_date: newStatus === 'completed' ? new Date().toISOString() : null
      };
      
      // Update UI immediately for better UX
      const updatedMilestones = goal.milestones.map(m => 
        m.milestone_id === milestone.milestone_id ? updatedMilestone : m
      );
      
      // Calculate new progress based on completed milestones
      const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
      const totalCount = updatedMilestones.length;
      const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : goal.progress;
      
      // Update the goal with new milestones and progress
      const updatedGoal = {
        ...goal,
        milestones: updatedMilestones,
        progress: newProgress
      };
      
      // Update state
      setGoal(updatedGoal);
      
      // Update milestone in the backend
      await fetch(`${import.meta.env.VITE_API_URL}/api/goals/updateMilestone/${goalId}/${updatedMilestone.milestone_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ 
          status: newStatus, 
          completion_date: updatedMilestone.completion_date 
        }),
      });
      
      // Also update goal progress
      await fetch(`${import.meta.env.VITE_API_URL}/api/goals/updateGoal/${goalId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ progress: newProgress }),
      });
      
      // Keep local state in sync (will be removed once backend API is complete)
      updateGoal(goal.goal_id, updatedGoal);
    } catch (error) {
      console.error('Error updating milestone status:', error);
      alert('Error updating milestone status. Please try again.');
    }
  };

  // Delete milestone
  const handleDeleteMilestone = async (milestoneId) => {
    if (window.confirm('Are you sure you want to delete this milestone?')) {
      try {
        // Update UI immediately for better UX
        const updatedMilestones = goal.milestones.filter(m => m.milestone_id !== milestoneId);
        
        // Calculate new progress based on completed milestones
        const completedCount = updatedMilestones.filter(m => m.status === 'completed').length;
        const totalCount = updatedMilestones.length;
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
        
        // Update the goal with new milestones and progress
        const updatedGoal = {
          ...goal,
          milestones: updatedMilestones,
          progress: newProgress
        };
        
        // Update state
        setGoal(updatedGoal);
        
        // Delete milestone in the backend
        await fetch(`${import.meta.env.VITE_API_URL}/api/goals/deleteMilestone/${goalId}/${milestoneId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        
        // Also update goal progress
        await fetch(`${import.meta.env.VITE_API_URL}/api/goals/updateGoal/${goalId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ progress: newProgress }),
        });
        
        // Keep local state in sync (will be removed once backend API is complete)
        updateGoal(goal.goal_id, updatedGoal);
      } catch (error) {
        console.error('Error deleting milestone:', error);
        alert('Error deleting milestone. Please try again.');
      }
    }
  };

  // Handle activity related functions
  const handleAddActivity = () => {
    setCurrentActivity(null);
    setShowActivityModal(true);
  };

  const handleEditActivity = (activity) => {
    setCurrentActivity(activity);
    setShowActivityModal(true);
  };

  const handleActivitySubmit = async (activityData) => {
    let updatedActivities;
    
    try {
      if (activityData.activity_id) {
        // Update existing activity in the UI
        updatedActivities = goal.activities.map(a => 
          a.activity_id === activityData.activity_id ? activityData : a
        );
        
        // TODO: Add API endpoint for updating activity
        /* 
        // Uncomment once the API endpoint is created
        await fetch(`${import.meta.env.VITE_API_URL}/api/goals/updateActivity/${goalId}/${activityData.activity_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(activityData),
        });
        */
      } else {
        // Add new activity with a new ID
        const newActivity = {
          ...activityData,
          activity_id: `activity-${Date.now()}`, // Frontend temporary ID
          timestamp: new Date().toISOString()
        };
        
        // Add to UI right away for better UX
        updatedActivities = [newActivity, ...(goal.activities || [])];
        
        // TODO: Add API endpoint for adding activity
        
        // Uncomment once the API endpoint is created
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/activities/addActivity/${goalId}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(newActivity),
        });
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        

      }
      
      // Update the goal with new activities
      const updatedGoal = {
        ...goal,
        activities: updatedActivities
      };
      
      // Update state
      setGoal(updatedGoal);
      
      // Keep local state in sync (will be removed once backend API is complete)
      updateGoal(goal.goal_id, updatedGoal);
    } catch (error) {
      console.error('Error with activity operation:', error);
      alert('Error adding or updating activity. Please try again.');
    }
    
    // Close the modal
    setShowActivityModal(false);
  };
  
  // Delete activity
  const handleDeleteActivity = async (activityId) => {
    if (window.confirm('Are you sure you want to delete this activity?')) {
      try {
        // Update UI immediately for better UX
        const updatedActivities = goal.activities.filter(a => a.activity_id !== activityId);
        
        // Update the goal with new activities
        const updatedGoal = {
          ...goal,
          activities: updatedActivities
        };
        
        // Update state
        setGoal(updatedGoal);
        
        // TODO: Add API endpoint for deleting activity
        /* 
        // Uncomment once the API endpoint is created
        await fetch(`${import.meta.env.VITE_API_URL}/api/goals/deleteActivity/${goalId}/${activityId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          }
        });
        */
        
        // Keep local state in sync (will be removed once backend API is complete)
        updateGoal(goal.goal_id, updatedGoal);
      } catch (error) {
        console.error('Error deleting activity:', error);
        alert('Error deleting activity. Please try again.');
      }
    }
  };

  // Fetch goal details
  useEffect(() => {
    setIsLoading(true);
    
    const fetchGoalById = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/goals/fetchGoal/${goalId}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (!res.ok) {
          throw new Error('Failed to fetch goal details');
        }

        const data = await res.json();
        
        if (data.goal && data.goal.goal_type === 'personal') {
          // Ensure milestones and activities arrays exist
          if (!data.goal.milestones) data.goal.milestones = [];
          if (!data.goal.activities) data.goal.activities = [];
          
          setGoal(data.goal);
        } else {
          throw new Error('Personal goal not found');
        }
      } catch (error) {
        console.error('Error fetching goal data:', error);
        alert('Error loading goal details. Redirecting to goals page.');
        navigate('/goals');
      } finally {
        setIsLoading(false);
      }
    };

    fetchGoalById();
    }, [goalId, navigate]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const month = date.toLocaleString('default', { month: 'short' });
    const day = date.getDate();
    const year = date.getFullYear();
    return `${month} ${day}, ${year}`;
  };

  // Format timestamp for activities
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric', 
      minute: 'numeric', 
      hour12: true 
    });
  };

  // Add click outside handler for activity dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdowns = document.querySelectorAll('[id^="dropdown-"]');
      dropdowns.forEach(dropdown => {
        if (!dropdown.contains(event.target) && 
            !event.target.closest('button[type="button"]')?.nextElementSibling?.id?.startsWith('dropdown-')) {
          dropdown.classList.add('hidden');
        }
      });
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'paused':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAF3E0]">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="flex h-[calc(100vh-60px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} flex justify-center items-center`}>
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A2BAF]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="min-h-screen bg-[#FAF3E0]">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="flex h-[calc(100vh-60px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} flex justify-center items-center`}>
            <div className="text-center">
              <h2 className="text-xl font-bold text-gray-700">Goal not found</h2>
              <button 
                onClick={() => navigate('/goals')}
                className="mt-4 bg-[#4A2BAF] text-white px-4 py-2 rounded-lg hover:bg-[#3D2291] transition-colors"
              >
                Back to Goals
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF3E0]">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      <div className="flex h-[calc(100vh-60px)]">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Back button */}
            <button 
              onClick={() => navigate('/goals')}
              className="flex items-center text-gray-600 hover:text-[#4A2BAF] mb-6 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Goals
            </button>

            {/* Goal Header */}
            <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center mb-2">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full mr-2 ${getStatusColor(goal.status)}`}>
                      {goal.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </span>
                  </div>
                  <h1 className="text-2xl font-bold text-[#1C1C1C]">{goal.title}</h1>
                  <p className="text-gray-600 mt-2">{goal.description}</p>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => navigate(`/goals/edit/${goal.goal_id}`)}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-lg transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Category</div>
                  <div className="font-medium capitalize">{goal.category || 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Start Date</div>
                  <div className="font-medium">{goal.start_date ? formatDate(goal.start_date) : 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">End Date</div>
                  <div className="font-medium">{goal.end_date ? formatDate(goal.end_date) : 'Not specified'}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="text-xs text-gray-500 mb-1">Created</div>
                  <div className="font-medium">{formatDate(goal.created_at)}</div>
                </div>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Overall Progress</span>
                  <span>{goal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] h-2.5 rounded-full" 
                    style={{ width: `${goal.progress}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-gray-200 mb-6">
              <nav className="flex space-x-8">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'overview'
                      ? 'border-[#4A2BAF] text-[#4A2BAF]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Milestones
                </button>
                <button
                  onClick={() => setActiveTab('activity')}
                  className={`py-4 px-1 text-center border-b-2 font-medium text-sm ${
                    activeTab === 'activity'
                      ? 'border-[#4A2BAF] text-[#4A2BAF]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Activity Feed
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#1C1C1C]">Milestones</h2>
                  <button 
                    onClick={handleAddMilestone}
                    className="bg-[#4A2BAF] text-white px-3 py-1.5 rounded-lg text-sm flex items-center hover:bg-[#3D2291] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Milestone
                  </button>
                </div>
                
                <div className="space-y-4">
                  {goal.milestones.map((milestone) => (
                    <div 
                      key={milestone.milestone_id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-3">
                          <div 
                            className={`mt-1 flex-shrink-0 w-5 h-5 rounded-full ${
                              milestone.status === 'completed' 
                                ? 'bg-green-500' 
                                : milestone.status === 'in_progress' 
                                ? 'bg-blue-500'
                                : milestone.status === 'overdue'
                                ? 'bg-red-500'
                                : 'bg-gray-300'
                            } flex items-center justify-center cursor-pointer`}
                            onClick={() => handleToggleMilestoneCompletion(milestone)}
                            title={milestone.status === 'completed' ? 'Mark as incomplete' : 'Mark as complete'}
                          >
                            {milestone.status === 'completed' && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 text-white" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{milestone.title}</h3>
                            <p className="text-sm text-gray-500 mt-1">{milestone.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEditMilestone(milestone)}
                            className="text-[#4A2BAF] p-1 hover:bg-[#4A2BAF]/5 rounded"
                            title="Edit milestone"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteMilestone(milestone.milestone_id)}
                            className="text-red-500 p-1 hover:bg-red-50 rounded"
                            title="Delete milestone"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                          <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${getStatusColor(milestone.status)}`}>
                            {milestone.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-3 text-xs text-gray-500 flex justify-between">
                        <div>
                          <span className="font-medium text-gray-700">Due:</span> {formatDate(milestone.due_date)}
                        </div>
                        {milestone.status === 'completed' && milestone.completion_date && (
                          <div>
                            <span className="font-medium text-gray-700">Completed:</span> {formatDate(milestone.completion_date)}
                          </div>
                        )}
                      </div>
                      
                      {/* Completion Toggle Button */}
                      <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
                        <button
                          onClick={() => handleToggleMilestoneCompletion(milestone)}
                          className={`px-3 py-1 text-xs rounded-lg flex items-center ${
                            milestone.status === 'completed'
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-green-50 text-green-700 hover:bg-green-100'
                          }`}
                        >
                          {milestone.status === 'completed' ? (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                              Mark as Incomplete
                            </>
                          ) : (
                            <>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Mark as Complete
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                  
                  {goal.milestones.length === 0 && (
                    <div className="text-center p-8 border border-gray-200 rounded-lg">
                      <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No milestones yet</h3>
                      <p className="text-gray-500 mb-4">Break down your goal into smaller manageable steps</p>
                      <button 
                        onClick={handleAddMilestone}
                        className="bg-[#4A2BAF] text-white px-4 py-2 rounded-lg text-sm flex items-center hover:bg-[#3D2291] transition-colors mx-auto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add First Milestone
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'activity' && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-[#1C1C1C]">Activity Feed (Private)</h2>
                  <button 
                    onClick={handleAddActivity}
                    className="bg-[#4A2BAF] text-white px-3 py-1.5 rounded-lg text-sm flex items-center hover:bg-[#3D2291] transition-colors"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Add Activity
                  </button>
                </div>
                
                {/* Activity List */}
                <div className="space-y-4">
                  {goal.activities.map((activity) => (
                    <motion.div 
                      key={activity.activity_id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="flex items-start">
                        <div className="flex-shrink-0 mr-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl
                            ${activity.mood === 'great' ? 'bg-green-50 text-green-600' : 
                              activity.mood === 'okay' ? 'bg-blue-50 text-blue-600' : 
                              activity.mood === 'challenging' ? 'bg-orange-50 text-orange-600' : 
                              activity.mood === 'milestone' ? 'bg-purple-50 text-purple-600' : 
                              'bg-[#4A2BAF]/10 text-[#4A2BAF]'}
                          `}>
                            {activity.mood === 'great' && '😊'}
                            {activity.mood === 'okay' && '😐'}
                            {activity.mood === 'challenging' && '😟'}
                            {activity.mood === 'milestone' && '🎉'}
                            {!activity.mood && (
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            )}
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium text-gray-900">{activity.title}</h3>
                            <div className="flex items-center">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full mr-2">
                                {formatTimestamp(activity.timestamp)}
                              </span>
                              <div className="relative inline-block text-left">
                                <button 
                                  type="button"
                                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                                  onClick={() => {
                                    const dropdown = document.getElementById(`dropdown-${activity.activity_id}`);
                                    if (dropdown) {
                                      dropdown.classList.toggle('hidden');
                                    }
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                                  </svg>
                                </button>
                                <div 
                                  id={`dropdown-${activity.activity_id}`}
                                  className="hidden absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200"
                                >
                                  <button 
                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={() => handleEditActivity(activity)}
                                  >
                                    Edit activity
                                  </button>
                                  <button 
                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                                    onClick={() => handleDeleteActivity(activity.activity_id)}
                                  >
                                    Delete activity
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-gray-600 mt-1 mb-3">{activity.description}</p>
                          
                          {/* Photo Grid */}
                          {activity.photos && activity.photos.length > 0 && (
                            <div className="mb-3">
                              <p className="text-xs text-gray-500 mb-1">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {activity.photos.length} {activity.photos.length === 1 ? 'photo' : 'photos'}
                              </p>
                              <div className={`grid ${
                                activity.photos.length === 1 ? 'grid-cols-1 max-w-[200px]' : 
                                activity.photos.length === 2 ? 'grid-cols-2 max-w-[300px]' : 
                                'grid-cols-3 max-w-[360px]'
                              } gap-2`}>
                                {activity.photos.map((photo, index) => (
                                  <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden max-h-24">
                                    <img 
                                      src={photo} 
                                      alt={`Activity photo ${index + 1}`} 
                                      className="h-full w-full object-cover cursor-pointer hover:opacity-90 transition-opacity"
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Add timestamp at the bottom */}
                          <div className="mt-2 flex justify-between items-center">
                            <div className="flex items-center text-xs text-gray-500">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {formatTimestamp(activity.timestamp)}
                            </div>
                            {activity.mood && (
                              <span className="text-sm">
                                {activity.mood === 'great' && '😊'}
                                {activity.mood === 'okay' && '😐'}
                                {activity.mood === 'challenging' && '😟'}
                                {activity.mood === 'milestone' && '🎉'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}

                  {goal.activities.length === 0 && (
                    <div className="text-center py-10 bg-white rounded-lg border border-gray-200">
                      <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">No activities yet</h3>
                      <p className="text-gray-500 mb-4">Record your progress to keep track of your journey</p>
                      <button 
                        onClick={handleAddActivity}
                        className="bg-[#4A2BAF] text-white px-4 py-2 rounded-lg hover:bg-[#3D2291] transition-colors inline-flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Add First Activity
                      </button>
                    </div>
                  )}
                </div>
                
                {/* Timeline View Toggle */}
                {/* {goal.activities.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <button
                      onClick={() => setActivityFilter("all")}
                      className="text-sm text-gray-500 hover:text-[#4A2BAF]"
                    >
                      All Activities
                    </button>
                  
                    <div className="inline-flex rounded-md shadow-sm" role="group">
                      <button
                        type="button"
                        onClick={() => setActivityView("feed")}
                        className={`px-4 py-2 text-sm font-medium ${
                          activityView === "feed" 
                            ? "text-[#4A2BAF] bg-white border border-gray-200 rounded-l-lg" 
                            : "text-gray-500 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        Feed View
                      </button>
                      <button
                        type="button"
                        onClick={() => setActivityView("timeline")}
                        className={`px-4 py-2 text-sm font-medium ${
                          activityView === "timeline" 
                            ? "text-[#4A2BAF] bg-white border-t border-b border-r border-gray-200 rounded-r-lg" 
                            : "text-gray-500 bg-white border-t border-b border-r border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-gray-700"
                        }`}
                      >
                        Timeline View
                      </button>
                    </div>
                  </div>
                )} */}
              </div>
            )}
          </motion.div>
        </div>
      </div>
      
      {/* Modals */}
      <MilestoneFormModal 
        isOpen={showMilestoneModal}
        onClose={() => setShowMilestoneModal(false)}
        onSubmit={handleMilestoneSubmit}
        milestone={currentMilestone}
      />
      
      <ActivityFormModal 
        isOpen={showActivityModal}
        onClose={() => setShowActivityModal(false)}
        onSubmit={handleActivitySubmit}
        activity={currentActivity}
      />
    </div>
  );
};

export default GoalDetail; 