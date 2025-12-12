/**
 * Tax rates and localized labels for supported EU Amazon countries
 * Structure: { countryCode: { tax: multiplier, taxName, taxNewName, coin } }
 */
const CountryTaxes = {
  DE: {
    tax: 1.21, // 21% VAT (German localization)
    taxName: "Preissteuerfrei:",
    taxNewName: "Preis mit neuer MwSt:",
    coin: "€",
  },
  "DE_EN": {
    tax: 1.19, // 19% VAT (English localization on .de)
    taxName: "Price Tax Free:",
    taxNewName: "Price with new VAT:",
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
    taxNewName: "Prix avec nouvelle TVA:",
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
    taxName: "Prezzo senza IVA:",
    taxNewName: "Prezzo con nuova IVA:",
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

/**
 * Initialize the TaxFree script when DOM is ready
 * Loads user preferences and triggers price calculation
 * Uses delay to ensure page is fully loaded before extracting prices
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Load both storage values before processing
    const [taxFreePercent, taxFreeStatus] = await Promise.all([
      new Promise(resolve => {
        chrome.storage.local.get("TaxFreePercent", (result) => {
          resolve(result?.TaxFreePercent !== undefined ? result.TaxFreePercent : 0);
        });
      }),
      new Promise(resolve => {
        chrome.storage.local.get("TaxFreeStatus", (result) => {
          resolve(result?.TaxFreeStatus !== undefined ? result.TaxFreeStatus : true);
        });
      })
    ]);

    if (taxFreePercent !== undefined) {
      selectedTAX = (1 + taxFreePercent / 100).toFixed(2);
    }

    let url = getDocumentBaseURL();

    // Clean product links on page
    cleanProductURL();

    if (url && taxFreeStatus) {
      // Add delay to ensure page elements are fully loaded
      setTimeout(() => {
        console.log("[TaxFree] Starting price extraction after delay");
        initializePriceTracking(url);
      }, 2000);
    }
  } catch (error) {
    console.error("[TaxFree ERROR] DOMContentLoaded:", error);
  }
});

/**
 * Initialize price tracking with delegation pattern
 * Watch for clicks on variant selectors and recalculate on change
 * @param {string} url - Current page URL
 */
function initializePriceTracking(url) {
  try {
    // Initial price calculation
    taxfree(true, url);

    // Listen for variant selection clicks (delegated)
    document.addEventListener("click", (event) => {
      const target = event.target;
      
      // Check if click is on a variant selector (color, size, etc)
      if (target.closest("[data-a-size='base']") || 
          target.closest(".a-button-base") ||
          target.closest("[class*='variation']") ||
          target.closest("[class*='twister']")) {
        
        // Debounce: wait a bit for Amazon to update the price
        clearTimeout(window.taxfreeDebounceTimer);
        window.taxfreeDebounceTimer = setTimeout(() => {
          console.log("[TaxFree] Variant selection detected, recalculating");
          recalculatePrice();
        }, 800);
      }
    }, true); // Use capture phase to catch all clicks

    console.log("[TaxFree] Price tracking initialized");
  } catch (error) {
    console.error("[TaxFree ERROR] initializePriceTracking:", error);
  }
}

/**
 * Recalculate price for current product variant
 * Removes old prices and inserts new ones
 * Waits for Amazon to update the price data before recalculating
 */
function recalculatePrice() {
  try {
    // Clear old prices immediately
    clearOldPrices();
    
    // Wait for price data to update (Amazon updates this after variant selection)
    waitForPriceUpdate(() => {
      // Recalculate
      calculatePrice();
      
      // Insert new prices
      if (product.PriceFreeTax && product.TextFreeTax) {
        insertPrice();
        console.log("[TaxFree] Price recalculated successfully");
      } else {
        console.warn("[TaxFree] Price calculation failed after variant change");
      }
    });
  } catch (error) {
    console.error("[TaxFree ERROR] recalculatePrice:", error);
  }
}

/**
 * Wait for Amazon to update the price data after variant selection
 * Polls the price element to detect when it changes
 * @param {Function} callback - Function to call when price is updated
 * @param {number} maxWaitTime - Maximum time to wait (ms)
 */
function waitForPriceUpdate(callback, maxWaitTime = 3000) {
  try {
    const startTime = Date.now();
    let lastPrice = null;
    const pollInterval = 100; // ms between checks

    // Get initial price before change (to detect when it actually changes)
    const initialPrice = extractPriceFromJSON();
    console.log("[TaxFree] Initial price before variant change:", initialPrice);

    const pollTimer = setInterval(() => {
      const elapsedTime = Date.now() - startTime;

      // Try to get new price
      const currentPrice = extractPriceFromJSON();

      // Check if price has changed OR if enough data elements are visible
      const priceDataElement = document.querySelector("div.a-section.aok-hidden.twister-plus-buying-options-price-data");
      const priceContainer = document.getElementById("corePriceDisplay_desktop_feature_div");

      if ((currentPrice && currentPrice !== initialPrice) || 
          (priceDataElement && priceContainer && elapsedTime > 500)) {
        clearInterval(pollTimer);
        console.log("[TaxFree] Price updated detected, proceeding with calculation");
        callback();
        return;
      }

      // Timeout: give up after max wait time
      if (elapsedTime > maxWaitTime) {
        clearInterval(pollTimer);
        console.warn("[TaxFree] Timeout waiting for price update, proceeding anyway");
        callback();
        return;
      }
    }, pollInterval);
  } catch (error) {
    console.error("[TaxFree ERROR] waitForPriceUpdate:", error);
    callback(); // Call callback anyway to not block
  }
}

/**
 * Clear all previous TaxFree price elements
 */
function clearOldPrices() {
  try {
    // Remove all elements with IDs starting with 'taxfree_' (covers all variants)
    document.querySelectorAll("[id^='taxfree_']").forEach(el => el.remove());
    // Remove legacy custom price block
    document.querySelectorAll("[id='myCustomPriceBlock']").forEach(el => el.remove());
    // Also remove any elements with random IDs that are TaxFree containers
    // These are created by createOneElement_A but might have random Math.random() IDs
    const allDivs = document.querySelectorAll("div[data-a-size='xl']");
    allDivs.forEach(el => {
      const parent = el.parentElement;
      // Check if this is a TaxFree price container (has span children with a-price class)
      if (parent && parent.querySelector("span.a-price.aok-align-center.priceToPay")) {
        // Check if parent's ID looks like it's from our script or has no ID
        if (!parent.id || parent.id.match(/^\d+$/) || parent.id.startsWith('taxfree_')) {
          parent.remove();
        }
      }
    });
  } catch (error) {
    console.error("[TaxFree ERROR] clearOldPrices:", error);
  }
}

chrome.runtime.onMessage.addListener(gotMessage);

/**
 * Handle messages from background/popup scripts
 * @param {Object} message - Message object with txt, value, url properties
 * @param {Object} sender - Sender information
 * @param {Function} sendResponse - Response callback
 */
function gotMessage(message, sender, sendResponse) {
  try {
    if (message?.txt === "FREETAX") {
      clearOldPrices();
      recalculatePrice();
    }
  } catch (error) {
    console.error("[TaxFree ERROR] gotMessage:", error);
  }
}

/**
 * Get document base URL safely
 * @returns {string|null} Base URL or null if not found
 */
function getDocumentBaseURL() {
  try {
    const navLeft = document.querySelectorAll("div.nav-left");
    if (navLeft && navLeft[0] && navLeft[0].baseURI) {
      return navLeft[0].baseURI;
    }
    return window.location.href;
  } catch (error) {
    console.error("[TaxFree ERROR] getDocumentBaseURL:", error);
    return null;
  }
}

/**
 * Clean all product links on the current page
 * Finds all links that point to Amazon product pages and cleans their URLs
 */
function cleanProductURL() {
  try {
    // Find all links on the page
    const allLinks = document.querySelectorAll('a[href*="/dp/"], a[href*="/gp/product/"]');
    let cleanedCount = 0;

    allLinks.forEach((link) => {
      try {
        const originalHref = link.getAttribute("href");
        if (!originalHref) return;

        // Skip if it's already a clean URL (just /dp/ASIN or /name/dp/ASIN)
        if (/^\/[^/]+\/dp\/[A-Z0-9]{10}$/.test(originalHref) || /^\/dp\/[A-Z0-9]{10}$/.test(originalHref)) {
          return;
        }

        let cleanHref = null;

        // Parse the URL to extract the path
        let linkPath;
        try {
          // Handle both absolute and relative URLs
          if (originalHref.startsWith("http")) {
            const urlObj = new URL(originalHref);
            linkPath = urlObj.pathname;
          } else {
            linkPath = originalHref.split("?")[0]; // Remove query params
          }
        } catch (e) {
          return; // Skip invalid URLs
        }

        // Extract ASIN and clean the path
        const dpMatch = linkPath.match(/\/dp\/([A-Z0-9]{10})/);
        if (dpMatch) {
          const asin = dpMatch[1];
          // Keep product name if it exists: /Product-Name/dp/ASIN
          const productNameMatch = linkPath.match(/(\/[^/]+)?\/dp\/[A-Z0-9]{10}/);
          if (productNameMatch && productNameMatch[0]) {
            cleanHref = productNameMatch[0];
          } else {
            cleanHref = "/dp/" + asin;
          }
        }

        // Handle /gp/product/ASIN format
        const gpMatch = linkPath.match(/\/gp\/product\/([A-Z0-9]{10})/);
        if (gpMatch && !cleanHref) {
          const asin = gpMatch[1];
          cleanHref = "/dp/" + asin;
        }

        // Apply the cleaned URL if we found one
        if (cleanHref && cleanHref !== originalHref) {
          link.setAttribute("href", cleanHref);
          cleanedCount++;
        }
      } catch (error) {
        console.warn("[TaxFree] Error cleaning individual link:", error);
      }
    });

    if (cleanedCount > 0) {
      console.log("[TaxFree] Cleaned " + cleanedCount + " product links on page");
    }
  } catch (error) {
    console.error("[TaxFree ERROR] cleanProductURL:", error);
  }
}

/**
 * Main TaxFree function - extracts price and inserts calculated values
 * @param {boolean} activeFreeTax - Whether TaxFree feature is enabled
 * @param {string} url - Current page URL
 */
function taxfree(activeFreeTax, url) {
  try {
    if (!url || !activeFreeTax) {
      return;
    }

    // Only run on product detail pages
    if (!url.includes("/dp/") && !url.includes("/gp/")) {
      return;
    }

    product.url = url;
    console.log("[TaxFree] Processing product page");

    // Check if product is deliverable
    if (!isProductDeliverable()) {
      console.log("[TaxFree] Product not deliverable to this location");
      return;
    }

    // Extract country and tax information
    setDataFromURL();
    if (product.location === "undefined") {
      console.warn("[TaxFree] Could not determine country from URL");
      return;
    }

    // Calculate and display prices
    calculatePrice();
    
    // Only insert if price calculation was successful
    if (product.PriceFreeTax && product.TextFreeTax) {
      insertPrice();
      console.log("[TaxFree] Successfully processed page");
    } else {
      console.warn("[TaxFree] Price calculation failed - skipping insertion");
    }
  } catch (error) {
    console.error("[TaxFree ERROR] taxfree function:", error);
  }
}

/**
 * Check if product has delivery errors
 * @returns {boolean} True if product is deliverable
 */
function isProductDeliverable() {
  try {
    const selectors = [
      "#centerCol #ddmDeliveryMessage .a-color-error",
      "#centerCol #deliveryMessageMirId .a-color-error",
      "#rightCol #qualifiedBuybox #ddmDeliveryMessage .a-color-error",
      "#rightCol #qualifiedBuybox #mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE .a-color-error",
      "#rightCol #qualifiedBuybox #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-color-error",
      "#rightCol .a-accordion-active #ddmDeliveryMessage .a-color-error",
      "#rightCol .a-accordion-active #mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE .a-color-error",
      "#rightCol .a-accordion-active #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-color-error",
    ];

    for (const selector of selectors) {
      if (document.querySelector(selector)) {
        return false; // Delivery error found
      }
    }
    return true; // No delivery errors
  } catch (error) {
    console.error("[TaxFree ERROR] isProductDeliverable:", error);
    return true; // Assume deliverable on error
  }
}

/**
 * Extract country code and tax information from the current URL
 * Handles language variations for German Amazon
 */
function setDataFromURL() {
  try {
    let idx1 = product.url.indexOf("amazon");
    let idx2 = product.url.indexOf("/", idx1);
    const country = product.url.slice(idx1 + 7, idx2).toUpperCase();

    if (country === "ES" || country === "FR" || country === "IT" || country === "CO.UK") {
      product.location = country;
      product.TaxPercent = CountryTaxes[country].tax;
      product.TextFreeTax = CountryTaxes[country].taxName;
      product.TextNewTax = CountryTaxes[country].taxNewName;
    } else if (country === "DE") {
      // Handle German language variations
      const language = detectLanguageOnDE();
      product.location = country;

      if (language === "EN") {
        // English on .de domain
        product.TaxPercent = CountryTaxes["DE_EN"].tax;
        product.TextFreeTax = CountryTaxes["DE_EN"].taxName;
        product.TextNewTax = CountryTaxes["DE_EN"].taxNewName;
      } else {
        // German on .de domain (default)
        product.TaxPercent = CountryTaxes["DE"].tax;
        product.TextFreeTax = CountryTaxes["DE"].taxName;
        product.TextNewTax = CountryTaxes["DE"].taxNewName;
      }
    } else {
      console.warn(`[TaxFree] Unsupported country: ${country}`);
      product.location = "undefined";
    }
  } catch (error) {
    console.error("[TaxFree ERROR] setDataFromURL:", error);
    product.location = "undefined";
  }
}

/**
 * Detect if German Amazon page is in English
 * @returns {string} "EN" if English, empty string otherwise
 */
function detectLanguageOnDE() {
  try {
    const langElements = document.getElementsByClassName("a-color-secondary a-size-base a-text-right a-nowrap");
    if (langElements && langElements.length > 0) {
      const text = langElements[0].innerText;
      return text && text.indexOf("Price") !== -1 ? "EN" : "";
    }
  } catch (error) {
    console.error("[TaxFree ERROR] detectLanguageOnDE:", error);
  }
  return "";
}

/**
 * Find all occurrences of a substring in a string
 * @param {string} string - The string to search in
 * @param {string} substring - The substring to find
 * @returns {number[]} Array of indices where substring is found
 */
function allIndexesOf(string, substring) {
  const indexes = [];
  let index = -1;
  while ((index = string.indexOf(substring, index + 1)) >= 0) {
    indexes.push(index);
  }
  return indexes;
}

/**
 * Replace multiple occurrences of a substring
 * @param {string} string - The original string
 * @param {number} times - Number of replacements to make
 * @param {string} oldSubstring - Substring to replace
 * @param {string} newSubstring - Replacement substring
 * @returns {string} Modified string
 */
function replaceN(string, times, oldSubstring, newSubstring) {
  let result = string;
  for (let i = 0; i < times; i++) {
    result = result.replace(oldSubstring, newSubstring);
  }
  return result;
}

/**
 * Extract and parse price from Amazon's JSON price data
 * Tries multiple selectors as Amazon's DOM changes frequently
 * @returns {string|null} Price as string or null if not found
 */
function extractPriceFromJSON() {
  try {
    // Try multiple selectors as Amazon changes DOM structure frequently
    const selectors = [
      "div.a-section.aok-hidden.twister-plus-buying-options-price-data",
      "div[data-a-selector='twister-plus-buying-options-price-data']",
      "div.twister-plus-buying-options-price-data",
      ".twister-plus-buying-options-price-data", // Fallback without restrictive classes
    ];

    let jsonElement = null;
    for (const selector of selectors) {
      jsonElement = document.querySelector(selector);
      if (jsonElement && jsonElement.innerText) {
        console.log("[TaxFree] Found price data with selector:", selector);
        break;
      }
    }

    if (!jsonElement || !jsonElement.innerText) {
      // Fallback: try to find price from visible price element
      console.warn("[TaxFree] Price data element not found, attempting fallback extraction");
      return extractPriceFromVisibleElement();
    }

    // Get the text content which contains JSON
    let jsonText = jsonElement.innerText.trim();
    
    // Handle HTML entities in the text (e.g., &nbsp; becomes space)
    jsonText = jsonText.replace(/&nbsp;/g, " ");
    
    // Parse the JSON data
    const jsonData = JSON.parse(jsonText);
    let priceWithVAT = null;

    // Handle different JSON structures
    // Structure 1: desktop_buybox_group_1 (array of items)
    if (jsonData.desktop_buybox_group_1 && Array.isArray(jsonData.desktop_buybox_group_1)) {
      const items = jsonData.desktop_buybox_group_1;
      
      // Find the price for new items first
      for (const item of items) {
        if (item.buyingOptionType === "NEW") {
          priceWithVAT = item.displayPrice || item.priceAmount;
          if (priceWithVAT) {
            console.log("[TaxFree] Found NEW item price:", priceWithVAT);
            break;
          }
        }
      }
      
      // If no NEW item found, get the first available
      if (!priceWithVAT && items.length > 0) {
        for (const item of items) {
          priceWithVAT = item.displayPrice || item.priceAmount;
          if (priceWithVAT) {
            console.log("[TaxFree] Using first item price:", priceWithVAT);
            break;
          }
        }
      }
    } 
    // Structure 2: Direct item properties (legacy format)
    else {
      for (const item in jsonData) {
        if (jsonData[item]?.buyingOptionType === "NEW") {
          priceWithVAT = jsonData[item].displayPrice || jsonData[item].priceAmount;
          if (priceWithVAT) {
            console.log("[TaxFree] Found NEW item price (legacy):", priceWithVAT);
            break;
          }
        }
      }

      // If no NEW item found, get the first available
      if (!priceWithVAT) {
        for (const item in jsonData) {
          priceWithVAT = jsonData[item]?.displayPrice || jsonData[item]?.priceAmount;
          if (priceWithVAT) {
            console.log("[TaxFree] Using first item price (legacy):", priceWithVAT);
            break;
          }
        }
      }
    }

    if (priceWithVAT) {
      console.log("[TaxFree] Extracted price from JSON:", priceWithVAT);
      return priceWithVAT;
    } else {
      console.warn("[TaxFree] No price found in JSON data, trying fallback");
      return extractPriceFromVisibleElement();
    }
  } catch (error) {
    console.error("[TaxFree ERROR] extractPriceFromJSON:", error);
    return extractPriceFromVisibleElement();
  }
}

/**
 * Fallback: Extract price from visible price elements on page
 * Used when JSON data is not available
 * Tries multiple strategies to find the current price
 * @returns {string|null} Price string or null if not found
 */
function extractPriceFromVisibleElement() {
  try {
    // Strategy 1: Look for price spans in common locations
    const priceSelectors = [
      "span.a-price-whole",
      "span[data-a-color='price'] span.a-price-whole",
      "span.a-price",
      "div#corePriceDisplay_desktop_feature_div span.a-price-whole",
      "div#corePriceDisplay_desktop_feature_div .a-price-whole",
      ".a-price-whole", // Very permissive fallback
    ];

    for (const selector of priceSelectors) {
      const priceElements = document.querySelectorAll(selector);
      
      // Get the FIRST visible price that looks like a main product price
      for (const priceElement of priceElements) {
        if (!priceElement.innerText) continue;
        
        const price = priceElement.innerText.trim();
        if (price && /\d/.test(price)) {
          // Avoid small prices that are likely shipping costs or ratings
          const numPrice = parseFloat(price.replace(/[^\d,]/g, "").replace(",", "."));
          if (numPrice > 10) { // Likely a real product price
            console.log("[TaxFree] Extracted price from visible element:", price);
            return price;
          }
        }
      }
    }

    // Strategy 2: Look for price in aria-label or data attributes
    const priceElementsWithLabel = document.querySelectorAll("[aria-label*='€'], [aria-label*='£'], [data-price]");
    for (const el of priceElementsWithLabel) {
      const label = el.getAttribute("aria-label") || el.getAttribute("data-price") || "";
      const match = label.match(/(\d+[.,]\d{2})/);
      if (match) {
        console.log("[TaxFree] Extracted price from aria-label:", match[0]);
        return match[0];
      }
    }

    console.warn("[TaxFree] Could not extract price from any visible element");
    return null;
  } catch (error) {
    console.error("[TaxFree ERROR] extractPriceFromVisibleElement:", error);
    return null;
  }
}

/**
 * Parse and clean price string from Amazon format
 * Handles different currency and decimal formats
 * @param {string} priceString - Raw price string from Amazon
 * @returns {number|null} Parsed price or null if invalid
 */
function parseAmazonPrice(priceString) {
  try {
    if (!priceString) return null;

    console.log("[TaxFree] Parsing price string:", priceString);

    // Remove HTML entities like &nbsp;
    let cleanedString = priceString.replace(/&nbsp;/g, " ").trim();
    
    // Replace comma with dot for consistent decimal parsing
    let cleanPrice = cleanedString.replaceAll(",", ".").replace(/[^\d.-]/g, "");
    
    console.log("[TaxFree] Cleaned price string:", cleanPrice);
    
    // Handle multiple dots (thousand separators)
    const dotsFound = allIndexesOf(cleanPrice, ".");
    if (dotsFound.length > 1) {
      cleanPrice = replaceN(cleanPrice, dotsFound.length - 1, ".", "");
    }

    const parsed = parseFloat(cleanPrice);
    const result = isNaN(parsed) ? null : parseFloat(parsed.toFixed(2));
    
    console.log("[TaxFree] Parsed result:", result);
    return result;
  } catch (error) {
    console.error("[TaxFree ERROR] parseAmazonPrice:", error);
    return null;
  }
}

/**
 * Calculate tax-free and adjusted tax prices based on product info
 * Updates product.PriceFreeTax and product.newPriceTAX with formatted currency
 */
function calculatePrice() {
  try {
    // Extract price from JSON data
    const priceWithVAT = extractPriceFromJSON();
    if (!priceWithVAT) {
      console.error("[TaxFree ERROR] Could not extract price from JSON data");
      product.PriceFreeTax = undefined;
      product.newPriceTAX = undefined;
      return;
    }

    console.log("[TaxFree] Raw extracted price:", priceWithVAT);

    // Parse and validate price
    let PriceIVA = parseAmazonPrice(priceWithVAT);
    if (PriceIVA === null) {
      console.error("[TaxFree ERROR] Could not parse price:", priceWithVAT);
      product.PriceFreeTax = undefined;
      product.newPriceTAX = undefined;
      return;
    }

    // Calculate tax-free price by dividing by tax multiplier
    let PriceFreeTax = String((PriceIVA / product.TaxPercent).toFixed(2));

    // Calculate new price with custom tax if user specified one
    let newPriceTAX = "";
    if (selectedTAX !== 1) {
      newPriceTAX = String((PriceFreeTax * selectedTAX).toFixed(2));
    }

    // Format prices with currency symbol based on location
    // Some countries put symbol before price, others after
    // Determine the coin symbol based on the detected location
    let coinSymbol;
    if (product.location === "DE") {
      // Check if we're using English or German tax rate
      coinSymbol = product.TaxPercent === CountryTaxes["DE_EN"].tax
        ? CountryTaxes["DE_EN"].coin
        : CountryTaxes["DE"].coin;
    } else {
      coinSymbol = CountryTaxes[product.location].coin;
    }

    if (product.location === "CO.UK" || product.location === "DE") {
      product.newPriceTAX = coinSymbol + newPriceTAX;
      product.PriceFreeTax = coinSymbol + PriceFreeTax;
    } else {
      product.newPriceTAX = newPriceTAX + coinSymbol;
      product.PriceFreeTax = PriceFreeTax + coinSymbol;
    }

    console.log("[TaxFree] Prices calculated:", {
      original: PriceIVA,
      taxFree: PriceFreeTax,
      custom: newPriceTAX,
      formatted: {
        taxFree: product.PriceFreeTax,
        custom: product.newPriceTAX
      }
    });
  } catch (error) {
    console.error("[TaxFree ERROR] calculatePrice:", error);
    product.PriceFreeTax = undefined;
    product.newPriceTAX = undefined;
  }
}

/**
 * Create a price display element (variant A - used in modern layout)
 * @param {string} price - Formatted price string
 * @param {string} name - Label text
 * @param {string} idSuffix - ID suffix for the container (e.g., "main", "custom")
 * @returns {HTMLElement} Container element with price display
 */
function createOneElement_A(price, name, idSuffix) {
  let container = document.createElement("div");
  container.setAttribute("id", "taxfree_" + idSuffix + "_" + Date.now());
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

/**
 * Create a price display element (variant B - used in table layout)
 * @param {HTMLCollection} tbody - Table body element
 * @param {number} pos - Position to insert row
 * @param {string} price - Formatted price string
 * @param {string} name - Label text
 */
function createOneElement_B(tbody, pos, price, name) {
  try {
    if (!tbody || !tbody[0]) {
      console.warn("[TaxFree] Invalid table body for insertion");
      return;
    }

    const newRow = tbody[0].insertRow(pos);
    newRow.setAttribute("id", "taxfree_price_row_" + Date.now());

    // Label cell
    const labelCell = newRow.insertCell(0);
    labelCell.setAttribute("id", "priceblock_myprice_lbl");
    labelCell.setAttribute("class", "a-color-secondary a-size-base a-text-right a-nowrap");
    labelCell.appendChild(document.createTextNode(name));

    // Price cell
    const priceCell = newRow.insertCell(1);
    priceCell.className = "a-span12";

    const priceSpan = document.createElement("span");
    priceSpan.setAttribute("id", "taxfree_price_value_" + Date.now());
    priceSpan.className = "a-size-medium a-color-price";
    priceSpan.appendChild(document.createTextNode(price + " "));
    priceCell.appendChild(priceSpan);
  } catch (error) {
    console.error("[TaxFree ERROR] createOneElement_B:", error);
  }
}

/**
 * Insert calculated prices into the product page
 * Tries both modern layout (corePriceDisplay) and legacy layout (corePrice)
 * Removes old price elements before inserting new ones
 */
function insertPrice() {
  try {
    if (!product.PriceFreeTax || !product.TextFreeTax) {
      console.warn("[TaxFree] Price data not available for insertion");
      return;
    }

    // Clear all old prices first using dedicated function
    clearOldPrices();

    // Try modern layout first
    const modernPriceContainer = document.getElementById("corePriceDisplay_desktop_feature_div");
    if (modernPriceContainer) {
      // Insert custom tax price if applicable
      if (product.newPriceTAX && selectedTAX !== 1) {
        const customContainer = createOneElement_A(product.newPriceTAX, product.TextNewTax, "custom");
        modernPriceContainer.appendChild(customContainer);
        console.log("[TaxFree] Custom price inserted");
      }

      // Insert tax-free price
      const taxFreeContainer = createOneElement_A(product.PriceFreeTax, product.TextFreeTax, "main");
      modernPriceContainer.appendChild(taxFreeContainer);
      console.log("[TaxFree] Prices inserted (modern layout)");
      return;
    }

    // Fall back to legacy layout
    const legacyPriceContainer = document.getElementById("corePrice_desktop");
    if (legacyPriceContainer) {
      const tbody = legacyPriceContainer.getElementsByTagName("tbody");
      if (!tbody || !tbody[0]) {
        console.warn("[TaxFree] Could not find table body for legacy layout");
        return;
      }

      let insertPosition = 2;
      const rowCount = tbody[0].getElementsByTagName("tr").length;
      if (rowCount < 2) insertPosition = rowCount;

      if (product.newPriceTAX && selectedTAX !== 1) {
        createOneElement_B(tbody, insertPosition, product.newPriceTAX, product.TextNewTax);
        insertPosition += 1;
      }

      createOneElement_B(tbody, insertPosition, product.PriceFreeTax, product.TextFreeTax);
      console.log("[TaxFree] Prices inserted (legacy layout)");
      return;
    }

    console.warn("[TaxFree] No suitable price container found on page");
  } catch (error) {
    console.error("[TaxFree ERROR] insertPrice:", error);
  }
}
