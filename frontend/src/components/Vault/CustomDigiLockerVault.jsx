import React, { useState } from 'react';
import useStore from '../../store/useStore';
import PersonaSwitcher from './PersonaSwitcher';
import AttributeEditor from './AttributeEditor';
import DocumentCard from './DocumentCard';
import { X, ShieldCheck, CheckCircle2, Sliders, FileText, Zap, Sparkles, ExternalLink, Download } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export default function CustomDigiLockerVault({ isOpen, onClose }) {
  const {
    activePersonaKey,
    citizen,
    documents: storeDocs,
    activeProfile,
    schemes,
    eligibleCount,
  } = useStore();

  const docList = activeProfile?.documents || storeDocs || citizen?.documents || [];

  const { handleTriggerAutoFill } = useApp();

  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'editor'

  if (!isOpen) return null;

  const handleLaunchAutoFillFirst = () => {
    if (schemes && schemes.length > 0) {
      const bestEligible = schemes.find(s => s.is_eligible) || schemes[0];
      handleTriggerAutoFill(bestEligible.scheme);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full p-5 sm:p-7 shadow-2xl border border-slate-200 relative max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-200 pb-4 mb-5 gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg sm:text-xl font-extrabold text-slate-900">
                  Custom DigiLocker Vault
                </h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                  2D Document Simulator
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Simulate official DigiLocker credentials & test scheme matching across Indian citizen demographics
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="flex items-center space-x-2 mr-8">
            <button
              onClick={handleLaunchAutoFillFirst}
              className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center space-x-1.5"
            >
              <Zap className="w-4 h-4 fill-white" />
              <span className="hidden sm:inline">Auto-Fill Active Profile</span>
              <span className="sm:hidden">Auto-Fill</span>
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-1">
          
          {/* Persona Switcher */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200">
            <PersonaSwitcher />
          </div>

          {/* Active Persona Banner & Tab Navigator */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-sm">
                {citizen.name?.charAt(0) || 'C'}
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  {citizen.name} • <span className="text-orange-600 font-semibold">{citizen.occupation}</span>
                </p>
                <p className="text-[10px] text-slate-500">
                  {citizen.category} • {citizen.age} yrs • {citizen.state} • ₹{citizen.annual_income?.toLocaleString('en-IN')}/yr
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setActiveTab('documents')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'documents'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Verified Credentials ({docList.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1.5 rounded-lg font-semibold transition-all flex items-center space-x-1.5 ${
                  activeTab === 'editor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Edit Dynamic Attributes</span>
              </button>
            </div>
          </div>

          {/* Tab 1: Simulated 2D Certificates */}
          {activeTab === 'documents' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Simulated 2D Official DigiLocker Documents:
                </span>
                <span className="text-[11px] text-slate-400">
                  Strict privacy placeholder restraint active
                </span>
              </div>

              {docList.length === 0 ? (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-500 text-xs">
                  <p className="font-semibold text-slate-700">No digital documents linked to this custom profile yet.</p>
                  <p className="text-[10px] text-slate-400 mt-1">Use the Edit Dynamic Attributes tab to configure credentials.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {docList.map((doc, idx) => (
                    <DocumentCard key={doc?.id || idx} doc={doc} document={doc} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Dynamic Attribute Editor */}
          {activeTab === 'editor' && (
            <div>
              <AttributeEditor onSaved={() => setActiveTab('documents')} />
            </div>
          )}

        </div>

        {/* Footer Summary */}
        <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-slate-800">Matching Status:</span>
            <span className="text-emerald-700 font-bold">{eligibleCount} schemes 100% eligible</span>
            <span>for active demographic profile</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs"
          >
            Done & View Dashboard
          </button>
        </div>

      </div>
    </div>
  );
}
