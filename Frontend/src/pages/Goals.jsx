import React, { useState, useEffect } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { personal, group, shared } from '../components/goal';
import { getAllGoals, addGoal, updateGoal, deleteGoal } from '../utils/goalData';

const Goals = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeType, setActiveType] = useState('personal');
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showPersonalFormModal, setShowPersonalFormModal] = useState(false);
  const [showGroupFormModal, setShowGroupFormModal] = useState(false);
  const [currentGoal, setCurrentGoal] = useState(null);
  const navigate = useNavigate();

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Toggle between personal and group goals
  const toggleGoalType = (type) => {
    setActiveType(type);
  };

  // Load goals data
  useEffect(() => {
    setIsLoading(true);
    
    // Simulating API call delay
    setTimeout(() => {
      const allGoals = getAllGoals();
      setGoals(allGoals);
      setIsLoading(false);
    }, 500);
  }, []);

  // View goal details
  const handleViewGoal = (goal) => {
    if (goal.goal_type === 'personal') {
      // Navigate to personal goal detail page
      navigate(`/goals/${goal.goal_id}`);
    } else {
      // Navigate to group goal detail page
      navigate(`/group-goals/${goal.goal_id}`);
    }
  };

  // Edit goal
  const handleEditGoal = (goal) => {
    setCurrentGoal(goal);
    if (goal.goal_type === 'personal') {
      setShowPersonalFormModal(true);
    } else {
      setShowGroupFormModal(true);
    }
  };

  // Delete goal
  const handleDeleteGoal = (goal) => {
    console.log('Delete goal:', goal);
    // Delete from central data
    const deletedGoal = deleteGoal(goal.goal_id);
    
    if (deletedGoal) {
      // Update local state
      setGoals(prev => prev.filter(g => g.goal_id !== goal.goal_id));
    }
  };

  // Add new goal based on active type
  const handleAddGoal = () => {
    setCurrentGoal(null);
    if (activeType === 'personal') {
      setShowPersonalFormModal(true);
    } else {
      setShowGroupFormModal(true);
    }
  };

  // Handle personal goal form submission
  // here fetch api to creat personal goal
  const handleSubmitPersonalGoal = async (goalData) => {
    if (goalData.goal_id) {
      // Update existing goal
      const updatedGoal = updateGoal(goalData.goal_id, goalData);
      
      if (updatedGoal) {
        setGoals(prev => prev.map(goal => 
          goal.goal_id === updatedGoal.goal_id ? updatedGoal : goal
        ));
      }
    } else {
      // Add new goal with personal type
      const newGoal = addGoal({
        ...goalData,
        goal_type: 'personal'
      });
      

      
      setGoals(prev => [...prev, newGoal]);
    }
    
    setShowPersonalFormModal(false);
  };

  // Handle group goal form submission
  const handleSubmitGroupGoal = (goalData) => {
    if (goalData.goal_id) {
      // Update existing goal
      const updatedGoal = updateGoal(goalData.goal_id, goalData);
      
      if (updatedGoal) {
        setGoals(prev => prev.map(goal => 
          goal.goal_id === updatedGoal.goal_id ? updatedGoal : goal
        ));
      }
    } else {
      // Add new goal with group type
      const newGoal = addGoal({
        ...goalData,
        goal_type: 'group'
      });
      
      setGoals(prev => [...prev, newGoal]);
    }
    
    setShowGroupFormModal(false);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      <div className="flex h-[calc(100vh-60px)]">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-[#1C1C1C]">My Goals</h1>
              <shared.AddGoalButton onClick={handleAddGoal} />
            </div>

            <shared.GoalTypeToggle 
              activeType={activeType} 
              onToggle={toggleGoalType} 
            />

            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A2BAF]"></div>
              </div>
            ) : (
              <>
                {activeType === 'personal' ? (
                  <personal.PersonalGoalsTab 
                    goals={goals}
                    onViewGoal={handleViewGoal}
                    onEditGoal={handleEditGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onAddGoal={handleAddGoal}
                  />
                ) : (
                  <group.GroupGoalsTab 
                    goals={goals}
                    onViewGoal={handleViewGoal}
                    onEditGoal={handleEditGoal}
                    onDeleteGoal={handleDeleteGoal}
                    onAddGoal={handleAddGoal} 
                  />
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>

      {/* Personal Goal Form Modal */}
      <personal.PersonalGoalFormModal
        isOpen={showPersonalFormModal}
        onClose={() => setShowPersonalFormModal(false)}
        onSubmit={handleSubmitPersonalGoal}
        goal={currentGoal?.goal_type === 'personal' ? currentGoal : null}
      />

      {/* Group Goal Form Modal */}
      <group.GroupGoalFormModal
        isOpen={showGroupFormModal}
        onClose={() => setShowGroupFormModal(false)}
        onSubmit={handleSubmitGroupGoal}
        goal={currentGoal?.goal_type === 'group' ? currentGoal : null}
      />
    </div>
  );
};

export default Goals; 