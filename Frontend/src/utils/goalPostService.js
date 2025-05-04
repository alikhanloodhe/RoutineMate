import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Helper function to get auth header
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    }
  };
};

// Helper function for file uploads
const getFileUploadHeader = () => {
  const token = localStorage.getItem('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    }
  };
};

// Get all posts for a goal
export const getGoalPosts = async (goalId) => {
  try {
    console.log(`Fetching posts for goal ${goalId}`);
    const response = await axios.get(`${API_URL}/api/goal-posts/all/${goalId}`, getAuthHeader());
    console.log('API response:', response.data);
    
    // Log info about posts with photos
    if (response.data.posts && response.data.posts.length > 0) {
      const postsWithPhotos = response.data.posts.filter(post => post.photo_url);
      console.log(`Found ${postsWithPhotos.length} posts with photos`);
      postsWithPhotos.forEach(post => {
        console.log(`Post ${post.post_id} has photo_url: ${post.photo_url}`);
      });
    }
    
    return response.data;
  } catch (error) {
    console.error('Error fetching goal posts:', error);
    throw error;
  }
};

// Add a new post
export const addGoalPost = async (goalId, content, photo) => {
  try {
    console.log('addGoalPost called with:', { goalId, content, photo });
    
    if (!goalId) {
      console.error('Missing goalId in addGoalPost');
      throw new Error('Missing goalId');
    }
    
    const formData = new FormData();
    formData.append('content', content || '');
    
    if (photo && photo instanceof File) {
      console.log('Photo object details:', {
        name: photo.name,
        size: photo.size,
        type: photo.type,
        lastModified: photo.lastModified
      });
      console.log('Appending photo to form data:', photo);
      formData.append('photo', photo);
    } else if (photo) {
      console.warn('Photo is not a File object:', photo);
    }
    
    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`Form data entry - ${key}: ${value instanceof File ? 'File: ' + value.name + ', type: ' + value.type + ', size: ' + value.size : value}`);
    }
    
    // Get the upload headers and log them
    const uploadHeaders = getFileUploadHeader();
    console.log('Upload headers:', uploadHeaders);
    
    console.log(`Making POST request to: ${API_URL}/api/goal-posts/add/${goalId}`);
    const response = await axios.post(
      `${API_URL}/api/goal-posts/add/${goalId}`, 
      formData, 
      getFileUploadHeader()
    );
    
    console.log('Add post API response status:', response.status);
    console.log('Add post API response data:', response.data);
    
    if (!response.data || !response.data.post) {
      console.error('Invalid response structure:', response.data);
      throw new Error('Server returned invalid response structure');
    }
    
    // Verify photo_url is in the response
    if (photo && !response.data.post.photo_url) {
      console.warn('Photo was uploaded but no photo_url in response:', response.data);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error adding goal post:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
      console.error('Response headers:', error.response.headers);
    }
    throw error;
  }
};

// Update a post
export const updateGoalPost = async (postId, content, photo) => {
  try {
    const formData = new FormData();
    formData.append('content', content);
    
    if (photo) {
      console.log('Appending photo to update form data:', photo);
      formData.append('photo', photo);
    }
    
    // Log form data for debugging
    for (let [key, value] of formData.entries()) {
      console.log(`${key}: ${value instanceof File ? 'File: ' + value.name : value}`);
    }
    
    const response = await axios.put(
      `${API_URL}/api/goal-posts/update/${postId}`, 
      formData, 
      getFileUploadHeader()
    );
    
    console.log('Update post API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error updating goal post:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
      console.error('Response status:', error.response.status);
    }
    throw error;
  }
};

// Delete a post
export const deleteGoalPost = async (postId) => {
  try {
    console.log(`Deleting post ${postId}`);
    const response = await axios.delete(
      `${API_URL}/api/goal-posts/delete/${postId}`, 
      getAuthHeader()
    );
    
    console.log('Delete post API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting goal post:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Add a comment to a post
export const addComment = async (postId, content) => {
  try {
    console.log(`Adding comment to post ${postId}: ${content}`);
    const response = await axios.post(
      `${API_URL}/api/goal-posts/comment/${postId}`, 
      { content }, 
      getAuthHeader()
    );
    
    console.log('Add comment API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error adding comment:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    console.log(`Deleting comment ${commentId}`);
    const response = await axios.delete(
      `${API_URL}/api/goal-posts/comment/${commentId}`, 
      getAuthHeader()
    );
    
    console.log('Delete comment API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error deleting comment:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
};

// Toggle like on a post
export const toggleLike = async (postId) => {
  try {
    console.log(`Toggling like on post ${postId}`);
    const response = await axios.post(
      `${API_URL}/api/goal-posts/like/${postId}`, 
      {}, 
      getAuthHeader()
    );
    
    console.log('Toggle like API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error toggling like:', error);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    throw error;
  }
}; 