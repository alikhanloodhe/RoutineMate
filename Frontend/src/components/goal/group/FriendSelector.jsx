import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiX, FiCheck } from 'react-icons/fi';

const FriendSelector = ({ isOpen, onClose, onSelectFriends, initialSelectedFriends = [] }) => {
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedFriends(initialSelectedFriends || []);
      fetchFriends();
    }
  }, [isOpen, initialSelectedFriends]);

  const fetchFriends = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/getFriends`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      if (res.ok) setFriends(data);
    } catch (error) {
      console.error('Error fetching friends:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFriend = (e, friend) => {
    // Prevent event propagation
    e.stopPropagation();
    e.preventDefault();
    
    setSelectedFriends(prev => {
      // Check if friend is already selected
      const isSelected = prev.some(f => f.id === friend.id);
      
      if (isSelected) {
        // Remove from selection
        return prev.filter(f => f.id !== friend.id);
      } else {
        // Add to selection with default role of collaborator
        return [...prev, { ...friend, role: 'collaborator' }];
      }
    });
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = (e) => {
    // Prevent form submission
    if (e) e.preventDefault();
    
    onSelectFriends(selectedFriends);
    onClose();
  };

  const handleCancel = (e) => {
    // Prevent form submission
    if (e) e.preventDefault();
    
    onClose();
  };

  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    friend.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const isFriendSelected = (friendId) => {
    return selectedFriends.some(f => f.id === friendId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 backdrop-blur-sm"
            onClick={handleCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-xl overflow-hidden w-full max-w-md max-h-[90vh] flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-800">
                  Add Group Members
                </h3>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>

              {/* Form wrapper to prevent auto-submission */}
              <form onSubmit={handleSubmit}>
                {/* Search Bar */}
                <div className="px-6 py-3 border-b border-gray-100">
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FiSearch className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={handleSearch}
                      placeholder="Search friends..."
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#4A2BAF] focus:border-[#4A2BAF] text-sm"
                    />
                  </div>
                </div>

                {/* Friends List - scrollable */}
                {console.log(friends)}
                <div className="p-6 overflow-y-auto">
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#4A2BAF]"></div>
                    </div>
                  ) : filteredFriends.length > 0 ? (
                    <div className="space-y-2">
                      {filteredFriends.map((friend) => (
                        
                        <div
                          key={friend.id}
                          role="button"
                          tabIndex={0}
                          onClick={(e) => handleToggleFriend(e, friend)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              handleToggleFriend(e, friend);
                            }
                          }}
                          
                          className={`flex justify-between items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                            isFriendSelected(friend.id)
                              ? 'bg-[#4A2BAF]/10 border-[#4A2BAF]/30'
                              : 'border-gray-200 hover:bg-gray-50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#4A2BAF]/10 rounded-full flex items-center justify-center text-sm font-medium text-[#4A2BAF]">
                              {friend.name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div>
                              <h6 className="text-sm font-medium">{friend.name}</h6>
                              <p className="text-xs text-gray-500">{friend.email}</p>
                            </div>
                          </div>
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isFriendSelected(friend.id)
                              ? 'bg-[#4A2BAF] text-white'
                              : 'border border-gray-300'
                          }`}>
                            {isFriendSelected(friend.id) && <FiCheck className="w-4 h-4" />}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-gray-500">
                        {searchQuery ? "No friends match your search" : "You don't have any friends yet"}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50">
                  <div className="text-sm text-gray-600">
                    {selectedFriends.length} friend{selectedFriends.length !== 1 ? 's' : ''} selected
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors"
                    >
                      Add Selected
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default FriendSelector; 