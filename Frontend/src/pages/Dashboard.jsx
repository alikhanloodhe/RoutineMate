/*
* IMPORTANT: Page Layout Structure
* 
* When integrating new pages or components, please follow this structure:
* 1. Import Header and Sidebar components
* 2. Add sidebarOpen state and toggleSidebar function
* 3. Wrap the page content in the following layout:
*    - Root div with "min-h-screen" and appropriate background
*    - Header component with toggleSidebar and sidebarOpen props
*    - Flex container with sidebar and main content
*    - Sidebar component with sidebarOpen prop
*    - Main content div with conditional margin when sidebar is closed
*
* This ensures consistent layout and sidebar toggle functionality across all pages.
*/

// src/pages/Dashboard.jsx
import React, { useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import { FiChevronRight, FiCalendar, FiCheckSquare, FiTarget } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  // Mock user data
  const user = JSON.parse(localStorage.getItem('user')) || { name: 'User' };
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#f6f6f6]">
      <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
      
      {/* Main Content with Sidebar */}
      <div className="flex h-[calc(100vh-60px)]">
        <Sidebar sidebarOpen={sidebarOpen} />
        
        {/* Main content */}
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#1C1C1C]">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name}!</p>
          </div>
          
          {/* Dashboard Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {/* Active routines card */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-[#1C1C1C]">Active Routines</h2>
                  <p className="text-3xl font-bold mt-2 text-[#4A2BAF]">3</p>
                </div>
                <div className="p-3 bg-[#4A2BAF]/10 rounded-xl">
                  <FiCalendar className="h-6 w-6 text-[#4A2BAF]" />
                </div>
              </div>
              <div className="mt-4">
                <Link to="/routines" className="text-sm font-medium text-[#4A2BAF] hover:text-[#5D4EFF] flex items-center">
                  View all routines <FiChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
            
            {/* Today's tasks card */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-[#1C1C1C]">Today's Tasks</h2>
                  <p className="text-3xl font-bold mt-2 text-[#5D4EFF]">5</p>
                </div>
                <div className="p-3 bg-[#5D4EFF]/10 rounded-xl">
                  <FiCheckSquare className="h-6 w-6 text-[#5D4EFF]" />
                </div>
              </div>
              <div className="mt-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">3 completed</span>
                  <span className="text-gray-900 font-medium">60%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
            </motion.div>
            
            {/* Goals progress card */}
            <motion.div 
              className="bg-white p-6 rounded-xl shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              whileHover={{ 
                y: -5,
                boxShadow: "0 10px 20px rgba(0, 0, 0, 0.1)",
                transition: { duration: 0.2 }
              }}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-lg font-medium text-[#1C1C1C]">Active Goals</h2>
                  <p className="text-3xl font-bold mt-2 text-[#111827]">2</p>
                </div>
                <div className="p-3 bg-[#111827]/10 rounded-xl">
                  <FiTarget className="h-6 w-6 text-[#111827]" />
                </div>
              </div>
              <div className="mt-4">
                <Link to="/goals" className="text-sm font-medium text-[#111827] hover:text-black flex items-center">
                  View all goals <FiChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            </motion.div>
          </div>
          
          {/* Recent Activity Section */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm p-6 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <h2 className="text-lg font-medium text-[#1C1C1C] mb-4">Recent Activity</h2>
            <div className="space-y-4">
              {/* Activity items */}
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#4A2BAF]/10 flex items-center justify-center text-[#4A2BAF] mr-3">
                  <FiCheckSquare />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1C1C]">Completed "Morning Workout" task</p>
                  <p className="text-xs text-gray-500 mt-1">Today, 8:30 AM</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.6 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#5D4EFF]/10 flex items-center justify-center text-[#5D4EFF] mr-3">
                  <FiTarget />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1C1C]">Updated goal "Read 10 books"</p>
                  <p className="text-xs text-gray-500 mt-1">Yesterday, 7:45 PM</p>
                </div>
              </motion.div>
              
              <motion.div 
                className="flex items-start"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.7 }}
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#111827]/10 flex items-center justify-center text-[#111827] mr-3">
                  <FiCalendar />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1C1C1C]">Created new routine "Evening Meditation"</p>
                  <p className="text-xs text-gray-500 mt-1">2 days ago, 9:15 PM</p>
                </div>
              </motion.div>
            </div>
            
            <div className="mt-4 pt-4 border-t">
              <motion.a 
                href="#" 
                className="text-sm font-medium text-[#4A2BAF] hover:text-[#5D4EFF] flex items-center"
                whileHover={{ x: 5, transition: { duration: 0.2 } }}
              >
                View all activity <FiChevronRight className="ml-1 h-4 w-4" />
              </motion.a>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;