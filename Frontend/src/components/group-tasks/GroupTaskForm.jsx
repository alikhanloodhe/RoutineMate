import React, { useState} from 'react';
// import { useEffect } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Badge from '../ui/Badge';
import UserSelector from '../users/UserSelector';

/**
 * GroupTaskForm component for adding or editing group tasks
 * 
 * @param {Object} props
 * @param {Object} [props.task] - Task to edit (if editing)
 * @param {Array} props.priorities - Available priority options
 * @param {Array} props.statuses - Available status options
 * @param {Array} props.tags - Available tags
 * @param {Array} props.friends - Available users/friends to assign
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Function} props.onCancel - Function to call when form is cancelled
 * @param {string} [props.submitLabel='Add Task'] - Label for submit button
 */
const GroupTaskForm = ({
  task, 
  priorities, 
  statuses, 
  tags,
  friends,
  onSubmit,
  onCancel,
  submitLabel = 'Add Task'
}) => {
  // Initialize form state
  const [title, setTitle] = useState(task?.title || '');
  const [description, setDescription] = useState(task?.description || '');
  const [dueDate, setDueDate] = useState(task?.due_date || '');
  const [priority, setPriority] = useState(task?.priority_id?.toString() || '');
  const [status, setStatus] = useState(task?.status_id?.toString() || '1'); // Default to "To Do"
  const [selectedTags, setSelectedTags] = useState(task?.tags || []);
  const [selectedAssignees, setSelectedAssignees] = useState(task?.assignees || []);
  const [subtasks, setSubtasks] = useState(task?.subtasks || []);
  const [newSubtask, setNewSubtask] = useState('');
  // const [priority, setPriority] = useState('');

// useEffect(() => {
//   if (task?.priority_id) {
//     setPriority(task.priority_id.toString());
//   }
// }, [task]);
  // Validation error state
  const [errors, setErrors] = useState({});

  // Toggle selection of a tag
  const toggleTag = (tagId) => {
    if (selectedTags.includes(tagId)) {
      setSelectedTags(selectedTags.filter(id => id !== tagId));
    } else {
      setSelectedTags([...selectedTags, tagId]);
    }
  };

  // Handle assignee selection change from UserSelector
  const handleAssigneeChange = (assigneeIds) => {
    setSelectedAssignees(assigneeIds);
  };

  // Add a new subtask
  const addSubtask = () => {
    if (!newSubtask.trim()) return;
    
    const newSubtaskObj = {
      id: Date.now(), // Temporary ID
      title: newSubtask,
      is_completed: false
    };
    
    setSubtasks([...subtasks, newSubtaskObj]);
    setNewSubtask('');
  };

  // Toggle subtask completion status
  const toggleSubtaskCompletion = (subtaskId) => {
    setSubtasks(subtasks.map(subtask => 
      subtask.id === subtaskId 
        ? { ...subtask, is_completed: !subtask.is_completed } 
        : subtask
    ));
  };

  // Delete a subtask
  const deleteSubtask = (subtaskId) => {
    setSubtasks(subtasks.filter(subtask => subtask.id !== subtaskId));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    const validationErrors = {};
    if (!title.trim()) validationErrors.title = 'Title is required';
    if (!priority) validationErrors.priority = 'Priority is required';
    if (!status) validationErrors.status = 'Status is required';
    if (selectedAssignees.length === 0) validationErrors.assignees = 'At least one assignee is required';
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    
    // Clear any existing errors
    setErrors({});
    
    // Create task object
    const taskData = {
      id: task?.id,
      title,
      description,
      dueDate,
      priorityId: parseInt(priority),
      statusId: parseInt(status),
      tags: selectedTags,
      assignees: selectedAssignees,
      subtasks
    };
    
    // Submit task data
    onSubmit(taskData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title</label>
          {errors.title && (
            <p className="text-sm text-red-600 mb-1">{errors.title}</p>
          )}
          <Input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Task title"
            fullWidth
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Task description"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-gray-100"
            rows={3}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              fullWidth
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
            {errors.priority && (
              <p className="text-sm text-red-600 mb-1">{errors.priority}</p>
            )}
            <Select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              fullWidth
              required
            >
              <option value="">Select Priority</option>
              {priorities.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
            {errors.status && (
              <p className="text-sm text-red-600 mb-1">{errors.status}</p>
            )}
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              fullWidth
              required
            >
              <option  value="">Select Status</option>
              {statuses.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </div>
        </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 mt-5">Assignees</label>
        {errors.assignees && (
          <p className="text-sm text-red-600 mb-1">{errors.assignees}</p>
        )}
        <UserSelector 
          users={friends}
          selectedUsers={selectedAssignees}
          onSelectionChange={handleAssigneeChange}
          title="Select Task Assignees"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map(tag => (
            <div
              key={tag.id}
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1 rounded-full text-sm cursor-pointer ${
                selectedTags.includes(tag.id)
                  ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
              }`}
            >
              {tag.name}
            </div>
          ))}
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subtasks</label>
        <div className="mb-2">
          <div className="flex">
            <Input
              type="text"
              value={newSubtask}
              onChange={(e) => setNewSubtask(e.target.value)}
              placeholder="Add a subtask"
              fullWidth
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
            />
            <Button
              type="button"
              variant="primary"
              onClick={addSubtask}
              className="ml-2"
            >
              Add
            </Button>
          </div>
        </div>
        
        {subtasks.length > 0 && (
          <ul className="space-y-2 mb-4">
            {subtasks.map(subtask => (
              <li key={subtask.id} className="flex items-center justify-between p-2 border border-gray-200 dark:border-gray-700 rounded-md">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={subtask.is_completed}
                    onChange={() => toggleSubtaskCompletion(subtask.id)}
                    className="h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 mr-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                  <span className={`text-gray-800 dark:text-gray-200 ${subtask.is_completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                    {subtask.title}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => deleteSubtask(subtask.id)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="flex justify-end mt-6 space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {submitLabel}
        </Button>
      </div>
      </div>
    </form>
  );
};

export default GroupTaskForm; 