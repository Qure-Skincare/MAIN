const dropdown = document.getElementById("dropdownContainer");
const button = document.getElementById("dropdownBtn");
const hiddenInput = document.getElementById("selectedDuration");
const options = document.querySelectorAll(".dropdown-option");

function toggleDropdown() {
  const wrapper = button.closest('.dropdown-wrapper'); // Get wrapper
  wrapper.classList.toggle("open"); // Toggle open class on wrapper

  // Show/hide options
  const selectedValue = hiddenInput.value;
  options.forEach(option => {
    const optionText = option.querySelector('span').innerText;
    option.style.display = optionText === selectedValue ? "none" : "flex";
  });
}

function selectOption(value) {
  const selectedOption = Array.from(options).find(option => {
    return option.querySelector('span').innerText === value;
  });

  if (selectedOption) {
    const imgPath = selectedOption.querySelector('img').src;
    const variantName = selectedOption.querySelector('span').innerText;
    button.innerHTML = `<img src="${imgPath}" alt=""> ${variantName} <i class="fa-solid fa-angle-down"></i>`;
    hiddenInput.value = variantName;  // Store the variant name (e.g., "1 Month") in hidden input
  }

  // Hide selected option
  options.forEach(option => {
    const optionText = option.querySelector('span').innerText;
    option.style.display = optionText === value ? "none" : "flex";
  });

  if(button) {
    // Remove open class from wrapper
    const wrapper = button.closest('.dropdown-wrapper');
    if(wrapper) {
      wrapper.classList.remove("open");
    }
  }
}

// Set default selected value on page load
document.addEventListener("DOMContentLoaded", function () {
  selectOption("3 Months"); // Default selection, doesn't need image path explicitly
});




document.addEventListener("scroll", function() {
  const stickyElement = document.querySelector(".qure__sticky-atc");
  if (!stickyElement) return;

  if (window.scrollY > 400) { // ~20cm = 200px approx (adjust if needed)
    stickyElement.classList.add("show_cta");
  } else {
    stickyElement.classList.remove("show_cta");
  }
});