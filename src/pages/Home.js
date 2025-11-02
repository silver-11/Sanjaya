import React from 'react';
import { Upload, Shield, Clock, FileText, Users, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';

const Home = () => {
  const { darkMode, setCurrentPage } = useApp();

  const features = [
    { 
      icon: Shield, 
      title: 'HIPAA Compliant', 
      desc: 'Enterprise-grade security with military-level encryption and privacy protection',
      image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    { 
      icon: Zap, 
      title: 'AI-Powered Analysis', 
      desc: 'Advanced machine learning algorithms for accurate medical image interpretation',
      image: 'https://images.unsplash.com/photo-1551601651-2a8555f1a136?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    { 
      icon: Clock, 
      title: 'Rapid Results', 
      desc: 'Get comprehensive analysis reports within minutes, not hours',
      image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    { 
      icon: FileText, 
      title: 'Detailed Reports', 
      desc: 'Comprehensive medical reports with visualizations and recommendations',
      image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    { 
      icon: Users, 
      title: 'Expert Support', 
      desc: '24/7 access to medical professionals and technical support team',
      image: 'https://images.unsplash.com/photo-1582750433449-648ed127bb54?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    },
    { 
      icon: Upload, 
      title: 'Easy Integration', 
      desc: 'Seamless workflow integration with existing medical systems',
      image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'
    }
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-blue-800/10 rounded-3xl"></div>
        <div className="relative bg-white dark:bg-slate-800 rounded-3xl p-12 shadow-lg">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl font-bold text-slate-900 dark:text-white mb-6">
                Sanjaya Medical AI Platform
              </h1>
              <p className="text-xl text-slate-600 dark:text-slate-300 mb-8 leading-relaxed">
                Harness the power of artificial intelligence for accurate, rapid, and reliable medical image interpretation. 
                Trusted by healthcare professionals worldwide.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Shield className="w-4 h-4 text-green-600" />
                  HIPAA Compliant
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Clock className="w-4 h-4 text-blue-600" />
                  Results in Minutes
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                  <Zap className="w-4 h-4 text-purple-600" />
                  99.2% Accuracy
                </div>
              </div>
              <button 
                onClick={() => setCurrentPage('analysis')} 
                className="medical-btn-primary text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center gap-2"
              >
                <Upload size={20} /> Start Analysis
              </button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
                alt="Medical Analysis Dashboard" 
                className="rounded-2xl shadow-xl"
              />
              <div className="absolute -bottom-6 -left-6 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-subtle-pulse"></div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Analysis Complete</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div>
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Why Choose Sanjaya?</h2>
          <p className="text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
            Our platform combines cutting-edge technology with medical expertise to deliver reliable results you can trust.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div 
              key={i} 
              className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden medical-hover"
            >
              <div className="relative h-48 overflow-hidden">
                <img 
                  src={feature.image} 
                  alt={feature.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/90 dark:bg-slate-800/90 p-2 rounded-lg">
                  <feature.icon className="w-5 h-5 text-blue-600" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
        <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
          Join thousands of healthcare professionals who trust Sanjaya for accurate, fast, and reliable medical image analysis.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={() => setCurrentPage('analysis')} 
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors inline-flex items-center gap-2"
          >
            <Upload size={20} /> Start Free Analysis
          </button>
          <button 
            onClick={() => setCurrentPage('contact')} 
            className="border border-white/30 text-white px-8 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Contact Sales
          </button>
        </div>
      </div>
    </div>
  );
};

export default Home;
