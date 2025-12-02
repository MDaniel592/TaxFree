/**
 * TaxFree Search Results Handler
 * Implements SendHerePlz (shipping detection) and ShortLinks (URL shortening)
 */

const parser = new DOMParser();
let shortURLEnabled = false;
let sendHerePlzEnabled = false;

const DELIVERY_ERROR_SELECTORS = [
  "#centerCol #ddmDeliveryMessage .a-color-error",
  "#centerCol #deliveryMessageMirId .a-color-error",
  "#rightCol #qualifiedBuybox #ddmDeliveryMessage .a-color-error",
  "#rightCol #qualifiedBuybox #mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE .a-color-error",
  "#rightCol #qualifiedBuybox #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-color-error",
  "#rightCol .a-accordion-active #ddmDeliveryMessage .a-color-error",
  "#rightCol .a-accordion-active #mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE .a-color-error",
  "#rightCol .a-accordion-active #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-color-error",
];

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize script when DOM is ready
 */
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Only run on search pages
    if (location.href.indexOf("/s?") === -1) {
      return;
    }

    // Ignore iframes
    if (window.frameElement !== undefined) {
      return;
    }

    await loadSettings();
    init();
  } catch (error) {
    console.error("[TaxFree Search] DOMContentLoaded error:", error);
  }
});

/**
 * Load feature settings from storage
 */
async function loadSettings() {
  return Promise.all([
    new Promise((resolve) => {
      chrome.storage.local.get("ShortLinkStatus", function (result) {
        shortURLEnabled = result?.ShortLinkStatus === true;
        if (shortURLEnabled) {
          console.log("[TaxFree Search] ShortLinks feature enabled");
        }
        resolve();
      });
    }),
    new Promise((resolve) => {
      chrome.storage.local.get("sendHerePlzStatus", function (result) {
        sendHerePlzEnabled = result?.sendHerePlzStatus === true;
        if (sendHerePlzEnabled) {
          console.log("[TaxFree Search] SendHerePlz feature enabled");
        }
        resolve();
      });
    }),
  ]);
}

/**
 * Initialize search page enhancements
 */
function init() {
  try {
    if (!shortURLEnabled && !sendHerePlzEnabled) {
      console.log("[TaxFree Search] Both features disabled, skipping initialization");
      return;
    }

    checkProducts(getVisibleProductItems());
    observeNewProducts();
    console.log("[TaxFree Search] Initialization complete");
  } catch (error) {
    console.error("[TaxFree Search] init error:", error);
  }
}

// ============================================================================
// PRODUCT DETECTION
// ============================================================================

/**
 * Get all visible product items on the search results page
 * @returns {Array} Array of ProductItem objects
 */
function getVisibleProductItems() {
  try {
    return Array.from(document.querySelectorAll(".s-result-item h2 a, .s-inner-result-item h2 a"))
      .map((productURL) => {
        const productContainer = productURL.closest(".s-result-item, .s-inner-result-item");
        return ProductItem(productContainer);
      })
      .filter((productItem) => productItem && productItem.isVisible());
  } catch (error) {
    console.error("[TaxFree Search] getVisibleProductItems error:", error);
    return [];
  }
}

// ============================================================================
// PRODUCT PROCESSING
// ============================================================================

/**
 * Process a list of products for enhancements
 * @param {Array} productItems - Array of ProductItem objects
 */
function checkProducts(productItems) {
  try {
    if (productItems.length === 0) {
      return;
    }

    if (!sendHerePlzEnabled && !shortURLEnabled) {
      return;
    }

    productItems.forEach((productItem) => {
      try {
        productItem.showLoader();

        // Apply URL shortening
        if (shortURLEnabled) {
          productItem.setProductURL();
        }

        // Check shipping availability
        if (sendHerePlzEnabled) {
          const productUrl = productItem.getProductUrl();
          if (productUrl) {
            fetchAndCheckProduct(productItem, productUrl);
          }
        }
      } catch (error) {
        console.error("[TaxFree Search] Error processing product:", error);
      }
    });
  } catch (error) {
    console.error("[TaxFree Search] checkProducts error:", error);
  }
}

/**
 * Fetch product page and check delivery status
 * @param {Object} productItem - ProductItem object
 * @param {URL} productUrl - Product URL
 */
function fetchAndCheckProduct(productItem, productUrl) {
  fetch(productUrl, { timeout: 10000 })
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      return response.text();
    })
    .then((html) => {
      const page = parser.parseFromString(html, "text/html");
      const product = Product(page);

      if (!product.isDeliverable()) {
        productItem.markAsNotDeliverable();
      }

      if (product.isAvailableFromOtherSellers()) {
        productItem.addSellersMessage(product.getSellersMessage());
      }
    })
    .catch((error) => {
      console.warn("[TaxFree Search] Failed to fetch product:", productUrl, error);
    })
    .finally(() => {
      productItem.hideLoader();
    });
}

// ============================================================================
// PRODUCT ITEM FACTORY
// ============================================================================

/**
 * Factory function to create a ProductItem interface
 * @param {HTMLElement} container - Product container element
 * @returns {Object} ProductItem interface
 */
function ProductItem(container) {
  if (!container) {
    return null;
  }

  try {
    const productTitle = container.querySelector("h2");
    const productTitleContainer = productTitle?.closest(".a-section");
    const productURL = container.querySelector("h2 a");

    if (!productTitle || !productURL) {
      console.warn("[TaxFree Search] Missing required elements in product container");
      return null;
    }

    const loader = document.createElement("span");
    loader.classList.add("shp-loader");
    loader.innerText = "Loading...";

    return {
      /**
       * Get product URL from link
       * @returns {URL|null} Parsed URL object
       */
      getProductUrl: () => {
        try {
          const href = productURL.getAttribute("href");
          return href ? new URL(href, window.location) : null;
        } catch (error) {
          console.error("[TaxFree Search] Error parsing product URL:", error);
          return null;
        }
      },

      /**
       * Check if product item is visible on page
       * @returns {boolean} True if visible
       */
      isVisible: () => {
        try {
          return !container.closest(".aok-hidden, .a-hidden");
        } catch {
          return true; // Assume visible on error
        }
      },

      /**
       * Show loading indicator
       */
      showLoader: () => {
        try {
          if (productTitle && !productTitle.querySelector(".shp-loader")) {
            productTitle.prepend(loader);
          }
        } catch (error) {
          console.error("[TaxFree Search] Error showing loader:", error);
        }
      },

      /**
       * Hide loading indicator
       */
      hideLoader: () => {
        try {
          loader.remove();
        } catch (error) {
          console.error("[TaxFree Search] Error hiding loader:", error);
        }
      },

      /**
       * Shorten product URL to /dp/ASIN format
       */
      setProductURL: () => {
        try {
          let url = productURL.getAttribute("href");
          if (!url) return;

          let asın = null;

          // Try standard format: /dp/ASIN...
          let idx1 = url.indexOf("/dp/");
          let idx2 = url.indexOf("/", idx1 + 4);

          if (idx1 !== -1 && idx2 - idx1 > 2) {
            asın = url.slice(idx1, idx2);
          } else {
            // Try encoded format: dp%2FASIN...
            idx1 = url.indexOf("dp%2F");
            idx2 = url.indexOf("%2", idx1 + 5);

            if (idx1 !== -1 && idx2 - idx1 > 2) {
              asın = "/dp/" + url.slice(idx1 + 5, idx2);
            }
          }

          if (!asın) {
            console.warn("[TaxFree Search] Could not extract ASIN from URL");
            return;
          }

          // Update all links in this product item
          const anchors = container.querySelectorAll("a");
          anchors.forEach((anchor) => {
            anchor.setAttribute("href", asın);
          });
        } catch (error) {
          console.error("[TaxFree Search] Error shortening URL:", error);
        }
      },

      /**
       * Mark product as non-deliverable with visual indicator
       */
      markAsNotDeliverable: () => {
        try {
          container.classList.add("shp-not-deliverable-product");

          const notDeliverableIndicator = document.createElement("span");
          notDeliverableIndicator.classList.add("shp-not-deliverable-product-icon");
          notDeliverableIndicator.title = "Not deliverable to your location";
          notDeliverableIndicator.innerHTML =
            '<svg fill-rule="evenodd" height="100%" stroke-linejoin="round" viewBox="0 0 865 794" width="100%"><path d="m668.2 253.5c8.9 2.7 17.1 7.6 23.8 14.3l118.1 118.1c10.6 10.6 16.7 25.1 16.7 40.1v127.8h18.9c10.4 0 18.9 8.5 18.9 18.9v37.8c0 10.4-8.5 18.9-18.9 18.9h-56.8c0 62.7-50.8 113.5-113.5 113.5s-113.5-50.8-113.5-113.5h-151.4c0 62.7-50.8 113.5-113.5 113.5-32.6 0-61.9-13.7-82.6-35.7l40.2-40.2c10.4 11.8 25.5 19.2 42.4 19.2 31.3 0 56.8-25.4 56.8-56.8 0-16.9-7.4-32.1-19.2-42.4l265.1-265.1v118.4h170.3v-14.3l-118.1-118.1h-38.1l54.3-54.3zm7.3 432.7c-31.3 0-56.8-25.4-56.8-56.8 0-31.3 25.4-56.8 56.8-56.8 31.3 0 56.8 25.4 56.8 56.8 0 31.3-25.4 56.8-56.8 56.8zm-148.1-548.7-419.5 419.5v-362.7c0-31.3 25.4-56.8 56.8-56.8h362.8zm249.7-59.1c9-9 9-23.5 0-32.5-9.2-9.2-20.5-20.5-29.7-29.7-9-9-23.5-9-32.5 0-97.2 97.2-601.5 601.5-698.7 698.7-9 9-9 23.5 0 32.5l29.7 29.7c9 9 23.5 9 32.5 0 97.2-97.2 601.5-601.5 698.7-698.7z"/></svg>';
          productTitle.prepend(notDeliverableIndicator);
        } catch (error) {
          console.error("[TaxFree Search] Error marking non-deliverable:", error);
        }
      },

      /**
       * Add sellers message below product title
       * @param {string} content - HTML content to display
       */
      addSellersMessage: (content) => {
        try {
          const sellersMessage = document.createElement("div");
          sellersMessage.classList.add("shp-sellers-message");
          sellersMessage.innerHTML = content;

          if (productTitleContainer) {
            productTitleContainer.after(sellersMessage);
          }
        } catch (error) {
          console.error("[TaxFree Search] Error adding sellers message:", error);
        }
      },
    };
  } catch (error) {
    console.error("[TaxFree Search] ProductItem factory error:", error);
    return null;
  }
}

// ============================================================================
// PRODUCT INSPECTION
// ============================================================================

/**
 * Factory function to inspect a product page
 * @param {Document} container - Product page DOM
 * @returns {Object} Product interface
 */
function Product(container) {
  if (!container) {
    return {
      isDeliverable: () => true,
      isAvailableFromOtherSellers: () => false,
      getSellersMessage: () => "",
    };
  }

  try {
    const availableFromOtherSellers = container.querySelector(
      '#availability .a-declarative[data-action="show-all-offers-display"]'
    );

    return {
      /**
       * Check if product is deliverable
       * @returns {boolean} True if product can be delivered
       */
      isDeliverable: () => {
        try {
          for (const selector of DELIVERY_ERROR_SELECTORS) {
            if (container.querySelector(selector)) {
              return false;
            }
          }
          return true;
        } catch (error) {
          console.error("[TaxFree Search] Error checking deliverability:", error);
          return true; // Assume deliverable on error
        }
      },

      /**
       * Check if product is available from other sellers
       * @returns {boolean} True if other sellers have it
       */
      isAvailableFromOtherSellers: () => {
        return Boolean(availableFromOtherSellers);
      },

      /**
       * Get sellers message HTML
       * @returns {string} HTML content of sellers message
       */
      getSellersMessage: () => {
        try {
          return availableFromOtherSellers?.innerHTML || "";
        } catch (error) {
          console.error("[TaxFree Search] Error getting sellers message:", error);
          return "";
        }
      },
    };
  } catch (error) {
    console.error("[TaxFree Search] Product factory error:", error);
    return {
      isDeliverable: () => true,
      isAvailableFromOtherSellers: () => false,
      getSellersMessage: () => "",
    };
  }
}

// ============================================================================
// MUTATION OBSERVER
// ============================================================================

/**
 * Observe the results container for new products (infinite scroll)
 */
function observeNewProducts() {
  try {
    const resultsContainer = document.querySelector(".s-result-list-placeholder");
    if (!resultsContainer) {
      console.warn("[TaxFree Search] Results container not found for observer");
      return;
    }

    const observer = new MutationObserver(() => {
      try {
        const newProducts = getVisibleProductItems();
        if (newProducts.length > 0) {
          console.log(`[TaxFree Search] Detected ${newProducts.length} new products`);
          checkProducts(newProducts);
        }
      } catch (error) {
        console.error("[TaxFree Search] Error in mutation observer:", error);
      }
    });

    observer.observe(resultsContainer, {
      attributes: true,
      subtree: false,
      attributeFilter: ["class"],
    });

    console.log("[TaxFree Search] Mutation observer initialized");
  } catch (error) {
    console.error("[TaxFree Search] Error setting up observer:", error);
  }
}
