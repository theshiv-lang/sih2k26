import React from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import ExtensionStatusBanner from '../components/ExtensionStatusBanner';
import {
  Chrome,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  CheckCircle2,
  Lock,
  Code,
  Layers,
  Sparkles,
  ExternalLink,
  Laptop,
  Check
} from 'lucide-react';

export default function ExtensionDemo() {
  const { t } = useTranslation();
  const { isExtensionActive, citizen } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Header Section */}
      <div className="space-y-4 max-w-3xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
          <Chrome className="w-3.5 h-3.5 text-orange-600" />
          <span>Chrome Extension (Manifest V3) Architecture</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
          Sahayak Autonomous <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 to-amber-600">Auto-Fill Engine</span>
        </h1>
        <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
          Eliminate redundant paperwork across complex multi-page government welfare portals. Our sovereign Chrome extension injects verified citizen credentials from DigiLocker using sub-millisecond semantic DOM fuzzy matching.
        </p>
      </div>

      {/* Live Extension Status Banner */}
      <div>
        <ExtensionStatusBanner />
      </div>

      {/* Quick Start & Live Test Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Card 1: Interactive Test Launcher */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              Test Auto-Fill on Demo Welfare Portal
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Launch our simulated multi-page government welfare application portal. When you open the portal, the extension automatically binds to the DOM, runs a 1.5-second scanning simulation, and injects verified credentials into form fields.
            </p>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="font-bold text-slate-700 flex items-center justify-between">
                <span>Active Simulated Citizen:</span>
                <span className="text-emerald-700 font-mono font-bold">{citizen.name}</span>
              </div>
              <div className="text-slate-500">
                Aadhaar: <span className="font-mono text-slate-700">XXXX-XXXX-4812</span> • Income: <span className="font-mono text-slate-700">₹{citizen.annual_income?.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <a
              href="/demo_portal.html"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-base sm:text-sm shadow-lg shadow-orange-600/25 transition-all inline-flex items-center justify-center space-x-2"
            >
              <span>Launch Demo Welfare Portal</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Card 2: 3-Step Installation Guide */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          <div className="space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <Laptop className="w-6 h-6" />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900">
              How to Load in Google Chrome
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Experience the live extension during your evaluation in 3 quick steps:
            </p>
          </div>

          <div className="space-y-3.5 text-xs text-slate-700">
            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                1
              </div>
              <div>
                <strong className="text-slate-900">Open Chrome Extensions:</strong>
                <p className="text-slate-500 mt-0.5">Navigate to <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[11px]">chrome://extensions</code> and toggle <strong>Developer mode</strong> ON in the top-right corner.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                2
              </div>
              <div>
                <strong className="text-slate-900">Load Unpacked:</strong>
                <p className="text-slate-500 mt-0.5">Click <strong>Load unpacked</strong> and select the <code className="px-1.5 py-0.5 rounded bg-slate-200 font-mono text-[11px]">extension/</code> directory from this repository.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                3
              </div>
              <div>
                <strong className="text-slate-900">Pin & Auto-Fill:</strong>
                <p className="text-slate-500 mt-0.5">Pin the Sahayak icon. Visit any welfare portal to watch credentials automatically resolve and populate with green verified badges.</p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Architectural Highlights */}
      <div className="space-y-6 pt-4">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Architectural Highlights & Privacy Invariants
          </h2>
          <p className="text-sm text-slate-500">
            Engineered with strict zero-knowledge security and modern browser standards.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Zero-Server Data Transmission</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Citizen identity parameters remain strictly inside browser memory (<code className="font-mono text-emerald-700 font-bold">chrome.storage.local</code>). Zero PII or private documents are sent to any remote server during form filling.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <Code className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">17-Dimension Semantic Matcher</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              DOM content scripts use an extensive weighted fuzzy dictionary covering 70+ field variations (e.g. <code className="font-mono text-slate-700">pitaka_naam</code>, <code className="font-mono text-slate-700">zamin</code>, <code className="font-mono text-slate-700">aadhaar_no</code>) across Central and State portals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5" />
            </div>
            <h4 className="text-base font-bold text-slate-900">Real-Time Bi-Directional i18n</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              When language is switched on the Sahayak platform, it automatically synchronizes to the Chrome extension popup and injected in-page UI via Manifest V3 message bus without page refresh.
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
