import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiSave } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';

const ProfileSettings = () => {
  const { user, updateUserProfile } = useAuth();
  const { successToast, errorToast } = useToastContext();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Load user data on component mount
  useEffect(() => {
    if (user) {
      setFormData(prevState => ({
        ...prevState,
        name: user.name || user.username || '',
        email: user.email || '',
      }));
    }
  }, [user]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
    
    // Clear any existing error for this field
    if (errors[name]) {
      setErrors(prevErrors => ({
        ...prevErrors,
        [name]: null
      }));
    }
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    // Password validation
    if (formData.newPassword) {
      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required to set a new password';
      }
      
      if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const dataToUpdate = {
        name: formData.name,
        email: formData.email
      };
      
      // Only include password fields if the user wants to update password
      if (formData.newPassword) {
        dataToUpdate.currentPassword = formData.currentPassword;
        dataToUpdate.newPassword = formData.newPassword;
      }
      
      const result = await updateUserProfile(dataToUpdate);
      
      if (result.success) {
        successToast('Profile updated successfully');
        // Clear password fields after successful update
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));
      } else {
        errorToast(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      errorToast('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-xl shadow-lg overflow-hidden"
      >
        <div className="p-6 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF]">
          <h1 className="text-2xl font-bold text-white">Profile Settings</h1>
          <p className="text-white/80 mt-1">Update your personal information</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {/* Name Field */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(74, 43, 175, 0.2)" }}
                  transition={{ duration: 0.2 }}
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                    errors.name ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } shadow-sm focus:outline-none sm:text-sm`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>
            
            {/* Email Field */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(74, 43, 175, 0.2)" }}
                  transition={{ duration: 0.2 }}
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-3 py-2 rounded-md border ${
                    errors.email ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } shadow-sm focus:outline-none sm:text-sm`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>
            
            <div className="col-span-2">
              <div className="relative py-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="px-3 bg-white text-sm text-gray-500">Change Password</span>
                </div>
              </div>
            </div>
            
            {/* Current Password Field */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(74, 43, 175, 0.2)" }}
                  transition={{ duration: 0.2 }}
                  type={showCurrentPassword ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 rounded-md border ${
                    errors.currentPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } shadow-sm focus:outline-none sm:text-sm`}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                >
                  {showCurrentPassword ? 
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" /> : 
                    <FiEye className="text-gray-400 hover:text-gray-600" />
                  }
                </div>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Enter your current password to change your password</p>
            </div>
            
            {/* New Password Field */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(74, 43, 175, 0.2)" }}
                  transition={{ duration: 0.2 }}
                  type={showNewPassword ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 rounded-md border ${
                    errors.newPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } shadow-sm focus:outline-none sm:text-sm`}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                >
                  {showNewPassword ? 
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" /> : 
                    <FiEye className="text-gray-400 hover:text-gray-600" />
                  }
                </div>
              </div>
              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">At least 8 characters with letters and numbers</p>
            </div>
            
            {/* Confirm Password Field */}
            <div className="col-span-2 md:col-span-1">
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <motion.input
                  whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(74, 43, 175, 0.2)" }}
                  transition={{ duration: 0.2 }}
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`block w-full pl-10 pr-10 py-2 rounded-md border ${
                    errors.confirmPassword ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  } shadow-sm focus:outline-none sm:text-sm`}
                />
                <div 
                  className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? 
                    <FiEyeOff className="text-gray-400 hover:text-gray-600" /> : 
                    <FiEye className="text-gray-400 hover:text-gray-600" />
                  }
                </div>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
              )}
            </div>
          </div>
          
          <div className="mt-6 flex justify-end">
            <motion.button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] hover:from-[#3D249A] hover:to-[#4D3FE0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2BAF]"
              whileHover={{ translateY: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving Changes...
                </>
              ) : (
                <>
                  <FiSave className="mr-2" />
                  Save Changes
                </>
              )}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ProfileSettings; 