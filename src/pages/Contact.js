import React from 'react';
import { useApp } from '../context/AppContext';

const Contact = () => {
  const { darkMode } = useApp();

  const cardBg = darkMode ? 'bg-gray-800' : 'bg-white';
  const borderColor = darkMode ? 'border-gray-700' : 'border-teal-200';
  const textColor = darkMode ? 'text-gray-100' : 'text-gray-900';

  const contactInfo = [
    { icon: '📧', title: 'Email', info: 'support@mediai.com', time: 'Response: 24 hours' },
    { icon: '📞', title: 'Phone', info: '+1 (555) 123-4567', time: 'Mon-Fri: 9AM-6PM' },
    { icon: '📍', title: 'Address', info: '123 Medical Ave, Boston, MA', time: 'Headquarters' }
  ];

  const formFields = [
    { label: 'Full Name', type: 'text' },
    { label: 'Email', type: 'email' },
    { label: 'Subject', type: 'text' }
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className={`text-4xl font-bold ${textColor}`}>Contact Us</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {contactInfo.map((item, i) => (
          <div key={i} className={`${cardBg} p-6 rounded-xl border ${borderColor} text-center hover:shadow-lg transition`}>
            <div className="text-5xl mb-3">{item.icon}</div>
            <p className={`font-bold ${textColor} text-lg`}>{item.title}</p>
            <p className="text-blue-600 font-semibold mt-2">{item.info}</p>
            <p className="text-sm text-gray-500 mt-2">{item.time}</p>
          </div>
        ))}
      </div>

      <div className={`${cardBg} p-8 rounded-xl border ${borderColor}`}>
        <h3 className={`text-2xl font-bold ${textColor} mb-6`}>Send us a Message</h3>
        <form className="space-y-4">
          {formFields.map((field, i) => (
            <div key={i}>
              <label className={`block text-sm font-bold ${textColor} mb-2`}>{field.label}</label>
              <input 
                type={field.type} 
                placeholder={`Enter your ${field.label.toLowerCase()}`}
                className={`w-full px-4 py-3 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 transition ${
                  darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white'
                }`} 
              />
            </div>
          ))}
          <div>
            <label className={`block text-sm font-bold ${textColor} mb-2`}>Message</label>
            <textarea 
              placeholder="Tell us your feedback or issue..." 
              className={`w-full p-4 border ${borderColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600 h-40 transition ${
                darkMode ? 'bg-gray-700 text-gray-100' : 'bg-white'
              }`}
            ></textarea>
          </div>
          <button 
            type="button" 
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg font-bold transition transform hover:scale-105"
          >
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact;
