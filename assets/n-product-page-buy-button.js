const sticky_cta_button = document.getElementById("sticky-cta-button");

if(sticky_cta_button) {
    if (typeof product_buy_button_label !== "undefined" && product_buy_button_label) {
        sticky_cta_button.textContent = product_buy_button_label;
    }

    if (typeof product_buy_button_soldout !== "undefined" && product_buy_button_soldout === true) {
        sticky_cta_button.disabled = true;
    }
}