document.querySelectorAll(".bundle-header .swiper-wrapper img.img-fluid").forEach(img => {
    img.addEventListener("click", () => {
        if (img.closest(".slide-thumbnail")) return;

        const productHandle = img.dataset.productHandle;
        if (productHandle && productHandle.trim() !== "") {
            const type = window.get_form_bundle_products_data[productHandle];

            if (type) {
                const el = document.querySelector('.bundle_heading[data-type="' + type + '"]');
                if (el) el.click();

                setTimeout(() => {
                    const target = document.getElementById(productHandle);
                    if (target) {
                        target.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }, 100);
            }
        }
    });
});