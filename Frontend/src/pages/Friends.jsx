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
        alert(data.msg);
        setRefreshCounter((prev) => prev + 1);
      }
    } catch (err) {
      console.error('Accept request error:', err);
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
      <div className="flex items-center p-4 border-b border-gray-100">
        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] flex items-center justify-center text-white font-semibold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="ml-4 flex-1">
          <h3 className="font-semibold text-[#1C1C1C] text-lg">{user.name}</h3>
          <p className="text-gray-500 text-sm">{user.email}</p>
        </div>
        <div className="flex gap-2">
          <button className="p-2 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
          </button>
          <button className="p-2 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-600 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className="p-4 bg-gray-50">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-500">Friends since 2023</span>
          <div className="flex items-center space-x-1 text-yellow-500">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
            </svg>
            <span className="text-sm font-medium">Active</span>
          </div>
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
      <div className="p-4">
        <div className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg ${isReceived ? 'bg-green-500' : 'bg-yellow-500'}`}>
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="ml-4 flex-1">
            <h3 className="font-semibold text-[#1C1C1C] text-lg">{user.name}</h3>
            <p className="text-gray-500 text-sm">{user.email}</p>
          </div>
        </div>
        
        <div className="mt-4 flex gap-2">
          {isReceived ? (
            <>
              <button 
                className="flex-1 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg font-medium text-sm flex items-center justify-center"
                onClick={() => handleAcceptRequest(user.id)}
              >
                <FiUserCheck className="mr-2" />
                Accept
              </button>
              <button 
                className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm flex items-center justify-center hover:bg-gray-200 transition-colors"
                onClick={() => handleDeclineRequest(user.id)}
              >
                <FiX className="mr-2" />
                Decline
              </button>
            </>
          ) : (
            <button 
              className="w-full py-2 bg-gray-100 text-gray-700 rounded-lg font-medium text-sm flex items-center justify-center hover:bg-gray-200 transition-colors"
              onClick={() => handleCancelRequest(user.id)}
            >
              <FiX className="mr-2" />
              Cancel Request
            </button>
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