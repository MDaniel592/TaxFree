/*
* TaxFree
* Copyright (c) 2017-2020 Kevin Röbert
*
* This program is free software: you can redistribute it and/or modify
* it under the terms of the GNU Lesser General Public License as published by
* the Free Software Foundation, either version 3 of the License, or
* (at your option) any later version.
*
* This program is distributed in the hope that it will be useful,
* but WITHOUT ANY WARRANTY; without even the implied warranty of
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
* GNU Lesser General Public License for more details.
*
* You should have received a copy of the GNU Lesser General Public License
* along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

/*jshint esversion: 6 */
/*
* This script is responsible for the storage.
*/
var storage = [];
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

    //console.log(translate('core_save_on_disk'));
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
            storage[key] = value.split(',');
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
    storage.ClearURLsData = [];
    storage.TaxFreeStatus = true;
    storage.sendHerePlzStatus = true;
    storage.ShortLinkStatus = true;

    /*     if (getBrowser() === "Firefox") {
            storage.types = ["font", "image", "imageset", "main_frame", "media", "object", "object_subrequest", "other", "script", "stylesheet", "sub_frame", "websocket", "xbl", "xml_dtd", "xmlhttprequest", "xslt"];
            storage.pingRequestTypes = ["ping", "beacon"];
        } else if (getBrowser() === "Chrome") {
            storage.types = ["main_frame", "sub_frame", "stylesheet", "script", "image", "font", "object", "xmlhttprequest", "ping", "csp_report", "media", "websocket", "other"];
            storage.pingRequestTypes = ["ping"];
        } */
}

/**
 * Load local saved data, if the browser is offline or
 * some other network trouble.
 */
/* function loadOldDataFromStore() {
    localDataHash = storage.dataHash;
} */

/*
Tools
*/

function handleError(error) {
    console.log("[TaxFree ERROR]:" + error);
}

function isEmpty(obj) {
    return (Object.getOwnPropertyNames(obj).length === 0);
}

function getBrowser() {
    if (typeof InstallTrigger !== 'undefined') {
        return "Firefox";
    } else {
        return "Chrome";
    }
}

// Start storage and TaxFree
genesis();