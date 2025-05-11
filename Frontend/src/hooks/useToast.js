import { useState } from 'react';

export const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success',
    duration: 3000
  });

  const showToast = (message, type = 'success', duration = 3000) => {
    setToast({
      show: true,
      message,
      type,
      duration
    });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const successToast = (message, duration) => showToast(message, 'success', duration);
  const errorToast = (message, duration) => showToast(message, 'error', duration);
  const infoToast = (message, duration) => showToast(message, 'info', duration);
  const warningToast = (message, duration) => showToast(message, 'warning', duration);

  return {
    toast,
    showToast,
    hideToast,
    successToast,
    errorToast,
    infoToast,
    warningToast
  };
}; 