// components/habit/EditDeleteControls.jsx
import React from 'react';
import Button from '../ui/Button';

const EditDeleteControls = ({ onEdit, onDelete }) => {
  const [showConfirm, setShowConfirm] = React.useState(false);
  
  const handleDeleteClick = () => {
    setShowConfirm(true);
  };
  
  const handleConfirmDelete = () => {
    onDelete();
    setShowConfirm(false);
  };
  
  const handleCancelDelete = () => {
    setShowConfirm(false);
  };
  
  return (
    <div className="flex flex-wrap gap-3 mt-6">
      <Button variant="outline" onClick={onEdit}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
        </svg>
        Edit Habit
      </Button>
      
      {showConfirm ? (
        <div className="flex space-x-2">
          <Button variant="danger" onClick={handleConfirmDelete}>
            Confirm Delete
          </Button>
          <Button variant="secondary" onClick={handleCancelDelete}>
            Cancel
          </Button>
        </div>
      ) : (
        <Button variant="danger" onClick={handleDeleteClick}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Delete Habit
        </Button>
      )}
    </div>
  );
};

export default EditDeleteControls;