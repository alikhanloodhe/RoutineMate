import React, { useState, useEffect } from 'react';
import { FiClock, FiRefreshCw, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import geminiService from '../../services/geminiService';
import FullScheduleModal from './FullScheduleModal';
import SmartScheduleInsightsModal from './SmartScheduleInsightsModal';

const SmartSchedule = () => {
  const [schedule, setSchedule] = useState([]);
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0); // Used to force re-render
  const [hasOnlyAISuggestions, setHasOnlyAISuggestions] = useState(false);
  
  // Generate new schedule on component mount
  useEffect(() => {
    generateSchedule();
  }, [refreshKey]);
  
  // Function to fetch a new AI-generated schedule
  const generateSchedule = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Call the Gemini service to generate an optimized schedule
      const result = await geminiService.generateOptimizedSchedule();
      
      setSchedule(result.schedule);
      setInsights(result.insights);
      
      // Check if we only have suggested activities and no real user data
      const onlySuggestions = result.schedule.length > 0 && 
        result.schedule.every(item => item.type === 'suggested');
      setHasOnlyAISuggestions(onlySuggestions);
      
    } catch (error) {
      console.error('Error generating smart schedule:', error);
      setError('Failed to generate your optimized schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  // Refresh the schedule
  const handleRefresh = () => {
    setRefreshKey(prevKey => prevKey + 1);
  };
  
  // Get appropriate tag color based on priority
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 1: return "bg-red-100 text-red-800";
      case 2: return "bg-orange-100 text-orange-800";
      case 3: return "bg-blue-100 text-blue-800";
      case 4: return "bg-green-100 text-green-800";
      case 5: return "bg-gray-100 text-gray-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Get color for category tag
  const getCategoryColor = (category) => {
    if (!category) return "bg-gray-100 text-gray-700";
    
    const lowerCaseCategory = category.toLowerCase();
    
    if (lowerCaseCategory.includes('physical')) 
      return "bg-emerald-100 text-emerald-800";
    if (lowerCaseCategory.includes('mental')) 
      return "bg-indigo-100 text-indigo-800";
    if (lowerCaseCategory.includes('social')) 
      return "bg-amber-100 text-amber-800";
    if (lowerCaseCategory.includes('spiritual')) 
      return "bg-purple-100 text-purple-800";
    
    return "bg-gray-100 text-gray-700";
  };

  // Get style for activity type
  const getActivityTypeStyle = (type) => {
    switch(type) {
      case 'routine': return "bg-[#4A2BAF]/10 text-[#4A2BAF]";
      case 'task': return "bg-purple-100 text-purple-800";
      case 'habit': return "bg-green-100 text-green-800";
      case 'goal': return "bg-orange-100 text-orange-800";
      case 'suggested': return "bg-gray-100 text-gray-600 italic";
      default: return "bg-[#4A2BAF]/10 text-[#4A2BAF]";
    }
  };

  return (
    <>
      <motion.div 
        className="bg-white p-6 rounded-xl shadow-sm h-auto"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        whileHover={{ 
          y: -5,
          boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
          transition: { duration: 0.2 }
        }}
      >
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-lg font-medium text-[#1C1C1C] flex items-center">
              <span>Smart Schedule</span>
              <div className="ml-2 px-2 py-0.5 bg-[#4A2BAF]/10 text-xs text-[#4A2BAF] rounded-full">AI-Powered</div>
            </h2>
            <p className="text-sm text-gray-500 mt-1">Your optimized schedule for maximum productivity</p>
          </div>
          <div className="p-3 bg-[#4A2BAF]/10 rounded-xl">
            <FiClock className="h-6 w-6 text-[#4A2BAF]" />
          </div>
        </div>
        
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-[#4A2BAF] rounded-full"></div>
            <span className="ml-3 text-gray-600">Generating your optimized schedule...</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <p className="text-red-700 text-sm">{error}</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-sm text-red-700 font-medium flex items-center hover:text-red-800"
            >
              <FiRefreshCw className="mr-1" /> Try Again
            </button>
          </div>
        ) : schedule.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-4">
            <p className="text-amber-700 text-sm">No activities found for your schedule. Try adding some tasks, routines or habits.</p>
            <button 
              onClick={handleRefresh}
              className="mt-2 text-sm text-amber-700 font-medium flex items-center hover:text-amber-800"
            >
              <FiRefreshCw className="mr-1" /> Regenerate
            </button>
          </div>
        ) : (
          <>
            {hasOnlyAISuggestions && (
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4 flex items-start">
                <FiAlertTriangle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-blue-700 text-xs">We've created a suggested schedule since you don't have many activities yet. Add tasks, habits, routines or goals for a more personalized schedule.</p>
                </div>
              </div>
            )}
            
            <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2 mb-4 no-scrollbar">
              {schedule.map((item) => (
                <motion.div 
                  key={item.id} 
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                  className={`flex items-center border-l-4 ${item.type === 'suggested' ? 'border-gray-300' : 'border-[#4A2BAF]/70'} pl-3 py-2 bg-gray-50 rounded-r-lg`}
                >
                  <div className="flex-1">
                    <div className="flex items-center flex-wrap gap-1">
                      <p className={`text-sm font-medium text-gray-800 ${item.type === 'suggested' ? 'italic' : ''}`}>
                        {item.title}
                        {item.type === 'suggested' && <span className="ml-1 text-xs text-gray-500">(AI suggested)</span>}
                      </p>
                      <div className={`text-xs px-2 py-0.5 rounded-full ${getPriorityColor(item.priority)}`}>
                        P{item.priority}
                      </div>
                      {item.category && (
                        <div className={`text-xs px-2 py-0.5 rounded-full ${getCategoryColor(item.category)}`}>
                          {item.category}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">{item.interval}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-md text-xs ${getActivityTypeStyle(item.type)}`}>
                    {item.type}
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="flex items-center justify-between mt-2 pt-2 border-t">
              <motion.button 
                onClick={handleRefresh}
                className="text-sm flex items-center text-gray-600 hover:text-[#4A2BAF]"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <FiRefreshCw className="mr-1.5 h-4 w-4" />
                Regenerate
              </motion.button>
              
              <div className="flex space-x-4">
                <motion.button 
                  onClick={() => setShowInsights(true)}
                  className="text-sm font-medium text-[#4A2BAF] hover:text-[#5D4EFF] flex items-center"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiInfo className="mr-1.5 h-4 w-4" />
                  View Insights
                </motion.button>
                
                <motion.button 
                  onClick={() => setShowFullSchedule(true)}
                  className="text-sm font-medium text-[#4A2BAF] hover:text-[#5D4EFF] flex items-center"
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.2 }}
                >
                  <FiClock className="mr-1.5 h-4 w-4" />
                  Full Schedule
                </motion.button>
              </div>
            </div>
          </>
        )}
      </motion.div>
      
      {/* Modals */}
      <FullScheduleModal 
        isOpen={showFullSchedule} 
        onClose={() => setShowFullSchedule(false)} 
        schedule={schedule} 
        hasOnlySuggestions={hasOnlyAISuggestions}
      />
      
      <SmartScheduleInsightsModal
        isOpen={showInsights}
        onClose={() => setShowInsights(false)}
        schedule={schedule}
        insights={insights}
        hasOnlySuggestions={hasOnlyAISuggestions}
      />
    </>
  );
};

export default SmartSchedule;