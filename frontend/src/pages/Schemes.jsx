import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import useStore from '../store/useStore';
import SchemeCard from '../components/SchemeCard';

const PAGE_SIZE = 12;
import AIChatWidget from '../components/AIChatWidget';
import {
  Search,
  CheckCircle2,
  RefreshCw,
  Sparkles,
  Layers,
  User,
  Sliders,
  Bot,
  X,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  ExternalLink
} from 'lucide-react';

const CATEGORIES = [
  { id: "All", en: "All Schemes", hi: "सभी योजनाएं" },
  { id: "Agriculture, Rural & Environment", en: "Agriculture & Rural", hi: "कृषि एवं ग्रामीण" },
  { id: "Education & Learning", en: "Education & Learning", hi: "शिक्षा एवं छात्रवृत्ति" },
  { id: "Women and Child", en: "Women & Child", hi: "महिला एवं बाल विकास" },
  { id: "Social Welfare & Empowerment", en: "Social Welfare & Seniors", hi: "सामाजिक कल्याण एवं पेंशन" },
  { id: "Health & Wellness", en: "Health & Wellness", hi: "स्वास्थ्य एवं आयुष्मान" },
  { id: "Business & Entrepreneurship", en: "Business & Startup", hi: "उद्यम एवं मुद्रा ऋण" },
  { id: "Housing & Shelter", en: "Housing & Shelter", hi: "आवास एवं ग्रामीण घर" },
  { id: "Universal Discovery", en: "myScheme Universal", hi: "सार्वभौमिक योजनाएं" },
];

export default function Schemes() {
  const { t } = useTranslation();
  const appContext = useApp();
  const store = useStore();

  // Read with defensive fallbacks between Context and Zustand store
  const schemes = (appContext?.schemes && appContext.schemes.length > 0) ? appContext.schemes : (store?.schemes || []);
  const citizen = appContext?.citizen || store?.citizen || {};
  const eligibleCount = appContext?.eligibleCount ?? store?.eligibleCount ?? 0;
  const selectedCategory = appContext?.selectedCategory || store?.selectedCategory || "All";
  const setSelectedCategory = appContext?.setSelectedCategory || store?.setState;
  const isMatchingLoading = appContext?.isMatchingLoading ?? store?.isMatchingLoading ?? false;
  const runSchemeMatching = appContext?.runSchemeMatching || store?.evaluateSchemes;
  const language = appContext?.language || store?.currentLanguage || 'en';

  const [searchQuery, setSearchQuery] = useState('');
  const [onlyEligible, setOnlyEligible] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  // Reset pagination to first chunk whenever search, category, or eligibility filter updates
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedCategory, onlyEligible]);

  const isHindi = (language || '').startsWith('hi');

  const filteredSchemes = (schemes || []).filter((item) => {
    if (!item) return false;
    const s = item.scheme || item;
    const title = s?.title || '';
    const desc = s?.short_description || '';
    const cat = s?.category || '';
    const min = s?.ministry || '';
    const q = (searchQuery || '').toLowerCase();

    const matchesSearch =
      title.toLowerCase().includes(q) ||
      desc.toLowerCase().includes(q) ||
      cat.toLowerCase().includes(q) ||
      min.toLowerCase().includes(q);

    const matchesEligibility = onlyEligible ? (item.is_eligible ?? true) : true;
    return matchesSearch && matchesEligibility;
  });

  return (
    <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* 1. Active Citizen Context & Persona Banner */}
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50/50 p-4 sm:p-5 rounded-3xl border border-orange-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-bold text-lg shadow-md shadow-orange-600/20 flex-shrink-0">
            {citizen?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                {citizen?.name || 'Citizen Profile'}
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-orange-100 text-orange-800 border border-orange-300">
                {citizen?.occupation || 'General'}
              </span>
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                <span>DigiLocker Verified</span>
              </span>
            </div>
            
            <p className="text-xs text-slate-600 font-mono mt-0.5">
              {citizen?.state || 'India'} • Cat: {citizen?.category || 'General'} • Income: ₹{(citizen?.annual_income || 0).toLocaleString('en-IN')}/yr
              {(citizen?.landholding_acres || 0) > 0 && ` • Land: ${citizen.landholding_acres} Acres`}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 self-start md:self-auto">
          <Link
            to="/login"
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold border border-slate-200 shadow-xs transition-all flex items-center space-x-1.5"
          >
            <User className="w-3.5 h-3.5 text-slate-500" />
            <span>Switch Persona</span>
          </Link>

          <button
            onClick={() => store?.openEditProfileModal?.()}
            className="px-3.5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
            title="Edit Active Citizen Attributes"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Edit Profile</span>
          </button>
        </div>

      </div>

      {/* 2. Search & Category Filter Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-sm space-y-3.5">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('schemes.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 focus:bg-white text-xs rounded-xl border border-slate-200 focus:border-slate-300 focus:outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Filter Toggles */}
          <div className="flex items-center space-x-2 flex-shrink-0">
            
            <button
              onClick={() => setOnlyEligible(!onlyEligible)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center space-x-1.5 ${
                onlyEligible
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('schemes.onlyEligible')}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${onlyEligible ? 'bg-emerald-700 text-white' : 'bg-slate-200 text-slate-700'}`}>
                {eligibleCount}
              </span>
            </button>

            <button
              onClick={() => runSchemeMatching?.(citizen, selectedCategory, language)}
              disabled={isMatchingLoading}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition-all"
              title="Refresh Scheme Matches"
            >
              <RefreshCw className={`w-4 h-4 ${isMatchingLoading ? 'animate-spin text-orange-600' : ''}`} />
            </button>

          </div>

        </div>

        {/* Category Pill Tabs */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-slate-900 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {isHindi ? cat.hi : cat.en}
            </button>
          ))}
        </div>

      </div>

      {/* 3. Scheme Cards Catalog Grid (Full-Width Responsive) */}
      <div className="space-y-4">
        
        <div className="flex items-center justify-between text-xs text-slate-500 px-1">
          <span>
            {t('schemes.showing')}{' '}
            <strong className="text-slate-900">{Math.min(visibleCount, filteredSchemes.length)}</strong>{' '}
            {t('schemes.of')}{' '}
            <strong className="text-slate-900">{filteredSchemes.length}</strong>{' '}
            {t('schemes.welfareSchemes')}
          </span>
          {onlyEligible && (
            <span className="text-emerald-700 font-bold">
              {t('schemes.filteredEligible')} {citizen?.name || 'You'}
            </span>
          )}
        </div>

        {isMatchingLoading ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-600 animate-spin mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              {t('schemes.evaluating')}
            </p>
            <p className="text-xs text-slate-400">
              {t('schemes.processingFor')} {citizen?.name || 'Citizen'} ({citizen?.occupation || 'Resident'})
            </p>
          </div>
        ) : filteredSchemes.length === 0 ? (
          <div className="p-16 text-center bg-white rounded-3xl border border-dashed border-slate-200 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-700">{t('schemes.noSchemesTitle')}</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {t('schemes.noSchemesDesc')}
            </p>
            <button
              onClick={() => { setSearchQuery(''); setOnlyEligible(false); setSelectedCategory('All'); }}
              className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              {t('schemes.resetFilters')}
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-stretch">
              {filteredSchemes.slice(0, visibleCount).map((matchItem, idx) => (
                <SchemeCard
                  key={matchItem?.scheme?.id || matchItem?.id || idx}
                  matchResult={matchItem}
                  matchItem={matchItem}
                />
              ))}
            </div>

            {visibleCount < filteredSchemes.length && (
              <div className="pt-2 pb-4 text-center">
                <button
                  onClick={() => setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredSchemes.length))}
                  className="px-6 py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold border border-slate-200 shadow-xs hover:border-slate-300 transition-all inline-flex items-center space-x-2"
                >
                  <span>
                    {t('schemes.loadMore')} ({filteredSchemes.length - visibleCount} {t('schemes.remaining')})
                  </span>
                  <ChevronRight className="w-4 h-4 text-orange-600" />
                </button>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Floating Global Bhashini AI Assistant Widget */}
      <AIChatWidget />

    </div>
  );
}
