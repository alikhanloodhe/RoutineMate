import React, { createContext, useState, useContext, useEffect } from 'react';

const TimerContext = createContext();

export const useTimer = () => useContext(TimerContext);

export const TimerProvider = ({ children }) => {
  const [activeTimer, setActiveTimer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isUpdatingTasks, setIsUpdatingTasks] = useState(false);

  // Load tasks and check for active timers on initial load
  useEffect(() => {
    const fetchTasks = async () => {
      // Prevent multiple simultaneous fetches
      if (isUpdatingTasks) return;
      
      try {
        setIsUpdatingTasks(true);
        const token = localStorage.getItem('token');
        if (!token) {
          setIsUpdatingTasks(false);
          return;
        }
        
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/fetchTasks`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          setIsUpdatingTasks(false);
          return;
        }
        
        const data = await response.json();
        setTasks(data);
        
        // Check for any active sessions
        checkForActiveSessions(data);
      } catch (error) {
        console.error('Error fetching tasks in Timer context:', error);
      } finally {
        setIsUpdatingTasks(false);
      }
    };

    fetchTasks();
  }, []);

  // Check localStorage for any active timer sessions
  const checkForActiveSessions = (taskList) => {
    for (const task of taskList) {
      const savedSession = localStorage.getItem(`task_session_${task.id}`);
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          if (session.isRunning) {
            setActiveTimer(task.id);
            break;
          }
        } catch (error) {
          console.error('Error parsing saved session:', error);
        }
      }
    }
  };

  // Start timer for a task
  const startTimer = async (taskId) => {
    // If there's already a timer running, close it first
    if (activeTimer && activeTimer !== taskId) {
      await closeTimer();
    }
    
    try {
      const token = localStorage.getItem('token');
      
      // Start a new session in the backend
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/startSession`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId })
      });
      
      const data = await response.json();
      
      // Store session info in localStorage
      let sessionInfo = {
        taskId,
        startTime: new Date().getTime(),
        isRunning: true
      };
      
      // Check the response structure and extract session_id safely
      if (data && data.sessionData) {
        sessionInfo.sessionId = data.sessionData.session_id;
        if (data.sessionData.start_time) {
          sessionInfo.startTime = new Date(data.sessionData.start_time).getTime();
        }
      }
      
      localStorage.setItem(`task_session_${taskId}`, JSON.stringify(sessionInfo));
      setActiveTimer(taskId);
      
    } catch (error) {
      console.error('Error starting timer:', error);
      
      // Fallback to local timer if backend fails
      const sessionInfo = {
        sessionId: null,
        startTime: new Date().getTime(),
        taskId,
        isRunning: true
      };
      
      localStorage.setItem(`task_session_${taskId}`, JSON.stringify(sessionInfo));
      setActiveTimer(taskId);
    }
  };

  // Close the active timer
  const closeTimer = async () => {
    if (!activeTimer) return Promise.resolve();
    
    const savedSession = localStorage.getItem(`task_session_${activeTimer}`);
    if (!savedSession) {
      setActiveTimer(null);
      return Promise.resolve();
    }
    
    try {
      const session = JSON.parse(savedSession);
      const endTime = new Date().getTime();
      const totalSeconds = Math.floor((endTime - session.startTime) / 1000);
      
      if (totalSeconds <= 0) {
        localStorage.removeItem(`task_session_${activeTimer}`);
        setActiveTimer(null);
        return Promise.resolve();
      }
      
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const duration = `${hours}h ${minutes}m`;
      
      try {
        const token = localStorage.getItem('token');
        let response;
        
        if (session.sessionId) {
          response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/endSession`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ sessionId: session.sessionId })
          });
        } else {
          response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/endSession`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              taskId: activeTimer, 
              duration 
            })
          });
        }
        
        // Refresh tasks after successful timer close, but avoid infinite loop
        if (response.ok) {
          const updatedResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/fetchTasks`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (updatedResponse.ok) {
            const updatedTasks = await updatedResponse.json();
            setTasks(updatedTasks);
          }
        }
        
      } catch (error) {
        console.error('Error ending timer session:', error);
      }
      
      localStorage.removeItem(`task_session_${activeTimer}`);
    } catch (error) {
      console.error('Error processing session:', error);
      localStorage.removeItem(`task_session_${activeTimer}`);
    }
    
    setActiveTimer(null);
    return Promise.resolve();
  };

  // Update tasks when data changes
  // shouldFetch parameter controls whether to trigger a fetch (defaults to false to prevent loops)
  const updateTasks = (newTasks, shouldFetch = false) => {
    setTasks(newTasks);
    
    // If shouldFetch is true and we're not already updating, fetch tasks
    if (shouldFetch && !isUpdatingTasks) {
      fetchLatestTasks();
    }
  };
  
  // Separate function to fetch latest tasks
  const fetchLatestTasks = async () => {
    if (isUpdatingTasks) return;
    
    try {
      setIsUpdatingTasks(true);
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/fetchTasks`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setTasks(data);
      }
    } catch (error) {
      console.error('Error fetching latest tasks:', error);
    } finally {
      setIsUpdatingTasks(false);
    }
  };

  const value = {
    activeTimer,
    tasks,
    startTimer,
    closeTimer,
    updateTasks
  };

  return (
    <TimerContext.Provider value={value}>
      {children}
    </TimerContext.Provider>
  );
};

export default TimerContext; 