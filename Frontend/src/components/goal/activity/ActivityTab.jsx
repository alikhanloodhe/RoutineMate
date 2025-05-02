import React from 'react';
import ActivityFeed from './ActivityFeed';

const ActivityTab = ({ 
  goal, 
  currentUser, 
  formatTimestamp,
  onUpdate
}) => {
  // Handle adding a new activity
  const handleAddActivity = (newActivity) => {
    onUpdate({
      ...goal,
      activities: [newActivity, ...(goal.activities || [])]
    });
  };

  // Handle adding comment
  const handleAddComment = (activityId, commentText) => {
    if (!commentText.trim()) return;

    const comment = {
      id: Date.now().toString(),
      user: { 
        id: currentUser.id,
        name: currentUser.name, 
        role: currentUser.role 
      }, 
      text: commentText,
      timestamp: new Date().toISOString()
    };

    onUpdate({
      ...goal,
      activities: (goal.activities || []).map(activity => {
        if (activity.activity_id === activityId) {
          return {
            ...activity,
            comments: [...(activity.comments || []), comment]
          };
        }
        return activity;
      })
    });
  };

  // Handle liking an activity
  const handleLikeActivity = (activityId) => {
    onUpdate({
      ...goal,
      activities: (goal.activities || []).map(activity => {
        if (activity.activity_id === activityId) {
          const userAlreadyLiked = activity.likes && activity.likes.includes(currentUser.id);
          
          return {
            ...activity,
            likes: userAlreadyLiked 
              ? (activity.likes || []).filter(id => id !== currentUser.id) // Unlike
              : [...(activity.likes || []), currentUser.id] // Like
          };
        }
        return activity;
      })
    });
  };

  // Handle deleting an activity
  const handleDeleteActivity = (activityId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onUpdate({
        ...goal,
        activities: (goal.activities || []).filter(
          activity => activity.activity_id !== activityId
        )
      });
    }
  };

  return (
    <ActivityFeed 
      activities={goal.activities || []}
      currentUser={currentUser}
      onAddActivity={handleAddActivity}
      onAddComment={handleAddComment}
      onLikeActivity={handleLikeActivity}
      onDeleteActivity={handleDeleteActivity}
      formatTimestamp={formatTimestamp}
    />
  );
};

export default ActivityTab; 