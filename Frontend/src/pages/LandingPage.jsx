import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FiCheckCircle, FiArrowRight, FiCalendar, FiTrendingUp, FiUsers, FiClock } from 'react-icons/fi';

const LandingPage = () => {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };
  
  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };
  
  const featureVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5 }
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 overflow-hidden">
      {/* Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <motion.div
              initial={{ rotate: -10, scale: 0.9 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-lg bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center"
            >
              <span className="text-white font-bold text-xl">R</span>
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">RoutineMate</span>
          </div>
          
          <div className="flex items-center space-x-6">
            <Link to="/login" className="text-gray-700 hover:text-[#4A2BAF] transition-colors">Log In</Link>
            <Link to="/signup">
              <motion.button
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg shadow-sm hover:shadow transition-all"
              >
                Sign Up Free
              </motion.button>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center">
          <motion.div 
            className="lg:w-1/2 mb-10 lg:mb-0"
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6">
              Build Better <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">Routines</span>
            </h1>
            <p className="text-lg text-gray-600 mb-8 max-w-xl">
              RoutineMate helps you organize your life, track your progress, and achieve your goals through smart routine building.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg shadow-md hover:shadow-lg flex items-center justify-center"
                >
                  Get Started Free <FiArrowRight className="ml-2" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3 bg-white text-[#4A2BAF] border border-[#4A2BAF] rounded-lg hover:bg-gray-50 flex items-center justify-center"
                >
                  Login
                </motion.button>
              </Link>
            </div>
          </motion.div>
          
          <motion.div 
            className="lg:w-1/2"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-[#4A2BAF]/20 to-[#5D4EFF]/20 rounded-3xl transform rotate-3 scale-105"></div>
              <div className="relative bg-white p-6 rounded-2xl shadow-lg">
                <img 
                  src="https://placehold.co/600x400/5D4EFF/FFFFFF?text=RoutineMate+Dashboard" 
                  alt="RoutineMate Dashboard" 
                  className="rounded-lg shadow"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* Features Section */}
      <section className="py-20 bg-gray-100">
        <div className="max-w-6xl mx-auto px-6">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-3">What makes RoutineMate special?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              A comprehensive solution designed to transform how you manage your daily routines and achieve your goals.
            </p>
          </motion.div>
          
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Feature 1 */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={featureVariants}
            >
              <div className="w-12 h-12 bg-[#5D4EFF]/10 rounded-full flex items-center justify-center mb-4">
                <FiCalendar className="text-[#5D4EFF] text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Scheduling</h3>
              <p className="text-gray-600">
                Intelligently organize your day with AI-powered scheduling that works around your preferences.
              </p>
            </motion.div>
            
            {/* Feature 2 */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={featureVariants}
            >
              <div className="w-12 h-12 bg-[#5D4EFF]/10 rounded-full flex items-center justify-center mb-4">
                <FiTrendingUp className="text-[#5D4EFF] text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Goal Tracking</h3>
              <p className="text-gray-600">
                Set personal and group goals with milestones and track your progress visually.
              </p>
            </motion.div>
            
            {/* Feature 3 */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={featureVariants}
            >
              <div className="w-12 h-12 bg-[#5D4EFF]/10 rounded-full flex items-center justify-center mb-4">
                <FiUsers className="text-[#5D4EFF] text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Social Support</h3>
              <p className="text-gray-600">
                Connect with friends to share goals, celebrate achievements, and stay motivated.
              </p>
            </motion.div>
            
            {/* Feature 4 */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow"
              variants={featureVariants}
            >
              <div className="w-12 h-12 bg-[#5D4EFF]/10 rounded-full flex items-center justify-center mb-4">
                <FiClock className="text-[#5D4EFF] text-xl" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Habit Building</h3>
              <p className="text-gray-600">
                Create and maintain positive habits with reminders and streak tracking.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      
      {/* Testimonial Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-12">What Our Users Say</h2>
            
            <div className="bg-white rounded-2xl shadow-lg p-8 md:p-10 relative">
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-16 h-16 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center">
                  <span className="text-white text-2xl">"</span>
                </div>
              </div>
              <p className="text-lg md:text-xl italic text-gray-700 mb-6 pt-4">
                RoutineMate has completely transformed how I organize my day. With its intuitive interface and smart features, I'm more productive than ever before!
              </p>
              <div className="flex items-center justify-center">
                <div className="w-12 h-12 rounded-full bg-gray-200 mr-4"></div>
                <div className="text-left">
                  <h4 className="font-semibold">Sarah Johnson</h4>
                  <p className="text-gray-600 text-sm">Product Manager</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Ready to build better routines?</h2>
            <p className="text-white/80 max-w-2xl mx-auto mb-8">
              Join thousands of users who are achieving their goals with RoutineMate's powerful tools.
            </p>
            <Link to="/signup">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-white text-[#4A2BAF] rounded-lg shadow-md hover:shadow-lg flex items-center mx-auto"
              >
                Get Started Free <FiArrowRight className="ml-2" />
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-lg font-bold">RoutineMate</span>
              </div>
              <p className="text-gray-400 mt-2">
                Build better days, one routine at a time.
              </p>
            </div>
            
            <div className="flex space-x-8">
              <Link to="/login" className="text-gray-300 hover:text-white transition-colors">Login</Link>
              <Link to="/signup" className="text-gray-300 hover:text-white transition-colors">Sign Up</Link>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} RoutineMate. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage; 