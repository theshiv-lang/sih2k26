import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useStore from '../store/useStore';
import { useApp } from '../context/AppContext';
import DocumentCard from '../components/Vault/DocumentCard';
import AttributeEditor from '../components/Vault/AttributeEditor';
import PersonaSwitcher from '../components/Vault/PersonaSwitcher';
import {
  ShieldCheck,
  CheckCircle2,
  Sliders,
  FileText,
  Zap,
  Users,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Download,
  Lock,
  Edit3
} from 'lucide-react';

export default function Vault() {
  const { t } = useTranslation();
  const {
    citizen,
    documents: storeDocs,
    activeProfile,
    schemes,
    activePersonaKey,
    openEditProfileModal,
  } = useStore();

  const docList = activeProfile?.documents || storeDocs || citizen?.documents || [];

  const { handleTriggerAutoFill } = useApp();
  const [activeTab, setActiveTab] = useState('documents'); // 'documents' | 'editor' | 'personas'

  const handleLaunchAutoFillFirst = () => {
    if (schemes && schemes.length > 0) {
      const bestEligible = schemes.find(s => s.is_eligible) || schemes[0];
      handleTriggerAutoFill(bestEligible.scheme);
    }
  };

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-8">
      
      {/* 1. Header & Overview Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/20 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {t('vault.title')}
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                {t('vault.authenticated')}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {t('vault.subtitle')}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleLaunchAutoFillFirst}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 transition-all flex items-center space-x-1.5"
          >
            <Zap className="w-3.5 h-3.5 fill-white" />
            <span>{t('vault.testAutofill')}</span>
          </button>

          <Link
            to="/schemes"
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5"
          >
            <span>{t('vault.viewSchemes')}</span>
            <ArrowRight className="w-3.5 h-3.5 text-orange-400" />
          </Link>
        </div>

      </div>

      {/* 2. Active Profile Summary Pill Card */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-700 font-extrabold flex items-center justify-center text-sm">
            {citizen.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-extrabold text-slate-900">{citizen.name}</span>
              <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200">
                {citizen.occupation}
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              Aadhaar: {citizen.aadhaar_number} • State: {citizen.state} • Cat: {citizen.category} • Income: ₹{(citizen.annual_income || 0).toLocaleString('en-IN')}/yr
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={openEditProfileModal}
            className="px-3 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-all flex items-center space-x-1.5 shadow-2xs"
            title="Open Profile Attribute Customizer Modal"
          >
            <Edit3 className="w-3.5 h-3.5 text-orange-600" />
            <span>{t('vault.editProfile')}</span>
          </button>

          <span className="text-xs text-slate-400 font-medium hidden sm:inline">Active Persona:</span>
          <span className="text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl border border-slate-200">
            {activePersonaKey}
          </span>
        </div>
      </div>

      {/* 3. Navigation View Mode Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('documents')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'documents'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{t('vault.tabDocuments')} ({docList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('editor')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'editor'
              ? 'bg-orange-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>{t('vault.tabEditor')}</span>
        </button>

        <button
          onClick={() => setActiveTab('personas')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 ${
            activeTab === 'personas'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>{t('vault.tabPersonas')}</span>
        </button>
      </div>

      {/* 4. Tab 1: Verified Sovereign Document Cards Grid */}
      {activeTab === 'documents' && (
        <div className="space-y-6">
          {docList.length === 0 ? (
            <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-slate-300 text-slate-500 flex flex-col items-center justify-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                <FileText className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                No digital documents linked to this custom profile yet.
              </p>
              <p className="text-xs text-slate-400 max-w-sm">
                Custom citizen profiles require documents to be attached or generated via the Profile Customizer.
              </p>
              <button
                onClick={openEditProfileModal}
                className="mt-2 px-3.5 py-1.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold transition-all"
              >
                Configure Profile Credentials
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {docList.map((doc, idx) => (
                <DocumentCard key={doc?.id || idx} document={doc} doc={doc} />
              ))}
            </div>
          )}

          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 flex items-start space-x-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">UIDAI & State Revenue Sovereign Authenticity</p>
              <p className="text-blue-700 text-[11px] mt-0.5 leading-relaxed">
                All certificates in this simulator mirror the exact schema returned by the National DigiLocker API (Aadhaar XML, Tehsildar Revenue, and Caste certificates). When our Chrome extension runs, it injects these verified attributes directly into official scheme form fields.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 5. Tab 2: Dynamic Profile Attribute Editor */}
      {activeTab === 'editor' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Customize Demographic Attributes
            </h2>
            <p className="text-xs text-slate-500">
              Update income, landholding, caste category, or occupation. Saving will dynamically update your document values and re-evaluate eligibility against all 4,770+ schemes.
            </p>
          </div>
          
          <AttributeEditor />
        </div>
      )}

      {/* 6. Tab 3: Persona Switcher */}
      {activeTab === 'personas' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-bold text-slate-900">
              Pre-Configured Demographic Personas
            </h2>
            <p className="text-xs text-slate-500">
              Switch between 6 prebuilt citizen profiles for quick live demonstrations.
            </p>
          </div>

          <PersonaSwitcher />
        </div>
      )}

    </div>
  );
}
