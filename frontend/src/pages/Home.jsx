import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import AIChatWidget from '../components/AIChatWidget';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Bot,
  Building,
  CheckCircle2,
  Users,
  Search,
  ExternalLink,
  Lock,
  Layers,
  FileCheck,
  Check,
  ChevronRight,
  Award
} from 'lucide-react';

export default function Home() {
  const { t } = useTranslation();
  const { citizen, language } = useApp();
  const isHindi = (language || '').startsWith('hi');

  const POPULAR_SCHEMES = [
    {
      id: "pm-kisan",
      title: "PM-Kisan Samman Nidhi",
      category: "Agriculture",
      benefit: "₹6,000 / Year (Direct DBT)",
      ministry: "Ministry of Agriculture & Farmers Welfare",
      portal: "https://pmkisan.gov.in/",
      tag: "Small & Marginal Farmers"
    },
    {
      id: "nsp-scholarship",
      title: "National Scholarship Portal (Post-Matric)",
      category: "Education",
      benefit: "Full Tuition + ₹1,200/mo Maintenance",
      ministry: "Ministry of Social Justice & Empowerment",
      portal: "https://scholarships.gov.in/",
      tag: "College & Higher Education"
    },
    {
      id: "ssy-sukanya",
      title: "Sukanya Samriddhi Yojana (SSY)",
      category: "Women & Child",
      benefit: "8.2% Tax-Free Sovereign Return",
      ministry: "Department of Posts / MoF",
      portal: "https://www.indiapost.gov.in/",
      tag: "Girl Child Up to 10 Years"
    },
    {
      id: "standup-india",
      title: "Stand-Up India Scheme",
      category: "Business",
      benefit: "₹10 Lakh to ₹1 Crore Bank Loan",
      ministry: "Department of Financial Services",
      portal: "https://www.standupmitra.in/",
      tag: "SC/ST & Women Entrepreneurs"
    },
    {
      id: "pmjay-ayushman",
      title: "Ayushman Bharat (PM-JAY)",
      category: "Healthcare",
      benefit: "₹5,00,000 Cashless Cover / Year",
      ministry: "National Health Authority",
      portal: "https://nha.gov.in/",
      tag: "Universal Hospitalization"
    },
    {
      id: "pmay-gramin",
      title: "Pradhan Mantri Awas Yojana (PMAY-G)",
      category: "Housing",
      benefit: "₹1,20,000 Direct Housing Grant",
      ministry: "Ministry of Rural Development",
      portal: "https://pmayg.nic.in/",
      tag: "Pucca House Construction"
    }
  ];

  return (
    <div className="space-y-12 pb-16 pt-4 sm:pt-6">
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            
            {/* National Badge */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-200 text-orange-800 text-xs font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              <span>{t('home.badge')}</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.15]">
              {t('home.headlinePre')}{' '}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500">
                {t('home.headlineHighlight')}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
              {t('home.subtitle')}
            </p>

            {/* Primary Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-4">
              <Link
                to="/login"
                className="w-full sm:w-auto min-h-[48px] px-8 py-3.5 rounded-2xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-bold text-base sm:text-sm shadow-lg shadow-orange-600/25 hover:shadow-orange-600/35 transition-all flex items-center justify-center space-x-2"
              >
                <span>{t('home.findSchemesBtn')}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <Link
                to="/officer"
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base sm:text-sm shadow-md transition-all border border-slate-700 flex items-center justify-center space-x-2"
              >
                <Building className="w-4 h-4 text-orange-400" />
                <span>{t('home.officerPortalBtn')}</span>
              </Link>
            </div>

            {/* Active Citizen Context Reminder */}
            <p className="text-xs text-slate-400 pt-2">
              {t('home.simulating')} <strong className="text-slate-700">{citizen.name}</strong> ({citizen.occupation} • {citizen.state}) • <Link to="/login" className="text-orange-600 underline hover:text-orange-700">{t('home.switchPersona')}</Link>
            </p>

          </div>
        </div>
      </section>

      {/* Metric Counters Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          
          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">{t('home.stats.schemesCount')}</div>
            <div className="text-xs font-bold text-orange-600 mt-1 uppercase tracking-wider">{t('home.stats.schemesLabel')}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t('home.stats.schemesSub')}</div>
          </div>

          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">{t('home.stats.speedCount')}</div>
            <div className="text-xs font-bold text-emerald-600 mt-1 uppercase tracking-wider">{t('home.stats.speedLabel')}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t('home.stats.speedSub')}</div>
          </div>

          <div className="text-center p-3 border-r border-slate-100 last:border-0">
            <div className="text-2xl sm:text-3xl font-black text-blue-700 font-mono">{t('home.stats.privacyCount')}</div>
            <div className="text-xs font-bold text-blue-600 mt-1 uppercase tracking-wider">{t('home.stats.privacyLabel')}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t('home.stats.privacySub')}</div>
          </div>

          <div className="text-center p-3">
            <div className="text-2xl sm:text-3xl font-black text-purple-700 font-mono">{t('home.stats.personasCount')}</div>
            <div className="text-xs font-bold text-purple-600 mt-1 uppercase tracking-wider">{t('home.stats.personasLabel')}</div>
            <div className="text-[11px] text-slate-400 mt-0.5">{t('home.stats.personasSub')}</div>
          </div>

        </div>
      </section>

      {/* Core Feature Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {t('home.pillarsTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {t('home.pillarsSubtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Feature 1 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('home.feature1Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.feature1Desc')}
            </p>
            <div className="pt-2">
              <Link to="/schemes" className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center space-x-1">
                <span>{t('home.feature1Link')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('home.feature2Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.feature2Desc')}
            </p>
            <div className="pt-2">
              <Link to="/vault" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1">
                <span>{t('home.feature2Link')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('home.feature3Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.feature3Desc')}
            </p>
            <div className="pt-2">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('OPEN_SAHAYAK_AI_CHAT'))}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center space-x-1 cursor-pointer"
                title="Open Sahayak Bhashini AI Assistant"
              >
                <span>{t('home.feature3Link')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">{t('home.feature4Title')}</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {t('home.feature4Desc')}
            </p>
            <div className="pt-2">
              <Link to="/officer" className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center space-x-1">
                <span>{t('home.feature4Link')}</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* Popular Schemes Showcase Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              {t('home.popularTitle')}
            </h2>
            <p className="text-xs text-slate-500">
              {t('home.popularSubtitle')}
            </p>
          </div>
          <Link
            to="/schemes"
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold shadow-sm transition-all flex items-center space-x-1.5 self-start sm:self-auto"
          >
            <span>{t('home.exploreAllBtn')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {POPULAR_SCHEMES.map((scheme) => (
            <div
              key={scheme.id}
              className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-orange-700 bg-orange-50 px-2.5 py-0.5 rounded-full border border-orange-200">
                    {t(scheme.category)}
                  </span>
                  <span className="text-[10px] text-slate-500 font-medium">
                    {t(scheme.tag)}
                  </span>
                </div>
                <h3 className="text-sm font-extrabold text-slate-900 leading-snug">
                  {t(scheme.title)}
                </h3>
                <p className="text-[11px] text-slate-500">
                  {t(scheme.ministry)}
                </p>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold font-mono">
                  {t('Benefit')}: {t(scheme.benefit)}
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                <a
                  href={scheme.portal}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 flex items-center space-x-1"
                >
                  <span>{t('Portal')}</span>
                  <ExternalLink className="w-3 h-3" />
                </a>

                <Link
                  to="/schemes"
                  className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all flex items-center space-x-1"
                >
                  <span>{t('Check Eligibility')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Step Walkthrough */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white shadow-xl space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Get Started in 3 Simple Steps
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Zero complicated paperwork. Discover schemes tailored to your exact demographic credentials.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-base font-bold text-white">Select Demographic Persona</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Choose from our 6 prebuilt demo personas (Farmer, Student, Widow, etc.) or connect simulated DigiLocker credentials.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-full bg-amber-600 text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-base font-bold text-white">Instant &lt;10ms Matching</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Our Rust Axum backend evaluates 4,770+ welfare schemes instantly against your demographic rules and criteria.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 p-6 rounded-2xl space-y-3">
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-base font-bold text-white">1-Click Auto-Fill Application</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Submit directly to the official portal with zero typing, routed simultaneously to the live officer verification desk.
              </p>
            </div>

          </div>

          <div className="text-center pt-4">
            <Link
              to="/login"
              className="inline-flex items-center space-x-2 px-8 py-3.5 rounded-2xl bg-orange-600 hover:bg-orange-700 text-white text-sm font-bold shadow-lg shadow-orange-600/30 transition-all"
            >
              <span>Launch Citizen Persona Simulator</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Floating Global Bhashini AI Assistant Widget */}
      <AIChatWidget />

    </div>
  );
}
