import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CheckCircle2, XCircle, AlertCircle, ExternalLink, Zap, ChevronDown, ChevronUp, FileText, Sparkles } from 'lucide-react';

export const getSafePortalUrl = (url) => {
  if (!url || typeof url !== 'string') return 'https://www.myscheme.gov.in/';
  const trimmed = url.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
};

export default function SchemeCard({ matchResult, matchItem }) {
  const result = matchResult || matchItem || {};
  const {
    scheme = {},
    is_eligible = false,
    match_score = 0,
    satisfied_rules = [],
    unmet_rules = [],
    recommendations = '',
  } = result;
  const { handleTriggerAutoFill, language } = useApp();
  const [detailsOpen, setDetailsOpen] = useState(false);

  const isHindi = (language || '').startsWith('hi');

  const getBadgeColor = () => {
    if (is_eligible) {
      return 'bg-emerald-50 text-emerald-800 border-emerald-300';
    }
    if (match_score >= 60) {
      return 'bg-amber-50 text-amber-800 border-amber-300';
    }
    return 'bg-slate-100 text-slate-700 border-slate-300';
  };

  return (
    <div className={`rounded-2xl border transition-all duration-200 hover:shadow-md bg-white overflow-hidden ${
      is_eligible ? 'border-emerald-200 ring-1 ring-emerald-100' : 'border-slate-200'
    }`}>
      
      {/* Top Banner */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-3">
          
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                {scheme.category}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-50 text-slate-500 border border-slate-200">
                {isHindi ? `${scheme.level === 'Central' ? 'केंद्रीय' : 'राज्य'} योजना` : `${scheme.level} Scheme`}
              </span>
            </div>
            
            <h3 className="text-base font-bold text-slate-900 leading-snug">
              {scheme.title}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
              {scheme.ministry}
            </p>
          </div>

          {/* Match Score Gauge */}
          <div className="flex flex-col items-end flex-shrink-0">
            <div className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-extrabold border ${getBadgeColor()}`}>
              {is_eligible ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
              )}
              <span>{match_score}% {isHindi ? 'पात्रता' : 'Match'}</span>
            </div>
            <span className="text-[10px] font-medium text-slate-400 mt-1">
              {is_eligible ? (isHindi ? '100% पात्र' : '100% Eligible') : (isHindi ? 'शर्तें लंबित' : 'Criteria Pending')}
            </span>
          </div>

        </div>

        {/* Short Description */}
        <p className="text-xs text-slate-600 leading-relaxed line-clamp-2 mb-4">
          {scheme.short_description}
        </p>

        {/* Benefit Highlight Box */}
        <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/50 to-orange-50/40 p-3 rounded-xl border border-orange-200/70 mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
              ₹
            </div>
            <div>
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider block">
                {isHindi ? 'प्रत्यक्ष वित्तीय लाभ' : 'Direct Financial Benefit'}
              </span>
              <span className="text-sm font-extrabold text-orange-950">
                {scheme.financial_benefit}
              </span>
            </div>
          </div>
          <Sparkles className="w-4 h-4 text-orange-400" />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleTriggerAutoFill(scheme)}
            className="flex-1 px-4 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-md shadow-orange-600/20 hover:shadow-orange-600/30 transition-all flex items-center justify-center space-x-1.5 group"
          >
            <Zap className="w-4 h-4 fill-white group-hover:scale-110 transition-transform" />
            <span>{isHindi ? '⚡ आवेदन स्वतः भरें' : '⚡ Auto-Fill Application'}</span>
          </button>

          <a
            href={getSafePortalUrl(scheme.portal_url)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="px-3 py-2.5 rounded-xl bg-slate-100 hover:bg-orange-50 hover:border-orange-200 border border-slate-200 text-slate-700 hover:text-orange-700 text-xs font-bold transition-all flex items-center justify-center space-x-1"
            title={isHindi ? "आधिकारिक सरकारी पोर्टल खोलें" : "Open Official Government Portal"}
          >
            <span>{isHindi ? 'पोर्टल देखें' : 'Visit Portal'}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => setDetailsOpen(!detailsOpen)}
            className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
            title={isHindi ? "पात्रता विवरण देखें" : "Toggle Eligibility Breakdown"}
          >
            {detailsOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

      </div>

      {/* Expandable Criteria Breakdown */}
      {detailsOpen && (
        <div className="p-4 bg-slate-50 border-t border-slate-200 space-y-3 text-xs">
          
          {/* Recommendation */}
          {recommendations && (
            <div className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-700">
              <span className="font-semibold text-slate-900 block mb-0.5">
                💡 {isHindi ? 'सहायक सलाह:' : 'Sahayak Advisory:'}
              </span>
              <span>{recommendations}</span>
            </div>
          )}

          {/* Satisfied Rules */}
          {(satisfied_rules || []).length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 block mb-1">
                {isHindi ? 'संतुष्ट पात्रता शर्तें:' : 'Satisfied Criteria:'}
              </span>
              <ul className="space-y-1">
                {(satisfied_rules || []).map((rule, idx) => (
                  <li key={idx} className="flex items-center space-x-1.5 text-slate-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Unmet Rules */}
          {(unmet_rules || []).length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-rose-700 block mb-1">
                {isHindi ? 'अपूर्ण आवश्यकताएं:' : 'Missing Requirements:'}
              </span>
              <ul className="space-y-1">
                {(unmet_rules || []).map((rule, idx) => (
                  <li key={idx} className="flex items-center space-x-1.5 text-slate-700">
                    <XCircle className="w-3.5 h-3.5 text-rose-600 flex-shrink-0" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Required Documents */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              {isHindi ? 'आवश्यक दस्तावेज:' : 'Required Documents:'}
            </span>
            <div className="flex flex-wrap gap-1">
              {(scheme?.required_documents || []).map((doc, idx) => (
                <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] text-slate-600">
                  <FileText className="w-2.5 h-2.5 mr-1 text-slate-400" />
                  {doc}
                </span>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
