import React, { useState } from 'react';
import Header from '../components/header/Header';
import Sidebar from '../components/sidebar/Sidebar';
// import { motion } from 'framer-motion';

const Help = () => {
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
            <h1 className="text-2xl font-bold text-[#1C1C1C] mb-4">Help & Support</h1>
            <div className="bg-white rounded-xl shadow-sm p-10">
              <div className="max-w-3xl mx-auto">
                <div className="bg-[#111827]/5 w-20 h-20 rounded-full flex items-center justify-center mb-6 mx-auto">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-[#111827]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                
                <h2 className="text-xl font-semibold text-[#1C1C1C] mb-6 text-center">Frequently Asked Questions</h2>
                
                <div className="space-y-6">
                  <motion.div 
                    className="border border-gray-100 p-4 rounded-lg"
                    whileHover={{ x: 5, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                  >
                    <h3 className="font-medium text-[#111827] mb-2">How do I create a new routine?</h3>
                    <p className="text-gray-600 text-sm">Navigate to the Routines page and click on the "Create Routine" button. Fill in the details and save your new routine.</p>
                  </motion.div>
                  
                  <motion.div 
                    className="border border-gray-100 p-4 rounded-lg"
                    whileHover={{ x: 5, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                  >
                    <h3 className="font-medium text-[#111827] mb-2">How do I track my habits?</h3>
                    <p className="text-gray-600 text-sm">Go to the Habits page, create a habit, and mark it as completed each day. You'll see your streak grow as you maintain consistency.</p>
                  </motion.div>
                  
                  <motion.div 
                    className="border border-gray-100 p-4 rounded-lg"
                    whileHover={{ x: 5, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                  >
                    <h3 className="font-medium text-[#111827] mb-2">Can I set reminders for my tasks?</h3>
                    <p className="text-gray-600 text-sm">Yes, when creating or editing a task, you can set a reminder notification that will alert you at the specified time.</p>
                  </motion.div>
                  
                  <motion.div 
                    className="border border-gray-100 p-4 rounded-lg"
                    whileHover={{ x: 5, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                  >
                    <h3 className="font-medium text-[#111827] mb-2">How do I connect with friends?</h3>
                    <p className="text-gray-600 text-sm">Navigate to the Friends page and search for your friends by username or email. Send them a friend request to get connected.</p>
                  </motion.div>
                </div>
                
                <div className="mt-8 text-center">
                  <p className="text-gray-600 mb-4">Still have questions? We're here to help!</p>
                  <button className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200">
                    Contact Support
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Help; 