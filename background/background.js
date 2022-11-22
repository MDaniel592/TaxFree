chrome.tabs.onUpdated.addListener(urlChanged);

function clearURL(url) {
  const idx1 = url.indexOf("amazon");
  const idx2 = url.indexOf("/", idx1);
  const amazon = url.slice(0, idx2);

  const regex = /\/dp\/\S+|\/gp\/\S+/g;
  let newURL = url.match(regex);
  if (newURL === null) return "";
  newURL = amazon + newURL[0].split("?")[0];
  return newURL;
}

var savedURL = "";
function urlChanged(tabId, changeInfo, tab) {
  let newTabURL = "";
  newTabURL = changeInfo.url ? changeInfo.url : newTabURL;
  if (newTabURL.indexOf("www.amazon.") == -1 || !changeInfo) return;

  // One time execution
  if (savedURL === "") {
    savedURL = clearURL(tab.url);
    if (savedURL === "") return;
  }

  newTabURL = clearURL(newTabURL);
  if (newTabURL === "") return;
  if (savedURL === newTabURL) return;

  savedURL = newTabURL;

  let msg = { txt: "FREETAX", value: storage.TaxFreeStatus, url: savedURL, valid: true };
  chrome.tabs.sendMessage(tabId, msg);
}
