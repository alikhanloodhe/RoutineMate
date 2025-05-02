import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { group, activity } from '../components/goal';
import { getGoalById, updateGoal } from '../utils/goalData';

const GroupGoalDetail = () => {
  const { goalId } = useParams();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showFormModal, setShowFormModal] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [activeMilestoneTab, setActiveMilestoneTab] = useState('pending');
  
  // Milestone form state
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneReminderDate, setMilestoneReminderDate] = useState('');
  const [milestoneStatus, setMilestoneStatus] = useState('pending');
  const [milestoneAssignedTo, setMilestoneAssignedTo] = useState('');
  
  // Member management state
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [memberEmail, setMemberEmail] = useState('');
  const [memberRole, setMemberRole] = useState('collaborator');
  
  // Current user info (in a real app, this would come from auth context)
  const [currentUser, setCurrentUser] = useState({
    id: 'current-user-id',
    name: 'You',
    role: 'admin', // or 'collaborator'
    avatar: null
  });
  
  // Track personal milestone completion
  const [personalMilestoneProgress, setPersonalMilestoneProgress] = useState({});

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Handle personal milestone completion
  const handlePersonalMilestoneCompletion = (milestoneId, isComplete) => {
    setPersonalMilestoneProgress(prev => ({
      ...prev,
      [milestoneId]: isComplete
    }));
    
    // In a real app, this would save to the backend
    
    // Update the goal's overall progress calculation
    calculateGoalProgress();
  };
  
  // Calculate goal progress based on all members' milestone completions
  const calculateGoalProgress = () => {
    if (!goal || !goal.milestones || goal.milestones.length === 0) return;
    
    // In a real app, this would use data from all members
    // For now, we'll just use the current user's progress
    const totalMilestones = goal.milestones.length;
    let completedCount = 0;
    
    goal.milestones.forEach(milestone => {
      if (personalMilestoneProgress[milestone.id]) {
        completedCount++;
      }
    });
    
    const newProgress = Math.round((completedCount / totalMilestones) * 100);
    
    setGoal(prevGoal => ({
      ...prevGoal,
      progress: newProgress
    }));
  };

  // Handle adding a new member
  const handleAddMember = () => {
    if (!memberEmail.trim()) {
      alert('Please enter an email address');
      return;
    }
    
    // In a real app, this would send an invitation to the email
    // For now, we'll just add a mock member
    const newMember = {
      user_id: Date.now().toString(),
      name: memberEmail.split('@')[0],
      role: memberRole,
      status: 'active',
      join_date: new Date().toISOString(),
      progress: 0,
      completed_milestones: 0
    };
    
    setGoal(prevGoal => {
      // Update member_progress for all milestones to include the new member
      const updatedMilestones = prevGoal.milestones.map(milestone => ({
        ...milestone,
        member_progress: {
          ...milestone.member_progress,
          [newMember.user_id]: false
        }
      }));
      
      return {
        ...prevGoal,
        members: [...prevGoal.members, newMember],
        milestones: updatedMilestones
      };
    });
    
    // Reset form
    setMemberEmail('');
    setMemberRole('collaborator');
    setShowAddMemberForm(false);
  };

  // Handle adding a new milestone (admin only)
  const handleAddMilestone = () => {
    if (!milestoneTitle.trim()) {
      alert('Please enter a milestone title');
      return;
    }

    if (!milestoneDueDate) {
      alert('Please select a due date');
      return;
    }
    
    const newMilestone = {
      id: Date.now().toString(),
      title: milestoneTitle,
      description: milestoneDescription,
      due_date: milestoneDueDate,
      reminder_date: milestoneReminderDate || null,
      member_progress: goal.members.reduce((acc, member) => {
        acc[member.user_id] = false;
        return acc;
      }, {})
    };
    
    // Update goal with new milestone
    setGoal(prevGoal => ({
      ...prevGoal,
      milestones: [...prevGoal.milestones, newMilestone]
    }));
    
    // Reset form
    setMilestoneTitle('');
    setMilestoneDescription('');
    setMilestoneDueDate('');
    setMilestoneReminderDate('');
    setShowMilestoneForm(false);
    
    // Recalculate progress
    calculateGoalProgress();
  };

  // Handle changing member role
  const handleChangeMemberRole = (memberId, newRole) => {
    setGoal(prevGoal => ({
      ...prevGoal,
      members: prevGoal.members.map(member => {
        if (member.user_id === memberId) {
          return { ...member, role: newRole };
        }
        return member;
      })
    }));
  };

  // Handle removing a member (admin only)
  const handleRemoveMember = (memberId) => {
    if (!window.confirm('Are you sure you want to remove this member?')) {
      return;
    }
    
    setGoal(prevGoal => ({
      ...prevGoal,
      members: prevGoal.members.filter(member => member.user_id !== memberId)
    }));
  };

  // Handle edit goal (admin only)
  const handleEdit = () => {
    if (currentUser.role !== 'admin') {
      alert('Only admins can edit the goal');
      return;
    }
    setShowFormModal(true);
  };

  // Handle update goal
  const handleUpdateGoal = (updatedGoal) => {
    setGoal({ ...goal, ...updatedGoal });
    setShowFormModal(false);
  };
  
  // Handle leaving the group goal (for collaborators)
  const handleLeaveGoal = () => {
    if (currentUser.role === 'admin') {
      alert('As the admin, you cannot leave the goal. Transfer ownership first or delete the goal.');
      return;
    }
    
    if (window.confirm('Are you sure you want to leave this group goal?')) {
      // In a real app, this would call an API to remove the user
      navigate('/goals');
    }
  };

  // Fetch goal data
  useEffect(() => {
    setIsLoading(true);
    
    // Small timeout to simulate API call
    setTimeout(() => {
      try {
        const foundGoal = getGoalById(goalId);
        
        if (foundGoal && foundGoal.goal_type === 'group') {
          setGoal(foundGoal);
          setIsLoading(false);
        } else {
          console.error('Group goal not found:', goalId);
          alert('Group goal not found. Redirecting to goals page.');
          navigate('/goals');
        }
      } catch (error) {
        console.error('Error fetching goal data:', error);
        setIsLoading(false);
        alert('Error loading goal details. Redirecting to goals page.');
        navigate('/goals');
      }
    }, 500);
  }, [goalId, navigate]);

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  // Format timestamp for activities
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    });
  };

  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get milestone status color
  const getMilestoneStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch (category) {
      case 'education':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        );
      case 'fitness':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
          </svg>
        );
      case 'finance':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'project':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
      default:
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get member rank class based on progress
  const getMemberRankClass = (position) => {
    switch (position) {
      case 0: // Gold
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 1: // Silver
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 2: // Bronze
        return 'bg-amber-100 text-amber-800 border-amber-300';
      default:
        return 'bg-white text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB]">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      {/* Main Content Layout */}
      <div className="flex h-[calc(100vh-60px)]">
        {/* Sidebar */}
        <Sidebar sidebarOpen={sidebarOpen} />
        
        {/* Main Content */}
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          {isLoading ? (
            // Loading state
            <div className="flex flex-col items-center justify-center h-[70vh]">
              <div className="w-16 h-16 border-4 border-[#4A2BAF] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#1C1C1C] font-medium">Loading goal details...</p>
            </div>
          ) : goal ? (
            <>
              {/* Goal Header */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex items-center gap-4">
                    <div className="bg-[#4A2BAF]/10 p-3 rounded-lg">
                      {getCategoryIcon(goal.category)}
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-[#1C1C1C]">{goal.title}</h1>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(goal.status)}`}>
                          {goal.status.charAt(0).toUpperCase() + goal.status.slice(1)}
                        </span>
                        <span className="text-gray-500 text-sm">
                          {formatDate(goal.start_date)} - {formatDate(goal.end_date)}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleEdit} 
                      className="px-4 py-2 text-[#4A2BAF] border border-[#4A2BAF] rounded-lg hover:bg-[#4A2BAF]/5 transition-colors duration-200"
                    >
                      Edit Goal
                    </button>
                    <button className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90 transition-opacity duration-200">
                      Share
                    </button>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{goal.description}</p>
                
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                  <div className="w-full sm:w-auto flex-1">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] h-2 rounded-full" 
                        style={{ width: `${goal.progress}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {goal.members.slice(0, 4).map((member, index) => (
                      <div 
                        key={member.user_id} 
                        className="w-8 h-8 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-xs font-medium text-[#4A2BAF] -ml-1 first:ml-0 border-2 border-white"
                        title={member.name}
                      >
                        {member.name.charAt(0)}
                      </div>
                    ))}
                    
                    {goal.members.length > 4 && (
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-600 -ml-1 border-2 border-white">
                        +{goal.members.length - 4}
                      </div>
                    )}
                    
                    <button 
                      onClick={() => setShowAddMemberForm(true)}
                      className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors duration-200 ml-1"
                      title="Add member"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="bg-white rounded-xl shadow-sm mb-6">
                <div className="border-b border-gray-200">
                  <nav className="flex -mb-px">
                    <button
                      onClick={() => setActiveTab('overview')} 
                      className={`py-4 px-6 font-medium text-sm border-b-2 ${
                        activeTab === 'overview' 
                          ? 'border-[#4A2BAF] text-[#4A2BAF]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Overview
                    </button>
                    <button
                      onClick={() => setActiveTab('activity')} 
                      className={`py-4 px-6 font-medium text-sm border-b-2 ${
                        activeTab === 'activity' 
                          ? 'border-[#4A2BAF] text-[#4A2BAF]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Activity
                    </button>
                    <button
                      onClick={() => setActiveTab('members')} 
                      className={`py-4 px-6 font-medium text-sm border-b-2 ${
                        activeTab === 'members' 
                          ? 'border-[#4A2BAF] text-[#4A2BAF]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Members
                    </button>
                    <button
                      onClick={() => setActiveTab('leaderboard')} 
                      className={`py-4 px-6 font-medium text-sm border-b-2 ${
                        activeTab === 'leaderboard' 
                          ? 'border-[#4A2BAF] text-[#4A2BAF]' 
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      Leaderboard
                    </button>
                  </nav>
                </div>
                
                {/* Tab Content */}
                <div className="p-6">
                  {activeTab === 'overview' && (
                    // 🔹 Milestone Tracker Section – Shared and Interactive
                    <div>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-semibold text-[#1C1C1C]">Milestones</h2>
                        {currentUser.role === 'admin' && (
                          <button 
                            onClick={() => setShowMilestoneForm(true)}
                            className="text-sm text-[#4A2BAF] font-medium hover:underline flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                            Add Milestone
                          </button>
                        )}
                      </div>
                      
                      {/* Milestone Tabs */}
                      <div className="flex border-b border-gray-200 mb-6">
                        <button
                          onClick={() => setActiveMilestoneTab('pending')}
                          className={`py-2 px-4 text-sm font-medium ${
                            activeMilestoneTab === 'pending'
                              ? 'text-[#4A2BAF] border-b-2 border-[#4A2BAF]'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={() => setActiveMilestoneTab('completed')}
                          className={`py-2 px-4 text-sm font-medium ${
                            activeMilestoneTab === 'completed'
                              ? 'text-[#4A2BAF] border-b-2 border-[#4A2BAF]'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          Completed
                        </button>
                      </div>
                      
                      {/* Milestone List */}
                      <div className="space-y-4">
                        {goal.milestones.filter(milestone => 
                          activeMilestoneTab === 'completed' 
                            ? milestone.status === 'completed' 
                            : milestone.status !== 'completed'
                        ).map(milestone => (
                          <div 
                            key={milestone.id}
                            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={milestone.status === 'completed'}
                                  onChange={(e) => handlePersonalMilestoneCompletion(milestone.id, e.target.checked)}
                                  className="mt-1.5 h-4 w-4 rounded border-gray-300 text-[#4A2BAF] focus:ring-[#4A2BAF]"
                                />
                                <div>
                                  <h3 className="font-medium text-[#1C1C1C]">{milestone.title}</h3>
                                  <p className="text-sm text-gray-600 mt-1">{milestone.description}</p>
                                  
                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3">
                                    <div className="flex items-center text-sm text-gray-500">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                      Due: {formatDate(milestone.due_date)}
                                    </div>
                                    
                                    {milestone.status === 'completed' && milestone.completion_date && (
                                      <div className="flex items-center text-sm text-green-600">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Completed: {formatDate(milestone.completion_date)}
                                      </div>
                                    )}
                                    
                                    {milestone.assigned_to && (
                                      <div className="flex items-center text-sm text-gray-500">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        Assigned to: {milestone.assigned_to.name}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex">
                                <div className={`h-2 w-2 rounded-full mt-2 ${getMilestoneStatusColor(milestone.status)}`}></div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {goal.milestones.filter(milestone => 
                          activeMilestoneTab === 'completed' 
                            ? milestone.status === 'completed' 
                            : milestone.status !== 'completed'
                        ).length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-gray-500">
                              {activeMilestoneTab === 'completed' 
                                ? 'No completed milestones yet.' 
                                : 'No pending milestones.'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                  {activeTab === 'activity' && (
                    <activity.ActivityTab 
                      goal={goal}
                      currentUser={currentUser}
                      formatTimestamp={formatTimestamp}
                      onUpdate={(updatedGoal) => setGoal(updatedGoal)}
                    />
                  )}
                  {activeTab === 'members' && currentUser.role === 'admin' && (
                    // 🔹 Member Tracker Section – Role Management & Invitations
                    <div>
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-[#1C1C1C]">Team Members</h2>
                        <button
                          onClick={() => setShowAddMemberForm(true)}
                          className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90 transition-opacity duration-200 flex items-center space-x-1"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          <span>Add Member</span>
                        </button>
                      </div>
                      
                      {/* Members List */}
                      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Join Date</th>
                              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {goal.members.map(member => {
                              // Calculate member progress
                              let completedCount = 0;
                              goal.milestones.forEach(milestone => {
                                if (milestone.member_progress?.[member.user_id]) {
                                  completedCount++;
                                }
                              });
                              
                              const progress = goal.milestones.length > 0
                                ? Math.round((completedCount / goal.milestones.length) * 100)
                                : 0;
                              
                              return (
                                <tr key={member.user_id} className="hover:bg-gray-50">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-8 h-8 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-xs font-medium text-[#4A2BAF]">
                                        {member.name.charAt(0)}
                                      </div>
                                      <div className="ml-4">
                                        <div className="text-sm font-medium text-gray-900">
                                          {member.name}
                                          {member.user_id === currentUser.id && (
                                            <span className="ml-1 text-xs text-gray-500">(You)</span>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`text-xs px-2 py-1 rounded-full ${getRoleBadgeColor(member.role)}`}>
                                      {member.role === 'admin' ? 'Admin' : 'Collaborator'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {formatDate(member.join_date || goal.created_at)}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                      <div className="w-full bg-gray-200 rounded-full h-2 mr-2 max-w-[100px]">
                                        <div 
                                          className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] h-2 rounded-full" 
                                          style={{ width: `${progress}%` }}
                                        ></div>
                                      </div>
                                      <span className="text-xs text-gray-500">{progress}%</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {member.role !== 'admin' && (
                                      <button
                                        onClick={() => handleRemoveMember(member.user_id)}
                                        className="text-red-600 hover:text-red-900"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      
                      {/* Role Explanation */}
                      <div className="mt-8">
                        <h3 className="text-md font-semibold text-gray-700 mb-3">Member Roles Explained</h3>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-xs font-medium text-purple-800">
                              A
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Admin</h4>
                              <p className="text-sm text-gray-600 mt-1">Can edit the goal, manage members, add/edit milestones, and track their own progress. Has full control over the goal.</p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-xs font-medium text-blue-800">
                              C
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900">Collaborator</h4>
                              <p className="text-sm text-gray-600 mt-1">Can track their own milestone progress, post updates, and participate in discussions. Cannot edit goal details or manage members.</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {activeTab === 'leaderboard' && (
                    // 🔹 Leaderboard Section – Fun Competitive Collaboration
                    <div>
                      <h2 className="text-lg font-semibold text-[#1C1C1C] mb-6">Team Leaderboard</h2>
                      
                      {goal.milestones && goal.milestones.length > 0 ? (
                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Member</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Milestones</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* Sort members by number of completed milestones */}
                              {goal.members
                                .map(member => {
                                  // Calculate completed milestones for each member
                                  let completedCount = 0;
                                  goal.milestones.forEach(milestone => {
                                    if (milestone.member_progress?.[member.user_id]) {
                                      completedCount++;
                                    }
                                  });
                                  
                                  const progressPercentage = goal.milestones.length > 0
                                    ? Math.round((completedCount / goal.milestones.length) * 100)
                                    : 0;
                                    
                                  return {
                                    ...member,
                                    completedMilestones: completedCount,
                                    totalMilestones: goal.milestones.length,
                                    progress: progressPercentage
                                  };
                                })
                                .sort((a, b) => {
                                  // Sort by completed milestones (descending)
                                  if (b.completedMilestones !== a.completedMilestones) {
                                    return b.completedMilestones - a.completedMilestones;
                                  }
                                  // If tied, sort alphabetically by name
                                  return a.name.localeCompare(b.name);
                                })
                                .map((member, index) => (
                                  <tr key={member.user_id} className={index < 3 ? getMemberRankClass(index) : ''}>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      {index === 0 && (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-yellow-100 text-yellow-800 border border-yellow-300">
                                          🥇
                                        </div>
                                      )}
                                      {index === 1 && (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 text-gray-800 border border-gray-300">
                                          🥈
                                        </div>
                                      )}
                                      {index === 2 && (
                                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                                          🥉
                                        </div>
                                      )}
                                      {index > 2 && (
                                        <div className="text-center text-gray-500">{index + 1}</div>
                                      )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="flex items-center">
                                        <div className="flex-shrink-0 h-8 w-8 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-xs font-medium text-[#4A2BAF]">
                                          {member.name.charAt(0)}
                                        </div>
                                        <div className="ml-4">
                                          <div className="text-sm font-medium text-gray-900">
                                            {member.name}
                                            {member.user_id === currentUser.id && (
                                              <span className="ml-1 text-xs text-gray-500">(You)</span>
                                            )}
                                          </div>
                                          <div className="text-xs text-gray-500">
                                            {member.role === 'admin' ? 'Admin' : 'Collaborator'}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="text-sm text-gray-900">
                                        {member.completedMilestones} / {member.totalMilestones}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                      <div className="w-full bg-gray-200 rounded-full h-2.5 max-w-xs">
                                        <div 
                                          className={`h-2.5 rounded-full ${index < 3 
                                            ? 'bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF]' 
                                            : 'bg-blue-500'}`}
                                          style={{ width: `${member.progress}%` }}
                                        ></div>
                                      </div>
                                      <div className="text-xs text-gray-500 mt-1">{member.progress}% complete</div>
                                    </td>
                                  </tr>
                                ))
                              }
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <h3 className="text-lg font-medium text-gray-900 mb-1">No Leaderboard Available</h3>
                          <p className="text-gray-500 max-w-md mx-auto">
                            Add milestones to the goal to track team progress and enable the leaderboard
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
              <div className="bg-[#4A2BAF]/5 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#4A2BAF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">Goal Not Found</h2>
              <p className="text-gray-500 max-w-md mb-6">The goal you're looking for doesn't exist or you don't have permission to view it.</p>
              <button 
                onClick={() => navigate('/goals')}
                className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200"
              >
                Back to Goals
              </button>
            </div>
          )}
        </div>
      </div>
      
      {/* Add Member Form Modal */}
      {showAddMemberForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-[#1C1C1C]">Add Team Member</h3>
              <button 
                onClick={() => setShowAddMemberForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <label htmlFor="memberEmail" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                id="memberEmail"
                value={memberEmail}
                onChange={(e) => setMemberEmail(e.target.value)}
                placeholder="Enter email address"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
              />
              <p className="mt-1 text-xs text-gray-500">
                This will send an invitation to join this group goal
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="memberRole" className="block text-sm font-medium text-gray-700 mb-1">Role</label>
              <select
                id="memberRole"
                value={memberRole}
                onChange={(e) => setMemberRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
              >
                <option value="collaborator">Collaborator</option>
                <option value="admin">Admin</option>
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {memberRole === 'admin' 
                  ? 'Admin can manage goal, members, and all aspects of the project.' 
                  : 'Collaborator can track progress and post updates.'
                }
              </p>
            </div>
            
            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setShowAddMemberForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMember}
                className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                Add Member
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Edit Goal Modal */}
      {showFormModal && (
        <group.GroupGoalFormModal
          isOpen={showFormModal}
          onClose={() => setShowFormModal(false)}
          onSubmit={handleUpdateGoal}
          goal={goal}
        />
      )}
      
      {/* Add Milestone Modal */}
      {showMilestoneForm && goal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-[#1C1C1C]">Add New Milestone</h3>
              <button 
                onClick={() => setShowMilestoneForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Milestone Title */}
              <div>
                <label htmlFor="milestoneTitle" className="block text-sm font-medium text-gray-700 mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  id="milestoneTitle"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Enter milestone title"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
                />
              </div>
              
              {/* Milestone Description */}
              <div>
                <label htmlFor="milestoneDescription" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="milestoneDescription"
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                  placeholder="Describe your milestone"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
                />
              </div>
              
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="milestoneDueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    id="milestoneDueDate"
                    value={milestoneDueDate}
                    onChange={(e) => setMilestoneDueDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
                  />
                </div>
                
                <div>
                  <label htmlFor="milestoneReminderDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Reminder Date (Optional)
                  </label>
                  <input
                    type="date"
                    id="milestoneReminderDate"
                    value={milestoneReminderDate}
                    onChange={(e) => setMilestoneReminderDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6 space-x-2">
              <button
                type="button"
                onClick={() => setShowMilestoneForm(false)}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
              >
                Save Milestone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupGoalDetail; 