/**
 * Gemini AI Service - For analyzing user activity and generating optimized schedules
 * 
 * This service handles interactions with our backend API which uses Google's Gemini AI to:
 * 1. Analyze past user activities (routines, tasks, habits, goals)
 * 2. Generate personalized, optimized schedules
 * 3. Provide insights and recommendations
 * 
 * IMPLEMENTATION RECOMMENDATIONS:
 * - Schedule generation should happen in the backend to protect your API key
 * - Consider implementing a daily "smart morning brief" feature that suggests an optimized schedule at the start of day
 * - Add user feedback mechanism for schedule recommendations to improve future suggestions
 * - Cache generated schedules to reduce API calls but refresh when user adds new tasks/habits
 * - Implement a "snapshot" feature to track how the AI-optimized schedule evolves over time
 */

/**
 * Generate an optimized schedule using the backend AI service
 * which leverages Gemini AI
 * 
 * @param {string} refDate - Optional reference date (defaults to today)
 * @returns {Promise<Object>} AI-generated optimized schedule and insights
 */
export const generateOptimizedSchedule = async (refDate = null) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No authentication token found');
      throw new Error('You must be logged in to generate a schedule');
    }
    
    console.log('Requesting schedule generation for date:', refDate || 'today');
    
    // Make API request to our backend
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/generate-schedule`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ refDate })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error response from server:', errorData);
      throw new Error(errorData.message || errorData.error || 'Failed to generate optimized schedule');
    }
    
    const data = await response.json();
    console.log('Received schedule data from API:', data);
    
    if (!data.success || !data.data) {
      throw new Error('Received invalid response format from server');
    }
    
    // Validate schedule data to ensure it has the required format
    const schedule = data.data.schedule || [];
    const insights = data.data.insights || '';
    
    if (!Array.isArray(schedule)) {
      console.error('Invalid schedule format, expected array but got:', typeof schedule);
      throw new Error('Invalid schedule format returned from server');
    }
    
    if (schedule.length === 0) {
      console.warn('Received empty schedule from server - this might be normal if you have no tasks, habits, goals or routines');
    }
    
    // Add IDs to any items that don't have them
    const validatedSchedule = schedule.map((item, index) => {
      if (!item.id) {
        return { ...item, id: index + 1 };
      }
      return item;
    });
    
    return {
      schedule: validatedSchedule,
      insights: insights
    };
  } catch (error) {
    console.error('Error generating optimized schedule:', error);
    // Only use fallback data if we couldn't get a valid response from server
    return {
      schedule: [
        {
          id: 1,
          title: "Morning Focus Time",
          time: "08:00 AM",
          endTime: "09:30 AM",
          type: "suggested",
          interval: "08:00 AM - 09:30 AM",
          priority: 2,
          category: "Mental"
        },
        {
          id: 2,
          title: "Daily Exercise",
          time: "10:00 AM",
          endTime: "10:30 AM",
          type: "suggested",
          interval: "10:00 AM - 10:30 AM",
          priority: 2,
          category: "Physical"
        },
        {
          id: 3,
          title: "Lunch Break",
          time: "12:30 PM",
          endTime: "01:15 PM",
          type: "suggested",
          interval: "12:30 PM - 01:15 PM",
          priority: 3,
          category: "Physical"
        }
      ],
      insights: "Unable to generate a personalized schedule at this time. Please try again later or add more tasks, habits, routines or goals to your planner for better scheduling recommendations."
    };
  }
};

/**
 * Get explanations for specific schedule recommendations
 * 
 * @param {string} activityId - ID of the activity to explain
 * @param {string} activityType - Type of activity (routine, task, habit, goal)
 * @param {string} activityTitle - Title of the activity
 * @returns {Promise<string>} Detailed explanation
 */
export const getScheduleItemExplanation = async (activityId, activityType, activityTitle) => {
  try {
    const token = localStorage.getItem('token');
    
    if (!activityType || !activityTitle) {
      return "Unable to generate explanation without activity type and title.";
    }
    
    console.log(`Requesting explanation for ${activityType}: "${activityTitle}"`);
    
    // Make API request to our backend
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/explain-schedule-item`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ activityId, activityType, activityTitle })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || errorData.error || 'Failed to get explanation');
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data || !data.data.explanation) {
      throw new Error('Received invalid explanation format from server');
    }
    
    return data.data.explanation;
  } catch (error) {
    console.error('Error getting schedule item explanation:', error);
    
    // Generate a more specific fallback explanation based on activity type
    if (activityType === 'suggested') {
      return `This suggested activity "${activityTitle}" has been added to create a balanced daily schedule. It's based on productivity best practices and helps maintain a healthy rhythm throughout your day.`;
    } else if (activityType === 'habit') {
      return `Regular habits like "${activityTitle}" are important to maintain consistency and build positive routines. This habit has been scheduled at an optimal time based on your other activities.`;
    } else if (activityType === 'goal') {
      return `Working on "${activityTitle}" helps you make progress toward your important goals. This activity has been scheduled to ensure you're making consistent progress toward your milestones.`;
    } else {
      return `This ${activityType} fits into your schedule based on your productivity patterns, priorities, and time management best practices.`;
    }
  }
};

/**
 * Generate a morning brief with optimized schedule and day summary
 * 
 * @returns {Promise<Object>} Morning brief with optimized schedule and day summary
 */
export const generateMorningBrief = async () => {
  try {
    // Use the regular schedule generation
    const scheduleData = await generateOptimizedSchedule();
    
    // Extract a summary from the insights if available
    let summary = "Your day ahead looks productive!";
    let motivation = "Keep up the good work with your habits and routines!";
    
    if (scheduleData.insights && scheduleData.insights.length > 0) {
      // Try to extract a shorter summary from the insights
      const sentences = scheduleData.insights.split(/[.!?]+/);
      if (sentences.length > 0) {
        summary = sentences[0].trim() + '.';
        
        // Try to find a motivational statement
        const motivationalSentence = sentences.find(s => 
          s.toLowerCase().includes('keep') || 
          s.toLowerCase().includes('great') || 
          s.toLowerCase().includes('excellent') ||
          s.toLowerCase().includes('good job') ||
          s.toLowerCase().includes('progress')
        );
        
        if (motivationalSentence) {
          motivation = motivationalSentence.trim() + '!';
        }
      }
    }
    
    // Check if we have any real activities vs just suggested ones
    const hasRealActivities = scheduleData.schedule.some(item => item.type !== 'suggested');
    
    return {
      schedule: scheduleData.schedule,
      daySummary: summary,
      motivationalMessage: motivation,
      fullInsights: scheduleData.insights,
      hasRealActivities: hasRealActivities
    };
  } catch (error) {
    console.error('Error generating morning brief:', error);
    return {
      schedule: [],
      daySummary: "We're preparing your day...",
      motivationalMessage: "Every productive day starts with a plan!",
      fullInsights: "",
      hasRealActivities: false
    };
  }
};

export default {
  generateOptimizedSchedule,
  getScheduleItemExplanation,
  generateMorningBrief
}; 