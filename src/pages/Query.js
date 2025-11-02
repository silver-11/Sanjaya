// ===========================================
// src/pages/Query.js - Redirect to Analysis
// ===========================================
import React, { useEffect } from 'react';
import { useApp } from '../context/AppContext';

const Query = () => {
  const { setCurrentPage } = useApp();

  useEffect(() => {
    // Automatically redirect to Analysis page
    setCurrentPage('analysis');
  }, [setCurrentPage]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting to Analysis page...</p>
      </div>
    </div>
  );
};

export default Query;