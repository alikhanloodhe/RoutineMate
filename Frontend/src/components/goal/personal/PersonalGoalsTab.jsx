import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GoalCard from '../shared/GoalCard';
import AddGoalButton from '../shared/AddGoalButton';
import GoalFormModal from './PersonalGoalFormModal';
import { addGoal, updateGoal, deleteGoal } from '../../../utils/goalData';

const PersonalGoalsTab = ({ goals, onViewGoal }) => {
  const [showFormModal, setShowFormModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const [filteredGoals, setFilteredGoals] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Filter personal goals
  const personalGoals = goals.filter(goal => goal.goal_type === 'personal');

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
  const handleDeleteGoal = (goal) => {
    // Delete from central data
    const deletedGoal = deleteGoal(goal.goal_id);
    
    if (deletedGoal) {
      // You would typically need to update the parent component's state
      // This is handled by the parent component's state management
      // But we could emit an event to the parent if needed
    }
  };

  // Handle goal form submission
  const handleSubmitGoal = (goalData) => {
    if (goalData.goal_id) {
      // Update existing goal
      updateGoal(goalData.goal_id, goalData);
    } else {
      // Add new goal with personal type
      addGoal({
        ...goalData,
        goal_type: 'personal'
      });
    }
    
    setShowFormModal(false);
  };

  // Filter goals based on status
  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  // Search goals
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  // Apply filters and search
  const getFilteredGoals = () => {
    let filtered = personalGoals;
    
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
        <h2 className="text-xl font-semibold text-gray-800">Personal Goals</h2>
        <AddGoalButton onClick={handleAddGoal} />
      </div>
      
      <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
        {/* Search input */}
        <div className="relative w-full md:w-auto md:min-w-[300px]">
          <input
            type="text"
            placeholder="Search goals..."
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
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-gray-800 mb-2">No goals found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery
              ? "No goals match your search criteria."
              : activeFilter !== 'all'
              ? `You don't have any ${activeFilter} goals yet.`
              : "You haven't created any personal goals yet."}
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
            Create Your First Goal
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
      
      {/* Goal Form Modal */}
      <GoalFormModal
        isOpen={showFormModal}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmitGoal}
        goal={currentGoal}
      />
    </div>
  );
};

export default PersonalGoalsTab; 