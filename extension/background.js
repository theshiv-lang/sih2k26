/**
 * Sahayak Extension Service Worker (Manifest V3)
 * Manages cross-origin messages, credentials cache, and automatic content script injection.
 */

console.log('[Sahayak Extension] Service Worker initialized.');

// In-memory session cache
let currentAutofillSession = null;

// Initialize session from storage on startup
chrome.storage.local.get(['sahayak_session'], (result) => {
  if (result.sahayak_session) {
    currentAutofillSession = result.sahayak_session;
    console.log('[Sahayak SW] Loaded session from storage:', currentAutofillSession.scheme?.title);
  }
});

// Listen for external messages from the Sahayak React Web App (localhost / 127.0.0.1)
chrome.runtime.onMessageExternal.addListener((message, sender, sendResponse) => {
  console.log('[Sahayak SW] Received external message:', message, 'from:', sender);

  if (message.type === 'PING') {
    sendResponse({ status: 'PONG', active: true, version: '1.0.0' });
    return true;
  }

  if (message.type === 'TRIGGER_AUTOFILL') {
    const payload = message.data;
    currentAutofillSession = payload;

    chrome.storage.local.set({ sahayak_session: payload }, () => {
      console.log('[Sahayak SW] Autofill session persisted for scheme:', payload.scheme?.title);

      // Notify all tabs matching demo_portal or government portals
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach((tab) => {
          if (tab.id && tab.url && (tab.url.includes('demo_portal.html') || tab.url.includes('scholarships.gov.in') || tab.url.includes('pmkisan.gov.in') || tab.url.includes('pmayg.nic.in'))) {
            chrome.tabs.sendMessage(tab.id, { type: 'EXECUTE_AUTOFILL', data: payload }, () => {
              // Ignore if content script isn't ready
              chrome.runtime.lastError;
            });
          }
        });
      });

      sendResponse({ success: true, message: 'Autofill data queued for form injection' });
    });
    return true;
  }
});

// Automatic form injection on tab load / navigation
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    chrome.storage.local.get(['sahayak_session'], (result) => {
      const session = result.sahayak_session || currentAutofillSession;
      if (session && session.citizen) {
        // Send session to content script on the newly loaded tab
        setTimeout(() => {
          chrome.tabs.sendMessage(tabId, { type: 'INIT_PAGE_SESSION', data: session }, (resp) => {
            if (chrome.runtime.lastError) {
              // Script may not be on this page or not loaded yet
            } else {
              console.log('[Sahayak SW] Tab initialized with session:', resp);
            }
          });
        }, 300);
      }
    });
  }
});

// Listen for internal messages from popup.js and content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log('[Sahayak SW] Internal message:', message.type);

  if (message.type === 'GET_CURRENT_PAYLOAD') {
    chrome.storage.local.get(['sahayak_session'], (result) => {
      const data = result.sahayak_session || currentAutofillSession;
      sendResponse({ data });
    });
    return true;
  }

  if (message.type === 'SET_CURRENT_PAYLOAD') {
    currentAutofillSession = message.data;
    chrome.storage.local.set({ sahayak_session: message.data }, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  if (message.type === 'TRIGGER_TAB_AUTOFILL') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs[0]) {
        chrome.storage.local.get(['sahayak_session'], (result) => {
          const data = result.sahayak_session || currentAutofillSession;
          chrome.tabs.sendMessage(tabs[0].id, { type: 'EXECUTE_AUTOFILL', data }, (res) => {
            sendResponse(res || { success: true });
          });
        });
      }
    });
    return true;
  }

  if (message.type === 'CLEAR_SESSION') {
    currentAutofillSession = null;
    chrome.storage.local.remove(['sahayak_session'], () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
