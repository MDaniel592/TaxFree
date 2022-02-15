var shortLink = true;
var sendHerePlz = true;

const parser = new DOMParser();

document.addEventListener("DOMContentLoaded", async () => {
  chrome.storage.local.get(["ShortLinkStatus"], function (result) {
    shortLink = result.ShortLinkStatus;
  });

  chrome.storage.local.get(["sendHerePlzStatus"], function (result) {
    sendHerePlz = result.sendHerePlzStatus;
    if (sendHerePlz === true || shortLink === true) {
      init(sendHerePlz, shortLink);
    }
  });
});

function init(sendHerePlz, shortLink) {
  checkProducts(getVisibleProductItems(), sendHerePlz, shortLink);
  observeNewProducts();
}

function getVisibleProductItems() {
  return Array.from(document.querySelectorAll(".s-result-item h2 a"))
    .map((productLink) => {
      const productContainer = productLink.closest(
        ".s-result-item, .s-inner-result-item"
      );
      return ProductItem(productContainer);
    })
    .filter((productItem) => productItem.isVisible());
}

function checkProducts(productItems, sendHerePlz, shortLink) {
  console.log("SendHerePlz is making its magic...");

  productItems.forEach((productItem) => {
    productItem.showLoader();

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
        })
        .finally(productItem.hideLoader);
    }

    // // Clean the refers
    // if (shortLink === true) {
    //   productItem.setProductUrl();
    // }
  });
}

function ProductItem(container) {
  const productTitle = container.querySelector("h2");
  const productTitleContainer = productTitle.closest(".a-section");
  const productLink = container.querySelector("h2 a");

  // LINKS WHICH NEEDS TO BE MOFIED

  const productOfferLink = container.querySelectorAll("a.a-link-normal");
  const productImgLink = container.getElementsByClassName(
    "a-link-normal s-no-outline"
  );
  const productPriceLink = container.getElementsByClassName(
    "a-size-base a-link-normal a-text-normal"
  );
  const productReviewLink = container.getElementsByClassName("a-link-normal");

  //
  const loader = document.createElement("span");
  loader.classList.add("shp-loader");
  loader.innerText = "Loading...";

  return {
    getProductUrl: () =>
      new URL(productLink.getAttribute("href"), window.location),

    isVisible: () => !container.closest(".aok-hidden, .a-hidden"),

    showLoader: () => {
      productTitle.prepend(loader);
    },
    hideLoader: () => {
      loader.remove();
    },

    setProductUrl: () => {
      // 1 ENLACE
      var enlace = productLink.getAttribute("href");

      var idx1 = enlace.indexOf("/");
      var idx2 = enlace.indexOf("/dp/");

      if (idx2 - idx1 > 1) {
        enlace = enlace.slice(idx2, 500);
      }

      var idx3 = enlace.indexOf("/", 4);

      enlace = enlace.slice(0, idx3 + 1);

      productLink.setAttribute("href", enlace);
      productImgLink[0].setAttribute("href", enlace); // IMG
      productPriceLink[0].setAttribute("href", enlace); // PRECIO
      productReviewLink[2].setAttribute("href", enlace); // Review

      // 2 ENLACE OFFER
      var pos = productOfferLink.length - 1;
      var enlace2 = productOfferLink[pos].getAttribute("href");

      idx1 = enlace2.indexOf("listing/");
      idx2 = enlace2.indexOf("/", idx1 + 10);
      enlace2 = enlace2.slice(0, idx2 + 1);

      // Bucle SET
      var i = 0;

      while (i < productOfferLink.length) {
        productOfferLink[i].setAttribute("href", enlace);

        if (i == pos) {
          productOfferLink[i].setAttribute("href", enlace2);
        }
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
  const availableFromOtherSellers = container.querySelector(
    '#availability .a-declarative[data-action="show-all-offers-display"]'
  );

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
      checkProducts(getVisibleProductItems(), sendHerePlz, shortLink);
    });
    observer.observe(resultsLoader, { attributes: true });
  }
}
