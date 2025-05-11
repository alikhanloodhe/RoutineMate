/*
* IMPORTANT: Page Content Structure
* 
* Each page should now only contain its main content, as the Header and Sidebar
* are rendered by the Layout component.
*/

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import FriendCardList from '../components/friends/FriendCardList';
import AddFriendModal from '../components/friends/AddFriendModal';
import PageHeader from '../components/ui/PageHeader';
import { useToastContext } from '../context/ToastContext';
import { FiSearch, FiUserPlus, FiUserCheck, FiUserX, FiUsers, FiUserMinus, FiX, FiFilter, FiChevronDown } from 'react-icons/fi';

const Friends = () => {
  const { successToast, errorToast, infoToast } = useToastContext();
  // Friends functionality state
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem('token');

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleAddFriend = () => {
    setShowAddFriendModal(true);
  };

  const fetchFriends = async () => {
    try {
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
    }
  };
  
  const fetchSentRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/getSentRequests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setSentRequests(data);
    } catch (error) {
      console.error('Failed to fetch sent requests:', error);
    }
  };

  const fetchReceivedRequests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/getReceivedRequests`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      const data = await res.json();
      setReceivedRequests(data);
    } catch (error) {
      console.error('Error fetching received requests:', error);
    }
  };

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchFriends(),
          fetchSentRequests(),
          fetchReceivedRequests()
        ]);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
  }, [refreshCounter]);

  const handleSendRequest = async (userId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/addFriend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ friend_id: userId }),
      });

      const data = await res.json();
      if (res.ok) {
        successToast(data.msg);
        setRefreshCounter((prev) => prev + 1); // ← Trigger useEffect re-fetch
      } else {
        errorToast(data.msg);
      }
    } catch (err) {
      console.error('Send request error:', err);
      errorToast('Failed to send friend request. Please try again.');
    }
    setShowAddFriendModal(false);
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/acceptFriend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      if (res.ok) {
        successToast(data.msg);
        setRefreshCounter((prev) => prev + 1);
      } else {
        errorToast(data.msg || 'Failed to accept friend request');
      }
    } catch (err) {
      console.error('Accept request error:', err);
      errorToast('Network error. Please try again.');
    }
  };

  const handleDeclineRequest = async (requestId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/declineFriend`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      if (res.ok) {
        infoToast(data.msg);
        setRefreshCounter((prev) => prev + 1);
      } else {
        errorToast(data.msg || 'Failed to decline friend request');
      }
    } catch (error) {
      console.error('Error declining request:', error);
      errorToast('Failed to decline friend request. Please try again.');
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/friends/cancelRequest`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId }),
      });

      const data = await res.json();
      if (res.ok) {
        infoToast(data.msg);
        setRefreshCounter((prev) => prev + 1);
      } else {
        errorToast(data.msg || 'Failed to cancel friend request');
      }
    } catch (error) {
      console.error('Error canceling request:', error);
      errorToast('Failed to cancel friend request. Please try again.');
    }
  };

  // Filter based on search query
  const filterListBySearch = (list) => {
    if (!searchQuery.trim()) return list;
    
    const query = searchQuery.toLowerCase();
    return list.filter(item => 
      item.name?.toLowerCase().includes(query) || 
      item.email?.toLowerCase().includes(query)
    );
  };
  
  const filteredFriends = filterListBySearch(friends);
  const filteredSentRequests = filterListBySearch(sentRequests);
  const filteredReceivedRequests = filterListBySearch(receivedRequests);

  // Custom render functions for friend cards
  const renderFriendCard = (user) => (
    <motion.div 
      key={user.id}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center p-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white font-semibold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-[#1C1C1C] text-lg">{user.name}</h3>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Friends since {new Date(user.friend_since).getFullYear()}</span>
        </div>
      </div>
    </motion.div>
  );

  const renderRequestCard = (user, isReceived = true) => (
    <motion.div
      key={user.id}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <div className="flex items-center p-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white font-semibold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-[#1C1C1C] text-lg">{user.name}</h3>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
      </div>
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          {isReceived ? (
            <div className="flex gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={() => handleAcceptRequest(user.id)}
              >
                Accept
              </Button>
              <Button 
                variant="light" 
                size="sm" 
                onClick={() => handleDeclineRequest(user.id)}
              >
                Decline
              </Button>
            </div>
          ) : (
            <Button 
              variant="light" 
              size="sm" 
              onClick={() => handleCancelRequest(user.id)}
            >
              Cancel
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="px-6 py-6 flex justify-center items-center">
        <div className="text-center">
          <div className="w-16 h-16 border-t-4 border-b-4 border-[#5D4EFF] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading your connections...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50">
      <div className="px-6 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Top Controls */}
          <PageHeader
            title="My Connections"
            subtitle="Manage and grow your network"
            rightContent={
              <button
                className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white px-4 py-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center"
                onClick={handleAddFriend}
              >
                <FiUserPlus className="mr-2" />
                Add Friend
              </button>
            }
          />
          
          {/* Tab Navigation and Search Box */}
          <div className="bg-white rounded-xl shadow-sm mb-6">
            {/* Tabs */}
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 px-4 text-center ${
                  activeTab === 'friends' 
                    ? 'border-b-2 border-[#5D4EFF] text-[#5D4EFF] font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('friends')}
              >
                <span className="flex items-center justify-center">
                  <FiUsers className="mr-2" />
                  Friends ({friends.length})
                </span>
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center ${
                  activeTab === 'received' 
                    ? 'border-b-2 border-[#5D4EFF] text-[#5D4EFF] font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('received')}
              >
                <span className="flex items-center justify-center">
                  <FiUserCheck className="mr-2" />
                  Received ({receivedRequests.length})
                </span>
              </button>
              <button
                className={`flex-1 py-3 px-4 text-center ${
                  activeTab === 'sent' 
                    ? 'border-b-2 border-[#5D4EFF] text-[#5D4EFF] font-medium' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('sent')}
              >
                <span className="flex items-center justify-center">
                  <FiUserPlus className="mr-2" />
                  Sent ({sentRequests.length})
                </span>
              </button>
            </div>

            {/* Search Input */}
            <div className="p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#5D4EFF] focus:border-transparent"
                  value={searchQuery}
                  onChange={handleSearch}
                />
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                {searchQuery && (
                  <button 
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={() => setSearchQuery('')}
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Content based on tab */}
          {activeTab === 'friends' && (
            <>
              {filteredFriends.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredFriends.map(user => renderFriendCard(user))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                  <div className="bg-[#5D4EFF]/10 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                    <FiUsers className="h-10 w-10 text-[#5D4EFF]" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">No Friends Yet</h2>
                  <p className="text-gray-500 max-w-md mb-6">Connect with friends to share goals and encourage each other</p>
                  <button 
                    className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                    onClick={handleAddFriend}
                  >
                    <FiUserPlus className="h-5 w-5 mr-2" />
                    Add Friend
                  </button>
                </div>
              )}
            </>
          )}

          {activeTab === 'received' && (
            <>
              {filteredReceivedRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredReceivedRequests.map(user => renderRequestCard(user, true))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                  <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                    <FiUserCheck className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">No Friend Requests</h2>
                  <p className="text-gray-500 max-w-md">You don't have any pending friend requests</p>
                </div>
              )}
            </>
          )}

          {activeTab === 'sent' && (
            <>
              {filteredSentRequests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredSentRequests.map(user => renderRequestCard(user, false))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm p-10 flex flex-col items-center justify-center text-center">
                  <div className="bg-yellow-100 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                    <FiUserPlus className="h-10 w-10 text-yellow-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-[#1C1C1C] mb-2">No Pending Requests</h2>
                  <p className="text-gray-500 max-w-md mb-6">You haven't sent any friend requests yet</p>
                  <button 
                    className="bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center"
                    onClick={handleAddFriend}
                  >
                    <FiUserPlus className="h-5 w-5 mr-2" />
                    Add Friend
                  </button>
                </div>
              )}
            </>
          )}
        </motion.div>

        {/* Add Friend Modal */}
        {showAddFriendModal && (
          <AddFriendModal
            isOpen={showAddFriendModal}
            onClose={() => setShowAddFriendModal(false)}
            onSendRequest={handleSendRequest}
          />
        )}
      </div>
    </div>
  );
};

export default Friends; 