import React, { useState } from 'react';

const ActivityForm = ({ onAddActivity, onCancel }) => {
  const [activityTitle, setActivityTitle] = useState('');
  const [activityDescription, setActivityDescription] = useState('');
  const [activityPhotos, setActivityPhotos] = useState([]);
  const [previewPhotos, setPreviewPhotos] = useState([]);

  // Handle photo upload for activity
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert('You can only upload up to 5 images');
      return;
    }
    
    setActivityPhotos(files);
    
    // Create preview URLs
    const previews = files.map(file => URL.createObjectURL(file));
    setPreviewPhotos(previews);
  };
  
  // Handle removing a preview photo
  const handleRemovePhoto = (indexToRemove) => {
    setPreviewPhotos(prevPhotos => 
      prevPhotos.filter((_, index) => index !== indexToRemove)
    );
    setActivityPhotos(prevPhotos => 
      prevPhotos.filter((_, index) => index !== indexToRemove)
    );
  };

  // Handle form submission
  const handleSubmit = () => {
    if (!activityTitle.trim()) {
      alert('Please enter an activity title');
      return;
    }
    
    onAddActivity({
      title: activityTitle,
      description: activityDescription,
      photos: previewPhotos
    });
    
    // Reset form
    setActivityTitle('');
    setActivityDescription('');
    setActivityPhotos([]);
    setPreviewPhotos([]);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 mb-6 animate-fadeIn">
      <div className="mb-4">
        <input
          type="text"
          value={activityTitle}
          onChange={(e) => setActivityTitle(e.target.value)}
          placeholder="Activity title"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
        />
      </div>
      
      <div className="mb-4">
        <textarea
          value={activityDescription}
          onChange={(e) => setActivityDescription(e.target.value)}
          placeholder="Share an update or progress with the team..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
        ></textarea>
      </div>
      
      {/* Photo Upload Preview */}
      {previewPhotos.length > 0 && (
        <div className="mb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {previewPhotos.map((photo, index) => (
            <div key={index} className="relative">
              <img
                src={photo}
                alt={`Preview ${index}`}
                className="w-full h-24 object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={() => handleRemovePhoto(index)}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <label className="cursor-pointer p-2 text-gray-500 hover:text-[#4A2BAF] hover:bg-[#4A2BAF]/5 rounded-lg transition-colors duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <input
              type="file"
              accept="image/*"
              multiple
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
            className="px-4 py-2 bg-gradient-to-r from-[#4A2BAF] to-[#5D4EFF] text-white rounded-lg hover:opacity-90 transition-opacity duration-200"
          >
            Post Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ActivityForm; 