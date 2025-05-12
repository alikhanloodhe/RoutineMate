import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiBell, FiUser, FiSettings, FiLogOut, FiMenu, FiCheck
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { getUnreadNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../../services/notificationService';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const navigate = useNavigate();
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const { logout, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Get user data safely
  const userName = user?.name || user?.username || 'User';
  const userEmail = user?.email || 'user@example.com';
  const userImage = user?.image;
  
  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getUnreadNotifications();
      setNotifications(data || []);
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Initial fetch of notifications when component mounts
  useEffect(() => {
    fetchNotifications();
    
    // Set up interval to fetch notifications every minute
    const intervalId = setInterval(fetchNotifications, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

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
  
  // Handle marking a notification as read
  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state after marking as read
      setNotifications(notifications.filter(n => n.id !== notificationId));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };
  
  // Handle marking all notifications as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications([]);
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };
  
  // Handle "View all notifications" click
  const handleViewAllNotifications = () => {
    navigate('/notifications');
    setNotificationsOpen(false);
  };

  return (
    <motion.div 
      className={`bg-white px-4 py-3 flex justify-between items-center z-30 sticky top-0 transition-all duration-300 border-b border-gray-200 ${
        scrolled ? 'shadow-sm' : ''
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
            {notifications.length > 0 && (
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
                  {notifications.length > 0 && (
                    <button
                      className="text-xs font-normal text-[#4A2BAF] cursor-pointer hover:underline flex items-center"
                      onClick={handleMarkAllAsRead}
                    >
                      <FiCheck className="mr-1" size={12} />
                      Mark all as read
                    </button>
                  )}
                </div>
                {isLoading ? (
                  <div className="px-4 py-3 text-sm text-gray-500 flex justify-center">
                    <div className="w-5 h-5 border-2 border-gray-200 border-t-[#4A2BAF] rounded-full animate-spin"></div>
                  </div>
                ) : error ? (
                  <div className="px-4 py-3 text-sm text-red-500">
                    {error}
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="max-h-60 overflow-y-auto">
                    {notifications.map(notification => (
                      <motion.div 
                        key={notification.id} 
                        className="px-4 py-3 hover:bg-[#f8f8f8] border-b border-gray-50 cursor-pointer bg-[#f9f7ff]"
                        whileHover={{ backgroundColor: '#f0f0f0' }}
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        <div className="flex justify-between">
                          <p className="text-sm font-semibold text-[#1C1C1C]">{notification.title}</p>
                          <span className="h-2 w-2 bg-[#4A2BAF] rounded-full mt-1.5 flex-shrink-0 ring-2 ring-purple-100"></span>
                        </div>
                        <p className="text-xs text-gray-700 mt-1">{notification.message}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(notification.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-3 text-sm text-gray-500">
                    No new notifications
                  </div>
                )}
                <div className="px-4 py-2 border-t border-gray-100">
                  <button
                    onClick={handleViewAllNotifications}
                    className="text-xs text-[#4A2BAF] hover:text-[#5D4EFF] font-medium"
                  >
                    View all notifications
                  </button>
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