if (shower && faucet) {
    const sum = (shower.price_original || 0) + (faucet.price_original || 0);
    const formattedSum = money_without_trailing_zeros(sum);

    document.querySelectorAll(".price__sale").forEach((el) => {
        el.textContent = formattedSum;
    });

    const discount = get_discount(shower.price_original, sum);

    document.querySelectorAll(".price__discount").forEach((el) => {
        el.textContent = discount + discount_text;
    });
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

function money_without_trailing_zeros(amount) {
    const price = (Number(amount) / 100).toFixed(2);
    return "$" + price.replace(/\.?0+$/, "");
}

function get_discount(price, sum) {
    let discount = (price * 1.0) / sum;
    
    discount = (discount - 1) * -1;
    discount = discount * 100;
    discount = Math.ceil(discount);
    
    return discount;
}


document.querySelectorAll('.qure__subscription-item').forEach(collapseEl => {
    collapseEl.addEventListener('click', function () {
        setTimeout(() => {
            let isSubscribe = document.getElementById('subscribe_and_save')?.classList.contains('show');
            const button = document.querySelector('.qure__product-action-inner button[type="submit"]');
            button.textContent = isSubscribe ? button_text_subscribe : button_text;
        }, 750);
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


const sticky_button = () => {
  const stickyButton = document.getElementById('product-buy-button-sticky');
  const form = document.querySelector('.qure__product-action-inner form');

  if (!stickyButton || !form) return;

  stickyButton.addEventListener('click', function () {
    form.requestSubmit();
  });
};

const sticky_button_click = () => {
  document.querySelectorAll('input.sticky__input[type="radio"]').forEach((input) => {
    input.addEventListener('click', function () {
        const selectedId = this.dataset.id;
        const target = document.querySelector('.qure__variant-item input[type="radio"]#' + selectedId);

        if (target) {
            target.click();
        }
    });
  });
}

const sticky_button_mobile_click = () => {
  document.querySelectorAll('div.sticky__input__mobile').forEach((button) => {
    button.addEventListener('click', (e) => {
        const selectedId = button.dataset.id;
        const target = document.querySelector('.qure__variant-item input[type="radio"]#' + selectedId);

        if (target) {
            target.click();
        }
    });
  });
};

sticky_button();
sticky_button_click();
sticky_button_mobile_click();