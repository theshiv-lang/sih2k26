/**
 * Sahayak Extension Bridge
 * Connects the React PWA with the Chrome Manifest V3 Auto-Fill Extension
 */

const EXTENSION_EVENT_TYPE = 'SAHAYAK_AUTOFILL_DISPATCH';
const EXTENSION_RESPONSE_TYPE = 'SAHAYAK_EXTENSION_RESPONSE';
const EXTENSION_PING_TYPE = 'SAHAYAK_PING_EXTENSION';

// Optional static Extension ID if configured, otherwise uses window bridge
let registeredExtensionId = localStorage.getItem('sahayak_extension_id') || null;

export function setExtensionId(id) {
  registeredExtensionId = id;
  if (id) {
    localStorage.setItem('sahayak_extension_id', id);
  } else {
    localStorage.removeItem('sahayak_extension_id');
  }
}

export function getExtensionId() {
  return registeredExtensionId;
}

/**
 * Checks if the Sahayak Chrome Extension is active
 */
export async function checkExtensionInstalled() {
  return new Promise((resolve) => {
    // 1. Direct Chrome Runtime check
    if (window.chrome && chrome.runtime && chrome.runtime.sendMessage && registeredExtensionId) {
      try {
        chrome.runtime.sendMessage(registeredExtensionId, { type: 'PING' }, (response) => {
          if (chrome.runtime.lastError || !response) {
            resolve(false);
          } else {
            resolve(true);
          }
        });
        return;
      } catch (e) {
        // Fallback to window event
      }
    }

    // 2. Custom DOM Event Ping/Pong Bridge
    let received = false;
    const pongHandler = (event) => {
      if (event.detail && event.detail.type === 'SAHAYAK_EXTENSION_PONG') {
        received = true;
        window.removeEventListener(EXTENSION_RESPONSE_TYPE, pongHandler);
        resolve(true);
      }
    };

    window.addEventListener(EXTENSION_RESPONSE_TYPE, pongHandler);
    window.dispatchEvent(new CustomEvent(EXTENSION_PING_TYPE, { detail: { timestamp: Date.now() } }));

    // Timeout after 400ms
    setTimeout(() => {
      window.removeEventListener(EXTENSION_RESPONSE_TYPE, pongHandler);
      if (!received) {
        resolve(false);
      }
    }, 400);
  });
}

/**
 * Normalizes citizen credentials and dispatches autofill command to extension
 */
export async function sendAutoFillPayload(scheme, citizenProfile, digilockerData) {
  const normalizedPayload = {
    scheme: {
      id: scheme.id,
      title: scheme.title,
      portal_url: scheme.portal_url,
      category: scheme.category,
      benefit: scheme.financial_benefit,
    },
    citizen: {
      fullName: digilockerData?.aadhaar?.full_name || citizenProfile.name,
      aadhaarMasked: digilockerData?.aadhaar?.uid_masked || citizenProfile.aadhaar_number || 'XXXX-XXXX-4812',
      dob: digilockerData?.aadhaar?.date_of_birth || '1994-08-15',
      gender: digilockerData?.aadhaar?.gender || citizenProfile.gender,
      mobile: citizenProfile.mobile || '9876543210',
      email: citizenProfile.email || 'citizen.sahayak@gov.in',
      fatherName: digilockerData?.income_certificate?.father_or_husband_name || "Ramdas Sharma",
      address: digilockerData?.aadhaar?.address?.full_address || `${citizenProfile.state}, India`,
      district: digilockerData?.aadhaar?.address?.district || "Varanasi",
      state: citizenProfile.state || "Uttar Pradesh",
      pincode: digilockerData?.aadhaar?.address?.pincode || "221001",
      annualIncome: citizenProfile.annual_income || 180000,
      socialCategory: citizenProfile.category || "OBC",
      occupation: citizenProfile.occupation || "Farmer",
      landholdingAcres: citizenProfile.landholding_acres || 2.5,
      isStudent: citizenProfile.is_student || false,
      educationLevel: citizenProfile.education_level || "12th",
      incomeCertNo: digilockerData?.income_certificate?.certificate_number || "UP/REV/INC/2024/987124",
      casteCertNo: digilockerData?.caste_certificate?.certificate_number || "UP/REV/CST/2023/110294",
    },
    timestamp: new Date().toISOString(),
  };

  // Persist to localStorage and sessionStorage for cross-tab accessibility
  try {
    localStorage.setItem('sahayak_autofill_session', JSON.stringify(normalizedPayload));
    sessionStorage.setItem('sahayak_autofill_active', 'true');
  } catch (e) {
    console.warn('[Sahayak Bridge] Storage warning:', e);
  }

  // Broadcast to Extension via DOM CustomEvent
  window.dispatchEvent(
    new CustomEvent(EXTENSION_EVENT_TYPE, {
      detail: normalizedPayload,
    })
  );

  // Broadcast via window.postMessage for content script listeners
  window.postMessage(
    {
      source: 'SAHAYAK_WEB_APP',
      type: 'AUTOFILL_DATA_READY',
      payload: normalizedPayload,
    },
    '*'
  );

  // Direct Chrome runtime message if extension ID exists
  if (window.chrome && chrome.runtime && chrome.runtime.sendMessage && registeredExtensionId) {
    try {
      chrome.runtime.sendMessage(
        registeredExtensionId,
        {
          type: 'TRIGGER_AUTOFILL',
          data: normalizedPayload,
        },
        (resp) => {
          console.log('[Sahayak Bridge] Extension direct response:', resp);
        }
      );
    } catch (err) {
      console.warn('[Sahayak Bridge] Direct chrome.runtime message notice:', err);
    }
  }

  return normalizedPayload;
}
