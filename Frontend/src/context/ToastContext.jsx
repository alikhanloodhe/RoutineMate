import React, { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast';
import Toast from '../components/ui/Toast';

// Create context
const ToastContext = createContext();

// Toast provider component
export const ToastProvider = ({ children }) => {
  const toastHelpers = useToast();
  const { toast, hideToast } = toastHelpers;

  return (
    <ToastContext.Provider value={toastHelpers}>
      {children}
      {toast.show && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={hideToast}
        />
      )}
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}; 