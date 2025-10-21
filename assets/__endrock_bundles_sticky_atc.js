const stickyAtc = document.querySelector('.sticky-atc');

function verifyButton(buttonAdd) {
   	let rect = buttonAdd.getBoundingClientRect();
    if (rect.bottom < 203.98 && rect.top < 203.98) {
      // El elemento está fuera del viewport
      stickyAtc.style.bottom = '0px';
	  document.body.classList.add("sticky-active");
    } else {
      //  El elemento está dentro del viewport
      stickyAtc.style.bottom = '-180%';
	  document.body.classList.remove("sticky-active");
    } 
}
function clickCTA() {
    let stickyCta = stickyAtc.querySelector('.sticky-button-cta');

    stickyCta.addEventListener('click', function(){
        stickyAtc.classList.add("active");
    }); 
}
function selectVariantSticky(variantClicked, selectorVariants, action) {
	if (variantClicked.classList.contains("active")) return;
	
	idValue = variantClicked.dataset.value;

	selectorVariants.forEach(selector => { 
		selector.classList.remove("active");
		idSelector = selector.dataset.value;
		if (idSelector==idValue) {
			if (action=="addClass") {
				selector.classList.add("active");
			} else if(action=="click")
			{
				selector.click();
                scrollIntoElement();
                stickyAtc.classList.remove("active");
			}
			else{
				return;
			}
		}
	});
}
function scrollIntoElement()
{
    const target = document.querySelector('.scroll-in-view-title');
    if (target) {
        const offsetTop = target.getBoundingClientRect().top + window.scrollY - 160;
        window.scrollTo({
            top: offsetTop,
            behavior: "smooth"
        });
    } else {
        console.log("Element not found");
    }
}
if(window.innerWidth<750){
    let buttonAdd = document.querySelector('#bundles-tab');
    if (buttonAdd) {
        window.addEventListener('scroll', function(){
            verifyButton(buttonAdd);
        });
        clickCTA();

        let stickyItems = document.querySelectorAll(".sticky-atc .sticky-item");
        let productVariants = document.querySelectorAll("#bundles-tab .nav-link");

        stickyItems.forEach(sItem => { 
            sItem.addEventListener('click', function(){
                selectVariantSticky(sItem, productVariants,"click")
            });
        });
        productVariants.forEach(pVariant => { 
            pVariant.addEventListener('click', function(){
                selectVariantSticky(pVariant, stickyItems,"addClass")
            });
        });
    }
}