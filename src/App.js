import React, { useEffect } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Query from './pages/Query';
import DiseasePrediction from './pages/DiseasePrediction';
import History from './pages/History';
import Admin from './pages/Admin';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import FAQ from './pages/FAQ';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import './styles/index.css';
import { trackPageView } from './utils/analytics';

const AppContent = () => {
  const { currentPage, isLoggedIn } = useApp();

  useEffect(() => {
    if (isLoggedIn) {
      try { trackPageView(currentPage); } catch {}
    }
  }, [currentPage, isLoggedIn]);

  // Render login/signup pages if not logged in
  if (!isLoggedIn) {
    if (currentPage === 'signup') {
      return <Signup />;
    }
    return <Login />;
  }

  // Render main app with layout for logged-in users
  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <Home />;
      case 'dashboard':
        return <Dashboard />;
      case 'analysis':
        return <Analysis />;
      case 'query':
        return <Query />;
      case 'disease-prediction':
        return <DiseasePrediction />;
      case 'history':
        return <History />;
      case 'admin':
        return <Admin />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      case 'faq':
        return <FAQ />;
      case 'contact':
        return <Contact />;
      case 'privacy':
        return <Privacy />;
      case 'terms':
        return <Terms />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderPage()}
    </Layout>
  );
};

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;
