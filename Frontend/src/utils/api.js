import axios from 'axios';

// Create axios instance with base URL from environment
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Add request interceptor to include timezone information in all requests
api.interceptors.request.use(
  (config) => {
    // Get the user's timezone
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone; // e.g., "America/New_York"
    
    // Calculate the offset in minutes (positive if ahead of UTC, negative if behind)
    const offsetInMinutes = new Date().getTimezoneOffset() * -1; // Note: getTimezoneOffset returns negative for east, positive for west
    
    // Add timezone info to headers
    config.headers['x-timezone'] = timezone;
    config.headers['x-timezone-offset'] = offsetInMinutes.toString();
    
    // Add auth token if available
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle common API errors here
    if (error.response && error.response.status === 401) {
      // Handle unauthorized errors (e.g., redirect to login)
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

export default api; 