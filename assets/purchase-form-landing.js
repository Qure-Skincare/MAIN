const __section_landing = document.currentScript.getAttribute('data-section');
const __form_landing = document.currentScript.getAttribute('data-form');


__landing__initTemplate(__landing__getProductType());

document.querySelectorAll('.' + __section_landing + ' .serumBlock').forEach(function(element) {
    element.addEventListener('click', function() {
        const id = this.id;
        __landing__initTemplate(id);
    });
});

function __landing__updateProductButtonHref(product_variant_id, soldout) {
    let button = document.querySelector('.' + __section_landing + ' .productButtonObject');

    if(!product_variant_id) return;

    if (button) {
        if (soldout === 'true') {
            button.setAttribute('href', 'javascript:void(0)');
        } else {
            button.setAttribute('href', '/cart/add?id=' + product_variant_id + '&quantity=1');
        }
    }
}

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
    $('.' + __section_landing + ' .step_conten_blocks .planBlock').click(__landing__handlerPlanBlock);
}

function __landing__handlerPlanBlock () {
    window.dispatchEvent(new CustomEvent('appPurchaseFormLanding', {
        detail: {
            element: this
        }
    }));

    var product_variant_id = $(this).attr("data-product_variant_id");
    var soldout = $(this).attr("data-soldout");
    var preorder = $(this).attr("data-preorder");

    __landing__updateProductButtonHref(product_variant_id, soldout);
    __landing__clearPreorderBoxes();
    __landing__tooglePreorderBox(preorder, product_variant_id);

    $('.' + __section_landing + " .total_price").find(".regular_price").text($(this).find(".regular_price").text());
    $('.' + __section_landing + " .total_price").find(".sale_price").text($(this).find(".sale_price:visible").text().trim());
    $('.' + __section_landing + " .btn_value").text($(this).attr("data-per"));
    $('.' + __section_landing + " .pay_today").text($(this).attr("data-pay"));
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

        const match = preorder_percent.innerHTML.match(/\d+%/);
        if (match) {
            const percentText = match[0];
            targetBox.querySelector('.preorder_percent').style.setProperty('--bgPercent', percentText);
        }                
    }            
}