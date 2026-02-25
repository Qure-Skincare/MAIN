var cartButtons = document.querySelectorAll('.add-cart-button, #sticky-cta-button');

cartButtons.forEach(function (btn) {
    btn.innerHTML = buy_and_save_button_label;
});