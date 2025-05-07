import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiPause, FiPlay, FiSquare, FiX, FiMove } from 'react-icons/fi';

const TaskTimer = ({ taskId, tasks, onClose }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for drag functionality
  const timerRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  
  // Get the task data from the tasks array
  const task = tasks.find(t => t.id === taskId);
  const taskTitle = task?.title || task?.name || "Task";

  // Ref for interval to prevent memory leaks
  const timerIntervalRef = useRef(null);

  // Initialize timer when component mounts
  useEffect(() => {
    const initializeTimer = () => {
      if (!taskId) return;
      
      // Check if there's a stored session for this task
      const savedSession = localStorage.getItem(`task_session_${taskId}`);
      
      if (savedSession) {
        try {
          const session = JSON.parse(savedSession);
          setSessionId(session.sessionId);
          setStartTime(session.startTime);
          setIsRunning(session.isRunning !== undefined ? session.isRunning : true);
          
          // Calculate elapsed time from session start
          const currentTime = new Date().getTime();
          const elapsedSeconds = Math.floor((currentTime - session.startTime) / 1000);
          setElapsed(elapsedSeconds);
          
          // Restore position if saved
          if (session.position) {
            setPosition(session.position);
          }
        } catch (error) {
          console.error('Error parsing saved session:', error);
          // Create a new session as fallback
          const currentTime = new Date().getTime();
          setStartTime(currentTime);
          setElapsed(0);
        }
      } else {
        // Create a new session in local state only
        // The actual session creation happens in the Tasks.jsx startTimer function
        const currentTime = new Date().getTime();
        setStartTime(currentTime);
        setElapsed(0);
      }
    };
    
    initializeTimer();
    
    // Register beforeunload event to save timer state
    window.addEventListener('beforeunload', saveTimerState);
    
    return () => {
      window.removeEventListener('beforeunload', saveTimerState);
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [taskId]);

  // Update timer every second when running
  useEffect(() => {
    // Clear existing interval first
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    
    if (isRunning) {
      timerIntervalRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
      
      // Update session running state
      updateSessionRunningState(true);
    }
    
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current);
      }
    };
  }, [isRunning, taskId]);

  // Setup drag handlers
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      
      const newX = e.clientX - dragStartOffset.current.x;
      const newY = e.clientY - dragStartOffset.current.y;
      
      setPosition({ x: newX, y: newY });
    };
    
    const handleMouseUp = () => {
      if (!isDragging) return;
      
      setIsDragging(false);
      savePosition();
      
      // Remove global event listeners
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  const updateSessionRunningState = (runningState) => {
    try {
      const savedSession = localStorage.getItem(`task_session_${taskId}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        session.isRunning = runningState;
        session.position = position; // Save current position
        localStorage.setItem(`task_session_${taskId}`, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error updating session running state:', error);
    }
  };

  const toggleTimer = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);
    
    // Update session with new running state
    updateSessionRunningState(newIsRunning);
  };

  const resetTimer = () => {
    setElapsed(0);
    setIsRunning(false);
    
    // Update the existing session state but don't create a new one
    updateSessionRunningState(false);
    // We don't reset the startTime because that would change the actual session duration
    // This is just a UI reset, not a session reset
  };
  
  const saveTimerState = () => {
    // Save current timer state before page unload
    if (taskId && startTime) {
      try {
        const sessionData = {
          sessionId,
          taskId,
          startTime,
          isRunning,
          position
        };
        
        localStorage.setItem(`task_session_${taskId}`, JSON.stringify(sessionData));
      } catch (error) {
        console.error('Error saving timer state:', error);
      }
    }
  };
  
  const handleClose = async () => {
    // End the session and update the task's time spent
    if (!taskId) {
      onClose();
      return;
    }
    
    try {
      setIsSaving(true);
      setError(null);
      
      const endTime = new Date().getTime();
      const totalSeconds = Math.floor((endTime - startTime) / 1000);
      
      const sessionData = {
        sessionId,
        taskId,
        startTime,
        endTime,
        duration: totalSeconds
      };
      
      console.log('Session ended:', sessionData);
      
      // Get the token for authorization
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authorization token not found');
      }
      
      // If we have a sessionId from the backend
      if (sessionId) {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/Tasks/endSession`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ 
            sessionId,
            taskId
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to end timer session: ${response.status}`);
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
            taskId, 
            duration 
          })
        });
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Failed to end timer session: ${response.status}`);
        }
      }
      
      // Clear the local storage session
      localStorage.removeItem(`task_session_${taskId}`);
      
      // Call the onClose handler from parent component
      onClose();
    } catch (error) {
      console.error('Error ending session:', error);
      setError(error.message || 'Failed to end timer session');
      // Don't call onClose, let the user retry
    } finally {
      setIsSaving(false);
    }
  };

  const formatTime = () => {
    const hours = Math.floor(elapsed / 3600);
    const minutes = Math.floor((elapsed % 3600) / 60);
    const seconds = elapsed % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Handle drag start
  const handleMouseDown = (e) => {
    setIsDragging(true);
    
    // Record the starting mouse position
    dragStartPos.current = { x: e.clientX, y: e.clientY };
    
    // Calculate the offset from the mouse position to the timer's top-left corner
    const timerRect = timerRef.current.getBoundingClientRect();
    dragStartOffset.current = {
      x: e.clientX - timerRect.left,
      y: e.clientY - timerRect.top
    };
    
    // Prevent text selection during drag
    e.preventDefault();
  };
  
  // Save position to localStorage
  const savePosition = () => {
    try {
      const savedSession = localStorage.getItem(`task_session_${taskId}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        session.position = position;
        localStorage.setItem(`task_session_${taskId}`, JSON.stringify(session));
      }
    } catch (error) {
      console.error('Error saving position:', error);
    }
  };

  if (!task) {
    return null;
  }

  return (
    <div 
      ref={timerRef}
      className="fixed bg-white rounded-xl shadow-lg overflow-hidden w-72 z-50"
      style={{
        bottom: 'auto',
        right: 'auto',
        top: position.y,
        left: position.x,
        cursor: isDragging ? 'grabbing' : 'grab',
        transition: isDragging ? 'none' : 'opacity 0.3s ease'
      }}
    >
      <div 
        className={`flex items-center justify-between p-3 ${isDragging ? 'bg-purple-100' : 'bg-gray-100'}`}
        onMouseDown={handleMouseDown}
      >
        <div className="flex items-center cursor-grab active:cursor-grabbing">
          <FiMove className="mr-2 text-gray-500" />
          <FiClock className="mr-2 text-gray-700" />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700 truncate max-w-[180px]">
              {taskTitle}
            </span>
            <span className="text-xs text-gray-500">
              {task?.category || "Task"}
            </span>
          </div>
        </div>
        <button 
          onClick={handleClose} 
          disabled={isSaving}
          className="text-gray-500 hover:text-gray-700 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          <FiX />
        </button>
      </div>
      
      {error && (
        <div className="p-2 bg-red-50 text-red-600 text-xs">
          <p>{error}</p>
          <button 
            onClick={() => setError(null)}
            className="underline text-red-700 text-xs mt-1"
          >
            Dismiss
          </button>
        </div>
      )}
      
      <div className="p-4 flex flex-col items-center">
        <div className="text-3xl font-bold mb-4">{formatTime()}</div>
        <div className="flex space-x-2">
          <button 
            onClick={toggleTimer}
            disabled={isSaving}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            {isRunning ? <FiPause /> : <FiPlay />}
          </button>
          <button 
            onClick={resetTimer}
            disabled={isSaving}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-gray-700 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
          >
            <FiSquare />
          </button>
          <button 
            onClick={handleClose}
            disabled={isSaving}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center disabled:bg-red-300 disabled:cursor-not-allowed"
          >
            {isSaving ? (
              <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              "End"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskTimer; 