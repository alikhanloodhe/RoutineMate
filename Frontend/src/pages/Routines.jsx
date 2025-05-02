import React, { useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
import { motion } from 'framer-motion';

const Routines = () => {
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
            <h1 className="text-2xl font-bold text-[#1C1C1C] mb-4">Routines</h1>
            <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
              <div className="bg-[#4A2BAF]/5 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#4A2BAF]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">No Routines Yet</h2>
              <p className="text-gray-500 max-w-md mb-6">Create your first routine to organize your daily tasks and track your progress</p>
              <button className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                Create Routine
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Routines; 