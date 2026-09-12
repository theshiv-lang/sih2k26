import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';
import VoiceInputModal from './components/VoiceInputModal';
import AutoFillModal from './components/AutoFillModal';
import ProfileModal from './components/ProfileModal';
import ErrorBoundary from './components/ErrorBoundary';

// Dedicated Multi-Page Views
import Home from './pages/Home';
import Login from './pages/Login';
import Schemes from './pages/Schemes';
import Vault from './pages/Vault';
import OfficerDashboard from './pages/OfficerDashboard';
import ExtensionDemo from './pages/ExtensionDemo';

function ScrollToTop() {
  const { pathname } = useLocation();

  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function PublicLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-900">
      
      {/* Navigation Header */}
      <Navbar />

      {/* Main Page Content */}
      <main className="flex-1 w-full">
        {children}
      </main>

      {/* Civic Government Footer */}
      <footer className="bg-white border-t border-slate-200 mt-16 py-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-[11px] font-serif">
              सं
            </div>
            <span className="font-extrabold text-slate-800 text-sm">Sahayak (सहायक)</span>
            <span className="text-slate-400">• Smart India Hackathon 2026</span>
          </div>

          <p className="text-slate-400 text-center sm:text-right max-w-lg leading-relaxed text-[11px]">
            National E-Governance Welfare Discovery & Intelligent 1-Click Form Auto-Fill Platform. Built with Rust, Axum, Render PostgreSQL, and React.
          </p>
        </div>
      </footer>

    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollToTop />
        
        {/* Global Overlays accessible from all pages */}
        <VoiceInputModal />
        <AutoFillModal />
        <ProfileModal />

        {/* Application Route Table wrapped with ErrorBoundary */}
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<PublicLayout><Home /></PublicLayout>} />
            <Route path="/login" element={<PublicLayout><Login /></PublicLayout>} />
            <Route path="/schemes" element={<PublicLayout><Schemes /></PublicLayout>} />
            <Route path="/vault" element={<PublicLayout><Vault /></PublicLayout>} />
            <Route path="/extension" element={<PublicLayout><ExtensionDemo /></PublicLayout>} />
            <Route path="/officer" element={<OfficerDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
    </AppProvider>
  );
}
