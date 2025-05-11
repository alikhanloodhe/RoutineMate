/**
 * Service for interacting with the category-related API endpoints
 */

/**
 * Fetches all categories from the backend
 * @returns {Promise<Array>} Array of category objects with id and name properties
 */
export const fetchCategories = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Authentication required');
    }
    
    const response = await fetch(`${import.meta.env.VITE_API_URL}/api/categories`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error fetching categories:', errorData);
      throw new Error(errorData.message || 'Failed to fetch categories');
    }
    
    const categories = await response.json();
    return categories;
  } catch (error) {
    console.error('Error in fetchCategories:', error);
    throw error;
  }
};

export default {
  fetchCategories
}; 