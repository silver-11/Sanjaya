import React from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Header = () => {
  const { 
    darkMode, 
    setDarkMode, 
    userDropdown, 
    setUserDropdown, 
    setCurrentPage, 
    handleLogout,
    userData
  } = useApp();

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-gray-50';
  const borderColor = darkMode ? 'border-gray-700' : 'border-gray-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  return (
    <div className={`${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border-b px-6 py-6 flex items-center justify-between sticky top-16 z-40 shadow-sm`}>
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full">
          <Search className={`absolute left-3 top-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`} size={20} />
          <input 
            type="text" 
            placeholder="Search medical analyses..." 
            className={`w-full pl-10 pr-4 py-2.5 rounded-lg border ${darkMode ? 'bg-slate-700 border-slate-600 text-slate-100 focus:border-blue-500' : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-blue-500'} focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors`} 
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 p-2 rounded-lg transition-colors">
          <Bell className={`${darkMode ? 'text-slate-400' : 'text-slate-600'}`} size={20} />
          <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
        </div>
        <button 
          onClick={() => setDarkMode(!darkMode)} 
          className={`p-2 rounded-lg transition-colors ${darkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-100 hover:bg-slate-200'}`}
        >
          <span className="text-lg">{darkMode ? '☀' : '🌙'}</span>
        </button>
        <div className="relative">
          <button 
            onClick={() => setUserDropdown(!userDropdown)} 
            className="flex items-center gap-2 p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <div className="w-8 h-8 bg-blue-600 rounded-full text-white flex items-center justify-center text-sm font-medium">
              {userData ? userData.fullName.split(' ').map(n => n[0]).join('').toUpperCase() : 'U'}
            </div>
            <ChevronDown size={16} className={`${darkMode ? 'text-slate-400' : 'text-slate-600'} transition-transform ${userDropdown ? 'rotate-180' : ''}`} />
          </button>
          {userDropdown && (
            <div className={`absolute right-0 mt-2 w-56 ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} rounded-lg shadow-lg border z-50 overflow-hidden`}>
              <div className={`px-4 py-3 border-b ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                <p className={`font-semibold ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
                  {userData ? userData.fullName : 'User'}
                </p>
                <p className="text-slate-500 text-sm">
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
                  className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <button 
                onClick={handleLogout} 
                className={`w-full text-left px-4 py-2 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors border-t ${darkMode ? 'border-slate-700' : 'border-slate-200'}`}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
