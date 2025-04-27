import React, { useState, useRef } from 'react';
import { FiUpload, FiDownload, FiTrash2, FiX, FiFile, FiImage, FiFileText, FiFilm } from 'react-icons/fi';
import Button from '../ui/Button';
import Card from '../ui/Card';

/**
 * GroupTaskAttachments component for handling file attachments in group tasks
 * 
 * @param {Object} props
 * @param {Object} props.task - The group task object
 * @param {Array} props.assignees - Array of assignee objects
 * @param {number} props.currentUserId - ID of the current user
 * @param {Function} props.onClose - Function to call when the component is closed
 */
const GroupTaskAttachments = ({ 
  task, 
  assignees = [], 
  currentUserId = 1, // Default for testing
  onClose 
}) => {
  // State for file attachments
  const [attachments, setAttachments] = useState([
    // Example data format
    {
      id: 1,
      taskId: task.id,
      userId: 1,
      fileName: 'project_spec.pdf',
      fileUrl: '#',
      fileSize: 1240000, // bytes
      fileType: 'application/pdf',
      uploadedAt: '2023-07-15T10:30:00Z'
    },
    {
      id: 2,
      taskId: task.id,
      userId: 2,
      fileName: 'design_mockup.png',
      fileUrl: '#',
      fileSize: 2500000, // bytes
      fileType: 'image/png',
      uploadedAt: '2023-07-16T14:45:00Z'
    },
    {
      id: 3,
      taskId: task.id,
      userId: 3,
      fileName: 'meeting_notes.docx',
      fileUrl: '#',
      fileSize: 45000, // bytes
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      uploadedAt: '2023-07-17T09:15:00Z'
    }
  ]);

  // File input reference
  const fileInputRef = useRef();
  
  // Drag and drop state
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection
  const handleFileSelect = (e) => {
    const files = e.target.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  // Handle drag events
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      uploadFiles(files);
    }
  };

  // Upload files (simulated)
  const uploadFiles = (files) => {
    const now = new Date().toISOString();
    
    const newAttachments = Array.from(files).map(file => ({
      id: Date.now() + Math.random(), // Temporary unique ID
      taskId: task.id,
      userId: currentUserId,
      fileName: file.name,
      fileUrl: '#', // Would be a real URL in production
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: now
    }));
    
    setAttachments([...attachments, ...newAttachments]);
  };

  // Delete an attachment
  const deleteAttachment = (attachmentId) => {
    setAttachments(attachments.filter(attachment => attachment.id !== attachmentId));
  };

  // Format file size for display
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
    else return (bytes / 1073741824).toFixed(1) + ' GB';
  };

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get user by ID
  const getUser = (userId) => {
    return assignees.find(a => a.id === userId) || { 
      name: 'Unknown User',
      avatar: ''
    };
  };

  // Check if user is the uploader (for delete permission)
  const canDeleteFile = (userId) => {
    return userId === currentUserId;
  };

  // Get icon based on file type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) {
      return <FiImage className="h-6 w-6 text-blue-500" />;
    } else if (fileType.startsWith('video/')) {
      return <FiFilm className="h-6 w-6 text-purple-500" />;
    } else if (fileType.includes('pdf') || fileType.includes('document') || fileType.includes('text')) {
      return <FiFileText className="h-6 w-6 text-red-500" />;
    } else {
      return <FiFile className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Attachments</h2>
        <Button variant="text" size="sm" onClick={onClose}>
          <FiX className="h-5 w-5" />
        </Button>
      </div>
      
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-md font-medium text-gray-700 dark:text-gray-300">
              {task.title}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage files attached to this task
            </p>
          </div>
        </div>
        
        {/* Upload area */}
        <div 
          className={`border-2 border-dashed rounded-lg p-6 mb-6 text-center transition-colors ${
            isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-gray-300 dark:border-gray-700'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            multiple
            className="hidden"
          />
          
          <FiUpload className="mx-auto h-12 w-12 text-gray-400 mb-2" />
          <p className="text-gray-700 dark:text-gray-300 mb-1">
            Drag and drop files here, or
          </p>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current.click()}
          >
            Browse files
          </Button>
          <p className="text-xs text-gray-500 mt-2">
            Upload any file type. Max size: 10MB per file.
          </p>
        </div>
        
        {/* File list */}
        {attachments.length > 0 ? (
          <div className="border rounded-lg divide-y divide-gray-200 dark:divide-gray-700">
            {attachments.map(attachment => {
              const user = getUser(attachment.userId);
              
              return (
                <div 
                  key={attachment.id}
                  className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-start">
                    <div className="flex-shrink-0 mr-3">
                      {getFileIcon(attachment.fileType)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                        {attachment.fileName}
                      </p>
                      
                      <div className="flex items-center mt-1">
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <span className="mr-2">{formatFileSize(attachment.fileSize)}</span>
                          <span className="mx-2">•</span>
                          <span className="mr-2">{formatDate(attachment.uploadedAt)}</span>
                          <span className="mx-2">•</span>
                          <span>Uploaded by {user.id === currentUserId ? 'you' : user.name}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                      <Button
                        variant="text"
                        size="xs"
                        className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400"
                      >
                        <FiDownload className="h-4 w-4" />
                      </Button>
                      
                      {canDeleteFile(attachment.userId) && (
                        <Button
                          variant="text"
                          size="xs"
                          className="text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                          onClick={() => deleteAttachment(attachment.id)}
                        >
                          <FiTrash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No files have been attached to this task yet.
          </div>
        )}
      </div>
    </Card>
  );
};

export default GroupTaskAttachments; 