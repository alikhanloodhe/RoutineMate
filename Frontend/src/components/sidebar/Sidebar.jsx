// src/components/sidebar/Sidebar.jsx
import React from 'react';
import SidebarItem from './sidebaritem';
import { 
  LayoutDashboard, 
  CheckSquare, 
  CalendarClock, 
  Target, 
  ActivitySquare 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', to: '/dashboard' },
    { icon: <CheckSquare size={20} />, label: 'Tasks', to: '/tasks' },
    { icon: <CalendarClock size={20} />, label: 'Routines', to: '/routines' },
    { icon: <Target size={20} />, label: 'Goals', to: '/goals' },
    { icon: <ActivitySquare size={20} />, label: 'Habits', to: '/habits' },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold">RoutineTracker</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, index) => (
          <SidebarItem 
            key={index}
            icon={item.icon}
            label={item.label}
            to={item.to}
          />
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
            U
          </div>
          <div className="text-sm">
            <p className="font-medium">User Name</p>
            <p className="text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;