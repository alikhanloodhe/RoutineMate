import pool from '../config/db.js';
import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Helper function to get weekly productivity data using the PostgreSQL function
 */
async function getWeeklyProductivityData(userId, refDate) {
  try {
    const result = await pool.query(
      'SELECT get_weekly_productivity_data($1, $2) as data',
      [userId, refDate]
    );
    
    const data = result.rows[0].data;
    console.log('Raw data from database:', JSON.stringify(data, null, 2));
    
    // Convert null arrays to empty arrays to avoid issues with JSON parsing
    const formattedData = {
      routines: Array.isArray(data.routines) ? data.routines : [],
      tasks: Array.isArray(data.tasks) ? data.tasks : [],
      habits: Array.isArray(data.habits) ? data.habits : [],
      goals: Array.isArray(data.goals) ? data.goals : []
    };
    
    console.log('Formatted data for Gemini:', JSON.stringify(formattedData, null, 2));
    
    return formattedData;
  } catch (error) {
    console.error('Error fetching weekly productivity data:', error);
    throw new Error('Failed to fetch productivity data from database');
  }
}

/**
 * Generate an optimized schedule using Google's Gemini API
 */
export const generateSmartSchedule = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`Generating schedule for user ID: ${userId}`);
    const { refDate } = req.body;
    
    // Default to today if no reference date is provided
    const todayDate = refDate || new Date().toISOString().split('T')[0];
    console.log(`Reference date: ${todayDate}`);
    
    // Step 1: Fetch weekly productivity data using the PostgreSQL function
    const weeklyData = await getWeeklyProductivityData(userId, todayDate);
    
    // Log data counts for debugging
    console.log(`Found ${weeklyData.routines.length} routines, ${weeklyData.tasks.length} tasks, ` +
                `${weeklyData.habits.length} habits, and ${weeklyData.goals.length} goals`);
    
    // Step 2: Prepare the prompt for Gemini API with better error handling for sparse data
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `You are an expert time management and productivity AI assistant for a productivity app called RoutineMate. Your task is to create a personalized, optimized daily schedule for today (${todayDate}) based on the user's data.

IMPORTANT: This user has ${weeklyData.habits.length} habits, ${weeklyData.goals.length} goals, ${weeklyData.tasks.length} tasks, and ${weeklyData.routines.length} routines. Work with whatever data is available, even if some categories are empty or missing.

HANDLING SPARSE DATA:
- If routines or tasks are missing/empty, create "suggested" activities to fill in the schedule.
- Even with limited data, create a complete and balanced daily schedule.
- Use habit categories and goal information to suggest complementary activities.

IMPORTANT RULES FOR SCHEDULE CREATION:
1. Analyze the provided user data carefully for routines, tasks, habits, and goals.
2. For habits with "daily" frequency, schedule them at their reminder_time if available.
3. For habits with "weekly" frequency, distribute them through the week focusing on today.
4. Schedule goal milestones with upcoming due dates (prioritize those closest to due date).
5. Allow 15-30 minute breaks between intensive activities.
6. Ensure a balanced life by distributing activities across categories (Physical, Mental, Social, Spiritual).
7. Create a reasonable schedule even if limited data is available - add suggested breaks, focus time, or meals if needed.

TIME BLOCK ALLOCATION STRATEGY:
- Morning: Prioritize physical activities and high-focus tasks
- Midday: Mix of medium-priority tasks and important routines
- Afternoon: Creative and collaborative work
- Evening: Lower priority items, relaxation, and preparation for tomorrow

USER DATA:
${JSON.stringify(weeklyData, null, 2)}

OUTPUT FORMAT:
Return a JSON array of time blocks as the main output. Each time block MUST include:
1. "id": numeric ID for each block (starting at 1)
2. "title": clear descriptive title
3. "time": start time (format: "HH:MM AM/PM")
4. "endTime": end time (format: "HH:MM AM/PM")
5. "type": one of: "routine", "task", "habit", "goal", or "suggested" (for items you recommend)
6. "interval": formatted time string (e.g., "07:30 AM - 08:30 AM")
7. "priority": numeric value 1-5 (1 = highest priority, 5 = lowest)
8. "category": which life category this belongs to

IMPORTANT: If the user has very limited data, create a balanced schedule by adding suggested activities like "Morning Exercise", "Lunch Break", "Focus Time", etc. marked with type "suggested".

AFTER THE JSON ARRAY, also include a brief paragraph with key insights and personalized productivity recommendations based on patterns you observed in the user's data.

Always structure your response EXACTLY like this example:
[
  {
    "id": 1,
    "title": "Morning Workout",
    "time": "07:30 AM",
    "endTime": "08:30 AM",
    "type": "habit",
    "interval": "07:30 AM - 08:30 AM",
    "priority": 2,
    "category": "Physical"
  },
  ...more items...
]

Your schedule is optimized to prioritize high-value tasks while maintaining work-life balance. Consider dedicating more time to your creative projects in the morning when your energy is highest.`
            }
          ]
        }
      ]
    };
    
    // Step 3: Call the Gemini API
    try {
      console.log('Calling Gemini API...');
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        prompt,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      console.log('Received response from Gemini API');
      
      // Step 4: Process and extract the schedule and insights
      const aiResponse = response.data.candidates[0].content.parts[0].text;
      
      // Parse the JSON schedule from the text response
      const scheduleMatch = aiResponse.match(/\[\s*\{[\s\S]*?\}\s*\]/);
      
      if (!scheduleMatch) {
        console.error('Failed to parse schedule from AI response. Raw response:', aiResponse);
        return res.status(500).json({ 
          success: false,
          error: 'Failed to parse schedule from AI response',
          rawResponse: aiResponse
        });
      }
      
      const scheduleString = scheduleMatch[0];
      let schedule;
      
      try {
        schedule = JSON.parse(scheduleString);
        
        // Validate the schedule has the required fields
        if (!Array.isArray(schedule) || schedule.length === 0) {
          throw new Error('Invalid schedule format: not an array or empty array');
        }
        
        // Validate each item has required fields
        schedule.forEach(item => {
          if (!item.id || !item.title || !item.time || !item.endTime || !item.type || !item.interval || !item.priority) {
            throw new Error('Invalid schedule item: missing required field');
          }
        });
        
        console.log(`Successfully parsed schedule with ${schedule.length} items`);
        
      } catch (parseError) {
        console.error('Error parsing schedule:', parseError, scheduleString);
        return res.status(500).json({ 
          success: false, 
          error: 'Failed to parse schedule JSON', 
          message: parseError.message,
          rawSchedule: scheduleString
        });
      }
      
      // Extract insights (everything except the schedule JSON)
      const insights = aiResponse.replace(scheduleString, '').trim();
      
      // Return the generated schedule and insights
      return res.status(200).json({
        success: true,
        data: {
          schedule,
          insights
        }
      });
      
    } catch (apiError) {
      console.error('Gemini API error:', apiError.response?.data || apiError.message);
      return res.status(500).json({
        success: false,
        error: 'Failed to get response from Gemini API',
        message: apiError.response?.data?.error?.message || apiError.message
      });
    }
    
  } catch (error) {
    console.error('Error generating smart schedule:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate smart schedule',
      message: error.message
    });
  }
};

/**
 * Get explanations for specific schedule recommendations
 */
export const getScheduleItemExplanation = async (req, res) => {
  try {
    const userId = req.user.id;
    const { activityId, activityType, activityTitle } = req.body;
    
    if (!activityType || !activityTitle) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters',
        message: 'Activity type and title are required'
      });
    }
    
    // Get user data to provide context for the explanation
    const todayDate = new Date().toISOString().split('T')[0];
    const userData = await getWeeklyProductivityData(userId, todayDate);
    
    // Prepare prompt for Gemini API to get explanation
    const prompt = {
      contents: [
        {
          parts: [
            {
              text: `As a productivity assistant, explain why the following activity was scheduled in the user's optimized daily plan:

Activity: "${activityTitle}"
Type: ${activityType}

User context:
- Has ${userData.habits.length} habits
- Has ${userData.goals.length} goals with milestones
- Has ${userData.tasks.length} tasks
- Has ${userData.routines.length} routines

Provide a brief, personalized explanation that mentions:
1. The importance of this activity based on its type and title
2. How it fits into a balanced daily schedule
3. Best practices for completing this type of activity effectively

Keep your explanation under 150 words, focused, and actionable.`
            }
          ]
        }
      ]
    };
    
    try {
      // Call Gemini API for the explanation
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
        prompt,
        {
          headers: { 'Content-Type': 'application/json' }
        }
      );
      
      const explanation = response.data.candidates[0].content.parts[0].text.trim();
      
      return res.status(200).json({
        success: true,
        data: {
          explanation
        }
      });
      
    } catch (apiError) {
      console.error('Gemini API error for explanation:', apiError);
      // Fallback explanation if API call fails
      return res.status(200).json({
        success: true,
        data: {
          explanation: "This activity was scheduled based on your past productivity patterns, current priorities, and optimal time management principles."
        }
      });
    }
    
  } catch (error) {
    console.error('Error generating explanation:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to generate explanation',
      message: error.message
    });
  }
}; 