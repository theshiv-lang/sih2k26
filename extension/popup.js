document.addEventListener('DOMContentLoaded', () => {
  const cardName = document.getElementById('cardName');
  const cardAadhaar = document.getElementById('cardAadhaar');
  const cardIncome = document.getElementById('cardIncome');
  const cardCategory = document.getElementById('cardCategory');
  const btnAutofill = document.getElementById('btnAutofillCurrentTab');
  const btnOpenSahayak = document.getElementById('btnOpenSahayak');

  // Load cached session payload from background/storage
  chrome.runtime.sendMessage({ type: 'GET_CURRENT_PAYLOAD' }, (response) => {
    if (response && response.data && response.data.citizen) {
      const c = response.data.citizen;
      if (cardName) cardName.textContent = c.fullName || 'Rameshwar Sharma';
      if (cardAadhaar) cardAadhaar.textContent = c.aadhaarMasked || 'XXXX-XXXX-4812';
      if (cardIncome) cardIncome.textContent = `₹${(c.annualIncome || 180000).toLocaleString('en-IN')}`;
      if (cardCategory) cardCategory.textContent = `${c.socialCategory || 'OBC'} (Verified)`;
    }
  });

  if (btnAutofill) {
    btnAutofill.addEventListener('click', () => {
      btnAutofill.textContent = 'Injecting Fields...';
      chrome.runtime.sendMessage({ type: 'TRIGGER_TAB_AUTOFILL' }, (res) => {
        btnAutofill.textContent = '✅ Form Auto-Filled!';
        setTimeout(() => {
          btnAutofill.textContent = '⚡ Auto-Fill Active Portal Tab';
        }, 1800);
      });
    });
  }

  if (btnOpenSahayak) {
    btnOpenSahayak.addEventListener('click', () => {
      chrome.tabs.create({ url: 'http://localhost:5173' });
    });
  }
});
