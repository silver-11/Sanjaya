import React from 'react';
import { useApp } from '../context/AppContext';

const FAQ = () => {
  const { darkMode } = useApp();

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const faqItems = [
    { 
      q: '❓ How do I upload a medical image?', 
      a: 'Navigate to "Image Analysis" → Click "Choose File" → Select your image (JPG, PNG, DICOM, NIfTI) → Add description → Click "Analyze Image"' 
    },
    { 
      q: '⏱ How long does analysis take?', 
      a: 'Most analyses complete in 2-5 minutes depending on image size and complexity. You\'ll receive a notification when complete.' 
    },
    { 
      q: '📥 Can I download reports?', 
      a: 'Yes! All completed analyses can be downloaded as PDF or CSV from the Reports section.' 
    },
    { 
      q: '🔒 Is my data secure?', 
      a: 'Absolutely. We use AES-256 encryption and are HIPAA compliant. All patient data is anonymized.' 
    },
    { 
      q: '📋 What image types are supported?', 
      a: 'We support X-Ray, MRI, CT Scans, Ultrasound, and other common medical imaging formats in JPG, PNG, DICOM, and NIfTI formats.' 
    },
    { 
      q: '💬 How do I contact support?', 
      a: 'Visit the Contact page or email support@mediai.com. Our team responds within 24 hours.' 
    }
  ];

  return (
    <div className="space-y-8 max-w-4xl">
      <h1 className={`text-4xl font-bold ${textColor}`}>Help & FAQ</h1>

      <div className="space-y-4">
        {faqItems.map((item, i) => (
          <div key={i} className={`${cardBg} p-6 rounded-xl border ${borderColor} hover:shadow-lg transition`}>
            <p className={`font-bold text-lg ${textColor} mb-3`}>{item.q}</p>
            <p className={darkMode ? 'text-gray-300' : 'text-gray-600'}>{item.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
