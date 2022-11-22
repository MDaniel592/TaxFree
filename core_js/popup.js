document.addEventListener("DOMContentLoaded", function () {
  var listener1 = document.getElementById("TaxFreeButton");
  var listener2 = document.getElementById("sendHerePlzButton");
  var listener3 = document.getElementById("ShortLinkButton");
  var listener4 = document.getElementById("TaxFreePercent");

  listener1.addEventListener("click", Reload);
  listener2.addEventListener("click", Reload);
  listener3.addEventListener("click", Reload);
  listener4.addEventListener("change", Reload);
});

var TaxFreePercent;
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
  setInputValue("TaxFreePercent", "TaxFreePercent");
}

/**
 * Change the value of an input.
 * @param  {string} id        HTML id
 * @param  {string} storageID storage internal id
 */
function changeInputValue(id, storageID) {
  let element = $("#" + id);

  element.on("change", function () {
    browser.runtime
      .sendMessage({
        function: "setData",
        params: [storageID, element[0].value],
      })
      .then((data) => {
        browser.runtime
          .sendMessage({
            function: "saveOnExit",
            params: [],
          })
          .catch(handleError);
      })
      .catch(handleError);
  });
}

/**
 * Change the value of a switch button.
 * @param  {string} id        HTML id
 * @param  {string} storageID storage internal id
 */
function changeSwitchButton(id, storageID) {
  let element = $("#" + id);

  element.on("change", function () {
    browser.runtime
      .sendMessage({
        function: "setData",
        params: [storageID, element.is(":checked")],
      })
      .then((data) => {
        browser.runtime
          .sendMessage({
            function: "saveOnExit",
            params: [],
          })
          .catch(handleError);
      })
      .catch(handleError);
  });
}

/**
 * Set the value of an input.
 * @param {string} id      HTML id
 * @param {string} varname js internal variable name
 */
function setInputValue(id, varname) {
  let element = $("#" + id);
  element.prop("value", this[varname]);
}

/**
 * Set the value of a switch button.
 * @param {string} id      HTML id
 * @param {string} varname js internal variable name
 */
function setSwitchButton(id, varname) {
  let element = $("#" + id);
  element.prop("checked", this[varname]);
}

/**
 * Set the text for the UI.
 */
function setText() {
  injectText("configs_head", "popup_html_configs_head"); // Configuration header
  injectText("configs_switch_filter", "popup_html_configs_switch_filter"); // TaxFree
  injectText("configs_switch_tag", "configs_switch_tag"); // SendHerePlz
  injectText("configs_switch_statistics", "configs_switch_statistics"); // ShortLink
  injectText("configs_percent", "popup_html_configs_percent"); // Percent
}

/**
 * Helper function to inject the translated text and tooltip.
 *
 * @param   {string}    id ID of the HTML element
 * @param   {string}    attribute Name of the attribute used for localization
 * @param   {string}   tooltip
 */
function injectText(id, attribute, tooltip = "") {
  let object = $("#" + id);
  object.text(translate(attribute));

  /*
    This function will throw an error if no translation
    is found for the tooltip. This is a planned error.
    */
  tooltip = translate(attribute + "_title");

  if (tooltip !== "") {
    object.prop("title", tooltip);
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
    browser.runtime
      .sendMessage({
        function: "getData",
        params: [name],
      })
      .then((data) => {
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
function Reload() {
  browser.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    browser.tabs.reload(tabs[0].id);
    var delayInMilliseconds = 500;
    setTimeout(function () {
      window.close();
    }, delayInMilliseconds);
  });
}

loadData("TaxFreePercent")
  .then(() => loadData("TaxFreeStatus"))
  .then(() => loadData("sendHerePlzStatus"))
  .then(() => loadData("ShortLinkStatus"))
  .then(() => {
    init();
    changeSwitchButton("TaxFreeButton", "TaxFreeStatus");
    changeSwitchButton("sendHerePlzButton", "sendHerePlzStatus");
    changeSwitchButton("ShortLinkButton", "ShortLinkStatus");
    changeInputValue("TaxFreePercent", "TaxFreePercent");
    setText();
  });
