// components/friends/FriendCardList.jsx

import React from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import { FiUserCheck, FiUserX } from 'react-icons/fi';

const FriendCardList = ({ list, type, onAccept, onDecline, onCancel }) => {
  const getBgClass = () => {
    switch (type) {
      case 'friends': return 'bg-blue-100 text-blue-600';
      case 'sent': return 'bg-yellow-100 text-yellow-600';
      case 'received': return 'bg-green-100 text-green-600';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ">
      {list.map(user => (
        <Card key={user.id} hoverable className="flex items-center p-4">
          <div className={`w-12 h-12 mb-4 mt-2 ml-2 rounded-full flex items-center justify-center font-medium ${getBgClass()}`}>
            {user.name.charAt(0)}
          </div>
          <div className="ml-2 flex-1">
            <h3 className="font-medium text-gray-900">{user.name}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          {type === 'friends' && (
            <Button className='mt-4 ml-2' variant="light" size="sm" icon={FiUserCheck}>
              Friend
            </Button>
          )}

          {type === 'sent' && (
            <Button variant="light" size="sm" icon={FiUserX} onClick={() => onCancel(user.id)}>
              Cancel
            </Button>
          )}

          {type === 'received' && (
            <div className="flex gap-2">
              <Button variant="primary" size="sm" icon={FiUserCheck} onClick={() => onAccept(user.id)}>
                Accept
              </Button>
              <Button variant="light" size="sm" icon={FiUserX} onClick={() => onDecline(user.id)}>
                Decline
              </Button>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};

export default FriendCardList;
