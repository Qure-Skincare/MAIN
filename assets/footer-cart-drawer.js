document.addEventListener('DOMContentLoaded', () => {
    bindForms();
});

document.addEventListener('cart.requestComplete', (event) => {
    if(footer_cart_drawer_template == 'cart') {
        updateSection('cart', 'main-cart-dynamic-content')
        .then(() => {
            reloadDrawer(event);
        })
        .catch(console.error);
    }
    else {
        reloadDrawer(event);
    }
});

const reloadDrawer = (array) => {
    const cart = array.detail.cart;
    const source = array.detail.source;
    const input = array.detail.input;
    const insurance = array.detail.insurance;
    const gift = array.detail.gift;

    document.querySelector('.cart-count').textContent = cart.item_count;

    updateSection('footer-cart-drawer', 'cart-dynamic-content')
    .then(() => {
        if (source === 'addToCart') {
            showCart();
        }

        if(source == 'changeCart')
        {
            if (typeof syncCart === 'function') {
                syncCart(input);
            }
        }

        bindForms();

        //to avoid calling the function second time after adding the item
        if (typeof gift === 'undefined') {
            toogleGift(cart);
        }

        //to avoid calling the function second time after adding the item
        // if (typeof insurance === 'undefined') {
        //     if (typeof gift === 'undefined') {
        //         __reloadInsurance(cart)
        //     }
        // }

        //reload upsell carousel
        document.querySelectorAll('slide-carousel').forEach((el) => {
            el.QureSlideCarousel();
        });

    })
    .catch(console.error);
}

const bindForms = () => {

    //clear all binds before if they are exist
    document.querySelectorAll('form[action$="/cart/add"]').forEach((form) => {
        if (form.getAttribute('data-static') === 'true') {
            return;
        }
        form.replaceWith(form.cloneNode(true));
    });

    toogleInsurance();

    document.querySelectorAll('form[action$="/cart/add"]').forEach((form) => {
        if (form.getAttribute('data-static') === 'true') {
            return;
        }
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const formData = new FormData(form);
            addToCart(formData);
        });
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

const updateSection = (section_id, targetElement) => {
    const currentDrawer = document.getElementById(targetElement);
    if (!currentDrawer) return;

    return fetch('/?section_id=' + section_id)
            .then(res => res.text())
            .then(html => {
                const temp = document.createElement('div');
                temp.innerHTML = html;

                const newDrawer = temp.querySelector('#' + targetElement);
                if (!newDrawer) return;

                morphdom(currentDrawer, newDrawer);
                return;
            })    
            .then(result => {
                if (!result) return result;
                return new Promise(resolve => {
                    requestAnimationFrame(() => {
                        setTimeout(() => {
                            requestAnimationFrame(() => resolve(result));
                        }, 0);
                    });
                });
            });
};

const showCart = () => {
    if(footer_cart_drawer_template != 'cart') {
        const cartDrawer = document.querySelector('.offcanvas-end');
        if (cartDrawer && !cartDrawer.classList.contains('show')) {
            document.getElementById('cartCanvasBtn')?.click();
        }
    }
};

const toogleGift = async (cart) => {
    const forms = document.querySelectorAll('form.footer-cart-drawer-gift[action$="/cart/add"]');

    for (const form of forms) {
        const formData = new FormData(form);
        const price_limit = formData.get('properties[_price_limit]');

        const giftItem = cart.items.find(item => 
            item.id === +(formData.get('id')) && 
            item.properties && 
            item.properties['_required_validation']
        );

        if (!giftItem) {
            if (cart.total_price >= price_limit) {
                await addToCart(formData, undefined, true);
            }
        } else {
            if (cart.total_price < price_limit) {
                formData.set('quantity', 0);
                await changeCart(formData, undefined, true);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 100));;
    }
};

const toogleInsurance = () => {
    document.querySelectorAll('form[action$="/cart/add"]:has(input[type="checkbox"]#insurance)').forEach((form) => {
        const checkbox = form.querySelector('input[type="checkbox"]#insurance');

        if (!checkbox) return;

        checkbox.addEventListener('change', () => {
            getCartState().then(cart => {
                const insuranceItem = cart.items.find(item => item.title.includes('Shipping Insurance'));

                if(insuranceItem)
                {
                    const formData = new FormData();
                    formData.set('id', insuranceItem.id);
                    formData.set('quantity', 0);

                    changeCart(formData, true)
                    .then((cart) => {
                        if (checkbox.checked) {
                            const formData = new FormData(form);
                            addToCart(formData, true);
                        }
                    });
                }
                else {
                    const formData = new FormData(form);
                    if (checkbox.checked) {
                        addToCart(formData, true);
                    }
                }
            });
        });
    });
};

const __reloadInsurance = (cart) => {
    const checkbox = document.querySelector('input[type="checkbox"]#insurance');
    const insurance_id = +(document.querySelector('#insurance_id').value);
    const insuranceItem = cart.items.find(item => item.title.includes('Shipping Insurance'));

    if(insuranceItem)
    {
        const formData = new FormData();
        formData.append('updates[' + insuranceItem.id + ']', 0);

        updateCart(formData)
        .then((cart) => {
            if (checkbox.checked) {
                const formData = new FormData();
                formData.set('id', insurance_id);
                formData.set('quantity', 1);
                addToCart(formData, true);
            }
        });
    }
    else {
        const formData = new FormData();
        formData.set('id', insurance_id);
        formData.set('quantity', 1);
        if (checkbox.checked) {
            addToCart(formData, true);
        }
    }
};

const addToCartJson = (input, insurance = undefined, gift = undefined) => {
    return fetch((window.Shopify?.routes?.root || '/') + 'cart/add.js', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: input })
    })
    .then(response => response.json())
    .then((addedItem) => {
        return getCartState().then(cart => {
            const eventDetail = {
                cart: cart,
                source: 'addToCart'
            };

            if (typeof insurance !== 'undefined') {
                eventDetail.insurance = insurance;
            }

            if (typeof gift !== 'undefined') {
                eventDetail.gift = gift;
            }

            const event = new CustomEvent('cart.requestComplete', { detail: eventDetail });
            document.dispatchEvent(event);
            //console.log('The product was added to the cart:', addedItem);
            return cart;
        });
    })
    .catch((error) => {
        console.error('Error cart adding:', error);
    });
};

const addToCart = (input, insurance = undefined, gift = undefined) => {
    return fetch((window.Shopify?.routes?.root || '/') + 'cart/add.js', {
        method: 'POST',
        body: input
    })
    .then(response => response.json())
    .then((addedItem) => {
        return getCartState().then(cart => {
            const eventDetail = {
                cart: cart,
                source: 'addToCart'
            };

            if (typeof insurance !== 'undefined') {
                eventDetail.insurance = insurance;
            }

            if (typeof gift !== 'undefined') {
                eventDetail.gift = gift;
            }

            const event = new CustomEvent('cart.requestComplete', { detail: eventDetail });
            document.dispatchEvent(event);
            //console.log('The product was added to the cart:', addedItem);
            return cart;
        });
    })
    .catch((error) => {
        console.error('Error cart adding:', error);
    });
};

const updateCart = (input) => {
    return fetch((window.Shopify?.routes?.root || '/') + 'cart/update.js', {
        method: 'POST',
        body: input
    })
    .then(response => response.json())
    .then(cart => {

        const eventDetail = {
            cart: cart,
            source: 'updateCart',
            input: input
        };

        const event = new CustomEvent('cart.requestComplete', { detail: eventDetail });
        document.dispatchEvent(event);

        return cart;
    })
    .catch((error) => {
        console.error('Error cart updating:', error);
        return null;
    });
};

const changeCart = (input, insurance = undefined, gift = undefined) => {
    return fetch((window.Shopify?.routes?.root || '/') + 'cart/change.js', {
        method: 'POST',
        body: input
    })
    .then(response => response.json())
    .then(cart => {

        const eventDetail = {
            cart: cart,
            source: 'changeCart',
            input: input
        };

        if (typeof insurance !== 'undefined') {
            eventDetail.insurance = insurance;
        }

        if (typeof gift !== 'undefined') {
            eventDetail.gift = gift;
        }

        const event = new CustomEvent('cart.requestComplete', { detail: eventDetail });
        document.dispatchEvent(event);
        //console.log('The cart was changed:', cart);
        return cart;
    })
    .catch((error) => {
        console.error('Error cart changing:', error);
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
            //console.log('Cart cleared:', cart);
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