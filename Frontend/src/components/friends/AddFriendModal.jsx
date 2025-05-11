import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FiSearch, FiX, FiUserPlus, FiMail } from 'react-icons/fi';
import { useToastContext } from '../../context/ToastContext';
import { motion, AnimatePresence } from 'framer-motion';

const AddFriendModal = ({ isOpen, onClose, onSendRequest }) => {
  const { errorToast } = useToastContext();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const token = localStorage.getItem('token');
  
  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length > 2) {
      setIsSearching(true);
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL}/api/friends/searchFriends?query=${encodeURIComponent(query)}`, 
          {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          }
        );

        const data = await res.json();
        if (res.ok) {
          setSearchResults(data.users); // expect array
        } else {
          errorToast(data.msg || 'Failed to search for users');
        }
      } catch (err) {
        console.error('Search error:', err);
        errorToast('Failed to search for users. Please try again.');
      }
      setIsSearching(false);
    } else {
      setSearchResults([]);
    }
  };

  const handleSendRequest = (userId) => {
    onSendRequest(userId);
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="w-full max-w-md bg-white rounded-xl shadow-xl overflow-hidden"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            <div className="flex justify-between items-center p-5 border-b border-gray-200">
              <div className="flex items-center">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white mr-3">
                  <FiUserPlus size={16} />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Add Friend</h2>
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-5">
              <div className="relative mb-5">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent transition-all"
                  value={searchQuery}
                  onChange={handleSearch}
                  onKeyDown={handleKeyPress}
                  autoFocus
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={16} />
                  </button>
                )}
              </div>

              <div className="max-h-96 overflow-y-auto rounded-lg">
                {isSearching ? (
                  <div className="text-center py-6">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#5D4EFF] mx-auto"></div>
                    <p className="mt-3 text-gray-500">Searching...</p>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="space-y-3">
                    {searchResults.map(user => (
                      <motion.div
                        key={user.id}
                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white mr-3">
                            {user.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{user.name}</h3>
                            <p className="text-sm text-gray-500 flex items-center">
                              <FiMail className="mr-1" size={12} /> {user.email}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="primary"
                          size="sm"
                          icon={FiUserPlus}
                          onClick={() => handleSendRequest(user.id)}
                          className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] hover:from-[#3A1B9F] hover:to-[#4D3EEF]"
                        >
                          Add
                        </Button>
                      </motion.div>
                    ))}
                  </div>
                ) : searchQuery.length > 2 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 mx-auto mb-3">
                      <FiSearch size={24} />
                    </div>
                    <p className="text-gray-500 font-medium">No users found</p>
                    <p className="text-gray-400 text-sm mt-1">Try a different search term</p>
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <div className="h-16 w-16 rounded-full bg-[#5D4EFF]/10 flex items-center justify-center text-[#5D4EFF] mx-auto mb-3">
                      <FiUserPlus size={24} />
                    </div>
                    <p className="text-gray-700 font-medium">Find friends</p>
                    <p className="text-gray-500 text-sm mt-1">Start typing to search for users</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddFriendModal; 