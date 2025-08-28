const __section_landing = document.currentScript.getAttribute('data-section');
const __form_landing = document.currentScript.getAttribute('data-form');


__landing__initTemplate(__landing__getProductType());

document.querySelectorAll('.' + __section_landing + ' .serumBlock').forEach(function(element) {
    element.addEventListener('click', function(e) {
        if (e.target.tagName === 'INPUT') return; //to skip second click
        const id = this.id;
        __landing__initTemplate(id);
    });
});

function __landing__initTemplate(source) {
    if(!source) return;

    const template_form = document.getElementById(__form_landing + '-source-' + source);
    const target = document.getElementById(__form_landing + '-body-' + __section_landing);

    if (template_form && target) {
        const content = template_form.content.cloneNode(true);
        target.innerHTML = '';
        target.appendChild(content);
        __landing__initScripts();
        __landing__initProduct();
        __landing__bindForm();
    }               
}

function __landing__getProductType() {

    let checkedInput = document.querySelector('.' + __section_landing + ' input[type="radio"][name="serum_'+ __form_landing + '"]:checked');

    if (!checkedInput) {
        checkedInput = document.querySelector('.' + __section_landing + ' input[type="radio"][name="serum_'+ __form_landing + '"]');
    }
    
    if (checkedInput) {
        checkedInput.checked = true;
        const serumBlock = checkedInput.closest('.serumBlock');
        if (serumBlock && serumBlock.id) {
            return serumBlock.id;
        }
    }

    return false;
}

function __landing__initProduct() {
    let checkedInput = document.querySelector('.' + __section_landing + ' input[type="radio"][name="monthlyPlan_'+ __form_landing + '"]:checked');

    if (!checkedInput) {
        checkedInput = document.querySelector('.' + __section_landing + ' input[type="radio"][name="monthlyPlan_'+ __form_landing + '"]');
    }

    if(checkedInput)
    {
        checkedInput.checked = true;
        const planBlock = checkedInput.closest('.planBlock');

        if (planBlock) {
            planBlock.click();
        }
    }           
}

function __landing__initScripts() {
    document.querySelectorAll('.' + __section_landing + ' .step_conten_blocks .planBlock').forEach(el => {
        el.addEventListener('click', __landing__handlerPlanBlock);
    });
}

function __landing__handlerPlanBlock() {
    const product_variant_id = this.getAttribute("data-product_variant_id");
    const soldout = this.getAttribute("data-soldout");
    const preorder = this.getAttribute("data-preorder");
    const product_selling_plan = this.getAttribute("data-product-selling-plan");

    __landing__updateProductCheckbox(this);
    __landing__updateProductFormButton(product_variant_id, soldout);
    __landing__clearPreorderBoxes();
    __landing__tooglePreorderBox(preorder, product_variant_id);
    __landing_updateSellingPlan(this, product_selling_plan, soldout);

    const regularPriceContainer = document.querySelector("." + __section_landing + " .total_price .regular_price");
    const regularPriceSource = this.querySelector(".regular_price");
    if (regularPriceContainer && regularPriceSource) {
        regularPriceContainer.textContent = regularPriceSource.textContent;
    }

    const salePriceContainer = document.querySelector("." + __section_landing + " .total_price .sale_price");
    const salePriceSource = this.querySelector(".sale_price:not([style*='display: none'])");
    if (salePriceContainer && salePriceSource) {
        salePriceContainer.textContent = salePriceSource.textContent.trim();
    }

    if(!product_selling_plan) {
        __updateButtonLabel(this);
    }
    else {
        if(soldout == 'true') {
            __updateButtonLabel(this);
        }
        else {
            if(__landing_isSellingPlanDisabled()) {
                __updateButtonLabel(this);
            }
        }
    }

    const payTodayContainer = document.querySelector("." + __section_landing + " .pay_today");
    if (payTodayContainer) {
        payTodayContainer.textContent = this.getAttribute("data-pay") || "";
    }

    setTimeout(() => {
        purchase_form_landing_event(__section_landing, this, product_variant_id);
    }, 500)

}

function __updateButtonLabel(element) {
    const btnValueContainer = document.querySelector("." + __section_landing + " .add-cart-button");
    if (btnValueContainer) {
        btnValueContainer.textContent = element.getAttribute("data-per") || "";
    }
}

function __landing_updateSellingPlan(element, product_selling_plan, soldout) {
    if (!product_selling_plan) return;

    const deliveryBox = document.getElementById('purchase-form-landing-delivery');
    if (!deliveryBox) return;

    if (soldout == 'true') {
        deliveryBox.style.display = 'none';
    } else {
        deliveryBox.style.display = '';
    }

    const form = document.querySelector('.' + __section_landing + ' .qure__product-action-inner form[action="/cart/add"]');
    if (!form) return;

    const sellingPlanInput = form.querySelector('input[name="selling_plan"]');
    if (!sellingPlanInput) return;

    sellingPlanInput.value = product_selling_plan;

    __updateSellingPlanButtonLabel();

    document.querySelectorAll('.' + __section_landing + ' .qure__subscription .qure__subscription-item').forEach(el => {
        el.addEventListener('click', () => {
            if (el.classList.contains('subscription-active') && el.classList.contains('one_time_purchase')) {
                sellingPlanInput.setAttribute('disabled', 'disabled');
                __updateButtonLabel(element);
            } else {
                sellingPlanInput.removeAttribute('disabled');
                __updateSellingPlanButtonLabel();
            }
        });
    });
}

function __updateSellingPlanButtonLabel() {
    let targetEl = document.querySelector('.save-subscription') || document.querySelector('[data-per]');

    if (targetEl) {
        let value = targetEl.getAttribute('data-per') || targetEl.textContent.trim();
        const btnValueContainer = document.querySelector("." + __section_landing + " .add-cart-button");
        if (btnValueContainer) {
            btnValueContainer.textContent = value || "";
        }
    }
}

function __landing_isSellingPlanDisabled() {
    const form = document.querySelector('.' + __section_landing + ' .qure__product-action-inner form[action="/cart/add"]');
    if (!form) return;

    const sellingPlanInput = form.querySelector('input[name="selling_plan"]');
    if (!sellingPlanInput) return;

    return sellingPlanInput.hasAttribute("disabled");
}

function __landing__updateProductCheckbox(element)
{
    document.querySelectorAll('.' + __section_landing + ' input.vp__input[type="radio"]').forEach(input => {
      input.checked = false;
    });

    const input = element.querySelector('.' + __section_landing + ' input.vp__input[type="radio"]');
    if (input) {
      input.checked = true;
    }
}

function __landing__updateProductFormButton(product_variant_id, soldout) {
    if (!product_variant_id) return;

    const form = document.querySelector('.' + __section_landing + ' .qure__product-action-inner form[action="/cart/add"]');

    if (form) {
        const idInput = form.querySelector('input[name="id"]');
        const button = form.querySelector('.add-cart-button');

        if (idInput) {
            if (soldout === 'true') {
                idInput.value = "";
                if (button) button.disabled = true;
            } else {
                idInput.value = product_variant_id;
                if (button) button.disabled = false;
            }
        }
    }
}

function __landing__bindForm() {
    const form = document.querySelector('.' + __section_landing + ' .qure__product-action-inner form[action="/cart/add"]');
    if (!form || form.dataset.bound === '1') return;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        addToCart(formData);
    }, { passive: false });

    form.dataset.bound = '1';
}

function __landing__clearPreorderBoxes()
{
    document.querySelectorAll('.' + __section_landing + ' .' + __form_landing + '-preorder-box-item').forEach(el => {
        el.innerHTML = '';
    });
}

function __landing__tooglePreorderBox(preorder, product_variant_id) {
    const preorderBox = document.querySelector('.' + __section_landing + ' .preorder_box');
    const targetBox = document.querySelector('.' + __section_landing + ' .' + __form_landing + '-preorder-box__' + product_variant_id);

    if (!preorderBox || !targetBox) return;
    
    if(preorder === 'true')
    {
        if (preorderBox) 
        {
            preorderBox.classList.remove('hide');
            targetBox.appendChild(preorderBox.cloneNode(true));
            preorderBox.classList.add('hide');

            __landing__updatePreorderBox(targetBox, product_variant_id);
        }
    }
    else
    {
        if (preorderBox) 
        {
            preorderBox.classList.add('hide');
        }
    }
}

function __landing__updatePreorderBox(targetBox, product_variant_id)
{
    const preorder_text = document.querySelector('.' + __section_landing + ' .' + __form_landing + '-product-preorder-text__' + product_variant_id);
    if (preorder_text && preorder_text.innerHTML !== '') {
        targetBox.querySelector('.preorder_text').innerHTML = preorder_text.innerHTML;
    }

    const preorder_date_soldout = document.querySelector('.' + __section_landing + ' .' + __form_landing + '-product-preorder_date_soldout__' + product_variant_id);
    if (preorder_date_soldout && preorder_date_soldout.innerHTML !== '') {
        targetBox.querySelector('.preorder_date_soldout').innerHTML = preorder_date_soldout.innerHTML;
    }

    const preorder_date_reserved = document.querySelector('.' + __section_landing + ' .' + __form_landing + '-product-preorder_date_reserved__' + product_variant_id);
    if (preorder_date_reserved && preorder_date_reserved.innerHTML !== '') {
        targetBox.querySelector('.preorder_date_reserved').innerHTML = preorder_date_reserved.innerHTML;
    }

    const preorder_percent = document.querySelector('.' + __section_landing + ' .' + __form_landing + '-product-preorder_percent__' + product_variant_id);
    if (preorder_percent && preorder_percent.innerHTML !== '') {
        targetBox.querySelector('.preorder_percent').innerHTML = preorder_percent.innerHTML;

        const match = preorder_percent.innerHTML.match(/\d+/);
        if (match) {
            const percentText = match[0];
            targetBox.querySelector('.preorder_percent_style').style.setProperty('--progress-width', percentText + '%');
        }                
    }            
}