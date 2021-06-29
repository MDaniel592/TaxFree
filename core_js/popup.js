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

document.addEventListener("DOMContentLoaded", function () {
    var listener1 = document.getElementById("TaxFreeButton");
    var listener2 = document.getElementById("sendHerePlzButton");
    var listener3 = document.getElementById("ShortLinkButton");

    listener1.addEventListener('click', ReloadOnClick);
    listener2.addEventListener('click', ReloadOnClick);
    listener3.addEventListener('click', ReloadOnClick);
});



var globalCounter;
var globalurlcounter;
var TaxFreeStatus;
var ShortLinkStatus;
var sendHerePlzStatus;

/**
* Initialize the UI.
*
*/
function init() {
    setSwitchButton("TaxFreeButton", "TaxFreeStatus");
    setSwitchButton("sendHerePlzButton", "sendHerePlzStatus");
    setSwitchButton("ShortLinkButton", "ShortLinkStatus");
}

/**
* Change the value of a switch button.
* @param  {string} id        HTML id
* @param  {string} storageID storage internal id
*/
function changeSwitchButton(id, storageID) {
    let element = $('#' + id);

    element.on('change', function () {
        browser.runtime.sendMessage({
            function: "setData",
            params: [storageID, element.is(':checked')]
        }).then((data) => {
            browser.runtime.sendMessage({
                function: "saveOnExit",
                params: []
            }).catch(handleError);
        }).catch(handleError);
    });
}

/**
* Set the value of a switch button.
* @param {string} id      HTML id
* @param {string} varname js internal variable name
*/
function setSwitchButton(id, varname) {
    let element = $('#' + id);
    element.prop('checked', this[varname]);

    let element2 = $('#' + 'ShortLinkButton');
    if (varname == 'badgedStatus' && this[varname] == false) {
        element2.attr('disabled', true);
    } else if (varname == 'badgedStatus' && this[varname] == true) {
        element2.attr('disabled', false);
    } else {
        //Nothing to do here
    }
}

$(document).ready(function () {
    loadData("globalCounter")
        .then(() => loadData("TaxFreeStatus"))
        .then(() => loadData("sendHerePlzStatus"))
        .then(() => loadData("ShortLinkStatus"))
        .then(() => {
            init();
            changeSwitchButton("TaxFreeButton", "TaxFreeStatus"); // TaxFree
            changeSwitchButton("sendHerePlzButton", "sendHerePlzStatus"); // SendHerePlz
            changeSwitchButton("ShortLinkButton", "ShortLinkStatus"); // ShortLink

            //$('#loggingPage').attr('href', browser.extension.getURL('./html/log.html'));
            //$('#settings').attr('href', browser.extension.getURL('./html/settings.html'));
            //$('#cleaning_tools').attr('href', browser.extension.getURL('./html/cleaningTool.html'));
            setText();
        });
});

/**
* Set the text for the UI.
*/
function setText() {
    injectText('configs_head', 'popup_html_configs_head'); // Configuration header
    injectText('configs_switch_filter', 'popup_html_configs_switch_filter'); // TaxFree
    injectText('configs_switch_tag', 'configs_switch_tag'); // SendHerePlz
    injectText('configs_switch_statistics', 'configs_switch_statistics'); // ShortLink

    //$('#donate').prop('title', translate('donate_button')); 
}

/**
* Helper function to inject the translated text and tooltip.
*
* @param   {string}    id ID of the HTML element
* @param   {string}    attribute Name of the attribute used for localization
* @param   {string}   tooltip
*/
function injectText(id, attribute, tooltip = "") {
    let object = $('#' + id);
    object.text(translate(attribute));

    /*
    This function will throw an error if no translation
    is found for the tooltip. This is a planned error.
    */
    tooltip = translate(attribute + "_title");

    if (tooltip !== "") {
        object.prop('title', tooltip);
    }
}

/**
 * Loads data from storage and saves into local variable.
 *
 * @param name data name
 * @param varName variable name
 * @returns {Promise<data>} requested data
 */
async function loadData(name, varName = name) {
    return new Promise((resolve, reject) => {
        browser.runtime.sendMessage({
            function: "getData",
            params: [name]
        }).then(data => {
            this[varName] = data.response;
            resolve(data);
        }, handleError);
    });
}

/**
* Translate a string with the i18n API.
*
* @param {string} string Name of the attribute used for localization
*/
function translate(string) {
    return browser.i18n.getMessage(string);
}

function handleError(error) {
    console.log(`Error: ${error}`);
}


// RELOAD WHEN SWITCHING
function ReloadOnClick() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.reload(tabs[0].id);
        var delayInMilliseconds = 500;
        setTimeout(function () {
            window.close();
        }, delayInMilliseconds);
    });
}


