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

let activeSessionPayload = null;

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
      executeFuzzyAutoFill(event.detail);
    }
  }
});

// 3. Listen for window.postMessage from Web App
window.addEventListener('message', (event) => {
  if (event.data && event.data.source === 'SAHAYAK_WEB_APP' && event.data.type === 'AUTOFILL_DATA_READY') {
    console.log('[Sahayak Content] postMessage payload received:', event.data.payload);
    activeSessionPayload = event.data.payload;
    syncSessionToBackground(event.data.payload);
    if (hasFormInputs()) {
      executeFuzzyAutoFill(event.data.payload);
    }
  }
});

// 4. Forward session to background worker so other tabs receive it
function syncSessionToBackground(payload) {
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({ type: 'SET_CURRENT_PAYLOAD', data: payload });
    } catch (e) {
      // Ignored if worker asleep
    }
  }
}

// 5. Listen for messages from Background Service Worker
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'INIT_PAGE_SESSION' && message.data) {
      activeSessionPayload = message.data;
      if (hasFormInputs()) {
        executeFuzzyAutoFill(message.data);
      }
      sendResponse({ initialized: true });
      return true;
    }

    if (message.type === 'EXECUTE_AUTOFILL' && message.data) {
      activeSessionPayload = message.data;
      const stats = executeFuzzyAutoFill(message.data);
      sendResponse({ success: true, stats });
      return true;
    }
  });
}

// 6. On Page Load, check background storage or local storage for active autofill session
function checkInitialSession() {
  // Check Chrome Storage via background
  if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
    try {
      chrome.runtime.sendMessage({ type: 'GET_CURRENT_PAYLOAD' }, (response) => {
        if (response && response.data && response.data.citizen) {
          activeSessionPayload = response.data;
          if (hasFormInputs()) {
            executeFuzzyAutoFill(response.data);
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
        executeFuzzyAutoFill(parsed);
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
 * Injects a floating Sahayak badge in the bottom-right corner
 */
function renderInPageHUD(schemeTitle, count, matchedFields, payload) {
  const existingHUD = document.getElementById('sahayak-inpage-hud');
  if (existingHUD) existingHUD.remove();

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
          <span style="font-weight: 700; font-size: 13px; letter-spacing: 0.3px;">Sahayak Auto-Fill</span>
        </div>
        <span style="
          font-size: 11px;
          font-weight: 600;
          background: rgba(16, 185, 129, 0.2);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.3);
          padding: 2px 8px;
          border-radius: 999px;
        ">${count} Fields Injected</span>
      </div>

      <p style="font-size: 12px; color: #cbd5e1; margin: 0 0 12px 0; line-height: 1.4;">
        Target Scheme: <strong>${schemeTitle}</strong>.<br/>
        Verified credentials from DigiLocker populated into form fields.
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
        ">Re-fill Fields</button>

        <button id="sahayak-close-hud" style="
          padding: 8px 12px;
          background: #334155;
          color: #94a3b8;
          border: none;
          border-radius: 10px;
          font-size: 11px;
          font-weight: 600;
          cursor: pointer;
        ">Dismiss</button>
      </div>
    </div>
  `;

  document.body.appendChild(hud);

  document.getElementById('sahayak-close-hud')?.addEventListener('click', () => {
    hud.remove();
  });

  document.getElementById('sahayak-refill-btn')?.addEventListener('click', () => {
    executeFuzzyAutoFill(payload || activeSessionPayload);
  });
}
