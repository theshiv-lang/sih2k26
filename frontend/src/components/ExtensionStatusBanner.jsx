import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Layers, ArrowUpRight, CheckCircle2, AlertCircle, Chrome } from 'lucide-react';

export default function ExtensionStatusBanner() {
  const { isExtensionActive } = useApp();

  return (
    <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
      
      <div className="flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400 flex-shrink-0 mt-0.5">
          <Chrome className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-bold text-white">
              Sahayak Auto-Fill Engine (Chrome Extension MV3)
            </h4>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
              isExtensionActive
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
            }`}>
              {isExtensionActive ? 'Connected & Listening' : 'Extension Ready (Load /extension)'}
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Eliminate repetitive paperwork. Our extension extracts verified citizen attributes from DigiLocker and injects them into multi-page government portal forms using DOM fuzzy matching.
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-2.5 w-full md:w-auto justify-end flex-shrink-0">
        <a
          href="/demo_portal.html"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/30 transition-all inline-flex items-center space-x-1.5"
        >
          <span>Open Demo Application Portal</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </a>
      </div>

    </div>
  );
}
