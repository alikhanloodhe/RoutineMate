// src/components/sidebar/SidebarItem.jsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const SidebarItem = ({ icon, label, to }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link
      to={to}
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive 
          ? 'bg-primary/10 text-primary font-medium' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <span className="text-lg">{icon}</span>
      <span>{label}</span>
    </Link>
  );
};

export default SidebarItem;