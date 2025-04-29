import React, { useState, useEffect } from 'react';
import Sidebar from '../components/sidebar/Sidebar';
import Card from '../components/ui/Card';
import Tabs from '../components/ui/Tabs';
import Button from '../components/ui/Button';
import FriendCardList from '../components/friends/FriendCardList';
import AddFriendModal from '../components/friends/AddFriendModal';
import { FiSearch, FiUserPlus, FiUserCheck, FiUserX, FiUsers } from 'react-icons/fi';

const FriendsPage = () => {
  const [activeTab, setActiveTab] = useState('friends');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [sentRequests, setSentRequests] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [refreshCounter, setRefreshCounter] = useState(0); // ← Added

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
    fetchFriends();
    fetchSentRequests();
    fetchReceivedRequests();
  }, [refreshCounter]); // ← useEffect now re-runs on refreshCounter change

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

  // const renderFriendsList = () => (
  //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //     {friends.map(friend => (
  //       <Card key={friend.id} hoverable className="flex items-center p-4">
  //         <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-medium">
  //           {friend.name.charAt(0)}
  //         </div>
  //         <div className="ml-4 flex-1">
  //           <h3 className="font-medium text-gray-900">{friend.name}</h3>
  //           <p className="text-sm text-gray-500">{friend.email}</p>
  //         </div>
  //         <Button variant="light" size="sm" icon={FiUserCheck}>
  //           Friend
  //         </Button>
  //       </Card>
  //     ))}
  //   </div>
  // );

  // const renderSentRequests = () => (
  //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //     {sentRequests.map(request => (
  //       <Card key={request.id} hoverable className="flex items-center p-4">
  //         <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 font-medium">
  //           {request.name.charAt(0)}
  //         </div>
  //         <div className="ml-4 flex-1">
  //           <h3 className="font-medium text-gray-900">{request.name}</h3>
  //           <p className="text-sm text-gray-500">{request.email}</p>
  //         </div>
  //         <Button
  //           variant="light"
  //           size="sm"
  //           icon={FiUserX}
  //           onClick={() => handleCancelRequest(request.id)}
  //         >
  //           Cancel
  //         </Button>
  //       </Card>
  //     ))}
  //   </div>
  // );

  // const renderReceivedRequests = () => (
  //   <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  //     {receivedRequests.map(request => (
  //       <Card key={request.id} hoverable className="flex items-center p-4">
  //         <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-medium">
  //           {request.name.charAt(0)}
  //         </div>
  //         <div className="ml-4 flex-1">
  //           <h3 className="font-medium text-gray-900">{request.name}</h3>
  //           <p className="text-sm text-gray-500">{request.email}</p>
  //         </div>
  //         <div className="flex gap-2">
  //           <Button
  //             variant="primary"
  //             size="sm"
  //             icon={FiUserCheck}
  //             onClick={() => handleAcceptRequest(request.id)}
  //           >
  //             Accept
  //           </Button>
  //           <Button
  //             variant="light"
  //             size="sm"
  //             icon={FiUserX}
  //             onClick={() => handleDeclineRequest(request.id)}
  //           >
  //             Decline
  //           </Button>
  //         </div>
  //       </Card>
  //     ))}
  //   </div>
  // );

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Friends</h1>
              <p className="text-gray-500">Manage your friends and connections</p>
            </div>
            <Button variant="primary" icon={FiUserPlus} onClick={handleAddFriend}>
              Add Friend
            </Button>
          </div>

          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search friends..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchQuery}
                onChange={handleSearch}
              />
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            </div>
          </div>

          <Tabs
            tabs={[
              { id: 'friends', label: 'Friends', icon: FiUsers, count: friends.length },
              { id: 'sent', label: 'Sent Requests', icon: FiUserPlus, count: sentRequests.length },
              { id: 'received', label: 'Received Requests', icon: FiUserCheck, count: receivedRequests.length },
            ]}
            activeTab={activeTab}
            onTabChange={setActiveTab}
          />

          <div className="mt-6">
          {activeTab === 'friends' && (
  <FriendCardList list={friends} type="friends" />
)}
{activeTab === 'sent' && (
  <FriendCardList list={sentRequests} type="sent" onCancel={handleCancelRequest} />
)}
{activeTab === 'received' && (
  <FriendCardList 
    list={receivedRequests} 
    type="received" 
    onAccept={handleAcceptRequest} 
    onDecline={handleDeclineRequest} 
  />
)}
          </div>
        </div>
      </main>

      <AddFriendModal
        isOpen={showAddFriendModal}
        onClose={() => setShowAddFriendModal(false)}
        onSendRequest={handleSendRequest}
      />
    </div>
  );
};

export default FriendsPage;
