/**
 * Add bundle — batch add from data-cart-items (JSON array of { id, quantity }).
 * Uses window.CartDrawer.addToCartJson when present (theme cart drawer).
 *
 * Must run when document is already complete: this file is often loaded via
 * loadScriptOnce() after DOMContentLoaded has already fired.
 */
function initNAddBundle() {
  document.querySelectorAll('.js-add-bundle').forEach(function (btn) {
    if (btn.dataset.nAddBundleInit === '1') return;
    btn.dataset.nAddBundleInit = '1';

    btn.addEventListener('click', function () {
      if (btn.disabled) return;
      var raw = btn.getAttribute('data-cart-items');
      if (!raw) return;
      var items;
      try {
        items = JSON.parse(raw);
      } catch (e) {
        return;
      }
      if (!items || !items.length) return;
      btn.disabled = true;
      var done = function () {
        btn.disabled = false;
      };
      if (window.CartDrawer && typeof window.CartDrawer.addToCartJson === 'function') {
        Promise.resolve(window.CartDrawer.addToCartJson(items)).then(done).catch(done);
      } else {
        var root =
          window.Shopify && window.Shopify.routes && window.Shopify.routes.root
            ? window.Shopify.routes.root
            : '/';
        fetch(root + 'cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: items })
        })
          .then(function (r) {
            return r.json().then(function (data) {
              if (!r.ok) return Promise.reject(data);
              return data;
            });
          })
          .then(function () {
            document.dispatchEvent(
              new CustomEvent('cart.requestComplete', { detail: { source: 'addToCartJson' } })
            );
          })
          .catch(function () {})
          .finally(done);
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initNAddBundle);
} else {
  initNAddBundle();
}
