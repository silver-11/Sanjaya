// ===========================================
// src/pages/Analysis.js - Space Themed Analysis
// ===========================================
import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertCircle, CheckCircle, Zap, Shield, XCircle, Activity } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient, isApiConfigured } from '../config/api';

const Analysis = () => {
  const { setShowNotification, addAnalysisToHistory } = useApp();
  
  // Image upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [imageSessionId, setImageSessionId] = useState(null);
  
  // Chat states
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [isAsking, setIsAsking] = useState(false);
  const [chatError, setChatError] = useState('');
  
  // Space animation states
  const [stars, setStars] = useState([]);
  const [shootingStars, setShootingStars] = useState([]);
  
  const chatEndRef = useRef(null);

  // Initialize image session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      if (!isApiConfigured()) return;
      
      try {
        const result = await apiClient.startImageSession();
        setImageSessionId(result.session_id);
      } catch (error) {
        console.error('Failed to initialize image session:', error);
      }
    };
    
    initializeSession();
  }, []);

  // Generate random stars for background
  useEffect(() => {
    const generateStars = () => {
      const newStars = [];
      for (let i = 0; i < 250; i++) {
        newStars.push({
          id: i,
          x: Math.random() * 100,
          y: Math.random() * 100,
          size: Math.random() * 2.5 + 0.5,
          opacity: Math.random() * 0.8 + 0.2,
          duration: Math.random() * 4 + 3
        });
      }
      setStars(newStars);
    };
    generateStars();

    // Generate occasional shooting stars
    const shootingStarInterval = setInterval(() => {
      const newShootingStar = {
        id: Date.now(),
        x: Math.random() * 100,
        y: Math.random() * 30,
        duration: Math.random() * 2 + 1
      };
      setShootingStars(prev => [...prev, newShootingStar]);
      
      setTimeout(() => {
        setShootingStars(prev => prev.filter(s => s.id !== newShootingStar.id));
      }, 3000);
    }, 10000);

    return () => clearInterval(shootingStarInterval);
  }, []);

  const guidelines = [
    { text: 'Clear, well-lit images' },
    { text: 'Max 100MB file size' },
    { text: 'JPG, PNG, DICOM, NIfTI' },
    { text: 'Patient data anonymized' },
    { text: 'Analysis: 2-5 minutes' }
  ];

  const quickQuestions = [
    'What anatomical structures are visible?',
    'Are there any abnormalities detected?',
    'What is the image quality?',
    'Describe the key findings',
    'What is the clinical significance?'
  ];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setUploadStatus(`Selected: ${file.name}`);
      setAnalysisResult(null);
      setChatHistory([]);
      setChatError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadStatus('Please select a file first');
      return;
    }

    if (!isApiConfigured()) {
      setUploadStatus('⚠️ API not configured. Check src/config/api.js');
      return;
    }

    setIsUploading(true);
    setUploadStatus('Uploading and analyzing image...');
    setAnalysisResult(null);
    setChatHistory([]);

    try {
      const result = await apiClient.uploadImage(selectedFile);
      
      // Update session ID if provided
      if (result.session_id) {
        setImageSessionId(result.session_id);
      }
      
      setUploadStatus('✅ Analysis complete! You can now ask questions below.');
      setAnalysisResult(result);
      setShowNotification(true);
      setTimeout(() => setShowNotification(false), 3000);
      
      // Add welcome message to chat
      const welcomeMessage = {
        role: 'assistant',
        content: `Image analyzed successfully! I detected this as a **${result.modality}** image with ${result.confidence ? `${(result.confidence * 100).toFixed(1)}%` : 'high'} confidence. I've retrieved ${result.reports_count || 0} relevant medical reports. What would you like to know about this image?`
      };
      setChatHistory([welcomeMessage]);
      
      // Save initial analysis to history
      addAnalysisToHistory({
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        modality: result.modality,
        contextsCount: result.reports_count || 0,
        chatHistory: [welcomeMessage]
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus(`❌ Error: ${error.message}`);
    } finally {
      setIsUploading(false);
    }
  };

  const handleQuestionSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      setChatError('Please enter a question');
      return;
    }

    if (!analysisResult) {
      setChatError('Please upload and analyze an image first');
      return;
    }

    setIsAsking(true);
    setChatError('');

    const userQuestion = question;
    setQuestion('');

    // Add user question to chat first
    const userMessage = { role: 'user', content: userQuestion };
    const historyWithUser = [...chatHistory, userMessage];
    setChatHistory(historyWithUser);

    try {
      const result = await apiClient.imageChat(userQuestion);
      
      // Add AI response to chat
      const aiResponse = { 
        role: 'assistant', 
        content: result.answer || result.response || 'I apologize, but I could not generate a response. Please try again.'
      };
      
      const updatedChatHistory = [...historyWithUser, aiResponse];
      setChatHistory(updatedChatHistory);
      
      // Update the analysis history with full conversation
      try {
        const savedHistory = localStorage.getItem('medicalAnalysisHistory');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (parsed.length > 0) {
            const currentAnalysis = parsed[0];
            currentAnalysis.chatHistory = updatedChatHistory;
            parsed[0] = currentAnalysis;
            localStorage.setItem('medicalAnalysisHistory', JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error('Error updating chat history:', err);
      }
      
      // Update session ID if provided
      if (result.session_id) {
        setImageSessionId(result.session_id);
      }
      
    } catch (error) {
      console.error('Question error:', error);
      setChatError(error.message);
      
      const errorMessage = { 
        role: 'error', 
        content: `Error: ${error.message}` 
      };
      const historyWithError = [...historyWithUser, errorMessage];
      setChatHistory(historyWithError);
      
      // Update history with error too
      try {
        const savedHistory = localStorage.getItem('medicalAnalysisHistory');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          if (parsed.length > 0) {
            const currentAnalysis = parsed[0];
            currentAnalysis.chatHistory = historyWithError;
            parsed[0] = currentAnalysis;
            localStorage.setItem('medicalAnalysisHistory', JSON.stringify(parsed));
          }
        }
      } catch (err) {
        console.error('Error updating chat history:', err);
      }
    } finally {
      setIsAsking(false);
    }
  };

  const handleQuickQuestion = (quickQ) => {
    if (analysisResult) {
      setQuestion(quickQ);
    } else {
      setChatError('Please upload and analyze an image first');
    }
  };

  const handleReset = async () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setUploadStatus('');
    setAnalysisResult(null);
    setChatHistory([]);
    setQuestion('');
    setChatError('');
    
    // Reinitialize session
    try {
      const result = await apiClient.startImageSession();
      setImageSessionId(result.session_id);
    } catch (error) {
      console.error('Failed to reinitialize session:', error);
    }
    
    // Optionally call reset endpoint
    try {
      await apiClient.reset();
    } catch (error) {
      console.error('Reset error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Animated starfield background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {stars.map(star => (
          <div
            key={star.id}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              opacity: star.opacity,
              animationDuration: `${star.duration}s`,
              boxShadow: '0 0 4px rgba(135, 206, 250, 0.8), 0 0 8px rgba(135, 206, 250, 0.4)'
            }}
          />
        ))}
        
        {/* Shooting stars */}
        {shootingStars.map(star => (
          <div
            key={star.id}
            className="absolute h-0.5 bg-gradient-to-r from-cyan-400 via-blue-400 to-transparent"
            style={{
              left: `${star.x}%`,
              top: `${star.y}%`,
              width: '150px',
              animation: `shooting ${star.duration}s linear`,
              transform: 'rotate(-45deg)',
              boxShadow: '0 0 10px rgba(135, 206, 250, 0.8)'
            }}
          />
        ))}
      </div>

      {/* Milky way/Nebula effect */}
      <div className="fixed inset-0 pointer-events-none opacity-30 z-0">
        <div className="absolute top-0 left-1/4 w-full h-full bg-gradient-to-br from-cyan-900/40 via-blue-900/50 to-purple-900/40 blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-full h-full bg-gradient-to-tl from-indigo-900/30 via-purple-900/40 to-pink-900/30 blur-3xl"></div>
      </div>

      {/* Custom styles */}
      <style>{`
        @keyframes shooting {
          from {
            transform: translateX(0) translateY(0) rotate(-45deg);
            opacity: 1;
          }
          to {
            transform: translateX(400px) translateY(400px) rotate(-45deg);
            opacity: 0;
          }
        }
        
        @keyframes nebulaPulse {
          0%, 100% {
            opacity: 0.6;
            transform: scale(1);
          }
          50% {
            opacity: 0.9;
            transform: scale(1.1);
          }
        }
        
        .nebula-logo {
          animation: nebulaPulse 5s ease-in-out infinite;
        }
        
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Rajdhani:wght@300;400;600;700&display=swap');
        
        .space-title {
          font-family: 'Orbitron', sans-serif;
          letter-spacing: 0.15em;
          text-shadow: 0 0 20px rgba(135, 206, 250, 0.5), 0 0 40px rgba(135, 206, 250, 0.3);
        }
        
        .space-text {
          font-family: 'Rajdhani', sans-serif;
        }
      `}</style>

      <div className="relative z-10 p-6 max-w-7xl mx-auto space-y-8">
        {/* Header with Logo */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 relative nebula-logo">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 via-blue-600 to-purple-600 rounded-full blur-lg opacity-70"></div>
              <div className="absolute inset-0 bg-gradient-to-tr from-cyan-400 via-blue-500 to-purple-500 rounded-full blur-md opacity-80"></div>
              <div className="absolute inset-0 bg-gradient-to-bl from-cyan-300 via-blue-400 to-indigo-400 rounded-full opacity-90"></div>
              <div className="absolute inset-2 bg-black rounded-full"></div>
              <div className="absolute inset-3 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-500 rounded-full opacity-70 blur-sm"></div>
              <Activity className="absolute inset-0 m-auto text-cyan-300" size={24} />
            </div>
            <div>
              <h1 className="text-5xl font-black space-title bg-gradient-to-r from-cyan-200 via-blue-200 to-purple-200 bg-clip-text text-transparent">
                MEDICAL IMAGE ANALYSIS
              </h1>
              <p className="text-cyan-400 mt-1 text-sm tracking-wider space-text font-semibold">
                Advanced AI-Powered Diagnostic Platform
              </p>
            </div>
          </div>
          {(selectedFile || chatHistory.length > 0) && (
            <button
              onClick={handleReset}
              className="px-6 py-2.5 border border-cyan-500/50 rounded-lg hover:bg-cyan-500/10 backdrop-blur-sm transition font-medium flex items-center gap-2 text-cyan-300 hover:text-cyan-200 hover:border-cyan-400"
            >
              <XCircle size={18} />
              Reset
            </button>
          )}
        </div>

        {!isApiConfigured() && (
          <div className="bg-red-900/40 backdrop-blur-xl border-2 border-red-500/50 rounded-xl p-4 flex items-start gap-3">
            <AlertCircle className="text-red-400 flex-shrink-0 mt-1" size={24} />
            <div>
              <p className="font-bold text-red-300">API Not Configured</p>
              <p className="text-red-400 text-sm mt-1">
                Update API_BASE_URL in src/config/api.js with your ngrok URL
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="xl:col-span-2 space-y-6">
            {/* Upload Section */}
            <div className="bg-gray-900/50 backdrop-blur-xl p-8 rounded-2xl border border-cyan-500/30 hover:border-cyan-400/50 transition shadow-2xl shadow-cyan-500/10">
              <div className="space-y-4">
                {previewUrl ? (
                  <div className="space-y-4">
                    <div className="relative rounded-xl overflow-hidden bg-black/40 backdrop-blur-sm border border-cyan-500/30 p-4">
                      <img 
                        src={previewUrl} 
                        alt="Medical scan preview" 
                        className="max-h-96 mx-auto rounded-lg shadow-2xl"
                      />
                    </div>
                    <div className="flex items-center justify-center gap-3">
                      <CheckCircle className="text-emerald-400" size={20} />
                      <p className="text-emerald-400 font-medium space-text">Image loaded successfully</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16">
                    <div className="w-24 h-24 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-cyan-500/30">
                      <Activity size={48} className="text-cyan-400" />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-200 mb-3 space-title">
                      Upload Medical Image
                    </h3>
                    <p className="mb-4 text-gray-400 text-sm space-text">
                      Select an image file to begin analysis
                    </p>
                    <p className="text-xs text-gray-500 space-text">
                      Supported formats: JPG, PNG, DICOM, NIfTI (Max 100MB)
                    </p>
                  </div>
                )}
                
                <div className="flex gap-3">
                  <input 
                    type="file" 
                    className="hidden" 
                    id="imageUpload"
                    accept="image/*,.dcm,.nii,.nii.gz"
                    onChange={handleFileSelect}
                  />
                  <label 
                    htmlFor="imageUpload" 
                    className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer transition text-center font-semibold space-text shadow-lg shadow-cyan-500/30"
                  >
                    {previewUrl ? 'Choose Different Image' : 'Select Image'}
                  </label>
                  
                  {selectedFile && !analysisResult && (
                    <button 
                      onClick={handleUpload} 
                      disabled={isUploading}
                      className={`flex-1 ${
                        isUploading
                          ? 'bg-gray-700 cursor-not-allowed' 
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-lg shadow-emerald-500/30'
                      } text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 space-text`}
                    >
                      {isUploading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Zap size={20} /> Analyze Image
                        </>
                      )}
                    </button>
                  )}
                </div>

                {uploadStatus && (
                  <div className={`p-4 rounded-lg backdrop-blur-sm border ${
                    uploadStatus.includes('complete') || uploadStatus.includes('✅')
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                      : uploadStatus.includes('Error') || uploadStatus.includes('❌')
                      ? 'bg-red-500/10 border-red-500/30 text-red-300'
                      : 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                  }`}>
                    <p className="font-medium text-sm space-text">{uploadStatus}</p>
                  </div>
                )}

                {analysisResult && (
                  <div className="bg-emerald-500/10 backdrop-blur-xl border border-emerald-500/40 rounded-xl p-5">
                    <div className="flex items-center gap-2 text-emerald-400 font-bold mb-4 space-text">
                      <CheckCircle size={20} /> Analysis Complete
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-emerald-500/20">
                        <p className="text-gray-400 text-xs mb-1 space-text">Modality</p>
                        <p className="font-bold text-emerald-400 space-title">{analysisResult.modality}</p>
                      </div>
                      <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg border border-emerald-500/20">
                        <p className="text-gray-400 text-xs mb-1 space-text">Reports</p>
                        <p className="font-bold text-emerald-400 space-title">{analysisResult.reports_count || 0}</p>
                      </div>
                      {analysisResult.confidence && (
                        <div className="bg-black/40 backdrop-blur-sm p-3 rounded-lg col-span-2 border border-emerald-500/20">
                          <p className="text-gray-400 text-xs mb-1 space-text">Confidence</p>
                          <p className="font-bold text-emerald-400 space-title">{(analysisResult.confidence * 100).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                    <p className="mt-4 text-sm text-gray-400 space-text">
                      Ask questions about this image below
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Chat Section */}
            <div className="bg-gray-900/50 backdrop-blur-xl rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
              <div className="p-5 border-b border-cyan-500/20">
                <h3 className="text-lg font-bold flex items-center gap-2 text-gray-200 space-title">
                  <Send size={20} className="text-cyan-400" />
                  Interactive Analysis
                </h3>
              </div>

              <div className="h-96 overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <div className="w-16 h-16 bg-cyan-500/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-cyan-500/30">
                        <Send size={32} className="text-cyan-400" />
                      </div>
                      <h3 className="text-xl font-bold text-gray-200 mb-2 space-title">
                        {analysisResult ? 'Ready for Questions' : 'Upload an Image First'}
                      </h3>
                      <p className="text-gray-400 text-sm space-text">
                        {analysisResult 
                          ? 'Ask me anything about the medical image'
                          : 'Upload and analyze an image to begin'
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    {chatHistory.map((message, idx) => (
                      <div
                        key={idx}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        {message.role !== 'user' && (
                          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold space-title border border-cyan-400/50">
                            AI
                          </div>
                        )}
                        <div
                          className={`max-w-[80%] rounded-xl p-4 backdrop-blur-sm ${
                            message.role === 'user'
                              ? 'bg-gradient-to-br from-cyan-600/80 to-blue-600/80 text-white border border-cyan-400/30'
                              : message.role === 'error'
                              ? 'bg-red-500/10 border border-red-500/30 text-red-300'
                              : 'bg-gray-800/60 border border-gray-700/50 text-gray-100'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap space-text">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold space-title border border-blue-400/50">
                            U
                          </div>
                        )}
                      </div>
                    ))}
                    {isAsking && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-xs font-bold space-title border border-cyan-400/50">
                          AI
                        </div>
                        <div className="rounded-xl p-4 bg-gray-800/60 backdrop-blur-sm border border-gray-700/50">
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              <div className="p-4 border-t border-cyan-500/20">
                {chatError && (
                  <div className="mb-3 bg-red-500/10 backdrop-blur-sm border border-red-500/30 rounded-lg p-3">
                    <p className="text-xs text-red-300 space-text">{chatError}</p>
                  </div>
                )}
                
                <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    placeholder={analysisResult ? "Ask about this image..." : "Upload an image first..."}
                    disabled={!analysisResult || isAsking}
                    className="flex-1 px-4 py-3 bg-gray-800/60 backdrop-blur-sm border border-cyan-500/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 text-white placeholder-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-sm space-text"
                  />
                  <button
                    type="submit"
                    disabled={!analysisResult || isAsking || !question.trim()}
                    className={`${
                      !analysisResult || isAsking || !question.trim()
                        ? 'bg-gray-700 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-lg shadow-cyan-500/30'
                    } text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2 space-text`}
                  >
                    {isAsking ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Send size={18} />
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30 sticky top-24 shadow-2xl shadow-cyan-500/10">
              <h3 className="text-base font-bold flex items-center gap-2 mb-5 text-gray-200 space-title">
                <Shield size={18} className="text-cyan-400" /> 
                Guidelines
              </h3>
              <div className="space-y-2.5 text-sm">
                {guidelines.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-black/30 border border-cyan-500/20">
                    <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                    <span className="text-gray-300 text-xs space-text">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {analysisResult && (
              <div className="bg-gray-900/50 backdrop-blur-xl p-6 rounded-2xl border border-cyan-500/30 shadow-2xl shadow-cyan-500/10">
                <h3 className="text-base font-bold mb-4 text-gray-200 space-title">
                  Quick Questions
                </h3>
                <div className="space-y-2">
                  {quickQuestions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleQuickQuestion(q)}
                      disabled={isAsking}
                      className="w-full text-left text-xs p-3 rounded-lg bg-black/30 backdrop-blur-sm border border-cyan-500/20 hover:bg-cyan-500/10 hover:border-cyan-400/40 transition disabled:opacity-50 disabled:cursor-not-allowed text-gray-300 space-text"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analysis;
