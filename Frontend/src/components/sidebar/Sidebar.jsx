import React, { useEffect } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiHome,
  FiCalendar,
  FiCheckSquare,
  FiTarget,
  FiRepeat,
  FiUsers,
  FiLogOut,
  FiChevronLeft,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { useAuth } from "../../context/AuthContext";

const Sidebar = ({ sidebarOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = window.innerWidth < 1024;
  const { logout, user } = useAuth();

  // Close sidebar on navigation in mobile view
  useEffect(() => {
    if (isMobile && sidebarOpen) {
      toggleSidebar();
    }
  }, [location.pathname, isMobile]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Get user data safely
  const userName = user?.name || user?.username || "User";
  const userEmail = user?.email || "user@example.com";

  const navigation = [
    { name: "Dashboard", icon: <FiHome size={18} />, href: "/dashboard" },
    { name: "Routines", icon: <FiCalendar size={18} />, href: "/routines" },
    { name: "Tasks", icon: <FiCheckSquare size={18} />, href: "/tasks" },
    { name: "Goals", icon: <FiTarget size={18} />, href: "/goals" },
    { name: "Habits", icon: <FiRepeat size={18} />, href: "/habits" },
    { name: "Friends", icon: <FiUsers size={18} />, href: "/friends" },
  ];

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10"
          onClick={toggleSidebar}
        />
      )}

      <AnimatePresence>
        <motion.div
          className={`bg-[#111827] h-screen fixed top-0 left-0 z-20 overflow-hidden border-r border-gray-700
            ${sidebarOpen ? "w-64" : "w-0 lg:w-16"}`}
          initial={false}
          animate={{
            width: sidebarOpen ? 256 : window.innerWidth >= 1024 ? 64 : 0,
            boxShadow:
              sidebarOpen && !isMobile
                ? "2px 0 10px rgba(0, 0, 0, 0.05)"
                : "none",
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="flex flex-col h-full">
            {/* Header with Logo and Toggle Button */}
            <div className="px-3  py-4 flex items-center justify-between border-b border-gray-700">
              <motion.button
                onClick={toggleSidebar}
                className="p-2 rounded-full hover:bg-gray-800 text-gray-300 focus:outline-none"
                whileTap={{ scale: 0.95 }}
              >
                {sidebarOpen ? (
                  <FiChevronLeft size={23} />
                ) : (
                  <FiMenu size={23} />
                )}
              </motion.button>

              {sidebarOpen && (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white font-semibold mr-2">
                    RM
                  </div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] bg-clip-text text-transparent">
                    RoutineMate
                  </h1>
                </motion.div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto py-6">
              <nav className="px-2 space-y-2">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;

                  return (
                    <NavLink
                      key={item.name}
                      to={item.href}
                      className={({ isActive }) => `
                        group flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                        ${
                          isActive
                            ? "bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white"
                            : "text-gray-300 hover:bg-gray-800 hover:text-white"
                        }
                        ${!sidebarOpen && "justify-center"}
                      `}
                    >
                      <motion.div
                        className={`${
                          isActive
                            ? "text-white"
                            : "text-gray-400 group-hover:text-white"
                        } 
                          ${sidebarOpen ? "mr-3" : "mr-0"}`}
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
                          transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                          }}
                        />
                      )}
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            <div className="border-t border-gray-700 p-3">
              {sidebarOpen && (
                <div className="bg-gray-800/50 rounded-lg p-2 mb-3">
                  <div className="text-gray-400 text-xs mb-0.5">
                    Logged in as
                  </div>
                  <div className="text-white text-xs font-medium">
                    {userName}
                  </div>
                  <div className="text-gray-500 text-xs truncate">
                    {userEmail}
                  </div>
                </div>
              )}

              <button
                onClick={handleLogout}
                className={`group flex items-center px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-red-500/20 hover:text-red-400 transition-colors duration-200
                  ${!sidebarOpen && "justify-center"}`}
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
      </AnimatePresence>
    </>
  );
};

export default Sidebar;
