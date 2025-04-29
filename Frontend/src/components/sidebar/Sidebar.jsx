// src/components/sidebar/Sidebar.jsx
import React from 'react';
import SidebarItem from './sidebaritem';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarClock, 
  Target, 
  ActivitySquare,
  LogOut,
  Users 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Sidebar = ({name}) => {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/dashboard' },
    { icon: <CheckSquare size={20} />, label: 'Tasks', to: '/tasks' },
    { icon: <CalendarClock size={20} />, label: 'Routines', to: '/routines' },
    { icon: <Target size={20} />, label: 'Goals', to: '/goals' },
    { icon: <ActivitySquare size={20} />, label: 'Habits', to: '/habits' },
    { icon: <Users size={20} />, label: 'Friends', to: '/friends' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/login';
  };

  return (
    <div className="w-64 h-screen bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-sm">
      {/* App Logo/Name */}
      <div className="p-6 border-b border-gray-200">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="h-8 w-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold">
            RT
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            RoutineMate
          </h1>
        </Link>
      </div>
      
      {/* Navigation */}
      <div className="mt-6 px-4">
        <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-4 mb-2">
          Main Menu
        </h2>
        <nav className="space-y-1">
          {navItems.map((item, index) => (
            <SidebarItem 
              key={index}
              icon={item.icon}
              label={item.label}
              to={item.to}
            />
          ))}
        </nav>
      </div>
      
      {/* User Profile */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-medium shadow-sm">
              {name ? name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <p className="font-medium text-gray-900">{name || 'User'}</p>
              <p className="text-xs text-gray-500">user@example.com</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-sm text-gray-700 hover:text-red-600 transition-colors py-2 border border-gray-200 rounded-md hover:bg-gray-50"
          >
            <LogOut size={16} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;