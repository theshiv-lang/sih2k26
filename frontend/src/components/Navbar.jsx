import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import useStore from '../store/useStore';
import { ShieldCheck, Globe, CheckCircle2, ChevronDown, User, Building, Layers, Sparkles, FolderLock, LogIn, Edit3 } from 'lucide-react';
import { LANGUAGE_CONFIG } from '../services/bhashini';

export default function Navbar() {
  const { t, i18n } = useTranslation();
  const {
    citizen,
    isExtensionActive,
    language,
    setLanguage,
  } = useApp();

  const { openEditProfileModal } = useStore();

  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const currentLangObj = LANGUAGE_CONFIG[language] || LANGUAGE_CONFIG.en;

  const navLinkClass = ({ isActive }) =>
    `px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 ${
      isActive
        ? 'bg-orange-50 text-orange-700 font-bold border border-orange-200 shadow-xs'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Left: Sahayak Emblem / Logo */}
          <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
              <span className="text-xl font-bold font-serif">सं</span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900">
                  Sahayak <span className="text-orange-600 font-serif">सहायक</span>
                </span>
                <span className="hidden lg:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  {t('nav.badge')}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {t('nav.subtitle')}
              </p>
            </div>
          </Link>

          {/* Center: Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-slate-50 p-1 rounded-2xl border border-slate-200/80">
            <NavLink to="/" end className={navLinkClass}>
              <span>{t('nav.home')}</span>
            </NavLink>
            <NavLink to="/schemes" className={navLinkClass}>
              <Layers className="w-3.5 h-3.5" />
              <span>{t('nav.schemes')}</span>
            </NavLink>
            <NavLink to="/vault" className={navLinkClass}>
              <FolderLock className="w-3.5 h-3.5" />
              <span>{t('nav.vault')}</span>
            </NavLink>
            <NavLink to="/login" className={navLinkClass}>
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('nav.login')}</span>
            </NavLink>
          </nav>

          {/* Right: Persona Pill, Officer Desk, Extension & Lang Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            
            {/* Active Persona Pill */}
            <div className="flex items-center space-x-1">
              <Link
                to="/login"
                className="flex items-center space-x-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 transition-all text-left group"
                title="Switch Demographic Persona / Authenticate"
              >
                <div className="w-7 h-7 rounded-lg bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs group-hover:bg-orange-200 transition-colors">
                  {citizen?.name?.charAt(0) || 'C'}
                </div>
                <div className="hidden lg:block text-left pr-1">
                  <p className="text-xs font-bold text-slate-900 leading-tight truncate max-w-[120px]">
                    {citizen?.name || 'Citizen'}
                  </p>
                  <div className="flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    <p className="text-[10px] text-slate-500 font-medium">
                      {citizen?.occupation || 'Citizen'}
                    </p>
                  </div>
                </div>
              </Link>

              <button
                onClick={openEditProfileModal}
                className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 text-slate-600 hover:text-orange-700 transition-all flex items-center space-x-1 text-xs font-bold shadow-2xs flex-shrink-0"
                title="Edit Active Citizen Profile Attributes"
              >
                <Edit3 className="w-3.5 h-3.5 text-orange-600" />
                <span className="hidden xl:inline">{t('nav.edit')}</span>
              </button>
            </div>

            {/* Officer Desk Button */}
            <Link
              to="/officer"
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all border border-slate-700 flex-shrink-0"
              title="Open Official District Verification Desk"
            >
              <Building className="w-3.5 h-3.5 text-orange-400" />
              <span className="hidden sm:inline">{t('nav.officerDesk')}</span>
              <span className="sm:hidden">{t('nav.desk')}</span>
            </Link>

            {/* Chrome Extension Status */}
            <div
              className={`hidden sm:flex items-center space-x-1 px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                isExtensionActive
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
              title={
                isExtensionActive
                  ? 'Sahayak Auto-Fill Extension Linked & Ready'
                  : 'Extension bridge ready. Load /extension in Chrome'
              }
            >
              <span className={`w-2 h-2 rounded-full ${isExtensionActive ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden xl:inline">
                {isExtensionActive ? t('nav.extensionLinked') : t('nav.extensionReady')}
              </span>
            </div>

            {/* Language Selector Dropdown */}
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-800 transition-all"
                title="Change Platform Language"
              >
                <Globe className="w-3.5 h-3.5 text-slate-600" />
                <span>{currentLangObj.name ? currentLangObj.name.split(' ')[0] : currentLangObj.code.toUpperCase()}</span>
                <ChevronDown className="w-3 h-3 text-slate-500" />
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-50 animate-fade-in">
                  <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 mb-1">
                    {t('nav.bhashiniLanguages')}
                  </div>
                  {Object.values(LANGUAGE_CONFIG).map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        i18n.changeLanguage(lang.code);
                        if (typeof window !== 'undefined') {
                          localStorage.setItem('sahayak_language', lang.code);
                        }
                        setLanguage(lang.code);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-50 transition-all ${
                        language === lang.code ? 'font-bold text-orange-600 bg-orange-50/60' : 'text-slate-700'
                      }`}
                    >
                      <span>{lang.name}</span>
                      {language === lang.code && <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

        {/* Mobile Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs font-semibold">
          <NavLink to="/" end className={navLinkClass}>{t('nav.home')}</NavLink>
          <NavLink to="/schemes" className={navLinkClass}>{t('nav.schemes')}</NavLink>
          <NavLink to="/vault" className={navLinkClass}>{t('nav.vault')}</NavLink>
          <NavLink to="/login" className={navLinkClass}>{t('nav.login')}</NavLink>
        </div>

      </div>
    </header>
  );
}
