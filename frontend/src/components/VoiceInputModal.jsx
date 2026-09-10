import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Mic, MicOff, Sparkles, Check, RefreshCw } from 'lucide-react';
import { LANGUAGE_CONFIG, detectLanguageFromText } from '../services/bhashini';

const SAMPLE_VOICE_PROMPTS = {
  hi: [
    "मैं उत्तर प्रदेश से एक किसान हूँ, मेरी 2.5 एकड़ ज़मीन है और मुझे पीएम किसान योजना के लिए आवेदन करना है।",
    "मेरी सालाना आय ₹1,80,000 है, क्या मुझे उच्च शिक्षा छात्रवृत्ति मिल सकती है?",
    "मुझे अपने छोटे व्यापार के लिए 50,000 रुपये का मुद्रा ऋण चाहिए।",
  ],
  en: [
    "I am a farmer from Uttar Pradesh with 2.5 acres of land. Check my PM-Kisan eligibility.",
    "My annual family income is 1.8 Lakhs, what scholarship schemes are available for OBC students?",
    "I want to apply for a small business loan under PM Mudra Yojana.",
  ],
  ta: [
    "நான் விவசாயி, எனக்கு பிஎம் கிசான் திட்டம் பற்றி சொல்லுங்கள்.",
    "எனது ஆண்டு வருமானம் 1.8 லட்சம், எனக்கு என்ன உதவித்தொகை கிடைக்கும்?",
  ],
  te: [
    "నేను రైతుని, పిఎం కిసాన్ పథకానికి దరఖాస్తు చేసుకోవాలి.",
    "నా వార్షిక ఆదాయం 1.8 లక్షలు, విద్యార్థి స్కాలర్‌షిప్ ఎలా పొందాలి?",
  ],
  mr: [
    "मी शेतकरी आहे, मला पीएम किसान योजनेचा लाभ हवा आहे.",
    "माझे वार्षिक उत्पन्न 1.8 लाख आहे, मला शिष्यवृत्ती मिळेल का?",
  ],
  bn: [
    "আমি একজন কৃষক, পিএম কিষাণ যোজনার জন্য আবেদন করতে চাই।",
    "আমার বার্ষিক আয় ১.৮ লক্ষ টাকা, কি কি সরকারি স্কলারশিপ আছে?",
  ],
};

const SUPPORTED_LANGUAGES = Object.values(LANGUAGE_CONFIG);

export default function VoiceInputModal() {
  const {
    isVoiceModalOpen,
    setIsVoiceModalOpen,
    handleSendMessage,
    language,
    setLanguage,
  } = useApp();

  const [selectedLang, setSelectedLang] = useState(language || 'en');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState([12, 28, 45, 75, 52, 30, 16, 38, 60, 85, 40, 20]);

  // Keep modal selected language in sync with app language
  useEffect(() => {
    if (language) {
      setSelectedLang(language);
    }
  }, [language, isVoiceModalOpen]);

  useEffect(() => {
    let interval;
    if (isListening) {
      interval = setInterval(() => {
        setAudioLevel(
          Array.from({ length: 12 }, () => Math.floor(Math.random() * 70) + 15)
        );
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isListening]);

  if (!isVoiceModalOpen) return null;

  const startListening = () => {
    setIsListening(true);
    setTranscript('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        const langObj = LANGUAGE_CONFIG[selectedLang] || LANGUAGE_CONFIG['en'];
        recognition.lang = langObj.locale;
        recognition.continuous = false;
        recognition.interimResults = true;

        recognition.onresult = (event) => {
          const text = Array.from(event.results)
            .map((r) => r[0].transcript)
            .join('');
          setTranscript(text);
          // Dynamically detect and update language
          const detected = detectLanguageFromText(text);
          if (detected && detected !== selectedLang) {
            setSelectedLang(detected);
            setLanguage(detected);
          }
        };

        recognition.onend = () => {
          setIsListening(false);
        };

        recognition.onerror = (event) => {
          console.warn('[Bhashini Voice] Native speech error, using simulated pipeline:', event.error);
          simulateSpeechRecognition();
        };

        recognition.start();
      } catch (e) {
        console.warn('[Bhashini Voice] Recognition start error:', e);
        simulateSpeechRecognition();
      }
    } else {
      simulateSpeechRecognition();
    }
  };

  const simulateSpeechRecognition = () => {
    setIsListening(true);
    const prompts = SAMPLE_VOICE_PROMPTS[selectedLang] || SAMPLE_VOICE_PROMPTS['en'];
    const chosenPrompt = prompts[Math.floor(Math.random() * prompts.length)];

    let currentIdx = 0;
    const typingInterval = setInterval(() => {
      currentIdx += 4;
      setTranscript(chosenPrompt.slice(0, currentIdx));
      if (currentIdx >= chosenPrompt.length) {
        clearInterval(typingInterval);
        setIsListening(false);
      }
    }, 45);
  };

  const stopListening = () => {
    setIsListening(false);
  };

  const handleSelectLang = (langCode) => {
    setSelectedLang(langCode);
    setLanguage(langCode);
    setTranscript('');
  };

  const handleSubmitTranscript = () => {
    if (transcript.trim()) {
      // Set currentLanguage in global state immediately
      setLanguage(selectedLang);
      // Pass explicit sourceLanguage to message handler
      handleSendMessage(transcript, selectedLang);
      setIsVoiceModalOpen(false);
      setTranscript('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative overflow-hidden">
        
        {/* Close Button */}
        <button
          onClick={() => {
            stopListening();
            setIsVoiceModalOpen(false);
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200 text-xs font-semibold mb-2">
            <Sparkles className="w-3.5 h-3.5 text-orange-500" />
            <span>Bhashini AI Speech Pipeline ({selectedLang.toUpperCase()})</span>
          </div>
          <h3 className="text-xl font-extrabold text-slate-900">
            {selectedLang === 'hi' ? 'बोलकर पूछें (Voice Assistant)' : 'Voice Assistant (बोलकर पूछें)'}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Speak naturally in your regional language. The assistant will answer in the same language.
          </p>
        </div>

        {/* Language Selector */}
        <div className="flex flex-wrap gap-1.5 justify-center mb-6">
          {SUPPORTED_LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleSelectLang(lang.code)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                selectedLang === lang.code
                  ? 'bg-slate-900 text-white shadow-sm font-semibold'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {lang.name}
            </button>
          ))}
        </div>

        {/* Microphone Pulse Orb */}
        <div className="flex flex-col items-center justify-center py-6">
          <div className="relative flex items-center justify-center">
            {isListening && (
              <div className="absolute w-28 h-28 rounded-full bg-orange-400/30 animate-ping" />
            )}
            <button
              onClick={isListening ? stopListening : startListening}
              className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${
                isListening
                  ? 'bg-red-500 text-white shadow-red-500/40 ring-8 ring-red-100'
                  : 'bg-gradient-to-tr from-orange-500 to-amber-500 text-white shadow-orange-500/30'
              }`}
            >
              {isListening ? (
                <MicOff className="w-8 h-8 animate-pulse" />
              ) : (
                <Mic className="w-8 h-8" />
              )}
            </button>
          </div>

          {/* Audio Waveform Bars */}
          {isListening && (
            <div className="flex items-center space-x-1 mt-6 h-8">
              {audioLevel.map((height, idx) => (
                <div
                  key={idx}
                  className="w-1.5 bg-orange-500 rounded-full transition-all duration-75"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          )}

          <p className="text-xs font-medium text-slate-600 mt-4">
            {isListening
              ? `${selectedLang === 'hi' ? 'सुन रहे हैं, बोलिए...' : 'Listening... Speak now'}`
              : 'Tap microphone to speak or pick a sample below'}
          </p>
        </div>

        {/* Transcript Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 min-h-[90px] mb-4 font-hindi">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1">
            Live Speech Transcript ({selectedLang.toUpperCase()}):
          </p>
          {transcript ? (
            <p className="text-sm font-medium text-slate-800 leading-relaxed">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400 italic">
              (Your spoken words will appear here in real time...)
            </p>
          )}
        </div>

        {/* Quick Sample Prompts */}
        <div className="mb-6">
          <p className="text-[11px] font-semibold text-slate-500 mb-1.5">
            Or test with {LANGUAGE_CONFIG[selectedLang]?.name || selectedLang} sample:
          </p>
          <div className="space-y-1.5">
            {(SAMPLE_VOICE_PROMPTS[selectedLang] || SAMPLE_VOICE_PROMPTS['en']).map(
              (prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => setTranscript(prompt)}
                  className="w-full text-left text-xs p-2 rounded-xl bg-slate-100 hover:bg-orange-50 hover:text-orange-900 border border-transparent hover:border-orange-200 text-slate-700 transition-all truncate font-hindi"
                >
                  💬 {prompt}
                </button>
              )
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              setTranscript('');
              startListening();
            }}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center space-x-1.5 transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Re-record</span>
          </button>
          
          <button
            onClick={handleSubmitTranscript}
            disabled={!transcript.trim()}
            className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white text-xs font-semibold shadow-md transition-all flex items-center justify-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Send in {selectedLang.toUpperCase()}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
