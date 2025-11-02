import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Shield, Clock, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { initializeGoogleSignIn, renderGoogleButton } from '../utils/googleAuth';

const Login = () => {
  const { 
    darkMode, 
    setDarkMode, 
    showPassword, 
    setShowPassword, 
    handleLogin,
    handleGoogleLogin,
    setCurrentPage 
  } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loginError, setLoginError] = useState('');
  const googleButtonRef = useRef(null);

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
            setLoginError(error || 'Google Sign-In failed. Please try again.');
          }
        );
        
        // Render Google button after initialization
        setTimeout(() => {
          if (document.getElementById('google-signin-button')) {
            renderGoogleButton('google-signin-button');
          }
        }, 100);
      } else {
        // Retry after a short delay if Google script hasn't loaded
        setTimeout(initGoogleSignIn, 100);
      }
    };

    initGoogleSignIn();
  }, [handleGoogleLogin]);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setLoginError(''); // Clear error when user types
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
      <div className="flex min-h-screen">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 to-blue-800/90"></div>
          <div className="relative z-10 flex flex-col justify-center px-12 text-white">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-4xl">🏥</span>
                <span className="text-3xl font-bold">Sanjaya</span>
              </div>
              <h1 className="text-4xl font-bold mb-4">Medical AI Platform</h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Advanced artificial intelligence for accurate, rapid, and reliable medical image analysis. 
                Trusted by healthcare professionals worldwide.
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-green-400" />
                <span>HIPAA Compliant & Secure</span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-400" />
                <span>Results in Minutes</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap className="w-5 h-5 text-purple-400" />
                <span>99.2% Accuracy Rate</span>
              </div>
            </div>
          </div>
          
          {/* Medical Image Background */}
          <div className="absolute bottom-0 right-0 w-96 h-96 opacity-10">
            <img 
              src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
              alt="Medical Analysis" 
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Additional Subtle Medical Images */}
          <div className="absolute top-20 left-8 w-24 h-24 opacity-15">
            <img 
              src="https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
              alt="Medical Reports" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
          <div className="absolute top-60 right-12 w-20 h-20 opacity-15">
            <img 
              src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80" 
              alt="Medical Security" 
              className="w-full h-full object-cover rounded-lg"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full lg:w-1/2 flex items-center justify-center px-8 relative overflow-hidden">
          {/* Subtle Medical Background Images */}      
          <div className="w-full max-w-md relative z-10">
            {/* Mobile Logo */}
            <div className="lg:hidden text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-4">
                <span className="text-3xl">🏥</span>
                <span className="text-2xl font-bold text-black dark:text-white">Sanjaya</span>
              </div>
              <p className="text-black dark:text-white font-medium">Medical AI Platform</p>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-black dark:text-white mb-2">Welcome Back</h2>
              <p className="text-black dark:text-white">Sign in to your medical AI account</p>
            </div>

            <form onSubmit={(e) => {
              const result = handleLogin(e);
              if (!result.success) {
                setLoginError(result.error);
              }
            }} className="space-y-6">
              {loginError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                  <p className="text-red-700 dark:text-red-400 text-sm">{loginError}</p>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                  Email Address
                </label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-black dark:text-white placeholder-gray-500 dark:placeholder-gray-400" 
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-black dark:text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors bg-white dark:bg-slate-700 text-black dark:text-white pr-12 placeholder-gray-500 dark:placeholder-gray-400" 
                    required
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)} 
                    className="absolute right-3 top-3 text-black hover:text-gray-700 dark:text-white dark:hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-900 text-blue-600 focus:ring-blue-500" />
                  <span className="ml-2 text-sm font-medium text-black dark:text-white">Remember me</span>
                </label>
                <button type="button" className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors">
                  Forgot password?
                </button>
              </div>

              <button 
                type="submit" 
                className="w-full medical-btn-primary text-white py-3 rounded-lg font-semibold inline-flex items-center justify-center gap-2"
              >
                <Shield size={20} /> Sign In Securely
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className={`w-full border-t ${darkMode ? 'border-slate-600' : 'border-gray-300'}`}></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className={`px-2 ${darkMode ? 'bg-slate-900 text-slate-400' : 'bg-white text-gray-500'}`}>
                  Or continue with
                </span>
              </div>
            </div>

            {/* Google Sign-In Button */}
            <div className="mb-6">
              <div 
                id="google-signin-button" 
                ref={googleButtonRef}
                className="flex justify-center"
              ></div>
              {!window.google && (
                <button
                  onClick={() => {
                    setLoginError('Google Sign-In is loading. Please wait a moment and try again.');
                  }}
                  className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium"
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
                  <span className={darkMode ? 'text-white' : 'text-gray-700'}>Sign in with Google</span>
                </button>
              )}
            </div>

            <div className="mt-6 text-center">
              <p className="text-black dark:text-white font-medium">
                New to Sanjaya?{' '}
                <button 
                  onClick={() => setCurrentPage('signup')} 
                  className="text-blue-600 font-semibold hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                >
                  Create Account
                </button>
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 text-center">
              <button 
                onClick={() => setDarkMode(!darkMode)} 
                className="text-sm px-4 py-2 rounded-lg transition-colors font-medium text-black dark:text-white hover:bg-gray-100 dark:hover:bg-slate-800"
              >
                {darkMode ? '☀ Switch to Light' : '🌙 Switch to Dark'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
