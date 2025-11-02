import React from 'react';
import { useApp } from '../context/AppContext';
import Sidebar from './Sidebar';
import TopNavbar from './TopNavbar';
import Notification from './Notification';

const Layout = ({ children }) => {
  const { sidebarOpen, darkMode } = useApp();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <Notification />
      <div className="flex">
        <Sidebar />
        <div className={`flex-1 ${sidebarOpen ? 'ml-72' : 'ml-20'} transition-all duration-300 ease-in-out min-h-screen`}>
          <TopNavbar />
          <main className="p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
