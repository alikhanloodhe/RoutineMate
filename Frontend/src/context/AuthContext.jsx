import React, { createContext, useState, useContext, useEffect } from 'react';

// Create context
const AuthContext = createContext();

// Helper function to decode JWT token and check expiration
const decodeToken = (token) => {
  try {
    // JWT tokens are made of three parts: header.payload.signature
    // We need the payload part which is the second part (index 1)
    const base64Url = token.split('.')[1];
    
    // Convert base64url to base64
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Decode the payload
    const payload = JSON.parse(window.atob(base64));
    
    return {
      ...payload,
      isExpired: payload.exp ? payload.exp * 1000 < Date.now() : false
    };
  } catch (error) {
    console.error('Error decoding token:', error);
    return { isExpired: true };
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Set API URL with fallback
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Check if token is valid or expired
  const checkTokenValidity = () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }
    
    const decodedToken = decodeToken(token);
    
    if (decodedToken.isExpired) {
      // Token is expired, clear auth data
      logout();
      return false;
    }
    
    return true;
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        // Get token from localStorage
        const token = localStorage.getItem('token');
        
        if (!token) {
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Check if token is expired
        const decodedToken = decodeToken(token);
        if (decodedToken.isExpired) {
          console.log('Token expired, logging out');
          localStorage.removeItem('token');
          setIsAuthenticated(false);
          setUser(null);
          setLoading(false);
          return;
        }
        
        // Validate token with backend (optional - you can implement this later)
        // For now, just check if token exists
        setIsAuthenticated(true);
        
        // Try to get user from localStorage - for backward compatibility check both formats
        let userData = null;
        
        // Check for user object (original format)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          try {
            userData = JSON.parse(storedUser);
          } catch (e) {
            console.error('Error parsing user data from localStorage:', e);
          }
        }
        
        // If no user object, try individual fields (new format)
        if (!userData) {
          const userId = localStorage.getItem('userId');
          const email = localStorage.getItem('userEmail');
          const username = localStorage.getItem('username');
          
          if (userId || email || username) {
            userData = {
              id: userId,
              email,
              username
            };
          }
        }
        
        setUser(userData);
      } catch (error) {
        console.error('Auth check error:', error);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuthStatus();
  }, []);

  // Set up periodic token validation check
  useEffect(() => {
    // Check token validity every minute
    const tokenCheckInterval = setInterval(() => {
      if (isAuthenticated && !checkTokenValidity()) {
        console.log('Token expired during session, logging out');
        setIsAuthenticated(false);
        setUser(null);
        // The logout function will be called by checkTokenValidity
      }
    }, 60000); // check every minute
    
    return () => clearInterval(tokenCheckInterval);
  }, [isAuthenticated]);

  const login = async (credentials) => {
    try {
      setLoading(true);
      console.log('Attempting login with credentials to API:', `${apiUrl}/api/auth/login`);
      
      // Make login API call
      const response = await fetch(`${apiUrl}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const data = await response.json();
      console.log('Login response:', response.status, data);
      
      if (response.ok) {
        // Save token to localStorage
        localStorage.setItem('token', data.token);
        
        // Save user details in both formats for compatibility
        if (data.user) {
          // For new format
          localStorage.setItem('userId', data.user.id);
          localStorage.setItem('userEmail', data.user.email);
          localStorage.setItem('username', data.user.username || data.user.name);
          
          // For old format - maintain compatibility
          localStorage.setItem('user', JSON.stringify(data.user));
          
          setUser(data.user);
        }
        
        setIsAuthenticated(true);
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || 'Login failed. Please check your credentials.'
        };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during login'
      };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting registration with data to API:', `${apiUrl}/api/auth/signup`);
      
      // Make register API call
      const response = await fetch(`${apiUrl}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('Registration response:', response.status, data);
      
      if (response.ok) {
        // Some APIs return token after register, some don't
        if (data.token) {
          localStorage.setItem('token', data.token);
          setIsAuthenticated(true);
          
          // Save user if available - in both formats
          if (data.user) {
            // For new format
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('userEmail', data.user.email);
            localStorage.setItem('username', data.user.username || data.user.name);
            
            // For old format - maintain compatibility
            localStorage.setItem('user', JSON.stringify(data.user));
            
            setUser(data.user);
          }
        }
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during registration'
      };
    } finally {
      setLoading(false);
    }
  };

  const updateUserProfile = async (userData) => {
    try {
      setLoading(true);
      console.log('Attempting to update user profile:', userData);
      
      const token = localStorage.getItem('token');
      if (!token) {
        return { 
          success: false, 
          error: 'Authentication required. Please log in again.'
        };
      }
      
      // Make update profile API call
      const response = await fetch(`${apiUrl}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData),
      });
      
      const data = await response.json();
      console.log('Profile update response:', response.status, data);
      
      if (response.ok) {
        // Update user data in state and localStorage
        const updatedUser = {
          ...user,
          ...data.user
        };
        
        // Update in state
        setUser(updatedUser);
        
        // Update in localStorage (both formats)
        localStorage.setItem('userId', updatedUser.id);
        localStorage.setItem('userEmail', updatedUser.email);
        localStorage.setItem('username', updatedUser.name || updatedUser.username);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        return { success: true };
      } else {
        return { 
          success: false, 
          error: data.message || 'Failed to update profile'
        };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { 
        success: false, 
        error: error.message || 'An error occurred during profile update'
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    // Clear all auth-related data
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('username');
    localStorage.removeItem('user'); // Also clear the old format
    
    setUser(null);
    setIsAuthenticated(false);
  };

  // Provide auth context value
  const value = {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    updateUserProfile,
    checkTokenValidity
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 