import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Handle responsive sidebar collapse based on window width
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 1024 && sidebarOpen) {
        setSidebarOpen(false);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    // Set initial state based on window width
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
    
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div 
        className={`transition-all duration-300 ${
          windowWidth >= 1024 ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'
        }`}
      >
        <Header toggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="overflow-auto p-4 pt-0">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Layout; 