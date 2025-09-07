
const COOKIE_CONSENT_KEY = 'qure_cookie_consent';
const COOKIE_SETTINGS_KEY = 'qure_cookie_settings';

let cookieBanner;
let dismissButton;
let acceptButton;
let strictlyNecessaryCheckbox;
let performanceCheckbox;
let functionalCheckbox;
let advertisingCheckbox;

initCookieBanner();

function initDOMElements() {
  cookieBanner = document.getElementById('qure_cookie_container');
  dismissButton = document.getElementById('ba-cookie-dismiss');
  acceptButton = cookieBanner ? cookieBanner.querySelector('a.btn--primary') : null;
  
  strictlyNecessaryCheckbox = document.getElementById('strictly-necessary-cookies');
  performanceCheckbox = document.getElementById('performance-cookies');
  functionalCheckbox = document.getElementById('functional-cookies');
  advertisingCheckbox = document.getElementById('advertising-cookies');
}

function initCookieBanner() {
  initDOMElements();
  
  const hasConsent = sessionStorage.getItem(COOKIE_CONSENT_KEY);

  if (hasConsent === 'true') {
      hideCookieBanner();
  } else {
      showCookieBanner();
  }

  loadCheckboxStates();
  addEventListeners();
}

function showCookieBanner() {
if (cookieBanner) {
    cookieBanner.classList.remove('d-none');
}
}

function hideCookieBanner() {
if (cookieBanner) {
    cookieBanner.classList.add('d-none');
}
}

function loadCheckboxStates() {
const savedSettings = sessionStorage.getItem(COOKIE_SETTINGS_KEY);

if (savedSettings) {
    try {
    const settings = JSON.parse(savedSettings);
    
        if (strictlyNecessaryCheckbox) {
        strictlyNecessaryCheckbox.checked = settings.strictlyNecessary || false;
    }
    if (performanceCheckbox) {
        performanceCheckbox.checked = settings.performance || false;
    }
    if (functionalCheckbox) {
        functionalCheckbox.checked = settings.functional || false;
    }
    if (advertisingCheckbox) {
        advertisingCheckbox.checked = settings.advertising || false;
    }
      } catch (error) {
      }
} else {
    if (strictlyNecessaryCheckbox) {
    strictlyNecessaryCheckbox.checked = true;
    }
}
}

function saveCheckboxStates() {
const settings = {
    strictlyNecessary: strictlyNecessaryCheckbox ? strictlyNecessaryCheckbox.checked : false,
    performance: performanceCheckbox ? performanceCheckbox.checked : false,
    functional: functionalCheckbox ? functionalCheckbox.checked : false,
    advertising: advertisingCheckbox ? advertisingCheckbox.checked : false
};

sessionStorage.setItem(COOKIE_SETTINGS_KEY, JSON.stringify(settings));
}

function addEventListeners() {
    if (acceptButton) {
        acceptButton.addEventListener('click', function(e) {
            e.preventDefault();
            handleAcceptCookies();
        });
    }

    if (dismissButton) {
        dismissButton.addEventListener('click', function(e) {
            e.preventDefault();
            handleDismissCookies();
        });
    }

const checkboxes = [strictlyNecessaryCheckbox, performanceCheckbox, functionalCheckbox, advertisingCheckbox];

checkboxes.forEach(checkbox => {
    if (checkbox) {
    checkbox.addEventListener('change', function() {
        saveCheckboxStates();
    });
    }
});
}

function handleAcceptCookies() {
saveCheckboxStates();

sessionStorage.setItem(COOKIE_CONSENT_KEY, 'true');

hideCookieBanner();

    activateCookies();
}

function handleDismissCookies() {
sessionStorage.setItem(COOKIE_CONSENT_KEY, 'true');

hideCookieBanner();

activateEssentialCookies();
}

function activateCookies() {
const settings = JSON.parse(sessionStorage.getItem(COOKIE_SETTINGS_KEY) || '{}');

    if (settings.performance) {
    }
    
    if (settings.functional) {
    }
    
    if (settings.advertising) {
    }
}

function activateEssentialCookies() {
}

// Function to reset settings (for testing)
window.resetCookieSettings = function() {
  sessionStorage.removeItem(COOKIE_CONSENT_KEY);
  sessionStorage.removeItem(COOKIE_SETTINGS_KEY);
  location.reload();
};