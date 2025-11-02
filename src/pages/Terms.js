import React from 'react';
import { useApp } from '../context/AppContext';

const Terms = () => {
  const { darkMode } = useApp();

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const termsSections = [
    { 
      title: '✅ Acceptance of Terms', 
      content: 'By using MediAI, you agree to these terms and conditions in their entirety. If you do not agree, you must not use the service.' 
    },
    { 
      title: '📜 Use License', 
      content: 'Permission is granted to use MediAI for lawful purposes only. You agree not to misuse, reverse engineer, or exploit the service.' 
    },
    { 
      title: '⚠ Medical Disclaimer', 
      content: 'MediAI provides analysis support only. Always consult with qualified medical professionals for final diagnosis and treatment decisions.' 
    },
    { 
      title: '⚡ Limitation of Liability', 
      content: 'MediAI is provided "as is". We are not liable for indirect, incidental, or consequential damages resulting from service use.' 
    },
    { 
      title: '🚫 Termination', 
      content: 'We reserve the right to terminate accounts that violate these terms or our acceptable use policy.' 
    },
    { 
      title: '📝 Changes to Terms', 
      content: 'We may update these terms at any time. Continued use of the service means you accept the updated terms.' 
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className={`text-4xl font-bold ${textColor}`}>Terms of Use</h1>

      <div className="space-y-6">
        {termsSections.map((item, i) => (
          <div key={i} className={`${cardBg} p-6 rounded-xl border ${borderColor}`}>
            <p className={`text-xl font-bold ${textColor} mb-3`}>{item.title}</p>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{item.content}</p>
          </div>
        ))}
      </div>

      <div className={`${cardBg} p-6 rounded-xl border-2 border-purple-600 bg-purple-50 dark:bg-purple-900/20`}>
        <p className="text-sm text-gray-600 dark:text-gray-300">Last Updated: October 2024 | Version 1.0</p>
      </div>
    </div>
  );
};

export default Terms;
