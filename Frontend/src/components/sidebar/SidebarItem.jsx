// src/components/sidebar/SidebarItem.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
        isActive 
          ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 font-medium shadow-sm border-l-4 border-blue-600' 
          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
      }`}
    >
      <span className={`${isActive ? 'text-blue-600' : 'text-gray-500'}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default SidebarItem;