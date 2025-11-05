// ===========================================
// src/components/Sidebar.js - Updated Navigation
// ===========================================
import React from 'react';
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  HelpCircle, 
  Mail, 
  Settings,
  Home,
  BarChart3,
  Upload,
  Activity,
  Clock,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = () => {
  const { 
    sidebarOpen, 
    setSidebarOpen, 
    currentPage, 
    setCurrentPage, 
    handleLogout, 
    darkMode 
  } = useApp();

  // Main navigation items (top of sidebar)
  const navigationItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'analysis', label: 'Analysis', icon: Upload },
    { id: 'disease-prediction', label: 'Disease Prediction', icon: Activity },
    { id: 'history', label: 'History', icon: Clock }
  ];

  // Secondary navigation (More section)
  const moreItems = [
    { id: 'admin', label: 'Admin', icon: Shield },
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'faq', label: 'Help & FAQ', icon: HelpCircle },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  return (
    <div className={`${sidebarOpen ? 'w-72' : 'w-20'} ${darkMode ? 'bg-slate-800' : 'bg-teal-600'} text-white transition-all duration-300 fixed h-screen overflow-y-auto shadow-lg z-30`}>
      <div className={`p-6 flex items-center border-b ${darkMode ? 'border-slate-700' : 'border-teal-700'}`}>
        {sidebarOpen ? (
          <div className="flex items-center gap-2 w-full">
            <span className="text-xl">🏥</span>
            <span className="text-lg font-bold text-white">Sanjaya Medical AI</span>
          </div>
        ) : (
          <div className="flex items-center justify-center w-full">
            <span className="text-xl">🏥</span>
          </div>
        )}
      </div>

      <nav className="space-y-1 px-3 mt-6">
        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setCurrentPage(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${
              currentPage === item.id 
                ? `${darkMode ? 'bg-blue-600' : 'bg-teal-700'} text-white` 
                : `${darkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-teal-50 hover:bg-teal-700 hover:text-white'}`
            }`}
          >
            <item.icon size={18} />
            {sidebarOpen && (
              <span className="text-sm font-medium">
                {item.label}
              </span>
            )}
          </button>
        ))}
      </nav>

      {/* Pages Section */}
      {sidebarOpen && (
        <div className="px-3 mt-8">
          <div className={`text-xs font-medium ${darkMode ? 'text-slate-400' : 'text-teal-100'} uppercase tracking-wider mb-3`}>
            Pages
          </div>
          <div className="space-y-1">
            {moreItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setCurrentPage(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                  currentPage === item.id 
                    ? `${darkMode ? 'bg-blue-600' : 'bg-teal-700'} text-white` 
                    : `${darkMode ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-teal-50 hover:bg-teal-700 hover:text-white'}`
                }`}
              >
                <item.icon size={16} />
                <span className="text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className={`p-3 mt-auto ${darkMode ? 'border-t border-slate-700 bg-slate-800' : 'border-t border-teal-700 bg-teal-600'} absolute bottom-0 left-0 right-0`}>
        <button 
          onClick={handleLogout} 
          className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-300 hover:text-white' : 'hover:bg-teal-700 text-teal-50 hover:text-white'}`}
        >
          <LogOut size={18} />
          {sidebarOpen && <span className="text-sm">Logout</span>}
        </button>
      </div>
    </div>
  );
};

export default Sidebar;