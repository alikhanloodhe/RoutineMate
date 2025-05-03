import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ActivityFormModal = ({ isOpen, onClose, onSubmit, activity = null }) => {
  // Activity form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState([]);
  const [mood, setMood] = useState(null);
  const [previewPhotos, setPreviewPhotos] = useState([]);
  const [existingPhotos, setExistingPhotos] = useState([]);
  const [removedPhotoIds, setRemovedPhotoIds] = useState([]);

  // Set form values when editing an existing activity
  useEffect(() => {
    if (activity) {
      setTitle(activity.title || '');
      setDescription(activity.description || '');
      setMood(activity.mood || null);
      
      // Handle existing photos from the database
      if (activity.photos && activity.photos.length > 0) {
        // Format existing photos for preview
        const formattedPhotos = activity.photos.map(photo => ({
          id: photo.id,
          url: photo.photo_url,
          isExisting: true
        }));
        setExistingPhotos(formattedPhotos);
        
        // Add all existing photos to the preview
        const photoUrls = activity.photos.map(photo => photo.photo_url);
        setPreviewPhotos(photoUrls);
        
        console.log('Setting preview photos:', photoUrls);
      } else {
        setExistingPhotos([]);
        setPreviewPhotos([]);
      }
      
      // Reset new photos and removed photo IDs
      setPhotos([]);
      setRemovedPhotoIds([]);
    } else {
      // Reset form for new activity
      resetForm();
    }
  }, [activity, isOpen]);

  // Reset form to default values
  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPhotos([]);
    setPreviewPhotos([]);
    setExistingPhotos([]);
    setRemovedPhotoIds([]);
    setMood(null);
  };

  // Handle close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  // Handle photo upload
  const handlePhotoUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Check for combined total (existing + new) to not exceed 5
    const totalPhotos = photos.length + existingPhotos.length - removedPhotoIds.length + files.length;
    if (totalPhotos > 5) {
      alert(`You can only upload up to 5 images. You've selected ${files.length} new images, but you already have ${existingPhotos.length - removedPhotoIds.length} existing and ${photos.length} new images.`);
      return;
    }
    
    console.log(`Adding ${files.length} photos. Total will be ${totalPhotos}`);
    
    // Set the new combined photos array
    setPhotos(prevPhotos => [...prevPhotos, ...files]);
    
    // Create preview URLs for new photos and add to existing previews
    const newPreviews = files.map(file => URL.createObjectURL(file));
    setPreviewPhotos(prevPreviewPhotos => [...prevPreviewPhotos, ...newPreviews]);
  };

  // Handle removing a preview photo
  const handleRemovePhoto = (indexToRemove) => {
    // Check if this is an existing photo from the database
    const removedPhotoUrl = previewPhotos[indexToRemove];
    const existingPhotoIndex = existingPhotos.findIndex(photo => photo.url === removedPhotoUrl);
    
    if (existingPhotoIndex !== -1) {
      // If it's an existing photo, add its ID to the removed list
      const photoId = existingPhotos[existingPhotoIndex].id;
      setRemovedPhotoIds(prev => [...prev, photoId]);
      
      // Remove from existingPhotos array
      setExistingPhotos(prev => prev.filter((_, index) => index !== existingPhotoIndex));
    } else {
      // If it's a new photo, remove from photos array
      // Calculate the actual index in the photos array
      const newPhotoIndex = indexToRemove - existingPhotos.length + removedPhotoIds.length;
      if (newPhotoIndex >= 0) {
        setPhotos(prevPhotos => 
          prevPhotos.filter((_, index) => index !== newPhotoIndex)
        );
      }
    }
    
    // Remove from previewPhotos array
    setPreviewPhotos(prevPhotos => 
      prevPhotos.filter((_, index) => index !== indexToRemove)
    );
  };

  // Handle mood selection
  const handleMoodSelect = (selectedMood) => {
    setMood(selectedMood);
  };

  // Submit form
  const handleSubmit =  (e) => {
    e.preventDefault();

    if (!title.trim()) {
      alert('Please enter an activity title');
      return;
    }
    
    const activityData = new FormData();
    
    // Basic activity data
    activityData.append('title', title);
    activityData.append('description', description || '');
    activityData.append('timestamp', new Date().toISOString());
    activityData.append('type', 'note');
    if (mood) {
      activityData.append('mood', mood);
    }
    
    // Append new photos
    photos.forEach((photo) => {
      activityData.append('photos', photo);
    });
    
    // If editing, include activity ID and removed photo IDs
    if (activity) {
      activityData.append('activity_id', activity.id);
      
      // If there are removed photos, add their IDs
      if (removedPhotoIds.length > 0) {
        activityData.append('removedPhotoIds', JSON.stringify(removedPhotoIds));
      }
    }
    
    // Debug what's being sent
    for (let pair of activityData.entries()) {
      console.log(pair[0], pair[1]);
    }

    onSubmit(activityData);
    resetForm();
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
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleClose}
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
                  {activity ? 'Edit Activity Entry' : 'New Activity Entry'}
                </h3>
                <button
                  onClick={handleClose}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Body - scrollable */}
              <div className="p-6 overflow-y-auto">
                <form onSubmit={handleSubmit}>
                  {/* Title */}
                  <div className="mb-4">
                    <label htmlFor="activity-title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title*
                    </label>
                    <input
                      id="activity-title"
                      type="text"
                      placeholder="What did you accomplish?"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="mb-4">
                    <label htmlFor="activity-description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      id="activity-description"
                      placeholder="Describe your progress, thoughts, or challenges..."
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#4A2BAF]/20 focus:border-[#4A2BAF]"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    ></textarea>
                  </div>

                  {/* Photo Upload Section */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Photos (Optional) {previewPhotos.length > 0 && `(${previewPhotos.length}/5)`}
                    </label>
                    <div className="grid grid-cols-5 gap-2 mb-2 relative">
                      {previewPhotos.map((photoSrc, index) => (
                        <div key={index} className="aspect-square bg-gray-100 rounded-md overflow-hidden relative group">
                          <img
                            src={typeof photoSrc === 'string' ? photoSrc : URL.createObjectURL(photoSrc)}
                            alt={`Preview ${index + 1}`}
                            className="h-full w-full object-cover"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemovePhoto(index)}
                            className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                      {previewPhotos.length < 5 && (
                        <label htmlFor="file-upload" className="aspect-square bg-gray-100 rounded-md flex items-center justify-center border-2 border-dashed border-gray-300 hover:border-gray-400 transition-colors cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" multiple onChange={handlePhotoUpload} />
                        </label>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Upload up to 5 images</p>
                  </div>
                  {/* Mood Selector */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      How are you feeling about this goal? (Optional)
                    </label>
                    <div className="flex space-x-4">
                      <button
                        type="button"
                        onClick={() => handleMoodSelect('happy')}
                        className={`flex flex-col items-center p-2 rounded-lg ${mood === 'happy' ? 'bg-green-50 text-green-600' : 'hover:bg-gray-100'}`}
                      >
                        <span className="text-2xl mb-1">😊</span>
                        <span className="text-xs">Happy</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoodSelect('motivated')}
                        className={`flex flex-col items-center p-2 rounded-lg ${mood === 'motivated' ? 'bg-purple-50 text-purple-600' : 'hover:bg-gray-100'}`}
                      >
                        <span className="text-2xl mb-1">💪</span>
                        <span className="text-xs">Motivated</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoodSelect('tired')}
                        className={`flex flex-col items-center p-2 rounded-lg ${mood === 'tired' ? 'bg-yellow-50 text-yellow-600' : 'hover:bg-gray-100'}`}
                      >
                        <span className="text-2xl mb-1">😴</span>
                        <span className="text-xs">Tired</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoodSelect('stressed')}
                        className={`flex flex-col items-center p-2 rounded-lg ${mood === 'stressed' ? 'bg-red-50 text-red-600' : 'hover:bg-gray-100'}`}
                      >
                        <span className="text-2xl mb-1">😣</span>
                        <span className="text-xs">Stressed</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleMoodSelect('neutral')}
                        className={`flex flex-col items-center p-2 rounded-lg ${mood === 'neutral' ? 'bg-gray-100 text-gray-600' : 'hover:bg-gray-100'}`}
                      >
                        <span className="text-2xl mb-1">😐</span>
                        <span className="text-xs">Neutral</span>
                      </button>
                    </div>
                  </div>


                  {/* Form Actions */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={handleClose}
                      className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#4A2BAF] text-white rounded-lg hover:bg-[#3D2291] transition-colors"
                    >
                      {activity ? 'Save Changes' : 'Add Entry'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ActivityFormModal; 