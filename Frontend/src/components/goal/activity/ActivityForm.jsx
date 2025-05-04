import React, { useState, useRef } from 'react';

const ActivityForm = ({ onAddActivity, onCancel }) => {
  const [content, setContent] = useState('');
  const [activityPhoto, setActivityPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  // Handle photo upload for activity
  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    console.log('Selected file:', file);
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }
    
    setIsUploading(true);
    
    // Store the file for later upload
    setActivityPhoto(file);
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewPhoto(previewUrl);
    setIsUploading(false);
  };
  
  // Handle removing preview photo
  const handleRemovePhoto = () => {
    setPreviewPhoto(null);
    setActivityPhoto(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!content.trim() && !activityPhoto) {
      alert('Please enter content or add a photo');
      return;
    }
    
    console.log('Submitting form with content:', content);
    console.log('Photo to upload:', activityPhoto);
    
    setIsUploading(true);
    
    try {
      // Create a temporary local object for immediate display
      const newActivity = {
        content: content,
        text: content,
        // For the server upload, we need the File object
        photos: activityPhoto ? [activityPhoto] : [],
        photo: activityPhoto
      };
      
      // Store the result from onAddActivity
      const result = await onAddActivity(newActivity);
      console.log('Result from server:', result);
      
      // Clean up preview URL
      if (previewPhoto) {
        URL.revokeObjectURL(previewPhoto);
      }
      
      // Reset form
      setContent('');
      setActivityPhoto(null);
      setPreviewPhoto(null);
      
      return result;
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('Failed to post. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 animate-fadeIn">
      <div className="mb-4">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind? Share an update with your team..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
        ></textarea>
      </div>
      
      {/* Photo Upload Preview */}
      {previewPhoto && (
        <div className="mb-4">
          <div className="relative inline-block">
            <img
              src={previewPhoto}
              alt="Preview"
              className="h-32 object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={handleRemovePhoto}
              className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-70 hover:opacity-100 transition-opacity"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer p-2 text-gray-500 hover:text-[#4A2BAF] hover:bg-[#4A2BAF]/5 rounded-lg transition-colors duration-200 flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Add Photo</span>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isUploading || (!content.trim() && !activityPhoto)}
            className={`px-4 py-2 ${isUploading || (!content.trim() && !activityPhoto) 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] hover:opacity-90'} text-white rounded-lg transition-opacity duration-200`}
          >
            {isUploading ? 'Uploading...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityForm; 