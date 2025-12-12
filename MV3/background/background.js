/**
 * TaxFree Background Service Worker
 * Handles extension initialization and page monitoring
 */

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Handle extension installation
 * Sets default values for all settings
 */
chrome.runtime.onInstalled.addListener(() => {
  try {
    const initialData = {
      TaxFreeStatus: true,
      ShortLinkStatus: true,
      TaxFreePercent: 0,
    };

    chrome.storage.local.set(initialData).catch((error) => {
      console.error("[TaxFree Background] Installation setup error:", error);
    });

    console.log("[TaxFree Background] Extension installed");
  } catch (error) {
    console.error("[TaxFree Background] onInstalled error:", error);
  }
});

/**
 * Listen for tab URL changes
 * Notifies content scripts when navigating between product pages
 */
chrome.tabs.onUpdated.addListener(onTabUpdated);

// ============================================================================
// TAB MONITORING
// ============================================================================

/** Cache of current tab URL to detect changes */
let savedURL = "";

/**
 * Handle tab update events
 * @param {number} tabId - Tab ID
 * @param {Object} changeInfo - Object describing the change
 * @param {string} changeInfo.url - The URL of the tab (if changed)
 * @param {Object} tab - Tab object with current state
 */
function onTabUpdated(tabId, changeInfo, tab) {
  try {
    // Only process Amazon URLs
    if (!changeInfo || !tab || tab.url.indexOf("www.amazon.") === -1) {
      return;
    }

    let newTabURL = changeInfo.url || "";

    // Only process Amazon domains
    if (newTabURL.indexOf("www.amazon.") === -1) {
      return;
    }

    // Clean URL to get product path
    newTabURL = clearURL(newTabURL);
    if (!newTabURL) {
      return;
    }

    // First run - initialize saved URL
    if (savedURL === "") {
      savedURL = clearURL(tab.url);
      if (!savedURL) {
        return;
      }
      console.log(`[TaxFree Background] Tracking URL: ${savedURL}`);
    }

    // Ignore if URL hasn't changed
    if (savedURL === newTabURL) {
      return;
    }

    // URL changed to a different product page
    savedURL = newTabURL;
    notifyTabOfURLChange(tabId);
  } catch (error) {
    console.error("[TaxFree Background] onTabUpdated error:", error);
  }
}

/**
 * Send message to content script about URL change
 * @param {number} tabId - Tab ID to notify
 */
function notifyTabOfURLChange(tabId) {
  try {
    chrome.storage.local.get("TaxFreeStatus", (result) => {
      try {
        const isActive = result?.TaxFreeStatus !== false;
        const message = {
          txt: "FREETAX",
          value: isActive,
          url: savedURL,
          valid: true,
        };

        chrome.tabs.sendMessage(tabId, message).catch((error) => {
          // Ignore errors if content script isn't loaded yet
          if (error.message.indexOf("Could not establish connection") === -1) {
            console.warn("[TaxFree Background] sendMessage error:", error.message);
          }
        });
      } catch (error) {
        console.error("[TaxFree Background] notifyTabOfURLChange inner error:", error);
      }
    });
  } catch (error) {
    console.error("[TaxFree Background] notifyTabOfURLChange error:", error);
  }
}

// ============================================================================
// URL UTILITIES
// ============================================================================

/**
 * Extract and clean product URL from Amazon page URL
 * Removes query parameters and keeps only the product path
 * @param {string} url - Full URL to process
 * @returns {string} Cleaned URL (e.g., "https://www.amazon.es/dp/ASIN") or empty string
 */
function clearURL(url) {
  try {
    if (!url) return "";

    // Extract Amazon domain
    const idx1 = url.indexOf("amazon");
    const idx2 = url.indexOf("/", idx1);
    if (idx1 === -1 || idx2 === -1) return "";

    const amazonDomain = url.slice(0, idx2);

    // Extract product path (/dp/ASIN or /gp/ASIN)
    const regex = /\/dp\/\S+|\/gp\/\S+/g;
    const matches = url.match(regex);

    if (!matches || matches.length === 0) {
      return "";
    }

    // Remove query parameters from the match
    const productPath = matches[0].split("?")[0];
    return amazonDomain + productPath;
  } catch (error) {
    console.error("[TaxFree Background] clearURL error:", error);
    return "";
  }
}

// ============================================================================
// ERROR HANDLING
// ============================================================================

/**
 * Handle errors with logging
 * @param {Error|string} error - Error object or message
 */
function handleError(error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`[TaxFree Background ERROR]: ${message}`);
}
