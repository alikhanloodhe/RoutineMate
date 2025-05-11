import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusCircle, Calendar, List, Clock, AlarmClock } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';

// Import custom components
import RoutineList from '../components/routine/RoutineList';
import RoutineForm from '../components/routine/RoutineForm';
import FilterBar from '../components/routine/FilterBar';
import StatsPanel from '../components/routine/StatsPanel';
import { useToastContext } from '../context/ToastContext';

// Mock data for initial routines
const initialRoutines = [
  {
    id: 1,
    routine_id: 1,
    user_id: 1,
    title: "Morning Workout",
    description: "30 minutes cardio + strength training",
    startTime: "06:00",
    endTime: "07:00",
    start_time: "06:00",
    end_time: "07:00",
    category: "Physical",
    category_id: "Physical",
    active: true,
    status: "pending",
    daysOfWeek: ["Mon", "Wed", "Fri"],
    days: ["Mon", "Wed", "Fri"],
    priority: "HIGH",
    priority_id: "HIGH",
    created_at: "2025-03-15",
    createdAt: "2025-03-15",
    updated_at: "2025-03-15T00:00:00Z",
    completionData: {
      streak: 7,
      lastCompleted: "2025-04-08",
      completionRate: 85,
      history: [
        { date: "2025-04-08", completed: true },
        { date: "2025-04-06", completed: true },
        { date: "2025-04-05", completed: false },
        { date: "2025-04-03", completed: true },
        { date: "2025-04-01", completed: true },
      ]
    }
  },
  {
    id: 2,
    routine_id: 2,
    user_id: 1,
    title: "Study Session",
    description: "Focus on advanced database concepts",
    startTime: "19:00",
    endTime: "20:30",
    start_time: "19:00",
    end_time: "20:30",
    category: "Mental",
    category_id: "Mental",
    active: true,
    status: "pending",
    daysOfWeek: ["Mon", "Tue", "Thu"],
    days: ["Mon", "Tue", "Thu"],
    priority: "MEDIUM",
    priority_id: "MEDIUM",
    created_at: "2025-03-20",
    createdAt: "2025-03-20",
    updated_at: "2025-03-20T00:00:00Z",
    completionData: {
      streak: 3,
      lastCompleted: "2025-04-08",
      completionRate: 70,
      history: [
        { date: "2025-04-08", completed: true },
        { date: "2025-04-04", completed: true },
        { date: "2025-04-02", completed: false },
        { date: "2025-04-01", completed: true },
      ]
    }
  },
  {
    id: 3,
    routine_id: 3,
    user_id: 1,
    title: "Meditation",
    description: "Mindfulness practice for mental clarity",
    startTime: "21:00",
    endTime: "21:20",
    start_time: "21:00",
    end_time: "21:20",
    category: "Spiritual",
    category_id: "Spiritual",
    active: true,
    status: "completed",
    daysOfWeek: ["Mon", "Wed", "Fri", "Sun"],
    days: ["Mon", "Wed", "Fri", "Sun"],
    priority: "LOW",
    priority_id: "LOW",
    created_at: "2025-03-25",
    createdAt: "2025-03-25",
    updated_at: "2025-03-25T00:00:00Z",
    completionData: {
      streak: 9,
      lastCompleted: "2025-04-07",
      completionRate: 92,
      history: [
        { date: "2025-04-07", completed: true },
        { date: "2025-04-05", completed: true },
        { date: "2025-04-03", completed: true },
        { date: "2025-04-01", completed: true },
      ]
    }
  },
  {
    id: 4,
    routine_id: 4,
    user_id: 1,
    title: "Team Meeting",
    description: "Weekly project sync-up",
    startTime: "09:45",
    endTime: "10:15",
    start_time: "09:45",
    end_time: "10:15",
    category: "Social",
    category_id: "Social",
    active: true,
    status: "pending",
    daysOfWeek: ["Wed"],
    days: ["Wed"],
    priority: "HIGH",
    priority_id: "HIGH",
    created_at: "2025-03-28",
    createdAt: "2025-03-28",
    updated_at: "2025-03-28T00:00:00Z",
    completionData: {
      streak: 4,
      lastCompleted: "2025-04-01",
      completionRate: 90,
      history: [
        { date: "2025-04-01", completed: true },
        { date: "2025-03-25", completed: true },
        { date: "2025-03-18", completed: true },
        { date: "2025-03-11", completed: false },
      ]
    }
  }
];

const Routines = () => {
  const [routines, setRoutines] = useState(initialRoutines);
  const [filteredRoutines, setFilteredRoutines] = useState(initialRoutines);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingRoutineId, setEditingRoutineId] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // Changed default to "list" from "timetable"
  const [searchTerm, setSearchTerm] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { successToast, errorToast, infoToast } = useToastContext();

  // Get token for API calls
  const token = localStorage.getItem('token');

  // Initialize today's date
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][today.getDay()];

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, []);

  // Fetch routines from API when component mounts
  useEffect(() => {
    const fetchRoutines = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/routines`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (response.ok) {
          const data = await response.json();
          // Normalize data to ensure consistent field names
          const normalizedData = data.map(routine => ({
            id: routine.routine_id,
            routine_id: routine.routine_id,
            title: routine.title,
            startTime: routine.start_time,
            endTime: routine.end_time,
            start_time: routine.start_time,
            end_time: routine.end_time,
            status: routine.status,
            category: routine.category,
            priority: routine.priority,
            category_id: routine.category_id,
            priority_id: routine.priority_id,
            daysOfWeek: routine.days,
            days: routine.days,
            completionData: routine.completionData || {
              streak: 0,
              lastCompleted: null,
              completionRate: 0,
              history: []
            },
            active: routine.status === 'active' || routine.status === 'pending'
          }));
          setRoutines(normalizedData);
          setFilteredRoutines(normalizedData);
        } else {
          console.error('Failed to fetch routines');
          setError('Failed to fetch routines. Please try again later.');
          
          // Only use mock data in development mode
          if (import.meta.env.DEV) {
            console.log('Using mock data in development mode');
            setRoutines(initialRoutines);
            setFilteredRoutines(initialRoutines);
            setError(null); // Clear error when using mock data
          }
        }
      } catch (error) {
        console.error('Error fetching routines:', error);
        setError('Network error while fetching routines.');
        
        // Only use mock data in development mode
        if (import.meta.env.DEV) {
          console.log('Using mock data in development mode');
          setRoutines(initialRoutines);
          setFilteredRoutines(initialRoutines);
          setError(null); // Clear error when using mock data
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoutines();
  }, [token]);

  // Effect to apply search
  useEffect(() => {
    let result = [...routines];

    // Apply search term
    if (searchTerm.trim() !== "") {
      const lowercaseSearch = searchTerm.toLowerCase();
      result = result.filter(routine =>
        routine.title.toLowerCase().includes(lowercaseSearch) ||
        routine.description.toLowerCase().includes(lowercaseSearch) ||
        routine.category.toLowerCase().includes(lowercaseSearch)
      );
    }

    setFilteredRoutines(result);
  }, [routines, searchTerm]);

  // Get routines for today
  const getTodayRoutines = () => {
    return routines.filter(routine => {
      // Handle both daysOfWeek and days formats
      const routineDays = routine.daysOfWeek || routine.days;
      
      // Ensure routineDays exists and is an array before calling includes
      return Array.isArray(routineDays) && routineDays.includes(dayOfWeek);
    });
  };

  // Get current active routine based on time
  const getCurrentRoutines = () => {
    const now = currentTime;
    const timeStr = now.toTimeString().substring(0, 5); // Format: HH:MM

    return getTodayRoutines().filter(routine => {
      const startTime = routine.startTime || routine.start_time;
      const endTime = routine.endTime || routine.end_time;
      return startTime <= timeStr && endTime > timeStr && routine.status !== 'completed';
    });
  };

  // Get upcoming routines for today
  const getUpcomingRoutines = () => {
    const now = currentTime;
    const timeStr = now.toTimeString().substring(0, 5); // Format: HH:MM

    return getTodayRoutines()
      .filter(routine => {
        const startTime = routine.startTime || routine.start_time;
        return startTime > timeStr && routine.status !== 'completed';
      })
      .sort((a, b) => {
        const aStartTime = a.startTime || a.start_time;
        const bStartTime = b.startTime || b.start_time;
        return aStartTime.localeCompare(bStartTime);
      });
  };

  // Get completed routines for today
  const getCompletedRoutines = () => {
    return getTodayRoutines().filter(routine =>
      routine.status === 'completed' || 
      routine.completionData?.history?.some(
        h => h.date === todayStr && h.completed
      )
    );
  };

  // Get time slots for timetable - updating to use 15-minute intervals for better precision
  const getTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`);
      slots.push(`${hour.toString().padStart(2, '0')}:15`);
      slots.push(`${hour.toString().padStart(2, '0')}:30`);
      slots.push(`${hour.toString().padStart(2, '0')}:45`);
    }
    return slots;
  };

  // Improved function to determine if a routine falls within a given time slot
  const isRoutineInTimeSlot = (routine, timeSlot) => {
    // Convert timeSlot to minutes since midnight for easier comparison
    const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
    const slotTimeInMinutes = slotHours * 60 + slotMinutes;
    
    // Get the next time slot (15 minutes later)
    const nextSlotTimeInMinutes = slotTimeInMinutes + 15;
    
    // Convert routine start and end times to minutes
    const startTime = routine.startTime || routine.start_time;
    const endTime = routine.endTime || routine.end_time;
    
    const [startHours, startMinutes] = startTime.split(':').map(Number);
    const startTimeInMinutes = startHours * 60 + startMinutes;
    
    const [endHours, endMinutes] = endTime.split(':').map(Number);
    const endTimeInMinutes = endHours * 60 + endMinutes;
    
    // A routine is in this slot if:
    // 1. It starts within this slot, OR
    // 2. It started before this slot and ends after this slot, OR
    // 3. It ends within this slot
    return (
      // Starts in this slot
      (startTimeInMinutes >= slotTimeInMinutes && startTimeInMinutes < nextSlotTimeInMinutes) ||
      // Spans over this slot
      (startTimeInMinutes < slotTimeInMinutes && endTimeInMinutes > slotTimeInMinutes) ||
      // Ends exactly at this slot
      (endTimeInMinutes === slotTimeInMinutes)
    );
  };
  
  // Calculate the height and positioning of a routine based on its duration and start time
  const getRoutineStyles = (routine, timeSlot) => {
    // Convert times to minutes for calculations
    const getTimeInMinutes = (timeStr) => {
      const [hours, minutes] = timeStr.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    const [slotHours, slotMinutes] = timeSlot.split(':').map(Number);
    const slotTimeInMinutes = slotHours * 60 + slotMinutes;
    
    const startTime = routine.startTime || routine.start_time;
    const endTime = routine.endTime || routine.end_time;
    
    const startMins = getTimeInMinutes(startTime);
    const endMins = getTimeInMinutes(endTime);
    const durationMins = endMins - startMins;
    
    // Calculate offset from the top of the time slot (for routines that don't start exactly on the slot)
    const topOffset = Math.max(0, startMins - slotTimeInMinutes);
    
    // Calculate height based on duration in 15-minute increments
    const heightInSlots = Math.ceil(durationMins / 15);
    const height = heightInSlots * 6; // Each 15-min slot is 6px tall
    
    // Calculate top position based on offset within the slot
    const top = (topOffset / 15) * 6; // Scale to pixels
    
    // Return style object
    return {
      height: `${height}px`,
      top: `${top}px`,
      position: 'absolute',
      left: '4px',
      right: '4px',
      zIndex: 10
    };
  };

  // Get weekly schedule from Sunday to Saturday
  const getWeeklySchedule = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get first day of week (Sunday)
    const firstDay = new Date(today);
    firstDay.setDate(today.getDate() - today.getDay());

    const weekSchedule = weekdays.map((day, index) => {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + index);
      const dateStr = date.toISOString().split('T')[0];

      // Get routines for this day - ensuring we use the actual routines from state
      const dayRoutines = routines.filter(routine => {
        // Handle both daysOfWeek and days formats
        const routineDays = routine.daysOfWeek || routine.days;
        
        // Check if routine is active and has the current day in its schedule
        const isActive = routine.status === 'active' || routine.status === 'pending';
        
        return isActive && Array.isArray(routineDays) && routineDays.includes(day);
      });
      
      return {
        day,
        date,
        dateStr,
        routines: dayRoutines,
        isToday: date.toDateString() === today.toDateString()
      };
    });

    return weekSchedule;
  };

  // Helper function to convert time string to minutes since midnight
  const getMinutesSinceMidnight = (timeString) => {
    try {
      // Return 0 if timeString is undefined or null
      if (!timeString) {
        return 0;
      }
      
      // Handle both formats: "HH:MM" and "HH:MM:SS"
      const parts = timeString.split(':');
      const hours = parseInt(parts[0], 10);
      const minutes = parseInt(parts[1], 10);
      
      // Validate parsed values
      if (isNaN(hours) || isNaN(minutes)) {
        console.error("Invalid time format:", timeString);
        return 0;
      }
      
      return hours * 60 + minutes;
    } catch (error) {
      console.error("Error parsing time:", timeString, error);
      return 0;
    }
  };

  // Check for time conflicts with existing routines
  const checkTimeConflicts = (newRoutine, routinesToCheck = routines) => {
    // If no days are selected, there can't be a conflict
    const routineDays = newRoutine.days || newRoutine.daysOfWeek || [];
    if (!routineDays.length) return false;
    
    // Get the new routine's start and end times
    const newStartTime = getMinutesSinceMidnight(newRoutine.startTime || newRoutine.start_time);
    const newEndTime = getMinutesSinceMidnight(newRoutine.endTime || newRoutine.end_time);
    
    // Check against each existing routine
    for (const existingRoutine of routinesToCheck) {
      // Skip the routine being edited (if any)
      if (existingRoutine.id === newRoutine.id || existingRoutine.routine_id === newRoutine.routine_id) {
        continue;
      }
      
      // Get the existing routine's days
      const existingDays = existingRoutine.days || existingRoutine.daysOfWeek || [];
      
      // Check if there's any day overlap
      const hasOverlappingDays = routineDays.some(day => existingDays.includes(day));
      if (!hasOverlappingDays) continue;
      
      // Get the existing routine's start and end times
      const existingStartTime = getMinutesSinceMidnight(existingRoutine.startTime || existingRoutine.start_time);
      const existingEndTime = getMinutesSinceMidnight(existingRoutine.endTime || existingRoutine.end_time);
      
      // Check for time overlap
      const hasTimeOverlap = (
        (newStartTime >= existingStartTime && newStartTime < existingEndTime) || // New start time is within existing routine
        (newEndTime > existingStartTime && newEndTime <= existingEndTime) || // New end time is within existing routine
        (newStartTime <= existingStartTime && newEndTime >= existingEndTime) // New routine completely contains existing routine
      );
      
      if (hasTimeOverlap) {
        return true;
      }
    }
    
    return false;
  };

  // Handler functions
  const addRoutine = async (newRoutine) => {
    // Check for time conflicts
    const hasConflict = checkTimeConflicts(newRoutine, routines.filter(r => 
      r.id !== newRoutine.id && r.routine_id !== newRoutine.routine_id
    ));
    
    if (hasConflict) {
      // Alert the user about the conflict
      errorToast('This routine conflicts with another routine on the same day(s).');
      return; // Don't add the routine
    }
    
    try {
      // Ensure the data is formatted correctly for the backend
      const routineToSend = {
        title: newRoutine.title,
        start_time: newRoutine.start_time || newRoutine.startTime,
        end_time: newRoutine.end_time || newRoutine.endTime,
        category_id: newRoutine.category_id,
        priority_id: newRoutine.priority_id,
        days: newRoutine.days || newRoutine.daysOfWeek,
        status: newRoutine.status || 'pending'
      };
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/routines`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(routineToSend),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Add the new routine to the state
        setRoutines([...routines, data]);
        setShowAddForm(false);
        successToast('Routine created successfully!');
      } else {
        errorToast(data.message || 'Failed to create routine');
      }
    } catch (error) {
      console.error('Error creating routine:', error);
      errorToast('Failed to create routine. Please try again.');
    }
  };

  const editRoutine = (id) => {
    const routineToEdit = routines.find(r => r.id === id || r.routine_id === id);
    if (routineToEdit) {
      console.log("Editing routine:", routineToEdit);
      setEditingRoutineId(id);
      setIsEditMode(true);
      setShowAddForm(true);
    } else {
      console.error("Routine not found with ID:", id);
    }
  };

  const updateRoutine = async (routineId, updatedFields) => {
    try {
      console.log("Updating routine with ID:", routineId);
      console.log("Updated fields:", updatedFields);
      
      // Find the routine to update
      const routineToUpdate = routines.find(r => r.id === routineId || r.routine_id === routineId);
      console.log("Found routine to update:", routineToUpdate);
      if (!routineToUpdate) {
        console.error("Routine not found for update:", routineId);
        return;
      }
      
      // Create a normalized updated routine object
      const updatedRoutine = {
        ...routineToUpdate,
        ...updatedFields,
        id: routineToUpdate.id || routineToUpdate.routine_id,
        routine_id: routineToUpdate.routine_id || routineToUpdate.id,
        // Ensure proper format for times and days
        startTime: updatedFields.startTime || updatedFields.start_time,
        endTime: updatedFields.endTime || updatedFields.end_time,
        start_time: updatedFields.start_time || updatedFields.startTime,
        end_time: updatedFields.end_time || updatedFields.endTime,
        days: updatedFields.days || updatedFields.daysOfWeek,
        daysOfWeek: updatedFields.daysOfWeek || updatedFields.days,
      };
      
      // Check for time conflicts before proceeding
      if (checkTimeConflicts(updatedRoutine, routines.filter(r => 
        r.id !== routineId && r.routine_id !== routineId
      ))) {
        setError('This routine conflicts with another routine on the same day(s).');
        errorToast('This routine conflicts with another routine on the same day(s).');
        return;
      }
      
      // Make API call to update routine
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/routines/${updatedRoutine.routine_id || updatedRoutine.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedRoutine),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Failed to update routine: ${response.status}`);
      }
      
      // Parse the response
      const result = await response.json();
      console.log("Update result:", result);
      
      // Update state with the updated routine - create a consistent object format
      const normalizedResult = {
        ...result,
        id: result.routine_id || result.id,
        routine_id: result.routine_id || result.id,
        startTime: result.start_time || result.startTime,
        endTime: result.end_time || result.endTime,
        start_time: result.start_time || result.startTime,
        end_time: result.end_time || result.endTime,
        days: result.days || result.daysOfWeek,
        daysOfWeek: result.days || result.daysOfWeek,
        category: result.category,
        priority: result.priority
      };
      
      setRoutines(prevRoutines => 
        prevRoutines.map(routine => 
          (routine.id === routineId || routine.routine_id === routineId) ? 
          normalizedResult : routine
        )
      );
      
      // Reset form state
      setIsEditMode(false);
      setEditingRoutineId(null);
      setShowAddForm(false);
      
      successToast('Routine updated successfully!');
      
      return result;
    } catch (error) {
      console.error('Error updating routine:', error);
      // Fall back to local state update in development mode
      if (import.meta.env.DEV) {
        setRoutines(prevRoutines => 
          prevRoutines.map(routine => 
            (routine.id === routineId || routine.routine_id === routineId) ? 
            { 
              ...routine, 
              ...updatedFields,
              // Ensure consistent format
              startTime: updatedFields.startTime || updatedFields.start_time || routine.startTime || routine.start_time,
              endTime: updatedFields.endTime || updatedFields.end_time || routine.endTime || routine.end_time,
              start_time: updatedFields.start_time || updatedFields.startTime || routine.start_time || routine.startTime,
              end_time: updatedFields.end_time || updatedFields.endTime || routine.end_time || routine.endTime,
              days: updatedFields.days || updatedFields.daysOfWeek || routine.days || routine.daysOfWeek,
              daysOfWeek: updatedFields.daysOfWeek || updatedFields.days || routine.daysOfWeek || routine.days
            } : routine
          )
        );
        
        // Reset form state
        setIsEditMode(false);
        setEditingRoutineId(null);
        setShowAddForm(false);
        
        infoToast('Routine updated successfully! (offline mode)');
      } else {
        setError(error.message || 'Failed to update routine. Please try again.');
        errorToast(error.message || 'Failed to update routine. Please try again.');
      }
      
      throw error;
    }
  };

  const deleteRoutine = async (id) => {
    // Simple confirmation
    if (showConfirmDelete === id) {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/routines/${id}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });
        
        const data = await response.json();
        
        if (response.ok) {
          // Remove the deleted routine from state
          const updatedRoutines = routines.filter(r => r.id !== id && r.routine_id !== id);
          setRoutines(updatedRoutines);
          setFilteredRoutines(updatedRoutines);
          setShowConfirmDelete(null);
          successToast('Routine deleted successfully');
        } else {
          errorToast(data.message || 'Failed to delete routine');
        }
      } catch (error) {
        console.error('Error deleting routine:', error);
        errorToast('Failed to delete routine. Please try again.');
      }
    } else {
      setShowConfirmDelete(id);
    }
  };

  const markRoutineComplete = async (id, completed = true, dateStr = todayStr) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/routines/completion`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          routineId: id,
          completionDate: dateStr,
          completed: completed
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the routine completion status in state
        setRoutines(routines.map(routine => {
          if (routine.id === id || routine.routine_id === id) {
            // Remove existing entry for the date if any
            const filteredHistory = routine.completionData?.history?.filter(
              h => h.date !== dateStr
            ) || [];
    
            // Add new entry for the date
            const newHistory = [
              { date: dateStr, completed },
              ...filteredHistory
            ];
    
            // Calculate new streak if it's today's completion
            let streak = data.streak || routine.completionData?.streak || 0;
    
            // Calculate new completion rate
            const completionRate = data.completionRate || routine.completionData?.completionRate || 0;
    
            return {
              ...routine,
              // Update status field
              status: completed ? 'completed' : 'pending',
              completionData: {
                ...routine.completionData,
                streak,
                lastCompleted: completed ? dateStr : routine.completionData?.lastCompleted,
                completionRate,
                history: newHistory
              }
            };
          }
          return routine;
        }));
        
        completed ? 
          successToast('Routine marked as completed!') : 
          infoToast('Routine marked as incomplete');
      } else {
        errorToast(data.message || 'Failed to update routine completion');
      }
    } catch (error) {
      console.error('Error updating routine completion:', error);
      errorToast('Failed to update routine completion. Please try again.');
    }
  };

  const toggleRoutineActive = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/routines/${id}/toggle-active`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Update the routine active status in state
        setRoutines(routines.map(routine => {
          if (routine.id === id || routine.routine_id === id) {
            return {
              ...routine,
              active: data.active,
              status: data.status
            };
          }
          return routine;
        }));
        
        successToast(`Routine ${data.active ? 'activated' : 'deactivated'} successfully`);
      } else {
        errorToast(data.message || 'Failed to toggle routine active status');
      }
    } catch (error) {
      console.error('Error toggling routine active status:', error);
      errorToast('Failed to toggle routine active status. Please try again.');
    }
  };

  // Format time from 24h to 12h format
  const formatTime = (time24h) => {
    // Return a placeholder if time is not provided
    if (!time24h) return 'N/A';
    
    try {
      const [hours, minutes] = time24h.split(':').map(num => parseInt(num, 10));
      if (isNaN(hours) || isNaN(minutes)) return 'Invalid time';
      
      const period = hours >= 12 ? 'PM' : 'AM';
      const hours12 = hours % 12 || 12;
      return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch (error) {
      console.error('Error formatting time:', error, time24h);
      return 'Invalid time';
    }
  };

  // Get the routine being edited
  const routineToEdit = isEditMode ? routines.find(r => r.id === editingRoutineId || r.routine_id === editingRoutineId) : null;

  // Current active routines
  const currentRoutines = getCurrentRoutines();
  const upcomingRoutines = getUpcomingRoutines();
  const weeklySchedule = getWeeklySchedule();
  const timeSlots = getTimeSlots();

  // Display loading spinner when fetching routines
  if (loading) {
    return (
      <div className="px-6 py-6 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-[#4A2BAF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your routines...</p>
        </div>
      </div>
    );
  }

  // Display error message if there was an error fetching routines
  if (error) {
    return (
      <div className="px-6 py-6">
        <PageHeader
          title="Your Daily Routines"
          subtitle="Organize and track your schedule effectively"
        />
        <div className="bg-red-50 border border-red-200 rounded-md p-4 text-center">
          <div className="text-red-600 font-medium mb-2">Error</div>
          <p className="text-red-500">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-[#4A2BAF] text-white rounded-md hover:bg-[#3A1C9F]"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        <PageHeader
          title="Your Daily Routines"
          subtitle="Organize and track your schedule effectively"
        />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stats Panel */}
          <StatsPanel routines={routines} />

          {/* Now Section - Show what's happening now - Moved up */}
          <div className="mb-6">
            <div className="bg-white border border-gray-200 rounded-md p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                  <AlarmClock className="h-5 w-5 text-[#4A2BAF] mr-2" />
                  <span>Happening Now</span>
                </h3>
                <span className="text-sm text-gray-500">
                  {currentTime.toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: true
                  })}
                </span>
              </div>

              {currentRoutines.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  <p>No active routines at the moment</p>
                  <p className="text-sm text-gray-400 mt-1">
                    {upcomingRoutines.length > 0
                      ? `Next routine starts at ${formatTime(upcomingRoutines[0].startTime || upcomingRoutines[0].start_time)}`
                      : "No more routines scheduled for today"}
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {currentRoutines.map(routine => (
                    <div key={routine.id} className="flex items-center justify-between p-3 bg-[#4A2BAF]/5 border-l-4 border-[#4A2BAF] rounded-r-md">
                      <div>
                        <h4 className="font-medium text-gray-800">{routine.title}</h4>
                        <p className="text-sm text-gray-500">
                          {formatTime(routine.startTime || routine.start_time)} - {formatTime(routine.endTime || routine.end_time)}
                        </p>
                      </div>

                      <button
                        onClick={() => markRoutineComplete(routine.id, true)}
                        className={`px-3 py-1 ${routine.status === 'completed' ? 'bg-green-500' : 'bg-[#4A2BAF]'} text-white text-sm rounded-md hover:opacity-90 transition-colors flex items-center gap-1`}
                        disabled={routine.status === 'completed'}
                      >
                        {routine.status === 'completed' ? (
                          <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Completed
                          </>
                        ) : (
                          'Mark Complete'
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upcoming routines */}
              {upcomingRoutines.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Coming Up Next</h4>
                  <div className="space-y-2">
                    {upcomingRoutines.slice(0, 3).map(routine => (
                      <div key={routine.id} className="flex items-center justify-between p-2 border-l-2 border-gray-200 rounded-r-md pl-3">
                        <div>
                          <h5 className="font-medium text-gray-700">{routine.title}</h5>
                          <p className="text-xs text-gray-500">
                            {formatTime(routine.startTime || routine.start_time)} - {formatTime(routine.endTime || routine.end_time)}
                          </p>
                        </div>
                        <span className="text-xs text-gray-400">
                          {routine.startTime || routine.start_time ? 
                            `in ${Math.max(0, Math.round((new Date(`2000-01-01T${routine.startTime || routine.start_time}`) - new Date(`2000-01-01T${currentTime.toTimeString().substring(0, 5)}`)) / 60000))} min` 
                            : 'Time not set'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main section title with Add Routine button */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
            <h2 className="text-xl font-semibold text-gray-800">
              {viewMode === "timetable" ? "Weekly Schedule" : "All Routines"}
            </h2>

            {/* Add Routine Button moved to same line as title */}
            <button
              onClick={() => {
                setShowAddForm(true);
                setIsEditMode(false);
                setEditingRoutineId(null);
              }}
              className="flex items-center bg-[#4A2BAF] text-white px-4 py-2 rounded-md hover:bg-[#3A1C9F] transition-colors"
            >
              <PlusCircle className="h-5 w-5 mr-1" />
              <span>Add New Routine</span>
            </button>
          </div>

          {/* Search bar - only in list view */}
          {viewMode === "list" && (
            <FilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
            />
          )}

          {/* View Mode Tabs - Moved below search */}
          <div className="flex border-b border-gray-200 mb-4 mt-4 overflow-x-auto">
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${viewMode === "list"
                  ? "border-[#4A2BAF] text-[#4A2BAF]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <List className="h-4 w-4 mr-1" />
              List View
            </button>

            <button
              onClick={() => setViewMode("timetable")}
              className={`flex items-center px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${viewMode === "timetable"
                  ? "border-[#4A2BAF] text-[#4A2BAF]"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
            >
              <Clock className="h-4 w-4 mr-1" />
              Weekly Schedule
            </button>
          </div>

          {/* List View */}
          {viewMode === "list" && (
            <RoutineList
              routines={filteredRoutines}
              isEditMode={isEditMode}
              onEdit={editRoutine}
              onToggleActive={toggleRoutineActive}
              onDelete={(id) => setShowConfirmDelete(id)}
              onComplete={markRoutineComplete}
            />
          )}

          {/* Timetable View with improved calendar-style layout */}
          {viewMode === "timetable" && (
            <div className="bg-white border border-gray-200 rounded-md overflow-hidden shadow-sm">
              {/* Quick-jump time navigation */}
              <div className="px-4 py-2 border-b border-gray-200 flex items-center gap-2 overflow-x-auto bg-gray-50">
                <button 
                  onClick={() => {
                    const currentHourElement = document.getElementById(`hour-${currentTime.getHours().toString().padStart(2, '0')}`);
                    if (currentHourElement) {
                      currentHourElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                  }}
                  className="px-3 py-1.5 bg-[#4A2BAF] text-white text-xs rounded-md flex items-center gap-1.5 flex-shrink-0"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  Jump to Current Time
                </button>
                
                {/* Time period quick jumps */}
                <div className="flex items-center gap-1.5 text-xs text-gray-500 flex-shrink-0">
                  <span>Jump to:</span>
                </div>
                
                {[
                  { label: 'Morning', hours: '06-12', startHour: '06' },
                  { label: 'Afternoon', hours: '12-17', startHour: '12' },
                  { label: 'Evening', hours: '17-21', startHour: '17' },
                  { label: 'Night', hours: '21-00', startHour: '21' }
                ].map(period => (
                  <button 
                    key={period.hours}
                    onClick={() => {
                      const targetHourElement = document.getElementById(`hour-${period.startHour}`);
                      if (targetHourElement) {
                        targetHourElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                    className="px-2 py-1 rounded-md bg-gray-200 text-xs text-gray-700 hover:bg-gray-300 transition-colors flex-shrink-0"
                  >
                    {period.label} ({period.hours})
                  </button>
                ))}
              </div>
              
              <div className="overflow-x-auto overflow-y-auto max-h-[600px] relative">
                <div className="min-w-[900px] lg:w-full">
                  {/* Day headers - Sticky */}
                  <div className="grid grid-cols-8 border-b border-gray-200 sticky top-0 bg-white z-20">
                    <div className="py-3 px-3 text-center font-medium text-sm text-gray-600 border-r border-gray-200">
                      Time
                    </div>
                    {weeklySchedule.map(day => (
                      <div
                        key={day.day}
                        className={`py-3 px-1 text-center ${day.isToday ? 'bg-[#4A2BAF]/5' : ''}`}
                      >
                        <div className={`text-sm font-medium ${day.isToday ? 'text-[#4A2BAF]' : 'text-gray-800'}`}>
                          {day.day}
                        </div>
                        <div className={`text-xs ${day.isToday ? 'text-[#4A2BAF]' : 'text-gray-500'}`}>
                          {day.date.getDate()}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Time grid - One row per hour with routines positioned inside */}
                  <div className="relative">
                    {/* Create time slots for each hour */}
                    {Array.from({ length: 24 }).map((_, hourIndex) => {
                      const hour = hourIndex.toString().padStart(2, '0');
                      const timeStr = `${hour}:00`;
                      const isCurrentHour = currentTime.getHours() === hourIndex;
                      
                      return (
                        <div 
                          id={`hour-${hour}`}
                          key={`hour-${hour}`} 
                          className={`grid grid-cols-8 border-b border-gray-200 ${isCurrentHour ? 'bg-[#4A2BAF]/5' : hourIndex % 2 === 0 ? 'bg-gray-50' : ''}`}
                        >
                          {/* Time label */}
                          <div className="py-2 px-2 text-xs font-medium text-gray-600 border-r border-gray-200 h-24">
                            {formatTime(timeStr)}
                          </div>
                          
                          {/* Day columns */}
                          {weeklySchedule.map(day => (
                            <div 
                              key={`${day.day}-${hour}`} 
                              className={`relative h-24 ${day.isToday ? 'bg-[#4A2BAF]/5' : ''}`}
                            >
                            </div>
                          ))}
                        </div>
                      );
                    })}
                    
                    {/* Overlay routines on the grid */}
                    {weeklySchedule.map((day, dayIndex) => 
                      day.routines.map(routine => {
                        // Get start and end times in minutes since midnight
                        const startMinutes = getMinutesSinceMidnight(routine.startTime);
                        const endMinutes = getMinutesSinceMidnight(routine.endTime);
                        const durationMinutes = endMinutes - startMinutes;
                        
                        // Calculate position and height
                        const topPosition = (startMinutes / 60) * 96; // 24px per 15min
                        const heightValue = (durationMinutes / 60) * 96; // 24px per 15min
                        
                        // Position from left based on day index (add 1 to account for time column)
                        const leftPosition = `calc(${(dayIndex + 1) * 12.5}% + 4px)`;
                        const widthValue = `calc(12.5% - 8px)`;
                        
                        const isCompleted = routine.status === 'completed' || 
                          routine.completionData?.history?.some(
                            h => h.date === day.dateStr && h.completed
                          );
                        
                        const priorityColor = 
                          routine.priority === 'HIGH' || routine.priority === 'High' ? 'border-red-500' : 
                          routine.priority === 'MEDIUM' || routine.priority === 'Medium' ? 'border-yellow-500' : 
                          routine.priority === 'LOW' || routine.priority === 'Low' ? 'border-blue-500' : 
                          'border-gray-500';
                        
                        return (
                          <div
                            key={`${routine.id}-${day.day}`}
                            style={{
                              position: 'absolute',
                              top: `${topPosition}px`,
                              left: leftPosition,
                              height: `${heightValue}px`,
                              width: widthValue,
                              zIndex: 10
                            }}
                            className={`rounded-md p-2 flex flex-col shadow-sm overflow-hidden border-l-2 hover:shadow-md transition-shadow group ${
                              isCompleted
                                ? 'bg-green-100 border-green-500'
                                : `bg-[#4A2BAF]/10 ${priorityColor}`
                            }`}
                            onClick={() => editRoutine(routine.id)}
                          >
                            <div className="font-medium text-xs truncate">{routine.title}</div>
                            <div className="text-gray-600 text-[10px] mt-auto truncate">
                              {formatTime(routine.startTime || routine.start_time)} - {formatTime(routine.endTime || routine.end_time)}
                            </div>
                            
                            {/* Detailed tooltip on hover */}
                            <div className="absolute invisible group-hover:visible bg-white p-2 rounded-md shadow-lg border border-gray-200 left-full ml-2 top-0 w-48 z-30 text-xs">
                              <div className="font-bold text-gray-800">{routine.title}</div>
                              <div className="mt-1 text-gray-600">
                                <div>{formatTime(routine.startTime || routine.start_time)} - {formatTime(routine.endTime || routine.end_time)}</div>
                                <div className="mt-1">
                                  <span className="font-semibold">Category:</span> {routine.category}
                                </div>
                                <div>
                                  <span className="font-semibold">Priority:</span> {routine.priority}
                                </div>
                                <div>
                                  <span className="font-semibold">Status:</span> {routine.status === 'completed' ? 'Completed' : 'Pending'}
                                </div>
                                {routine.description && (
                                  <div className="mt-1 border-t border-gray-100 pt-1">
                                    {routine.description}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                    
                    {/* Current time indicator */}
                    <div 
                      style={{
                        position: 'absolute',
                        top: `${(currentTime.getHours() * 60 + currentTime.getMinutes()) / 60 * 96}px`,
                        left: 0,
                        right: 0,
                        height: '2px',
                        backgroundColor: 'red',
                        zIndex: 20
                      }}
                    >
                      <div 
                        className="w-3 h-3 rounded-full bg-red-500 absolute -left-1 -top-1.5"
                        style={{ boxShadow: '0 0 0 2px white' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Legend */}
              <div className="flex flex-wrap items-center gap-4 py-2 px-4 border-t border-gray-200 mt-2">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#4A2BAF]/10 border-l-2 border-red-500 rounded"></div>
                  <span className="text-xs text-gray-600">High Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#4A2BAF]/10 border-l-2 border-yellow-500 rounded"></div>
                  <span className="text-xs text-gray-600">Medium Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#4A2BAF]/10 border-l-2 border-blue-500 rounded"></div>
                  <span className="text-xs text-gray-600">Low Priority</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-l-2 border-green-500 rounded"></div>
                  <span className="text-xs text-gray-600">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-xs text-gray-600">Current Time</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 sm:mt-0 ml-auto">
                  <span>Hover for details · Click to edit</span>
                </div>
              </div>
            </div>
          )}

          {/* Add/Edit Form Modal with close button and scrollable content */}
          {showAddForm && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center p-4 border-b">
                  <h2 className="text-xl font-bold text-[#4A2BAF]">
                    {isEditMode ? "Edit Routine" : "Add New Routine"}
                  </h2>
                  <button
                    onClick={() => {
                      setShowAddForm(false);
                      setIsEditMode(false);
                      setEditingRoutineId(null);
                      setError(''); // Clear any errors
                    }}
                    className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="p-6 overflow-y-auto">
                  {/* Force a complete remount of the form component each time to avoid state issues */}
                  <RoutineForm
                    key={`form-${isEditMode ? (editingRoutineId || 'edit') : 'new'}-${Date.now()}`}
                    isEdit={isEditMode}
                    initialValues={routineToEdit}
                    onSubmit={(routineData) => {
                      if (isEditMode) {
                        updateRoutine(routineData.id || routineData.routine_id, routineData);
                      } else {
                        addRoutine(routineData);
                      }
                    }}
                    onCancel={() => {
                      setShowAddForm(false);
                      setIsEditMode(false);
                      setEditingRoutineId(null);
                      setError(''); // Clear any errors
                    }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Confirm Delete Modal */}
          {showConfirmDelete && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
                <h3 className="text-lg font-bold mb-2">Delete Routine</h3>
                <p className="mb-4 text-gray-600">
                  Are you sure you want to delete this routine? This action cannot be undone.
                </p>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setShowConfirmDelete(null)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      deleteRoutine(showConfirmDelete);
                      setShowConfirmDelete(null);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Routines; 