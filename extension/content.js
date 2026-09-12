/**
 * Sahayak Intelligent DOM Content Script
 * Fuzzy Field Matcher, Storage Bridge & Form Injection Engine
 */

console.log('[Sahayak Extension] Content script active on:', window.location.href);

// Semantic dictionaries for intelligent field mapping
const FIELD_DICTIONARY = {
  fullName: [
    'fullname', 'full_name', 'applicant_name', 'applicantname', 'name', 
    'candidate_name', 'candidatename', 'beneficiary_name', 'naam', 'first_name',
    'student_name', 'farmer_name',
  ],
  aadhaarMasked: [
    'aadhaar', 'aadhaar_no', 'aadhaarno', 'aadhaar_number', 'aadhaarnumber', 
    'uid', 'uid_no', 'aadhar', 'aadharno', 'aadharnumber', 'uidai', 'aadhaarno',
  ],
  dob: [
    'dob', 'date_of_birth', 'dateofbirth', 'birthdate', 'birth_date', 
    'janmtithi', 'birth_dt', 'd_o_b',
  ],
  gender: [
    'gender', 'sex', 'ling', 'gender_cd',
  ],
  fatherName: [
    'father_name', 'fathername', 'guardian_name', 'guardianname', 
    'parent_name', 'husband_name', 'father_or_husband', 'pitaka_naam',
    'father_husband_name',
  ],
  mobile: [
    'mobile', 'phone', 'mobile_no', 'mobileno', 'mobilenumber', 
    'contact', 'contact_no', 'cell', 'phone_number', 'mobile_num',
  ],
  email: [
    'email', 'email_id', 'emailid', 'email_address', 'mail', 'e_mail',
  ],
  address: [
    'address', 'residential_address', 'full_address', 'permanent_address', 
    'residence', 'pata', 'street_address', 'address_line1', 'current_address',
  ],
  state: [
    'state', 'state_name', 'statename', 'pradesh', 'rajya', 'domicile_state',
  ],
  district: [
    'district', 'district_name', 'districtname', 'zilla', 'jila',
  ],
  pincode: [
    'pincode', 'pin_code', 'postal_code', 'postalcode', 'pin', 'zip', 'zipcode',
  ],
  annualIncome: [
    'income', 'annual_income', 'annualincome', 'family_income', 'familyincome', 
    'gross_income', 'aay', 'total_income', 'gross_annual_income',
  ],
  socialCategory: [
    'category', 'social_category', 'socialcategory', 'caste', 'caste_category', 
    'castecategory', 'varg', 'community', 'social_status',
  ],
  occupation: [
    'occupation', 'profession', 'vyavasay', 'work_type', 'employment_status',
  ],
  landholdingAcres: [
    'land', 'land_acres', 'landholding', 'landholding_acres', 'land_area', 
    'zamin', 'khet', 'total_land',
  ],
  incomeCertNo: [
    'income_cert', 'income_cert_no', 'incomecertificateno', 'income_certificate', 
    'income_cert_number', 'income_doc_no', 'income_certificate_number',
  ],
  casteCertNo: [
    'caste_cert', 'caste_cert_no', 'castecertificateno', 'caste_certificate', 
    'caste_cert_number', 'caste_doc_no', 'caste_certificate_number',
  ],
};

const HUD_I18N = {
  en: {
    title: 'Sahayak Auto-Fill',
    fieldsInjected: 'Fields Injected',
    targetScheme: 'Target Scheme',
    credentialsPopulated: 'Verified credentials from DigiLocker populated into form fields.',
    refillBtn: 'Re-fill Fields',
    dismissBtn: 'Dismiss',
    scanningTitle: 'DigiLocker Document Scanning',
    scanningDesc: 'Analyzing form schema & matching verified credentials...',
  },
  hi: {
    title: 'सहायक ऑटो-फ़िल',
    fieldsInjected: 'फ़ील्ड भरे गए',
    targetScheme: 'लक्षित योजना',
    credentialsPopulated: 'डिजीलॉकर से सत्यापित विवरण फ़ॉर्म में भर दिए गए हैं।',
    refillBtn: 'पुनः भरें',
    dismissBtn: 'खारिज करें',
    scanningTitle: 'डिजीलॉकर दस्तावेज़ स्कैनिंग',
    scanningDesc: 'फ़ॉर्म संरचना का विश्लेषण एवं सत्यापित प्रमाण-पत्रों का मिलान जारी...',
  },
  ta: {
    title: 'சஹாயக் தானியங்கி நிரப்பல்',
    fieldsInjected: 'புலங்கள் நிரப்பப்பட்டன',
    targetScheme: 'இலக்கு திட்டம்',
    credentialsPopulated: 'டிஜிலாக்கர் சான்றுகள் படிவ புலங்களில் நிரப்பப்பட்டன.',
    refillBtn: 'மீண்டும் நிரப்பு',
    dismissBtn: 'விலக்கு',
    scanningTitle: 'டிஜிலாக்கர் ஆவண ஸ்கேனிங்',
    scanningDesc: 'படிவ பகுப்பாய்வு மற்றும் சான்றுகள் சரிபார்ப்பு நடைபெறுகிறது...',
  },
  te: {
    title: 'సహాయక్ ఆటో-ఫిల్',
    fieldsInjected: 'ఫీల్డ్‌లు నింపబడ్డాయి',
    targetScheme: 'లక్ష్య పథకం',
    credentialsPopulated: 'డిజిలాకర్ వివరాలు ఫారమ్ ఫీల్డ్‌లలో పూరించబడ్డాయి.',
    refillBtn: 'మళ్లీ పూరించండి',
    dismissBtn: 'తీసివేయి',
    scanningTitle: 'డిజిలాకర్ పత్రాల స్కానింగ్',
    scanningDesc: 'ఫారమ్ విశ్లేషణ మరియు ధృవీకరించబడిన ఆధారాల సరిపోలిక...',
  },
  bn: {
    title: 'সহায়ক অটো-ফিল',
    fieldsInjected: 'ফিল্ড পূরণ হয়েছে',
    targetScheme: 'উদ্দিষ্ট প্রকল্প',
    credentialsPopulated: 'ডিজিলকার থেকে যাচাইকৃত শংসাপত্র ফর্মে পূরণ করা হয়েছে।',
    refillBtn: 'পুনরায় পূরণ',
    dismissBtn: 'বাতিল করুন',
    scanningTitle: 'ডিজিলকার নথি স্ক্যানিং',
    scanningDesc: 'ফর্মের বিশ্লেষণ ও যাচাইকৃত তথ্যের মিল যাচাই করা হচ্ছে...',
  },
  mr: {
    title: 'सहायक ऑटो-फिल',
    fieldsInjected: 'फील्ड्स भरले',
    targetScheme: 'लक्षित योजना',
    credentialsPopulated: 'डिजीलॉकरमधील सत्यापित तपशील फॉर्ममध्ये भरले आहेत.',
    refillBtn: 'पुन्हा भरा',
    dismissBtn: 'बंद करा',
    scanningTitle: 'डिजीलॉकर दस्तऐवज स्कॅनिंग',
    scanningDesc: 'फॉर्मचे विश्लेषण व पडताळणी तपशील जुळवणी सुरू आहे...',
  },
};

let currentLanguage = 'en';
let activeSessionPayload = null;
let isScanInProgress = false;

// Check if page contains form inputs to autofill
function hasFormInputs() {
  const inputs = document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea');
  return inputs.length > 0;
}

// 1. Listen for Web App Pings
window.addEventListener('SAHAYAK_PING_EXTENSION', () => {
  window.dispatchEvent(
    new CustomEvent('SAHAYAK_EXTENSION_RESPONSE', {
      detail: { type: 'SAHAYAK_EXTENSION_PONG', active: true },
    })
  );
});

// 2. Listen for Web App CustomEvent
window.addEventListener('SAHAYAK_AUTOFILL_DISPATCH', (event) => {
  if (event.detail) {
    console.log('[Sahayak Content] CustomEvent payload received:', event.detail);
    activeSessionPayload = event.detail;
    syncSessionToBackground(event.detail);
    if (hasFormInputs()) {
      executeFuzzyAutoFillWithScan(event.detail);
    }
  }
});

// 3. Listen for window.postMessage from Web App (autofill + language sync)
window.addEventListener('message', (event) => {
  // Autofill payload
  if (event.data && event.data.source === 'SAHAYAK_WEB_APP' && event.data.type === 'AUTOFILL_DATA_READY') {
    console.log('[Sahayak Content] postMessage payload received:', event.data.payload);
    activeSessionPayload = event.data.payload;
    syncSessionToBackground(event.data.payload);
    if (hasFormInputs()) {
      executeFuzzyAutoFillWithScan(event.data.payload);
    }
  }

  // Language change from web app
  if (event.data && event.data.type === 'SAHAYAK_LANG_CHANGE' && event.data.lang) {
    console.log('[Sahayak Content] Language change detected:', event.data.lang);
    currentLanguage = event.data.lang;
    syncLanguageToBackground(event.data.lang);
    updateHudLanguage(currentLanguage);
  }
});

// 4. Forward session and language to background worker
function syncSessionToBackground(payload) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({ type: 'SET_CURRENT_PAYLOAD', data: payload });
    } catch (e) {
      // Ignored if worker asleep
    }
  }
}

function syncLanguageToBackground(lang) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({ type: 'SAHAYAK_LANG_CHANGE', lang });
    } catch (e) {
      // Ignored if worker asleep
    }
  }
}

// 5. Listen for messages from Background Service Worker
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'SAHAYAK_LANG_UPDATED' && message.lang) {
      console.log('[Sahayak Content] Language updated via SW:', message.lang);
      currentLanguage = message.lang;
      updateHudLanguage(currentLanguage);
      sendResponse({ success: true, lang: currentLanguage });
      return true;
    }

    if (message.type === 'INIT_PAGE_SESSION' && message.data) {
      activeSessionPayload = message.data;
      if (hasFormInputs()) {
        executeFuzzyAutoFillWithScan(message.data);
      }
      sendResponse({ initialized: true });
      return true;
    }

    if (message.type === 'EXECUTE_AUTOFILL' && message.data) {
      activeSessionPayload = message.data;
      executeFuzzyAutoFillWithScan(message.data);
      sendResponse({ success: true });
      return true;
    }
  });
}

// 6. On Page Load, check background storage or local storage for active autofill session & language
function checkInitialSession() {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      // Load current language
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_LANGUAGE' }, (langResp) => {
        if (langResp && langResp.lang) {
          currentLanguage = langResp.lang;
          updateHudLanguage(currentLanguage);
        }
      });

      // Load session
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_PAYLOAD' }, (response) => {
        if (response && response.data && response.data.citizen) {
          activeSessionPayload = response.data;
          if (hasFormInputs()) {
            executeFuzzyAutoFillWithScan(response.data);
          }
        } else {
          checkLocalStorageFallback();
        }
      });
    } catch (e) {
      checkLocalStorageFallback();
    }
  } else {
    checkLocalStorageFallback();
  }
}

function checkLocalStorageFallback() {
  try {
    const raw = localStorage.getItem('sahayak_autofill_session');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.citizen && hasFormInputs()) {
        activeSessionPayload = parsed;
        executeFuzzyAutoFillWithScan(parsed);
      }
    }
  } catch (e) {}
}

// Run initial check when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', checkInitialSession);
} else {
  setTimeout(checkInitialSession, 150);
}

/**
 * Normalizes strings for resilient fuzzy comparison
 */
function normalizeString(str) {
  if (!str) return '';
  return str.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Computes semantic similarity score between an element and a target field key
 */
function getFieldMatchScore(element, fieldKey) {
  const aliases = FIELD_DICTIONARY[fieldKey] || [fieldKey.toLowerCase()];
  
  const elementId = normalizeString(element.id);
  const elementName = normalizeString(element.name);
  const elementPlaceholder = normalizeString(element.placeholder);
  const elementAria = normalizeString(element.getAttribute('aria-label'));

  // Get text of associated label if present
  let labelText = '';
  if (element.id) {
    const labelElem = document.querySelector(`label[for="${element.id}"]`);
    if (labelElem) labelText = normalizeString(labelElem.textContent);
  }
  if (!labelText && element.closest('label')) {
    labelText = normalizeString(element.closest('label').textContent);
  }

  let bestScore = 0;

  for (const alias of aliases) {
    const normAlias = normalizeString(alias);
    
    // Direct matches
    if (elementId === normAlias || elementName === normAlias) return 100;
    if (elementId.includes(normAlias) || elementName.includes(normAlias)) bestScore = Math.max(bestScore, 90);
    if (labelText.includes(normAlias)) bestScore = Math.max(bestScore, 85);
    if (elementPlaceholder.includes(normAlias)) bestScore = Math.max(bestScore, 75);
    if (elementAria.includes(normAlias)) bestScore = Math.max(bestScore, 75);
  }

  return bestScore;
}

/**
 * Core form auto-fill execution
 */
function executeFuzzyAutoFill(payload) {
  if (!payload || !payload.citizen) {
    console.warn('[Sahayak Content] Empty payload provided.');
    return { filledCount: 0 };
  }

  const citizen = payload.citizen;
  const schemeTitle = payload.scheme?.title || 'Welfare Scheme';

  console.log('[Sahayak Content] Starting fuzzy DOM scanning for:', citizen.fullName);

  const inputs = Array.from(document.querySelectorAll('input:not([type="hidden"]):not([type="submit"]):not([type="button"]), select, textarea'));
  let filledCount = 0;
  const matchedFields = [];

  const fieldKeys = Object.keys(FIELD_DICTIONARY);

  inputs.forEach((input) => {
    let highestScore = 0;
    let bestMatchedKey = null;

    fieldKeys.forEach((key) => {
      const score = getFieldMatchScore(input, key);
      if (score > highestScore && score >= 65) {
        highestScore = score;
        bestMatchedKey = key;
      }
    });

    if (bestMatchedKey && citizen[bestMatchedKey] !== undefined) {
      const valueToInject = citizen[bestMatchedKey];
      injectValueIntoElement(input, valueToInject);
      filledCount++;
      matchedFields.push({ field: bestMatchedKey, element: input, value: valueToInject });
    }
  });

  console.log(`[Sahayak Content] Injected ${filledCount} fields successfully.`);
  renderInPageHUD(schemeTitle, filledCount, matchedFields, payload);

  return { filledCount, matchedFields };
}

/**
 * Safely injects values and dispatches synthetic input events
 */
function injectValueIntoElement(element, value) {
  if (value === null || value === undefined) return;

  const stringVal = String(value);

  if (element.tagName.toLowerCase() === 'select') {
    let matchedOption = false;
    for (let i = 0; i < element.options.length; i++) {
      const opt = element.options[i];
      if (
        opt.value.toLowerCase() === stringVal.toLowerCase() ||
        opt.text.toLowerCase().includes(stringVal.toLowerCase()) ||
        stringVal.toLowerCase().includes(opt.value.toLowerCase())
      ) {
        element.selectedIndex = i;
        matchedOption = true;
        break;
      }
    }
    if (!matchedOption && element.options.length > 1) {
      element.value = stringVal;
    }
  } else if (element.type === 'checkbox' || element.type === 'radio') {
    element.checked = Boolean(value);
  } else {
    element.value = stringVal;
  }

  // Visual green indicator
  element.classList.add('field-autofilled');
  element.style.borderColor = '#10b981';
  element.style.backgroundColor = '#ecfdf5';

  // Dispatch events for framework reactivity (React, Vue, Angular)
  element.dispatchEvent(new Event('input', { bubbles: true }));
  element.dispatchEvent(new Event('change', { bubbles: true }));
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}

/**
 * Injects a floating Sahayak badge in the bottom-right corner with multilingual support
 */
function renderInPageHUD(schemeTitle, count, matchedFields, payload) {
  const existingHUD = document.getElementById('sahayak-inpage-hud');
  if (existingHUD) existingHUD.remove();

  const t = HUD_I18N[currentLanguage] || HUD_I18N.en;

  const hud = document.createElement('div');
  hud.id = 'sahayak-inpage-hud';
  hud.className = 'sahayak-floating-hud';
  hud.innerHTML = `
    <div style="
      position: fixed;
      bottom: 24px;
      right: 24px;
      z-index: 999999;
      background: #0f172a;
      color: white;
      padding: 16px 20px;
      border-radius: 18px;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4), 0 8px 10px -6px rgba(0, 0, 0, 0.4);
      border: 1px solid #334155;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      max-width: 360px;
      animation: sahayakSlideUp 0.3s ease-out;
    ">
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
        <div style="display: flex; align-items: center; gap: 8px;">
          <div style="
            width: 28px;
            height: 28px;
            border-radius: 8px;
            background: #ea580c;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 14px;
          ">⚡</div>
          <span id="sahayak-hud-title" style="font-weight: 700; font-size: 13px; letter-spacing: 0.3px;">${t.title}</span>
        </div>
        <span id="sahayak-hud-injected-badge" style="
          font-size: 11px;
          font-weight: 600;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.3);
          padding: 2px 8px;
          border-radius: 999px;
        ">${count} ${t.fieldsInjected}</span>
      </div>

      <p id="sahayak-hud-desc" style="font-size: 12px; color: #cbd5e1; margin: 0 0 12px 0; line-height: 1.4;">
        ${t.targetScheme}: <strong id="sahayak-hud-scheme-name">${schemeTitle}</strong>.<br/>
        <span id="sahayak-hud-cred-note">${t.credentialsPopulated}</span>
      </p>

      <div style="display: flex; gap: 8px;">
        <button id="sahayak-refill-btn" style="
          flex: 1;
          padding: 8px 12px;
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        ">${t.refillBtn}</button>

        <button id="sahayak-close-hud" style="
          padding: 8px 12px;
          background: #334155;
          color: #94a3b8;
          border: none;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        ">${t.dismissBtn}</button>
      </div>
    </div>
  `;

  document.body.appendChild(hud);

  document.getElementById('sahayak-close-hud')?.addEventListener('click', () => {
    hud.remove();
  });

  document.getElementById('sahayak-refill-btn')?.addEventListener('click', () => {
    executeFuzzyAutoFillWithScan(payload || activeSessionPayload);
  });
}

/**
 * High-tech visual document scanner overlay displayed for 1.5 seconds
 */
function showDocumentScanOverlay(schemeTitle, callback) {
  const existing = document.getElementById('sahayak-scanner-overlay');
  if (existing) existing.remove();

  isScanInProgress = true;
  const t = HUD_I18N[currentLanguage] || HUD_I18N.en;

  const overlay = document.createElement('div');
  overlay.id = 'sahayak-scanner-overlay';
  overlay.innerHTML = `
    <div style="
      position: fixed;
      inset: 0;
      z-index: 9999999;
      background: rgba(15, 23, 42, 0.78);
      backdrop-filter: blur(6px);
      -webkit-backdrop-filter: blur(6px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      animation: sahayakFadeIn 0.25s ease-out;
    ">
      <div style="
        background: #0f172a;
        border: 1px solid rgba(16, 185, 129, 0.4);
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 35px rgba(16, 185, 129, 0.25);
        border-radius: 20px;
        padding: 24px 28px;
        width: 100%;
        max-width: 420px;
        text-align: center;
        color: white;
      ">
        <div style="
          width: 100%;
          height: 120px;
          background: rgba(16, 185, 129, 0.06);
          border: 1px dashed rgba(16, 185, 129, 0.35);
          border-radius: 14px;
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 20px;
        ">
          <!-- Laser scan beam -->
          <div style="
            position: absolute;
            left: 0;
            right: 0;
            height: 3px;
            background: linear-gradient(90deg, transparent, #10b981, #34d399, transparent);
            box-shadow: 0 0 14px 2px #10b981;
            animation: sahayakLaserScan 1.2s ease-in-out infinite alternate;
          "></div>

          <!-- Glowing Center Badge -->
          <div style="
            width: 54px;
            height: 54px;
            border-radius: 16px;
            background: rgba(16, 185, 129, 0.15);
            border: 1px solid rgba(16, 185, 129, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 26px;
            animation: sahayakPulseGlow 1.4s ease-in-out infinite;
          ">
            📄
          </div>
        </div>

        <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(234, 88, 12, 0.15); border: 1px solid rgba(234, 88, 12, 0.4); padding: 3px 10px; border-radius: 999px; margin-bottom: 10px;">
          <span style="font-size: 10px; font-weight: 700; color: #fb923c; text-transform: uppercase; letter-spacing: 0.5px;">Sahayak AI Engine</span>
        </div>

        <h3 id="sahayak-scan-title" style="margin: 0 0 8px 0; font-size: 17px; font-weight: 700; color: #f8fafc;">
          ${t.scanningTitle}
        </h3>

        <p id="sahayak-scan-scheme" style="margin: 0 0 6px 0; font-size: 12px; font-weight: 600; color: #34d399;">
          ${schemeTitle || 'Government Welfare Portal'}
        </p>

        <p id="sahayak-scan-desc" style="margin: 0 0 18px 0; font-size: 12px; color: #94a3b8; line-height: 1.4;">
          ${t.scanningDesc}
        </p>

        <!-- Progress bar line -->
        <div style="width: 100%; height: 5px; background: rgba(51, 65, 85, 0.6); border-radius: 999px; overflow: hidden;">
          <div style="
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, #10b981, #06b6d4);
            border-radius: 999px;
            transform-origin: left;
            animation: sahayakScanProgress 1.5s ease-in-out forwards;
          "></div>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    overlay.remove();
    isScanInProgress = false;
    if (typeof callback === 'function') {
      callback();
    }
  }, 1500);
}

/**
 * Wraps form filling with a 1.5s document scanning visual overlay
 */
function executeFuzzyAutoFillWithScan(payload) {
  if (!payload || !payload.citizen) {
    return { filledCount: 0 };
  }

  // Prevent multiple overlapping scan executions
  if (isScanInProgress) return;

  const schemeTitle = payload.scheme?.title || 'Welfare Scheme';
  showDocumentScanOverlay(schemeTitle, () => {
    executeFuzzyAutoFill(payload);
  });
}

/**
 * Dynamically updates in-page HUD and scanning overlay language
 */
function updateHudLanguage(lang) {
  currentLanguage = lang || 'en';
  const t = HUD_I18N[currentLanguage] || HUD_I18N.en;

  const titleEl = document.getElementById('sahayak-hud-title');
  if (titleEl) titleEl.textContent = t.title;

  const badgeEl = document.getElementById('sahayak-hud-injected-badge');
  if (badgeEl) {
    const count = parseInt(badgeEl.textContent, 10) || 0;
    badgeEl.textContent = `${count} ${t.fieldsInjected}`;
  }

  const credNoteEl = document.getElementById('sahayak-hud-cred-note');
  if (credNoteEl) credNoteEl.textContent = t.credentialsPopulated;

  const refillBtn = document.getElementById('sahayak-refill-btn');
  if (refillBtn) refillBtn.textContent = t.refillBtn;

  const dismissBtn = document.getElementById('sahayak-close-hud');
  if (dismissBtn) dismissBtn.textContent = t.dismissBtn;

  const scanTitle = document.getElementById('sahayak-scan-title');
  if (scanTitle) scanTitle.textContent = t.scanningTitle;

  const scanDesc = document.getElementById('sahayak-scan-desc');
  if (scanDesc) scanDesc.textContent = t.scanningDesc;
}

