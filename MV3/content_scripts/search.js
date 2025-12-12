/**
 * TaxFree Search Results Handler
 * Implements ShortLinks (URL shortening)
 */

let shortURLEnabled = false;

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
  return new Promise((resolve) => {
    chrome.storage.local.get("ShortLinkStatus", function (result) {
      shortURLEnabled = result?.ShortLinkStatus === true;
      if (shortURLEnabled) {
        console.log("[TaxFree Search] ShortLinks feature enabled");
      }
      resolve();
    });
  });
}

/**
 * Initialize search page enhancements
 */
function init() {
  try {
    if (!shortURLEnabled) {
      console.log("[TaxFree Search] ShortLinks disabled, skipping initialization");
      return;
    }

    processProducts(getVisibleProductItems());
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
 * Process a list of products for URL shortening
 * @param {Array} productItems - Array of ProductItem objects
 */
function processProducts(productItems) {
  try {
    if (productItems.length === 0 || !shortURLEnabled) {
      return;
    }

    productItems.forEach((productItem) => {
      try {
        productItem.setProductURL();
      } catch (error) {
        console.error("[TaxFree Search] Error processing product:", error);
      }
    });
  } catch (error) {
    console.error("[TaxFree Search] processProducts error:", error);
  }
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
    const productURL = container.querySelector("h2 a");

    if (!productURL) {
      console.warn("[TaxFree Search] Missing product link in container");
      return null;
    }

    return {
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
       * Shorten product URL to /dp/ASIN format
       * Only updates the main product link, not all links in the container
       */
      setProductURL: () => {
        try {
          let url = productURL.getAttribute("href");
          if (!url) return;

          let asin = null;

          // Try standard format: /dp/ASIN...
          let idx1 = url.indexOf("/dp/");
          let idx2 = url.indexOf("/", idx1 + 4);

          if (idx1 !== -1 && idx2 - idx1 > 2) {
            asin = url.slice(idx1, idx2);
          } else {
            // Try encoded format: dp%2FASIN...
            idx1 = url.indexOf("dp%2F");
            idx2 = url.indexOf("%2", idx1 + 5);

            if (idx1 !== -1 && idx2 - idx1 > 2) {
              asin = "/dp/" + url.slice(idx1 + 5, idx2);
            }
          }

          if (!asin) {
            console.warn("[TaxFree Search] Could not extract ASIN from URL");
            return;
          }

          // Only update the main product link and image link, not all links
          productURL.setAttribute("href", asin);

          // Also update the image link if it exists (common Amazon pattern)
          const imageLink = container.querySelector("img")?.closest("a");
          if (imageLink && imageLink !== productURL) {
            imageLink.setAttribute("href", asin);
          }
        } catch (error) {
          console.error("[TaxFree Search] Error shortening URL:", error);
        }
      },
    };
  } catch (error) {
    console.error("[TaxFree Search] ProductItem factory error:", error);
    return null;
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
          processProducts(newProducts);
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
