import React, { useState, useRef, useEffect } from 'react';
import { FiSend, FiX, FiTrash2 } from 'react-icons/fi';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * GroupTaskDiscussion component for discussions in group tasks
 * 
 * @param {Object} props
 * @param {Object} props.task - The group task object
 * @param {Array} props.assignees - Array of assignee objects
 * @param {number} props.currentUserId - ID of the current user
 * @param {Function} props.onClose - Function to call when the component is closed
 */
const GroupTaskDiscussion = ({ 
  task, 
  assignees = [], 
  currentUserId = 1, // Default for testing
  onClose 
}) => {
  // State for comments
  const [comments, setComments] = useState([
    // Example data format
    {
      id: 1,
      taskId: task.id,
      userId: 2,
      comment: "I've started working on the first part of this task. Should be done by tomorrow.",
      createdAt: '2023-07-18T09:30:00Z'
    },
    {
      id: 2,
      taskId: task.id,
      userId: 3,
      comment: "Great! I'll take care of the second part once you're done.",
      createdAt: '2023-07-18T10:45:00Z'
    },
    {
      id: 3,
      taskId: task.id,
      userId: 1,
      comment: "Don't forget to update the documentation when you're finished.",
      createdAt: '2023-07-18T14:20:00Z'
    }
  ]);

  // State for new comment
  const [newComment, setNewComment] = useState('');
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom of messages when new comments are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [comments]);

  // Submit a new comment
  const submitComment = (e) => {
    e.preventDefault();
    
    if (newComment.trim() === '') return;
    
    const now = new Date();
    const comment = {
      id: Date.now(), // Temporary ID
      taskId: task.id,
      userId: currentUserId,
      comment: newComment,
      createdAt: now.toISOString()
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  // Delete a comment (only allowed for the comment author)
  const deleteComment = (commentId) => {
    setComments(comments.filter(comment => comment.id !== commentId));
  };

  // Format date for display (e.g., "Jul 18, 2023 at 9:30 AM")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) + ' at ' + date.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Get user by ID
  const getUser = (userId) => {
    return assignees.find(a => a.id === userId) || { 
      name: 'Unknown User',
      avatar: ''
    };
  };

  // Check if a comment is from the current user
  const isCurrentUserComment = (userId) => {
    return userId === currentUserId;
  };

  return (
    <Card className="overflow-hidden max-h-screen flex flex-col">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Discussion</h2>
        <Button variant="text" size="sm" onClick={onClose}>
          <FiX className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4 overflow-y-auto flex-1 max-h-[calc(100vh-200px)]">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
            {task.title}
          </h3>
        </div>
        
        <div className="space-y-4">
          {comments.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No comments yet. Start the discussion!
            </div>
          ) : (
            comments.map(comment => {
              const user = getUser(comment.userId);
              const isCurrentUser = isCurrentUserComment(comment.userId);
              
              return (
                <div 
                  key={comment.id} 
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[75%] rounded-lg px-4 py-3 ${
                      isCurrentUser 
                        ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-900 dark:text-indigo-100' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
                    }`}
                  >
                    <div className="flex items-start mb-1">
                      {!isCurrentUser && (
                        <div className="flex-shrink-0 mr-2">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name} 
                              className="h-6 w-6 rounded-full"
                            />
                          ) : (
                            <div className="h-6 w-6 rounded-full bg-gray-300 dark:bg-gray-700 flex items-center justify-center text-xs text-gray-600 dark:text-gray-400">
                              {user.name.charAt(0)}
                            </div>
                          )}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-sm">
                            {isCurrentUser ? 'You' : user.name}
                          </span>
                          {isCurrentUser && (
                            <button 
                              className="ml-2 text-gray-400 hover:text-red-500"
                              onClick={() => deleteComment(comment.id)}
                            >
                              <FiTrash2 size={14} />
                            </button>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(comment.createdAt)}
                        </div>
                      </div>
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {comment.comment}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <form onSubmit={submitComment} className="flex space-x-2">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Type your comment..."
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-gray-100 resize-none"
              rows="2"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  submitComment(e);
                }
              }}
            ></textarea>
            <p className="text-xs text-gray-500 mt-1">
              Press Enter to send, Shift+Enter for new line
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={newComment.trim() === ''}
            className="self-end"
          >
            <FiSend className="mr-1" />
            Send
          </Button>
        </form>
      </div>
    </Card>
  );
};

export default GroupTaskDiscussion; 