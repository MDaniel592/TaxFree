const parser = new DOMParser();
var shortURL;
var sendHerePlz;

document.addEventListener("DOMContentLoaded", async () => {
  if (location.href.indexOf("/s?") == -1) return;
  if (window.frameElement != undefined) return;

  chrome.storage.local.get("ShortLinkStatus", function (result) {
    shortURL = result.ShortLinkStatus ? result.ShortLinkStatus : true;
    if (shortURL === true) console.log("TaxFree - shortURL is making its magic...");
  });

  chrome.storage.local.get("sendHerePlzStatus", function (result) {
    sendHerePlz = result.sendHerePlzStatus ? result.sendHerePlzStatus : true;
    if (sendHerePlz === true) console.log("TaxFree - sendHerePlz is making its magic...");
    init();
  });
});

function init() {
  checkProducts(getVisibleProductItems());
  observeNewProducts();
}

function getVisibleProductItems() {
  return Array.from(document.querySelectorAll(".s-result-item h2 a, .s-inner-result-item h2 a"))
    .map((productURL) => {
      const productContainer = productURL.closest(".s-result-item, .s-inner-result-item");
      return ProductItem(productContainer);
    })
    .filter((productItem) => productItem.isVisible());
}

function checkProducts(productItems) {
  if (sendHerePlz === false && shortURL === false) return;

  productItems.forEach((productItem) => {
    productItem.showLoader();

    if (shortURL === true) productItem.setProductURL();

    if (sendHerePlz === true) {
      fetch(productItem.getProductUrl())
        .then((response) => response.text())
        .then((html) => parser.parseFromString(html, "text/html"))
        .then((page) => {
          const product = Product(page);

          if (!product.isDeliverable()) {
            productItem.markAsNotDeliverable();
          }

          if (product.isAvailableFromOtherSellers()) {
            productItem.addSellersMessage(product.getSellersMessage());
          }
        });
    }

    productItem.hideLoader();
  });
}

function ProductItem(container) {
  const productTitle = container.querySelector("h2");
  const productTitleContainer = productTitle.closest(".a-section");
  const productURL = container.querySelector("h2 a");
  const productOfferURL = container.querySelectorAll("a.a-link-normal");
  const productImgURL = container.getElementsByClassName("a-link-normal s-no-outline");
  const productPriceURL = container.getElementsByClassName("a-size-base a-link-normal a-text-normal");
  const productReviewURL = container.getElementsByClassName("a-link-normal");

  //
  const loader = document.createElement("span");
  loader.classList.add("shp-loader");
  loader.innerText = "Loading...";

  return {
    getProductUrl: () => new URL(productURL.getAttribute("href"), window.location),

    isVisible: () => !container.closest(".aok-hidden, .a-hidden"),

    showLoader: () => {
      productTitle.prepend(loader);
    },
    hideLoader: () => {
      loader.remove();
    },

    setProductURL: () => {
      // First url
      let url = productURL.getAttribute("href");
      let idx1 = url.indexOf("/");
      let idx2 = url.indexOf("/dp/");

      if (idx2 - idx1 > 1) url = url.slice(idx2, 500);

      let idx3 = url.indexOf("/", 4);
      url = url.slice(0, idx3 + 1);

      productURL.setAttribute("href", url);
      productImgURL[0].setAttribute("href", url);
      productPriceURL[0].setAttribute("href", url);
      productReviewURL[2].setAttribute("href", url);

      // Second url
      let pos = productOfferURL.length - 1;
      url = productOfferURL[pos].getAttribute("href");

      idx1 = url.indexOf("listing/");
      idx2 = url.indexOf("/", idx1 + 10);
      url = url.slice(0, idx2 + 1);

      // Bucle SET
      let i = 0;
      while (i < productOfferURL.length) {
        productOfferURL[i].setAttribute("href", url);
        if (i == pos) productOfferURL[i].setAttribute("href", url);
        i++;
      }
    },

    markAsNotDeliverable: () => {
      container.classList.add("shp-not-deliverable-product");

      const notDeliverableIndicator = document.createElement("span");
      notDeliverableIndicator.classList.add("shp-not-deliverable-product-icon");
      notDeliverableIndicator.innerHTML =
        '<svg fill-rule="evenodd" height="100%" stroke-linejoin="round" viewBox="0 0 865 794" width="100%"><path d="m668.2 253.5c8.9 2.7 17.1 7.6 23.8 14.3l118.1 118.1c10.6 10.6 16.7 25.1 16.7 40.1v127.8h18.9c10.4 0 18.9 8.5 18.9 18.9v37.8c0 10.4-8.5 18.9-18.9 18.9h-56.8c0 62.7-50.8 113.5-113.5 113.5s-113.5-50.8-113.5-113.5h-151.4c0 62.7-50.8 113.5-113.5 113.5-32.6 0-61.9-13.7-82.6-35.7l40.2-40.2c10.4 11.8 25.5 19.2 42.4 19.2 31.3 0 56.8-25.4 56.8-56.8 0-16.9-7.4-32.1-19.2-42.4l265.1-265.1v118.4h170.3v-14.3l-118.1-118.1h-38.1l54.3-54.3zm7.3 432.7c-31.3 0-56.8-25.4-56.8-56.8 0-31.3 25.4-56.8 56.8-56.8 31.3 0 56.8 25.4 56.8 56.8 0 31.3-25.4 56.8-56.8 56.8zm-148.1-548.7-419.5 419.5v-362.7c0-31.3 25.4-56.8 56.8-56.8h362.8zm249.7-59.1c9-9 9-23.5 0-32.5-9.2-9.2-20.5-20.5-29.7-29.7-9-9-23.5-9-32.5 0-97.2 97.2-601.5 601.5-698.7 698.7-9 9-9 23.5 0 32.5l29.7 29.7c9 9 23.5 9 32.5 0 97.2-97.2 601.5-601.5 698.7-698.7z"/></svg>';
      productTitle.prepend(notDeliverableIndicator);
    },

    addSellersMessage: (content) => {
      const sellersMessage = document.createElement("div");
      sellersMessage.classList.add("shp-sellers-message");
      sellersMessage.innerHTML = content;
      productTitleContainer.after(sellersMessage);
    },
  };
}

function Product(container) {
  const availableFromOtherSellers = container.querySelector('#availability .a-declarative[data-action="show-all-offers-display"]');

  return {
    isDeliverable: () => {
      return !container.querySelector(`
        #centerCol #ddmDeliveryMessage .a-color-error,
        #centerCol #deliveryMessageMirId .a-color-error,
        #rightCol #qualifiedBuybox #ddmDeliveryMessage .a-color-error,
        #rightCol #qualifiedBuybox #mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE .a-color-error,
        #rightCol #qualifiedBuybox #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-color-error,
        #rightCol .a-accordion-active #ddmDeliveryMessage .a-color-error,
        #rightCol .a-accordion-active #mir-layout-DELIVERY_BLOCK-slot-DELIVERY_MESSAGE .a-color-error,
        #rightCol .a-accordion-active #mir-layout-DELIVERY_BLOCK-slot-PRIMARY_DELIVERY_MESSAGE_LARGE .a-color-error
      `);
    },

    isAvailableFromOtherSellers: () => Boolean(availableFromOtherSellers),
    getSellersMessage: () => availableFromOtherSellers.innerHTML,
  };
}

function observeNewProducts() {
  const resultsLoader = document.querySelector(".s-result-list-placeholder");
  if (resultsLoader) {
    const observer = new MutationObserver(() => {
      checkProducts(getVisibleProductItems(), sendHerePlz, shortURL);
    });
    observer.observe(resultsLoader, { attributes: true });
  }
}
