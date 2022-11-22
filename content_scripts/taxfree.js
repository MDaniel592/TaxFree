const CountryTaxes = {
  DE: {
    tax: 1.19,
    taxName: "Precio sin IVA:",
    taxNewName: "Precio con nuevo IVA:",
    coin: "€",
  },
  "CO.UK": {
    tax: 1.2,
    taxName: "Price Tax Free:",
    taxNewName: "Price with new VAT:",
    coin: "£",
  },
  FR: {
    tax: 1.2,
    taxName: "Prix Tax Free:",
    taxNewName: "Prix ​​avec nouvelle TVA:",
    coin: "€",
  },
  DE: {
    tax: 1.21,
    taxName: "Preissteuerfrei:",
    taxNewName: "Preis mit neuer MwSt:",
    coin: "€",
  },
  ES: {
    tax: 1.21,
    taxName: "Precio sin IVA:",
    taxNewName: "Precio con nuevo IVA:",
    coin: "€",
  },
  IT: {
    tax: 1.22,
    taxName: "Prezzo con nuova IVA:",
    taxNewName: "Prezzo esentasse:",
    coin: "€",
  },
};

var product = {
  url: "undefined",
  location: "undefined",
  TaxPercent: "undefined",
  TextFreeTax: "undefined",
  PriceFreeTax: "undefined",
  TextNewTax: "undefined",
  PriceNewTax: "undefined",
};

var selectedTAX = 1;

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get("TaxFreePercent", function (result) {
    selectedTAX = result.TaxFreePercent ? (1 + result.TaxFreePercent / 100).toFixed(2) : 1;
  });

  chrome.storage.local.get("TaxFreeStatus", function (result) {
    let url = document.querySelectorAll("div.nav-left")[0].baseURI;
    let active = result.TaxFreeStatus ? result.TaxFreeStatus : true;
    ivafree(active, url);
  });
});
browser.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  if (message.txt == "FREETAX") ivafree(message.value, message.url);
}

function ivafree(activeFreeTax, url) {
  product.url = url;
  let status = !document.getElementById("myCustomPriceBlock");

  if (url.indexOf("/dp/") == -1 && url.indexOf("/gp/") == -1) return;
  if (activeFreeTax === false || status === false) return;

  console.log("TaxFree - Loading Price");

  let delivery = !document.querySelector(`span.a-color-error`);
  let oldDelivery = !document.querySelector(`#ddmDeliveryMessage .a-color-error,#deliveryMessageMirId .a-color-error`);

  if (delivery === true || oldDelivery === true) {
    setDataFromURL();

    if (product.location === "undefined") return;
    calculatePrice();
    insertPrice();
  }
}

function setDataFromURL() {
  let idx1 = product.url.indexOf("amazon");
  let idx2 = product.url.indexOf("/", idx1);
  const country = product.url.slice(idx1 + 7, idx2).toUpperCase();

  if (country === "ES" || country === "FR" || country === "IT" || country === "CO.UK") {
    product.location = country;
    product.TaxPercent = CountryTaxes[country].tax;
    product.TextFreeTax = CountryTaxes[country].taxName;
    product.TextNewTax = CountryTaxes[country].taxNewName;
  } else if (country == "DE") {
    product.TaxPercent = CountryTaxes[country].tax;

    let language = document.getElementsByClassName("a-color-secondary a-size-base a-text-right a-nowrap")[0].innerText;

    if (language.indexOf("Price") != -1) {
      product.location = "EN";
      product.TextFreeTax = CountryTaxes["CO.UK"].taxName;
      product.TextNewTax = CountryTaxes["CO.UK"].taxNewName;
    } else {
      product.location = country;
      product.TextFreeTax = CountryTaxes[country].taxName;
      product.TextNewTax = CountryTaxes[country].taxNewName;
    }
  } else {
    product.location = "undefined";
    product.TaxPercent = "undefined";
    product.TextNewTax = "undefined";
    product.TextFreeTax = "undefined";
  }
}

function calculatePrice() {
  let jsonPriceTax = document.querySelector("div.a-section.aok-hidden.twister-plus-buying-options-price-data");

  if (!jsonPriceTax) console.log("No se ha obtenido el precio. Reportalo al desarrollador!");
  if (!jsonPriceTax) return;

  jsonPriceTax = JSON.parse(jsonPriceTax.innerText);
  jsonPriceTax = jsonPriceTax[jsonPriceTax.length - 1];
  let PriceIVA = jsonPriceTax.displayPrice ? jsonPriceTax.displayPrice : jsonPriceTax.priceAmount;

  PriceIVA = PriceIVA.replace(",", ".");
  PriceIVA = PriceIVA.match(/\d+\.\d+/g);
  if (PriceIVA === null) console.log("No se ha obtenido el precio. Reportalo al desarrollador!");
  if (PriceIVA === null) return;
  PriceIVA = parseFloat(PriceIVA[0]);

  let PriceFreeTax = String((PriceIVA / product.TaxPercent).toFixed(2));
  let newPriceTAX = "";
  if (selectedTAX !== 1) {
    newPriceTAX = String((PriceFreeTax * selectedTAX).toFixed(2));
  }

  if (product.location === "CO.UK" || product.location === "DE") {
    product.newPriceTAX = CountryTaxes[product.location].coin + newPriceTAX;
    product.PriceFreeTax = CountryTaxes[product.location].coin + PriceFreeTax;
  } else {
    product.newPriceTAX = newPriceTAX + CountryTaxes[product.location].coin;
    product.PriceFreeTax = PriceFreeTax + CountryTaxes[product.location].coin;
  }
}

function createOneElement_A(price, name) {
  let container = document.createElement("div");
  container.setAttribute("id", Math.random());
  let textSpan = document.createElement("span");
  textSpan.setAttribute("data-a-size", "xl");
  let valueSpan = document.createElement("span");
  valueSpan.setAttribute("data-a-size", "xl");
  valueSpan.setAttribute("class", "a-price aok-align-center priceToPay");

  let newText = document.createTextNode(name);
  let newValue = document.createTextNode(" " + price + " ");

  textSpan.appendChild(newText);
  valueSpan.appendChild(newValue);

  container.appendChild(textSpan);
  container.appendChild(valueSpan);
  return container;
}

function createOneElement_B(tbody, pos, price, name) {
  var newRow = tbody[0].insertRow(pos);
  newRow.setAttribute("id", Math.random());
  var newCell = newRow.insertCell(0);
  var newText = document.createTextNode(name);
  newCell.setAttribute("id", "priceblock_myprice_lbl");
  newCell.setAttribute("class", "a-color-secondary a-size-base a-text-right a-nowrap");
  newCell.appendChild(newText);

  var newCell = newRow.insertCell(1);
  newCell.className = "a-span12";

  var Span = document.createElement("span");
  newCell.appendChild(Span);
  Span.setAttribute("id", Math.random());
  Span.className = "a-size-medium a-color-price";

  var newText = document.createTextNode(price + " ");
  Span.appendChild(newText);

  var Span1 = document.createElement("span");
  newCell.appendChild(Span1);
  Span1.setAttribute("id", "ourprice_shippingmessage");

  var Span2 = document.createElement("span");
  Span1.appendChild(Span2);
  Span2.setAttribute("id", "priceBadging_feature_div");
  Span2.className = "feature";
  Span2.setAttribute("data-feature-name", "priceBadging");

  var Span3 = document.createElement("span");
  Span2.appendChild(Span3);
  Span3.setAttribute("id", "priceBadging_feature_div");
  Span3.className = "feature";
  Span3.setAttribute("data-feature-name", "priceBadging");

  var Span4 = document.createElement("i");
  Span3.appendChild(Span4);
  Span4.className = "a-icon-wrapper a-icon-premium-with-text";

  var Span5 = document.createElement("i");
  Span4.appendChild(Span5);
  Span5.className = "a-icon a-icon-premium";
  return;
}

function insertPrice() {
  let cuadro = document.getElementById("corePriceDisplay_desktop_feature_div");

  if (cuadro != null) {
    let container;
    if (selectedTAX != 1) {
      container = createOneElement_A(product.newPriceTAX, product.TextNewTax);
      cuadro.appendChild(container);
    }

    container = createOneElement_A(product.PriceFreeTax, product.TextFreeTax);
    cuadro.appendChild(container);
    return;
  }

  cuadro = document.getElementById("corePrice_desktop");
  let tbody = cuadro.getElementsByTagName("tbody");
  let index = tbody[0].getElementsByTagName("tr").length;
  let pos = 2;
  if (index < 2) pos = index;

  if (selectedTAX != 1) {
    createOneElement_B(tbody, pos, product.newPriceTAX, product.TextNewTax);
    pos += 1;
  }
  createOneElement_B(tbody, pos, product.PriceFreeTax, product.TextFreeTax);
}
