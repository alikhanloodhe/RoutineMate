import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiBell, FiUser, FiSettings, FiLogOut, FiMenu
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { logout, user } = useAuth();
  
  // Get user data safely
  const userName = user?.name || user?.username || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userImage = user?.image;
  
  // Mock notifications
  const notifications = [
    { id: 1, text: 'You completed your morning routine!', time: '2 hours ago', read: false },
    { id: 2, text: 'Goal "Read 10 books" is 70% complete', time: '5 hours ago', read: false },
    { id: 3, text: 'Daily step goal achieved', time: 'Yesterday', read: true },
  ];

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Handle scroll event to add shadow on scroll
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  const toggleNotifications = () => {
    setNotificationsOpen(!notificationsOpen);
    setProfileOpen(false);
  };
  
  const toggleProfile = () => {
    setProfileOpen(!profileOpen);
    setNotificationsOpen(false);
  };
  
  const handleProfileSettingsClick = () => {
    navigate('/profile-settings');
    setProfileOpen(false);
  };
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <motion.div 
      className={`bg-white px-4 py-3 flex justify-between items-center z-30 sticky top-0 transition-all duration-300 ${
        scrolled ? 'shadow-md' : ''
      }`}
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mobile hamburger menu */}
      {isMobile && (
        <motion.button 
          onClick={toggleSidebar} 
          className="p-2 rounded-full hover:bg-[#f0f0f0] text-[#1C1C1C] focus:outline-none"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <FiMenu size={20} />
        </motion.button>
      )}
      
      <div className={`flex items-center space-x-3 ${isMobile ? '' : 'ml-auto'}`}>
        {/* Notifications */}
        <div className="relative">
          <motion.button 
            onClick={toggleNotifications}
            className="p-2 rounded-full hover:bg-[#f0f0f0] text-[#1C1C1C] focus:outline-none relative"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiBell size={20} />
            {notifications.some(n => !n.read) && (
              <motion.span 
                className="absolute top-1 right-1 w-2 h-2 bg-[#4A2BAF] rounded-full"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              ></motion.span>
            )}
          </motion.button>
          
          {/* Notification dropdown */}
          <AnimatePresence>
            {notificationsOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
              >
                <div className="px-4 py-2 font-medium text-[#1C1C1C] border-b flex justify-between items-center">
                  <span>Notifications</span>
                  <span className="text-xs font-normal text-[#4A2BAF] cursor-pointer hover:underline">
                    Mark all as read
                  </span>
                </div>
                {notifications.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(notification => (
                      <motion.div 
                        key={notification.id} 
                        className={`px-4 py-3 hover:bg-[#f8f8f8] border-b border-gray-50 ${
                          notification.read ? 'opacity-60' : ''
                        }`}
                        whileHover={{ backgroundColor: '#f0f0f0' }}
                      >
                        <div className="flex justify-between">
                          <p className="text-sm font-medium text-[#1C1C1C]">{notification.text}</p>
                          {!notification.read && (
                            <span className="h-2 w-2 bg-[#4A2BAF] rounded-full mt-1.5"></span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
                <div className="px-4 py-2 border-t border-gray-100">
                  <a href="#" className="text-xs text-[#4A2BAF] hover:text-[#5D4EFF] font-medium">
                    View all notifications
                  </a>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {/* Profile */}
        <div className="relative">
          <motion.button 
            onClick={toggleProfile}
            className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#f0f0f0] text-[#1C1C1C] focus:outline-none"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white overflow-hidden">
              {userImage ? (
                <img src={userImage} alt={userName} className="w-full h-full object-cover" />
              ) : (
                <FiUser size={16} />
              )}
            </div>
            <span className="hidden md:block text-sm font-medium truncate max-w-[100px]">
              {userName}
            </span>
          </motion.button>
          
          {/* Profile dropdown */}
          <AnimatePresence>
            {profileOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
              >
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-sm font-medium text-[#1C1C1C]">{userName}</p>
                  <p className="text-xs text-gray-500 truncate mt-1">{userEmail}</p>
                </div>
                <motion.button
                  onClick={handleProfileSettingsClick}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8f8f8] flex items-center"
                  whileHover={{ backgroundColor: '#f0f0f0', x: 2 }}
                >
                  <FiUser className="mr-3 h-4 w-4 text-gray-500" />
                  Your Profile
                </motion.button>
                <motion.button
                  onClick={handleProfileSettingsClick}
                  className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-[#f8f8f8] flex items-center"
                  whileHover={{ backgroundColor: '#f0f0f0', x: 2 }}
                >
                  <FiSettings className="mr-3 h-4 w-4 text-gray-500" />
                  Settings
                </motion.button>
                <div className="border-t border-gray-100 my-1"></div>
                <motion.button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2.5 text-sm text-[#E53E3E] hover:bg-red-50 flex items-center"
                  whileHover={{ backgroundColor: '#FFF5F5', x: 2 }}
                >
                  <FiLogOut className="mr-3 h-4 w-4" />
                  Sign out
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default Header; 