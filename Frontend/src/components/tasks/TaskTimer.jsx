import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiPause, FiPlay, FiSquare, FiX } from 'react-icons/fi';

const TaskTimer = ({ task, onClose }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);

  // Initialize timer when component mounts
  useEffect(() => {
    const initializeTimer = () => {
      // Check if there's a stored session for this task
      const savedSession = localStorage.getItem(`task_session_${task.id}`);
      
      if (savedSession) {
        const session = JSON.parse(savedSession);
        setSessionId(session.sessionId);
        setStartTime(session.startTime);
        setIsRunning(session.isRunning !== undefined ? session.isRunning : true);
        
        // Calculate elapsed time from session start
        const currentTime = new Date().getTime();
        const elapsedSeconds = Math.floor((currentTime - session.startTime) / 1000);
        setElapsed(elapsedSeconds);
      } else {
        // Create a new session in local state only
        // The actual session creation happens in the Tasks.jsx startTimer function
        const currentTime = new Date().getTime();
        setStartTime(currentTime);
        
        // Don't set sessionId here as it should come from the backend via Tasks.jsx
      }
    };
    
    initializeTimer();
    
    // Register beforeunload event to save timer state
    window.addEventListener('beforeunload', saveTimerState);
    
    return () => {
      window.removeEventListener('beforeunload', saveTimerState);
    };
  }, [task.id]);

  // Update timer every second when running
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
      
      // Update session running state
      const savedSession = localStorage.getItem(`task_session_${task.id}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        session.isRunning = true;
        localStorage.setItem(`task_session_${task.id}`, JSON.stringify(session));
      }
    }
    
    return () => clearInterval(interval);
  }, [isRunning, task.id]);

  const toggleTimer = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);
    
    // Update session with new running state
    const savedSession = localStorage.getItem(`task_session_${task.id}`);
    if (savedSession) {
      const session = JSON.parse(savedSession);
      session.isRunning = newIsRunning;
      localStorage.setItem(`task_session_${task.id}`, JSON.stringify(session));
    }
  };

  const resetTimer = () => {
    setElapsed(0);
    setIsRunning(false);
    
    // Update the existing session state but don't create a new one
    const savedSession = localStorage.getItem(`task_session_${task.id}`);
    if (savedSession) {
      const session = JSON.parse(savedSession);
      session.isRunning = false;
      localStorage.setItem(`task_session_${task.id}`, JSON.stringify(session));
    }
    // We don't reset the startTime because that would change the actual session duration
  };
  
  const saveTimerState = () => {
    // Save current timer state before page unload
    if (sessionId && startTime) {
      const sessionData = {
        sessionId,
        taskId: task.id,
        startTime,
        isRunning
      };
      
      localStorage.setItem(`task_session_${task.id}`, JSON.stringify(sessionData));
    }
  };
  
  const handleClose = async () => {
    // End the session and update the task's time spent
    if (sessionId) {
      const endTime = new Date().getTime();
      const totalSeconds = Math.floor((endTime - startTime) / 1000);
      
      const sessionData = {
        sessionId,
        taskId: task.id,
        startTime,
        endTime,
        duration: totalSeconds
      };
      
      console.log('Session ended:', sessionData);
      
      try {
        // Send the session data to the backend
        const token = localStorage.getItem('token');
        
        // If we have a sessionId from the backend
        if (typeof sessionId === 'number') {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/endSession`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              sessionId,
              taskId: task.id
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to end timer session');
          }
          
          await response.json();
        } else {
          // If we don't have a proper sessionId (e.g., local fallback)
          const hours = Math.floor(totalSeconds / 3600);
          const minutes = Math.floor((totalSeconds % 3600) / 60);
          const duration = `${hours}h ${minutes}m`;
          
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/endSession`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              taskId: task.id, 
              duration 
            })
          });
          
          if (!response.ok) {
            throw new Error('Failed to end timer session');
          }
        }
      } catch (error) {
        console.error('Error ending session:', error);
      }
      
      // Clear the local storage session
      localStorage.removeItem(`task_session_${task.id}`);
    }
    
    onClose();
  };

  const formatTime = () => {
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <motion.div 
      className="fixed bottom-6 right-6 bg-white rounded-xl shadow-lg overflow-hidden w-64"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between bg-gray-100 p-3">
        <div className="flex items-center">
          <FiClock className="mr-2 text-gray-700" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
            Timer: {task?.title}
          </span>
        </div>
        <button onClick={handleClose} className="text-gray-500 hover:text-gray-700">
          <FiX />
        </button>
      </div>
      <div className="p-4 flex flex-col items-center">
        <div className="text-3xl font-bold mb-4">{formatTime()}</div>
        <div className="flex space-x-2">
          <button 
            onClick={toggleTimer}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            {isRunning ? <FiPause /> : <FiPlay />}
          </button>
          <button 
            onClick={resetTimer}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700"
          >
            <FiSquare />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default TaskTimer; 