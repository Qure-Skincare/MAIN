const __product_handler = document.currentScript.getAttribute('data-product-handler');

const __gpd_update = () => {
    document.querySelectorAll('[data-gpd-value]').forEach(el => {
        const key = el.getAttribute('data-gpd-value');
        let value;

        if (!el.hasAttribute('data-gpd-product')) {
            if(__product_handler && window.get_products_data[__product_handler]) {
                value = window.get_products_data[__product_handler][key];
            }
        } else {
            if(window.get_products_data[el.getAttribute('data-gpd-product')]) {
                value = window.get_products_data[el.getAttribute('data-gpd-product')][key];
            }
        }

        if (value !== undefined) {
            el.textContent = value ?? '';
        }
    });
}


__gpd_update();