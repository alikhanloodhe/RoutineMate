import React, { useState } from 'react';

const ActivityItem = ({ 
  activity, 
  currentUser, 
  onAddComment, 
  onLike, 
  onDelete,
  formatTimestamp,
  getRoleBadgeColor 
}) => {
  const [newComment, setNewComment] = useState('');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(activity.activity_id, newComment);
    setNewComment('');
  };

  // Ensure activity has likes and comments arrays
  const likes = activity.likes || [];
  const comments = activity.comments || [];
  const isLiked = likes.includes(currentUser.id);

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-xs font-medium text-[#4A2BAF]">
          {activity.user.name.charAt(0)}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-[#1C1C1C]">{activity.user.name}</h3>
              <span className={`text-xs px-2 py-0.5 rounded-full ${getRoleBadgeColor(activity.user.role)}`}>
                {activity.user.role === 'admin' ? 'Admin' : 'Collaborator'}
              </span>
            </div>
            
            {/* Only show delete for admin or post author */}
            {(currentUser.role === 'admin' || activity.user.id === currentUser.id) && (
              <button
                onClick={() => onDelete(activity.activity_id)}
                className="text-gray-400 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
          <p className="text-xs text-gray-500">{formatTimestamp(activity.timestamp)}</p>
        </div>
      </div>
      
      <div className="ml-11">
        <h4 className="font-medium text-[#1C1C1C] mb-2">{activity.title}</h4>
        {activity.description && (
          <p className="text-gray-600 mb-4">{activity.description}</p>
        )}
        
        {/* Activity Photos */}
        {activity.photos && activity.photos.length > 0 && (
          <div className="mb-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
            {activity.photos.map((photo, index) => (
              <img
                key={index}
                src={photo}
                alt={`Activity photo ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg"
              />
            ))}
          </div>
        )}
        
        {/* Like and Comment Buttons */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => onLike(activity.activity_id)}
            className={`flex items-center space-x-1 ${
              isLiked
                ? 'text-[#4A2BAF] font-medium'
                : 'text-gray-500 hover:text-[#4A2BAF]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likes.length} {likes.length === 1 ? 'Like' : 'Likes'}</span>
          </button>
          
          <div className="text-gray-500">
            <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </div>
        </div>
        
        {/* Activity Comments */}
        {comments.length > 0 && (
          <div className="mt-4 space-y-4">
            {comments.map(comment => (
              <div key={comment.id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-xs font-medium text-[#4A2BAF]">
                  {comment.user.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.user.name}</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Comment Form */}
        <div className="mt-4 flex items-start gap-2">
          <div className="w-6 h-6 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-xs font-medium text-[#4A2BAF]">
            {currentUser.name.charAt(0)}
          </div>
          <div className="flex-1 relative">
            <textarea
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="w-full p-3 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
              rows={1}
            ></textarea>
            <button 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
              className={`absolute right-3 top-3 ${
                newComment.trim() 
                  ? 'text-[#4A2BAF] hover:text-[#3A1B9F]' 
                  : 'text-gray-400 cursor-not-allowed'
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivityItem; 