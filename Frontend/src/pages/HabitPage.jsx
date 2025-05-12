/*
* IMPORTANT: Page Content Structure
* 
* Each page should now only contain its main content, as the Header and Sidebar
* are rendered by the Layout component.
*/

// pages/HabitPage.jsx
import React, { useState, useEffect } from 'react';
import Modal from '../components/ui/Modal';
import HabitDashboard from '../components/habit/HabitDashboard';
import HabitForm from '../components/habit/HabitForm';
import HabitDetail from '../components/habit/HabitDetail';
import PageHeader from '../components/ui/PageHeader';
import { useToastContext } from '../context/ToastContext';
import { useNavigate } from 'react-router-dom';

const HabitPage = () => {
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
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  const { successToast, errorToast, infoToast } = useToastContext();
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
        
        // Fetch habits
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
        setHabits(habitsData);

        // Fetch today's date for tracking data in local timezone
        const today = getLocalDateString(new Date());
        
        // Fetch tracking data for today - all habits, not just completed ones
        const trackingResponse = await fetch(`${apiUrl}/api/habit-tracking/date/${today}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!trackingResponse.ok) {
          throw new Error('Failed to fetch tracking data');
        }
        
        const trackingData = await trackingResponse.json();
        
        // Normalize date formats in the tracking data
        const normalizedTrackingData = trackingData.map(record => {
          // Ensure date is in consistent format
          if (record.date && record.date.includes('T')) {
            const recordDateObj = new Date(record.date);
            record.date = getLocalDateString(recordDateObj);
          }
          return record;
        });
        
        setHabitTracking(normalizedTrackingData);
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
      
      const response = await fetch(`${apiUrl}/api/habit-tracking/habit/${habitId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch habit tracking data');
      }
      
      const trackingData = await response.json();
      
      // Normalize date formats in the tracking data
      const normalizedTrackingData = trackingData.map(record => {
        // Ensure date is in consistent format using local timezone
        if (record.date && record.date.includes('T')) {
          const recordDateObj = new Date(record.date);
          record.date = getLocalDateString(recordDateObj);
        }
        return record;
      });
      
      setSelectedHabitTracking(normalizedTrackingData);
    } catch (err) {
      console.error("Error fetching habit tracking data:", err);
      setError("Failed to load habit details. Please try again.");
    }
  };
  
  // Get completion status directly from the tracking data
  const getCompletionStatus = () => {
    const status = {};
    // Get today's date in YYYY-MM-DD format, avoiding timezone issues
    const today = getLocalDateString(new Date());
    
    // Set default status to false for all habits
    habits.forEach(habit => {
      status[habit.id] = false;
    });
    
    // Update status for habits that have tracking records for today
    habitTracking.forEach(record => {
      // Extract date from record.date - handling both timestamp and plain date formats
      let recordDate = record.date;
      if (recordDate && recordDate.includes('T')) {
        // If it's a timestamp format, we need to parse it correctly to match the client's timezone
        const recordDateObj = new Date(recordDate);
        recordDate = getLocalDateString(recordDateObj);
      }
      
      if (recordDate === today) {
        status[record.habit_id] = record.completed;
      }
    });
    
    return status;
  };
  
  // Helper function to get a date string in YYYY-MM-DD format using local timezone
  const getLocalDateString = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  
  // Calculate stats for dashboard using backend data
  const getTotalHabits = () => habits.length;
  
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
    if (submitting) return; // Prevent multiple submissions
    
    if (showConfirmDelete) {
      setSubmitting(true);
      try {
        // Get API URL and token
        const apiUrl = getApiUrl();
        const token = getToken();
        if (!token) return;
        
        // Delete habit from API
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
        
        // Reset confirmation state
        setShowConfirmDelete(false);
        
        // Show success toast
        successToast(`Habit "${selectedHabit.title}" successfully deleted`);
      } catch (err) {
        console.error("Error deleting habit:", err);
        setError("Failed to delete habit. Please try again.");
        
        // Show error toast
        errorToast("Failed to delete habit. Please try again.");
      } finally {
        setSubmitting(false);
      }
    } else {
      setShowConfirmDelete(true);
    }
  };
  
  // Handle toggling habit completion
  const handleToggleComplete = async (habitId, completed) => {
    try {
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
          return updatedTracking;
        });
      } else {
        // Add new record to habitTracking
        setHabitTracking(prevTracking => {
          const updatedTracking = [...prevTracking, tempUpdatedRecord];
          return updatedTracking;
        });
      }
      
      // Show pending toast
      infoToast(`${completed ? 'Completing' : 'Uncompleting'} habit "${habit.title}"...`);
      
      // Call the API to toggle completion
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
      successToast(`Habit "${habit.title}" ${completed ? 'completed! 🎉' : 'marked as incomplete.'}`);
    } catch (err) {
      console.error("Error toggling habit completion:", err);
      
      // Show error toast
      errorToast("Failed to update habit status. Please try again.");
    }
  };
  
  const handleUpdateHabit = async (formData) => {
    if (submitting) return; // Prevent multiple submissions
    
    setSubmitting(true);
    try {
      const apiUrl = getApiUrl();
      const token = getToken();
      if (!token) return;
      
      // Determine if this is a create or update operation
      const isNewHabit = !formData.id;
      const method = isNewHabit ? 'POST' : 'PUT';
      
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
        successToast(`Habit "${habitData.title}" created successfully!`);
      } else {
        setHabits(habits.map(h => h.id === habitData.id ? habitData : h));
        setSelectedHabit(habitData);
        
        // Show success toast
        successToast(`Habit "${habitData.title}" updated successfully!`);
      }
      
      // Close modals
      setShowAddModal(false);
      setShowEditModal(false);
    } catch (err) {
      console.error("Error updating habit:", err);
      setError(`Failed to ${formData.id ? 'update' : 'create'} habit. Please try again.`);
      
      // Show error toast
      errorToast(`Failed to ${formData.id ? 'update' : 'create'} habit. Please try again.`);
    } finally {
      setSubmitting(false);
    }
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
      setCompletionStatus(status);
    }
  }, [habitTracking, habits]);

  return (
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        <PageHeader 
          title="Habit Tracker" 
          subtitle="Track your daily routines efficiently" 
        />
        
        {error && <div className="error-message">{error}</div>}
        
        {viewMode === 'dashboard' ? (
          <HabitDashboard
            habits={habits}
            totalHabits={getTotalHabits()}
            successRate={getSuccessRate()}
            completionStatus={completionStatus}
            onAddHabit={handleAddHabit}
            onViewDetails={handleViewDetails}
            onEditHabit={handleEditHabit}
            onToggleComplete={handleToggleComplete}
          />
        ) : (
          <HabitDetail
            habit={selectedHabit}
            trackingData={selectedHabitTracking}
            completionData={getTotalCompletionsAndDays(selectedHabit.id)}
            onBack={handleBackToDashboard}
            onEdit={() => handleEditHabit(selectedHabit.id)}
            onDelete={() => setShowConfirmDelete(true)}
          />
        )}
        
        {/* Add Habit Modal */}
        <Modal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          title="Add New Habit"
          size="lg"
        >
          <HabitForm 
            onSubmit={handleUpdateHabit} 
            isSubmitting={submitting}
          />
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
            isSubmitting={submitting}
          />
        </Modal>
        
        {/* Confirm Delete Modal */}
        {showConfirmDelete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
              <h3 className="text-lg font-bold mb-2">Delete Habit</h3>
              <p className="mb-4 text-gray-600">
                Are you sure you want to delete the habit "{selectedHabit?.title}"? This action cannot be undone.
              </p>

              <div className="flex justify-end gap-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteHabit}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  disabled={submitting}
                >
                  {submitting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HabitPage;