// ===========================================
// src/components/ConnectionTester.js
// Optional component to test API connection
// ===========================================
import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { API_BASE_URL, apiClient, isApiConfigured } from '../config/api';

const ConnectionTester = () => {
  const [status, setStatus] = useState('checking');
  const [details, setDetails] = useState(null);
  const [error, setError] = useState(null);

  const testConnection = async () => {
    setStatus('checking');
    setError(null);
    setDetails(null);

    try {
      // Test 1: Check if URL is configured
      if (!isApiConfigured()) {
        setStatus('error');
        setError('API URL not configured in src/config/api.js');
        return;
      }

      // Test 2: Try to connect
      const result = await apiClient.testConnection();
      
      if (result.connected) {
        setStatus('connected');
        setDetails(result.data);
      } else {
        setStatus('error');
        setError(result.error || 'Connection failed');
      }

      // Test 3: Check system status and health
      try {
        const [statusResult, health] = await Promise.all([
          apiClient.getStatus(),
          apiClient.health()
        ]);
        setDetails(prev => ({
          ...prev,
          system_status: statusResult,
          health
        }));
      } catch (e) {
        console.warn('Status/health check failed:', e);
      }

    } catch (err) {
      setStatus('error');
      setError(err.message || 'Unknown error');
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    switch (status) {
      case 'checking':
        return <RefreshCw className="animate-spin text-blue-500" size={24} />;
      case 'connected':
        return <CheckCircle className="text-green-500" size={24} />;
      case 'error':
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <AlertCircle className="text-yellow-500" size={24} />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'checking':
        return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20';
      case 'connected':
        return 'border-green-500 bg-green-50 dark:bg-green-900/20';
      case 'error':
        return 'border-red-500 bg-red-50 dark:bg-red-900/20';
      default:
        return 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20';
    }
  };

  return (
    <div className={`border-2 rounded-xl p-6 ${getStatusColor()}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="font-bold text-lg">
              {status === 'checking' && 'Checking Connection...'}
              {status === 'connected' && 'Connected to Backend'}
              {status === 'error' && 'Connection Failed'}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              API Status Check
            </p>
          </div>
        </div>
        <button
          onClick={testConnection}
          disabled={status === 'checking'}
          className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-50"
        >
          <RefreshCw size={16} className={status === 'checking' ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* Configuration Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 font-mono text-sm">
        <p className="text-gray-600 dark:text-gray-400 mb-2">Configured URL:</p>
        <p className="font-bold break-all">
          {API_BASE_URL || 'Not configured'}
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-lg p-4 mb-4">
          <p className="font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Details:
          </p>
          <p className="text-sm text-red-600 dark:text-red-300">
            {error}
          </p>
        </div>
      )}

      {/* Success Details */}
          {details && status === 'connected' && (
        <div className="space-y-2">
          <p className="font-semibold text-green-700 dark:text-green-400 mb-2">
            System Status:
          </p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-gray-600 dark:text-gray-400">Device</p>
                  <p className="font-bold">{details.system_status?.device || 'Unknown'}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-gray-600 dark:text-gray-400">Image Loaded</p>
              <p className="font-bold">
                {details.system_status?.image_loaded ? '✓ Yes' : '✗ No'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-gray-600 dark:text-gray-400">Modality</p>
              <p className="font-bold">
                    {details.system_status?.modality || 'None'}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-3 rounded">
              <p className="text-gray-600 dark:text-gray-400">Contexts</p>
              <p className="font-bold">
                    {details.system_status?.contexts_count || 0}
              </p>
            </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <p className="text-gray-600 dark:text-gray-400">MongoDB</p>
                  <p className="font-bold">
                    {details.system_status?.mongodb_connected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
                <div className="bg-white dark:bg-gray-800 p-3 rounded">
                  <p className="text-gray-600 dark:text-gray-400">Health</p>
                  <p className="font-bold">
                    {details.health?.status || 'Unknown'}
                  </p>
                </div>
          </div>
        </div>
      )}

      {/* Troubleshooting Help */}
      {status === 'error' && (
        <div className="mt-4 bg-white dark:bg-gray-800 rounded-lg p-4">
          <p className="font-semibold mb-2">Troubleshooting Steps:</p>
          <ol className="list-decimal list-inside space-y-1 text-sm text-gray-700 dark:text-gray-300">
            <li>Check that Google Colab cell is running</li>
            <li>Verify ngrok URL in src/config/api.js</li>
            <li>Make sure URL starts with https://</li>
            <li>Try accessing URL directly in browser</li>
            <li>Check browser console for CORS errors</li>
            <li>Restart React app (npm start)</li>
          </ol>
        </div>
      )}
    </div>
  );
};

export default ConnectionTester;