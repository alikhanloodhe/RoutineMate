import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiCalendar } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { useToastContext } from '../context/ToastContext';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();
  const { errorToast, successToast } = useToastContext();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error when user starts typing again
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const result = await login(formData);
      
      if (result.success) {
        successToast('Login successful!');
        navigate('/dashboard');
      } else {
        // Handle verification error specifically
        if (result.isVerificationError) {
          setError(result.error);
          errorToast(result.error);
        } else {
          setError(result.error || 'Login failed. Please check your credentials.');
          errorToast(result.error || 'Login failed. Please check your credentials.');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Network error. Please try again later.');
      errorToast('Network error. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Left Section (App Introduction) - Now with gradient background */}
      <motion.div 
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[#4A2BAF] to-[#5D4EFF] items-center justify-center p-10"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="max-w-md text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <div className="mb-10 flex justify-center">
              <div className="w-16 h-16 rounded-lg bg-white flex items-center justify-center shadow-lg">
                <FiCalendar className="text-[#4A2BAF]" size={32} />
              </div>
            </div>
            <h2 className="text-3xl font-bold text-white mb-4">Welcome to RoutineMate</h2>
            <p className="text-white/90 text-lg mb-6">
              Organize your routines, track your progress, and achieve your goals one day at a time.
            </p>
            <motion.div 
              className="w-full h-64 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center overflow-hidden shadow-sm border border-white/20"
              whileHover={{ scale: 1.03 }}
              transition={{ duration: 0.2 }}
            >
              <div className="px-6 text-center">
                <blockquote className="text-xl italic text-white">
                  "The secret of your future is hidden in your daily routine."
                </blockquote>
                <p className="mt-4 text-white/70">— Mike Murdock</p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.div>

      {/* Right Section (Login Form) */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-white">
        <motion.div 
          className="w-full max-w-md"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-center md:hidden mb-8">
            <div className="w-16 h-16 rounded-lg bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center shadow-lg">
              <FiCalendar className="text-white" size={32} />
            </div>
          </div>
          
          <motion.div 
            className="bg-white p-8 rounded-xl shadow-md"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              <h2 className="text-2xl font-bold mb-1 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">Welcome Back</h2>
              <p className="text-gray-600 mb-6">Sign in to continue your journey</p>
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
            
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiMail className="text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)" }}
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
              
              <div className="mb-6">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <a href="#" className="text-xs text-[#4A2BAF] hover:text-[#5D4EFF]">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FiLock className="text-gray-400" />
                  </div>
                  <motion.input
                    whileFocus={{ scale: 1.01, boxShadow: "0 0 0 2px rgba(79, 70, 229, 0.2)" }}
                    transition={{ duration: 0.2 }}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Your password"
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
              </div>
              
              <motion.button 
                type="submit" 
                className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#4A2BAF] transition-all duration-200"
                disabled={loading}
                whileHover={{ translateY: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </div>
                ) : 'Sign In'}
              </motion.button>
            </form>
            
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <motion.span whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link to="/signup" className="text-[#4A2BAF] hover:text-[#5D4EFF] font-medium">
                    Sign up
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

export default Login;
