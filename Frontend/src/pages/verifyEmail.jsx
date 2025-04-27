// src/pages/VerifyEmail.jsx

import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');
  
  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setMessage('Invalid verification link.');
      return;
    }

    fetch(`http://localhost:5000/api/auth/verify-email?token=${token}`)
      .then(res => res.text())
      .then(data => {
        setMessage(data);
      })
      .catch(err => {
        console.error(err);
        setMessage('Verification failed. Please try again.');
      });
  }, []);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <h1 className="text-2xl font-bold">{message}</h1>
    </div>
  );
}
