import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';
import PasswordStrengthBar from 'react-password-strength-bar';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';

const Signup = () => {
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    password: '', 
    confirmPassword: '' 
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();
  const { errorToast, successToast } = useToastContext();
  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Check password match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      errorToast('Passwords do not match');
      setLoading(false);
      return;
    }

    // Check agreement to terms
    if (!agreeToTerms) {
      setError('Please agree to the Terms of Service');
      errorToast('Please agree to the Terms of Service');
      setLoading(false);
      return;
    }

    // Prepare data for submission (excluding confirmPassword)
    // eslint-disable-next-line no-unused-vars
    const { confirmPassword, ...submitData } = formData;

    try {
      // Use the register function from AuthContext
      const result = await register(submitData);

      if (result.success) {
        // Clear form and redirect to login
        setFormData({ name: '', email: '', password: '', confirmPassword: '' });
        successToast('Registration successful! Please login with your credentials.');
        navigate('/login');
      } else {
        setError(result.error || 'Signup failed. Please try again.');
        errorToast(result.error || 'Signup failed. Please try again.');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const errorMsg = 'Network error. Please try again later.';
      setError(errorMsg);
      errorToast(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row-reverse bg-gray-50">
      {/* Left Section (Illustration - now on right on desktop) */}
      <motion.div 
        className="hidden md:flex md:w-1/2 bg-[#111827] items-center justify-center p-10"
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h2 className="text-3xl font-bold text-white mb-4">Start Your Journey with RoutineMate</h2>
            <p className="text-gray-300 text-lg mb-6">
              Take the first step towards building better habits and achieving your goals.
            </p>
            <motion.div 
              className="w-full h-64 bg-[#4A2BAF]/20 rounded-xl flex items-center justify-center"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <p className="text-xl italic text-[#5D4EFF] px-6">
                "The journey of a thousand miles begins with a single step."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section (Signup Form - now on left on desktop) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-lg"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">Join RoutineMate</h2>
              <p className="text-gray-600 mb-6">Start Building Better Days</p>
            </motion.div>
            
            <AnimatePresence>
              {error && (
                <motion.div 
                  className="bg-red-50 border-l-4 border-red-400 p-4 mb-6 rounded-md"
                  initial={{ opacity: 0, x: 20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
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
                    placeholder="Your name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent bg-gray-50 placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
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
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent bg-gray-50 placeholder-gray-400"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(74, 43, 175, 0.2)" }}
                    transition={{ duration: 0.2 }}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Create a strong password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent bg-gray-50 placeholder-gray-400"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={togglePasswordVisibility}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showPassword ? 
                        <FiEyeOff className="text-gray-400 hover:text-gray-600" /> : 
                        <FiEye className="text-gray-400 hover:text-gray-600" />
                      }
                    </motion.div>
                  </div>
                </div>
                {formData.password && (
                  <PasswordStrengthBar 
                    password={formData.password} 
                    scoreWords={['Weak', 'Weak', 'Okay', 'Good', 'Strong']}
                    scoreColors={['#ff4d4f', '#ff7875', '#ffa940', '#4A2BAF', '#5D4EFF']}
                    className="mt-1"
                  />
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Must be at least 8 characters with uppercase, lowercase, number and special character
                </p>
              </div>
              
              <div className="mb-6">
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
                    placeholder="Re-enter your password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2BAF] focus:border-transparent bg-gray-50 placeholder-gray-400"
                  />
                  <div 
                    className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                    onClick={toggleConfirmPasswordVisibility}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      {showConfirmPassword ? 
                        <FiEyeOff className="text-gray-400 hover:text-gray-600" /> : 
                        <FiEye className="text-gray-400 hover:text-gray-600" />
                      }
                    </motion.div>
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <motion.div 
                  className="flex items-center"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <input
                    id="terms"
                    name="terms"
                    type="checkbox"
                    checked={agreeToTerms}
                    onChange={() => setAgreeToTerms(!agreeToTerms)}
                    className="h-4 w-4 text-[#4A2BAF] focus:ring-[#4A2BAF] border-gray-300 rounded cursor-pointer"
                  />
                  <label htmlFor="terms" className="ml-2 block text-sm text-gray-600 cursor-pointer">
                    I agree to the <a href="#" className="text-[#4A2BAF] hover:text-[#5D4EFF]">Terms of Service</a>
                  </label>
                </motion.div>
              </div>
              
              <motion.button 
                type="submit" 
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] hover:from-[#3D249A] hover:to-[#4D3FE0] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2BAF] transition-all duration-200"
                disabled={loading}
                whileHover={{ translateY: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating Account...
                  </span>
                ) : 'Create Account'}
              </motion.button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Already have an account?{' '}
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/login" className="text-[#4A2BAF] hover:text-[#5D4EFF] font-medium">
                    Login
                  </Link>
                </motion.span>
              </p>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Signup;
