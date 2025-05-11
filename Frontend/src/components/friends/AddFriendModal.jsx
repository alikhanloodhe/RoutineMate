import React, { useState } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FiSearch, FiX, FiUserPlus } from 'react-icons/fi';
import { useToastContext } from '../../context/ToastContext';

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


  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm">
      <Card className="w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Add Friend</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <FiX size={24} />
          </button>
        </div>

        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={searchQuery}
            onChange={handleSearch}
          />
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>

        <div className="max-h-96 overflow-y-auto">
          {isSearching ? (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
              <p className="mt-2 text-gray-500">Searching...</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="space-y-2">
              {searchResults.map(user => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div>
                    <h3 className="font-medium text-gray-900">{user.name}</h3>
                    <p className="text-sm text-gray-500">{user.email}</p>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={FiUserPlus}
                    onClick={() => handleSendRequest(user.id)}
                  >
                    Add
                  </Button>
                </div>
              ))}
            </div>
          ) : searchQuery.length > 2 ? (
            <div className="text-center py-4">
              <p className="text-gray-500">No users found</p>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-500">Start typing to search users</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default AddFriendModal; 