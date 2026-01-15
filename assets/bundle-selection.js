/**
 * Bundle Selection System
 * Manages product selection for skincare plan bundles with tiered discounts
 */

(function() {
  'use strict';

  const STORAGE_KEY = 'skincarePlanBundle';
  const DISCOUNT_TIERS = {
    1: { percent: 15, code: 'BUNDLE15' },
    2: { percent: 20, code: 'BUNDLE20' },
    3: { percent: 25, code: 'BUNDLE25' },
    4: { percent: 30, code: 'BUNDLE30' }
  };

  // State
  let selectedProducts = [];

  /**
   * Initialize the bundle selection system
   * Clears previous selection on page load for fresh start
   */
  function init() {
    clearStorage();
    bindEvents();
    updateUI();
  }

  /**
   * Clear localStorage on page load
   * This ensures fresh state on every page refresh
   */
  function clearStorage() {
    try {
      localStorage.removeItem(STORAGE_KEY);
      selectedProducts = [];
    } catch (e) {
      console.warn('Bundle Selection: Failed to clear storage', e);
      selectedProducts = [];
    }
  }

  /**
   * Save selected products to localStorage
   */
  function saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedProducts));
    } catch (e) {
      console.warn('Bundle Selection: Failed to save to storage', e);
    }
  }

  /**
   * Check if a product is already selected by variantId
   * This ensures buttons in different sections sync properly
   */
  function isProductSelected(variantId) {
    return selectedProducts.some(p => p.variantId === variantId);
  }

  /**
   * Toggle product selection by variantId
   * Uses variantId to sync buttons across different sections
   */
  function toggleProduct(productData) {
    const variantId = productData.variantId;
    const index = selectedProducts.findIndex(p => p.variantId === variantId);
    
    if (index > -1) {
      // Remove product
      selectedProducts.splice(index, 1);
    } else {
      // Add product (max 4)
      if (selectedProducts.length < 4) {
        selectedProducts.push({
          variantId: productData.variantId,
          handle: productData.handle,
          title: productData.title,
          price: parseFloat(productData.price) || 0,
          image: productData.image
        });
      }
    }
    
    saveToStorage();
    updateUI();
  }

  /**
   * Get current discount tier based on number of selected products
   */
  function getCurrentTier() {
    const count = selectedProducts.length;
    if (count === 0) return null;
    return DISCOUNT_TIERS[Math.min(count, 4)];
  }

  /**
   * Calculate subtotal (original price)
   */
  function calculateSubtotal() {
    return selectedProducts.reduce((sum, p) => sum + p.price, 0);
  }

  /**
   * Calculate discounted price
   */
  function calculateDiscountedPrice() {
    const subtotal = calculateSubtotal();
    const tier = getCurrentTier();
    if (!tier) return subtotal;
    return subtotal * (1 - tier.percent / 100);
  }

  /**
   * Format price for display
   */
  function formatPrice(cents) {
    const dollars = cents / 100;
    return '$' + dollars.toFixed(2).replace(/\.00$/, '');
  }

  /**
   * Update all UI elements
   */
  function updateUI() {
    updateButtons();
    updateStickyBar();
  }

  /**
   * Update all bundle buttons state
   * Uses variantId to sync buttons across different sections
   */
  function updateButtons() {
    const buttons = document.querySelectorAll('[data-bundle-button]');
    buttons.forEach(button => {
      const variantId = parseInt(button.dataset.variantId);
      const isSelected = isProductSelected(variantId);
      
      button.classList.toggle('bundle-selected', isSelected);
      
      // Update button text if needed
      const defaultText = button.dataset.defaultText || 'Add to Bundle';
      const selectedText = button.dataset.selectedText || 'Remove from Bundle';
      button.textContent = isSelected ? selectedText : defaultText;
    });
  }

  /**
   * Update sticky bar UI
   */
  function updateStickyBar() {
    const count = selectedProducts.length;
    const tier = getCurrentTier();
    
    // Update discount boxes - progressive activation
    const bundleItems = document.querySelectorAll('.bundle-progress .bundle-item');
    bundleItems.forEach((item, index) => {
      const step = index + 1;
      // Activate all boxes up to current count
      item.classList.toggle('active', step <= count);
    });
    
    // Update progress line
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
      const percentage = count > 0 ? (count / 4) * 100 : 0;
      progressFill.style.width = percentage + '%';
    }
    
    // Update subtotal display - hide entire block when no items selected
    const subtotal = calculateSubtotal();
    const discounted = calculateDiscountedPrice();
    
    const subtotalBlock = document.querySelector('.subtotal_cta');
    const comparePriceEl = document.querySelector('.subtotal_cta .compare_price');
    const discountedPriceEl = document.querySelector('.subtotal_cta .discounted_price');
    
    // Toggle visibility class - CSS uses !important to override external styles
    if (subtotalBlock) {
      subtotalBlock.classList.toggle('subtotal-visible', count > 0);
    }
    
    if (comparePriceEl) {
      comparePriceEl.textContent = formatPrice(subtotal);
    }
    
    if (discountedPriceEl) {
      discountedPriceEl.textContent = formatPrice(discounted);
    }
    
    // Update CTA button state
    const ctaButton = document.querySelector('.skincare_plan_cta .btn_wrap .btn');
    if (ctaButton) {
      ctaButton.disabled = count === 0;
    }
  }

  /**
   * Add all selected products to cart and apply discount
   * Opens slide cart instead of redirecting to cart page
   * Checks for duplicates - doesn't add items already in cart
   */
  async function addToCartWithDiscount() {
    if (selectedProducts.length === 0) {
      // Scroll to products section
      const productsSection = document.querySelector('#skincare_goals');
      if (productsSection) {
        productsSection.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    const tier = getCurrentTier();
    if (!tier) return;

    try {
      // Get current cart state to check for duplicates
      const cartResponse = await fetch('/cart.js');
      const cart = await cartResponse.json();
      const cartVariantIds = cart.items.map(item => item.variant_id);

      // Filter out items that are already in cart
      const itemsToAdd = selectedProducts
        .filter(p => !cartVariantIds.includes(p.variantId))
        .map(p => ({
          id: p.variantId,
          quantity: 1
        }));

      // Only add if there are new items
      if (itemsToAdd.length > 0) {
        const response = await fetch('/cart/add.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ items: itemsToAdd })
        });

        if (!response.ok) {
          throw new Error('Failed to add to cart');
        }
      }

      // Don't clear selection - keep items highlighted to show what was added
      // Selection will only reset on page refresh

      // Apply discount code
      await fetch('/discount/' + tier.code);

      // Dispatch cart.requestComplete event to trigger slide cart opening
      // This integrates with footer-cart-drawer.js
      const event = new CustomEvent('cart.requestComplete', { 
        detail: { source: 'addToCartJson' } 
      });
      document.dispatchEvent(event);

    } catch (error) {
      console.error('Bundle Selection: Error adding to cart', error);
      alert('Error adding items to cart. Please try again.');
    }
  }

  /**
   * Sync selected products with cart state
   * Removes products from selection if they were removed from cart
   */
  async function syncWithCart() {
    try {
      const response = await fetch('/cart.js');
      const cart = await response.json();
      
      // Get variant IDs currently in cart
      const cartVariantIds = cart.items.map(item => item.variant_id);
      
      // Filter selected products to only include those still in cart
      const previousCount = selectedProducts.length;
      selectedProducts = selectedProducts.filter(p => cartVariantIds.includes(p.variantId));
      
      // If something changed, update UI and re-apply correct discount
      if (selectedProducts.length !== previousCount) {
        saveToStorage();
        updateUI();
        
        // Re-apply correct discount based on remaining items
        const tier = getCurrentTier();
        if (tier) {
          await fetch('/discount/' + tier.code);
        }
      }
    } catch (e) {
      console.warn('Bundle Selection: Failed to sync with cart', e);
    }
  }

  /**
   * Bind event listeners
   */
  function bindEvents() {
    // Delegate click events for bundle buttons
    document.addEventListener('click', function(e) {
      const button = e.target.closest('[data-bundle-button]');
      if (button) {
        e.preventDefault();
        
        const productData = {
          buttonId: button.dataset.buttonId,
          variantId: parseInt(button.dataset.variantId),
          handle: button.dataset.handle,
          title: button.dataset.title,
          price: parseFloat(button.dataset.price),
          image: button.dataset.image
        };
        
        toggleProduct(productData);
      }
      
      // Main CTA button
      const ctaButton = e.target.closest('.skincare_plan_cta .btn_wrap .btn');
      if (ctaButton) {
        e.preventDefault();
        addToCartWithDiscount();
      }
    });

    // Listen for cart changes (when items are removed from slide cart)
    document.addEventListener('cart.requestComplete', function(e) {
      const source = e.detail?.source;
      // Sync with cart when items are changed or removed (not when we add items)
      if (source === 'changeCart' || source === 'syncCart' || source === 'updateCartMany') {
        syncWithCart();
      }
    });
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Expose API for external use if needed
  window.BundleSelection = {
    getSelectedProducts: () => [...selectedProducts],
    getCurrentTier: getCurrentTier,
    clearSelection: () => {
      selectedProducts = [];
      saveToStorage();
      updateUI();
    }
  };

})();

