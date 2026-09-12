import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import ChatAssistant from './ChatAssistant';
import { Bot, X, Sparkles, MessageSquare } from 'lucide-react';

export default function AIChatWidget() {
  const { t, i18n } = useTranslation();
  const { language } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  // Allow any CTA or button across the application to trigger opening the chat
  useEffect(() => {
    const handleOpenChat = () => setIsOpen(true);
    window.addEventListener('OPEN_SAHAYAK_AI_CHAT', handleOpenChat);
    return () => window.removeEventListener('OPEN_SAHAYAK_AI_CHAT', handleOpenChat);
  }, []);

  const currentLang = (i18n.language || language || 'en').toUpperCase();

  return (
    <>
      {/* Floating Launcher Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`relative p-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center group ${
            isOpen
              ? 'bg-slate-900 text-white hover:bg-slate-800 rotate-90 scale-95'
              : 'bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-600 text-white hover:scale-105 shadow-orange-500/30'
          }`}
          title={isOpen ? t('common.close') : t('schemes.aiGuide')}
          aria-label="Toggle Sahayak AI Assistant"
        >
          {isOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <>
              <Bot className="w-6 h-6 relative z-10" />
              {/* Pulsing indicator badge */}
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-white"></span>
              </span>
            </>
          )}
        </button>
      </div>

      {/* Slide-Up Chat Drawer / Mobile Sticky Bottom-Sheet */}
      {isOpen && (
        <div className="fixed inset-x-0 bottom-0 sm:inset-auto sm:bottom-24 sm:right-6 w-full sm:w-[420px] h-[85vh] sm:h-[640px] max-h-[92vh] sm:max-h-[640px] z-50 bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border-t sm:border border-slate-200 flex flex-col overflow-hidden animate-slide-up font-sans">
          
          {/* Drawer Header */}
          <div className="px-4 py-2.5 sm:py-3 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white border-b border-slate-700">
            {/* Mobile Drag Notch Handle */}
            <div className="w-10 h-1 rounded-full bg-slate-500/60 mx-auto mb-2 sm:hidden" />
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-sm shadow-orange-500/30">
                  <Bot className="w-4 h-4" />
                </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold leading-tight">{t('schemes.aiGuide')}</h3>
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    {currentLang}
                  </span>
                </div>
                <p className="text-[10px] text-slate-400">{t('schemes.bhashiniSub')}</p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
              title={t('common.close')}
            >
              <X className="w-4 h-4" />
            </button>
            </div>
          </div>

          {/* Embedded Full ChatAssistant Component */}
          <div className="flex-1 overflow-hidden">
            <ChatAssistant />
          </div>

        </div>
      )}
    </>
  );
}
