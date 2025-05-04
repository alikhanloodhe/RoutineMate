/*
* IMPORTANT: Page Layout Structure
* 
* When integrating new pages or components, please follow this structure:
* 1. Import Header and Sidebar components
* 2. Add sidebarOpen state and toggleSidebar function
* 3. Wrap the page content in the following layout:
*    - Root div with "min-h-screen" and appropriate background
*    - Header component with toggleSidebar and sidebarOpen props
*    - Flex container with sidebar and main content
*    - Sidebar component with sidebarOpen prop
*    - Main content div with conditional margin when sidebar is closed
*
* This ensures consistent layout and sidebar toggle functionality across all pages.
*/

// pages/HabitPage.jsx
import React, { useState, useEffect } from 'react';
// Import Header and Sidebar components for consistent layout
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import Modal from '../components/ui/Modal';
import HabitDashboard from '../components/habit/HabitDashboard';
import HabitForm from '../components/habit/HabitForm';
import HabitDetail from '../components/habit/HabitDetail';
import Toast from '../components/ui/Toast';
import { useNavigate } from 'react-router-dom';

const HabitPage = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true);
    
    const toggleSidebar = () => {
      setSidebarOpen(!sidebarOpen);
    };
  // State for habits and tracking data
  const [habits, setHabits] = useState([]);
  const [habitTracking, setHabitTracking] = useState([]);
  const [selectedHabitTracking, setSelectedHabitTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // UI state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [viewMode, setViewMode] = useState('dashboard'); // 'dashboard' or 'detail'
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const navigate = useNavigate();
  
  // Get API URL
  const getApiUrl = () => import.meta.env.VITE_API_URL || 'http://localhost:5000';
  
  // Get auth token
  const getToken = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return token;
  };
  
  // Fetch habits and tracking data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check if user is logged in
        const token = getToken();
        if (!token) return;
        
        setLoading(true);
        
        // Get API URL from environment or use default
        const apiUrl = getApiUrl();
        
        // Fetch habits - Updated to match goal API style
        const habitsResponse = await fetch(`${apiUrl}/api/habits`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!habitsResponse.ok) {
          if (habitsResponse.status === 401) {
            // Unauthorized - token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
            return;
          }
          throw new Error('Failed to fetch habits');
        }
        
        const habitsData = await habitsResponse.json();
        console.log('Habits fetched:', habitsData);
        setHabits(habitsData);

        // Fetch today's date for tracking data in local timezone
        const today = getLocalDateString(new Date());
        console.log('Today\'s date for tracking:', today);
        
        // Fetch tracking data for today - all habits, not just completed ones
        // Updated to match goal API style
        const trackingResponse = await fetch(`${apiUrl}/api/habit-tracking/date/${today}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!trackingResponse.ok) {
          throw new Error('Failed to fetch tracking data');
        }
        
        const trackingData = await trackingResponse.json();
        console.log('Tracking data fetched:', trackingData);
        
        // Normalize date formats in the tracking data
        const normalizedTrackingData = trackingData.map(record => {
          // Ensure date is in consistent format
          if (record.date && record.date.includes('T')) {
            const recordDateObj = new Date(record.date);
            record.date = getLocalDateString(recordDateObj);
          }
          return record;
        });
        
        console.log('Normalized tracking data:', normalizedTrackingData);
        setHabitTracking(normalizedTrackingData);

        // Log completion status after data is set
        setTimeout(() => {
          const completionStatus = getCompletionStatus();
          console.log('Calculated completion status:', completionStatus);
        }, 100);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load habits. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchData();
  }, [navigate]);

  // Fetch tracking data for a specific habit
  const fetchHabitTracking = async (habitId) => {
    try {
      const token = getToken();
      if (!token) return;
      
      const apiUrl = getApiUrl();
      
      // Updated to match goal API style
      const response = await fetch(`${apiUrl}/api/habit-tracking/habit/${habitId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch habit tracking data');
      }
      
      const trackingData = await response.json();
      console.log('Habit tracking data fetched:', trackingData);
      
      // Normalize date formats in the tracking data
      const normalizedTrackingData = trackingData.map(record => {
        // Ensure date is in consistent format using local timezone
        if (record.date && record.date.includes('T')) {
          const recordDateObj = new Date(record.date);
          record.date = getLocalDateString(recordDateObj);
        }
        return record;
      });
      
      console.log('Normalized habit tracking data:', normalizedTrackingData);
      setSelectedHabitTracking(normalizedTrackingData);
    } catch (err) {
      console.error("Error fetching habit tracking data:", err);
      setError("Failed to load habit details. Please try again.");
    }
  };
  
  // Get completion status directly from the tracking data
  const getCompletionStatus = () => {
    console.log('Computing completion status...');
    console.log('Current habits:', habits);
    console.log('Current habitTracking:', habitTracking);
    
    const status = {};
    // Get today's date in YYYY-MM-DD format, avoiding timezone issues
    const today = getLocalDateString(new Date());
    console.log('Today\'s date format for comparison:', today);
    
    // Set default status to false for all habits
    habits.forEach(habit => {
      status[habit.id] = false;
    });
    
    // Update status for habits that have tracking records for today
    habitTracking.forEach(record => {
      console.log('Checking tracking record:', record);
      
      // Extract date from record.date - handling both timestamp and plain date formats
      let recordDate = record.date;
      if (recordDate && recordDate.includes('T')) {
        // If it's a timestamp format, we need to parse it correctly to match the client's timezone
        const recordDateObj = new Date(recordDate);
        recordDate = getLocalDateString(recordDateObj);
      }
      
      console.log('Record date:', recordDate, 'Today:', today, 'Match?', recordDate === today);
      
      if (recordDate === today) {
        console.log(`Setting habit ${record.habit_id} completion to ${record.completed}`);
        status[record.habit_id] = record.completed;
      }
    });
    
    console.log('Final completion status:', status);
    return status;
  };
  
  // Helper function to get a date string in YYYY-MM-DD format using local timezone
  const getLocalDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Calculate streak data for each habit based on tracking data
  const getStreakData = () => {
    const streaks = {};
    const today = getLocalDateString(new Date());
    
    habits.forEach(habit => {
      // Get tracking records for this habit, sorted by date
      const habitRecords = habitTracking
        .filter(record => {
          // First normalize the date if needed
          let recordDate = record.date;
          if (recordDate && recordDate.includes('T')) {
            const recordDateObj = new Date(recordDate);
            recordDate = getLocalDateString(recordDateObj);
          }
          return record.habit_id === habit.id && record.completed;
        })
        .sort((a, b) => {
          // Normalize dates for comparison
          const dateA = a.date.includes('T') 
            ? getLocalDateString(new Date(a.date)) 
            : a.date;
            
          const dateB = b.date.includes('T') 
            ? getLocalDateString(new Date(b.date)) 
            : b.date;
            
          return new Date(dateA) - new Date(dateB);
        });
      
      // Calculate current streak
      let currentStreak = 0;
      
      // For daily habits, we need to check consecutive days
      if (habit.frequency === 'daily') {
        // Start from the most recent day and go backwards
        let checkDate = new Date();
        
        while (true) {
          const dateStr = getLocalDateString(checkDate);
          const foundRecord = habitTracking.find(record => {
            // Normalize the date for comparison
            const recordDate = record.date.includes('T') 
              ? getLocalDateString(new Date(record.date)) 
              : record.date;
              
            return record.habit_id === habit.id && recordDate === dateStr && record.completed;
          });
          
          // If completed, increment streak, otherwise break
          if (foundRecord) {
            currentStreak++;
          } else {
            break;
          }
          
          // Move to previous day
          checkDate.setDate(checkDate.getDate() - 1);
        }
      }
      // For weekly habits, the logic would be more complex
      // Simplified implementation for now
      else if (habit.frequency === 'weekly') {
        currentStreak = habitRecords.length > 0 ? 1 : 0;
      }
      
      streaks[habit.id] = currentStreak;
    });
    
    return streaks;
  };
  
  // Calculate stats for dashboard using backend data
  const getTotalHabits = () => habits.length;
  
  const getActiveStreaks = () => {
    const streaks = getStreakData();
    return Object.values(streaks).filter(streak => streak > 0).length;
  };
  
  const getSuccessRate = () => {
    if (habitTracking.length === 0) return 0;
    
    const completed = habitTracking.filter(record => record.completed).length;
    return Math.round((completed / habitTracking.length) * 100);
  };
  
  // Handler functions
  const handleAddHabit = () => {
    setShowAddModal(true);
  };
  
  // View details for a specific habit
  const handleViewDetails = async (habitId) => {
    // Skip view details processing if the habit is being marked complete
    // Instead, we'll rely on the HabitCard component to properly handle the checkbox click
    
    const habit = habits.find(h => h.id === habitId);
    setSelectedHabit(habit);
    
    // Fetch tracking data for this specific habit
    await fetchHabitTracking(habitId);
    
    setViewMode('detail');
  };
  
  const handleEditHabit = (habitId) => {
    const habit = habits.find(h => h.id === habitId);
    setSelectedHabit(habit);
    setShowEditModal(true);
  };
  
  const handleBackToDashboard = () => {
    setViewMode('dashboard');
    setSelectedHabit(null);
    setSelectedHabitTracking([]);
  };
  
  const handleDeleteHabit = async () => {
    try {
      // Get API URL and token
      const apiUrl = getApiUrl();
      const token = getToken();
      if (!token) return;
      
      // Delete habit from API - Updated to match goal API style
      const response = await fetch(`${apiUrl}/api/habits/${selectedHabit.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete habit');
      }
      
      // Update UI - the tracking records will be deleted by the backend (CASCADE)
      setHabits(habits.filter(h => h.id !== selectedHabit.id));
      
      // Update tracking records in state
      setHabitTracking(habitTracking.filter(record => record.habit_id !== selectedHabit.id));
      
      // Return to dashboard
      handleBackToDashboard();
      
      // Show success toast
      setToast({
        show: true,
        message: `Habit "${selectedHabit.title}" successfully deleted`,
        type: 'info'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (err) {
      console.error("Error deleting habit:", err);
      setError("Failed to delete habit. Please try again.");
      
      // Show error toast
      setToast({
        show: true,
        message: "Failed to delete habit. Please try again.",
        type: 'error'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };
  
  // Handle toggling habit completion
  const handleToggleComplete = async (habitId, completed) => {
    try {
      console.log(`handleToggleComplete called for habit ${habitId}, completed=${completed}`);
      const apiUrl = getApiUrl();
      const token = getToken();
      if (!token) return;
      
      // Get today's date in local timezone format
      const today = getLocalDateString(new Date());
      
      // Find the habit to update
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        console.error("Habit not found with ID:", habitId);
        return;
      }
      console.log('Found habit to update:', habit);

      // Find if there's already a tracking record for today
      const existingRecord = habitTracking.find(record => {
        // Extract date from record.date
        let recordDate = record.date;
        if (recordDate && recordDate.includes('T')) {
          const recordDateObj = new Date(recordDate);
          recordDate = getLocalDateString(recordDateObj);
        }
        return record.habit_id === habitId && recordDate === today;
      });
      
      console.log('Existing tracking record:', existingRecord);
      
      // Create a temporary updated tracking record
      const tempUpdatedRecord = {
        id: existingRecord ? existingRecord.id : Date.now(), // Temporary ID if new
        habit_id: habitId,
        user_id: JSON.parse(localStorage.getItem('user'))?.id,
        date: today,
        completed: completed
      };
      console.log('Created temporary tracking record:', tempUpdatedRecord);
      
      console.log('Before update habitTracking:', habitTracking);
      
      // Update the local state with the temporary record for immediate UI feedback
      if (existingRecord) {
        // Update existing record in habitTracking
        setHabitTracking(prevTracking => {
          const updatedTracking = prevTracking.map(record => {
            // Extract date for comparison
            let recordDate = record.date;
            if (recordDate && recordDate.includes('T')) {
              const recordDateObj = new Date(recordDate);
              recordDate = getLocalDateString(recordDateObj);
            }
            
            if (record.habit_id === habitId && recordDate === today) {
              return tempUpdatedRecord;
            }
            return record;
          });
          console.log('Updated habitTracking (existing record):', updatedTracking);
          return updatedTracking;
        });
      } else {
        // Add new record to habitTracking
        setHabitTracking(prevTracking => {
          const updatedTracking = [...prevTracking, tempUpdatedRecord];
          console.log('Updated habitTracking (new record):', updatedTracking);
          return updatedTracking;
        });
      }
      
      // Show pending toast
      setToast({
        show: true,
        message: `${completed ? 'Completing' : 'Uncompleting'} habit "${habit.title}"...`,
        type: 'info'
      });
      
      // Call the API to toggle completion - Updated to match goal API style
      console.log('Calling API to toggle completion:', {
        habit_id: habitId,
        date: today,
        completed: completed
      });
      
      const response = await fetch(`${apiUrl}/api/habit-tracking/toggle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          habit_id: habitId,
          date: today,
          completed: completed
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to update habit status');
      }
      
      const updatedRecord = await response.json();
      console.log('Received updated record from API:', updatedRecord);
      
      // Update habit tracking in state based on server response
      setHabitTracking(currentTracking => {
        // Check if a record exists for today
        const recordExists = currentTracking.some(record => {
          // Extract date for comparison
          let recordDate = record.date;
          if (recordDate && recordDate.includes('T')) {
            const recordDateObj = new Date(recordDate);
            recordDate = getLocalDateString(recordDateObj);
          }
          return record.habit_id === habitId && recordDate === today;
        });
        
        let newTracking;
        if (recordExists) {
          // Update existing record
          newTracking = currentTracking.map(record => {
            // Extract date for comparison
            let recordDate = record.date;
            if (recordDate && recordDate.includes('T')) {
              const recordDateObj = new Date(recordDate);
              recordDate = getLocalDateString(recordDateObj);
            }
            
            if (record.habit_id === habitId && recordDate === today) {
              return updatedRecord;
            }
            return record;
          });
        } else {
          // Add new record
          newTracking = [...currentTracking, updatedRecord];
        }
        
        console.log('Final habitTracking after API call:', newTracking);
        
        // Re-calculate completion status for debugging
        setTimeout(() => {
          const completionStatus = getCompletionStatus();
          console.log('Re-calculated completion status after toggle:', completionStatus);
        }, 0);
        
        return newTracking;
      });

      // Also update selectedHabitTracking if we're viewing the habit details
      if (selectedHabit && selectedHabit.id === habitId) {
        setSelectedHabitTracking(currentTracking => {
          const recordExists = currentTracking.some(record => {
            // Extract date for comparison
            let recordDate = record.date;
            if (recordDate && recordDate.includes('T')) {
              const recordDateObj = new Date(recordDate);
              recordDate = getLocalDateString(recordDateObj);
            }
            return recordDate === today;
          });
          
          if (recordExists) {
            return currentTracking.map(record => {
              // Extract date for comparison
              let recordDate = record.date;
              if (recordDate && recordDate.includes('T')) {
                const recordDateObj = new Date(recordDate);
                recordDate = getLocalDateString(recordDateObj);
              }
              
              if (recordDate === today) {
                return updatedRecord;
              }
              return record;
            });
          } else {
            return [...currentTracking, updatedRecord];
          }
        });
      }
      
      // Show success toast
      setToast({
        show: true,
        message: `Habit "${habit.title}" ${completed ? 'completed! 🎉' : 'marked as incomplete.'}`,
        type: completed ? 'success' : 'info'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (err) {
      console.error("Error toggling habit completion:", err);
      
      // Show error toast
      setToast({
        show: true,
        message: "Failed to update habit status. Please try again.",
        type: 'error'
      });
      
      // Hide error toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };
  
  const handleUpdateHabit = async (formData) => {
    try {
      const apiUrl = getApiUrl();
      const token = getToken();
      if (!token) return;
      
      // Determine if this is a create or update operation
      const isNewHabit = !formData.id;
      const method = isNewHabit ? 'POST' : 'PUT';
      
      // Updated to match goal API style
      const url = isNewHabit 
        ? `${apiUrl}/api/habits` 
        : `${apiUrl}/api/habits/${formData.id}`;
      
      // Call the API to create or update the habit
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${isNewHabit ? 'create' : 'update'} habit`);
      }
      
      const habitData = await response.json();
      
      // Update habits in state
      if (isNewHabit) {
        setHabits([...habits, habitData]);
        
        // Show success toast
        setToast({
          show: true,
          message: `Habit "${habitData.title}" created successfully!`,
          type: 'success'
        });
      } else {
        setHabits(habits.map(h => h.id === habitData.id ? habitData : h));
        setSelectedHabit(habitData);
        
        // Show success toast
        setToast({
          show: true,
          message: `Habit "${habitData.title}" updated successfully!`,
          type: 'success'
        });
      }
      
      // Close modals
      setShowAddModal(false);
      setShowEditModal(false);
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    } catch (err) {
      console.error("Error updating habit:", err);
      setError(`Failed to ${formData.id ? 'update' : 'create'} habit. Please try again.`);
      
      // Show error toast
      setToast({
        show: true,
        message: `Failed to ${formData.id ? 'update' : 'create'} habit. Please try again.`,
        type: 'error'
      });
      
      // Hide toast after 3 seconds
      setTimeout(() => {
        setToast({ show: false, message: '', type: 'success' });
      }, 3000);
    }
  };
  
  const getCurrentAndBestStreak = (habitId) => {
    // Calculate streaks from tracking data
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    
    // Sort tracking data by date
    const sortedData = [...selectedHabitTracking]
      .filter(record => record.completed)
      .sort((a, b) => {
        // Normalize dates for sorting
        const dateA = a.date.includes('T') 
          ? getLocalDateString(new Date(a.date)) 
          : a.date;
        const dateB = b.date.includes('T') 
          ? getLocalDateString(new Date(b.date)) 
          : b.date;
        return new Date(dateA) - new Date(dateB);
      });
    
    // Calculate best streak
    for (let i = 0; i < sortedData.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        // Normalize dates for comparison
        const prevDateStr = sortedData[i-1].date.includes('T') 
          ? getLocalDateString(new Date(sortedData[i-1].date)) 
          : sortedData[i-1].date;
        
        const currDateStr = sortedData[i].date.includes('T') 
          ? getLocalDateString(new Date(sortedData[i].date)) 
          : sortedData[i].date;
        
        const prevDate = new Date(prevDateStr);
        const currDate = new Date(currDateStr);
        const diffDays = Math.floor((currDate - prevDate) / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          tempStreak++;
        } else {
          tempStreak = 1;
        }
      }
      
      bestStreak = Math.max(bestStreak, tempStreak);
    }
    
    // Calculate current streak
    const today = new Date();
    let checkDate = new Date(today);
    
    while (true) {
      const dateStr = getLocalDateString(checkDate);
      const foundRecord = selectedHabitTracking.find(record => {
        // Normalize dates for comparison
        const recordDate = record.date.includes('T') 
          ? getLocalDateString(new Date(record.date)) 
          : record.date;
        return recordDate === dateStr && record.completed;
      });
      
      if (foundRecord) {
        currentStreak++;
      } else {
        break;
      }
      
      checkDate.setDate(checkDate.getDate() - 1);
    }
    
    return { current: currentStreak, best: bestStreak };
  };
  
  const getTotalCompletionsAndDays = (habitId) => {
    // Calculate total completions directly from backend data
    const completions = selectedHabitTracking.filter(record => record.completed).length;
    
    // Calculate total days since habit start
    const habit = habits.find(h => h.id === habitId);
    if (!habit || !habit.start_date) {
      return { completions, totalDays: 0 };
    }
    
    const startDate = new Date(habit.start_date);
    const today = new Date();
    const diffTime = Math.abs(today - startDate);
    const totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include start day
    
    return { completions, totalDays };
  };

  // Make sure completionStatus is recalculated when habitTracking changes
  const [completionStatus, setCompletionStatus] = useState({});

  useEffect(() => {
    // Only calculate if we have both habits and tracking data
    if (habits.length > 0 || habitTracking.length > 0) {
      const status = getCompletionStatus();
      console.log('Setting completionStatus state from habit tracking change:', status);
      setCompletionStatus(status);
    }
  }, [habitTracking, habits]);

  // Render the component
  // if (loading) {
  //   return <div className="loading-spinner">Loading...</div>;
  // }
  
  return (
    // Update to match other pages layout structure with sidebar
    <div className="min-h-screen bg-[#fffcfc]">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      <div className="flex h-[calc(100vh-60px)]">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          {error && <div className="error-message">{error}</div>}
          
          {viewMode === 'dashboard' ? (
            <HabitDashboard
              habits={habits}
              totalHabits={getTotalHabits()}
              activeStreaks={getActiveStreaks()}
              successRate={getSuccessRate()}
              completionStatus={completionStatus}
              streaks={getStreakData()}
              onAddHabit={handleAddHabit}
              onViewDetails={handleViewDetails}
              onEditHabit={handleEditHabit}
              onToggleComplete={handleToggleComplete}
            />
          ) : (
            <HabitDetail
              habit={selectedHabit}
              trackingData={selectedHabitTracking}
              streakData={getCurrentAndBestStreak(selectedHabit.id)}
              completionData={getTotalCompletionsAndDays(selectedHabit.id)}
              onBack={handleBackToDashboard}
              onEdit={() => handleEditHabit(selectedHabit.id)}
              onDelete={handleDeleteHabit}
            />
          )}
          
          {/* Add Habit Modal */}
          <Modal
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            title="Add New Habit"
            size="lg"
          >
            <HabitForm onSubmit={handleUpdateHabit} />
          </Modal>
          
          {/* Edit Habit Modal */}
          <Modal
            isOpen={showEditModal}
            onClose={() => setShowEditModal(false)}
            title="Edit Habit"
            size="lg"
          >
            <HabitForm 
              habit={selectedHabit} 
              onSubmit={handleUpdateHabit} 
            />
          </Modal>

          {/* Toast Notification */}
          {toast.show && (
            <Toast 
              message={toast.message} 
              type={toast.type} 
              onClose={() => setToast({ ...toast, show: false })}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HabitPage;