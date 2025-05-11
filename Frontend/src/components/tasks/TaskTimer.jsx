import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiClock, FiPause, FiPlay, FiSquare, FiX, FiMove, FiMinimize2, FiMaximize2, FiCheck } from 'react-icons/fi';

const TaskTimer = ({ taskId, tasks, onClose }) => {
  const [isRunning, setIsRunning] = useState(true);
  const [elapsed, setElapsed] = useState(0);
  const [sessionId, setSessionId] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [position, setPosition] = useState({ x: 20, y: 20 });
  const [isDragging, setIsDragging] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [windowHeight, setWindowHeight] = useState(window.innerHeight);
  const [isHovered, setIsHovered] = useState(false);
  
  // Refs for drag functionality
  const timerRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const dragStartOffset = useRef({ x: 0, y: 0 });
  
  // Get the task data from the tasks array
  const task = tasks.find(t => t.id === taskId);
  const taskTitle = task?.title || task?.name || "Task";

  // Ref for interval to prevent memory leaks
  const timerIntervalRef = useRef(null);

  // Track window resize for responsive positioning
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      setWindowHeight(window.innerHeight);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
          
          // Restore minimized state if saved
          if (session.isMinimized !== undefined) {
            setIsMinimized(session.isMinimized);
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
      updateSessionState({ isRunning: true });
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
      
      // Ensure timer stays visible on screen
      const maxX = window.innerWidth - 100;
      const maxY = window.innerHeight - 100;
      const boundedX = Math.max(0, Math.min(newX, maxX));
      const boundedY = Math.max(0, Math.min(newY, maxY));
      
      setPosition({ x: boundedX, y: boundedY });
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

  const updateSessionState = (updates) => {
    try {
      const savedSession = localStorage.getItem(`task_session_${taskId}`);
      if (savedSession) {
        const session = JSON.parse(savedSession);
        const updatedSession = { ...session, ...updates };
        localStorage.setItem(`task_session_${taskId}`, JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error('Error updating session state:', error);
    }
  };

  const toggleTimer = () => {
    const newIsRunning = !isRunning;
    setIsRunning(newIsRunning);
    
    // Update session with new running state
    updateSessionState({ isRunning: newIsRunning });
  };

  const resetTimer = () => {
    setElapsed(0);
    setIsRunning(false);
    
    // Update the existing session state but don't create a new one
    updateSessionState({ isRunning: false });
    // We don't reset the startTime because that would change the actual session duration
    // This is just a UI reset, not a session reset
  };
  
  const toggleMinimize = () => {
    const newMinimizedState = !isMinimized;
    setIsMinimized(newMinimizedState);
    updateSessionState({ isMinimized: newMinimizedState });
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
          position,
          isMinimized
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
      
      // Clean up local storage
      localStorage.removeItem(`task_session_${taskId}`);
      
      // Call the onClose callback to update parent components
      onClose();
    } catch (error) {
      console.error('Error ending timer session:', error);
      setError(error.message || 'Failed to end timer session');
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
  
  const handleMouseDown = (e) => {
    if (isMinimized) return;
    
    // Calculate the offset from the mouse position to the timer's top-left corner
    const timerRect = timerRef.current.getBoundingClientRect();
    dragStartOffset.current = {
      x: e.clientX - timerRect.left,
      y: e.clientY - timerRect.top
    };
    
    dragStartPos.current = { ...position };
    setIsDragging(true);
  };
  
  const savePosition = () => {
    updateSessionState({ position });
  };

  // Calculate proper position for minimized timer to ensure it's visible
  const safeTop = Math.max(20, Math.min(position.y, windowHeight - 80));
  
  // Render different UI based on minimized state
  if (isMinimized) {
    return (
      <motion.div
        className="fixed z-50" 
        style={{ top: safeTop, right: 0 }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div 
          className="flex items-center bg-[#4A2BAF] text-white px-3 py-2 rounded-l-lg shadow-lg cursor-pointer"
          initial={{ x: 60 }}
          animate={{ x: isHovered ? 0 : 40 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <div className="flex items-center" onClick={toggleMinimize}>
            <FiClock className="text-white mr-2" size={18} />
            <span className="font-medium whitespace-nowrap">{formatTime()}</span>
          </div>
          <button
            onClick={toggleMinimize}
            className="ml-3 p-1 hover:bg-white/20 rounded flex items-center justify-center"
            title="Maximize timer"
          >
            <FiMaximize2 size={14} />
          </button>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      ref={timerRef}
      className="fixed z-50"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-64">
        <div 
          className="bg-[#4A2BAF] text-white px-4 py-2 rounded-t-xl flex items-center justify-between cursor-move"
          onMouseDown={handleMouseDown}
        >
          <div className="flex items-center">
            <FiClock className="mr-2" />
            <span className="font-medium">Task Timer</span>
          </div>
          <div className="flex items-center space-x-1">
            <button 
              onClick={toggleMinimize}
              className="p-1 hover:bg-white/20 rounded"
              title="Minimize timer"
            >
              <FiMinimize2 size={14} />
            </button>
            <button 
              onClick={handleClose}
              className="p-1 hover:bg-white/20 rounded"
              disabled={isSaving}
              title="Close timer"
            >
              <FiX size={16} />
            </button>
          </div>
        </div>
        
        <div className="p-4">
          <div className="mb-3">
            <h3 className="text-sm font-medium text-gray-600 mb-1">Task:</h3>
            <p className="text-gray-800 font-medium truncate">{taskTitle}</p>
          </div>
          
          <div className="bg-gray-100 p-3 rounded-lg mb-4 text-center">
            <span className="text-2xl font-bold text-[#4A2BAF]">{formatTime()}</span>
          </div>
          
          <div className="flex justify-between mb-1">
            <button
              onClick={toggleTimer}
              className={`flex-1 flex items-center justify-center py-2 rounded-md mr-2 ${
                isRunning 
                  ? 'bg-orange-100 text-orange-700 hover:bg-orange-200' 
                  : 'bg-green-100 text-green-700 hover:bg-green-200'
              }`}
              disabled={isSaving}
            >
              {isRunning ? <FiPause className="mr-1" /> : <FiPlay className="mr-1" />}
              {isRunning ? 'Pause' : 'Resume'}
            </button>
            
            <button
              onClick={resetTimer}
              className="flex-1 flex items-center justify-center py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              disabled={isSaving || elapsed === 0}
            >
              <FiSquare className="mr-1" />
              Reset
            </button>
          </div>
          
          <button
            onClick={handleClose}
            className="w-full mt-2 flex items-center justify-center py-2 bg-[#4A2BAF] text-white rounded-md hover:bg-[#3A1C9F] disabled:bg-gray-400"
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                Saving...
              </>
            ) : (
              <>
                <FiCheck className="mr-1" />
                Done
              </>
            )}
          </button>
          
          {error && (
            <div className="mt-2 text-xs text-red-600">
              {error}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskTimer; 