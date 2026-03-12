/**
 * Build Your Own — Bundle Discount System
 * Manages product selection with quantity support and tiered discounts
 */

(function() {
  'use strict';

  var STORAGE_KEY = 'byoBundleSelection';
  var PRODUCT_DATA_PREFIX = 'build-your-own-products-';
  var DISCOUNT_TIERS = {
    2: { percent: 20, code: 'BYO20' },
    3: { percent: 25, code: 'BYO25' }
  };

  // State: Map<variantId, { variantId, handle, title, price, image, quantity }>
  var selectedProducts = new Map();

  /**
   * Get available BYO products from window.get_products_data (inline scripts, sync)
   */
  function getAvailableProducts() {
    var products = {};
    var data = window.get_products_data || {};
    Object.keys(data).forEach(function(key) {
      if (key.indexOf(PRODUCT_DATA_PREFIX) === 0) {
        var p = data[key];
        products[p.variant_id] = p;
        if (p.variants) {
          Object.keys(p.variants).forEach(function(title) {
            var vid = p.variants[title];
            if (!products[vid]) products[vid] = p;
          });
        }
      }
    });
    return products;
  }

  /**
   * Initialize
   */
  async function init() {
    bindEvents();
    await restoreFromCart();
    updateStickyBar();
  }

  /**
   * Restore selection from cart
   */
  async function restoreFromCart() {
    try {
      var response = await fetch('/cart.js');
      var cart = await response.json();
      var available = getAvailableProducts();
      var availableVariantIds = Object.keys(available).map(Number);

      selectedProducts.clear();

      cart.items.forEach(function(item) {
        if (availableVariantIds.indexOf(item.variant_id) !== -1) {
          var p = available[item.variant_id];
          selectedProducts.set(item.variant_id, {
            variantId: item.variant_id,
            handle: p.handle,
            title: p.title,
            price: p.price_original,
            image: p.featured_image,
            quantity: item.quantity
          });
        }
      });


      saveToStorage();
      restoreVisualState();
    } catch (e) {
      console.warn('BYO Discount: Failed to restore from cart', e);
      selectedProducts.clear();
    }
  }

  /**
   * Restore visual state of product cards (show quantity controls, set values)
   * Uses retry if DOM elements not yet cloned from template
   */
  function restoreVisualState(retryCount) {
    retryCount = retryCount || 0;
    var cards = document.querySelectorAll('[data-byo-product]');

    if (cards.length === 0 && retryCount < 10) {
      setTimeout(function() { restoreVisualState(retryCount + 1); }, 200);
      return;
    }

    cards.forEach(function(card) {
      var variantId = parseInt(card.dataset.variantId);
      var product = selectedProducts.get(variantId);

      // If not found by current variant, check by handle (variant-switched products)
      if (!product) {
        var handle = card.dataset.handle;
        selectedProducts.forEach(function(p) {
          if (p.handle === handle) product = p;
        });
      }

      if (product) {
        // Restore variant radio selection
        var radio = card.querySelector('.select-color input[data-value="' + product.variantId + '"]');
        if (radio) {
          radio.checked = true;
          card.dataset.variantId = String(product.variantId);
          if (radio.dataset.variantPrice) card.dataset.price = radio.dataset.variantPrice;
          if (radio.dataset.variantImage) product.image = radio.dataset.variantImage;
        }
        showQuantityControls(card, product.quantity);
      }
    });
  }

  /**
   * Show quantity controls and hide Add button for a product card
   */
  function showQuantityControls(card, quantity) {
    var checkbox = card.querySelector('input[name="added_in_cart"]');
    var addButton = card.querySelector('.add-cart-button');
    var quantityWrap = card.querySelector('[data-e-quantity]');
    var qtyInput = card.querySelector('input[name="qty"]');

    if (checkbox) checkbox.checked = true;
    if (addButton) addButton.style.display = 'none';
    if (quantityWrap) quantityWrap.style.display = 'flex';
    if (qtyInput) qtyInput.value = quantity || 1;
  }

  /**
   * Hide quantity controls and show Add button for a product card
   */
  function hideQuantityControls(card) {
    var checkbox = card.querySelector('input[name="added_in_cart"]');
    var addButton = card.querySelector('.add-cart-button');
    var quantityWrap = card.querySelector('[data-e-quantity]');
    var qtyInput = card.querySelector('input[name="qty"]');

    if (checkbox) checkbox.checked = false;
    if (addButton) addButton.style.display = '';
    if (quantityWrap) quantityWrap.style.display = '';
    if (qtyInput) qtyInput.value = 1;
  }

  /**
   * Save to localStorage
   */
  function saveToStorage() {
    try {
      var arr = [];
      selectedProducts.forEach(function(val) { arr.push(val); });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    } catch (e) {
      console.warn('BYO Discount: Failed to save to storage', e);
    }
  }

  /**
   * Get total quantity of all selected products
   */
  function getTotalQuantity() {
    var total = 0;
    selectedProducts.forEach(function(p) { total += p.quantity; });
    return total;
  }

  /**
   * Get current discount tier (based on total item count)
   */
  function getCurrentTier() {
    var count = getTotalQuantity();
    if (count < 2) return null;
    return DISCOUNT_TIERS[Math.min(count, 3)];
  }

  /**
   * Calculate subtotal (sum of price * quantity for all products)
   */
  function calculateSubtotal() {
    var total = 0;
    selectedProducts.forEach(function(p) {
      total += p.price * p.quantity;
    });
    return total;
  }

  /**
   * Calculate discounted price
   */
  function calculateDiscountedPrice() {
    var subtotal = calculateSubtotal();
    var tier = getCurrentTier();
    if (!tier) return subtotal;
    return subtotal * (1 - tier.percent / 100);
  }

  /**
   * Format price (cents to dollars)
   */
  function formatPrice(cents) {
    var dollars = cents / 100;
    return '$' + dollars.toFixed(2).replace(/\.00$/, '');
  }

  /**
   * Get expanded product list (repeated by quantity, for sticky bar slots)
   */
  function getExpandedProductList() {
    var list = [];
    selectedProducts.forEach(function(p) {
      for (var i = 0; i < p.quantity; i++) {
        list.push(p);
      }
    });
    return list;
  }

  /**
   * Update sticky bar UI
   */
  function updateStickyBar() {
    var count = getTotalQuantity();
    var productList = getExpandedProductList();
    var tier = getCurrentTier();

    // Bundle items — swap discount-box ↔ item-box based on active state
    var bundleItems = document.querySelectorAll('.bundle-progress .bundle-item');
    var productIndex = 0;
    bundleItems.forEach(function(item, index) {
      var isActive = index < count;
      item.classList.toggle('active', isActive);

      var discountBox = item.querySelector('.discount-box');
      var itemBox = item.querySelector('.item-box');

      if (isActive && itemBox && productIndex < productList.length) {
        if (discountBox) discountBox.classList.add('d-none');
        itemBox.classList.remove('d-none');
        var img = itemBox.querySelector('img');
        if (img) {
          img.src = productList[productIndex].image;
          img.alt = productList[productIndex].title;
        }
        itemBox.dataset.variantId = productList[productIndex].variantId;
        productIndex++;
      } else {
        if (discountBox) discountBox.classList.remove('d-none');
        if (itemBox) itemBox.classList.add('d-none');
      }
    });

    // Progress line
    var progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      var maxSteps = bundleItems.length || 4;
      progressFill.style.width = (count > 0 ? (Math.min(count, maxSteps) / maxSteps) * 100 : 0) + '%';
    }

    // Subtotal
    var subtotalBlock = document.querySelector('.subtotal_cta');
    var comparePriceEl = document.querySelector('.subtotal_cta .compare_price');
    var discountedPriceEl = document.querySelector('.subtotal_cta .discounted_price');

    if (subtotalBlock) {
      subtotalBlock.classList.toggle('subtotal-visible', count > 0);
    }

    if (comparePriceEl) {
      comparePriceEl.textContent = formatPrice(calculateSubtotal());
      comparePriceEl.classList.toggle('d-none', !tier);
    }

    if (discountedPriceEl) {
      discountedPriceEl.textContent = tier ? formatPrice(calculateDiscountedPrice()) : formatPrice(calculateSubtotal());
      discountedPriceEl.classList.toggle('no-discount', !tier);
    }

    // CTA button state and text
    var ctaButton = document.querySelector('.skincare_plan_cta .btn_wrap .btn');
    if (ctaButton) {
      if (count === 0) {
        ctaButton.disabled = true;
        ctaButton.innerHTML = 'Add an item to unlock savings!';
      } else if (count === 1) {
        ctaButton.disabled = false;
        ctaButton.innerHTML = 'CHECKOUT <i class="e-icon e-icon-lock"></i>';
      } else {
        ctaButton.disabled = false;
        ctaButton.innerHTML = 'CHECKOUT <i class="e-icon e-icon-lock"></i>';
      }
    }
  }

  /**
   * Sync quantity across all duplicate cards (same variant_id)
   */
  function syncQuantityAcrossCards(variantId, quantity) {
    var cards = document.querySelectorAll('[data-byo-product][data-variant-id="' + variantId + '"]');
    cards.forEach(function(card) {
      var qtyInput = card.querySelector('input[name="qty"]');
      if (qtyInput) qtyInput.value = quantity;
    });
  }

  /**
   * Add all selected products to cart with discount
   */
  async function addToCartWithDiscount() {
    if (selectedProducts.size === 0) return;

    try {
      // Get current cart to check for duplicates
      var cartResponse = await fetch('/cart.js');
      var cart = await cartResponse.json();

      // Separate new items and items needing quantity update
      var cartVariantMap = {};
      cart.items.forEach(function(item) {
        cartVariantMap[item.variant_id] = item.quantity;
      });

      var newItems = [];
      var updates = {};
      var needsUpdate = false;

      selectedProducts.forEach(function(p) {
        if (!(p.variantId in cartVariantMap)) {
          newItems.push({ id: p.variantId, quantity: p.quantity });
        } else if (cartVariantMap[p.variantId] !== p.quantity) {
          updates[p.variantId] = p.quantity;
          needsUpdate = true;
        }
      });

      // Add new items
      if (newItems.length > 0) {
        var addResponse = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: newItems })
        });
        if (!addResponse.ok) throw new Error('Failed to add to cart');
      }

      // Batch update existing items via /cart/update.js
      if (needsUpdate) {
        await fetch('/cart/update.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ updates: updates })
        });
      }

      // Apply or clear discount code based on current tier
      await reapplyDiscount();

      // Toggle free gifts
      if (window.CartDrawer && typeof window.CartDrawer.toogleGift === 'function') {
        await window.CartDrawer.toogleGift();
      }

      // Open cart drawer
      document.dispatchEvent(new CustomEvent('cart.requestComplete', {
        detail: { source: 'addToCartJson' }
      }));

    } catch (error) {
      console.error('BYO Discount: Error adding to cart', error);
      alert('Error adding items to cart. Please try again.');
    }
  }

  /**
   * Re-apply correct discount code or clear it based on current tier
   */
  async function reapplyDiscount() {
    var tier = getCurrentTier();
    if (tier) {
      await fetch('/discount/' + tier.code);
    } else {
      // Clear any previously applied BYO discount
      await fetch('/discount/');
    }
  }

  /**
   * Sync with cart (when items removed from cart drawer)
   */
  async function syncWithCart() {
    try {
      var response = await fetch('/cart.js');
      var cart = await response.json();
      var available = getAvailableProducts();
      var availableVariantIds = Object.keys(available).map(Number);
      var changed = false;

      // Build map of cart quantities for BYO products
      var cartQtyMap = {};
      cart.items.forEach(function(item) {
        if (availableVariantIds.indexOf(item.variant_id) !== -1) {
          cartQtyMap[item.variant_id] = item.quantity;
        }
      });

      // Remove products no longer in cart
      var toRemove = [];
      selectedProducts.forEach(function(p, variantId) {
        if (!(variantId in cartQtyMap)) {
          toRemove.push(variantId);
        }
      });

      toRemove.forEach(function(variantId) {
        var removedProduct = selectedProducts.get(variantId);
        selectedProducts.delete(variantId);
        // Find cards by variant ID or by handle (for variant-switched products)
        var cards = document.querySelectorAll('[data-byo-product][data-variant-id="' + variantId + '"]');
        if (cards.length === 0 && removedProduct) {
          cards = document.querySelectorAll('[data-byo-product][data-handle="' + removedProduct.handle + '"]');
        }
        cards.forEach(function(card) { hideQuantityControls(card); });
        changed = true;
      });

      // Update quantities for products still in cart
      selectedProducts.forEach(function(p, variantId) {
        if (variantId in cartQtyMap && p.quantity !== cartQtyMap[variantId]) {
          p.quantity = cartQtyMap[variantId];
          syncQuantityAcrossCards(variantId, p.quantity);
          changed = true;
        }
      });

      if (changed) {
        saveToStorage();
        updateStickyBar();
        await reapplyDiscount();
      }
    } catch (e) {
      console.warn('BYO Discount: Failed to sync with cart', e);
    }
  }

  /**
   * Bind event listeners (event delegation)
   */
  function bindEvents() {
    document.addEventListener('click', function(e) {
      // Add button click
      var addButton = e.target.closest('.add-cart-button');
      if (addButton) {
        var card = addButton.closest('[data-byo-product]');
        if (card) {
          // Validate variant selection for products with color selector
          var colorSelector = card.querySelector('.select-color');
          if (colorSelector) {
            var selectedRadio = colorSelector.querySelector('input[type="radio"]:checked');
            if (!selectedRadio) {
              colorSelector.classList.add('select-color--error');
              setTimeout(function() { colorSelector.classList.remove('select-color--error'); }, 2000);
              return;
            }
            card.dataset.variantId = selectedRadio.dataset.value;
            if (selectedRadio.dataset.variantPrice) {
              card.dataset.price = selectedRadio.dataset.variantPrice;
            }
          }

          var variantId = parseInt(card.dataset.variantId);

          // Already selected — ignore (CDN handles toggle)
          if (selectedProducts.has(variantId)) return;


          var image = card.dataset.image;
          var selectedRadio = card.querySelector('.select-color input[type="radio"]:checked');
          if (selectedRadio && selectedRadio.dataset.variantImage) {
            image = selectedRadio.dataset.variantImage;
          }

          selectedProducts.set(variantId, {
            variantId: variantId,
            handle: card.dataset.handle,
            title: card.dataset.title,
            price: parseFloat(card.dataset.price) || 0,
            image: image,
            quantity: 1
          });

          saveToStorage();
          updateStickyBar();
        }
      }

      // Increment button
      var incrementBtn = e.target.closest('[data-e-quantity-action="increment"]');
      if (incrementBtn) {
        var card = incrementBtn.closest('[data-byo-product]');
        if (card) {
          var variantId = parseInt(card.dataset.variantId);
          var product = selectedProducts.get(variantId);
          if (product) {
            product.quantity++;
            syncQuantityAcrossCards(variantId, product.quantity);
            saveToStorage();
            updateStickyBar();
          }
        }
      }

      // Decrement button
      var decrementBtn = e.target.closest('[data-e-quantity-action="decrement"]');
      if (decrementBtn) {
        var card = decrementBtn.closest('[data-byo-product]');
        if (card) {
          var variantId = parseInt(card.dataset.variantId);
          var product = selectedProducts.get(variantId);
          if (product) {
            if (product.quantity > 1) {
              product.quantity--;
              syncQuantityAcrossCards(variantId, product.quantity);
            } else {
              // Remove product
              selectedProducts.delete(variantId);
              // Reset ALL cards for this variant
              var allCards = document.querySelectorAll('[data-byo-product][data-variant-id="' + variantId + '"]');
              allCards.forEach(function(c) { hideQuantityControls(c); });
            }
            saveToStorage();
            updateStickyBar();
          }
        }
      }

      // Remove item button in sticky bar
      var removeBtn = e.target.closest('.bundle-item .remove-item');
      if (removeBtn) {
        e.preventDefault();
        var itemBox = removeBtn.closest('.item-box');
        if (itemBox && itemBox.dataset.variantId) {
          var variantId = parseInt(itemBox.dataset.variantId);
          var product = selectedProducts.get(variantId);
          if (product) {
            if (product.quantity > 1) {
              product.quantity--;
              syncQuantityAcrossCards(variantId, product.quantity);
            } else {
              selectedProducts.delete(variantId);
              var allCards = document.querySelectorAll('[data-byo-product][data-variant-id="' + variantId + '"]');
              allCards.forEach(function(c) { hideQuantityControls(c); });
            }
            saveToStorage();
            updateStickyBar();
          }
        }
      }

      // CTA Checkout button
      var ctaButton = e.target.closest('.skincare_plan_cta .btn_wrap .btn');
      if (ctaButton && !ctaButton.disabled) {
        e.preventDefault();
        addToCartWithDiscount();
      }
    });

    // Variant radio change — update card data and selectedProducts if already in bundle
    document.addEventListener('change', function(e) {
      var radio = e.target.closest('.select-color input[type="radio"]');
      if (radio) {
        var card = radio.closest('[data-byo-product]');
        if (card) {
          var oldVariantId = parseInt(card.dataset.variantId);
          var newVariantId = parseInt(radio.dataset.value);
          card.dataset.variantId = radio.dataset.value;
          if (radio.dataset.variantPrice) card.dataset.price = radio.dataset.variantPrice;
          card.querySelector('.select-color').classList.remove('select-color--error');

          // Update selectedProducts if this product is already in bundle
          var product = selectedProducts.get(oldVariantId);
          if (product && oldVariantId !== newVariantId) {
            selectedProducts.delete(oldVariantId);
            product.variantId = newVariantId;
            product.price = parseInt(radio.dataset.variantPrice) || product.price;
            if (radio.dataset.variantImage) product.image = radio.dataset.variantImage;
            selectedProducts.set(newVariantId, product);
            saveToStorage();
            updateStickyBar();
          }
        }
      }
    });

    // Listen for cart changes (items removed from slide cart)
    document.addEventListener('cart.requestComplete', function(e) {
      var source = e.detail && e.detail.source;
      if (source === 'changeCart' || source === 'syncCart' || source === 'updateCartMany') {
        syncWithCart();
      }
    });
  }

  // Initialize
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() { init(); });
  } else {
    init();
  }

  // Public API
  window.BYOSelection = {
    getSelectedProducts: function() {
      var arr = [];
      selectedProducts.forEach(function(val) { arr.push(Object.assign({}, val)); });
      return arr;
    },
    getCurrentTier: getCurrentTier,
    clearSelection: function() {
      selectedProducts.clear();
      saveToStorage();
      updateStickyBar();
      var cards = document.querySelectorAll('[data-byo-product]');
      cards.forEach(function(card) { hideQuantityControls(card); });
    }
  };

})();
