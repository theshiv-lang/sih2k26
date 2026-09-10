import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import useStore from '../store/useStore';
import { X, Zap, CheckCircle2, ArrowUpRight, ExternalLink, ShieldCheck, Copy, Check, Building } from 'lucide-react';
import { submitSchemeApplication } from '../services/api';
import { getSafePortalUrl } from './SchemeCard';

export default function AutoFillModal() {
  const {
    activeAutofillModal,
    setActiveAutofillModal,
    citizen,
    digilockerData,
    isExtensionActive,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState(null);

  // Reset submission state whenever a new scheme modal is opened
  useEffect(() => {
    setSubmittedAppId(null);
    setIsSubmitting(false);
  }, [activeAutofillModal?.id]);

  if (!activeAutofillModal) return null;

  const scheme = activeAutofillModal;

  const handleSubmitApplication = async () => {
    setIsSubmitting(true);
    try {
      const activeProf = useStore.getState().activeProfile || citizen;
      const res = await submitSchemeApplication(activeProf, scheme);
      if (res && res.success) {
        setSubmittedAppId(res.application_id);
      }
    } catch (e) {
      console.error('[AutoFillModal] Submission error:', e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPayload = () => {
    const payload = {
      fullName: digilockerData?.aadhaar?.full_name || citizen.name,
      aadhaarMasked: digilockerData?.aadhaar?.uid_masked || citizen.aadhaar_number,
      dob: digilockerData?.aadhaar?.date_of_birth || "1994-08-15",
      gender: citizen.gender,
      mobile: citizen.mobile,
      annualIncome: citizen.annual_income,
      category: citizen.category,
      state: citizen.state,
    };
    navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => setActiveAutofillModal(null)}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-400/30 flex items-center justify-center text-orange-600">
            <Zap className="w-6 h-6 fill-orange-500 text-orange-600" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-600">
              Sahayak Auto-Fill Bridge
            </span>
            <h3 className="text-lg font-bold text-slate-900 leading-snug">
              {scheme.title}
            </h3>
          </div>
        </div>

        {/* Status indicator */}
        <div className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between text-xs ${
          isExtensionActive
            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
            : 'bg-amber-50 text-amber-800 border-amber-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-2.5 h-2.5 rounded-full ${isExtensionActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="font-semibold">
              {isExtensionActive ? 'Auto-Fill Payload Dispatched to Extension' : 'Extension Standby (Bridge Broadcast Sent)'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Manifest V3</span>
        </div>

        {/* Payload Preview */}
        <div className="space-y-3 mb-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-700">
              Injectable Field Mappings:
            </span>
            <button
              onClick={handleCopyPayload}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center space-x-1"
            >
              {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3.5 rounded-xl border border-slate-200 font-mono">
            <div>
              <span className="text-slate-400 block text-[10px]">Full Name:</span>
              <span className="text-slate-800 font-semibold">{digilockerData?.aadhaar?.full_name || citizen.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Aadhaar (e-KYC):</span>
              <span className="text-slate-800 font-semibold">{digilockerData?.aadhaar?.uid_masked || citizen.aadhaar_number}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">DOB / Age:</span>
              <span className="text-slate-800 font-semibold">{digilockerData?.aadhaar?.date_of_birth || "1994-08-15"} ({citizen.age}y)</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Annual Income:</span>
              <span className="text-emerald-700 font-semibold">₹{citizen.annual_income.toLocaleString('en-IN')}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">Social Category:</span>
              <span className="text-slate-800 font-semibold">{citizen.category}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px]">State:</span>
              <span className="text-slate-800 font-semibold">{citizen.state}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={handleSubmitApplication}
            disabled={isSubmitting || submittedAppId}
            className={`w-full py-3 px-4 rounded-xl text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2 ${
              submittedAppId
                ? 'bg-emerald-600 hover:bg-emerald-700'
                : 'bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800'
            }`}
          >
            {submittedAppId ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                <span>✓ Application Submitted to Officer Verification Queue</span>
              </>
            ) : isSubmitting ? (
              <span>Submitting to Officer Queue...</span>
            ) : (
              <>
                <Building className="w-4 h-4 text-orange-300" />
                <span>Submit to Official Verification Queue (Realtime)</span>
              </>
            )}
          </button>

          <a
            href={getSafePortalUrl(scheme.portal_url)}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center space-x-2"
          >
            <span>Proceed to Official Application Portal</span>
            <ExternalLink className="w-4 h-4" />
          </a>

          <a
            href="/demo_portal.html"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-all flex items-center justify-center space-x-2"
          >
            <span>🧪 Open Sample Government Form (Test Auto-Fill Live)</span>
            <ArrowUpRight className="w-4 h-4 text-slate-500" />
          </a>
        </div>

      </div>
    </div>
  );
}
