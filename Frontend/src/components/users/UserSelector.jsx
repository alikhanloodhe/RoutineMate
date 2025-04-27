import React, { useState, useEffect, useRef } from 'react';
import { FiSearch, FiX, FiCheck } from 'react-icons/fi';
import Card from '../ui/Card';

/**
 * UserSelector component for selecting users/friends with search functionality
 * 
 * @param {Object} props
 * @param {Array} props.users - Array of user objects with id, name, avatar, etc.
 * @param {Array} props.selectedUsers - Array of selected user IDs
 * @param {Function} props.onSelectionChange - Function called when selection changes
 * @param {string} [props.title='Select Users'] - Title for the component
 * @param {Function} [props.onClose] - Function to call when closed (for modal version)
 * @param {boolean} [props.isModal=false] - Whether component is used as a modal
 */
const UserSelector = ({
  users = [],
  selectedUsers = [],
  onSelectionChange,
  title = 'Select Users',
  onClose,
  isModal = false
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredUsers, setFilteredUsers] = useState(users);
  const searchInputRef = useRef(null);
  
  // Focus search input on mount
  useEffect(() => {
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, []);
  
  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(users);
      return;
    }
    
    const query = searchQuery.toLowerCase().trim();
    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(query) || 
      (user.email && user.email.toLowerCase().includes(query))
    );
    
    setFilteredUsers(filtered);
  }, [searchQuery, users]);
  
  // Toggle user selection
  const toggleUserSelection = (userId) => {
    if (selectedUsers.includes(userId)) {
      onSelectionChange(selectedUsers.filter(id => id !== userId));
    } else {
      onSelectionChange([...selectedUsers, userId]);
    }
  };
  
  // Clear search input
  const clearSearch = () => {
    setSearchQuery('');
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };
  
  const content = (
    <>
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
          {title}
        </h3>
        
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FiSearch className="text-gray-400" />
          </div>
          
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email"
            className="block w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:ring-indigo-500 focus:border-indigo-500"
          />
          
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <FiX className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
            </button>
          )}
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-4 text-gray-500 dark:text-gray-400">
          No users found matching "{searchQuery}"
        </div>
      ) : (
        <div className="overflow-y-auto max-h-80">
          {filteredUsers.map(user => (
            <div
              key={user.id}
              onClick={() => toggleUserSelection(user.id)}
              className={`flex items-center p-3 rounded-md cursor-pointer mb-2 hover:bg-gray-50 dark:hover:bg-gray-750 ${
                selectedUsers.includes(user.id)
                  ? 'bg-indigo-50 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800'
                  : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
              } border`}
            >
              <div className="flex-shrink-0 mr-3">
                {user.avatar ? (
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {user.name}
                </p>
                {user.email && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user.email}
                  </p>
                )}
              </div>
              
              <div className="ml-3 flex-shrink-0">
                <div className={`h-5 w-5 rounded-full flex items-center justify-center border ${
                  selectedUsers.includes(user.id)
                    ? 'bg-indigo-500 border-indigo-500'
                    : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {selectedUsers.includes(user.id) && (
                    <FiCheck className="h-3 w-3 text-white" />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {isModal && (
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-md text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            Done
          </button>
        </div>
      )}
    </>
  );
  
  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <Card className="w-full max-w-lg">
          <div className="p-4">
            {content}
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {content}
    </div>
  );
};

export default UserSelector; 