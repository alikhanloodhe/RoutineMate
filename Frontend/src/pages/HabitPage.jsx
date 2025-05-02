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
        
        // Fetch habits - Use the clear URL pattern with /getHabits
        const habitsResponse = await fetch(`${apiUrl}/api/habits/getHabits`, {
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
        setHabits(habitsData);

        // Fetch today's date for tracking data
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch tracking data for today - all habits, not just completed ones
        const trackingResponse = await fetch(`${apiUrl}/api/tracking/date/${today}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!trackingResponse.ok) {
          throw new Error('Failed to fetch tracking data');
        }
        
        const trackingData = await trackingResponse.json();
        setHabitTracking(trackingData);
        
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
      
      const response = await fetch(`${apiUrl}/api/tracking/habit/${habitId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch habit tracking data');
      }
      
      const trackingData = await response.json();
      setSelectedHabitTracking(trackingData);
    } catch (err) {
      console.error("Error fetching habit tracking data:", err);
      setError("Failed to load habit details. Please try again.");
    }
  };
  
  // Get completion status directly from the tracking data
  const getCompletionStatus = () => {
    const status = {};
    const today = new Date().toISOString().split('T')[0];
    
    // Set default status to false for all habits
    habits.forEach(habit => {
      status[habit.id] = false;
    });
    
    // Update status for habits that have tracking records for today
    habitTracking.forEach(record => {
      if (record.date === today) {
        status[record.habit_id] = record.completed;
      }
    });
    
    return status;
  };
  
  // Calculate streak data for each habit based on tracking data
  const getStreakData = () => {
    const streaks = {};
    const today = new Date().toISOString().split('T')[0];
    
    habits.forEach(habit => {
      // Get tracking records for this habit, sorted by date
      const habitRecords = habitTracking
        .filter(record => record.habit_id === habit.id && record.completed)
        .sort((a, b) => new Date(a.date) - new Date(b.date));
      
      // Calculate current streak
      let currentStreak = 0;
      
      // For daily habits, we need to check consecutive days
      if (habit.frequency === 'daily') {
        // Start from the most recent day and go backwards
        let checkDate = new Date(today);
        
        while (true) {
          const dateStr = checkDate.toISOString().split('T')[0];
          const foundRecord = habitTracking.find(
            record => record.habit_id === habit.id && record.date === dateStr && record.completed
          );
          
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
  
  const handleViewDetails = async (habitId) => {
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
      
      // Delete habit from API - Use a clearer API path
      const response = await fetch(`${apiUrl}/api/habits/deleteHabit/${selectedHabit.id}`, {
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
  
  const handleToggleComplete = async (habitId, completed) => {
    try {
      const apiUrl = getApiUrl();
      const token = getToken();
      if (!token) return;
      
      const today = new Date().toISOString().split('T')[0];
      
      // Find the habit to update
      const habit = habits.find(h => h.id === habitId);
      if (!habit) {
        console.error("Habit not found with ID:", habitId);
        return;
      }

      // Find if there's already a tracking record for today
      const existingRecord = habitTracking.find(
        record => record.habit_id === habitId && record.date === today
      );
      
      // Create a temporary updated tracking record
      const tempUpdatedRecord = {
        id: existingRecord ? existingRecord.id : Date.now(), // Temporary ID if new
        habit_id: habitId,
        user_id: JSON.parse(localStorage.getItem('user'))?.id,
        date: today,
        completed: completed
      };
      
      // Update the local state with the temporary record for immediate UI feedback
      if (existingRecord) {
        // Update existing record in habitTracking
        setHabitTracking(prevTracking => 
          prevTracking.map(record => 
            (record.habit_id === habitId && record.date === today) 
              ? tempUpdatedRecord 
              : record
          )
        );
      } else {
        // Add new record to habitTracking
        setHabitTracking(prevTracking => [...prevTracking, tempUpdatedRecord]);
      }
      
      // Show pending toast
      setToast({
        show: true,
        message: `${completed ? 'Completing' : 'Uncompleting'} habit "${habit.title}"...`,
        type: 'info'
      });
      
      // Call the API to toggle completion - Use a clearer API path
      const response = await fetch(`${apiUrl}/api/tracking/toggleCompletion`, {
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
      
      // Update habit tracking in state based on server response
      setHabitTracking(currentTracking => {
        const recordExists = currentTracking.some(
          record => record.habit_id === habitId && record.date === today
        );
        
        if (recordExists) {
          // Update existing record
          return currentTracking.map(record => {
            if (record.habit_id === habitId && record.date === today) {
              return updatedRecord;
            }
            return record;
          });
        } else {
          // Add new record
          return [...currentTracking, updatedRecord];
        }
      });

      // Also update selectedHabitTracking if we're viewing the habit details
      if (selectedHabit && selectedHabit.id === habitId) {
        setSelectedHabitTracking(currentTracking => {
          const recordExists = currentTracking.some(
            record => record.date === today
          );
          
          if (recordExists) {
            return currentTracking.map(record => {
              if (record.date === today) {
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
      // Use clearer API paths
      const url = isNewHabit 
        ? `${apiUrl}/api/habits/createHabit` 
        : `${apiUrl}/api/habits/updateHabit/${formData.id}`;
      
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
      .sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate best streak
    for (let i = 0; i < sortedData.length; i++) {
      if (i === 0) {
        tempStreak = 1;
      } else {
        const prevDate = new Date(sortedData[i-1].date);
        const currDate = new Date(sortedData[i].date);
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
      const dateStr = checkDate.toISOString().split('T')[0];
      const foundRecord = selectedHabitTracking.find(
        record => record.date === dateStr && record.completed
      );
      
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
              completionStatus={getCompletionStatus()}
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