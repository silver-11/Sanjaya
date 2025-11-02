// ===========================================
// src/pages/Analysis.js - Combined Analysis & Query
// ===========================================
import React, { useState, useRef, useEffect } from 'react';
import { Upload as UploadIcon, Send, AlertCircle, CheckCircle, Zap, Shield, XCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient, isApiConfigured } from '../config/api';

const Analysis = () => {
  const { darkMode, setShowNotification, addAnalysisToHistory } = useApp();
  
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

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const guidelines = [
    { icon: '📸', text: 'Clear, well-lit images' },
    { icon: '📦', text: 'Max 100MB file size' },
    { icon: '✅', text: 'JPG, PNG, DICOM, NIfTI' },
    { icon: '🔐', text: 'Patient data anonymized' },
    { icon: '⏱', text: 'Analysis: 2-5 minutes' }
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
      
      // Note: We'll update the history entry when user asks questions
      // Save initial analysis to history
      const initialHistory = {
        id: Date.now(),
        fileName: selectedFile.name,
        fileType: selectedFile.type,
        modality: result.modality,
        contextsCount: result.reports_count || 0,
        chatHistory: [welcomeMessage],
        timestamp: new Date().toISOString(),
        status: 'completed'
      };
      
      // Store temporarily to update later
      window.currentAnalysisId = initialHistory.id;
      
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
      // Get current analysis history from context and update it
      try {
        const savedHistory = localStorage.getItem('medicalAnalysisHistory');
        if (savedHistory) {
          const parsed = JSON.parse(savedHistory);
          // Find the most recent analysis (should be the current one)
          if (parsed.length > 0) {
            const currentAnalysis = parsed[0]; // Most recent is first
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-4xl font-bold ${textColor}`}>Medical Image Analysis</h1>
          <p className="text-gray-500 mt-2">Upload an image and ask questions about it</p>
        </div>
        {(selectedFile || chatHistory.length > 0) && (
          <button
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition font-semibold flex items-center gap-2"
          >
            <XCircle size={18} />
            Reset
          </button>
        )}
      </div>

      {!isApiConfigured() && (
        <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-500 flex-shrink-0 mt-1" size={24} />
          <div>
            <p className="font-bold text-red-700 dark:text-red-400">API Not Configured</p>
            <p className="text-red-600 dark:text-red-300 text-sm mt-1">
              Update API_BASE_URL in src/config/api.js with your ngrok URL
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Image Upload & Preview */}
        <div className="xl:col-span-2 space-y-6">
          {/* Upload Section */}
          <div className={`${cardBg} p-6 rounded-xl border-2 border-dashed ${previewUrl ? 'border-green-600' : 'border-blue-600'} hover:border-purple-600 transition`}>
            <div className="space-y-4">
              {previewUrl ? (
                <div className="space-y-4">
                  <div className="relative rounded-lg overflow-hidden bg-black/5 dark:bg-white/5">
                    <img 
                      src={previewUrl} 
                      alt="Medical scan preview" 
                      className="max-h-96 mx-auto rounded-lg shadow-lg"
                    />
                  </div>
                  <div className="flex items-center justify-center gap-4">
                    <CheckCircle className="text-green-600" size={20} />
                    <p className="text-green-600 font-semibold">Image loaded successfully</p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📁</div>
                  <h3 className={`text-2xl font-bold ${textColor} mb-2`}>Upload Medical Image</h3>
                  <p className={`mb-4 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                    Drag & drop or click to browse
                  </p>
                  <p className="text-sm text-gray-500">
                    Supported: JPG, PNG, DICOM, NIfTI (Max 100MB)
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
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg cursor-pointer transition text-center font-semibold"
                >
                  {previewUrl ? 'Choose Different Image' : 'Choose Image'}
                </label>
                
                {selectedFile && !analysisResult && (
                  <button 
                    onClick={handleUpload} 
                    disabled={isUploading}
                    className={`flex-1 ${
                      isUploading
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-gradient-to-r from-green-600 to-blue-600 hover:shadow-lg'
                    } text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2`}
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
                <div className={`p-4 rounded-lg ${
                  uploadStatus.startsWith('✅') 
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' 
                    : uploadStatus.startsWith('❌')
                    ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    : 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                }`}>
                  <p className="font-medium">{uploadStatus}</p>
                </div>
              )}

              {analysisResult && (
                <div className="bg-green-50 dark:bg-green-900/20 border-2 border-green-500 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold mb-3">
                    <CheckCircle size={20} /> Analysis Complete!
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <p className="text-gray-600 dark:text-gray-400">Modality</p>
                      <p className="font-bold text-green-600">{analysisResult.modality}</p>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-3 rounded">
                      <p className="text-gray-600 dark:text-gray-400">Reports</p>
                      <p className="font-bold text-green-600">{analysisResult.reports_count || 0}</p>
                    </div>
                    {analysisResult.confidence && (
                      <div className="bg-white dark:bg-gray-800 p-3 rounded col-span-2">
                        <p className="text-gray-600 dark:text-gray-400">Confidence</p>
                        <p className="font-bold text-green-600">{(analysisResult.confidence * 100).toFixed(1)}%</p>
                      </div>
                    )}
                  </div>
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
                    👇 Ask questions about this image below
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Section */}
          <div className={`${cardBg} rounded-xl border ${borderColor}`}>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className={`text-xl font-bold ${textColor} flex items-center gap-2`}>
                <Send size={20} className="text-purple-600" />
                Ask Questions About Your Image
              </h3>
            </div>

            {/* Chat History */}
            <div className="h-96 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 ? (
                <div className="h-full flex items-center justify-center text-center">
                  <div>
                    <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Send size={32} className="text-purple-600" />
                    </div>
                    <h3 className={`text-xl font-bold ${textColor} mb-2`}>
                      {analysisResult ? 'Ready for Questions' : 'Upload an Image First'}
                    </h3>
                    <p className="text-gray-500">
                      {analysisResult 
                        ? 'Ask me anything about the medical image above'
                        : 'Upload and analyze an image to start asking questions'
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
                        <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                          AI
                        </div>
                      )}
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          message.role === 'user'
                            ? 'bg-blue-600 text-white'
                            : message.role === 'error'
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                            : darkMode
                            ? 'bg-gray-700 text-gray-100'
                            : 'bg-purple-50 text-gray-800'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      {message.role === 'user' && (
                        <div className="w-8 h-8 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                          U
                        </div>
                      )}
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex gap-3 justify-start">
                      <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold">
                        AI
                      </div>
                      <div className={`rounded-lg p-4 ${darkMode ? 'bg-gray-700' : 'bg-purple-50'}`}>
                        <div className="flex gap-2">
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </>
              )}
            </div>

            {/* Question Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              {chatError && (
                <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                  <p className="text-sm text-red-700 dark:text-red-400">{chatError}</p>
                </div>
              )}
              
              <form onSubmit={handleQuestionSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder={analysisResult ? "Ask about this image..." : "Upload an image first..."}
                  disabled={!analysisResult || isAsking}
                  className={`flex-1 px-4 py-3 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600 ${
                    darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                />
                <button
                  type="submit"
                  disabled={!analysisResult || isAsking || !question.trim()}
                  className={`${
                    !analysisResult || isAsking || !question.trim()
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg'
                  } text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2`}
                >
                  {isAsking ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    <Send size={20} />
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Guidelines & Quick Questions */}
        <div className="space-y-6">
          {/* Guidelines */}
          <div className={`${cardBg} p-6 rounded-xl border ${borderColor} sticky top-24`}>
            <h3 className={`text-lg font-bold ${textColor} flex items-center gap-2 mb-4`}>
              <Shield size={20} className="text-blue-600" /> Guidelines
            </h3>
            <div className="space-y-3 text-sm">
              {guidelines.map((item, i) => (
                <div key={i} className="flex gap-2">
                  <span>{item.icon}</span>
                  <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Questions */}
          {analysisResult && (
            <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
              <h3 className={`text-lg font-bold ${textColor} mb-4`}>Quick Questions</h3>
              <div className="space-y-2">
                {quickQuestions.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => handleQuickQuestion(q)}
                    disabled={isAsking}
                    className={`w-full text-left text-sm p-3 rounded-lg border ${borderColor} hover:bg-purple-600 hover:text-white transition disabled:opacity-50 disabled:cursor-not-allowed`}
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
  );
};

export default Analysis;