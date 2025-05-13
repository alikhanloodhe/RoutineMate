import React, { useState, useEffect } from 'react';
import ActivityFeed from './ActivityFeed';
import { 
  getGoalPosts, 
  addGoalPost, 
  updateGoalPost, 
  deleteGoalPost, 
  addComment, 
  deleteComment,
  toggleLike 
} from '../../../utils/goalPostService';
import { useToastContext } from '../../../context/ToastContext';

const ActivityTab = ({ 
  goal, 
  currentUser, 
  formatTimestamp,
  onUpdate
}) => {
  const { successToast, errorToast, infoToast } = useToastContext();
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postToDelete, setPostToDelete] = useState(null);

  // Fetch posts when the component mounts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setIsLoading(true);
        const response = await getGoalPosts(goal.goal_id);
        console.log('Fetched posts:', response.posts);
        setPosts(response.posts || []);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load activity feed. Please try again.');
        errorToast('Failed to load activity feed');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [goal.goal_id]);

  // Handle adding a new activity
  const handleAddActivity = async (newActivity) => {
    try {
      console.log('Adding new activity:', newActivity);
      
      // Generate a temporary ID for this activity
      const tempId = `temp-${Date.now()}`;
      
      // Create a temporary post with the File object to display while uploading
      const tempPost = {
        post_id: tempId,
        content: newActivity.content,
        created_at: new Date().toISOString(),
        user_id: currentUser.id,
        user_name: currentUser.name,
        photo_url: null, // Will be filled after upload
        likes_count: 0,
        comments_count: 0,
        liked_by_user: false,
        comments: [],
        // Store file reference temporarily
        _file: newActivity.photos && newActivity.photos.length > 0 ? newActivity.photos[0] : null
      };
      
      // Add temporary post to the state
      setPosts(prevPosts => [tempPost, ...prevPosts]);
      
      // Extract the file from the newActivity
      let photoToUpload = null;
      if (newActivity.photos && newActivity.photos.length > 0) {
        photoToUpload = newActivity.photos[0];
        console.log('Photo to upload:', {
          name: photoToUpload.name,
          type: photoToUpload.type,
          size: photoToUpload.size
        });
      }
      
      // Make the actual API call
      const response = await addGoalPost(
        goal.goal_id, 
        newActivity.content, 
        photoToUpload
      );
      
      console.log('New post response:', response);
      
      if (!response || !response.post) {
        console.error('Invalid response from server:', response);
        throw new Error('Server returned an invalid response');
      }
      
      if (response.post && response.post.photo_url) {
        console.log('Post created with photo URL:', response.post.photo_url);
      }
      
      // Remove temporary post and add the real post with server data
      setPosts(prevPosts => {
        const filteredPosts = prevPosts.filter(p => p.post_id !== tempId);
        return [response.post, ...filteredPosts];
      });
      
      // Update parent component state
      onUpdate({
        ...goal,
        posts: [response.post, ...(goal.posts || []).filter(p => p.post_id !== tempId)]
      });
      
      // Show success toast
      successToast('Post added successfully');
      
      return response.post;
    } catch (error) {
      console.error('Error adding post:', error);
      // Remove temporary post on error
      setPosts(prevPosts => prevPosts.filter(p => !p.post_id.startsWith('temp-')));
      errorToast('Failed to add post. Please try again.');
      throw error;
    }
  };

  // Handle adding comment
  const handleAddComment = async (postId, commentText) => {
    if (!commentText.trim()) return;

    try {
      const response = await addComment(postId, commentText);
      console.log('Comment response:', response);
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.post_id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.comment],
              comments_count: post.comments_count + 1
            };
          }
          return post;
        })
      );
      
      // Update parent component state
      onUpdate({
        ...goal,
        posts: (goal.posts || []).map(post => {
          if (post.post_id === postId) {
            return {
              ...post,
              comments: [...post.comments, response.comment],
              comments_count: post.comments_count + 1
            };
          }
          return post;
        })
      });
      
      // Show success toast
      successToast('Comment added successfully');
      
      return response.comment;
    } catch (error) {
      console.error('Error adding comment:', error);
      errorToast('Failed to add comment. Please try again.');
      throw error;
    }
  };

  // Handle liking an activity
  const handleLikeActivity = async (postId) => {
    try {
      const response = await toggleLike(postId);
      console.log('Like toggle response:', response);
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.post_id === postId) {
            return {
              ...post,
              liked_by_user: response.liked,
              likes_count: response.likes_count
            };
          }
          return post;
        })
      );
      
      // Update parent component state
      onUpdate({
        ...goal,
        posts: (goal.posts || []).map(post => {
          if (post.post_id === postId) {
            return {
              ...post,
              liked_by_user: response.liked,
              likes_count: response.likes_count
            };
          }
          return post;
        })
      });
      
      // Show appropriate toast based on like status
      if (response.liked) {
        successToast('Post liked');
      } else {
        infoToast('Post unliked');
      }
      
      return response;
    } catch (error) {
      console.error('Error toggling like:', error);
      errorToast('Failed to update like status. Please try again.');
      throw error;
    }
  };

  // Handle deleting an activity
  const handleDeleteActivity = async (postId) => {
    // Set the post ID to delete and show confirmation modal
    setPostToDelete(postId);
  };

  // Handle confirming post deletion
  const handleConfirmDelete = async () => {
    if (!postToDelete) return;
    
    try {
      await deleteGoalPost(postToDelete);
      
      // Update local state
      setPosts(prevPosts => prevPosts.filter(post => post.post_id !== postToDelete));
      
      // Update parent component state
      onUpdate({
        ...goal,
        posts: (goal.posts || []).filter(post => post.post_id !== postToDelete)
      });
      
      // Show success toast
      successToast('Post deleted successfully');
    } catch (error) {
      console.error('Error deleting post:', error);
      errorToast('Failed to delete post. Please try again.');
    } finally {
      // Reset the post to delete state
      setPostToDelete(null);
    }
  };

  // Handle editing an activity
  const handleEditActivity = async (postId, updates) => {
    try {
      const post = posts.find(p => p.post_id === postId);
      if (!post) return;
      
      console.log('Updating post:', postId, updates);
      
      // Make API call to update the post
      const response = await updateGoalPost(
        postId, 
        updates.content, 
        updates.photo || null
      );
      
      console.log('Update post response:', response);
      
      // Update local state
      setPosts(prevPosts => 
        prevPosts.map(post => {
          if (post.post_id === postId) {
            return response.post;
          }
          return post;
        })
      );
      
      // Update parent component state
      onUpdate({
        ...goal,
        posts: (goal.posts || []).map(post => {
          if (post.post_id === postId) {
            return response.post;
          }
          return post;
        })
      });
      
      // Show success toast
      successToast('Post updated successfully');
      
      return response.post;
    } catch (error) {
      console.error('Error updating post:', error);
      errorToast('Failed to update post. Please try again.');
      throw error;
    }
  };

  // Clean up any temporary URLs when component unmounts
  useEffect(() => {
    const objectUrls = new Set();
    
    // Function to add URL to tracked set
    const trackUrl = (url) => {
      if (url && typeof url === 'string' && url.startsWith('blob:')) {
        objectUrls.add(url);
      }
    };
    
    // Find any object URLs being used in formatted activities
    posts.forEach(post => {
      if (post._file instanceof File) {
        // Skip these as they'll be tracked when the URL is created
      }
    });
    
    // Clean up function to revoke all object URLs
    return () => {
      for (const url of objectUrls) {
        console.log('Cleaning up object URL:', url);
        URL.revokeObjectURL(url);
      }
    };
  }, [posts]);

  if (isLoading) {
    return (
      <div className="text-center py-10">
        <div className="w-10 h-10 border-2 border-[#4A2BAF] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500">Loading activity feed...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10 bg-red-50 rounded-xl border border-red-100">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3A1B9F]"
        >
          Retry
        </button>
      </div>
    );
  }

  // Convert backend posts format to match the ActivityFeed component's expected format
  const formattedActivities = posts.map(post => {
    console.log('Formatting raw post:', post);
    console.log('Post photo_url:', post.photo_url);
    
    const formattedActivity = {
      id: post.post_id,
      content: post.content,
      timestamp: post.created_at,
      user: {
        id: post.user_id,
        name: post.user_name,
        role: goal.members.find(m => m.id === post.user_id)?.role || 'collaborator'
      },
      photo_url: post.photo_url, // Add direct photo_url property
      photos: post.photo_url ? [{ photo_url: post.photo_url }] : [], // Only add photo objects with URLs
      likes: post.liked_by_user ? [currentUser.id] : [],
      liked_by_user: post.liked_by_user,
      likes_count: post.likes_count,
      comments: post.comments.map(comment => ({
        id: comment.comment_id,
        text: comment.content,
        timestamp: comment.created_at,
        user: {
          id: comment.user_id,
          name: comment.user_name,
          role: goal.members.find(m => m.id === comment.user_id)?.role || 'collaborator'
        }
      }))
    };
    
    console.log('Formatted activity:', formattedActivity);
    console.log('Formatted photos:', formattedActivity.photos);
    return formattedActivity;
  });

  return (
    <>
      <ActivityFeed 
        activities={formattedActivities}
        currentUser={currentUser}
        onAddActivity={handleAddActivity}
        onAddComment={handleAddComment}
        onLikeActivity={handleLikeActivity}
        onEditActivity={handleEditActivity}
        onDeleteActivity={handleDeleteActivity}
        formatTimestamp={formatTimestamp}
      />
      
      {/* Delete Post Confirmation Modal */}
      {postToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Delete Post</h3>
              <p className="text-sm text-gray-600 mt-2">
                Are you sure you want to delete this post? This action cannot be undone.
              </p>
            </div>
            
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setPostToDelete(null)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ActivityTab; 