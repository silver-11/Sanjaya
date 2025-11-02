import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, FileText, MessageSquare, Calendar, Image as ImageIcon, Download, Stethoscope, Upload, Filter } from 'lucide-react';

const History = () => {
  const { darkMode, analysisHistory, setCurrentPage } = useApp();
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all', 'symptom', 'image'
  const [diseaseHistory, setDiseaseHistory] = useState([]);
  const [combinedHistory, setCombinedHistory] = useState([]);

  // Load disease prediction history from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('diseasePredictionHistory');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        setDiseaseHistory(parsed.map(item => ({
          ...item,
          type: 'symptom',
          id: item.id || Date.now() + Math.random()
        })));
      }
    } catch (error) {
      console.error('Error loading disease history:', error);
    }
  }, []);

  // Combine both histories
  useEffect(() => {
    const imageItems = analysisHistory.map(item => ({
      ...item,
      type: 'image'
    }));
    
    const symptomItems = diseaseHistory.map(item => ({
      ...item,
      type: 'symptom'
    }));

    const combined = [...imageItems, ...symptomItems].sort((a, b) => {
      const dateA = new Date(a.timestamp || a.date || 0);
      const dateB = new Date(b.timestamp || b.date || 0);
      return dateB - dateA; // Most recent first
    });

    setCombinedHistory(combined);
  }, [analysisHistory, diseaseHistory]);

  // Filter history based on type
  const filteredHistory = filterType === 'all' 
    ? combinedHistory 
    : combinedHistory.filter(item => item.type === filterType);

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const handleViewItem = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleDownload = (item) => {
    const data = {
      type: item.type === 'symptom' ? 'Symptom Diagnosis' : 'Image Analysis',
      timestamp: item.timestamp || item.date,
      ...(item.type === 'symptom' ? {
        symptoms: item.symptoms || [],
        diseases: item.diseases || [],
        response: item.response || ''
      } : {
        fileName: item.fileName,
        fileType: item.fileType,
        modality: item.modality,
        contextsCount: item.contextsCount,
        chatHistory: item.chatHistory || []
      })
    };

    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.type === 'symptom' ? 'symptom-diagnosis' : 'image-analysis'}-${item.id || Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadAll = () => {
    const allData = {
      exportDate: new Date().toISOString(),
      symptomDiagnoses: diseaseHistory.map(item => ({
        id: item.id,
        timestamp: item.timestamp || item.date,
        symptoms: item.symptoms || [],
        diseases: item.diseases || [],
        response: item.response || ''
      })),
      imageAnalyses: analysisHistory.map(item => ({
        id: item.id,
        timestamp: item.timestamp,
        fileName: item.fileName,
        fileType: item.fileType,
        modality: item.modality,
        contextsCount: item.contextsCount,
        chatHistory: item.chatHistory || []
      }))
    };

    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical-ai-history-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Medical History</h1>
          <p className="text-slate-600 dark:text-slate-300 mt-2">
            View all your symptom diagnoses and image analyses
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          <button 
            onClick={handleDownloadAll}
            disabled={combinedHistory.length === 0}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-semibold inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download size={18} />
            Download All
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setFilterType('all')}
          className={`px-4 py-2 font-semibold transition border-b-2 ${
            filterType === 'all'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          All ({combinedHistory.length})
        </button>
        <button
          onClick={() => setFilterType('symptom')}
          className={`px-4 py-2 font-semibold transition border-b-2 inline-flex items-center gap-2 ${
            filterType === 'symptom'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Stethoscope size={16} />
          Symptom Diagnoses ({diseaseHistory.length})
        </button>
        <button
          onClick={() => setFilterType('image')}
          className={`px-4 py-2 font-semibold transition border-b-2 inline-flex items-center gap-2 ${
            filterType === 'image'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <ImageIcon size={16} />
          Image Analyses ({analysisHistory.length})
        </button>
      </div>

      <div className="space-y-4">
        {filteredHistory.map((item) => {
          const itemDate = new Date(item.timestamp || item.date || Date.now()).toLocaleDateString();
          const itemTime = new Date(item.timestamp || item.date || Date.now()).toLocaleTimeString();
          
          return (
          <div 
            key={item.id} 
            className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition"
          >
            <div className="flex items-center justify-between gap-6">
              <div className="flex items-center gap-4 flex-1 min-w-0">
                <div className={`w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  item.type === 'symptom' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {item.type === 'symptom' ? (
                    <Stethoscope className="w-8 h-8 text-green-600 dark:text-green-400" />
                  ) : (
                    <ImageIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-slate-900 dark:text-white text-lg">
                      {item.type === 'symptom' 
                        ? `Symptom Diagnosis` 
                        : item.fileName || 'Image Analysis'}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.type === 'symptom'
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                    }`}>
                      {item.type === 'symptom' ? 'Symptom' : 'Image'}
                    </span>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {itemDate} at {itemTime}
                    {item.type === 'image' && item.modality && ` • ${item.modality}`}
                  </p>
                  <div className="flex items-center gap-4 text-sm">
                    {item.type === 'symptom' ? (
                      <>
                        <span className="text-slate-600 dark:text-slate-400">
                          Symptoms: {Array.isArray(item.symptoms) ? item.symptoms.length : 0}
                        </span>
                        {item.diseases && item.diseases.length > 0 && (
                          <span className="text-slate-600 dark:text-slate-400">
                            Diagnoses: {item.diseases[0]?.name || 'N/A'}
                          </span>
                        )}
                      </>
                    ) : (
                      <>
                        <span className="text-slate-600 dark:text-slate-400">
                          {item.contextsCount || 0} contexts found
                        </span>
                        {item.chatHistory && (
                          <span className="text-slate-600 dark:text-slate-400">
                            {item.chatHistory.length} messages
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleDownload(item)}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium inline-flex items-center gap-2"
                  title="Download this record"
                >
                  <Download size={16} />
                  <span className="hidden sm:inline">Download</span>
                </button>
                <button 
                  onClick={() => handleViewItem(item)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium hover:shadow-lg transition"
                >
                  View Details
                </button>
              </div>
            </div>
          </div>
          );
        })}
      </div>

      {filteredHistory.length === 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
            No History Yet
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6 max-w-md mx-auto">
            {filterType === 'all' 
              ? "Start by using the symptom diagnosis chatbot or uploading a medical image for analysis"
              : filterType === 'symptom'
              ? "Start by using the symptom diagnosis chatbot on the Disease Prediction page"
              : "Start by uploading your first medical image for AI-powered analysis"}
          </p>
          <div className="flex gap-3 justify-center">
            {filterType !== 'image' && (
              <button 
                onClick={() => setCurrentPage('disease-prediction')} 
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition"
              >
                <Stethoscope size={18} />
                Symptom Diagnosis
              </button>
            )}
            {filterType !== 'symptom' && (
              <button 
                onClick={() => setCurrentPage('analysis')} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold inline-flex items-center gap-2 transition"
              >
                <Upload size={18} />
                Image Analysis
              </button>
            )}
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  selectedItem.type === 'symptom' 
                    ? 'bg-green-100 dark:bg-green-900/30' 
                    : 'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {selectedItem.type === 'symptom' ? (
                    <Stethoscope className="w-5 h-5 text-green-600" />
                  ) : (
                    <FileText className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedItem.type === 'symptom' ? 'Symptom Diagnosis Report' : 'Image Analysis Report'}
                  </h2>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {selectedItem.type === 'symptom' 
                      ? `Diagnosis on ${new Date(selectedItem.timestamp || selectedItem.date || Date.now()).toLocaleString()}`
                      : selectedItem.fileName}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(selectedItem)}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                  title="Download"
                >
                  <Download className="w-5 h-5 text-slate-500" />
                </button>
                <button
                  onClick={handleCloseModal}
                  className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition"
                >
                  <X className="w-5 h-5 text-slate-500" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto flex-1">
              {selectedItem.type === 'symptom' ? (
                // Symptom Diagnosis Details
                <div className="space-y-6">
                  <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <Stethoscope className="w-5 h-5" />
                      Symptoms Reported
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {Array.isArray(selectedItem.symptoms) && selectedItem.symptoms.length > 0 ? (
                        selectedItem.symptoms.map((symptom, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium"
                          >
                            {symptom}
                          </span>
                        ))
                      ) : (
                        <p className="text-slate-500 dark:text-slate-400 text-sm">No symptoms recorded</p>
                      )}
                    </div>
                  </div>

                  {selectedItem.diseases && selectedItem.diseases.length > 0 && (
                    <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <FileText className="w-5 h-5" />
                        Diagnoses
                      </h3>
                      <div className="space-y-3">
                        {selectedItem.diseases.map((disease, idx) => (
                          <div
                            key={idx}
                            className={`p-4 rounded-lg border ${
                              idx === 0 ? 'bg-green-50 dark:bg-green-900/20 border-green-300 dark:border-green-700' : 'bg-slate-100 dark:bg-slate-600 border-slate-200 dark:border-slate-500'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-semibold text-slate-900 dark:text-white">
                                {disease.name}
                              </span>
                              <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                {((disease.probability || 0) * 100).toFixed(0)}%
                              </span>
                            </div>
                            {disease.severity && (
                              <span className={`text-xs px-2 py-1 rounded ${
                                disease.severity === 'mild' 
                                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                                  : disease.severity === 'moderate'
                                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                              }`}>
                                {disease.severity.toUpperCase()}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedItem.response && (
                    <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        AI Response
                      </h3>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                        {selectedItem.response}
                      </p>
                    </div>
                  )}

                  <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Date & Time
                    </h3>
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(selectedItem.timestamp || selectedItem.date || Date.now()).toLocaleString()}
                    </p>
                  </div>
                </div>
              ) : (
                // Image Analysis Details
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Analysis Details
                      </h3>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">File Name:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedItem.fileName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">File Type:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedItem.fileType}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Modality:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedItem.modality}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Contexts Found:</span>
                          <span className="font-medium text-slate-900 dark:text-white">{selectedItem.contextsCount || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600 dark:text-slate-400">Status:</span>
                          <span className="font-medium text-green-600 dark:text-green-400">{selectedItem.status || 'Completed'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-700 p-4 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-3 flex items-center gap-2">
                        <Calendar className="w-5 h-5" />
                        Analysis Date
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        {new Date(selectedItem.timestamp).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-slate-50 dark:bg-slate-700 p-5 rounded-lg">
                      <h3 className="font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5" />
                        Full Conversation History
                      </h3>
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {selectedItem.chatHistory && selectedItem.chatHistory.length > 0 ? (
                          selectedItem.chatHistory.map((message, idx) => (
                            <div
                              key={idx}
                              className={`p-4 rounded-lg ${
                                message.role === 'user'
                                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100'
                                  : message.role === 'error'
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-900 dark:text-red-100'
                                  : 'bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-slate-100'
                              }`}
                            >
                              <div className="font-medium text-xs mb-2 flex items-center gap-2">
                                {message.role === 'user' ? (
                                  <>👤 You</>
                                ) : message.role === 'error' ? (
                                  <>⚠️ Error</>
                                ) : (
                                  <>🤖 AI Assistant</>
                                )}
                              </div>
                              <div className="whitespace-pre-wrap leading-relaxed text-sm">{message.content}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-slate-500 dark:text-slate-400 text-sm">
                            No conversation history available for this analysis.
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center p-6 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => handleDownload(selectedItem)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition font-medium inline-flex items-center gap-2"
              >
                <Download size={18} />
                Download Report
              </button>
              <div className="flex gap-3">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                >
                  Close
                </button>
                {selectedItem.type === 'image' && (
                  <button
                    onClick={() => {
                      setCurrentPage('analysis');
                      handleCloseModal();
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                  >
                    New Analysis
                  </button>
                )}
                {selectedItem.type === 'symptom' && (
                  <button
                    onClick={() => {
                      setCurrentPage('disease-prediction');
                      handleCloseModal();
                    }}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg hover:shadow-lg transition"
                  >
                    New Diagnosis
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default History;
