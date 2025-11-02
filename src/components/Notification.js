import React from 'react';
import { CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Notification = () => {
  const { showNotification } = useApp();

  if (!showNotification) return null;

  return (
    <div className="fixed top-6 right-6 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 animate-pulse">
      <CheckCircle size={20} /> Analysis Complete!
    </div>
  );
};

export default Notification;
