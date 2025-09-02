const sticky_button = () => {
  const stickyButton = document.querySelector('.add-cart-sticky-button');

  if (!stickyButton) return;

  stickyButton.addEventListener('click', function () {
    const form = document.querySelector('form[data-static="true"]');
    if (!form) return;
    form.requestSubmit();
  });
};

const sticky_button_click = () => {
  document.querySelectorAll('input.sticky__input[type="radio"]').forEach((input) => {
    input.addEventListener('click', function () {
        const selectedId = this.dataset.id;
        const target = document.querySelector('.planBlock input[type="radio"][id="' + selectedId + '"]');

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
        const target = document.querySelector('.planBlock input[type="radio"][id="' + selectedId + '"]');

        if (target) {
            target.click();

            if (typeof selectOption === "function") {
                selectOption(selectedId);
            }
        }
    });
  });
};


sticky_button();
sticky_button_click();
sticky_button_mobile_click();