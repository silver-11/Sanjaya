import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Users, 
  Moon, 
  Sun, 
  Bell, 
  Save, 
  Download, 
  Trash2, 
  Shield, 
  Key,
  Settings as SettingsIcon,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Settings = () => {
  const { darkMode, setDarkMode, userData, analysisHistory } = useApp();
  
  // Load preferences from localStorage
  const [preferences, setPreferences] = useState(() => {
    try {
      const saved = localStorage.getItem('userPreferences');
      return saved ? JSON.parse(saved) : {
        emailNotifications: true,
        autoSaveReports: true,
        twoFactorAuth: false
      };
    } catch {
      return {
        emailNotifications: true,
        autoSaveReports: true,
        twoFactorAuth: false
      };
    }
  });

  const [message, setMessage] = useState({ type: '', text: '' });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      localStorage.setItem('userPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving preferences:', error);
    }
  }, [preferences]);

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const secondaryText = darkMode ? 'text-gray-400' : 'text-gray-600';
  const hoverBg = darkMode ? 'hover:bg-gray-700' : 'hover:bg-teal-50';

  const handleTogglePreference = (key) => {
    setPreferences(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
    setMessage({ 
      type: 'success', 
      text: `${key === 'emailNotifications' ? 'Email notifications' : key === 'autoSaveReports' ? 'Auto-save reports' : 'Two-factor authentication'} ${!preferences[key] ? 'enabled' : 'disabled'}` 
    });
    setTimeout(() => setMessage({ type: '', text: '' }), 3000);
  };

  const handleDownloadData = () => {
    try {
      // Get disease prediction history
      const diseaseHistory = JSON.parse(localStorage.getItem('diseasePredictionHistory') || '[]');
      
      // Combine all user data
      const userDataExport = {
        userInfo: userData,
        preferences: preferences,
        analysisHistory: analysisHistory,
        diseaseHistory: diseaseHistory,
        exportDate: new Date().toISOString()
      };

      // Create download
      const dataStr = JSON.stringify(userDataExport, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `sanjaya-medical-ai-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setMessage({ type: 'success', text: 'Your data has been downloaded successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (error) {
      console.error('Error downloading data:', error);
      setMessage({ type: 'error', text: 'Failed to download data. Please try again.' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    }
  };

  const handleDeleteAccount = () => {
    // In a real app, this would call an API to delete the account
    // For now, we'll just show a confirmation message
    setShowDeleteConfirm(true);
  };

  const confirmDeleteAccount = () => {
    // Clear all user data
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUserEmail');
    localStorage.removeItem('userPreferences');
    localStorage.removeItem('medicalAnalysisHistory');
    localStorage.removeItem('diseasePredictionHistory');
    
    // Remove user from registeredUsers
    try {
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const updatedUsers = users.filter(u => u.email !== userData?.email);
      localStorage.setItem('registeredUsers', JSON.stringify(updatedUsers));
    } catch (error) {
      console.error('Error removing user:', error);
    }

    // Redirect to login
    window.location.href = '/';
  };

  const ToggleSwitch = ({ enabled, onChange, label, icon: Icon }) => (
    <div className={`flex justify-between items-center p-4 rounded-lg border ${borderColor} ${hoverBg} transition-colors`}>
      <div className="flex items-center gap-3">
        {Icon && <Icon size={20} className={darkMode ? 'text-blue-400' : 'text-teal-600'} />}
        <div>
          <p className={`font-semibold ${textColor}`}>{label}</p>
        </div>
      </div>
      <button
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          enabled 
            ? darkMode ? 'bg-blue-600' : 'bg-teal-600' 
            : darkMode ? 'bg-gray-600' : 'bg-gray-300'
        }`}
        role="switch"
        aria-checked={enabled}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
            enabled ? 'translate-x-6' : 'translate-x-1'
          }`}
        />
      </button>
    </div>
  );

  const ActionButton = ({ label, icon: Icon, onClick, color = 'teal', danger = false }) => {
    let colorClasses = '';
    
    if (danger) {
      colorClasses = darkMode 
        ? 'border-red-700 hover:bg-red-900/20 text-red-400 hover:text-red-300' 
        : 'border-red-300 hover:bg-red-50 text-red-600 hover:text-red-700';
    } else {
      switch (color) {
        case 'blue':
          colorClasses = darkMode
            ? 'border-blue-700 hover:bg-blue-900/20 text-blue-400 hover:text-blue-300'
            : 'border-blue-300 hover:bg-blue-50 text-blue-600 hover:text-blue-700';
          break;
        case 'purple':
          colorClasses = darkMode
            ? 'border-purple-700 hover:bg-purple-900/20 text-purple-400 hover:text-purple-300'
            : 'border-purple-300 hover:bg-purple-50 text-purple-600 hover:text-purple-700';
          break;
        case 'green':
          colorClasses = darkMode
            ? 'border-green-700 hover:bg-green-900/20 text-green-400 hover:text-green-300'
            : 'border-green-300 hover:bg-green-50 text-green-600 hover:text-green-700';
          break;
        default: // teal
          colorClasses = darkMode
            ? 'border-teal-700 hover:bg-teal-900/20 text-teal-400 hover:text-teal-300'
            : 'border-teal-300 hover:bg-teal-50 text-teal-600 hover:text-teal-700';
      }
    }

    return (
      <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-6 py-4 rounded-lg border transition-all font-medium ${colorClasses}`}
      >
        <Icon size={20} />
        <span>{label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex items-center gap-3">
        <SettingsIcon size={32} className={darkMode ? 'text-blue-400' : 'text-teal-600'} />
        <h1 className={`text-4xl font-bold ${textColor}`}>Settings</h1>
      </div>

      {message.text && (
        <div className={`flex items-center gap-2 p-4 rounded-lg border ${
          message.type === 'success'
            ? darkMode ? 'bg-green-900/20 border-green-700 text-green-400' : 'bg-green-50 border-green-200 text-green-700'
            : message.type === 'error'
            ? darkMode ? 'bg-red-900/20 border-red-700 text-red-400' : 'bg-red-50 border-red-200 text-red-700'
            : darkMode ? 'bg-blue-900/20 border-blue-700 text-blue-400' : 'bg-blue-50 border-blue-200 text-blue-700'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle size={20} />
          ) : (
            <AlertCircle size={20} />
          )}
          <span>{message.text}</span>
        </div>
      )}

      {/* Appearance Section */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor} space-y-6`}>
        <h3 className={`text-2xl font-bold ${textColor} flex items-center gap-2`}>
          {darkMode ? <Moon size={24} className="text-blue-400" /> : <Sun size={24} className="text-teal-600" />}
          Appearance
        </h3>
        <ToggleSwitch
          enabled={darkMode}
          onChange={() => {
            setDarkMode(!darkMode);
            setMessage({ type: 'success', text: `Dark mode ${!darkMode ? 'enabled' : 'disabled'}` });
            setTimeout(() => setMessage({ type: '', text: '' }), 3000);
          }}
          label="Dark Mode"
          icon={darkMode ? Moon : Sun}
        />
      </div>

      {/* Preferences Section */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor} space-y-6`}>
        <h3 className={`text-2xl font-bold ${textColor} flex items-center gap-2`}>
          <Zap size={24} className={darkMode ? 'text-blue-400' : 'text-teal-600'} />
          Preferences
        </h3>
        <div className="space-y-3">
          <ToggleSwitch
            enabled={preferences.emailNotifications}
            onChange={() => handleTogglePreference('emailNotifications')}
            label="Email Notifications"
            icon={Bell}
          />
          <ToggleSwitch
            enabled={preferences.autoSaveReports}
            onChange={() => handleTogglePreference('autoSaveReports')}
            label="Auto-Save Reports"
            icon={Save}
          />
          <ToggleSwitch
            enabled={preferences.twoFactorAuth}
            onChange={() => handleTogglePreference('twoFactorAuth')}
            label="Two-Factor Authentication"
            icon={Shield}
          />
        </div>
      </div>

      {/* Account Management Section */}
      <div className={`${cardBg} p-6 rounded-xl border ${borderColor} space-y-6`}>
        <h3 className={`text-2xl font-bold ${textColor} flex items-center gap-2`}>
          <Users size={24} className={darkMode ? 'text-blue-400' : 'text-teal-600'} />
          Account Management
        </h3>
        <div className="space-y-3">
          <ActionButton
            label="Download Your Data"
            icon={Download}
            onClick={handleDownloadData}
            color="blue"
          />
          <ActionButton
            label="Change Privacy Settings"
            icon={Shield}
            onClick={() => {
              setMessage({ type: 'info', text: 'Privacy settings feature coming soon!' });
              setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }}
            color="purple"
          />
          <ActionButton
            label="Manage API Keys"
            icon={Key}
            onClick={() => {
              setMessage({ type: 'info', text: 'API key management feature coming soon!' });
              setTimeout(() => setMessage({ type: '', text: '' }), 3000);
            }}
            color="green"
          />
          <ActionButton
            label="Delete Account"
            icon={Trash2}
            onClick={handleDeleteAccount}
            danger={true}
          />
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className={`${cardBg} p-6 rounded-xl border ${borderColor} max-w-md w-full mx-4`}>
            <h3 className={`text-xl font-bold ${textColor} mb-4`}>Delete Account</h3>
            <p className={`${secondaryText} mb-6`}>
              Are you sure you want to delete your account? This action cannot be undone. All your data, including analysis history and preferences, will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 px-4 py-2 rounded-lg border ${borderColor} ${hoverBg} ${textColor} font-medium transition-colors`}
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmDeleteAccount();
                  setShowDeleteConfirm(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
