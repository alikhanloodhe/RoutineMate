import React, { useState, useEffect } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Spinner from '../components/ui/Spinner';
import FriendCardList from '../components/friends/FriendCardList';
import AddFriendModal from '../components/friends/AddFriendModal';
import Sidebar from '../components/sidebar/Sidebar';
import { FiSearch, FiUserPlus, FiUserCheck, FiUserX, FiUsers, FiUserMinus, FiX } from 'react-icons/fi';

const FriendsPage = () => {
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
        alert(data.msg);
        setRefreshCounter((prev) => prev + 1); // ← Trigger useEffect re-fetch
      }else{
        alert(data.msg);
      }
    } catch (err) {
      console.error('Send request error:', err);
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
        alert(data.msg);
        setRefreshCounter((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error declining request:', error);
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
        alert(data.msg);
        setRefreshCounter((prev) => prev + 1);
      }
    } catch (error) {
      console.error('Error canceling request:', error);
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Spinner size="xl" className="mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading friends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 min-h-screen bg-gray-50 dark:bg-gray-900 pb-10">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-4 md:py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-2 rounded-lg">
                  <FiUsers className="text-purple-600 dark:text-purple-400 text-xl" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Friends</h1>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your connections</p>
                </div>
              </div>
              
              <Button 
                variant="primary"
                size="md"
                icon={FiUserPlus} 
                onClick={handleAddFriend}
              >
                Add Friend
              </Button>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <FiX />
                </button>
              )}
            </div>
          </div>

          {/* Friend Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Friends</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{friends.length}</h2>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <FiUsers className="text-blue-600 dark:text-blue-400 text-xl" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Sent Requests</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{sentRequests.length}</h2>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                  <FiUserPlus className="text-yellow-600 dark:text-yellow-400 text-xl" />
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Pending Requests</p>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{receivedRequests.length}</h2>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <FiUserCheck className="text-green-600 dark:text-green-400 text-xl" />
                </div>
              </div>
            </Card>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 border-b border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setActiveTab('friends')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'friends'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FiUsers />
                  <span>Friends</span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {friends.length}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('sent')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'sent'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FiUserPlus />
                  <span>Sent Requests</span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {sentRequests.length}
                  </span>
                </div>
              </button>
              
              <button
                onClick={() => setActiveTab('received')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg ${
                  activeTab === 'received'
                    ? 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600 dark:border-purple-400'
                    : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <FiUserCheck />
                  <span>Received Requests</span>
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                    {receivedRequests.length}
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Friend Lists */}
          <div className="mt-6">
            {activeTab === 'friends' && filteredFriends.length === 0 && (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FiUsers className="text-gray-500 dark:text-gray-400 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Friends Yet</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-4">Start connecting with others to build your network</p>
                <Button variant="primary" icon={FiUserPlus} onClick={handleAddFriend}>
                  Add Your First Friend
                </Button>
              </Card>
            )}
            
            {activeTab === 'sent' && filteredSentRequests.length === 0 && (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FiUserPlus className="text-gray-500 dark:text-gray-400 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Pending Requests</h3>
                <p className="text-gray-500 dark:text-gray-400">You haven't sent any friend requests yet</p>
              </Card>
            )}

            {activeTab === 'received' && filteredReceivedRequests.length === 0 && (
              <Card className="p-8 text-center">
                <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                  <FiUserCheck className="text-gray-500 dark:text-gray-400 text-xl" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Friend Requests</h3>
                <p className="text-gray-500 dark:text-gray-400">You don't have any pending friend requests</p>
              </Card>
            )}

            {activeTab === 'friends' && filteredFriends.length > 0 && (
              <FriendCardList list={filteredFriends} type="friends" />
            )}
            
            {activeTab === 'sent' && filteredSentRequests.length > 0 && (
              <FriendCardList list={filteredSentRequests} type="sent" onCancel={handleCancelRequest} />
            )}
            
            {activeTab === 'received' && filteredReceivedRequests.length > 0 && (
              <FriendCardList 
                list={filteredReceivedRequests} 
                type="received" 
                onAccept={handleAcceptRequest} 
                onDecline={handleDeclineRequest} 
              />
            )}
          </div>
        </div>

        <AddFriendModal
          isOpen={showAddFriendModal}
          onClose={() => setShowAddFriendModal(false)}
          onSendRequest={handleSendRequest}
        />
      </div>
    </div>
  );
};

export default FriendsPage;
