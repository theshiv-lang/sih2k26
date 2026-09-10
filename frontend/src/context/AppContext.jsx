import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { fetchDigiLockerDocuments, matchCitizenSchemes, sendChatMessage } from '../services/api';
import { sendAutoFillPayload, checkExtensionInstalled } from '../utils/extensionBridge';
import { detectLanguageFromText, synthesizeSpeech, stopSpeech } from '../services/bhashini';
import useStore from '../store/useStore';
import i18n from '../i18n';

const AppContext = createContext();

const INITIAL_CITIZEN_PROFILE = {
  name: "Rameshwar Kumar Sharma",
  father_name: "Ramswaroop Sharma",
  contact_number: "+91 98765 43210",
  gender: "Male",
  age: 38,
  state: "Uttar Pradesh",
  category: "OBC",
  annual_income: 160000,
  occupation: "Farmer",
  landholding_acres: 2.5,
  is_student: false,
  education_level: "12th",
  is_differently_abled: false,
  mobile: "[Phone Redacted]", // Strict placeholder restraint
  email: "citizen.placeholder@example.gov.in",
  aadhaar_number: "XXXX-XXXX-XXXX", // Strict placeholder restraint
  marital_status: "Married",
  has_girl_child: false,
  girl_child_age: 0,
  bpl_card_holder: false,
  is_pregnant_or_lactating: false,
  crop_insured: true,
  persona_type: "Farmer",
};

const WELCOME_MESSAGES = {
  hi: {
    text: "नमस्ते! **सहायक (Sahayak)** में आपका स्वागत है। मैं आपका एआई ई-गवर्नेंस सहायक हूँ।\n\nआप हमारे **कस्टम डिजीलॉकर वॉल्ट** से किसी भी नागरिक प्रोफाइल (किसान, छात्र, बालिका, विधवा) को 1-क्लिक में सक्रिय कर सकते हैं। आज मैं आपकी क्या सहायता कर सकता हूँ?",
    suggestions: [
      "पीएम-किसान पात्रता जाँचें 🌾",
      "सुकन्या समृद्धि योजना देखें 👧",
      "कस्टम डिजीलॉकर वॉल्ट खोलें 📂",
      "राष्ट्रीय छात्रवृत्ति पोर्टल (NSP) 🎓",
    ],
  },
  ta: {
    text: "வணக்கம்! **சகாயக் (Sahayak)**-க்கு நல்வரவு. நான் உங்கள் AI மின்-ஆளுமை வழிகாட்டி.\n\nஎங்கள் **தனிப்பயன் டிஜிலாக்கர் பெட்டகம்** மூலம் எந்தவொரு குடிமக்கள் சுயவிவரத்தையும் (விவசாயி, மாணவர், சிறுமி, விதவை) 1-கிளிக்கில் நீங்கள் செயல்படுத்தலாம். இன்று நான் உங்களுக்கு எவ்வாறு உதவ முடியும்?",
    suggestions: [
      "PM-கிசான் தகுதியைச் சரிபார்க்கவும் 🌾",
      "சுகன்யா சம்ரிதி யோஜனா 👧",
      "டிஜிலாக்கர் பெட்டகத்தைத் திறக்கவும் 📂",
      "தேசிய உதவித்தொகை போர்டல் (NSP) 🎓",
    ],
  },
  te: {
    text: "నమస్కారం! **సహాయక్ (Sahayak)** కు స్వాగతం. నేను మీ AI ఇ-గవర్నెన్స్ గైడ్.\n\nమా **అనుకూల డిజిలాకర్ వాల్ట్** నుండి ఏదైనా పౌరుల ప్రొఫైల్‌ను (రైతు, విద్యార్థి, బాలిక, వితంతువు) 1-క్లిక్‌తో సక్రియం చేయవచ్చు. ఈ రోజు నేను మీకు ఎలా సహాయపడగలను?",
    suggestions: [
      "పీఎం-కిసాన్ అర్హతను తనిఖీ చేయండి 🌾",
      "సుకున్య సమృద్ధి యోజన 👧",
      "డిజిలాకర్ వాల్ట్ తెరవండి 📂",
      "జాతీయ స్కాలర్‌షిప్ పోర్టల్ (NSP) 🎓",
    ],
  },
  bn: {
    text: "নমস্কার! **সহায়ক (Sahayak)**-এ আপনাকে স্বাগতম। আমি আপনার এআই ই-গভর্নেন্স গাইড।\n\nআমাদের **কাস্টম ডিজিলকার ভল্ট** থেকে যেকোনো নাগরিক প্রোফাইল (কৃষক, ছাত্র, কন্যা সন্তান, বিধবা) ১-ক্লিকে সক্রিয় করতে পারেন। আজ আমি আপনাকে কীভাবে সাহায্য করতে পারি?",
    suggestions: [
      "পিএম-কিষাণ যোগ্যতা পরীক্ষা করুন 🌾",
      "সুকন্যা সমৃদ্ধি যোজনা 👧",
      "ডিজিলকার ভল্ট খুলুন 📂",
      "জাতীয় বৃত্তি পোর্টাল (NSP) 🎓",
    ],
  },
  mr: {
    text: "नमस्कार! **सहायक (Sahayak)** मध्ये आपले स्वागत आहे. मी आपला एआय ई-प्रशासन मार्गदर्शक आहे.\n\nआपण आमच्या **कस्टम डिजिलॉकर तिजोरी** मधून कोणत्याही नागरिकाची प्रोफाइल (शेतकरी, विद्यार्थी, मुलगी, विधवा) एका क्लिकवर सक्रिय करू शकता. आज मी आपली काय मदत करू शकतो?",
    suggestions: [
      "पीएम-किसान पात्रता तपासा 🌾",
      "सुकन्या समृद्धी योजना 👧",
      "डिजिलॉकर तिजोरी उघडा 📂",
      "राष्ट्रीय शिष्यवृत्ती पोर्टल (NSP) 🎓",
    ],
  },
  en: {
    text: "नमस्ते! Welcome to **Sahayak (सहायक)**. I am your AI governance guide.\n\nYou can use our **Custom DigiLocker Vault** to simulate official demographics (Farmer, Student, Girl Child, Widow) with 1 click. How can I assist you today?",
    suggestions: [
      "Check PM-Kisan Eligibility 🌾",
      "Sukanya Samriddhi Yojana 👧",
      "Open Custom DigiLocker Vault 📂",
      "National Scholarship Portal (NSP) 🎓",
    ],
  },
};

export function AppProvider({ children }) {
  const [citizen, setCitizenState] = useState(INITIAL_CITIZEN_PROFILE);
  const [digilockerData, setDigilockerData] = useState(null);
  const [isDigiLockerConnected, setIsDigiLockerConnected] = useState(true);
  const [isDigiLockerLoading, setIsDigiLockerLoading] = useState(false);

  const [schemes, setSchemes] = useState([]);
  const [eligibleCount, setEligibleCount] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isMatchingLoading, setIsMatchingLoading] = useState(false);

  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [isExtensionActive, setIsExtensionActive] = useState(false);
  const [activeAutofillModal, setActiveAutofillModal] = useState(null);
  const [language, setLanguage] = useState(() => {
    return typeof window !== 'undefined' ? (localStorage.getItem('sahayak_language') || 'en') : 'en';
  });

  const languageRef = useRef("en");
  languageRef.current = language;

  // Sync with Zustand store
  useEffect(() => {
    const unsub = useStore.subscribe((state) => {
      if (state.citizen) {
        setCitizenState(state.citizen);
      }
      if (state.schemes) {
        setSchemes(state.schemes);
        setEligibleCount(state.eligibleCount ?? 0);
      }
    });
    return () => unsub();
  }, []);

  const [chatMessages, setChatMessages] = useState([
    {
      id: 'msg-welcome',
      sender: 'assistant',
      text: WELCOME_MESSAGES.en.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestions: WELCOME_MESSAGES.en.suggestions,
      languageCode: 'en',
    },
  ]);

  // Initial scheme matching and extension check
  useEffect(() => {
    runSchemeMatching(citizen, selectedCategory, language);
    
    checkExtensionInstalled().then((active) => {
      setIsExtensionActive(active);
    });

    const handlePing = () => {
      window.dispatchEvent(
        new CustomEvent('SAHAYAK_WEB_APP_PONG', { detail: { active: true } })
      );
    };
    window.addEventListener('SAHAYAK_PING_WEB_APP', handlePing);
    return () => window.removeEventListener('SAHAYAK_PING_WEB_APP', handlePing);
  }, []);

  // Update welcome message if language explicitly toggled
  const handleSetLanguage = (newLang) => {
    setLanguage(newLang);
    languageRef.current = newLang;
    if (typeof window !== 'undefined') {
      localStorage.setItem('sahayak_language', newLang);
    }
    i18n.changeLanguage(newLang);
    useStore.getState().setCurrentLanguage(newLang);
    runSchemeMatching(citizen, selectedCategory, newLang);

    const welcome = WELCOME_MESSAGES[newLang] || WELCOME_MESSAGES.en;
    setChatMessages((prev) => [
      ...prev,
      {
        id: `lang-switch-${Date.now()}`,
        sender: 'assistant',
        text: newLang === 'hi' 
          ? "🌐 भाषा को **हिन्दी** में बदला गया है। आप बोलकर या लिखकर प्रश्न पूछ सकते हैं।"
          : `🌐 Language updated to **${newLang.toUpperCase()}**. Conversation will continue in your chosen language.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: welcome.suggestions,
        languageCode: newLang,
      }
    ]);
  };

  // Re-run matching whenever category or citizen profile changes
  const runSchemeMatching = async (profile = citizen, category = selectedCategory, langCode = language) => {
    setIsMatchingLoading(true);
    try {
      const resp = await matchCitizenSchemes(profile, category === "All" ? null : category, langCode);
      if (resp && resp.matches) {
        const count = resp.eligible_count ?? resp.matches.filter(m => m.is_eligible).length;
        setSchemes(resp.matches);
        setEligibleCount(count);
        useStore.setState({
          schemes: resp.matches,
          eligibleCount: count,
        });
      }
    } catch (err) {
      console.error('[AppContext] Failed to match schemes:', err);
    } finally {
      setIsMatchingLoading(false);
    }
  };

  const setCitizen = (updatedProfile) => {
    setCitizenState(updatedProfile);
    useStore.getState().updateCitizenAttributes(updatedProfile);
  };

  // Connect DigiLocker
  const handleConnectDigiLocker = async () => {
    setIsDigiLockerLoading(true);
    try {
      const docs = await fetchDigiLockerDocuments();
      setDigilockerData(docs);
      setIsDigiLockerConnected(true);

      const updatedProfile = {
        ...citizen,
        name: docs.aadhaar.full_name,
        gender: docs.aadhaar.gender,
        aadhaar_number: docs.aadhaar.uid_masked,
        annual_income: docs.income_certificate.annual_income_inr,
        category: docs.caste_certificate.category,
        state: docs.aadhaar.address.state,
      };
      setCitizen(updatedProfile);
      await runSchemeMatching(updatedProfile, selectedCategory, language);

      const isHindi = language.startsWith('hi');

      setChatMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: isHindi
            ? `✅ **कस्टम डिजीलॉकर वॉल्ट सक्रिय!**\n\n- **नाम:** ${docs.aadhaar.full_name}\n- **आधार:** ${docs.aadhaar.uid_masked}\n- **वार्षिक आय:** ₹${docs.income_certificate.annual_income_inr.toLocaleString('en-IN')}\n- **सामाजिक श्रेणी:** ${docs.caste_certificate.category}\n\nआपकी प्रोफ़ाइल प्रमाणित हो चुकी है। मैंने योजना पात्रता डैशबोर्ड को अपडेट कर दिया है।`
            : `✅ **Custom DigiLocker Vault Active!**\n\n- **Name:** ${docs.aadhaar.full_name}\n- **Aadhaar:** ${docs.aadhaar.uid_masked}\n- **Annual Income:** ₹${docs.income_certificate.annual_income_inr.toLocaleString('en-IN')}\n- **Social Category:** ${docs.caste_certificate.category}\n\nYour profile has been authenticated. I have updated your scheme eligibility dashboard.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          suggestions: isHindi 
            ? ["पात्र योजनाएं दिखाएं 🎯", "पीएम-किसान आवेदन स्वतः भरें ⚡"] 
            : ["Show my eligible schemes 🎯", "How do I auto-fill PM-Kisan?"],
          languageCode: language,
        },
      ]);
    } catch (err) {
      console.error('[AppContext] DigiLocker connection failed:', err);
    } finally {
      setIsDigiLockerLoading(false);
    }
  };

  // Handle conversational message sending with End-to-End Language Mirroring
  const handleSendMessage = async (userText, explicitLanguage = null) => {
    if (!userText.trim()) return;

    const activeAppLang = explicitLanguage || (i18n.language && i18n.language !== 'en' ? i18n.language : null) || languageRef.current || 'en';
    const detectedLang = explicitLanguage ? explicitLanguage : (detectLanguageFromText(userText) !== 'en' ? detectLanguageFromText(userText) : activeAppLang);
    
    if (detectedLang !== language) {
      setLanguage(detectedLang);
      languageRef.current = detectedLang;
      useStore.getState().setCurrentLanguage(detectedLang);
    }

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      languageCode: detectedLang,
    };

    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const chatResp = await sendChatMessage(userText, detectedLang, citizen, detectedLang);
      const replyLanguage = chatResp.language_code || detectedLang;

      const assistantMsg = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: chatResp.response,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestions: chatResp.suggestions || [],
        languageCode: replyLanguage,
      };

      setChatMessages((prev) => [...prev, assistantMsg]);
      synthesizeSpeech(chatResp.response, replyLanguage);
    } catch (e) {
      console.warn('[AppContext] Chat processing notice:', e);
    }
  };

  // Launch Auto-Fill Flow
  const handleTriggerAutoFill = async (scheme) => {
    setActiveAutofillModal(scheme);
    const payload = await sendAutoFillPayload(scheme, citizen, digilockerData);
    console.log('[Sahayak] Auto-fill initiated for scheme:', scheme.title, payload);
  };

  return (
    <AppContext.Provider
      value={{
        citizen,
        setCitizen,
        digilockerData,
        isDigiLockerConnected,
        isDigiLockerLoading,
        handleConnectDigiLocker,
        schemes,
        eligibleCount,
        selectedCategory,
        setSelectedCategory: (cat) => {
          setSelectedCategory(cat);
          useStore.setState({ selectedCategory: cat });
          runSchemeMatching(citizen, cat, language);
        },
        isMatchingLoading,
        runSchemeMatching,
        chatMessages,
        setChatMessages,
        handleSendMessage,
        isVoiceModalOpen,
        setIsVoiceModalOpen,
        isVaultModalOpen,
        setIsVaultModalOpen,
        isExtensionActive,
        setIsExtensionActive,
        activeAutofillModal,
        setActiveAutofillModal,
        handleTriggerAutoFill,
        language,
        setLanguage: handleSetLanguage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
