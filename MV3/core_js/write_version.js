/**
 * This file writes only the version into every page.
 * @return version
 */
const version = chrome.runtime.getManifest().version;
$("#version").text(version);
