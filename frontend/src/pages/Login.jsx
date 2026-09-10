import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import useStore, { PREBUILT_PERSONAS } from '../store/useStore';
import {
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Smartphone,
  CreditCard,
  KeyRound,
  Users,
  Sparkles,
  Lock,
  RefreshCw,
  Award,
  ChevronRight,
  UserPlus
} from 'lucide-react';

export default function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { citizen, setCitizen, language } = useApp();
  const {
    activePersonaKey,
    setPersona,
    openCreateProfileModal,
    customProfiles = []
  } = useStore();

  const [authMethod, setAuthMethod] = useState('mobile'); // 'mobile' | 'aadhaar'
  const [identifier, setIdentifier] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otpVal, setOtpVal] = useState('123456');
  const [isVerifying, setIsVerifying] = useState(false);
  const [selectedPersonaKey, setSelectedPersonaKey] = useState(activePersonaKey || 'Farmer');

  const isHindi = (language || '').startsWith('hi');

  const handleSendOtp = (e) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyAndLogin = async (e) => {
    if (e) e.preventDefault();
    setIsVerifying(true);
    
    // Simulate instantaneous verification
    setTimeout(async () => {
      await setPersona(selectedPersonaKey);
      const chosen = PREBUILT_PERSONAS[selectedPersonaKey];
      const custom = customProfiles.find(p => p.id === selectedPersonaKey);
      if (chosen) {
        setCitizen(chosen.profile);
      } else if (custom) {
        setCitizen(custom);
      }
      setIsVerifying(false);
      navigate('/schemes');
    }, 600);
  };

  const handleDirectPersonaSelect = async (personaKey) => {
    setSelectedPersonaKey(personaKey);
    await setPersona(personaKey);
    const chosen = PREBUILT_PERSONAS[personaKey];
    const custom = customProfiles.find(p => p.id === personaKey);
    if (chosen) {
      setCitizen(chosen.profile);
    } else if (custom) {
      setCitizen(custom);
    }
    navigate('/schemes');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      
      {/* Page Title & Breadcrumb */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>{t('login.badge')}</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {t('login.title')}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          {t('login.subtitle')}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Simulated OTP Authentication Card (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t('login.otpTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('login.otpSubtitle')}
              </p>
            </div>
          </div>

          {/* Auth Method Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => { setAuthMethod('mobile'); setIdentifier('9876543210'); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'mobile'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>{t('login.authMobile')}</span>
            </button>
            <button
              type="button"
              onClick={() => { setAuthMethod('aadhaar'); setIdentifier('XXXX-XXXX-1234'); }}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                authMethod === 'aadhaar'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>{t('login.authAadhaar')}</span>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={otpSent ? handleVerifyAndLogin : handleSendOtp} className="space-y-4">
            
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                {authMethod === 'mobile' ? t('login.mobileLabel') : t('login.aadhaarLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={authMethod === 'mobile' ? "e.g. 9876543210" : "e.g. XXXX-XXXX-1234"}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-mono font-medium focus:outline-none focus:border-orange-500 focus:bg-orange-50/20 transition-all"
                  required
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  VERIFIED
                </span>
              </div>
            </div>

            {otpSent && (
              <div className="space-y-2 animate-fade-in">
                <label className="block text-xs font-bold text-slate-700">
                  {t('login.otpLabel')}
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={otpVal}
                    onChange={(e) => setOtpVal(e.target.value)}
                    maxLength={6}
                    placeholder="123456"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-orange-300 bg-orange-50/20 text-xs font-mono font-bold tracking-widest text-slate-900 focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-400 flex items-center space-x-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Auto-filled for demo: <code className="font-bold text-slate-700">123456</code></span>
                </p>
              </div>
            )}

            <div className="pt-2">
              {!otpSent ? (
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
                >
                  <span>{t('login.sendOtp')} ➔</span>
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-3 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/25 transition-all flex items-center justify-center space-x-2"
                >
                  {isVerifying ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('login.verifying')}</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{t('login.verifyLogin')} ➔</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </form>

          {/* Security Guarantee */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-start space-x-2.5 text-xs text-slate-500">
            <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              <strong className="text-slate-800">Zero-PII Compliance:</strong> No real identification credentials are stored. All demographic personas use strictly sanitized placeholders complying with UIDAI & DigiLocker test specifications.
            </p>
          </div>

        </div>

        {/* Right Column: 6 Fast 1-Click Demographic Personas (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {t('login.preverifiedTitle')}
              </h2>
              <p className="text-xs text-slate-500">
                {t('login.preverifiedSubtitle')}
              </p>
            </div>
            <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-full border border-orange-200">
              6 Demo Profiles
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Object.entries(PREBUILT_PERSONAS).map(([key, persona]) => {
              const isActive = activePersonaKey === key;
              const p = persona.profile;

              return (
                <div
                  key={key}
                  onClick={() => handleDirectPersonaSelect(key)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                    isActive
                      ? 'bg-orange-50/60 border-orange-400 shadow-md ring-2 ring-orange-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  {isActive && (
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-600 text-white flex items-center space-x-1">
                      <span>{t('login.activeBadge')}</span>
                    </span>
                  )}

                  <div className="space-y-1.5">
                    <div className="text-xs font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                      {persona.label}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {persona.tag}
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                      <div>State: <span className="font-semibold text-slate-800">{p.state}</span> • Cat: <span className="font-semibold text-slate-800">{p.category}</span></div>
                      <div>Income: <span className="font-semibold text-emerald-700">₹{(p.annual_income || 0).toLocaleString('en-IN')}/yr</span></div>
                      {p.landholding_acres > 0 && (
                        <div>Land: <span className="font-semibold text-slate-800">{p.landholding_acres} Acres</span></div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectPersonaSelect(key);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                      isActive
                        ? 'bg-orange-600 text-white shadow-xs'
                        : 'bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700'
                    }`}
                  >
                    <span>{isActive ? `${t('login.activeBtn')} ➔` : `${t('login.switchBtn')} ➔`}</span>
                  </button>

                </div>
              );
            })}

            {/* User-created Custom Profiles */}
            {customProfiles.map((p) => {
              const isActive = activePersonaKey === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => handleDirectPersonaSelect(p.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-3 relative group ${
                    isActive
                      ? 'bg-amber-50/70 border-amber-500 shadow-md ring-2 ring-amber-400/20'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                  }`}
                >
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-600 text-white flex items-center space-x-1">
                    <span>{isActive ? `${t('login.activeBadge')} (${t('login.customBadge')})` : t('login.customBadge')}</span>
                  </span>

                  <div className="space-y-1.5">
                    <div className="text-xs font-extrabold text-slate-900 group-hover:text-amber-600 transition-colors">
                      👤 {p.name}
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                      {p.occupation || 'Custom Citizen'} • Tailored Profile
                    </div>
                    <div className="text-[11px] text-slate-600 space-y-0.5 font-mono">
                      <div>State: <span className="font-semibold text-slate-800">{p.state}</span> • Cat: <span className="font-semibold text-slate-800">{p.category}</span></div>
                      <div>Income: <span className="font-semibold text-emerald-700">₹{(p.annual_income || 0).toLocaleString('en-IN')}/yr</span></div>
                      {p.landholding_acres > 0 && (
                        <div>Land: <span className="font-semibold text-slate-800">{p.landholding_acres} Acres</span></div>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDirectPersonaSelect(p.id);
                    }}
                    className={`w-full py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-1 ${
                      isActive
                        ? 'bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-100 group-hover:bg-slate-900 group-hover:text-white text-slate-700'
                    }`}
                  >
                    <span>{isActive ? `${t('login.activeBtn')} ➔` : `${t('login.switchBtn')} ➔`}</span>
                  </button>
                </div>
              );
            })}

            {/* + Create Custom Profile Action Card */}
            <div
              onClick={openCreateProfileModal}
              className="p-5 rounded-2xl border-2 border-dashed border-orange-300 hover:border-orange-500 bg-orange-50/40 hover:bg-orange-50 transition-all cursor-pointer flex flex-col items-center justify-center text-center space-y-3 group min-h-[160px]"
              title="Create a new citizen with custom demographics"
            >
              <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center shadow-md shadow-orange-600/25 group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-slate-900 group-hover:text-orange-600 transition-colors">
                  {t('login.addCustomProfile')}
                </div>
                <p className="text-[11px] text-slate-500 max-w-[200px] mt-0.5 leading-snug">
                  Manual Citizen Builder: Name, State, Category, Income & Land
                </p>
              </div>
              <span className="px-3 py-1 rounded-xl bg-white border border-orange-200 text-orange-700 text-[11px] font-bold shadow-xs">
                Open Builder ➔
              </span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
