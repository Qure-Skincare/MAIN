function waitForSplide() {
  if (typeof Splide === "undefined") {
    return setTimeout(waitForSplide, 100);
  }

  const annoucement = document.querySelector(
    ".announcement-bar-rotating .splide"
  );
  if (!annoucement) return console.warn("No annoucement element found");

  const splide = new Splide(annoucement, {
    type: "fade",
    rewind: true,
    focus: "center",
    perPage: 1,
    perMove: 1,
    pagination: false,
    autoplay: true,
    interval: delay,
    pauseOnHover: false,
    pauseOnFocus: false,
  });

  splide.mount();
}

waitForSplide();
