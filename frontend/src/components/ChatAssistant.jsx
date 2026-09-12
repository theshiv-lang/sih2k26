import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useApp } from '../context/AppContext';
import { Send, Mic, Sparkles, Bot, User, ArrowRight, Volume2, VolumeX } from 'lucide-react';
import { synthesizeSpeech, stopSpeech, detectLanguageFromText } from '../services/bhashini';

export default function ChatAssistant() {
  const { t, i18n } = useTranslation();
  const {
    chatMessages,
    setChatMessages,
    handleSendMessage,
    setIsVoiceModalOpen,
    isDigiLockerConnected,
    handleConnectDigiLocker,
    handleTriggerAutoFill,
    schemes,
    citizen,
    setCitizen,
    runSchemeMatching,
    setSelectedCategory,
    language,
    setLanguage,
  } = useApp();

  const [inputVal, setInputVal] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const messagesEndRef = useRef(null);

  const handleMicClick = () => {
    setToastMessage("Voice input simulated for demo purposes.");
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
    setIsVoiceModalOpen(true);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const onSubmit = (e) => {
    e.preventDefault();
    if (inputVal.trim()) {
      const activeLang = i18n.language || language || 'en';
      const detected = detectLanguageFromText(inputVal);
      const targetLang = detected !== 'en' ? detected : activeLang;
      handleSendMessage(inputVal, targetLang);
      setInputVal('');
    }
  };

  // Text-To-Speech SpeechSynthesis handler using Bhashini / Native Speech
  const handleSpeakText = async (text, msgId, msgLanguage = null) => {
    if (isSpeaking && speakingMsgId === msgId) {
      stopSpeech();
      setIsSpeaking(false);
      setSpeakingMsgId(null);
      return;
    }

    stopSpeech();
    setIsSpeaking(true);
    setSpeakingMsgId(msgId);

    const langCode = msgLanguage || detectLanguageFromText(text) || language || 'hi';
    await synthesizeSpeech(text, langCode);

    setIsSpeaking(false);
    setSpeakingMsgId(null);
  };

  const handleSuggestionClick = (suggestion) => {
    const isHindi = language.startsWith('hi') || /[\u0900-\u097F]/.test(suggestion);

    if (suggestion.includes("Connect DigiLocker") || suggestion.includes("डिजीलॉकर अभी कनेक्ट") || suggestion.includes("डिजीलॉकर कनेक्ट")) {
      handleConnectDigiLocker();
    } else if (suggestion.includes("PM-Kisan Form") || suggestion.includes("Auto-fill PM-Kisan") || suggestion.includes("पीएम-किसान फॉर्म स्वतः भरें") || suggestion.includes("पीएम-किसान आवेदन")) {
      const pmKisan = schemes.find(s => s.scheme.id === "pm-kisan");
      if (pmKisan) {
        handleTriggerAutoFill(pmKisan.scheme);
      } else {
        handleSendMessage(suggestion, isHindi ? 'hi' : 'en');
      }
    } else if (suggestion.includes("Update profile to Student") || suggestion.includes("प्रोफ़ाइल को छात्र में बदलें")) {
      const studentProfile = {
        ...citizen,
        occupation: "Student",
        is_student: true,
        education_level: "Undergraduate",
      };
      setCitizen(studentProfile);
      runSchemeMatching(studentProfile, "Education", isHindi ? 'hi' : 'en');
      setSelectedCategory("Education");

      const userText = isHindi ? "मेरी प्रोफ़ाइल को छात्र (Student) में बदलें।" : "Switch my profile occupation to Student.";
      const assistantText = isHindi
        ? "🎓 प्रोफ़ाइल अपडेट की गई! अब आप **स्नातक छात्र (Undergraduate Student)** के रूप में पंजीकृत हैं।\n\nयोजनाओं का पुनः मूल्यांकन: आप अब **ओबीसी छात्रों के लिए पोस्ट-मैट्रिक छात्रवृत्ति** (₹25,000/वर्ष) के लिए **100% पात्र** हैं।"
        : "🎓 Profile updated! You are now set as an **Undergraduate Student**.\n\nRe-evaluated schemes: You are now **100% eligible** for the **Post-Matric Scholarship for OBC Students** providing up to ₹25,000/year for tuition & maintenance.";

      setChatMessages((prev) => [
        ...prev,
        {
          id: `user-${Date.now()}`,
          sender: 'user',
          text: userText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          languageCode: isHindi ? 'hi' : 'en',
        },
        {
          id: `assistant-${Date.now() + 1}`,
          sender: 'assistant',
          text: assistantText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: isHindi 
            ? ["छात्रवृत्ति आवेदन स्वतः भरें ⚡", "सभी शिक्षा योजनाएं देखें 📚"]
            : ["Auto-Fill Scholarship Application ⚡", "Show all Education Schemes"],
          languageCode: isHindi ? 'hi' : 'en',
        }
      ]);
      synthesizeSpeech(assistantText, isHindi ? 'hi' : 'en');
    } else if (suggestion.includes("View Education Schemes") || suggestion.includes("सभी शिक्षा योजनाएं देखें") || suggestion.includes("शिक्षा योजनाएं")) {
      setSelectedCategory("Education");
      handleSendMessage(isHindi ? "सभी शिक्षा और छात्रवृत्ति योजनाएं दिखाएं।" : "Show all Education & Scholarship Schemes.", isHindi ? 'hi' : 'en');
    } else if (suggestion.includes("View PM Mudra Scheme") || suggestion.includes("मुद्रा योजना विवरण") || suggestion.includes("मुद्रा आवेदन")) {
      setSelectedCategory("Finance & Enterprise");
      const mudra = schemes.find(s => s.scheme.id === "pm-mudra-shishu");
      if (mudra && (suggestion.includes("Auto-Fill") || suggestion.includes("स्वतः भरें"))) {
        handleTriggerAutoFill(mudra.scheme);
      } else {
        handleSendMessage(isHindi ? "प्रधानमंत्री मुद्रा योजना के बारे में बताएं।" : "Tell me more about PM Mudra Yojana.", isHindi ? 'hi' : 'en');
      }
    } else if (suggestion.includes("View PMAY-G Details") || suggestion.includes("PMAY-G योजना") || suggestion.includes("आवास आवेदन")) {
      setSelectedCategory("Housing");
      const pmay = schemes.find(s => s.scheme.id === "pmay-gramin");
      if (pmay && (suggestion.includes("Auto-Fill") || suggestion.includes("स्वतः भरें"))) {
        handleTriggerAutoFill(pmay.scheme);
      } else {
        handleSendMessage(isHindi ? "प्रधानमंत्री ग्रामीण आवास योजना के बारे में बताएं।" : "Tell me more about PMAY-Gramin housing assistance.", isHindi ? 'hi' : 'en');
      }
    } else if (suggestion.includes("Test Voice Input") || suggestion.includes("आवाज से पूछें")) {
      setIsVoiceModalOpen(true);
    } else {
      handleSendMessage(suggestion, isHindi ? 'hi' : 'en');
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden font-sans relative">
      
      {/* Voice Simulation Toast Notification */}
      {toastMessage && (
        <div className="absolute top-16 inset-x-4 z-30 animate-fade-in">
          <div className="bg-slate-900 text-white text-xs px-3.5 py-2.5 rounded-xl shadow-xl border border-slate-700 flex items-center justify-between space-x-2">
            <div className="flex items-center space-x-2">
              <Mic className="w-4 h-4 text-orange-400 animate-pulse flex-shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white text-xs font-bold px-1 cursor-pointer"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-4 bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-400/40 flex items-center justify-center text-orange-400">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-sm font-bold text-white">Sahayak AI Assistant</h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Bhashini Ready ({(i18n.language || language || 'en').toUpperCase()})
              </span>
            </div>
            <p className="text-xs text-slate-300">
              {language === 'hi' ? 'अपनी भाषा में पूछें • एआई द्वारा तुरंत सहायता'
                : language === 'ta' ? 'உங்கள் மொழியில் கேளுங்கள் • உடனடி AI உதவி'
                : language === 'te' ? 'మీ భాషలో అడగండి • తక్షణ AI సహాయం'
                : language === 'bn' ? 'আপনার ভাষায় জিজ্ঞাসা করুন • তাৎক্ষণিক এআই সাহায্য'
                : language === 'mr' ? 'आपल्या भाषेत विचारा • त्वरित एआय मदत'
                : 'Ask in any language • AI auto-mirrors response'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVoiceModalOpen(true)}
          className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-orange-400 hover:text-orange-300 transition-all flex items-center space-x-1"
          title="Start Voice Assistant (Bhashini AI)"
        >
          <Mic className="w-5 h-5" />
        </button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/50">
        {chatMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-start space-x-2 max-w-[90%]">
              {msg.sender === 'assistant' && (
                <div className="w-7 h-7 rounded-lg bg-orange-100 border border-orange-200 flex-shrink-0 flex items-center justify-center text-orange-700 mt-1">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}

              <div
                className={`p-3.5 rounded-2xl text-sm leading-relaxed relative group ${
                  msg.sender === 'user'
                    ? 'bg-slate-900 text-white rounded-br-none shadow-sm'
                    : 'bg-white text-slate-800 rounded-bl-none border border-slate-200 shadow-sm'
                }`}
              >
                <div className="whitespace-pre-line prose prose-sm max-w-none text-inherit">
                  {msg.text}
                </div>
                
                <div className="flex items-center justify-between mt-2 pt-1 border-t border-slate-100 text-[10px] text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <span>{msg.timestamp}</span>
                    {msg.languageCode && (
                      <span className="uppercase text-[9px] font-bold px-1 bg-slate-100 text-slate-600 rounded">
                        {msg.languageCode}
                      </span>
                    )}
                  </div>
                  {msg.sender === 'assistant' && (
                    <button
                      onClick={() => handleSpeakText(msg.text, msg.id, msg.languageCode)}
                      className="text-slate-400 hover:text-orange-600 p-0.5 rounded transition-all flex items-center space-x-1"
                      title="Listen aloud (Bhashini TTS)"
                    >
                      {isSpeaking && speakingMsgId === msg.id ? (
                        <VolumeX className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                      ) : (
                        <Volume2 className="w-3.5 h-3.5" />
                      )}
                      <span>{isSpeaking && speakingMsgId === msg.id ? 'Stop' : 'Listen'}</span>
                    </button>
                  )}
                </div>
              </div>

              {msg.sender === 'user' && (
                <div className="w-7 h-7 rounded-lg bg-slate-800 flex-shrink-0 flex items-center justify-center text-white mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>

            {/* Render Contextual Action / Suggestions Pills */}
            {msg.suggestions && msg.suggestions.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 ml-9">
                {msg.suggestions.map((sug, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSuggestionClick(sug)}
                    className="inline-flex items-center text-xs font-medium px-2.5 py-1 rounded-full bg-white hover:bg-orange-50 hover:text-orange-700 hover:border-orange-300 text-slate-700 border border-slate-200 transition-all shadow-2xs"
                  >
                    <span>{sug}</span>
                    <ArrowRight className="w-3 h-3 ml-1 opacity-60" />
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Box & Voice Trigger */}
      <div className="p-3 bg-white border-t border-slate-200 sticky bottom-0 pb-safe z-10">
        <form onSubmit={onSubmit} className="flex items-center space-x-2">
          <button
            type="button"
            onClick={handleMicClick}
            className="p-2.5 rounded-xl bg-orange-50 hover:bg-orange-100 text-orange-600 border border-orange-200 transition-all flex-shrink-0 cursor-pointer"
            title="Speak with Bhashini Voice Input"
          >
            <Mic className="w-5 h-5" />
          </button>
          
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            placeholder={
              language === 'hi'
                ? "योजनाओं के बारे में पूछें (उदा. 'पीएम किसान की पात्रता क्या है?')"
                : language === 'ta'
                ? "திட்டங்கள் பற்றி கேளுங்கள் (உதா. 'PM-கிசான் தகுதி என்ன?')..."
                : language === 'te'
                ? "పథకాల గురించి అడగండి (ఉదా. 'పీఎం-కిసాన్ అర్హత ఏమిటి?')..."
                : language === 'bn'
                ? "প্রকল্প সম্পর্কে জিজ্ঞাসা করুন (যেমন 'পিএম-কিষাণ যোগ্যতা কি?')..."
                : language === 'mr'
                ? "योजनांबद्दल विचारा (उदा. 'पीएम किसान पात्रता काय आहे?')..."
                : "Ask anything (e.g. 'Am I eligible for PM-Kisan?', 'Scholarships for students')..."
            }
            className="flex-1 px-4 py-2.5 bg-slate-100 focus:bg-white text-sm rounded-xl border border-transparent focus:border-slate-300 focus:outline-none transition-all placeholder:text-slate-400"
          />

          <button
            type="submit"
            disabled={!inputVal.trim()}
            className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white transition-all flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>

    </div>
  );
}
