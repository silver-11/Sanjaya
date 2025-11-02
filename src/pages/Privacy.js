import React from 'react';
import { useApp } from '../context/AppContext';

const Privacy = () => {
  const { darkMode } = useApp();

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const privacySections = [
    { 
      title: '🔐 Data Collection', 
      content: 'We collect personal information including name, email, and medical images for analysis purposes. Data is collected with explicit consent.' 
    },
    { 
      title: '🛡 Data Protection', 
      content: 'All data is encrypted using AES-256 and stored securely on HIPAA-compliant servers with redundant backups.' 
    },
    { 
      title: '👤 User Rights', 
      content: 'You have the right to access, modify, export, or delete your personal data at any time through your account settings.' 
    },
    { 
      title: '🚫 Third-Party Sharing', 
      content: 'We do not share your data with third parties without explicit consent. Your data remains yours exclusively.' 
    },
    { 
      title: '📋 Compliance', 
      content: 'We comply with GDPR, HIPAA, CCPA, and other international data protection regulations.' 
    },
    { 
      title: '📧 Contact Privacy Team', 
      content: 'For privacy concerns, contact privacy@mediai.com or visit our Privacy Center for detailed information.' 
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className={`text-4xl font-bold ${textColor}`}>Privacy Policy</h1>

      <div className="space-y-6">
        {privacySections.map((item, i) => (
          <div key={i} className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
            <p className={`text-xl font-bold ${textColor} mb-3`}>{item.title}</p>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{item.content}</p>
          </div>
        ))}
      </div>

      <div className={`${cardBg} p-6 rounded-xl border-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Last Updated: October 2024 | Version 1.0</p>
      </div>
    </div>
  );
};

export default Privacy;
