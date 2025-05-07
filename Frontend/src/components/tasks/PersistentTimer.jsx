import React from 'react';
import { useTimer } from '../../context/TimerContext';
import TaskTimer from './TaskTimer';

const PersistentTimer = () => {
  const { activeTimer, tasks, closeTimer } = useTimer();

  if (!activeTimer) {
    return null;
  }

  // Filter out tasks that don't exist
  const validTasks = tasks.filter(task => task && task.id);
  
  return (
    <TaskTimer
      taskId={activeTimer}
      tasks={validTasks}
      onClose={closeTimer}
    />
  );
};

export default PersistentTimer; 