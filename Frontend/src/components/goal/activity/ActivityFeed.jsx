import React, { useState } from 'react';
import ActivityForm from './ActivityForm';
import ActivityItem from './ActivityItem';

const ActivityFeed = ({ 
  activities = [], 
  currentUser, 
  onAddActivity, 
  onAddComment,
  onDeleteComment, 
  onLikeActivity,
  onEditActivity,
  onDeleteActivity,
  formatTimestamp
}) => {
  const [showActivityForm, setShowActivityForm] = useState(false);

  // Handle adding a new activity
  const handleAddActivity = async (activityData) => {
    try {
      console.log('ActivityFeed: Preparing to add new activity');
      
      // Create a temporary activity to show while uploading
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const tempActivity = {
        id: tempId,
        content: activityData.content,
        timestamp: new Date().toISOString(),
        user: { 
          id: currentUser.id,
          name: currentUser.name, 
          role: currentUser.role 
        },
        photos: activityData.photos || [],
        likes: [],
        comments: [],
        isTemporary: true // Flag to identify temporary activities
      };
      
      // Update activities state first
      activities.unshift(tempActivity);
      
      // Then make the API call, mapping from ActivityForm data structure to what the API expects
      const result = await onAddActivity({
        content: activityData.content,
        text: activityData.content, // Add text field for compatibility with both APIs
        photos: activityData.photos || [],
        photo: activityData.photos && activityData.photos.length > 0 ? activityData.photos[0] : null
      });
      
      console.log('ActivityFeed: Activity added with result:', result);
      
      setShowActivityForm(false);
      return result;
    } catch (error) {
      console.error('Error in ActivityFeed.handleAddActivity:', error);
      throw error;
    }
  };

  // Get role badge color
  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':
        return 'bg-purple-100 text-purple-800';
      case 'collaborator':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Ensure every activity has the required properties
  const safeActivities = activities.map(activity => ({
    ...activity,
    // Ensure id exists for React keys
    id: activity.id || `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    likes: activity.likes || [],
    comments: activity.comments || [],
    photos: activity.photos || [],
    user: activity.user || { 
      id: 'unknown', 
      name: 'Unknown User', 
      role: 'collaborator' 
    }
  }));

  return (
    <div>
      <h2 className="text-lg font-semibold text-[#1C1C1C] mb-6">Activity Feed</h2>
      
      {/* Activity Form or Button */}
      <div className="mb-6">
        {showActivityForm ? (
          <ActivityForm 
            onAddActivity={handleAddActivity}
            onCancel={() => setShowActivityForm(false)}
          />
        ) : (
          <button
            onClick={() => setShowActivityForm(true)}
            className="w-full bg-white border border-gray-200 rounded-xl p-4 text-left text-gray-500 hover:border-[#4A2BAF]/30 hover:bg-[#4A2BAF]/5 transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-[#4A2BAF]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Share an update with the team...</span>
            </div>
          </button>
        )}
      </div>
      
      {/* Activity Items */}
      <div className="space-y-6">
        {safeActivities.length > 0 ? (
          safeActivities.map(activity => (
            <ActivityItem 
              key={activity.id}
              activity={activity}
              currentUser={currentUser}
              onAddComment={onAddComment}
              onDeleteComment={onDeleteComment}
              onLike={onLikeActivity}
              onEdit={onEditActivity}
              onDelete={onDeleteActivity}
              formatTimestamp={formatTimestamp}
              getRoleBadgeColor={getRoleBadgeColor}
            />
          ))
        ) : (
          <div className="text-center py-10 bg-white border border-gray-200 rounded-xl">
            <div className="mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">No Activity Yet</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">Be the first to share updates, progress, or thoughts with your team</p>
            <button
              onClick={() => setShowActivityForm(true)}
              className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3A1B9F] transition-colors duration-200"
            >
              Post First Update
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeed; 