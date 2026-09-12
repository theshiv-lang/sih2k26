// Multilingual Dictionary for Manifest V3 Popup
const POPUP_I18N = {
  en: {
    subtitle: 'Auto-Fill Engine',
    statusActive: 'Active',
    cardTitle: 'Loaded Citizen Credentials',
    labelName: 'Name:',
    labelAadhaar: 'Aadhaar:',
    labelIncome: 'Annual Income:',
    labelCategory: 'Category:',
    btnAutofill: '⚡ Auto-Fill Active Portal Tab',
    btnScanning: '🔍 Scanning Document...',
    btnSuccess: '✅ Form Auto-Filled!',
    btnOpen: 'Open Sahayak Web App ↗',
    verifiedSuffix: '(Verified)',
  },
  hi: {
    subtitle: 'ऑटो-फिल इंजन',
    statusActive: 'सक्रिय',
    cardTitle: 'लोड किए गए नागरिक क्रेडेंशियल्स',
    labelName: 'नाम:',
    labelAadhaar: 'आधार:',
    labelIncome: 'वार्षिक आय:',
    labelCategory: 'वर्ग / श्रेणी:',
    btnAutofill: '⚡ सक्रिय पोर्टल फॉर्म स्वतः भरें',
    btnScanning: '🔍 दस्तावेज़ स्कैन हो रहा है...',
    btnSuccess: '✅ फॉर्म स्वतः भर गया!',
    btnOpen: 'सहायक वेब ऐप खोलें ↗',
    verifiedSuffix: '(प्रमाणित)',
  },
  ta: {
    subtitle: 'தானியங்கி நிரப்பு இயந்திரம்',
    statusActive: 'செயலில்',
    cardTitle: 'ஏற்றப்பட்ட குடிமக்கள் சான்றுகள்',
    labelName: 'பெயர்:',
    labelAadhaar: 'ஆதார்:',
    labelIncome: 'ஆண்டு வருமானம்:',
    labelCategory: 'பிரிவு:',
    btnAutofill: '⚡ செயலில் உள்ள போர்டல் படிவத்தை நிரப்பவும்',
    btnScanning: '🔍 ஆவணம் ஸ்கேன் செய்யப்படுகிறது...',
    btnSuccess: '✅ படிவம் நிரப்பப்பட்டது!',
    btnOpen: 'சஹாயக் இணைய செயலியைத் திறக்கவும் ↗',
    verifiedSuffix: '(சரிபார்க்கப்பட்டது)',
  },
  te: {
    subtitle: 'ఆటో-ఫిల్ ఇంజిన్',
    statusActive: 'క్రియాశీలకం',
    cardTitle: 'లోడ్ చేయబడిన పౌరుడి వివరాలు',
    labelName: 'పేరు:',
    labelAadhaar: 'ఆధార్:',
    labelIncome: 'వార్షిక ఆదాయం:',
    labelCategory: 'వర్గం:',
    btnAutofill: '⚡ పోర్టల్ దరఖాస్తును పూరించండి',
    btnScanning: '🔍 పత్రం స్కాన్ అవుతోంది...',
    btnSuccess: '✅ దరఖాస్తు పూరించబడింది!',
    btnOpen: 'సహాయక్ వెబ్ యాప్ తెరవండి ↗',
    verifiedSuffix: '(ధృవీకరించబడింది)',
  },
  bn: {
    subtitle: 'অটো-ফিল ইঞ্জিন',
    statusActive: 'সক্রিয়',
    cardTitle: 'লোড করা নাগরিক পরিচয়পত্র',
    labelName: 'নাম:',
    labelAadhaar: 'আধার:',
    labelIncome: 'বার্ষিক আয়:',
    labelCategory: 'শ্রেণী:',
    btnAutofill: '⚡ সক্রিয় পোর্টাল ফর্ম পূরণ করুন',
    btnScanning: '🔍 নথি স্ক্যান করা হচ্ছে...',
    btnSuccess: '✅ ফর্ম সফলভাবে পূরণ করা হয়েছে!',
    btnOpen: 'সহায়ক ওয়েব অ্যাপ খুলুন ↗',
    verifiedSuffix: '(যাচাইকৃত)',
  },
  mr: {
    subtitle: 'ऑटो-फिल इंजिन',
    statusActive: 'सक्रिय',
    cardTitle: 'लोड केलेली नागरिक माहिती',
    labelName: 'नाव:',
    labelAadhaar: 'आधार:',
    labelIncome: 'वार्षिक उत्पन्न:',
    labelCategory: 'प्रवर्ग:',
    btnAutofill: '⚡ पोर्टल अर्ज आपोआप भरा',
    btnScanning: '🔍 कागदपत्र स्कॅन करत आहे...',
    btnSuccess: '✅ अर्ज यशस्वीरित्या भरला!',
    btnOpen: 'सहायक वेब ॲप उघडा ↗',
    verifiedSuffix: '(सत्यापित)',
  },
};

let currentLang = 'en';

function applyLanguageToPopup(langCode) {
  currentLang = POPUP_I18N[langCode] ? langCode : 'en';
  const dict = POPUP_I18N[currentLang];

  const popupSubtitle = document.getElementById('popupSubtitle');
  const statusBadge = document.getElementById('statusBadge');
  const popupCardTitle = document.getElementById('popupCardTitle');
  const labelName = document.getElementById('labelName');
  const labelAadhaar = document.getElementById('labelAadhaar');
  const labelIncome = document.getElementById('labelIncome');
  const labelCategory = document.getElementById('labelCategory');
  const btnAutofill = document.getElementById('btnAutofillCurrentTab');
  const btnOpenSahayak = document.getElementById('btnOpenSahayak');

  if (popupSubtitle) popupSubtitle.textContent = dict.subtitle;
  if (statusBadge) statusBadge.textContent = dict.statusActive;
  if (popupCardTitle) popupCardTitle.textContent = dict.cardTitle;
  if (labelName) labelName.textContent = dict.labelName;
  if (labelAadhaar) labelAadhaar.textContent = dict.labelAadhaar;
  if (labelIncome) labelIncome.textContent = dict.labelIncome;
  if (labelCategory) labelCategory.textContent = dict.labelCategory;
  if (btnAutofill && !btnAutofill.dataset.busy) btnAutofill.textContent = dict.btnAutofill;
  if (btnOpenSahayak) btnOpenSahayak.textContent = dict.btnOpen;
}

document.addEventListener('DOMContentLoaded', () => {
  const cardName = document.getElementById('cardName');
  const cardAadhaar = document.getElementById('cardAadhaar');
  const cardIncome = document.getElementById('cardIncome');
  const cardCategory = document.getElementById('cardCategory');
  const btnAutofill = document.getElementById('btnAutofillCurrentTab');
  const btnOpenSahayak = document.getElementById('btnOpenSahayak');

  // Load language preference from chrome.storage.local
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['sahayak_language'], (res) => {
      if (res && res.sahayak_language) {
        applyLanguageToPopup(res.sahayak_language);
      }
    });

    // Listen for real-time storage updates from the Web App
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.sahayak_language) {
        applyLanguageToPopup(changes.sahayak_language.newValue);
      }
    });
  }

  // Load cached session payload from background/storage
  chrome.runtime.sendMessage({ type: 'GET_CURRENT_PAYLOAD' }, (response) => {
    if (response && response.data && response.data.citizen) {
      const c = response.data.citizen;
      const dict = POPUP_I18N[currentLang] || POPUP_I18N.en;
      if (cardName) cardName.textContent = c.fullName || c.name || 'Rameshwar Sharma';
      if (cardAadhaar) cardAadhaar.textContent = c.aadhaarMasked || 'XXXX-XXXX-4812';
      if (cardIncome) cardIncome.textContent = `₹${(c.annualIncome || c.annual_income || 180000).toLocaleString('en-IN')}`;
      if (cardCategory) cardCategory.textContent = `${c.socialCategory || c.category || 'OBC'} ${dict.verifiedSuffix}`;
    }
  });

  if (btnAutofill) {
    btnAutofill.addEventListener('click', () => {
      const dict = POPUP_I18N[currentLang] || POPUP_I18N.en;
      btnAutofill.dataset.busy = 'true';
      btnAutofill.textContent = dict.btnScanning;

      chrome.runtime.sendMessage({ type: 'TRIGGER_TAB_AUTOFILL' }, (res) => {
        btnAutofill.textContent = dict.btnSuccess;
        setTimeout(() => {
          delete btnAutofill.dataset.busy;
          btnAutofill.textContent = dict.btnAutofill;
        }, 2200);
      });
    });
  }

  if (btnOpenSahayak) {
    btnOpenSahayak.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:5173' });
    });
  }
});
