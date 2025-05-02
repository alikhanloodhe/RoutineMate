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

import React, { useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import { motion } from 'framer-motion';

const Goals = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
      <div className="min-h-screen bg-[#FAF3E0]">
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        
        <div className="flex h-[calc(100vh-60px)]">
          <Sidebar sidebarOpen={sidebarOpen} />
          
        <div className={`flex-1 p-6 ${!sidebarOpen ? 'lg:ml-16' : ''} overflow-y-auto`}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-2xl font-bold text-[#1C1C1C] mb-4">Goals</h1>
            <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
              <div className="bg-[#111827]/5 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">No Goals Yet</h2>
              <p className="text-gray-500 max-w-md mb-6">Set your first goal to track your progress and achieve success</p>
              <button className="bg-[#111827] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Goal
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Goals; 