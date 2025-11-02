import React from 'react';
import { Upload, FileText, Send, Settings, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Dashboard = () => {
  const { darkMode, setCurrentPage, analysisHistory } = useApp();

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const stats = [
    { label: 'Total Analyses', value: '42', icon: '📊', color: 'from-blue-600 to-blue-700' },
    { label: 'Reports Generated', value: '38', icon: '📄', color: 'from-purple-600 to-purple-700' },
    { label: 'Avg. Accuracy', value: '94.3%', icon: '🎯', color: 'from-green-600 to-green-700' },
    { label: 'Storage Used', value: '4.2/10 GB', icon: '💾', color: 'from-pink-600 to-pink-700' }
  ];

  const quickActions = [
    { label: 'Upload Image', icon: Upload, action: 'analysis' },
    { label: 'Disease Prediction', icon: FileText, action: 'disease-prediction' },
    { label: 'Ask Query', icon: Send, action: 'query' },
    { label: 'Settings', icon: Settings, action: 'settings' }
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className={`text-4xl font-bold ${textColor}`}>Dashboard</h1>
        <div className="flex gap-2">
          <button 
            onClick={() => setCurrentPage('analysis')} 
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
          >
            <Upload size={18} /> New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div 
            key={i} 
            className={`bg-gradient-to-br ${stat.color} text-white p-6 rounded-xl shadow-lg hover:shadow-2xl transition transform hover:scale-105`}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-white/80 text-sm font-semibold">{stat.label}</p>
                <p className="text-3xl font-bold mt-2">{stat.value}</p>
              </div>
              <span className="text-4xl opacity-30">{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className={`lg:col-span-2 ${cardBg} p-6 rounded-xl border ${borderColor}`}>
          <h2 className={`text-2xl font-bold ${textColor} mb-6`}>Recent Activities</h2>
          <div className="space-y-4">
            {analysisHistory.map((analysis) => {
              const analysisDate = new Date(analysis.timestamp).toLocaleDateString();
              return (
              <div 
                key={analysis.id} 
                className={`flex items-center justify-between p-4 border ${borderColor} rounded-lg hover:bg-blue-50 dark:hover:bg-gray-700 transition`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {analysis.modality.charAt(0)}
                  </div>
                  <div>
                    <p className={`font-semibold ${textColor}`}>{analysis.fileName}</p>
                    <p className="text-sm text-gray-500">{analysisDate}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className={`font-bold ${textColor}`}>{analysis.contextsCount}</p>
                    <p className="text-xs text-green-600">Contexts</p>
                  </div>
                  <button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg hover:shadow-lg transition">
                    View
                  </button>
                </div>
              </div>
              );
            })}
          </div>
        </div>

        <div className={`${cardBg} p-6 rounded-xl border ${borderColor} h-fit sticky top-24 space-y-4`}>
          <h2 className={`text-2xl font-bold ${textColor}`}>Quick Actions</h2>
          {quickActions.map((action, i) => (
            <button 
              key={i} 
              onClick={() => setCurrentPage(action.action)} 
              className={`w-full flex items-center gap-3 p-4 rounded-lg border ${borderColor} hover:bg-blue-600 hover:text-white transition`}
            >
              <action.icon size={20} />
              <span className="font-semibold">{action.label}</span>
              <ArrowRight size={16} className="ml-auto" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
