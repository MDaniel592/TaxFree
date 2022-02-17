var value;
var url;
var delivery;
var language = "EN";
var amazon_productA = "/dp/";
var amazon_productB = "/gp/";

// getLocation --> calculatePrice
var amazonLocation;
var TaxPercent = 1.21;

// getLocation --> insertPrice
var TextToDisplay;

// calculatePrice
var PriceIVA;

// calculatePrice --> insertPrice
var PriceFreeTax;

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get(["TaxFreeStatus"], function (result) {
    // language = document.getElementsByClassName('icp-nav-language')[0];
    // delivery = document.getElementById('ddmDeliveryMessage');
    // PriceIVA = document.getElementsByClassName('apexPriceToPay')[0];
    url = document.querySelectorAll("div.nav-left")[0].baseURI;

    ivafree(result.TaxFreeStatus, url);
  });
});

browser.runtime.onMessage.addListener(gotMessage);

function gotMessage(message, sender, sendResponse) {
  if (message.txt == "FREETAX") {
    value = message.value;
    url = message.url;
    ivafree(value, url);
  }
}

function ivafree(value, url) {
  var status;
  status = !document.getElementById("myCustomPriceBlock");
  // console.log(status);
  if (
    value === true &&
    status === true &&
    (url.indexOf(amazon_productA) != -1 || url.indexOf(amazon_productB) != -1)
  ) {
    console.log("TaxFree - Loading Price");
    var delivery = !document.querySelector(`span.a-color-error`);
    var old_delivery = !document.querySelector(
      `#ddmDeliveryMessage .a-color-error,#deliveryMessageMirId .a-color-error`
    );
    if (delivery === true || old_delivery === true) {
      getLocation(url);

      if (amazonLocation != "undefined") {
        calculatePrice(amazonLocation, TaxPercent);
        insertPrice(PriceFreeTax);
      }
    }
  }
}

function getLocation(url) {
  var idx1 = url.indexOf("amazon");
  var idx2 = url.indexOf("/", idx1);
  url = url.slice(idx1 + 7, idx2);

  switch (url) {
    case "es":
      amazonLocation = "ES";
      TaxPercent = 1.21;
      TextToDisplay = "Precio sin IVA:";
      break;
    case "fr":
      amazonLocation = "FR";
      TaxPercent = 1.2;
      TextToDisplay = "Prix Tax Free:";
      break;
    case "it":
      amazonLocation = "IT";
      TaxPercent = 1.22;
      TextToDisplay = "Prezzo esentasse:";
      break;
    case "de":
      TaxPercent = 1.16;

      language = document.getElementsByClassName(
        "a-color-secondary a-size-base a-text-right a-nowrap"
      )[0].innerText;

      if (language.indexOf("Price") != -1) {
        amazonLocation = "EN";
        TextToDisplay = "Price Tax Free:";
      } else if (language.indexOf("prijs") != -1) {
        amazonLocation = "NL";
        TextToDisplay = "Prijs belastingvrij:";
      } else if (language.indexOf("Fiyatımız") != -1) {
        amazonLocation = "TR";
        TextToDisplay = "Prijs Fiyat Vergisiz:";
      } else if (language.indexOf("Nasza cena") != -1) {
        amazonLocation = "PL";
        TextToDisplay = "Cena bez podatku:";
      } else if (language.indexOf("Naše cena") != -1) {
        amazonLocation = "CS";
        TextToDisplay = "Cena bez daně:";
      } else {
        amazonLocation = "DE";
        TextToDisplay = "Preissteuerfrei:";
      }
      break;
    case "co.uk":
      amazonLocation = "CO.UK";
      TaxPercent = 1.2;
      TextToDisplay = "Price Tax Free:";
      break;
    default:
      amazonLocation = "undefined";
      TextToDisplay = "undefined";
      break;
  }
}

function calculatePrice(amazonLocation, TaxPercent) {
  // console.log("Amazon location:", amazonLocation)
  var libra = 0;
  var region_eu = 0;
  PriceIVA = document.querySelector("span.a-offscreen");

  if (PriceIVA) {
    PriceIVA = PriceIVA.innerText;
  } else {
    // console.log("No se ha obtenido el precio. Reportalo al desarrollador!")
  }

  // console.log(PriceIVA);

  if (String(PriceIVA).indexOf("£") != -1) {
    PriceFreeTax = PriceIVA.split("£")[1];
    libra = 1;
  } else if (
    amazonLocation == "ES" ||
    amazonLocation == "DE" ||
    amazonLocation == "FR" ||
    amazonLocation == "PL" ||
    amazonLocation == "CS" ||
    amazonLocation == "IT"
  ) {
    if (
      (amazonLocation == "FR" ||
        amazonLocation == "PL" ||
        amazonLocation == "CS") &&
      PriceIVA.indexOf("&") == 1
    ) {
      PriceIVA = String(PriceIVA).replace("&nbsp;", "");
      PriceFreeTax = PriceIVA.split("&")[0];
    } else {
      PriceFreeTax = PriceIVA.split("\n")[0];
    }

    if (PriceIVA.indexOf("€") != -1) {
      PriceFreeTax = PriceIVA.split("€")[0];
      if (PriceFreeTax) {
        region_eu = 2;
      } else {
        PriceFreeTax = PriceIVA.split("€")[1];
        region_eu = 1;
      }
    }
  } else if (amazonLocation == "NL") {
    PriceFreeTax = PriceIVA.split(";")[1];
    region_eu = 1;
  } else {
    PriceFreeTax = PriceIVA.split("€")[1];
    region_eu = 1;
  }

  PriceFreeTax = PriceFreeTax.replace(",", ".");
  PriceFreeTax = (" " + PriceFreeTax).slice(1);

  // console.log("Actual Price:", PriceFreeTax);

  if (
    PriceFreeTax.length > 6 &&
    (amazonLocation == "FR" || amazonLocation == "PL" || amazonLocation == "CS")
  ) {
    PriceFreeTax = +(PriceFreeTax / TaxPercent).toFixed(2);
    PriceFreeTax = String(PriceFreeTax).replace(".", ",");
    if (PriceFreeTax.length > 6) {
      PriceFreeTax =
        PriceFreeTax.slice(0, 1) +
        " " +
        PriceFreeTax.slice(1, PriceFreeTax.length);
    }
  } else if (PriceFreeTax.length > 7 && libra != 1) {
    PriceFreeTax = PriceFreeTax.replace(".", "");
    PriceFreeTax = +(PriceFreeTax / TaxPercent).toFixed(2);
    PriceFreeTax = (" " + PriceFreeTax).slice(1);

    if (amazonLocation != "EN") {
      PriceFreeTax = PriceFreeTax.replace(".", ",");
      PriceFreeTax = (" " + PriceFreeTax).slice(1);
    }
    if (PriceFreeTax.length > 6 && amazonLocation == "EN") {
      PriceFreeTax =
        PriceFreeTax.slice(0, 1) +
        "," +
        PriceFreeTax.slice(1, PriceFreeTax.length);
    } else if (PriceFreeTax.length > 6) {
      PriceFreeTax =
        PriceFreeTax.slice(0, 1) +
        "." +
        PriceFreeTax.slice(1, PriceFreeTax.length);
    }
  } else if (PriceFreeTax.length > 7 && libra == 1) {
    PriceFreeTax = PriceFreeTax.replace(".", "");
    PriceFreeTax = +(PriceFreeTax / TaxPercent).toFixed(2);
    PriceFreeTax = (" " + PriceFreeTax).slice(1);
    if (PriceFreeTax.length > 6) {
      PriceFreeTax =
        PriceFreeTax.slice(0, 1) +
        "." +
        PriceFreeTax.slice(1, PriceFreeTax.length);
    }
  } else {
    PriceFreeTax = +(PriceFreeTax / TaxPercent).toFixed(2);

    // console.log("Final First Price:", PriceFreeTax);

    PriceFreeTax = (" " + PriceFreeTax).slice(1);

    // console.log("Final Second Price:", PriceFreeTax);

    if (amazonLocation != "CO.UK" && amazonLocation != "EN") {
      PriceFreeTax = PriceFreeTax.replace(".", ",");
    }
  }

  if (amazonLocation != "CO.UK" && PriceFreeTax.split(",")[1] != undefined) {
    if (PriceFreeTax.split(",")[1].length == 1) {
      PriceFreeTax = PriceFreeTax + "0";
    }
  }

  if (libra == 1) {
    PriceFreeTax = "£" + PriceFreeTax;
  } else if (region_eu == 1) {
    if (amazonLocation == "NL") {
      PriceFreeTax = "€ " + PriceFreeTax;
    } else {
      PriceFreeTax = "€" + PriceFreeTax;
    }
  } else {
    PriceFreeTax = PriceFreeTax + "€";
  }

  // console.log("Final Price:", PriceFreeTax);
}

function insertPrice(PriceFreeTax) {
  var cuadro = document.getElementById("corePriceDisplay_desktop_feature_div");

  if (cuadro != null) {
    const bar = document.getElementsByClassName(
      "a-section a-spacing-none aok-align-center"
    );

    var container = document.createElement("div");
    container.setAttribute("id", "myCustomPriceBlock");
    var textSpan = document.createElement("span");
    textSpan.setAttribute("data-a-size", "xl");
    var valueSpan = document.createElement("span");
    valueSpan.setAttribute("data-a-size", "xl");
    valueSpan.setAttribute("class", "a-price aok-align-center priceToPay");

    var newText = document.createTextNode(TextToDisplay);
    var newValue = document.createTextNode(" " + PriceFreeTax + " ");

    textSpan.appendChild(newText);
    valueSpan.appendChild(newValue);

    container.appendChild(textSpan);
    container.appendChild(valueSpan);

    let aBlock = cuadro.insertBefore(container, cuadro.secondChild);
  } else {
    cuadro = document.getElementById("corePrice_desktop");
    var tbody = cuadro.getElementsByTagName("tbody");
    var index = tbody[0].getElementsByTagName("tr").length;
    var pos = 2;
    if (index < 2) {
      pos = index;
    } else {
      pos = 2;
    }

    var newRow = tbody[0].insertRow(pos);
    newRow.setAttribute("id", "priceblock_myprice");
    var newCell = newRow.insertCell(0);
    var newText = document.createTextNode(TextToDisplay);
    newCell.setAttribute("id", "priceblock_myprice_lbl");
    newCell.setAttribute(
      "class",
      "a-color-secondary a-size-base a-text-right a-nowrap"
    );
    newCell.appendChild(newText);

    var newCell = newRow.insertCell(1);
    newCell.className = "a-span12";

    var Span = document.createElement("span");
    newCell.appendChild(Span);
    Span.setAttribute("id", "priceblock_myprice");
    Span.className = "a-size-medium a-color-price";

    var newText = document.createTextNode(PriceFreeTax + " ");
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
  }
}
