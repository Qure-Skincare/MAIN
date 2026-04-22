(function () {
  if (window.__nLedMaskOffer2Initialized) {
    return;
  }
  window.__nLedMaskOffer2Initialized = true;

  var config = window.n_page_led_mask_offer_2_led_mask_form || {};
  var products = window.get_products_data || {};

  var mask = products[config.mask_handle];
  var neck = products[config.neck_handle];
  var guaranteeText = config.guarantee_text || "";
  var discount_text = config.discount_text || "";

  window.mask = mask;
  window.neck = neck;
  window.n_led_mask_offer_guarantee_text = guaranteeText;
  window.discount_text = discount_text;

  function enforceGuaranteeText() {
    if (!guaranteeText) {
      return;
    }

    var firstFeature = document.querySelector("#limited-offer .e-features-list li:first-child");
    if (!firstFeature) {
      return;
    }

    firstFeature.innerHTML = '<i class="e-icon e-icon-one-year"></i>' + guaranteeText;
  }

  function fallbackPurchase(event) {
    event.preventDefault();

    var items = [];
    if (mask && mask.variant_id) {
      items.push({ id: mask.variant_id, quantity: 1 });
    }
    if (neck && neck.variant_id) {
      items.push({ id: neck.variant_id, quantity: 1 });
    }

    if (!items.length || window.__nLedMaskOffer2Submitting) {
      return;
    }

    window.__nLedMaskOffer2Submitting = true;

    fetch("/discount/FREEN&DOFFER")
      .catch(function () {
        return null;
      })
      .then(function () {
        if (typeof addToCartJson === "function") {
          return addToCartJson(items);
        }

        if (window.CartDrawer && typeof window.CartDrawer.addToCartJson === "function") {
          return window.CartDrawer.addToCartJson(items);
        }

        return fetch("/cart/add.js", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items: items })
        });
      })
      .then(function () {
        return null;
      })
      .finally(function () {
        window.__nLedMaskOffer2Submitting = false;
      });
  }

  var buyButton = document.querySelector("#limited-offer .c-order-button .btn");
  if (buyButton) {
    buyButton.classList.add("add-cart-button", "product-form__submit");
    buyButton.setAttribute("type", "submit");

    var form = buyButton.closest("form");
    if (!form) {
      form = document.createElement("form");
      form.setAttribute("action", "#");
      buyButton.parentNode.insertBefore(form, buyButton);
      form.appendChild(buyButton);
    }

    form.addEventListener("submit", fallbackPurchase);
  }

  if (config.use_own_file) {
    loadScriptOnce("page-led-mask-offer-2-led-mask-form", "https://qureskincaredns.com/shopify/js/page-led-mask-offer-2-led-mask-form.js");
    loadScriptOnce("swiper", "https://qureskincaredns.com/assets/js-new/swiper.js");
    loadScriptOnce("countdown", "https://qureskincaredns.com/assets/js-new/countdown.js");
    loadScriptOnce("youtube-popup", "https://qureskincaredns.com/assets/js-new/yt-popup.js");
    loadScriptOnce("wistia-popup", "https://qureskincaredns.com/assets/js-new/wistia-popup.js");
    loadScriptOnce("wistia-script", "https://fast.wistia.com/assets/external/E-v1.js");
    loadScriptOnce("gallery-sticky-video", "https://qureskincaredns.com/assets/js-new/gallery-sticky-video.js");
    loadScriptOnce("dialog", "https://qureskincaredns.com/assets/js-new/dialog.js");
  }

  enforceGuaranteeText();
  setTimeout(enforceGuaranteeText, 300);
  setTimeout(enforceGuaranteeText, 1000);
})();
