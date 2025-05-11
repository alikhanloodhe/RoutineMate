import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { personal, group, shared } from '../components/goal';
import { getAllGoals } from '../utils/goalData';
import PageHeader from '../components/ui/PageHeader';

const GoalsPage = () => {
  const [activeType, setActiveType] = useState('personal');
  const [goals, setGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Toggle between personal and group goals
  const toggleGoalType = (type) => {
    setActiveType(type);
  };

  // Function to fetch goals data
  const fetchAllGoals = async () => {
    try {
      setIsLoading(true);
      // Fetch personal goals
      const personalGoalsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/goals/fetchGoals`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Fetch group goals (this will include goals where user is a member/collaborator)
      const groupGoalsRes = await fetch(`${import.meta.env.VITE_API_URL}/api/groupGoals/fetchGroupGoals`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (!personalGoalsRes.ok || !groupGoalsRes.ok) {
        throw new Error('Failed to fetch goals');
      }

      const personalGoalsData = await personalGoalsRes.json();
      const groupGoalsData = await groupGoalsRes.json();

      console.log('Personal goals:', personalGoalsData);
      console.log('Group goals:', groupGoalsData);

      // Combine both personal and group goals
      const allGoals = [
        ...(personalGoalsData.goals || []), 
        ...(groupGoalsData.goals || [])
      ];
      
      setGoals(allGoals);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load goals data on component mount
  useEffect(() => {
    fetchAllGoals();
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
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        <PageHeader 
          title="My Goals" 
          subtitle="Set, track, and achieve your personal and group goals"
        />
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
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
                  refreshGoals={fetchAllGoals}
                />
              ) : (
                <group.GroupGoalsTab 
                  goals={goals.filter(goal => goal.goal_type === 'group')}
                  onViewGoal={handleViewGoal}
                  refreshGoals={fetchAllGoals}
                />
              )}
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GoalsPage; 
