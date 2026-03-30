document.querySelector('.add-cart-sticky-button').addEventListener('click', function () {
    const form = document.querySelector('.purchase-form-wrapper form[data-static="true"]');
    if (!form) return;
    form.requestSubmit();
});

document.querySelectorAll('.cta-bar__selector input[type="radio"]').forEach((element) => {
    element.addEventListener('click', (e) => {
        const variant_title = element.getAttribute("data-variant-title");

        const target = document.querySelector('input[type="radio"][id="' + variant_title + '"]');

        if (target) {
            if (typeof __section_landing !== 'undefined' && __section_landing) {
                target.closest('.c-supply-selector__item').click();
                target.checked = true;
                purchase_form_landing_event(__section_landing, target.closest('.c-supply-selector__item'), target.closest('.c-supply-selector__item')?.dataset.product_variant_id);
            }
            else {
                target.click();
            }
        }
    });
});