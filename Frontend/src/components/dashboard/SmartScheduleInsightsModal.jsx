import React from 'react';
import { FiX, FiClock, FiCalendar, FiArrowUp, FiTrendingUp, FiCheckCircle, FiAward, FiCheck, FiCpu, FiInfo, FiAlertTriangle } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const SmartScheduleInsightsModal = ({ isOpen, onClose, insights, schedule }) => {
  if (!isOpen) return null;
  
  // Parse insights from the AI response
  const parseInsights = (insightsText) => {
    if (!insightsText || (Array.isArray(insightsText) && insightsText.length === 0) || 
        (typeof insightsText === 'string' && insightsText.trim() === '')) {
      return {
        explanation: hasOnlySuggestions 
          ? "We've created a suggested schedule since you don't have many activities yet. Add more tasks, habits, routines, or goals for a more personalized schedule."
          : "Your schedule has been optimized based on your productivity patterns and priorities.",
        sections: []
      };
    }
    
    // If insights is already an array, create a simple structure
    if (Array.isArray(insightsText)) {
      return {
        explanation: insightsText[0] || "Your schedule has been optimized for productivity.",
        sections: [{
          title: "Key Insights",
          points: insightsText.slice(1)
        }]
      };
    }
    
    // Split text into paragraphs
    const paragraphs = insightsText.split(/\n\n|\r\n\r\n/).filter(p => p.trim() !== '');
    
    if (paragraphs.length === 0) {
      return {
        explanation: insightsText,
        sections: []
      };
    }
    
    // First paragraph typically contains the general explanation
    const explanation = paragraphs[0];
    
    // Try to identify different sections in the insights
    const sections = [];
    let currentSection = { title: 'Analysis', points: [] };
    
    for (let i = 1; i < paragraphs.length; i++) {
      const paragraph = paragraphs[i].trim();
      
      // Check if paragraph is a section header
      if (paragraph.length < 60 && (paragraph.endsWith(':') || paragraph.toUpperCase() === paragraph)) {
        // Save previous section if it has points
        if (currentSection.points.length > 0) {
          sections.push(currentSection);
        }
        // Start new section
        currentSection = {
          title: paragraph.replace(':', ''),
          points: []
        };
      } else {
        // Split paragraph into bullet points if possible
        if (paragraph.includes('\n- ')) {
          const bulletPoints = paragraph.split('\n- ').filter(p => p.trim() !== '');
          currentSection.points.push(...bulletPoints.map(p => p.trim().replace(/^- /, '')));
        } else if (paragraph.includes('• ')) {
          const bulletPoints = paragraph.split('• ').filter(p => p.trim() !== '');
          currentSection.points.push(...bulletPoints.map(p => p.trim()));
        } else if (paragraph.includes('. ')) {
          // If no bullet points but there are sentences, use them as points
          const sentences = paragraph.split(/[.!?]+\s+/).filter(s => s.trim() !== '');
          currentSection.points.push(...sentences.map(s => s.trim() + '.'));
        } else {
          // Otherwise just add the whole paragraph as a point
          currentSection.points.push(paragraph);
        }
      }
    }
    
    // Add the last section if it has points
    if (currentSection.points.length > 0) {
      sections.push(currentSection);
    }
    
    return {
      explanation,
      sections
    };
  };
  
  // Get schedule statistics
  const activityTypeCount = {
    routine: schedule?.filter(item => item.type === 'routine')?.length || 0,
    task: schedule?.filter(item => item.type === 'task')?.length || 0,
    habit: schedule?.filter(item => item.type === 'habit')?.length || 0,
    goal: schedule?.filter(item => item.type === 'goal')?.length || 0,
    suggested: schedule?.filter(item => item.type === 'suggested')?.length || 0
  };
  
  const realActivityCount = schedule ? schedule.length - activityTypeCount.suggested : 0;
  const hasOnlySuggestions = realActivityCount === 0 && activityTypeCount.suggested > 0;
  
  const insightData = parseInsights(insights);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col"
        >
          <div className="p-6 border-b flex justify-between items-center bg-gradient-to-r from-[#4A2BAF]/10 to-purple-50">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">AI Schedule Insights</h2>
              <p className="text-gray-600 mt-1">
                {schedule?.length === 0 ? "No scheduled activities" : `${schedule?.length || 0} activities optimized for your day`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/50 transition-colors"
            >
              <FiX className="h-6 w-6 text-gray-600" />
            </button>
          </div>
          
          <div className="overflow-y-auto p-6 flex-grow">
            {/* AI Badge */}
            <div className="mb-4">
              <div className="inline-flex items-center px-3 py-2 rounded-full bg-gradient-to-r from-[#4A2BAF]/20 to-purple-200 text-sm text-[#4A2BAF]">
                <FiCpu className="mr-2" />
                Generated by Gemini AI
              </div>
            </div>
            
            {/* AI suggestions warning */}
            {hasOnlySuggestions && (
              <div className="mb-5 bg-blue-50 border border-blue-200 rounded-md p-3 flex items-start">
                <FiAlertTriangle className="text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                <div>
                  <p className="text-blue-700 text-sm font-medium">AI-Suggested Schedule</p>
                  <p className="text-blue-600 text-xs mt-1">
                    We've created a suggested schedule since you don't have many activities yet. 
                    Add more tasks, habits, routines, or goals to get a personalized schedule based on your real data.
                  </p>
                </div>
              </div>
            )}
            
            {/* Schedule summary */}
            <div className="mb-6 bg-gray-50 rounded-md p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Schedule Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-lg font-bold text-[#4A2BAF]">{schedule?.length || 0}</div>
                  <div className="text-xs text-gray-500">Total Activities</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-lg font-bold text-blue-600">{activityTypeCount.routine}</div>
                  <div className="text-xs text-gray-500">Routines</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-lg font-bold text-purple-600">{activityTypeCount.task}</div>
                  <div className="text-xs text-gray-500">Tasks</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-lg font-bold text-green-600">{activityTypeCount.habit}</div>
                  <div className="text-xs text-gray-500">Habits</div>
                </div>
                <div className="bg-white p-2 rounded border text-center">
                  <div className="text-lg font-bold text-orange-600">{activityTypeCount.goal}</div>
                  <div className="text-xs text-gray-500">Goals</div>
                </div>
                {activityTypeCount.suggested > 0 && (
                  <div className="bg-white p-2 rounded border text-center col-span-2 md:col-span-5">
                    <div className="text-sm text-gray-600">
                      <span className="font-semibold">{activityTypeCount.suggested}</span> of these activities are AI-suggested
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Explanation Section */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-[#4A2BAF] mb-3 flex items-center">
                <FiTrendingUp className="mr-2" /> 
                Schedule Overview
              </h3>
              <div className="bg-[#4A2BAF]/5 p-4 rounded-lg border-l-4 border-[#4A2BAF]">
                <p className="text-gray-800">{insightData.explanation}</p>
              </div>
            </div>
            
            {/* Dynamic Sections based on AI output */}
            {insightData.sections.map((section, idx) => (
              <div key={idx} className="mb-8">
                <h3 className="text-lg font-semibold text-[#4A2BAF] mb-3 flex items-center">
                  {idx % 2 === 0 ? <FiCheckCircle className="mr-2" /> : <FiAward className="mr-2" />}
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.points.map((point, pointIdx) => (
                    <motion.li 
                      key={pointIdx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: pointIdx * 0.1 }}
                      className={`flex items-start p-3 ${idx % 2 === 0 ? 'bg-green-50' : 'bg-blue-50'} rounded-lg`}
                    >
                      <div className={`${idx % 2 === 0 ? 'bg-green-100' : 'bg-blue-100'} p-2 rounded-full mr-3`}>
                        {idx % 2 === 0 ? 
                          <FiCheckCircle className={`${idx % 2 === 0 ? 'text-green-600' : 'text-blue-600'}`} /> :
                          <FiTrendingUp className={`${idx % 2 === 0 ? 'text-green-600' : 'text-blue-600'}`} />
                        }
                      </div>
                      <span className="text-gray-800">{point}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>
            ))}
            
            {/* Recommendations section for AI-suggested activities */}
            {hasOnlySuggestions && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-[#4A2BAF] mb-3 flex items-center">
                  <FiInfo className="mr-2" /> 
                  Getting Started Recommendations
                </h3>
                <ul className="space-y-2">
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex items-start p-3 bg-amber-50 rounded-lg"
                  >
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <FiCheckCircle className="text-amber-600" />
                    </div>
                    <span className="text-gray-800">Add daily habits like morning exercise, reading, or meditation to build a productive routine.</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="flex items-start p-3 bg-amber-50 rounded-lg"
                  >
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <FiCheckCircle className="text-amber-600" />
                    </div>
                    <span className="text-gray-800">Create task lists with deadlines and priorities to help the AI build a more optimized schedule.</span>
                  </motion.li>
                  <motion.li 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-start p-3 bg-amber-50 rounded-lg"
                  >
                    <div className="bg-amber-100 p-2 rounded-full mr-3">
                      <FiCheckCircle className="text-amber-600" />
                    </div>
                    <span className="text-gray-800">Set up regular routines for working hours, meal times, and breaks to maintain consistency.</span>
                  </motion.li>
                </ul>
              </div>
            )}
            
            {/* No insights fallback */}
            {insightData.sections.length === 0 && insightData.explanation.trim() === '' && !hasOnlySuggestions && (
              <div className="text-center py-6">
                <div className="bg-gray-100 rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4">
                  <FiInfo className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-700 mb-2">No detailed insights available</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  Try generating a new schedule to get personalized insights about your productivity patterns.
                </p>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t bg-gray-50 rounded-b-xl">
            <div className="flex justify-end items-center">
              <motion.button
                onClick={onClose}
                className="px-4 py-2 bg-[#4A2BAF] hover:bg-[#3A1C9F] text-white rounded-md transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Close
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SmartScheduleInsightsModal;