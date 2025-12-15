import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../header/Header';
import Sidebar from '../sidebar/Sidebar';

// Import graphics components (Computer Graphics concepts)
import { Mascot3D, CelebrationParticles } from '../graphics';

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const celebrationRef = useRef(null);

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

  // Function to trigger celebration (can be passed to children via context if needed)
  const triggerCelebration = (x, y) => {
    if (celebrationRef.current) {
      celebrationRef.current.celebrate(x, y);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Global Celebration Particles - triggered on achievements */}
      <CelebrationParticles ref={celebrationRef} />

      {/* 3D Robot Mascot - bottom right corner, visible on all screens */}
      <div className="block">
        <Mascot3D
          size={windowWidth < 640 ? 80 : 120}
          position="bottom-right"
          onCelebrate={triggerCelebration}
        />
      </div>

      <Sidebar sidebarOpen={sidebarOpen} toggleSidebar={toggleSidebar} />
      <div
        className={`transition-all duration-300 ${windowWidth >= 1024 ? (sidebarOpen ? 'ml-64' : 'ml-16') : 'ml-0'
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