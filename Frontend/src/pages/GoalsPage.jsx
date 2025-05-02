import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { personal, group, shared } from '../components/goal';
import { getAllGoals } from '../utils/goalData';

const GoalsPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeType, setActiveType] = useState('personal');
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
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
                    goals={goals.filter(goal => goal.goal_type === 'personal')}
                    onViewGoal={handleViewGoal}
                  />
                ) : (
                  <group.GroupGoalsTab 
                    goals={goals.filter(goal => goal.goal_type === 'group')}
                    onViewGoal={handleViewGoal}
                  />
                )}
              </>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage; 