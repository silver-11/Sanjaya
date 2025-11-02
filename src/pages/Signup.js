import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { initializeGoogleSignIn, renderGoogleButton } from '../utils/googleAuth';

const Signup = () => {
  const { 
    darkMode, 
    setCurrentPage, 
    setIsLoggedIn,
    setUserData,
    handleGoogleLogin
  } = useApp();
  
  const googleButtonRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [signupError, setSignupError] = useState('');
  const [signupSuccess, setSignupSuccess] = useState('');

  // Initialize Google Sign-In
  useEffect(() => {
    const initGoogleSignIn = () => {
      if (window.google && window.google.accounts) {
        initializeGoogleSignIn(
          (googleUser) => {
            // Handle successful Google login
            handleGoogleLogin(googleUser);
          },
          (error) => {
            setSignupError(error || 'Google Sign-In failed. Please try again.');
          }
        );
        
        // Render Google button after initialization
        setTimeout(() => {
          if (document.getElementById('google-signup-button')) {
            renderGoogleButton('google-signup-button');
          }
        }, 100);
      } else {
        // Retry after a short delay if Google script hasn't loaded
        setTimeout(initGoogleSignIn, 100);
      }
    };

    initGoogleSignIn();
  }, [handleGoogleLogin]);

  const bgColor = darkMode ? 'bg-gray-900' : 'bg-white';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setSignupError(''); // Clear error when user types
  };

  const handleSignup = (e) => {
    e.preventDefault();
    
    // Clear previous messages
    setSignupError('');
    setSignupSuccess('');
    
    // Basic validation
    if (!formData.fullName.trim()) {
      setSignupError('Full name is required!');
      return;
    }
    
    if (!formData.email.trim()) {
      setSignupError('Email is required!');
      return;
    }
    
    if (formData.password !== formData.confirmPassword) {
      setSignupError('Passwords do not match!');
      return;
    }
    
    if (formData.password.length < 6) {
      setSignupError('Password must be at least 6 characters long!');
      return;
    }
    
    // Get existing users
    const getUsers = () => {
      try {
        const users = localStorage.getItem('registeredUsers');
        return users ? JSON.parse(users) : [];
      } catch (error) {
        return [];
      }
    };
    
    const users = getUsers();
    
    // Check if user already exists
    if (users.find(u => u.email === formData.email)) {
      setSignupError('This email is already registered. Please login instead.');
      return;
    }
    
    // Create new user with password
    const newUser = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password, // In production, this should be hashed
      createdAt: new Date().toISOString()
    };
    
    // Add to users array
    users.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(users));
    
    // Store current user data (without password)
    const newUserData = {
      fullName: formData.fullName,
      email: formData.email,
      createdAt: newUser.createdAt
    };
    localStorage.setItem('userData', JSON.stringify(newUserData));
    localStorage.setItem('currentUserEmail', formData.email);
    setUserData(newUserData);
    
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  return (
    <div className={`min-h-screen flex items-center justify-center ${
      darkMode ? 'bg-gradient-to-br from-gray-900 to-blue-900' : 'bg-gradient-to-br from-blue-50 to-indigo-100'
    }`}>
      <div className={`w-full max-w-md p-8 rounded-2xl shadow-2xl ${bgColor} border ${borderColor}`}>
        <button 
          onClick={() => setCurrentPage('login')} 
          className="text-blue-600 mb-4 font-semibold flex items-center gap-1 hover:gap-2 transition"
        >
          ← Back
        </button>
        <h1 className={`text-3xl font-bold ${textColor} mb-2`}>Create Account</h1>
        <p className="text-gray-500 mb-6">Join MediAI today</p>

        <form onSubmit={handleSignup} className="space-y-4">
          {signupError && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
              <p className="text-red-700 dark:text-red-400 text-sm">{signupError}</p>
            </div>
          )}
          {signupSuccess && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700 rounded-lg p-3">
              <p className="text-green-700 dark:text-green-400 text-sm">{signupSuccess}</p>
            </div>
          )}
          <div>
            <label className={`block text-sm font-semibold ${textColor} mb-1`}>Full Name</label>
            <input 
              type="text" 
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Dr. John Doe" 
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`} 
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textColor} mb-1`}>Email</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com" 
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`} 
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textColor} mb-1`}>Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="••••••••" 
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`} 
              required
            />
          </div>
          <div>
            <label className={`block text-sm font-semibold ${textColor} mb-1`}>Confirm Password</label>
            <input 
              type="password" 
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="••••••••" 
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'
              }`} 
              required
            />
          </div>
          <div className="flex items-center">
            <input type="checkbox" className="w-4 h-4" />
            <label className={`ml-2 text-sm ${textColor}`}>I agree to Terms & Privacy Policy</label>
          </div>
          <button 
            type="submit" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-purple-700 transition"
          >
            Create Account
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${darkMode ? 'border-gray-700' : 'border-gray-300'}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-2 ${darkMode ? 'bg-gray-900 text-gray-400' : 'bg-white text-gray-500'}`}>
              Or sign up with
            </span>
          </div>
        </div>

        {/* Google Sign-In Button */}
        <div className="mb-6">
          <div 
            id="google-signup-button" 
            ref={googleButtonRef}
            className="flex justify-center"
          ></div>
          {!window.google && (
            <button
              onClick={() => {
                setSignupError('Google Sign-In is loading. Please wait a moment and try again.');
              }}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className={darkMode ? 'text-white' : 'text-gray-700'}>Sign up with Google</span>
            </button>
          )}
        </div>

        <div className="text-center">
          <p className={`text-sm ${textColor}`}>
            Already have an account?{' '}
            <button 
              onClick={() => setCurrentPage('login')} 
              className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
