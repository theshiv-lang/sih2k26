import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import useStore, { PREBUILT_PERSONAS } from '../store/useStore';
import { X, User, Check, Sparkles } from 'lucide-react';

export default function ProfileEditModal({ isOpen, onClose }) {
  const { citizen, setCitizen, runSchemeMatching, selectedCategory, language } = useApp();
  const { setPersona, activePersonaKey } = useStore();
  const [formData, setFormData] = useState({ ...citizen });

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...citizen });
    }
  }, [isOpen, citizen]);

  if (!isOpen) return null;

  const handleSelectPersona = async (personaKey) => {
    await setPersona(personaKey);
    const updated = PREBUILT_PERSONAS[personaKey]?.profile;
    if (updated) {
      setFormData({ ...updated });
      setCitizen(updated);
      runSchemeMatching(updated, selectedCategory, language);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setCitizen(formData);
    runSchemeMatching(formData, selectedCategory, language);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Edit Citizen Profile
            </h3>
            <p className="text-xs text-slate-500">
              Modify demographic attributes to test rule matching engine in real-time
            </p>
          </div>
        </div>

        {/* Quick Demo Presets */}
        <div className="mb-5">
          <span className="text-[11px] font-semibold text-slate-500 block mb-2">
            ⚡ Quick Citizen Personas (Click to instant-switch):
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            {Object.values(PREBUILT_PERSONAS).map((p) => (
              <button
                key={p.key}
                type="button"
                onClick={() => handleSelectPersona(p.key)}
                className={`text-left text-xs p-2.5 rounded-xl border transition-all ${
                  activePersonaKey === p.key
                    ? 'bg-orange-50 border-orange-300 text-orange-950 font-bold shadow-xs'
                    : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700 font-medium'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Full Name</label>
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Age</label>
              <input
                type="number"
                value={formData.age || 18}
                onChange={(e) => setFormData({ ...formData, age: parseInt(e.target.value) || 18 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Gender</label>
              <select
                value={formData.gender || 'Male'}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Category</label>
              <select
                value={formData.category || 'General'}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              >
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Occupation</label>
              <select
                value={formData.occupation || 'Farmer'}
                onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400"
              >
                <option value="Farmer">Farmer</option>
                <option value="Student">Student</option>
                <option value="Self-Employed">Self-Employed</option>
                <option value="Artisan">Artisan</option>
                <option value="Unemployed">Unemployed</option>
                <option value="Housewife">Housewife</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-600 font-medium mb-1">Annual Income (₹)</label>
              <input
                type="number"
                step="10000"
                value={formData.annual_income || 0}
                onChange={(e) => setFormData({ ...formData, annual_income: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-mono font-semibold text-emerald-700"
                required
              />
            </div>

            <div>
              <label className="block text-slate-600 font-medium mb-1">Land (Acres)</label>
              <input
                type="number"
                step="0.5"
                value={formData.landholding_acres || 0}
                onChange={(e) => setFormData({ ...formData, landholding_acres: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-slate-400 font-mono"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4 pt-2">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_student || false}
                onChange={(e) => setFormData({ ...formData, is_student: e.target.checked })}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="text-slate-700">Enrolled Student</span>
            </label>

            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.is_differently_abled || false}
                onChange={(e) => setFormData({ ...formData, is_differently_abled: e.target.checked })}
                className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
              />
              <span className="text-slate-700">Differently Abled (PwD)</span>
            </label>
          </div>

          <div className="pt-4 flex items-center space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-md flex items-center justify-center space-x-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply & Re-evaluate Schemes</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
