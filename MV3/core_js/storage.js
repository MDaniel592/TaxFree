/**
 * TaxFree Storage Manager
 * Handles all persistent storage operations and inter-script communication
 */

chrome.runtime.onMessage.addListener(handleStorageMessage);

// ============================================================================
// STATE
// ============================================================================

/** In-memory storage cache */
let storage = {};

/** Flag indicating save operation is pending */
let hasPendingSaves = false;

/** Set of keys waiting to be saved */
let pendingSaves = new Set();

// ============================================================================
// MESSAGE HANDLING
// ============================================================================

/**
 * Handle incoming messages from content scripts and popup
 * @param {Object} request - Message request object
 * @param {string} request.function - Function to call ("getData", "setData", "saveOnExit", "genesis")
 * @param {Array} request.params - Function parameters
 * @param {Object} sender - Sender information
 * @param {Function} sendResponse - Callback to send response
 */
function handleStorageMessage(request, sender, sendResponse) {
  try {
    if (!request || !request.function) {
      sendResponse({ response: null });
      return;
    }

    let response = null;

    switch (request.function) {
      case "getData":
        response = getData(request.params?.[0]);
        break;
      case "setData":
        response = setData(request.params?.[0], request.params?.[1]);
        break;
      case "saveOnExit":
        response = saveOnExit();
        break;
      case "genesis":
        response = genesis();
        break;
      default:
        console.warn(`[TaxFree Storage] Unknown function: ${request.function}`);
    }

    sendResponse({ response });
  } catch (error) {
    console.error("[TaxFree Storage] Error handling message:", error);
    sendResponse({ response: null, error: error.message });
  }
}

// ============================================================================
// SAVE OPERATIONS
// ============================================================================

/**
 * Save all modified keys to disk immediately
 */
function saveOnExit() {
  try {
    saveOnDisk(Object.keys(storage));
    console.log("[TaxFree Storage] Data saved to disk");
    return true;
  } catch (error) {
    console.error("[TaxFree Storage ERROR] saveOnExit:", error);
    return false;
  }
}

/**
 * Save multiple keys to disk
 * @param {string[]} keys - Array of keys to save
 */
function saveOnDisk(keys) {
  try {
    const json = {};
    keys.forEach((key) => {
      json[key] = storageDataAsString(key);
    });

    chrome.storage.local.set(json).catch((error) => {
      console.error("[TaxFree Storage] Save error:", error);
    });
  } catch (error) {
    console.error("[TaxFree Storage ERROR] saveOnDisk:", error);
  }
}

/**
 * Schedule a save operation with 30-second debounce
 * Prevents excessive disk writes during rapid changes
 * @param {string} key - Key to save
 */
function deferSaveOnDisk(key) {
  try {
    if (hasPendingSaves) {
      pendingSaves.add(key);
      return;
    }

    hasPendingSaves = true;
    setTimeout(() => {
      try {
        saveOnDisk(Array.from(pendingSaves));
        pendingSaves.clear();
        hasPendingSaves = false;
      } catch (error) {
        console.error("[TaxFree Storage ERROR] deferSaveOnDisk timeout:", error);
        hasPendingSaves = false;
      }
    }, 30000);
  } catch (error) {
    console.error("[TaxFree Storage ERROR] deferSaveOnDisk:", error);
  }
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize storage with data from disk
 * Called on extension startup
 */
function genesis() {
  try {
    chrome.storage.local.get(null).then((items) => {
      initStorage(items);
      console.log("[TaxFree Storage] Genesis completed");
    });
    return true;
  } catch (error) {
    console.error("[TaxFree Storage ERROR] genesis:", error);
    return false;
  }
}

/**
 * Initialize in-memory storage with default values and persisted data
 * @param {Object} items - Data from chrome.storage.local
 */
function initStorage(items) {
  try {
    initSettings(); // Set defaults first

    if (!isEmpty(items)) {
      Object.entries(items).forEach(([key, value]) => {
        setData(key, value);
      });
    }

    console.log("[TaxFree Storage] Storage initialized");
  } catch (error) {
    console.error("[TaxFree Storage ERROR] initStorage:", error);
  }
}

/**
 * Set default settings values
 * Called during initialization
 */
function initSettings() {
  storage.TaxFreeStatus = true;
  storage.sendHerePlzStatus = true;
  storage.ShortLinkStatus = true;
  storage.TaxFreePercent = 0;
}

// ============================================================================
// DATA OPERATIONS
// ============================================================================

/**
 * Get a value from storage
 * @param {string} key - Storage key
 * @returns {*} Stored value or undefined
 */
function getData(key) {
  try {
    return storage[key];
  } catch (error) {
    console.error(`[TaxFree Storage ERROR] getData(${key}):`, error);
    return undefined;
  }
}

/**
 * Get the entire storage object
 * @returns {Object} Copy of storage object
 */
function getEntireData() {
  try {
    return { ...storage };
  } catch (error) {
    console.error("[TaxFree Storage ERROR] getEntireData:", error);
    return {};
  }
}

/**
 * Set a value in storage
 * Data is stored in RAM; use saveOnDisk/deferSaveOnDisk to persist to disk
 * @param {string} key - Storage key
 * @param {*} value - Value to store
 */
function setData(key, value) {
  try {
    switch (key) {
      case "types":
        storage[key] = typeof value === "string" ? value.split(",") : value;
        break;
      default:
        storage[key] = value;
    }
    console.log(`[TaxFree Storage] Data set - ${key}: ${value}`);
  } catch (error) {
    console.error(`[TaxFree Storage ERROR] setData(${key}):`, error);
  }
}

/**
 * Convert storage data to string representation for persistence
 * @param {string} key - Storage key
 * @returns {string} String representation of value
 */
function storageDataAsString(key) {
  try {
    const value = storage[key];

    switch (key) {
      case "types":
        return Array.isArray(value) ? value.toString() : String(value);
      default:
        return String(value);
    }
  } catch (error) {
    console.error(`[TaxFree Storage ERROR] storageDataAsString(${key}):`, error);
    return "";
  }
}

/**
 * Convert storage to JSON object for export/debugging
 * @returns {Object} JSON representation of storage
 */
function storageAsJSON() {
  try {
    const json = {};
    Object.entries(storage).forEach(([key]) => {
      json[key] = storageDataAsString(key);
    });
    return json;
  } catch (error) {
    console.error("[TaxFree Storage ERROR] storageAsJSON:", error);
    return {};
  }
}

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Handle errors with logging
 * @param {Error} error - Error object
 */
function handleError(error) {
  console.error(`[TaxFree Storage ERROR]: ${error.message || error}`);
}

/**
 * Check if an object is empty
 * @param {Object} obj - Object to check
 * @returns {boolean} True if object has no own properties
 */
function isEmpty(obj) {
  return Object.getOwnPropertyNames(obj).length === 0;
}

/**
 * Detect the current browser
 * @returns {string} "Firefox" or "Chrome"
 */
function getBrowser() {
  return typeof InstallTrigger !== "undefined" ? "Firefox" : "Chrome";
}

// ============================================================================
// STARTUP
// ============================================================================

// Initialize storage on script load
genesis();
