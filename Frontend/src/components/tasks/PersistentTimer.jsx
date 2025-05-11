import React, { useState, useEffect } from 'react';
import { useTimer } from '../../context/TimerContext';
import TaskTimer from './TaskTimer';

const PersistentTimer = () => {
  const { activeTimer, tasks, closeTimer } = useTimer();
  const [currentTasks, setCurrentTasks] = useState([]);

  // Ensure we have valid tasks to pass to the TaskTimer component
  useEffect(() => {
    if (tasks && tasks.length > 0) {
      const validTasks = tasks.filter(task => task && task.id);
      setCurrentTasks(validTasks);
    }
  }, [tasks]);

  if (!activeTimer) {
    return null;
  }

  // If no valid tasks, don't render the timer
  if (currentTasks.length === 0) {
    return null;
  }
  
  return (
    <TaskTimer
      taskId={activeTimer}
      tasks={currentTasks}
      onClose={closeTimer}
    />
  );
};

export default PersistentTimer; 