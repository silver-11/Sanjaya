import React from 'react';
import { Menu, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TopNavbar = () => {
  const { 
    currentPage, 
    setCurrentPage, 
    darkMode, 
    setDarkMode,
    sidebarOpen,
    setSidebarOpen,
    userDropdown,
    setUserDropdown,
    handleLogout,
    userData
  } = useApp();

  // Map page IDs to display names
  const getPageDisplayName = (pageId) => {
    const pageNames = {
      'home': 'Home',
      'dashboard': 'Dashboard',
      'analysis': 'Analysis',
      'disease-prediction': 'Disease Prediction',
      'history': 'History',
      'profile': 'Profile',
      'settings': 'Settings',
      'faq': 'Help & FAQ',
      'contact': 'Contact',
      'privacy': 'Privacy Policy',
      'terms': 'Terms of Service'
    };
    return pageNames[pageId] || pageId.charAt(0).toUpperCase() + pageId.slice(1);
  };

  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-teal-600 border-teal-700'} border-b shadow-sm sticky top-0 z-50`}>
      <div className="w-full px-6">
        <div className="flex justify-between items-center h-16">
          {/* Left: Toggle & Current Page */}
          <div className="flex items-center gap-4">
            {/* Sidebar Toggle */}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-teal-700 text-white'}`}
              aria-label="Toggle sidebar"
            >
              <Menu size={20} />
            </button>

            {/* Current Page Badge */}
            <div className={`px-3 py-1.5 rounded-lg ${darkMode ? 'bg-slate-700' : 'bg-white/20 backdrop-blur-sm'}`}>
              <span className={`text-sm font-medium ${darkMode ? 'text-slate-300' : 'text-white'}`}>
                {getPageDisplayName(currentPage)}
              </span>
            </div>
          </div>

          {/* Right: Theme Toggle & Profile */}
          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button 
              onClick={() => setDarkMode(!darkMode)} 
              className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-white/20 hover:bg-white/30 text-white'}`}
              aria-label="Toggle theme"
            >
              <span className="text-lg">{darkMode ? '☀️' : '🌙'}</span>
            </button>

            {/* Profile Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setUserDropdown(!userDropdown)} 
                className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700' : 'hover:bg-teal-700'}`}
              >
                <div className={`w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-medium ${darkMode ? 'bg-blue-600' : 'bg-white/20 backdrop-blur-sm'}`}>
                  {userData ? userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
                </div>
                <ChevronDown 
                  size={16} 
                  className={`${darkMode ? 'text-slate-400' : 'text-white'} transition-transform ${userDropdown ? 'rotate-180' : ''}`} 
                />
              </button>
              
              {userDropdown && (
                <div className={`absolute right-0 mt-2 w-56 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-teal-200'} rounded-lg shadow-lg border z-50 overflow-hidden`}>
                  <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-teal-100'}`}>
                    <p className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-teal-900'}`}>
                      {userData ? userData.fullName : 'User'}
                    </p>
                    <p className={`text-sm ${darkMode ? 'text-slate-500' : 'text-teal-600'}`}>
                      {userData ? userData.email : 'user@example.com'}
                    </p>
                  </div>
                  {[
                    { id: 'profile', label: 'View Profile' },
                    { id: 'settings', label: 'Settings' }
                  ].map(item => (
                    <button 
                      key={item.id} 
                      onClick={() => { setCurrentPage(item.id); setUserDropdown(false); }} 
                      className={`w-full text-left px-4 py-2 transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-teal-50 text-teal-700'}`}
                    >
                      {item.label}
                    </button>
                  ))}
                  <button 
                    onClick={handleLogout} 
                    className={`w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors border-t ${darkMode ? 'border-slate-700 text-slate-300' : 'border-teal-100 text-teal-700'}`}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopNavbar;