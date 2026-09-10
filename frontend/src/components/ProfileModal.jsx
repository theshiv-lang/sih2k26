import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import {
  X,
  UserPlus,
  Sliders,
  CheckCircle2,
  ShieldCheck,
  Building,
  User,
  Phone,
  Calendar,
  Layers,
  Sparkles,
  AlertCircle
} from 'lucide-react';

const INDIAN_STATES = [
  "Uttar Pradesh", "Bihar", "Rajasthan", "Madhya Pradesh", "Maharashtra",
  "West Bengal", "Tamil Nadu", "Karnataka", "Gujarat", "Andhra Pradesh",
  "Odisha", "Telangana", "Kerala", "Punjab", "Haryana", "Assam", "Delhi",
  "Jharkhand", "Chhattisgarh", "Uttarakhand", "Himachal Pradesh", "Jammu and Kashmir"
];

const CATEGORIES = ["General", "OBC", "SC", "ST", "EWS"];

const OCCUPATIONS = [
  "Farmer",
  "Student",
  "Self-Employed / Entrepreneur",
  "Unemployed",
  "Private Sector Employee",
  "Artisan / Craftsperson",
  "Homemaker / Housewife",
  "Daily Wage Worker",
  "Senior Citizen / Retired"
];

const GENDERS = ["Male", "Female", "Other"];

export default function ProfileModal() {
  const navigate = useNavigate();
  const {
    isProfileModalOpen,
    profileModalMode,
    closeProfileModal,
    addCustomProfile,
    updateActiveProfile,
    citizen,
    activeProfile,
  } = useStore();

  const isCreateMode = profileModalMode === 'create';
  const targetProfile = activeProfile || citizen || {};

  const [formData, setFormData] = useState({
    name: '',
    father_name: '',
    contact_number: '+91 98765 43210',
    age: 30,
    gender: 'Male',
    state: 'Uttar Pradesh',
    category: 'General',
    annual_income: 120000,
    occupation: 'Farmer',
    landholding_acres: 0.0,
    bpl_card_holder: false,
    is_student: false,
  });

  const [validationError, setValidationError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync initial form values depending on mode
  useEffect(() => {
    if (!isProfileModalOpen) return;

    setValidationError('');
    setIsSubmitting(false);

    if (isCreateMode) {
      setFormData({
        name: '',
        father_name: '',
        contact_number: '+91 98765 43210',
        age: 32,
        gender: 'Male',
        state: 'Uttar Pradesh',
        category: 'General',
        annual_income: 140000,
        occupation: 'Self-Employed / Entrepreneur',
        landholding_acres: 0.0,
        bpl_card_holder: false,
        is_student: false,
      });
    } else {
      setFormData({
        name: targetProfile.name || '',
        father_name: targetProfile.father_name || '',
        contact_number: targetProfile.contact_number || '+91 98765 43210',
        age: targetProfile.age || 30,
        gender: targetProfile.gender || 'Male',
        state: targetProfile.state || 'Uttar Pradesh',
        category: targetProfile.category || 'General',
        annual_income: targetProfile.annual_income || 120000,
        occupation: targetProfile.occupation || 'Farmer',
        landholding_acres: targetProfile.landholding_acres || 0.0,
        bpl_card_holder: Boolean(targetProfile.bpl_card_holder),
        is_student: Boolean(targetProfile.is_student),
      });
    }
  }, [isProfileModalOpen, isCreateMode, targetProfile]);

  // Keyboard escape listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isProfileModalOpen) {
        closeProfileModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isProfileModalOpen, closeProfileModal]);

  if (!isProfileModalOpen) return null;

  const handleChange = (field, value) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'occupation') {
        updated.is_student = value === 'Student';
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError('');

    if (!formData.name.trim()) {
      setValidationError('Please provide citizen full name.');
      return;
    }

    if (!formData.age || Number(formData.age) <= 0 || Number(formData.age) > 120) {
      setValidationError('Please enter a valid citizen age between 1 and 120 years.');
      return;
    }

    if (Number(formData.annual_income) < 0) {
      setValidationError('Annual income cannot be negative.');
      return;
    }

    if (Number(formData.landholding_acres) < 0) {
      setValidationError('Landholding acreage cannot be negative.');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isCreateMode) {
        await addCustomProfile(formData);
        closeProfileModal();
        navigate('/schemes');
      } else {
        await updateActiveProfile(formData);
        closeProfileModal();
      }
    } catch (err) {
      console.error('[ProfileModal] Submission notice:', err);
      setValidationError('Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header Bar */}
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between border-b border-slate-700 flex-shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-md shadow-orange-600/30">
              {isCreateMode ? <UserPlus className="w-5 h-5" /> : <Sliders className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {isCreateMode ? '+ Create Custom Citizen Profile' : 'Customize Active Citizen Profile'}
              </h3>
              <p className="text-xs text-slate-400">
                {isCreateMode
                  ? 'Add a new citizen and evaluate eligibility across 4,770+ welfare schemes'
                  : 'Update demographic and economic attributes in real time'}
              </p>
            </div>
          </div>

          <button
            onClick={closeProfileModal}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Close Modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5 text-xs text-slate-700">
          
          {/* Zero-PII Compliance Notice */}
          <div className="p-3.5 rounded-2xl bg-orange-50/70 border border-orange-200/80 flex items-center space-x-3 text-slate-700">
            <ShieldCheck className="w-5 h-5 text-orange-600 flex-shrink-0" />
            <div className="text-[11px] leading-relaxed">
              <strong className="text-slate-900">Zero-PII Sovereign Guard:</strong> All custom profiles use sanitized test placeholders (Aadhaar: <code className="font-mono font-bold text-orange-800">XXXX-XXXX-XXXX</code>). Data is processed locally and in your isolated database session.
            </div>
          </div>

          {/* Validation Error Banner */}
          {validationError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center space-x-2 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{validationError}</span>
            </div>
          )}

          {/* Section 1: Personal Demographics */}
          <div className="space-y-3">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              1. Personal Demographics
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Citizen Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="e.g. Rameshwar Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Father's / Guardian Name</label>
                <input
                  type="text"
                  value={formData.father_name}
                  onChange={(e) => handleChange('father_name', e.target.value)}
                  placeholder="e.g. Ramswaroop Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Age (Years) *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={formData.age}
                  onChange={(e) => handleChange('age', parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Gender</label>
                <select
                  value={formData.gender}
                  onChange={(e) => handleChange('gender', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                >
                  {GENDERS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Simulated Contact Number</label>
                <input
                  type="text"
                  value={formData.contact_number}
                  onChange={(e) => handleChange('contact_number', e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-mono text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Primary Occupation</label>
                <select
                  value={formData.occupation}
                  onChange={(e) => handleChange('occupation', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                >
                  {OCCUPATIONS.map((occ) => (
                    <option key={occ} value={occ}>{occ}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Section 2: Regional & Socioeconomic Criteria */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              2. Regional, Caste & Income Criteria
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              
              <div>
                <label className="block font-bold text-slate-800 mb-1">State / UT *</label>
                <select
                  value={formData.state}
                  onChange={(e) => handleChange('state', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Social Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => handleChange('category', e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Annual Family Income (₹/Year) *</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">₹</span>
                  <input
                    type="number"
                    min="0"
                    step="5000"
                    value={formData.annual_income}
                    onChange={(e) => handleChange('annual_income', parseInt(e.target.value) || 0)}
                    className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                    required
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  e.g. ₹1,20,000 / Year
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Agricultural Landholding (Acres)</label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={formData.landholding_acres}
                  onChange={(e) => handleChange('landholding_acres', parseFloat(e.target.value) || 0.0)}
                  placeholder="0.0"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:border-orange-500 transition-all font-medium text-slate-900"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Set &gt; 0 for agricultural schemes (PM-KISAN / PMFBY)
                </span>
              </div>

            </div>

            {/* BPL / Antyodaya Toggle Card */}
            <div className="mt-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-900 block text-xs">
                  BPL / Antyodaya Anna Yojana (AAY) Ration Card Holder
                </span>
                <span className="text-[11px] text-slate-500">
                  Enables priority direct DBT and destitute welfare schemes (NSAP Pensions, Food Subsidies)
                </span>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 ml-4">
                <input
                  type="checkbox"
                  checked={formData.bpl_card_holder}
                  onChange={(e) => handleChange('bpl_card_holder', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-600"></div>
              </label>
            </div>

          </div>

          {/* Action Footer Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end space-x-3 flex-shrink-0">
            <button
              type="button"
              onClick={closeProfileModal}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/25 transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isSubmitting
                  ? 'Saving Profile...'
                  : isCreateMode
                  ? 'Save & Discover Schemes ➔'
                  : 'Save & Update Attributes'}
              </span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
