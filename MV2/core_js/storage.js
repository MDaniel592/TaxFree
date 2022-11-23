browser.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.function === "getData") sendResponse({ response: getData(request.params) });
  if (request.function === "setData") sendResponse({ response: setData(request.params[0], request.params[1]) });
  if (request.function === "saveOnExit") sendResponse({ response: saveOnExit() });
  if (request.function === "genesis") sendResponse({ response: genesis() });
});

/*jshint esversion: 6 */
/*
 * This script is responsible for the storage.
 */
var storage = {};
var hasPendingSaves = false;
var pendingSaves = new Set();

/**
 * Writes the storage variable to the disk.
 */
function saveOnExit() {
  saveOnDisk(Object.keys(storage));
}

/**
 * Returns the storage as JSON.
 */
function storageAsJSON() {
  let json = {};

  Object.entries(storage).forEach(([key, value]) => {
    json[key] = storageDataAsString(key);
  });

  return json;
}

/**
 * Converts a given storage data to its string representation.
 * @param key           key of the storage data
 * @returns {string}    string representation
 */
function storageDataAsString(key) {
  let value = storage[key];

  switch (key) {
    case "types":
      return value.toString();
    default:
      return value;
  }
}

/**
 * Save multiple keys on the disk.
 * @param  {String[]} keys
 */
function saveOnDisk(keys) {
  let json = {};

  keys.forEach(function (key) {
    json[key] = storageDataAsString(key);
  });

  browser.storage.local.set(json).catch(handleError);
}

/**
 * Schedule to save a key to disk in 30 seconds.
 * @param  {String} key
 */
function deferSaveOnDisk(key) {
  if (hasPendingSaves) {
    pendingSaves.add(key);
    return;
  }

  setTimeout(function () {
    saveOnDisk(Array.from(pendingSaves));
    pendingSaves.clear();
    hasPendingSaves = false;
  }, 30000);
  hasPendingSaves = true;
}

/**
 * Start sequence for TaxFree.
 */
function genesis() {
  browser.storage.local.get(null).then((items) => {
    initStorage(items);
  }, handleError);
}

/**
 * Return the value under the key.
 * @param  {String} key
 * @return {Object}
 */
function getData(key) {
  return storage[key];
}

/**
 * Return the entire storage object.
 * @return {Object}
 */
function getEntireData() {
  return storage;
}

/**
 * Save the value under the key on the RAM.
 *
 * Note: To store the data on the hard disk, one of
 *  deferSaveOnDisk(), saveOnDisk(), or saveOnExit()
 *  must be called.
 * @param {String} key
 * @param {Object} value
 */
function setData(key, value) {
  switch (key) {
    case "types":
      storage[key] = value.split(",");
      break;

    default:
      storage[key] = value;
  }
}

/**
 * Set default values, if the storage is empty.
 * @param  {Object} items
 */
function initStorage(items) {
  initSettings();
  if (!isEmpty(items)) {
    Object.entries(items).forEach(([key, value]) => {
      setData(key, value);
    });
  }
}

/**
 * Set default values for the settings.
 */
function initSettings() {
  storage.TaxFreeStatus = true;
  storage.sendHerePlzStatus = true;
  storage.ShortLinkStatus = true;
  storage.TaxFreePercent = 0;
}

/*
Tools
*/
function handleError(error) {
  console.log("[TaxFree ERROR]:" + error);
}

function isEmpty(obj) {
  return Object.getOwnPropertyNames(obj).length === 0;
}

function getBrowser() {
  if (typeof InstallTrigger !== "undefined") {
    return "Firefox";
  } else {
    return "Chrome";
  }
}

// Initialize the storage variables
genesis();
