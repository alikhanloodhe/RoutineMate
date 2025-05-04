import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const GroupGoalForm = ({ 
  goal = null, 
  onSubmit, 
  onCancel 
}) => {
  // Form states
  const [step, setStep] = useState(1); // 1: Goal details, 2: Friends & Milestones
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [milestones, setMilestones] = useState([]);
  const [members, setMembers] = useState([]);
  // const [visibility, setVisibility] = useState('private');
  const [friends, setFriends] = useState([]);
  const token = localStorage.getItem('token') || '';
  // Friend search
  const [friendSearch, setFriendSearch] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  
  // Current milestone being added
  const [milestoneTitle, setMilestoneTitle] = useState('');
  const [milestoneDescription, setMilestoneDescription] = useState('');
  const [milestoneDueDate, setMilestoneDueDate] = useState('');
  const [milestoneReminder, setMilestoneReminder] = useState('3 days before');
  
  // Validation states
  const [errors, setErrors] = useState({});

  // Categories
  const categories = [
    { value: '', label: 'Choose category...' },
    { value: 'education', label: 'Education' },
    { value: 'fitness', label: 'Fitness' },
    { value: 'finance', label: 'Finance' },
    { value: 'project', label: 'Project' },
    { value: 'other', label: 'Other' }
  ];
  
  // Reminder options
  const reminderOptions = [
    '1 day before',
    '3 days before',
    '1 week before',
    '2 weeks before'
  ];

  // Sample friends data (in a real app, this would be fetched from the API)
  // const friends = [
  //   { id: '1', name: 'Alex Kim', avatar: '' },
  //   { id: '2', name: 'Jordan Lee', avatar: '' },
  //   { id: '3', name: 'Taylor Wong', avatar: '' },
  //   { id: '4', name: 'Jamie Smith', avatar: '' },
  //   { id: '5', name: 'Casey Johnson', avatar: '' },
  // ];
  
  
  
  // If editing, populate form with goal data
  useEffect(() => {
    if (goal) {
      setTitle(goal.title || '');
      setDescription(goal.description || '');
      setCategory(goal.category || '');
      // setVisibility(goal.visibility || 'private');
      setStartDate(goal.start_date ? formatDateForInput(goal.start_date) : '');
      setEndDate(goal.end_date ? formatDateForInput(goal.end_date) : '');
      setMilestones(goal.milestones || []);
      
      // Convert members to selectedFriends format
      if (goal.members?.length) {
        const formattedMembers = goal.members.map(member => ({
          id: member.user_id,
          name: member.name,
          avatar: member.avatar || ''
        }));
        setSelectedFriends(formattedMembers);
      }
    }
   
  }, [goal]);

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (dateString) => {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  // Validate goal details
  const validateGoalDetails = () => {
    const newErrors = {};
    
    if (!title.trim()) newErrors.title = 'Title is required';
    if (!category) newErrors.category = 'Category is required';
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (start > end) {
        newErrors.endDate = 'End date must be after start date';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validate friends and milestones
  const validateFriendsAndMilestones = () => {
    const newErrors = {};
    
    if (selectedFriends.length === 0) {
      newErrors.friends = 'At least one friend must be selected';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Move to next step
  const handleNextStep = () => {
    if (validateGoalDetails()) {
      setStep(2);
    }
  };

  // Add friend
  const handleAddFriend = (friend) => {
    if (!selectedFriends.some(f => f.id === friend.id)) {
      setSelectedFriends([...selectedFriends, friend]);
    }
    setFriendSearch('');
  };

  // Remove friend
  const handleRemoveFriend = (friendId) => {
    setSelectedFriends(selectedFriends.filter(f => f.id !== friendId));
  };

  // Filter friends based on search
  const filteredFriends = friendSearch.trim() === '' 
    ? [] 
    : friends.filter(friend => 
        friend.name.toLowerCase().includes(friendSearch.toLowerCase()) &&
        !selectedFriends.some(f => f.id === friend.id)
      );

  // Add milestone
  const handleAddMilestone = () => {
    if (milestoneTitle.trim() === '') {
      setErrors({ ...errors, milestoneTitle: 'Milestone title is required' });
      return;
    }
    
    if (!milestoneDueDate) {
      setErrors({ ...errors, milestoneDueDate: 'Due date is required' });
      return;
    }
    
    const newMilestone = {
      id: Date.now().toString(),
      title: milestoneTitle,
      description: milestoneDescription,
      due_date: milestoneDueDate,
      reminder: milestoneReminder
    };
    
    setMilestones([...milestones, newMilestone]);
    
    // Clear milestone form
    setMilestoneTitle('');
    setMilestoneDescription('');
    setMilestoneDueDate('');
    setMilestoneReminder('3 days before');
    setErrors({ ...errors, milestoneTitle: null, milestoneDueDate: null });
  };

  // Remove milestone
  const handleRemoveMilestone = (id) => {
    setMilestones(milestones.filter(m => m.id !== id));
  };

  // Submit form
  const handleSubmit = () => {
    if (!validateFriendsAndMilestones()) {
      return;
    }
    
    // Convert selected friends to members format
    const formattedMembers = selectedFriends.map(friend => ({
      user_id: friend.id,
      name: friend.name,
      role: friend.id === '1' ? 'admin' : 'viewer' // Set the current user as admin
    }));
    
    // Compile all data
    const goalData = {
      title,
      description,
      category,
      start_date: startDate,
      end_date: endDate,
      goal_type: 'group',
      // visibility,
      milestones,
      members: formattedMembers,
      // Add additional properties for existing goals
      ...(goal && { goal_id: goal.goal_id }),
      ...(goal && { status: goal.status }),
      ...(goal && { progress: goal.progress }),
      ...(goal && { created_at: goal.created_at })
    };
    
    // Call onSubmit with goal data
    onSubmit(goalData);
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 max-w-3xl mx-auto">
      {/* Form Header */}
      <h2 className="text-2xl font-bold text-gray-800 mb-8">
        {goal ? 'Edit Group Goal' : 'Create Group Goal'}
      </h2>
      
      {/* Steps Indicator */}
      <div className="flex items-start mb-8">
        <div className="flex flex-col items-center mr-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step >= 1 ? 'bg-[#4A2BAF]' : 'bg-gray-300'}`}>
            <span>1</span>
          </div>
          <span className="mt-2 text-sm font-medium">Goal Details</span>
        </div>
        <div className="flex-1 pt-3">
          <div className="h-1 bg-gray-200 rounded">
            <div 
              className="h-1 bg-[#4A2BAF] rounded" 
              style={{ width: step === 1 ? '50%' : '100%' }}
            ></div>
          </div>
        </div>
        <div className="flex flex-col items-center ml-8">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${step >= 2 ? 'bg-[#4A2BAF]' : 'bg-gray-300'}`}>
            <span>2</span>
          </div>
          <span className="mt-2 text-sm font-medium">Friends &<br />Milestones</span>
        </div>
      </div>
      
      {/* Step 1: Goal Details */}
      {step === 1 && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Goal Title <span className="text-red-500">*required</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter goal title"
              className={`w-full border ${errors.title ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
            />
            {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your group goal"
              rows="4"
              className="w-full border border-gray-300 rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20"
            ></textarea>
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">
              Category <span className="text-red-500">*required</span>
            </label>
            <div className="relative">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full border ${errors.category ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 pr-10 appearance-none focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-700">
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                Start Date <span className="text-red-500">*required</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className={`w-full border ${errors.startDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                />
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {errors.startDate && <p className="text-red-500 text-sm mt-1">{errors.startDate}</p>}
            </div>
            
            <div>
              <label className="block text-gray-700 font-medium mb-2">
                End Date <span className="text-red-500">*required</span>
              </label>
              <div className="relative">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className={`w-full border ${errors.endDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                />
                <div className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2">
                  <svg className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              {errors.endDate && <p className="text-red-500 text-sm mt-1">{errors.endDate}</p>}
            </div>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleNextStep}
              className="px-8 py-2 bg-[#121212] text-white rounded-md hover:opacity-90 transition-all"
            >
              Next
            </button>
          </div>
        </motion.div>
      )}
      
      {/* Step 2: Friends & Milestones */}
      {step === 2 && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Friends Selection */}
          <div className="mb-8">
            <label className="block text-gray-700 font-medium mb-2">
              Select Friends <span className="text-red-500">*required</span>
            </label>
            
            <div className="relative mb-2">
              <input
                type="text"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
                placeholder="Search friends..."
                className={`w-full border ${errors.friends ? 'border-red-500' : 'border-gray-300'} rounded-md p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
            
            {errors.friends && <p className="text-red-500 text-sm mt-1 mb-2">{errors.friends}</p>}
            
            {/* Friend search results */}
            {filteredFriends.length > 0 && (
              <div className="border border-gray-200 rounded-md mb-3 max-h-40 overflow-y-auto">
                {filteredFriends.map(friend => (
                  <div 
              
                    key={friend.id}
                    className="p-2 hover:bg-gray-100 cursor-pointer flex items-center"
                    onClick={() => handleAddFriend(friend)}
                  >
                    <div className="w-8 h-8 rounded-full bg-[#4A2BAF] text-white flex items-center justify-center text-sm font-medium">
                      {friend.name.charAt(0)}
                    </div>
                    <span className="ml-2">{friend.name}</span>
                  </div>
                ))}
              </div>
            )}
            
            {/* Selected friends */}
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedFriends.map(friend => (
                <div 
                  key={friend.id}
                  className="bg-gray-100 rounded-full px-3 py-1 flex items-center"
                >
                  <div className="w-6 h-6 rounded-full bg-[#4A2BAF] text-white flex items-center justify-center text-xs font-medium mr-1">
                    {friend.name.charAt(0)}
                  </div>
                  <span className="text-sm">{friend.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveFriend(friend.id)}
                    className="ml-2 text-gray-500 hover:text-gray-700"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
          
          {/* Milestones */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Milestones</h3>
              <button
                type="button"
                className="text-[#4A2BAF] hover:underline text-sm"
                onClick={() => {
                  if (milestoneTitle || milestoneDescription || milestoneDueDate) {
                    handleAddMilestone();
                  }
                }}
              >
                + Add Milestone
              </button>
            </div>
            
            {/* Milestone form */}
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Milestone Title
                </label>
                <input
                  type="text"
                  value={milestoneTitle}
                  onChange={(e) => setMilestoneTitle(e.target.value)}
                  placeholder="Enter milestone title"
                  className={`w-full border ${errors.milestoneTitle ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                />
                {errors.milestoneTitle && <p className="text-red-500 text-xs mt-1">{errors.milestoneTitle}</p>}
              </div>
              
              <div className="mb-3">
                <label className="block text-gray-700 text-sm font-medium mb-1">
                  Description
                </label>
                <textarea
                  value={milestoneDescription}
                  onChange={(e) => setMilestoneDescription(e.target.value)}
                  placeholder="Describe this milestone"
                  rows="2"
                  className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20"
                ></textarea>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={milestoneDueDate}
                    onChange={(e) => setMilestoneDueDate(e.target.value)}
                    className={`w-full border ${errors.milestoneDueDate ? 'border-red-500' : 'border-gray-300'} rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20`}
                  />
                  {errors.milestoneDueDate && <p className="text-red-500 text-xs mt-1">{errors.milestoneDueDate}</p>}
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-1">
                    Reminder
                  </label>
                  <div className="relative">
                    <select
                      value={milestoneReminder}
                      onChange={(e) => setMilestoneReminder(e.target.value)}
                      className="w-full border border-gray-300 rounded-md p-2 pr-8 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20"
                    >
                      {reminderOptions.map(option => (
                        <option key={option} value={option}>{option}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Added milestones list */}
            {milestones.length > 0 && (
              <div className="space-y-3 mb-6">
                {milestones.map(milestone => (
                  <div 
                    key={milestone.id}
                    className="border border-gray-200 rounded-md p-3 bg-white flex justify-between items-center"
                  >
                    <div>
                      <h4 className="font-medium">{milestone.title}</h4>
                      <p className="text-xs text-gray-500">
                        Due: {formatDateForDisplay(milestone.due_date)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex justify-between mt-10">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors flex items-center"
            >
              <svg className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back
            </button>
            <div>
              <button
                type="button"
                onClick={onCancel}
                className="mr-2 px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                className="px-8 py-2 bg-[#121212] text-white rounded-md hover:opacity-90 transition-all"
              >
                {goal ? 'Update Group Goal' : 'Create Group Goal'}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default GroupGoalForm; 