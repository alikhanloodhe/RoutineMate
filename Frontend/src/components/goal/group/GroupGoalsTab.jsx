import React, { useEffect, useState } from 'react';
// import { navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import GoalCard from '../shared/GoalCard';
import AddGoalButton from '../shared/AddGoalButton';
import GroupGoalFormModal from './GroupGoalFormModal';
import { addGoal, updateGoal, deleteGoal } from '../../../utils/goalData';
import { useToastContext } from '../../../context/ToastContext';

const GroupGoalsTab = ({ goals, onViewGoal }) => {
  const { successToast, errorToast, infoToast } = useToastContext();
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);

  // Filter group goals
  const groupGoals = goals.filter(goal => goal.goal_type === 'group');

  // Handle add goal button click
  const handleAddGoal = () => {
    setCurrentGoal(null);
    setShowFormModal(true);
  };

  // Handle edit goal
  const handleEditGoal = (goal) => {
    setCurrentGoal(goal);
    setShowFormModal(true);
  };

  // Handle delete goal
  const handleDeleteGoal = async(goal) => {
    // Delete from central data
    // const deletedGoal = deleteGoal(goal.goal_id);
    // if (currentUser.role !== 'admin') {
    //   alert('Only admins can delete the goal');
    //   return;
    // }
    console.log(goal);
    
    // Simple confirmation using state pattern
    if (showConfirmDelete === goal.goal_id) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/groupGoals/deleteGroupGoal/${goal.goal_id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete goal');
        }

        // On successful deletion, navigate back to goals page
        successToast('Goal deleted successfully');
        navigate('/goals');
        
        // Reset confirmation state
        setShowConfirmDelete(null);
      } catch (error) {
        console.error('Error deleting goal:', error);
        errorToast('Failed to delete goal. Please try again.');
      }
    } else {
      setShowConfirmDelete(goal.goal_id);
    }
    
    // if (deletedGoal) {
    //   // You would typically need to update the parent component's state
    //   // This is handled by the parent component's state management
    // }
  };

  // Handle goal form submission
  const handleSubmitGoal = async (goalData) => {
    try {
      if (goalData.goal_id) {
        // Update existing goal
        updateGoal(goalData.goal_id, goalData);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/groupGoals/updateGroupGoal/${goalData.goal_id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(goalData),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        successToast('Group goal updated successfully');
      } else {
        // Add new goal with group type
        addGoal({
          ...goalData,
          goal_type: 'group'
        });
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/groupGoals/addGroupGoal`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify(goalData),
        });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        successToast('New group goal created successfully');
      }
      
      setShowFormModal(false);
    } catch (error) {
      console.error('Error with goal operation:', error);
      errorToast('Failed to save group goal. Please try again.');
    }
  };

  // Filter goals based on status
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    infoToast(`Showing ${filter} group goals`);
  };

  // Search goals
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Apply filters and search
  const getFilteredGoals = () => {
    let filtered = groupGoals;
    
    // Apply status filter
    if (activeFilter !== 'all') {
      filtered = filtered.filter(goal => goal.status === activeFilter);
    }
    
    // Apply search
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(goal => 
        goal.title.toLowerCase().includes(query) || 
        goal.description.toLowerCase().includes(query)
      );
    }
    
    return filtered;
  };

  // Sort goals by date (newest first)
  const sortedGoals = getFilteredGoals().sort((a, b) => 
    new Date(b.created_at) - new Date(a.created_at)
  );

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-800">Group Goals</h2>
        <AddGoalButton onClick={handleAddGoal} />
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <input
            type="text"
            placeholder="Search group goals..."
            value={searchQuery}
            onChange={handleSearch}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent outline-none"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        
        {/* Status filter */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'all'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => handleFilterChange('active')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'active'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Active
          </button>
          <button
            onClick={() => handleFilterChange('completed')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'completed'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Completed
          </button>
          <button
            onClick={() => handleFilterChange('pending')}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
              activeFilter === 'pending'
                ? 'bg-[#4A2BAF] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Pending
          </button>
        </div>
      </div>
      
      {/* Goals list */}
      {sortedGoals.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-xl shadow-sm p-8 text-center"
        >
          <div className="w-16 h-16 bg-[#4A2BAF]/10 rounded-full mx-auto flex items-center justify-center mb-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-8 w-8 text-[#4A2BAF]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No group goals found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "No group goals match your search criteria."
              : activeFilter !== 'all'
              ? `You don't have any ${activeFilter} group goals yet.`
              : "You haven't created any group goals yet."}
          </p>
          <button
            onClick={handleAddGoal}
            className="px-4 py-2.5 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors inline-flex items-center gap-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Create Your First Group Goal
          </button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {sortedGoals.map(goal => (
            <GoalCard
              key={goal.goal_id}
              goal={goal}
              onView={onViewGoal}
              onEdit={handleEditGoal}
              onDelete={handleDeleteGoal}
            />
          ))}
        </div>
      )}
      
      {/* Group Goal Form Modal */}
      <GroupGoalFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmitGoal}
        goal={currentGoal}
      />
      
      {/* Confirm Delete Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <h3 className="text-lg font-bold mb-2">Delete Group Goal</h3>
            <p className="mb-4 text-gray-600">
              Are you sure you want to delete this group goal? This action cannot be undone.
            </p>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowConfirmDelete(null)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const goalToDelete = groupGoals.find(g => g.goal_id === showConfirmDelete);
                  if (goalToDelete) {
                    handleDeleteGoal(goalToDelete);
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupGoalsTab; 