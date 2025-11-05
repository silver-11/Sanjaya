import React, { createContext, useContext, useState, useEffect } from 'react';
import { trackLogin, trackLogout } from '../utils/analytics';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [currentPage, setCurrentPage] = useState(() => {
    try {
      const saved = localStorage.getItem('userData');
      return saved ? 'dashboard' : 'login';
    } catch (error) {
      return 'login';
    }
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    try {
      const saved = localStorage.getItem('userData');
      return !!saved;
    } catch (error) {
      return false;
    }
  });
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [showNotification, setShowNotification] = useState(false);
  
  // User data state
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem('userData');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error loading user data:', error);
      return null;
    }
  });

  // Real analysis history - stored in localStorage for persistence
  const [analysisHistory, setAnalysisHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('medicalAnalysisHistory');
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      console.error('Error loading analysis history:', error);
      return [];
    }
  });

  // Save analysis history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('medicalAnalysisHistory', JSON.stringify(analysisHistory));
    } catch (error) {
      console.error('Error saving analysis history:', error);
    }
  }, [analysisHistory]);

  // Add new analysis to history
  const addAnalysisToHistory = (analysisData) => {
    const newAnalysis = {
      id: Date.now(), // Simple ID generation
      timestamp: new Date().toISOString(),
      fileName: analysisData.fileName,
      fileType: analysisData.fileType,
      modality: analysisData.modality,
      contextsCount: analysisData.contextsCount,
      chatHistory: analysisData.chatHistory || [],
      status: 'completed'
    };
    
    setAnalysisHistory(prev => [newAnalysis, ...prev]);
  };

  // Debug logging
  console.log('AppContext - analysisHistory:', analysisHistory);

  const [reports] = useState([
    { id: 1, title: 'Chest XRay Analysis', date: '2024-10-05', status: 'Completed', findings: 'No abnormalities detected', confidence: 94 },
    { id: 2, title: 'Brain MRI Report', date: '2024-10-03', status: 'Completed', findings: 'Healthy neural tissue', confidence: 87 }
  ]);

  // Get all registered users from localStorage
  const getUsers = () => {
    try {
      const users = localStorage.getItem('registeredUsers');
      return users ? JSON.parse(users) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  };

  // Save users to localStorage
  const saveUsers = (users) => {
    try {
      localStorage.setItem('registeredUsers', JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  };

  const handleLogin = (e, email, password) => {
    if (e) e.preventDefault();
    
    // Get login credentials from form or parameters
    let loginEmail = email;
    let loginPassword = password;
    
    if (!loginEmail || !loginPassword) {
      // Get from form if not provided
      const form = e?.target;
      if (form) {
        loginEmail = form.querySelector('input[name="email"]')?.value || form.querySelector('input[type="email"]')?.value;
        loginPassword = form.querySelector('input[name="password"]')?.value || form.querySelector('input[type="password"]')?.value;
      }
    }
    
    if (!loginEmail || !loginPassword) {
      return { success: false, error: 'Email and password are required' };
    }
    
    // Admin gating via env (UI-only; not a security boundary)
    const adminEmailsCsv = process.env.REACT_APP_ADMIN_EMAILS || '';
    const adminEmails = adminEmailsCsv.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const adminCode = process.env.REACT_APP_ADMIN_CODE || '';

    // Get all registered users
    const users = getUsers();
    
    // Find user by email
    let user = users.find(u => u.email === loginEmail);
    
    // If admin override and user doesn't exist, auto-provision a local admin user
    const isAdminEmail = adminEmails.includes(loginEmail.toLowerCase());
    const isAdminLoginAttempt = isAdminEmail && adminCode && loginPassword === adminCode;
    if (!user && isAdminLoginAttempt) {
      user = {
        fullName: 'Administrator',
        email: loginEmail,
        createdAt: new Date().toISOString(),
        role: 'admin',
        // store a placeholder; password is admin code path only
        password: `__admin_code__`
      };
      const updated = [...users, user];
      saveUsers(updated);
    }
    
    if (!user) {
      return { success: false, error: 'User not found. Please sign up first.' };
    }
    
    // Verify password (or admin override via admin code)
    const isAdminLogin = isAdminLoginAttempt;
    const passwordOk = isAdminLogin || user.password === loginPassword;
    if (!passwordOk) {
      return { success: false, error: 'Incorrect password. Please try again.' };
    }
    
    // Login successful
    const userData = {
      fullName: user.fullName,
      email: user.email,
      createdAt: user.createdAt,
      role: isAdminLogin ? 'admin' : (user.role || 'user')
    };
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('currentUserEmail', user.email); // Store current user email for password updates
    setUserData(userData);
    setIsLoggedIn(true);
    setCurrentPage((isAdminLogin || userData.role === 'admin') ? 'admin' : 'dashboard');
    try { trackLogin(userData); } catch {}
    
    return { success: true };
  };

  const handleGoogleLogin = (googleUser) => {
    // Check if user already exists
    const users = getUsers();
    const existingUser = users.find(u => u.email === googleUser.email);
    
    let userToSave;
    
    if (existingUser) {
      // Update existing user with Google info
      existingUser.googleId = googleUser.googleId;
      existingUser.picture = googleUser.picture;
      existingUser.provider = 'google';
      userToSave = existingUser;
      
      // Update in users array
      const userIndex = users.findIndex(u => u.email === googleUser.email);
      users[userIndex] = existingUser;
      saveUsers(users);
    } else {
      // Create new user from Google
      userToSave = {
        fullName: googleUser.fullName,
        email: googleUser.email,
        googleId: googleUser.googleId,
        picture: googleUser.picture,
        provider: 'google',
        createdAt: googleUser.createdAt
      };
      
      // Add to users array (without password since it's Google login)
      users.push(userToSave);
      saveUsers(users);
    }
    
    // Set user data for session
    const adminEmailsCsv = process.env.REACT_APP_ADMIN_EMAILS || '';
    const adminEmails = adminEmailsCsv.split(',').map(e => e.trim().toLowerCase()).filter(Boolean);
    const isAdmin = adminEmails.includes((userToSave.email || '').toLowerCase());
    const userData = {
      fullName: userToSave.fullName,
      email: userToSave.email,
      picture: userToSave.picture,
      createdAt: userToSave.createdAt,
      provider: 'google',
      role: isAdmin ? 'admin' : 'user'
    };
    
    localStorage.setItem('userData', JSON.stringify(userData));
    localStorage.setItem('currentUserEmail', userToSave.email);
    setUserData(userData);
    setIsLoggedIn(true);
    setCurrentPage(isAdmin ? 'admin' : 'dashboard');
    try { trackLogin(userData); } catch {}
    
    return { success: true };
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentPage('login');
    setUserDropdown(false);
    try { trackLogout(userData); } catch {}
    setUserData(null);
    localStorage.removeItem('userData');
    localStorage.removeItem('currentUserEmail');
  };

  const handleAnalysis = () => {
    setAnalysisProgress(0);
    const interval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
          return 100;
        }
        return prev + Math.random() * 30;
      });
    }, 800);
  };

  const value = {
    currentPage,
    setCurrentPage,
    sidebarOpen,
    setSidebarOpen,
    isLoggedIn,
    setIsLoggedIn,
    showPasswordForm,
    setShowPasswordForm,
    showPassword,
    setShowPassword,
    darkMode,
    setDarkMode,
    userDropdown,
    setUserDropdown,
    analysisProgress,
    setAnalysisProgress,
    showNotification,
    setShowNotification,
    analysisHistory,
    addAnalysisToHistory,
    userData,
    setUserData,
    reports,
    handleLogin,
    handleGoogleLogin,
    handleLogout,
    handleAnalysis
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
