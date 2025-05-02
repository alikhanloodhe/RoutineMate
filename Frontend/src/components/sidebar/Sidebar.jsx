import React from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiHome, FiCalendar, FiCheckSquare, FiTarget, 
  FiRepeat, FiUsers, FiLogOut, FiHelpCircle
} from 'react-icons/fi';

const Sidebar = ({ sidebarOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };
  
  const navigation = [
    { name: 'Dashboard', icon: <FiHome size={18} />, href: '/dashboard' },
    { name: 'Routines', icon: <FiCalendar size={18} />, href: '/routines' },
    { name: 'Tasks', icon: <FiCheckSquare size={18} />, href: '/tasks' },
    { name: 'Goals', icon: <FiTarget size={18} />, href: '/goals' },
    { name: 'Habits', icon: <FiRepeat size={18} />, href: '/habits' },
    { name: 'Friends', icon: <FiUsers size={18} />, href: '/friends' },
    { name: 'Help', icon: <FiHelpCircle size={18} />, href: '/help' },
  ];

  return (
    <motion.div
      className={`bg-[#111827] h-full fixed lg:relative transition-all z-20 ${
        sidebarOpen ? 'w-64' : 'w-0 lg:w-16 overflow-hidden'
      }`}
      initial={false}
      animate={{ 
        width: sidebarOpen ? 256 : (window.innerWidth >= 1024 ? 64 : 0),
        boxShadow: sidebarOpen ? '4px 0 15px rgba(0, 0, 0, 0.05)' : 'none'
      }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      <div className="flex flex-col h-full py-6">
        <div className="flex justify-center mb-6">
          {sidebarOpen ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-xl font-bold text-white"
            >
              <span className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">Routine</span>
              <span>Mate</span>
            </motion.div>
          ) : (
            <motion.div 
              animate={{ scale: [0.9, 1.1, 1] }}
              transition={{ duration: 0.5 }}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white font-semibold text-sm"
            >
              RM
            </motion.div>
          )}
        </div>
        
        <div className="px-3 py-2">
          {sidebarOpen && (
            <div className="opacity-60 uppercase text-xs font-semibold tracking-wider text-gray-400 mb-3 px-3">
              Main Menu
            </div>
          )}
          
          <nav className="flex-1 space-y-1">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              
              return (
                <NavLink
                  key={item.name}
                  to={item.href}
                  className={({ isActive }) => `
                    group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                    ${isActive
                      ? 'bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                    }
                    ${!sidebarOpen && 'justify-center'}
                  `}
                >
                  <motion.div 
                    className={`${isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} 
                      ${sidebarOpen ? 'mr-3' : 'mr-0'}`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {item.icon}
                  </motion.div>
                  
                  {sidebarOpen && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                  
                  {!sidebarOpen && isActive && (
                    <motion.div
                      className="absolute left-0 w-1 h-8 bg-[#5D4EFF] rounded-r-full"
                      layoutId="activeIndicator"
                      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                    />
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>
        
        <div className="mt-auto px-3">
          {sidebarOpen && (
            <div className="border-t border-gray-800 pt-4 mt-6">
              <div className="bg-gray-900/50 rounded-lg p-3 mb-4">
                <div className="text-gray-400 text-xs mb-2">Logged in as</div>
                <div className="text-white text-sm font-medium">{JSON.parse(localStorage.getItem('user'))?.name || 'User'}</div>
                <div className="text-gray-500 text-xs truncate">
                  {JSON.parse(localStorage.getItem('user'))?.email || 'user@example.com'}
                </div>
              </div>
            </div>
          )}
          
          <button
            onClick={handleLogout}
            className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200
              ${!sidebarOpen && 'justify-center'}`}
          >
            <motion.div 
              className="text-gray-400 group-hover:text-red-400"
              whileHover={{ scale: 1.1, rotate: 10 }}
              whileTap={{ scale: 0.95 }}
            >
              <FiLogOut size={18} />
            </motion.div>
            
            {sidebarOpen && (
              <motion.span 
                className="ml-3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.1 }}
              >
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default Sidebar; 