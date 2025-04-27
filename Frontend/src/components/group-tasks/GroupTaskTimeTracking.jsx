import React, { useState, useEffect } from 'react';
import { FiPlay, FiPause, FiTrash2, FiEdit2, FiSave, FiX } from 'react-icons/fi';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * GroupTaskTimeTracking component for tracking time spent on group tasks
 * 
 * @param {Object} props
 * @param {Object} props.task - The group task object
 * @param {Array} props.assignees - Array of assignee objects
 * @param {number} props.currentUserId - ID of the current user
 * @param {Function} props.onClose - Function to call when the component is closed
 */
const GroupTaskTimeTracking = ({ 
  task, 
  assignees = [], 
  currentUserId = 1, // Default for testing
  onClose 
}) => {
  // State for time logs
  const [timeLogs, setTimeLogs] = useState([
    // Example data format
    {
      id: 1,
      taskId: task.id,
      userId: 1,
      startTime: '2023-07-18T09:00:00Z',
      endTime: '2023-07-18T10:30:00Z',
      duration: 5400 // seconds
    },
    {
      id: 2,
      taskId: task.id,
      userId: 2,
      startTime: '2023-07-19T14:00:00Z',
      endTime: '2023-07-19T16:00:00Z',
      duration: 7200 // seconds
    }
  ]);

  // State for active timer
  const [activeTimer, setActiveTimer] = useState(null);
  const [timer, setTimer] = useState(0);
  const [editingLogId, setEditingLogId] = useState(null);
  const [editHours, setEditHours] = useState('');
  const [editMinutes, setEditMinutes] = useState('');

  // Timer effect
  useEffect(() => {
    let interval;
    if (activeTimer) {
      interval = setInterval(() => {
        setTimer(prevTimer => prevTimer + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTimer]);

  // Start a timer for the current user
  const startTimer = () => {
    setActiveTimer({
      userId: currentUserId,
      startTime: new Date().toISOString()
    });
    setTimer(0);
  };

  // Stop the active timer and save the time log
  const stopTimer = () => {
    if (!activeTimer) return;
    
    const now = new Date();
    const newLog = {
      id: Date.now(), // Temporary ID
      taskId: task.id,
      userId: activeTimer.userId,
      startTime: activeTimer.startTime,
      endTime: now.toISOString(),
      duration: timer
    };
    
    setTimeLogs([...timeLogs, newLog]);
    setActiveTimer(null);
    setTimer(0);
  };

  // Get total time logged for a user
  const getTotalTimeForUser = (userId) => {
    return timeLogs
      .filter(log => log.userId === userId)
      .reduce((total, log) => total + log.duration, 0);
  };

  // Format seconds into HH:MM:SS
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format duration for display (e.g., "2h 30m")
  const formatDuration = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hrs > 0 ? `${hrs}h ` : ''}${mins}m`;
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get user name by ID
  const getUserName = (userId) => {
    const user = assignees.find(a => a.id === userId);
    return user ? user.name : 'Unknown User';
  };

  // Start editing a time log
  const startEditing = (log) => {
    const hours = Math.floor(log.duration / 3600);
    const minutes = Math.floor((log.duration % 3600) / 60);
    
    setEditingLogId(log.id);
    setEditHours(hours.toString());
    setEditMinutes(minutes.toString());
  };

  // Save edited time log
  const saveEditedLog = (logId) => {
    const hours = parseInt(editHours) || 0;
    const minutes = parseInt(editMinutes) || 0;
    const newDuration = (hours * 3600) + (minutes * 60);
    
    setTimeLogs(timeLogs.map(log => 
      log.id === logId 
        ? { ...log, duration: newDuration } 
        : log
    ));
    
    setEditingLogId(null);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingLogId(null);
  };

  // Delete a time log
  const deleteLog = (logId) => {
    setTimeLogs(timeLogs.filter(log => log.id !== logId));
    if (editingLogId === logId) {
      setEditingLogId(null);
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Time Tracking</h2>
        <Button variant="text" size="sm" onClick={onClose}>
          <FiX className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
              {task.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Track time spent on this task
            </p>
          </div>
          
          {activeTimer ? (
            <div className="flex items-center">
              <div className="text-xl font-mono mr-3 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded">
                {formatTime(timer)}
              </div>
              <Button 
                variant="danger" 
                onClick={stopTimer}
              >
                <FiPause className="mr-1" />
                Stop
              </Button>
            </div>
          ) : (
            <Button 
              variant="primary" 
              onClick={startTimer}
            >
              <FiPlay className="mr-1" />
              Start Timer
            </Button>
          )}
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Duration
                </th>
                <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
              {timeLogs.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8">
                        {assignees.find(a => a.id === log.userId)?.avatar ? (
                          <img 
                            className="h-8 w-8 rounded-full" 
                            src={assignees.find(a => a.id === log.userId)?.avatar} 
                            alt={getUserName(log.userId)} 
                          />
                        ) : (
                          <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
                            {getUserName(log.userId).charAt(0)}
                          </div>
                        )}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-200">
                          {getUserName(log.userId)}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-gray-200">
                      {formatDate(log.startTime)}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {editingLogId === log.id ? (
                      <div className="flex items-center space-x-2">
                        <input
                          type="number"
                          value={editHours}
                          onChange={(e) => setEditHours(e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white"
                          min="0"
                          placeholder="hrs"
                        />
                        <span className="text-gray-500 dark:text-gray-400">h</span>
                        <input
                          type="number"
                          value={editMinutes}
                          onChange={(e) => setEditMinutes(e.target.value)}
                          className="w-16 px-2 py-1 border border-gray-300 dark:border-gray-700 rounded text-sm dark:bg-gray-800 dark:text-white"
                          min="0"
                          max="59"
                          placeholder="min"
                        />
                        <span className="text-gray-500 dark:text-gray-400">m</span>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-gray-200">
                        {formatDuration(log.duration)}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    {editingLogId === log.id ? (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="primary" 
                          size="xs" 
                          onClick={() => saveEditedLog(log.id)}
                        >
                          <FiSave className="mr-1" />
                          Save
                        </Button>
                        <Button 
                          variant="secondary" 
                          size="xs" 
                          onClick={cancelEditing}
                        >
                          <FiX className="mr-1" />
                          Cancel
                        </Button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <Button 
                          variant="secondary" 
                          size="xs" 
                          onClick={() => startEditing(log)}
                        >
                          <FiEdit2 className="mr-1" />
                          Edit
                        </Button>
                        <Button 
                          variant="danger" 
                          size="xs" 
                          onClick={() => deleteLog(log.id)}
                        >
                          <FiTrash2 className="mr-1" />
                          Delete
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th 
                  scope="row" 
                  colSpan="2" 
                  className="px-4 py-3 text-left text-sm font-medium text-gray-900 dark:text-gray-200"
                >
                  Total Time
                </th>
                <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-gray-200">
                  {formatDuration(timeLogs.reduce((total, log) => total + log.duration, 0))}
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <div className="mt-6">
          <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-3">
            Summary by User
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {assignees.map(assignee => {
              const totalTime = getTotalTimeForUser(assignee.id);
              return (
                <div 
                  key={assignee.id} 
                  className="bg-white dark:bg-gray-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
                >
                  <div className="flex items-center mb-2">
                    <div className="h-8 w-8 rounded-full mr-2 overflow-hidden">
                      <img 
                        src={assignee.avatar}
                        alt={assignee.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {assignee.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Total Time:
                    </div>
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {formatDuration(totalTime)}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default GroupTaskTimeTracking; 