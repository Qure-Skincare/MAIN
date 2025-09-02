function money_without_trailing_zeros(amount, symbol) {
    const price = (Number(amount) / 100).toFixed(2);
    return symbol + price.replace(/\.?0+$/, "");
}

function get_discount(price, sum) {
    const discount = Math.floor((price / sum) * 100);
    return discount;
}

const replaceTextOnPage = (search, replacement) => {
  const regex = new RegExp(search, "g");
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);

  let node;
  while ((node = walker.nextNode())) {
    if (regex.test(node.nodeValue)) {
      node.nodeValue = node.nodeValue.replace(regex, replacement);
    }
  }
};

function updateStickyButton(variant_title) {
    if(!variant_title)  return;

    const input = document.querySelector('.sticky__input[type="radio"][data-id="' + variant_title + '"]');
    if (input) {
        input.checked = true;
    }

    if (typeof selectOption === "function") {
        selectOption(variant_title);
    }
}

const syncCart = (input) => {
    getCartState().then(cart => {
        const is_exist = cart.items.some(item => item.key == input.get('id'));

        if(!is_exist)
        {
            const formData = new FormData();
            const variant = document.querySelector('.qure__variant-item input[type="radio"]:checked').id

            if(variant == 'white') {
                formData.append('updates[' + faucet.variants.White + ']', 0);
            }
            else {
                formData.append('updates[' + faucet.variants.Black + ']', 0);
            }

            updateCart(formData);
        }
    });
}




/* init */

if (shower && faucet) {
    const sum = (shower.price_original || 0) + (faucet.price_original || 0);
    const symbol = shower.price.replace(/[0-9.,\s-]/g, "");
    const formattedSum = money_without_trailing_zeros(sum, symbol);

    document.querySelectorAll(".price__sale").forEach((el) => {
        el.textContent = formattedSum;
    });

    const discount = get_discount(faucet.price_original, sum);

    window.discount = discount;

    replaceTextOnPage("\\$149", shower.price);
    replaceTextOnPage("\\$129", faucet.price);
    replaceTextOnPage("50%", discount + '%');
}

if (shower) {
    document.querySelectorAll(".price__regular, .price__subscription").forEach((el) => {
        el.textContent = shower.sale_price || 0;
    });
}

if (shower) {
    document.querySelectorAll(".price_faucet__regular").forEach((el) => {
        el.textContent = faucet.sale_price || 0;
    });
}

document.querySelectorAll('.qure__subscription-item').forEach(collapseEl => {
    collapseEl.addEventListener('click', function () {
        setTimeout(() => {
            let isSubscribe = document.getElementById('subscribe_and_save')?.classList.contains('show');
            const button = document.querySelector('.qure__product-action-inner button[type="submit"]');
            button.textContent = isSubscribe ? button_text_subscribe + ' ' + window.discount + '%' : button_text;

            const buttonSticky = document.querySelector('.add-cart-sticky-button');
            buttonSticky.textContent = isSubscribe ? button_text_subscribe + ' ' + window.discount + '%' : button_text;
        }, 500);
    });
});

document.querySelectorAll('.planBlock').forEach(block => {
  block.addEventListener('click', () => {
    const radio = block.querySelector('input[type="radio"].variant__input');
    if (radio) {
        updateStickyButton(radio.id);
    }
  });
});

document.querySelector('.qure__product-action-inner form').addEventListener('submit', function (e) {
    e.preventDefault();

    const isSubscribe = document.getElementById('subscribe_and_save')?.classList.contains('show');
    const variant = document.querySelector('.qure__variant-item input[type="radio"]:checked').id;

    if(!variant)  return;

    let input;

    if(variant == 'white') {
        input = [
            { id: shower.variants.White, quantity: 1 },
            { id: faucet.variants.White, quantity: 1 }
        ]
    }
    else {
        input = [
            { id: shower.variants.Black, quantity: 1 },
            { id: faucet.variants.Black, quantity: 1 }
        ]
    }

    if (isSubscribe) {
        input[0].selling_plan = shower_selling_plan;
        input[1].selling_plan = faucet_selling_plan;
    }

    addToCartJson(input);

});

