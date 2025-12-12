/**
 * TaxFree Popup UI Controller
 * Manages user preferences and settings synchronization
 */

// ============================================================================
// STATE VARIABLES
// ============================================================================

let TaxFreePercent = 0;
let TaxFreeStatus = true;
let ShortLinkStatus = true;

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize UI and event listeners when DOM is loaded
 */
document.addEventListener("DOMContentLoaded", function () {
  try {
    initializeEventListeners();
    initializePopup();
  } catch (error) {
    console.error("[TaxFree Popup ERROR] DOMContentLoaded:", error);
  }
});

/**
 * Set up event listeners for all controls
 */
function initializeEventListeners() {
  const controls = [
    { id: "TaxFreeButton", handler: handleSettingChange },
    { id: "ShortLinkButton", handler: handleSettingChange },
    { id: "TaxFreePercent", handler: handleSettingChange },
  ];

  controls.forEach((control) => {
    const element = document.getElementById(control.id);
    if (element) {
      element.addEventListener("click", control.handler);
      element.addEventListener("change", control.handler);
    } else {
      console.warn(`[TaxFree Popup] Control not found: ${control.id}`);
    }
  });
}

// ============================================================================
// INITIALIZATION SEQUENCE
// ============================================================================

/**
 * Initialize the popup UI by loading data from storage
 */
function initializePopup() {
  try {
    // Load all settings from storage synchronously
    chrome.storage.local.get(
      ["TaxFreeStatus", "ShortLinkStatus", "TaxFreePercent"],
      (items) => {
        try {
          // Update global variables with stored values
          TaxFreeStatus = items.TaxFreeStatus !== undefined ? items.TaxFreeStatus : true;
          ShortLinkStatus = items.ShortLinkStatus !== undefined ? items.ShortLinkStatus : true;
          TaxFreePercent = items.TaxFreePercent !== undefined ? items.TaxFreePercent : 0;

          // Set UI elements based on loaded values
          setSwitchButtonDirect("TaxFreeButton", TaxFreeStatus);
          setSwitchButtonDirect("ShortLinkButton", ShortLinkStatus);
          setInputValueDirect("TaxFreePercent", TaxFreePercent);
          setText();
          console.log("[TaxFree Popup] Initialization complete", items);
        } catch (error) {
          console.error("[TaxFree Popup ERROR] initializePopup callback:", error);
        }
      }
    );
  } catch (error) {
    console.error("[TaxFree Popup ERROR] initializePopup:", error);
  }
}

// ============================================================================
// DATA LOADING (DEPRECATED - Direct storage access is used instead)
// ============================================================================

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

/**
 * Set the value of an input field directly
 * @param {string} elementId - HTML element ID
 * @param {*} value - Value to set
 */
function setInputValueDirect(elementId, value) {
  try {
    const element = document.getElementById(elementId);
    if (element) {
      element.value = value !== undefined ? value : "";
    }
  } catch (error) {
    console.error(`[TaxFree Popup ERROR] setInputValueDirect for ${elementId}:`, error);
  }
}

/**
 * Set the checked state of a switch button directly
 * @param {string} elementId - HTML element ID
 * @param {boolean} checked - Whether checkbox should be checked
 */
function setSwitchButtonDirect(elementId, checked) {
  try {
    const element = document.getElementById(elementId);
    if (element) {
      element.checked = checked === true;
    }
  } catch (error) {
    console.error(`[TaxFree Popup ERROR] setSwitchButtonDirect for ${elementId}:`, error);
  }
}


/**
 * Set localized text from i18n strings
 */
function setText() {
  try {
    injectText("configs_head", "popup_html_configs_head");
    injectText("configs_switch_filter", "popup_html_configs_switch_filter");
    injectText("configs_switch_statistics", "configs_switch_statistics");
    injectText("configs_percent", "popup_html_configs_percent");
  } catch (error) {
    console.error("[TaxFree Popup ERROR] setText:", error);
  }
}

/**
 * Helper to inject localized text and tooltips
 * @param {string} elementId - HTML element ID
 * @param {string} messageKey - i18n message key
 * @param {string} tooltipKey - Optional tooltip message key
 */
function injectText(elementId, messageKey, tooltipKey = messageKey + "_title") {
  try {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`[TaxFree Popup] Element not found: ${elementId}`);
      return;
    }

    const text = chrome.i18n.getMessage(messageKey);
    if (text) {
      element.textContent = text;
    }

    const tooltip = chrome.i18n.getMessage(tooltipKey);
    if (tooltip) {
      element.title = tooltip;
    }
  } catch (error) {
    console.error(`[TaxFree Popup ERROR] injectText for ${elementId}:`, error);
  }
}

// ============================================================================
// SETTINGS MANAGEMENT
// ============================================================================

/**
 * Handle setting change for switch buttons
 * @param {HTMLElement} element - Switch button element
 * @param {string} storageKey - Key in storage
 */
function handleSwitchChange(element, storageKey) {
  try {
    const newValue = element.checked;

    // Update global variable immediately
    updateGlobalVariable(storageKey, newValue);

    // Save directly to chrome.storage.local
    chrome.storage.local.set({ [storageKey]: newValue })
      .then(() => {
        console.log(`[TaxFree Popup] Setting changed - ${storageKey}: ${newValue}`);
        reloadPage();
      })
      .catch(handleError);
  } catch (error) {
    console.error("[TaxFree Popup ERROR] handleSwitchChange:", error);
  }
}

/**
 * Handle setting change for input fields
 * @param {HTMLElement} element - Input element
 * @param {string} storageKey - Key in storage
 */
function handleInputChange(element, storageKey) {
  try {
    const newValue = element.value;

    // Validate tax percentage input
    if (storageKey === "TaxFreePercent") {
      const numValue = parseFloat(newValue);
      if (isNaN(numValue) || numValue < 0 || numValue > 100) {
        alert("Please enter a valid tax percentage (0-100)");
        element.value = TaxFreePercent;
        return;
      }
    }

    // Update global variable immediately
    updateGlobalVariable(storageKey, newValue);

    // Save directly to chrome.storage.local
    chrome.storage.local.set({ [storageKey]: newValue })
      .then(() => {
        console.log(`[TaxFree Popup] Setting changed - ${storageKey}: ${newValue}`);
        reloadPage();
      })
      .catch(handleError);
  } catch (error) {
    console.error("[TaxFree Popup ERROR] handleInputChange:", error);
  }
}

/**
 * Handle any setting change event
 * Dispatches to appropriate handler based on element type
 * @param {Event} event - Change event
 */
function handleSettingChange(event) {
  try {
    const element = event.target;
    const elementId = element.id;

    // Map element IDs to storage keys
    const mappings = {
      TaxFreeButton: { storageKey: "TaxFreeStatus", type: "switch" },
      ShortLinkButton: { storageKey: "ShortLinkStatus", type: "switch" },
      TaxFreePercent: { storageKey: "TaxFreePercent", type: "input" },
    };

    const mapping = mappings[elementId];
    if (!mapping) {
      console.warn(`[TaxFree Popup] Unknown element: ${elementId}`);
      return;
    }

    if (mapping.type === "switch") {
      handleSwitchChange(element, mapping.storageKey);
    } else if (mapping.type === "input") {
      handleInputChange(element, mapping.storageKey);
    }
  } catch (error) {
    console.error("[TaxFree Popup ERROR] handleSettingChange:", error);
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Update global variable based on storage key
 * @param {string} storageKey - The storage key
 * @param {*} value - The new value
 */
function updateGlobalVariable(storageKey, value) {
  try {
    switch (storageKey) {
      case "TaxFreeStatus":
        TaxFreeStatus = value;
        break;
      case "ShortLinkStatus":
        ShortLinkStatus = value;
        break;
      case "TaxFreePercent":
        TaxFreePercent = value;
        break;
      default:
        console.warn(`[TaxFree Popup] Unknown storage key: ${storageKey}`);
    }
  } catch (error) {
    console.error("[TaxFree Popup ERROR] updateGlobalVariable:", error);
  }
}

/**
 * Reload the active tab
 */
function reloadPage() {
  try {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs && tabs[0]) {
        chrome.tabs.reload(tabs[0].id);
        // Close popup after brief delay
        setTimeout(() => window.close(), 500);
      }
    });
  } catch (error) {
    console.error("[TaxFree Popup ERROR] reloadPage:", error);
  }
}

/**
 * Handle errors with logging
 * @param {Error|string} error - Error object or message
 */
function handleError(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[TaxFree Popup ERROR]: ${message}`);
}
