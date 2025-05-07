import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageHeader from '../components/ui/PageHeader';

const GoalTracking = () => {
  const navigate = useNavigate();
  const { goalId } = useParams();
  const [goal, setGoal] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: []
  });

  const fetchGoalData = async () => {
    // Existing fetch logic
  };

  useEffect(() => {
    fetchGoalData();
  }, [goalId]);

  // Mock chart data generation
  useEffect(() => {
    if (goal) {
      generateChartData(selectedPeriod);
    }
  }, [goal, selectedPeriod]);

  const generateChartData = (period) => {
    // Existing chart data logic
  };

  if (isLoading) {
    return (
      <div className="bg-gray-50">
        <div className="px-6 py-6 flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#4A2BAF]"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50">
        <div className="px-6 py-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Error loading goal tracking</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => navigate('/goals')}
            className="bg-[#4A2BAF] text-white px-4 py-2 rounded-lg hover:bg-[#3D2291] transition-colors"
          >
            Back to Goals
          </button>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="bg-gray-50">
        <div className="px-6 py-6 flex flex-col items-center justify-center">
          <h2 className="text-xl font-bold text-gray-700 mb-4">Goal not found</h2>
          <button
            onClick={() => navigate('/goals')}
            className="bg-[#4A2BAF] text-white px-4 py-2 rounded-lg hover:bg-[#3D2291] transition-colors"
          >
            Back to Goals
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        <PageHeader 
          title="Goal Progress Tracking" 
          description={`Track your progress for "${goal.title}"`}
        />

        {/* Back button */}
        <button
          onClick={() => navigate(`/goals/${goalId}`)}
          className="flex items-center text-gray-600 hover:text-[#4A2BAF] mb-6 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Goal Details
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Goal Overview Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            {/* Goal info and current progress */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-6">
              <div>
                <h1 className="text-2xl font-bold text-gray-800">{goal.title}</h1>
                <p className="text-gray-600 mt-1">{goal.description}</p>
                <div className="flex items-center mt-2">
                  <span className="text-sm text-gray-500 mr-3">
                    {new Date(goal.start_date).toLocaleDateString()} - {new Date(goal.end_date).toLocaleDateString()}
                  </span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    goal.status === 'completed' ? 'bg-green-100 text-green-800' :
                    goal.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {goal.status.replace('_', ' ').charAt(0).toUpperCase() + goal.status.replace('_', ' ').slice(1)}
                  </span>
                </div>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => navigate(`/goals/${goalId}/edit`)}
                  className="px-4 py-2 border border-[#4A2BAF] text-[#4A2BAF] rounded-lg hover:bg-[#4A2BAF]/5 transition-colors"
                >
                  Edit Goal
                </button>
                <button
                  onClick={() => navigate(`/goals/${goalId}`)}
                  className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors"
                >
                  View Details
                </button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-700">Overall Progress</span>
                <span className="text-sm font-medium text-gray-700">{goal.progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] h-2.5 rounded-full" style={{ width: `${goal.progress}%` }}></div>
              </div>
            </div>

            {/* Stats summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Time Remaining</p>
                <p className="text-2xl font-bold text-gray-800">14 days</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Completed Milestones</p>
                <p className="text-2xl font-bold text-gray-800">3 of 8</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-500 text-sm">Current Streak</p>
                <p className="text-2xl font-bold text-gray-800">5 days</p>
              </div>
            </div>
          </div>

          {/* Period Selector */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-800">Progress Over Time</h2>
              <div className="flex bg-gray-100 rounded-lg">
                <button
                  onClick={() => setSelectedPeriod('weekly')}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    selectedPeriod === 'weekly' 
                      ? 'bg-[#4A2BAF] text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Weekly
                </button>
                <button
                  onClick={() => setSelectedPeriod('monthly')}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    selectedPeriod === 'monthly' 
                      ? 'bg-[#4A2BAF] text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setSelectedPeriod('overall')}
                  className={`px-4 py-2 text-sm rounded-lg ${
                    selectedPeriod === 'overall' 
                      ? 'bg-[#4A2BAF] text-white' 
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  Overall
                </button>
              </div>
            </div>

            {/* Progress Chart */}
            <div className="w-full h-80 flex items-center justify-center bg-gray-50 rounded-lg">
              {/* This would be the chart component in a real implementation */}
              <div className="text-center p-6">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-gray-500">Interactive chart showing your progress over time would appear here.</p>
                <p className="text-sm text-gray-400 mt-2">Current view: {selectedPeriod}</p>
              </div>
            </div>
          </div>

          {/* Activity Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">Activity Breakdown</h2>
            
            <div className="space-y-4">
              {/* Activity items */}
              <div className="flex items-start p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 bg-green-100 p-2 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">Completed milestone: Research competitors</h3>
                    <span className="text-sm text-gray-500">2 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">You completed the milestone ahead of schedule.</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 bg-blue-100 p-2 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">Updated goal progress</h3>
                    <span className="text-sm text-gray-500">5 days ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">You recorded 2 hours of focused work on this goal.</p>
                </div>
              </div>
              
              <div className="flex items-start p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0 bg-purple-100 p-2 rounded-lg mr-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <h3 className="font-medium text-gray-800">Modified goal timeline</h3>
                    <span className="text-sm text-gray-500">1 week ago</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">You extended the deadline by 5 days to account for additional scope.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Additional tracking metrics could be added here */}
        </motion.div>
      </div>
    </div>
  );
};

export default GoalTracking; 