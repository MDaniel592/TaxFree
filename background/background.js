var tab_url = undefined;
var index0 	= undefined;
var index1 	= undefined;
var index2 	= undefined;
var dp_pos 	= undefined;

var amazon_productA  = "/dp/";
var amazon_productB  = "/gp/";

browser.runtime.onMessage.addListener(handleMessage);

browser.tabs.onUpdated.addListener(urlChanged);

/**
 * [handleMessage description]
 * @param  request      The message itself. This is a JSON-ifiable object.
 * @param  sender       A runtime.MessageSender object representing the sender of the message.
 * @param  sendResponse A function to call, at most once, to send a response to the message. The function takes a single argument, which may be any JSON-ifiable object. This argument is passed back to the message sender.
 */
function handleMessage(request, sender, sendResponse) {
	let fn = window[request.function];

	if (typeof fn === "function") {
		let response = fn.apply(null, request.params);

		return Promise.resolve({ response });
	}
}

function urlChanged(tabId, changeInfo, tab) {

	if (changeInfo) {

		if ((tab.url).indexOf("www.amazon.") != -1) {

			dp_pos = (tab.url).indexOf("dp/");
			if (dp_pos == -1) {
				dp_pos = (tab.url).indexOf("gp/");
			}
			index0 = (tab.url).indexOf("/", dp_pos + 3);
			index1 = (tab.url).indexOf("?", dp_pos);
			index2 = (tab.url).indexOf("#", dp_pos);

			if (index0 != "-1") {
				tab.url = (tab.url).slice(0, index0);
			}

			if (index1 != "-1") {
				tab.url = (tab.url).slice(0, index1);
			}

			if (index2 != "-1") {
				tab.url = (tab.url).slice(0, index2);
			}

			if (tab.url != tab_url) {

				tab_url = tab.url;
				if ((tab_url).indexOf(amazon_productA) != -1 || (tab_url).indexOf(amazon_productB) != -1) {
					let msg = {
						txt: "FREETAX",
						value: storage.TaxFreeStatus,
						url: tab_url
					}
					chrome.tabs.sendMessage(tab.id, msg);
				}
			}
		}
	}
}