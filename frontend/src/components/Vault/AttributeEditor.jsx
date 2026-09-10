import React, { useState, useEffect } from 'react';
import useStore from '../../store/useStore';
import { Save, RefreshCw, CheckCircle2, Sliders, AlertCircle } from 'lucide-react';

const INDIAN_STATES = [
  "Uttar Pradesh", "Bihar", "Rajasthan", "Madhya Pradesh", "Maharashtra", 
  "West Bengal", "Tamil Nadu", "Karnataka", "Gujarat", "Andhra Pradesh", 
  "Odisha", "Telangana", "Kerala", "Punjab", "Haryana", "Assam", "Delhi", "All India"
];

export default function AttributeEditor({ onSaved }) {
  const { citizen, updateCitizenAttributes } = useStore();
  const [formData, setFormData] = useState({ ...citizen });
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  useEffect(() => {
    setFormData({ ...citizen });
  }, [citizen]);

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'occupation' && value === 'Student') {
        updated.is_student = true;
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await updateCitizenAttributes(formData);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 2500);
    if (onSaved) onSaved();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50/70 p-4 sm:p-5 rounded-2xl border border-slate-200">
      
      <div className="flex items-center justify-between border-b border-slate-200 pb-3">
        <div className="flex items-center space-x-2">
          <Sliders className="w-4 h-4 text-orange-600" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Dynamic Demographic & Socioeconomic Attributes
          </h4>
        </div>
        {isSavedNotice && (
          <span className="text-[11px] font-bold text-emerald-700 flex items-center space-x-1 animate-fade-in">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Attributes Synchronized!</span>
          </span>
        )}
      </div>

      {/* Section 1: Demographics */}
      <div>
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
          1. Demographic Identity
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Citizen Full Name</label>
            <input
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleChange('name', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Age (Years)</label>
            <input
              type="number"
              min="0"
              max="120"
              value={formData.age || 18}
              onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Gender</label>
            <select
              value={formData.gender || 'Male'}
              onChange={(e) => handleChange('gender', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Marital Status</label>
            <select
              value={formData.marital_status || 'Single'}
              onChange={(e) => handleChange('marital_status', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Widow">Widow</option>
              <option value="Divorced">Divorced</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Social Category (Caste)</label>
            <select
              value={formData.category || 'General'}
              onChange={(e) => handleChange('category', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="General">General</option>
              <option value="OBC">OBC</option>
              <option value="SC">SC</option>
              <option value="ST">ST</option>
              <option value="EWS">EWS</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">State / Domicile</label>
            <select
              value={formData.state || 'Uttar Pradesh'}
              onChange={(e) => handleChange('state', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            >
              {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Father's / Guardian's Name</label>
            <input
              type="text"
              value={formData.father_name || ''}
              onChange={(e) => handleChange('father_name', e.target.value)}
              placeholder="e.g. Ramswaroop Sharma"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Contact Number</label>
            <input
              type="text"
              value={formData.contact_number || ''}
              onChange={(e) => handleChange('contact_number', e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>
        </div>
      </div>

      {/* Section 2: Socioeconomic Criteria */}
      <div>
        <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider block mb-2">
          2. Socioeconomic Criteria
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block font-medium text-slate-700 mb-1">Annual Income (₹)</label>
            <input
              type="number"
              step="5000"
              value={formData.annual_income || 0}
              onChange={(e) => handleChange('annual_income', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono font-bold text-emerald-700"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Landholding (Acres)</label>
            <input
              type="number"
              step="0.1"
              value={formData.landholding_acres || 0}
              onChange={(e) => handleChange('landholding_acres', parseFloat(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500 font-mono"
            />
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Primary Occupation</label>
            <select
              value={formData.occupation || 'Unemployed'}
              onChange={(e) => handleChange('occupation', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="Farmer">Farmer</option>
              <option value="Student">Student</option>
              <option value="Self-Employed">Self-Employed</option>
              <option value="Artisan">Artisan</option>
              <option value="Housewife">Housewife</option>
              <option value="Daily Wage Worker">Daily Wage Worker</option>
              <option value="Unemployed">Unemployed</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Education Level</label>
            <select
              value={formData.education_level || '12th'}
              onChange={(e) => handleChange('education_level', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
            >
              <option value="None">None</option>
              <option value="Primary">Primary</option>
              <option value="10th">10th</option>
              <option value="12th">12th</option>
              <option value="Undergraduate">Undergraduate</option>
              <option value="Postgraduate">Postgraduate</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-slate-700 mb-1">Girl Child Age (if applicable)</label>
            <input
              type="number"
              min="0"
              max="18"
              value={formData.girl_child_age || 0}
              onChange={(e) => handleChange('girl_child_age', parseInt(e.target.value) || 0)}
              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-orange-500"
              placeholder="e.g. 8 for Sukanya Yojana"
            />
          </div>
        </div>
      </div>

      {/* Checkbox Flags */}
      <div className="pt-2 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300">
          <input
            type="checkbox"
            checked={formData.has_girl_child || false}
            onChange={(e) => handleChange('has_girl_child', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-slate-700 font-medium">Has Girl Child (≤10y)</span>
        </label>

        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300">
          <input
            type="checkbox"
            checked={formData.bpl_card_holder || false}
            onChange={(e) => handleChange('bpl_card_holder', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-slate-700 font-medium">BPL / Ration Card</span>
        </label>

        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300">
          <input
            type="checkbox"
            checked={formData.is_pregnant_or_lactating || false}
            onChange={(e) => handleChange('is_pregnant_or_lactating', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-slate-700 font-medium">Pregnant / Lactating</span>
        </label>

        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300">
          <input
            type="checkbox"
            checked={formData.is_differently_abled || false}
            onChange={(e) => handleChange('is_differently_abled', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-slate-700 font-medium">Differently Abled (PwD)</span>
        </label>

        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300">
          <input
            type="checkbox"
            checked={formData.crop_insured || false}
            onChange={(e) => handleChange('crop_insured', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-slate-700 font-medium">Crop Insured (PMFBY)</span>
        </label>

        <label className="flex items-center space-x-2 bg-white px-3 py-2 rounded-xl border border-slate-200 cursor-pointer hover:border-orange-300">
          <input
            type="checkbox"
            checked={formData.is_student || false}
            onChange={(e) => handleChange('is_student', e.target.checked)}
            className="w-4 h-4 rounded text-orange-600 focus:ring-orange-500"
          />
          <span className="text-slate-700 font-medium">Active Enrolled Student</span>
        </label>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between pt-2">
        <span className="text-[11px] text-slate-400">
          * Saving instantly syncs with Rust /api/match and Chrome MV3 extension.
        </span>

        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs shadow-md shadow-orange-600/20 transition-all flex items-center space-x-1.5"
        >
          <Save className="w-4 h-4" />
          <span>Save & Evaluate Schemes</span>
        </button>
      </div>

    </form>
  );
}
