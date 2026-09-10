import React from 'react';
import useStore, { PREBUILT_PERSONAS } from '../../store/useStore';
import { CheckCircle2, Sparkles, UserCheck } from 'lucide-react';

export default function PersonaSwitcher({ onCustomClick }) {
  const { activePersonaKey, setPersona } = useStore();

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 flex items-center space-x-1.5">
          <UserCheck className="w-4 h-4 text-orange-600" />
          <span>Select Citizen Demographic Persona:</span>
        </span>
        <span className="text-[11px] text-orange-600 font-semibold bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200 self-start sm:self-auto">
          ⚡ 1-Click Demographic Simulation (myScheme.gov.in Mapped)
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {Object.values(PREBUILT_PERSONAS).map((persona) => {
          const isActive = activePersonaKey === persona.key;
          return (
            <button
              key={persona.key}
              type="button"
              onClick={() => setPersona(persona.key)}
              className={`text-left p-3.5 rounded-2xl border transition-all relative overflow-hidden flex flex-col justify-between ${
                isActive
                  ? 'bg-gradient-to-br from-orange-50 via-white to-amber-50 border-orange-400 shadow-sm ring-2 ring-orange-200'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              {isActive && (
                <div className="absolute top-2.5 right-2.5">
                  <CheckCircle2 className="w-4 h-4 text-orange-600" />
                </div>
              )}

              <div>
                <p className="text-xs font-extrabold text-slate-900 leading-tight mb-1 pr-5">
                  {persona.label}
                </p>
                <p className="text-[10px] text-slate-500 leading-snug">
                  {persona.tag}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px]">
                <span className="font-semibold text-slate-600">
                  {persona.profile.category} • {persona.profile.state}
                </span>
                <span className="font-bold text-emerald-700 font-mono">
                  ₹{(persona.profile.annual_income / 1000).toFixed(0)}k/yr
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
