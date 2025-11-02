import React, { useState, useEffect } from 'react';
import { Star, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Profile = () => {
  const { 
    darkMode, 
    showPasswordForm, 
    setShowPasswordForm,
    userData,
    setUserData
  } = useApp();
  
  // Load profile data from localStorage or use defaults
  const loadProfileData = () => {
    try {
      const saved = localStorage.getItem('userProfileData');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
    }
    // Default values based on userData or fallback
    return {
      fullName: userData?.fullName || '',
      email: userData?.email || '',
      phone: '',
      specialization: '',
      hospital: '',
      licenseId: ''
    };
  };

  const [profileData, setProfileData] = useState(loadProfileData);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  // Update profile data when userData changes
  useEffect(() => {
    const saved = loadProfileData();
    // Merge saved data with userData if available
    const updatedData = {
      ...saved,
      fullName: userData?.fullName || saved.fullName || '',
      email: userData?.email || saved.email || ''
    };
    setProfileData(updatedData);
  }, [userData]);

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const profileFields = [
    { label: 'Full Name', name: 'fullName' },
    { label: 'Email', name: 'email' },
    { label: 'Phone', name: 'phone' },
    { label: 'Specialization', name: 'specialization' },
    { label: 'Hospital', name: 'hospital' },
    { label: 'License ID', name: 'licenseId' }
  ];

  const passwordFields = [
    { label: 'Current Password', id: 'currentPassword', name: 'currentPassword' },
    { label: 'New Password', id: 'newPassword', name: 'newPassword' },
    { label: 'Confirm Password', id: 'confirmPassword', name: 'confirmPassword' }
  ];
  
  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
    setPasswordError('');
    setPasswordSuccess('');
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({
      ...prev,
      [name]: value
    }));
    setProfileError('');
    setProfileSuccess('');
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setProfileError('');
    setProfileSuccess('');
    
    // Validation
    if (!profileData.fullName.trim()) {
      setProfileError('Full name is required!');
      return;
    }
    
    if (!profileData.email.trim()) {
      setProfileError('Email is required!');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileData.email)) {
      setProfileError('Please enter a valid email address!');
      return;
    }
    
    // Get current user email
    const currentUserEmail = localStorage.getItem('currentUserEmail') || userData?.email;
    
    if (!currentUserEmail) {
      setProfileError('Unable to identify user. Please log in again.');
      return;
    }
    
    // Update user data in registeredUsers
    const getUsers = () => {
      try {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
      } catch (error) {
        return [];
      }
    };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === currentUserEmail);
    
    if (userIndex !== -1) {
      // Update fullName and email if changed
      users[userIndex].fullName = profileData.fullName;
      if (profileData.email !== currentUserEmail) {
        // Check if new email is already taken
        if (users.find(u => u.email === profileData.email && u.email !== currentUserEmail)) {
          setProfileError('This email is already registered!');
          return;
        }
        users[userIndex].email = profileData.email;
        localStorage.setItem('currentUserEmail', profileData.email);
      }
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    }
    
    // Update userData in context
    const updatedUserData = {
      fullName: profileData.fullName,
      email: profileData.email,
      createdAt: userData?.createdAt || new Date().toISOString()
    };
    localStorage.setItem('userData', JSON.stringify(updatedUserData));
    setUserData(updatedUserData);
    
    // Save additional profile data (phone, specialization, etc.)
    const additionalData = {
      ...profileData,
      fullName: profileData.fullName,
      email: profileData.email
    };
    localStorage.setItem('userProfileData', JSON.stringify(additionalData));
    
    setProfileSuccess('Profile updated successfully!');
    setTimeout(() => {
      setProfileSuccess('');
    }, 3000);
  };

  const handleCancelProfile = () => {
    // Reset to saved data
    const saved = loadProfileData();
    setProfileData(saved);
    setProfileError('');
    setProfileSuccess('');
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setPasswordError('');
    setPasswordSuccess('');
    
    // Validation
    if (!passwordData.currentPassword) {
      setPasswordError('Current password is required!');
      return;
    }
    
    if (!passwordData.newPassword) {
      setPasswordError('New password is required!');
      return;
    }
    
    if (passwordData.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long!');
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match!');
      return;
    }
    
    // Get current user email
    const currentUserEmail = localStorage.getItem('currentUserEmail') || userData?.email;
    
    if (!currentUserEmail) {
      setPasswordError('Unable to identify user. Please log in again.');
      return;
    }
    
    // Get all users
    const getUsers = () => {
      try {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
      } catch (error) {
        return [];
      }
    };
    
    const users = getUsers();
    const userIndex = users.findIndex(u => u.email === currentUserEmail);
    
    if (userIndex === -1) {
      setPasswordError('User not found. Please sign up again.');
      return;
    }
    
    // Verify current password
    if (users[userIndex].password !== passwordData.currentPassword) {
      setPasswordError('Current password is incorrect!');
      return;
    }
    
    // Update password
    users[userIndex].password = passwordData.newPassword;
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Clear form
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    setPasswordSuccess('Password updated successfully!');
    setTimeout(() => {
      setShowPasswordForm(false);
      setPasswordSuccess('');
    }, 2000);
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className={`text-4xl font-bold ${textColor}`}>User Profile</h1>

      <div className={`${cardBg} p-8 rounded-xl border ${borderColor}`}>
        <div className="flex items-center gap-6 mb-8 pb-8 border-b border-gray-200 dark:border-gray-700">
          <div className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full text-white flex items-center justify-center text-4xl font-bold flex-shrink-0">
            {profileData.fullName ? profileData.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'}
          </div>
          <div>
            <p className={`text-3xl font-bold ${textColor}`}>{profileData.fullName || 'User'}</p>
            <p className="text-gray-500">
              {profileData.specialization ? `Medical Professional • ${profileData.specialization}` : 'Medical Professional'}
            </p>
            <div className="flex gap-1 mt-2">
              {[...Array(5)].map((_, i) => <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />)}
            </div>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {profileError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{profileError}</p>
            </div>
          )}
          {profileSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-3">
              <p className="text-green-700 dark:text-green-400 text-sm">{profileSuccess}</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {profileFields.map((field, i) => (
              <div key={i}>
                <label className={`block text-sm font-bold ${textColor} mb-2`}>{field.label}</label>
                <input 
                  type={field.name === 'email' ? 'email' : 'text'}
                  name={field.name}
                  value={profileData[field.name] || ''} 
                  onChange={handleProfileChange}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                    darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white'
                  }`} 
                  required={field.name === 'fullName' || field.name === 'email'}
                />
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-gray-300 dark:border-gray-700">
            <button 
              type="button" 
              onClick={() => setShowPasswordForm(!showPasswordForm)} 
              className="text-blue-600 font-bold hover:underline flex items-center gap-2"
            >
              <Lock size={18} /> Change Password
            </button>
          </div>
        </form>

        {showPasswordForm && (
          <form onSubmit={handleUpdatePassword} className={`mt-6 p-6 rounded-lg ${darkMode ? 'bg-gray-700' : 'bg-blue-50'} space-y-4`}>
            <h3 className={`font-bold ${textColor} flex items-center gap-2`}>
              <Lock size={20} /> Change Password
            </h3>
            {passwordError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                <p className="text-red-700 dark:text-red-400 text-sm">{passwordError}</p>
              </div>
            )}
            {passwordSuccess && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-3">
                <p className="text-green-700 dark:text-green-400 text-sm">{passwordSuccess}</p>
              </div>
            )}
            {passwordFields.map(field => (
              <div key={field.id}>
                <label className={`block text-sm font-bold ${textColor} mb-2`}>{field.label}</label>
                <input 
                  type="password" 
                  name={field.name}
                  value={passwordData[field.name] || ''}
                  onChange={handlePasswordChange}
                  className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                    darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'
                  }`} 
                  required
                />
              </div>
            ))}
            <button 
              type="submit" 
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition"
            >
              Update Password
            </button>
          </form>
        )}

        <div className="mt-6 flex gap-4">
          <button 
            type="submit" 
            className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg font-bold transition transform hover:scale-105"
          >
            Save Changes
          </button>
          <button 
            type="button"
            onClick={handleCancelProfile}
            className={`px-8 py-3 border ${borderColor} rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-bold ${textColor}`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
