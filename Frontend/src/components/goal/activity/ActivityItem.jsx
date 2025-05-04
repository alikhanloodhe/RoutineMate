import React, { useState } from 'react';

const ActivityItem = ({ 
  activity, 
  currentUser, 
  onAddComment, 
  onLike, 
  onDelete,
  onEdit,
  formatTimestamp,
  getRoleBadgeColor 
}) => {
  const [newComment, setNewComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(activity.content || '');

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(activity.id, newComment);
    setNewComment('');
  };

  const handleEdit = () => {
    if (!editedContent.trim() && (!activity.photos || activity.photos.length === 0)) {
      alert('Post must have content or photos');
      return;
    }
    
    onEdit(activity.id, { content: editedContent });
    setIsEditing(false);
  };

  // Ensure activity has likes and comments arrays
  const likes = activity.likes || [];
  const comments = activity.comments || [];
  const isLiked = activity.liked_by_user || likes.includes(currentUser.id);
  const likesCount = activity.likes_count !== undefined ? activity.likes_count : likes.length;
  
  // Get the photo URL from various possible locations
  const getPhotoUrl = () => {
    console.log('Resolving photo URL for activity:', {
      id: activity.id,
      post_id: activity.post_id,
      photo_url: activity.photo_url,
      photos: activity.photos,
      _file: activity._file // Check for temporary file reference
    });
    
    // Direct photo_url property takes precedence
    if (activity.photo_url) {
      console.log('Using direct photo_url property:', activity.photo_url);
      return activity.photo_url;
    }
    
    // Check for temporary file reference (for preview while uploading)
    if (activity._file && activity._file instanceof File) {
      console.log('Using temporary file reference for preview');
      return URL.createObjectURL(activity._file);
    }
    
    // Check photos array
    if (activity.photos && activity.photos.length > 0) {
      const firstPhoto = activity.photos[0];
      console.log('First photo in photos array:', firstPhoto);
      
      // Skip if it's a File object as it can't be displayed directly
      if (firstPhoto instanceof File) {
        console.log('Photo is a File object, creating temporary URL');
        return URL.createObjectURL(firstPhoto);
      }
      
      // If the photo is a string URL
      if (typeof firstPhoto === 'string') {
        console.log('Photo is a string URL:', firstPhoto);
        return firstPhoto;
      }
      
      // If the photo is an object with photo_url
      if (firstPhoto && typeof firstPhoto === 'object') {
        if (firstPhoto.photo_url) {
          console.log('Photo has photo_url property:', firstPhoto.photo_url);
          return firstPhoto.photo_url;
        }
        
        // Check for other possible properties
        const possibleProps = ['url', 'src', 'path', 'uri'];
        for (const prop of possibleProps) {
          if (firstPhoto[prop]) {
            console.log(`Found photo URL in ${prop} property:`, firstPhoto[prop]);
            return firstPhoto[prop];
          }
        }
      }
    }
    
    console.log('No photo URL found for activity:', activity.id || activity.post_id);
    return null;
  };
  
  const photoUrl = getPhotoUrl();
  console.log('Final photo URL:', photoUrl);

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
            
            {/* Action buttons for post owner or admin */}
            {(currentUser.role === 'admin' || activity.user.id === currentUser.id) && (
              <div className="flex gap-2">
                {activity.user.id === currentUser.id && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="text-gray-400 hover:text-[#4A2BAF]"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => onDelete(activity.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center text-xs text-gray-500">
            <span>{formatTimestamp(activity.timestamp)}</span>
            {activity.edited && (
              <span className="ml-2 text-gray-400 italic">
                (edited {activity.updated_at ? formatTimestamp(activity.updated_at) : ''})
              </span>
            )}
          </div>
        </div>
      </div>
      
      <div className="ml-11">
        {isEditing ? (
          <div className="mb-4">
            <textarea
              value={editedContent}
              onChange={(e) => setEditedContent(e.target.value)}
              className="w-full p-3 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
              rows={3}
            ></textarea>
            <div className="flex justify-end mt-2 space-x-2">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(activity.content || '');
                }}
                className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={handleEdit}
                className="px-3 py-1 text-sm bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3A1B9F]"
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div>
            {activity.content && (
              <p className="text-gray-700 mb-4 whitespace-pre-line">{activity.content}</p>
            )}
          </div>
        )}
        
        {/* Activity Photos */}
        {photoUrl ? (
          <div className="mb-4">
            <img
              src={photoUrl}
              alt="Post photo"
              className="max-w-full max-h-96 object-contain rounded-lg"
              onError={(e) => {
                console.error('Image failed to load:', {
                  src: e.target.src,
                  activity_id: activity.id || activity.post_id,
                  photoUrl: photoUrl
                });
                // Try adding a cache-busting parameter
                const newUrl = `${photoUrl}?cb=${Date.now()}`;
                console.log('Retrying with cache-busting URL:', newUrl);
                e.target.src = newUrl;
                
                // Set a fallback if it fails again
                e.target.onerror = () => {
                  console.error('Image failed to load even with cache busting');
                  e.target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Available';
                  e.target.onerror = null;
                };
              }}
            />
          </div>
        ) : (activity.photos && activity.photos.length > 0 && activity.photos[0] instanceof File) || 
           (activity.isTemporary || activity.post_id?.toString().startsWith('temp-') || activity._file) ? (
          <div className="mb-4">
            <div className="bg-gray-100 p-4 rounded-lg text-center">
              <div className="animate-pulse flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="mt-2 text-gray-500">Photo upload in progress...</p>
            </div>
          </div>
        ) : null}
        
        {/* Like and Comment Buttons */}
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => onLike(activity.id)}
            className={`flex items-center space-x-1 ${
              isLiked
                ? 'text-[#4A2BAF] font-medium'
                : 'text-gray-500 hover:text-[#4A2BAF]'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill={isLiked ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isLiked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{likesCount} {likesCount === 1 ? 'Like' : 'Likes'}</span>
          </button>
          
          <div className="text-gray-500">
            <span>{comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}</span>
          </div>
        </div>
        
        {/* Activity Comments */}
        {comments.length > 0 && (
          <div className="mt-4 space-y-4">
            {comments.map(comment => (
              <div key={comment.id || comment.comment_id} className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-xs font-medium text-[#4A2BAF]">
                  {comment.user?.name?.charAt(0) || comment.user_name?.charAt(0) || '?'}
                </div>
                <div className="flex-1">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.user?.name || comment.user_name}</span>
                      <span className="text-xs text-gray-500">{formatTimestamp(comment.timestamp || comment.created_at)}</span>
                    </div>
                    <p className="text-sm text-gray-700">{comment.text || comment.content}</p>
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