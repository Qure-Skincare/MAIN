document.addEventListener('DOMContentLoaded', () => {
    bindForms();
});

document.addEventListener('cart.requestComplete', (e) => {
    const cart = e.detail.cart;
    const source = e.detail.source;
    const insurance = e.detail.insurance;
    document.querySelector('.cart-count').textContent = cart.item_count;

    if (source === 'addToCart') {
        if(insurance === undefined) {
            unsetInsurance();
        }
        reloadCart();
        showCart();
    }

    if (source === 'changeCart') {
        if(insurance === undefined) {
            unsetInsurance();
        }
        reloadCart();
    }
});

const bindForms = () => {

    //clear all binds before if they are exist
    document.querySelectorAll('form[action$="/cart/add"]').forEach((form) => {
        form.replaceWith(form.cloneNode(true));
    });

    document.querySelectorAll('form[action$="/cart/add"]').forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            addToCart(formData);
        });

        toogleInsurance(form);
    });

    //clear all binds before if they are exist
    document.querySelectorAll('form[action$="/cart/change"]').forEach((form) => {
        form.replaceWith(form.cloneNode(true));
    });

    document.querySelectorAll('form[action$="/cart/change"]').forEach((form) => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            changeCart(formData);
        });
    });
}

const reloadCart = () => {
    const targetElement = 'cart-dynamic-content';
    const currentDrawer = document.getElementById(targetElement);
    if (!currentDrawer) return;

    fetch('/?section_id=footer-cart-drawer')
        .then(res => res.text())
        .then(html => {
            const temp = document.createElement('div');
            temp.innerHTML = html;

            const newDrawer = temp.querySelector('#' + targetElement);
            if (!newDrawer) return;

            morphdom(currentDrawer, newDrawer);
            bindForms();
        });
};

const showCart = () => {
    const cartDrawer = document.querySelector('.offcanvas-end');
    if (cartDrawer && !cartDrawer.classList.contains('show')) {
        document.getElementById('cartCanvasBtn')?.click();
    }
};

const toogleInsurance = (form) => {
    const checkbox = form.querySelector('input[type="checkbox"]#insurance');

    if (!checkbox) return;

    checkbox.addEventListener('change', () => {
        const formData = new FormData(form);
        if (checkbox.checked) {
            addToCart(formData, true);
        } else {
            changeCart(formData, true);
        }
    });
};

const unsetInsurance = () => {
  return getCartState().then(cart => {
    const insuranceItem = cart.items.find(item => item.title.includes('Shipping Insurance'));

    if (insuranceItem) {
      const formData = new FormData();
      formData.append('id', insuranceItem.id);
      formData.append('quantity', 0);
      return changeCart(formData);
    }
  }).catch(error => {
    console.error('Error unsetInsurance:', error);
  });
};

const addToCart = (input, insurance = undefined) => {
    fetch((window.Shopify?.routes?.root || '/') + 'cart/add.js', {
        method: 'POST',
        body: input
    })
        .then(response => response.json())
        .then((addedItem) => {
            return fetch((window.Shopify?.routes?.root || '/') + 'cart.js')
                .then(res => res.json())
                .then(cart => {

                    const eventDetail = {
                        cart: cart,
                        source: 'addToCart'
                    };

                    if (typeof insurance !== 'undefined') {
                        eventDetail.insurance = insurance;
                    }

                    const event = new CustomEvent('cart.requestComplete', { detail: eventDetail });
                    document.dispatchEvent(event);
                    console.log('The product was added to the cart:', addedItem);
                });
        })
        .catch((error) => {
            console.error('Error cart adding:', error);
        });
};

const changeCart = (input, insurance = undefined) => {
    fetch((window.Shopify?.routes?.root || '/') + 'cart/change.js', {
        method: 'POST',
        body: input
    })
    .then(response => response.json())
    .then(cart => {

        const eventDetail = {
            cart: cart,
            source: 'changeCart'
        };

        if (typeof insurance !== 'undefined') {
            eventDetail.insurance = insurance;
        }

        const event = new CustomEvent('cart.requestComplete', { detail: eventDetail });
        document.dispatchEvent(event);
        console.log('The cart was changed:', cart);
    })
    .catch((error) => {
        console.error('Error cart updating:', error);
    });
};

const clearCart = () => {
    fetch((window.Shopify?.routes?.root || '/') + 'cart/clear.js', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    })
        .then(response => response.json())
        .then(cart => {
            const event = new CustomEvent('cart.requestComplete', { detail: { cart: cart, source: 'clearCart' } });
            document.dispatchEvent(event);
            console.log('Cart cleared:', cart);
        })
        .catch(error => {
            console.error('Error clearing cart:', error);
        });
}

const getCartState = () => {
    return fetch((window.Shopify?.routes?.root || '/') + 'cart.js')
            .then(response => response.json())
            .then(cart => {
                console.log('Cart state:', cart);
                return cart; 
            })
            .catch(error => {
                console.error('Error fetching cart:', error);
                return null;
            });
}