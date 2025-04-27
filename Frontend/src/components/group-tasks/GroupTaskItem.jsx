import React, { useState } from 'react';
import { format, isAfter } from 'date-fns';
import Badge from '../ui/Badge';
import Button from '../ui/Button';
import Card from '../ui/Card';
import { 
  FiCalendar, 
  FiEdit2, 
  FiTrash2, 
  FiClock, 
  FiMessageSquare, 
  FiPaperclip, 
  FiMoreVertical,
  FiTag,
  FiAlertTriangle
} from 'react-icons/fi';
import GroupTaskTimeTracking from './GroupTaskTimeTracking';
import GroupTaskDiscussion from './GroupTaskDiscussion';
import GroupTaskAttachments from './GroupTaskAttachments';

/**
 * GroupTaskItem component displays an individual group task with its details
 * 
 * @param {Object} props
 * @param {Object} props.task - The group task object
 * @param {Object} props.priority - The priority object
 * @param {Object} props.status - The status object
 * @param {Array} props.tags - Array of tag objects
 * @param {Array} props.assignees - Array of assignee objects
 * @param {Function} props.onEdit - Function called when edit button is clicked
 * @param {Function} props.onDelete - Function called when delete button is clicked
 */
const GroupTaskItem = ({
  task,
  priority,
  status,
  tags = [],
  assignees = [],
  onEdit,
  onDelete
}) => {
  // State for modal views
  const [activeView, setActiveView] = useState(null); // 'time', 'discussion', 'attachments'
  const [showOptions, setShowOptions] = useState(false);

  // Check if task is overdue
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.statusId !== 3; // Assuming status 3 is "Done"

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'No due date';
    try {
      const date = new Date(dateString);
      return format(date, 'MMM d, yyyy');
    } catch (error) {
      return dateString;
    }
  };

  // Close the active view
  const closeActiveView = () => {
    setActiveView(null);
  };

  // Toggle options menu
  const toggleOptions = () => {
    setShowOptions(!showOptions);
  };

  // Get priority color
  const getPriorityColor = () => {
    if (!priority) return 'secondary';
    
    switch(priority.name.toLowerCase()) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'success';
      default:
        return 'secondary';
    }
  };

  // Get status color
  const getStatusColor = () => {
    if (!status) return 'secondary';
    
    switch(status.name.toLowerCase()) {
      case 'done':
      case 'completed':
        return 'success';
      case 'in progress':
        return 'primary';
      case 'to do':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  // Render the active view component
  const renderActiveView = () => {
    if (!activeView) return null;

    let Component = null;
    switch (activeView) {
      case 'time':
        Component = GroupTaskTimeTracking;
        break;
      case 'discussion':
        Component = GroupTaskDiscussion;
        break;
      case 'attachments':
        Component = GroupTaskAttachments;
        break;
      default:
        return null;
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
        <div className="w-full max-w-4xl max-h-[90vh] overflow-auto">
          <Component
            task={task}
            assignees={assignees}
            onClose={closeActiveView}
          />
        </div>
      </div>
    );
  };

  // Days until due (negative if overdue)
  const getDaysUntilDue = () => {
    if (!task.dueDate) return null;
    
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    const timeDiff = dueDate.getTime() - today.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
  };
  
  const daysUntilDue = getDaysUntilDue();

  // Handle edit task click
  const handleEditClick = () => {
    if (onEdit && typeof onEdit === 'function') {
      onEdit(task);
    }
  };

  // Handle delete task click
  const handleDeleteClick = () => {
    if (onDelete && typeof onDelete === 'function') {
      setShowOptions(false);
      onDelete(task.id);
    }
  };

  return (
    <>
      <Card
        hoverable
        shadow="card"
        bordered
        className={`overflow-visible ${isOverdue ? 'border-red-200 dark:border-red-900' : ''}`}
      >
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1.5 line-clamp-2">
                  {task.title}
                </h3>
                
                {task.description && (
                  <p className="text-gray-600 dark:text-gray-300 mb-3 line-clamp-2 text-sm">
                    {task.description}
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {status && (
                <Badge color={getStatusColor()}>
                  {status.name}
                </Badge>
              )}
              
              {priority && (
                <Badge color={getPriorityColor()}>
                  {priority.name}
                </Badge>
              )}
              
              {isOverdue && (
                <Badge 
                  color="danger"
                  icon={<FiAlertTriangle size={14} />}
                >
                  Overdue
                </Badge>
              )}
              
              {tags.map((tag, index) => (
                <Badge 
                  key={tag.id || index} 
                  color="secondary"
                  icon={<FiTag size={14} />}
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
            
            <div className="flex flex-wrap gap-4 mb-3 text-sm">
              {task.dueDate && (
                <div className={`flex items-center ${isOverdue ? "text-red-500 dark:text-red-400" : "text-gray-500 dark:text-gray-400"}`}>
                  <FiCalendar className="mr-1.5" />
                  <span>
                    {formatDate(task.dueDate)}
                    {daysUntilDue !== null && (
                      <span className="ml-1 font-medium">
                        {daysUntilDue === 0 ? "(Today)" : 
                         daysUntilDue < 0 ? `(${Math.abs(daysUntilDue)} days overdue)` : 
                         `(${daysUntilDue} days left)`}
                      </span>
                    )}
                  </span>
                </div>
              )}
            </div>
            
            {assignees.length > 0 && (
              <div className="flex items-center mb-4">
                <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Assigned to:</span>
                <div className="flex -space-x-2 overflow-hidden">
                  {assignees.slice(0, 5).map((assignee) => (
                    <img
                      key={assignee.id}
                      className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-800 border border-gray-200 dark:border-gray-700"
                      src={assignee.avatar}
                      alt={assignee.name}
                      title={assignee.name}
                    />
                  ))}
                  {assignees.length > 5 && (
                    <span className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-xs font-medium text-gray-800 ring-2 ring-white dark:ring-gray-800 dark:bg-gray-700 dark:text-gray-300">
                      +{assignees.length - 5}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            <div className="flex flex-wrap gap-2">
              <Button
                variant="light"
                size="sm"
                icon={FiClock}
                onClick={() => setActiveView('time')}
              >
                Time
              </Button>
              
              <Button
                variant="light"
                size="sm"
                icon={FiMessageSquare}
                onClick={() => setActiveView('discussion')}
              >
                Discussion
              </Button>
              
              <Button
                variant="light"
                size="sm"
                icon={FiPaperclip}
                onClick={() => setActiveView('attachments')}
              >
                Attachments
              </Button>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-2 self-start relative">
            <div className="flex space-x-2">
              <Button
                variant="light"
                size="sm"
                icon={FiEdit2}
                onClick={handleEditClick}
              >
                Edit
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                icon={FiMoreVertical}
                iconOnly
                onClick={toggleOptions}
                className="relative"
              />
            </div>
            
            {showOptions && (
              <div className="absolute right-0 top-10 mt-2 z-10 w-48 py-2 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
                <ul>
                  <li>
                    <button 
                      className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-700"
                      onClick={handleDeleteClick}
                    >
                      <FiTrash2 className="mr-2" />
                      Delete Task
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Render the active modal view */}
      {renderActiveView()}
    </>
  );
};

export default GroupTaskItem; 