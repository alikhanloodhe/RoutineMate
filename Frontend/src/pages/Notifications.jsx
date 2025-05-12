import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiCheck, FiChevronLeft, FiChevronRight, FiAlertCircle } from 'react-icons/fi';
import { getAllNotifications, markNotificationAsRead, markAllNotificationsAsRead } from '../services/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const fetchNotificationsData = async (page = 1) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await getAllNotifications(page);
      
      if (response) {
        setNotifications(response.notifications || []);
        setTotalPages(response.pagination?.totalPages || 1);
      } else {
        setNotifications([]);
        setTotalPages(1);
      }
    } catch (err) {
      console.error('Failed to fetch notifications:', err);
      setError('Failed to load notifications. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotificationsData(currentPage);
  }, [currentPage]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await markNotificationAsRead(notificationId);
      // Update local state after marking as read
      setNotifications(notifications.map(n => 
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (isMarkingAll) return;
    
    try {
      setIsMarkingAll(true);
      await markAllNotificationsAsRead();
      // Update local state
      setNotifications(notifications.map(n => 
        !n.is_read ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    } finally {
      setIsMarkingAll(false);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      className="container mx-auto px-4 py-6 max-w-4xl"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1C1C1C]">Notifications</h1>
        <motion.button
          onClick={handleMarkAllAsRead}
          className={`px-4 py-2 rounded-md text-sm font-medium flex items-center ${
            isMarkingAll 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-[#4A2BAF] text-white hover:bg-[#3D2291]'
          }`}
          whileHover={!isMarkingAll ? { scale: 1.02 } : {}}
          whileTap={!isMarkingAll ? { scale: 0.98 } : {}}
          disabled={isMarkingAll}
        >
          {isMarkingAll ? (
            <>
              <div className="w-4 h-4 border-2 border-gray-400 border-t-gray-600 rounded-full animate-spin mr-2"></div>
              Processing...
            </>
          ) : (
            <>
              <FiCheck className="mr-2" />
              Mark all as read
            </>
          )}
        </motion.button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-100">
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-8 h-8 border-4 border-gray-200 border-t-[#4A2BAF] rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 px-4">
            <FiAlertCircle className="mx-auto mb-4 text-red-500" size={36} />
            <p className="text-red-500">{error}</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FiCheck className="text-gray-400" size={24} />
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-1">All caught up!</h3>
            <p className="text-gray-500">You don't have any notifications at the moment.</p>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                    notification.is_read ? 'bg-white' : 'bg-[#f9f7ff]'
                  }`}
                  whileHover={{ backgroundColor: '#f8f8f8' }}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-3 h-3 rounded-full mt-1.5 flex-shrink-0 ${
                      notification.is_read 
                        ? 'bg-gray-300' 
                        : 'bg-[#4A2BAF] ring-2 ring-purple-100'
                    }`}></div>
                    <div className="flex-grow">
                      <div className="flex justify-between items-start">
                        <h3 className={`text-md ${notification.is_read ? 'font-medium text-gray-800' : 'font-semibold text-gray-900'}`}>
                          {notification.title}
                        </h3>
                        {!notification.is_read && (
                          <motion.button
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs text-[#4A2BAF] hover:text-[#3D2291] font-medium ml-2"
                            whileHover={{ scale: 1.05 }}
                          >
                            Mark as read
                          </motion.button>
                        )}
                      </div>
                      <p className={`text-sm mt-1 ${notification.is_read ? 'text-gray-600' : 'text-gray-700'}`}>
                        {notification.message}
                      </p>
                      <div className="mt-2 flex justify-between">
                        <span className="text-xs text-gray-500">
                          {formatDate(notification.created_at)}
                        </span>
                        {notification.read_at && (
                          <span className="text-xs text-gray-400">
                            Read: {formatDate(notification.read_at)}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-between items-center py-4 px-6 border-t border-gray-100">
                <motion.button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className={`flex items-center text-sm ${
                    currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-[#4A2BAF] hover:text-[#3D2291]'
                  }`}
                  whileHover={currentPage !== 1 ? { x: -2 } : {}}
                >
                  <FiChevronLeft className="mr-1" />
                  Previous
                </motion.button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <motion.button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className={`flex items-center text-sm ${
                    currentPage === totalPages 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-[#4A2BAF] hover:text-[#3D2291]'
                  }`}
                  whileHover={currentPage !== totalPages ? { x: 2 } : {}}
                >
                  Next
                  <FiChevronRight className="ml-1" />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
};

export default Notifications; 