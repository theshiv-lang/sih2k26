import React from 'react';
import useStore, { PREBUILT_PERSONAS } from '../../store/useStore';
import { ShieldCheck, ArrowRight, Sliders, CheckCircle2, FileText } from 'lucide-react';

export default function VaultBanner({ onOpenFullVault }) {
  const { activePersonaKey, setPersona, citizen, documents } = useStore();

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-2xl p-4 sm:p-5 text-white shadow-md border border-blue-800/40 relative overflow-hidden">
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center text-orange-400 flex-shrink-0">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm sm:text-base font-extrabold text-white tracking-wide">
                Custom DigiLocker Vault
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                2D Document Simulator
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Active Demographic: <span className="font-bold text-white">{citizen.name}</span> ({citizen.occupation} • {citizen.category} • {citizen.state})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenFullVault}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
          >
            <FileText className="w-4 h-4 text-orange-400" />
            <span>View 2D Credentials ({documents.length}) & Editor</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>
      </div>

      {/* 1-Click Demographic Personas Bar */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">
          ⚡ 1-Click Demographic Simulation (Official myScheme.gov.in Mapped):
        </span>
        
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {Object.values(PREBUILT_PERSONAS).map((p) => {
            const isActive = activePersonaKey === p.key;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPersona(p.key)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-1.5 flex-shrink-0 ${
                  isActive
                    ? 'bg-orange-500 text-white shadow-sm ring-2 ring-orange-300 font-bold'
                    : 'bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10'
                }`}
              >
                <span>{p.label}</span>
                {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
}
