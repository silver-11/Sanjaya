import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, X, Loader, AlertCircle, CheckCircle, Activity, TrendingUp, MessageCircle, Send } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiClient, isApiConfigured } from '../config/api';

const DiseasePrediction = () => {
  const { darkMode } = useApp();
  
  // State management
  const [symptoms, setSymptoms] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isPredicting, setIsPredicting] = useState(false);
  const [predictionResult, setPredictionResult] = useState(null);
  const [predictionHistory, setPredictionHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [error, setError] = useState('');
  const [sessionId, setSessionId] = useState(null);
  const [chatMode, setChatMode] = useState(true); // Default to chatbot mode
  const [chatHistory, setChatHistory] = useState([]);
  const [isChatting, setIsChatting] = useState(false);
  const chatEndRef = useRef(null);

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';
  const inputBg = darkMode ? 'bg-gray-700' : 'bg-white';

  // Common symptoms for suggestions
  const commonSymptoms = [
    'Fever', 'Headache', 'Cough', 'Sore Throat', 'Runny Nose',
    'Nausea', 'Vomiting', 'Diarrhea', 'Fatigue', 'Body Ache',
    'Chills', 'Difficulty Breathing', 'Chest Pain', 'Dizziness',
    'Muscle Pain', 'Joint Pain', 'Skin Rash', 'Itching', 'Swelling',
    'Eye Pain', 'Loss of Taste', 'Loss of Smell', 'Congestion',
    'Sneezing', 'Watery Eyes', 'Abdominal Pain', 'Constipation',
    'Heartburn', 'Insomnia', 'Anxiety', 'Depression'
  ];

  // Initialize symptom session on component mount
  useEffect(() => {
    const initializeSession = async () => {
      if (!isApiConfigured()) {
        // Still show welcome message even if API not configured
        setChatHistory([{
          role: 'assistant',
          content: "Hello! I'm Dr. MMED, your AI medical assistant. How are you feeling today?\n\n⚠️ Note: API connection is not configured. Please check your backend connection."
        }]);
        return;
      }
      
      try {
        const result = await apiClient.startSymptomSession();
        setSessionId(result.session_id);
        
        // Add welcome message
        setChatHistory([{
          role: 'assistant',
          content: result.response || "Hello! I'm Dr. MMED, your AI medical assistant. How are you feeling today?"
        }]);
      } catch (error) {
        console.error('Failed to initialize session:', error);
        setChatHistory([{
          role: 'assistant',
          content: "Hello! I'm Dr. MMED, your AI medical assistant. How are you feeling today?\n\n⚠️ Connection error: " + error.message
        }]);
      }
    };
    
    initializeSession();
    
    // Load prediction history from localStorage
    try {
      const savedHistory = localStorage.getItem('diseasePredictionHistory');
      if (savedHistory) {
        setPredictionHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error('Error loading prediction history:', error);
    }
  }, []);

  // Auto-scroll to bottom when chat history changes
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Save prediction history to localStorage
  useEffect(() => {
    if (predictionHistory.length > 0) {
      try {
        localStorage.setItem('diseasePredictionHistory', JSON.stringify(predictionHistory));
      } catch (error) {
        console.error('Error saving prediction history:', error);
      }
    }
  }, [predictionHistory]);

  // Filter suggestions based on input
  useEffect(() => {
    if (inputValue.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = commonSymptoms.filter(symptom =>
      symptom.toLowerCase().includes(inputValue.toLowerCase()) &&
      !symptoms.includes(symptom)
    );
    setSuggestions(filtered.slice(0, 5));
  }, [inputValue, symptoms]);

  const addSymptom = (symptom) => {
    const cleanSymptom = symptom.trim();
    if (cleanSymptom && !symptoms.includes(cleanSymptom)) {
      setSymptoms([...symptoms, cleanSymptom]);
      setInputValue('');
      setSuggestions([]);
      setError('');
    }
  };

  const removeSymptom = (symptomToRemove) => {
    setSymptoms(symptoms.filter(s => s !== symptomToRemove));
    setError('');
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      addSymptom(inputValue);
    }
  };

  const handleChat = async (message) => {
    if (!message.trim()) return;
    
    if (!isApiConfigured()) {
      setError('⚠️ API not configured. Check src/config/api.js');
      return;
    }

    setIsChatting(true);
    setError('');

    // Add user message to chat
    const userMessage = { role: 'user', content: message };
    const updatedHistory = [...chatHistory, userMessage];
    setChatHistory(updatedHistory);

    try {
      const result = await apiClient.symptomChat(message);
      
      // Add AI response to chat
      const aiMessage = { role: 'assistant', content: result.response };
      const finalHistory = [...updatedHistory, aiMessage];
      setChatHistory(finalHistory);
      
      // Parse diagnosis from response if available
      let diseases = [];
      if (result.diagnosis) {
        diseases.push({
          name: result.diagnosis,
          probability: (result.confidence || 0) / 100,
          severity: (result.confidence || 0) > 80 ? 'moderate' : 'mild'
        });
        
        if (result.alternatives && Array.isArray(result.alternatives)) {
          result.alternatives.forEach((alt, idx) => {
            diseases.push({
              name: alt,
              probability: 0.5 - (idx * 0.1),
              severity: 'mild'
            });
          });
        }
      }
      
      // Save to prediction history with full chat history
      const newPrediction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        symptoms: message.toLowerCase().includes('symptoms') ? message.match(/symptoms?[:\s]+(.*)/i)?.[1]?.split(',').map(s => s.trim()) || [message] : [message],
        diseases: diseases.length > 0 ? diseases : [],
        date: new Date().toLocaleDateString(),
        response: result.response,
        chatHistory: finalHistory // Save full conversation
      };
      
      setPredictionHistory(prev => [newPrediction, ...prev]);
      localStorage.setItem('diseasePredictionHistory', JSON.stringify([newPrediction, ...predictionHistory]));
      
      // Update session ID if provided
      if (result.session_id) {
        setSessionId(result.session_id);
      }
      
    } catch (error) {
      console.error('Chat error:', error);
      setError(`Error: ${error.message}`);
      setChatHistory(prev => [...prev, {
        role: 'error',
        content: `Error: ${error.message}`
      }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handlePredict = async () => {
    if (symptoms.length === 0) {
      setError('Please add at least one symptom');
      return;
    }

    if (!isApiConfigured()) {
      setError('⚠️ API not configured. Check src/config/api.js');
      return;
    }

    setIsPredicting(true);
    setError('');

    try {
      // Convert symptoms list to a message
      const symptomsText = symptoms.join(', ');
      const result = await apiClient.symptomChat(`I have the following symptoms: ${symptomsText}`);
      
      // Parse the response to extract diagnosis information
      const response = result.response || '';
      
      // Create a structured prediction result
      const prediction = {
        diseases: [],
        advice: response,
        disclaimer: 'This tool does not replace professional medical advice. Always seek help from qualified healthcare providers.'
      };
      
      // Try to extract disease names and confidence from response
      // The backend returns structured data, so we'll use that if available
      if (result.diagnosis) {
        prediction.diseases.push({
          name: result.diagnosis,
          probability: (result.confidence || 0) / 100,
          severity: result.confidence > 80 ? 'moderate' : 'mild'
        });
        
        if (result.alternatives && Array.isArray(result.alternatives)) {
          result.alternatives.forEach((alt, idx) => {
            prediction.diseases.push({
              name: alt,
              probability: 0.5 - (idx * 0.1),
              severity: 'mild'
            });
          });
        }
      }
      
      setPredictionResult(prediction);
      
      // Save to history
      const newPrediction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        symptoms: [...symptoms],
        diseases: prediction.diseases.length > 0 ? prediction.diseases : [{ name: 'Analysis provided', probability: 0.5, severity: 'mild' }],
        date: new Date().toLocaleDateString(),
        response: response
      };
      
      setPredictionHistory(prev => [newPrediction, ...prev]);
      
      // Clear symptoms after prediction
      setSymptoms([]);
      
    } catch (error) {
      console.error('Prediction error:', error);
      setError(`Error: ${error.message}`);
    } finally {
      setIsPredicting(false);
    }
  };


  const clearHistory = () => {
    setPredictionHistory([]);
    localStorage.removeItem('diseasePredictionHistory');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className={`text-4xl font-bold ${textColor}`}>Medical Chatbot</h1>
          <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Chat with Dr. MMED - Your AI medical assistant for symptom analysis and health guidance
          </p>
        </div>
        <div className="flex gap-3">
          {!chatMode && (
            <button
              onClick={() => setChatMode(true)}
              className="px-4 py-2 rounded-lg border border-blue-600 bg-blue-600 text-white hover:bg-blue-700 transition flex items-center gap-2"
            >
              <MessageCircle size={18} />
              Switch to Chat
            </button>
          )}
          <button
            onClick={() => setShowHistory(!showHistory)}
            className={`px-4 py-2 rounded-lg border ${borderColor} hover:bg-gray-200 dark:hover:bg-gray-700 transition`}
          >
            {showHistory ? 'Hide' : 'Show'} History
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Input Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chat Interface */}
          {chatMode ? (
            <div className={`${cardBg} rounded-xl border ${borderColor}`}>
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className={`text-xl font-bold ${textColor} flex items-center gap-2`}>
                  <MessageCircle size={20} className="text-blue-600" />
                  Chat with Dr. MMED
                </h3>
              </div>

              {/* Chat History */}
              <div className="h-[600px] overflow-y-auto p-4 space-y-4">
                {chatHistory.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-center">
                    <div>
                      <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle size={40} className="text-white" />
                      </div>
                      <h3 className={`text-2xl font-bold ${textColor} mb-2`}>
                        Welcome to Medical Chatbot
                      </h3>
                      <p className="text-gray-500 mb-4">
                        I'm Dr. MMED, your AI medical assistant. Tell me how you're feeling or describe your symptoms.
                      </p>
                      <div className="flex flex-wrap gap-2 justify-center mt-4">
                        <button
                          onClick={() => handleChat("I have a fever and headache")}
                          className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                        >
                          Example: Fever & Headache
                        </button>
                        <button
                          onClick={() => handleChat("I feel tired and have body aches")}
                          className="px-3 py-1.5 text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition"
                        >
                          Example: Fatigue & Body Aches
                        </button>
                      </div>
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
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md">
                            AI
                          </div>
                        )}
                        <div
                          className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                            message.role === 'user'
                              ? 'bg-blue-600 text-white'
                              : message.role === 'error'
                              ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-300 dark:border-red-700'
                              : darkMode
                              ? 'bg-gray-700 text-gray-100 border border-gray-600'
                              : 'bg-gradient-to-br from-blue-50 to-purple-50 text-gray-800 border border-blue-200'
                          }`}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                        </div>
                        {message.role === 'user' && (
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md">
                            You
                          </div>
                        )}
                      </div>
                    ))}
                    {isChatting && (
                      <div className="flex gap-3 justify-start">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-bold shadow-md">
                          AI
                        </div>
                        <div className={`rounded-2xl p-4 shadow-sm ${darkMode ? 'bg-gray-700 border border-gray-600' : 'bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200'}`}>
                          <div className="flex gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </>
                )}
              </div>

              {/* Chat Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                {error && (
                  <div className="mb-3 bg-red-50 dark:bg-red-900/20 border border-red-300 dark:border-red-700 rounded-lg p-3">
                    <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
                  </div>
                )}
                
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const input = e.target.querySelector('input');
                  if (input.value.trim()) {
                    handleChat(input.value);
                    input.value = '';
                  }
                }} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Describe your symptoms or how you're feeling... (e.g., 'I have a fever and headache')"
                    disabled={isChatting}
                    className={`flex-1 px-4 py-3 border-2 ${borderColor} rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${
                      darkMode ? 'bg-gray-800 text-gray-100' : 'bg-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed text-base`}
                  />
                  <button
                    type="submit"
                    disabled={isChatting}
                    className={`${
                      isChatting
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
                    } text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center gap-2 transform hover:scale-105 disabled:transform-none`}
                  >
                    {isChatting ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        <Send size={20} />
                        <span className="hidden sm:inline">Send</span>
                      </>
                    )}
                  </button>
                </form>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                  💡 Tip: Be specific about your symptoms for better diagnosis
                </p>
              </div>
            </div>
          ) : (
            <>
            {/* Symptom Input */}
            <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
            <h2 className={`text-xl font-semibold mb-4 ${textColor}`}>
              Enter Your Symptoms
            </h2>
            
            {/* Input Field */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                value={inputValue}
                onChange={handleInputChange}
                onKeyPress={handleKeyPress}
                placeholder="Type a symptom (e.g., Fever, Headache)"
                className={`w-full pl-10 pr-4 py-3 rounded-lg border ${borderColor} ${inputBg} ${textColor} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
              />
              
              {/* Suggestions Dropdown */}
              {suggestions.length > 0 && (
                <div className={`absolute z-10 w-full mt-1 ${cardBg} border ${borderColor} rounded-lg shadow-lg max-h-48 overflow-y-auto`}>
                  {suggestions.map((symptom, idx) => (
                    <button
                      key={idx}
                      onClick={() => addSymptom(symptom)}
                      className={`w-full text-left px-4 py-2 hover:bg-gray-700 dark:hover:bg-gray-600 transition ${idx !== suggestions.length - 1 && 'border-b ' + borderColor} ${textColor}`}
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Symptoms */}
            {symptoms.length > 0 && (
              <div className="mt-4">
                <p className={`text-sm mb-2 ${textColor}`}>Selected Symptoms:</p>
                <div className="flex flex-wrap gap-2">
                  {symptoms.map((symptom, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                    >
                      {symptom}
                      <button
                        onClick={() => removeSymptom(symptom)}
                        className="hover:bg-blue-700 rounded-full p-0.5 transition"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle size={20} />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* Predict Button */}
            <button
              onClick={handlePredict}
              disabled={isPredicting || symptoms.length === 0}
              className="w-full mt-4 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isPredicting ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Analyzing...
                </>
              ) : (
                <>
                  <Activity size={20} />
                  Predict Disease
                </>
              )}
            </button>
          </div>

          {/* Prediction Result */}
          {predictionResult && (
            <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="text-green-600" size={24} />
                <h2 className={`text-xl font-semibold ${textColor}`}>
                  Prediction Results
                </h2>
              </div>

              {/* Top Diseases */}
              <div className="space-y-4 mb-6">
                {predictionResult.diseases.map((disease, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${borderColor} ${idx === 0 ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <TrendingUp size={18} className="text-blue-600" />
                        <h3 className={`font-semibold text-lg ${textColor}`}>
                          {disease.name}
                        </h3>
                      </div>
                      <span className={`text-lg font-bold text-blue-600`}>
                        {(disease.probability * 100).toFixed(0)}%
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        Severity:
                      </span>
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        disease.severity === 'mild' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        disease.severity === 'moderate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {disease.severity.toUpperCase()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Advice Section */}
              <div className={`p-4 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800`}>
                <div className="flex items-start gap-2">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-400 mt-0.5" size={20} />
                  <div>
                    <p className={`text-sm font-semibold mb-1 text-yellow-800 dark:text-yellow-300`}>
                      Important Notice
                    </p>
                    <p className={`text-sm text-yellow-700 dark:text-yellow-400`}>
                      {predictionResult.disclaimer}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            )}
          </>
        )}
        </div>

        {/* Right Column: History & Quick Actions */}
        <div className="space-y-6">
          {/* Prediction History */}
          {showHistory && (
            <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className={`text-xl font-semibold ${textColor}`}>History</h2>
                {predictionHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-sm text-red-600 hover:text-red-700 transition"
                  >
                    Clear All
                  </button>
                )}
              </div>

              {predictionHistory.length === 0 ? (
                <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                  No prediction history yet
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {predictionHistory.map((prediction) => (
                    <div
                      key={prediction.id}
                      className={`p-3 rounded-lg border ${borderColor} hover:bg-gray-700 dark:hover:bg-gray-700 transition cursor-pointer`}
                    >
                      <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {prediction.date}
                      </p>
                      <p className={`text-sm font-semibold mt-1 ${textColor}`}>
                        {prediction.diseases[0]?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        {(prediction.diseases[0]?.probability * 100 || 0).toFixed(0)}% confidence
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Tips */}
          <div className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
            <h2 className={`text-xl font-semibold mb-4 ${textColor}`}>Tips</h2>
            <ul className="space-y-2 text-sm">
              <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                <span>Be specific about your symptoms</span>
              </li>
              <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                <span>Add all relevant symptoms for better accuracy</span>
              </li>
              <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                <span>Consult a doctor for serious symptoms</span>
              </li>
              <li className={`flex items-start gap-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                <CheckCircle size={16} className="text-green-600 mt-0.5" />
                <span>This is for informational purposes only</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiseasePrediction;


