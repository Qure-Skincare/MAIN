const handleClickVideo = (video) => {
  const handlelCloseModal = () => {
    document.body.style.overflow = "auto";
    document.documentElement.classList.remove("no-scroll");
    document.body.classList.remove("no-scroll");
    modalVideo.querySelector("video").pause();
    modalVideo.style.animation = "hideVideo 0.3s ease-in-out forwards";
    blurModal.style.animation = "hideModal 0.3s ease-in-out forwards";
    closeBtn.style.visibility = "hidden";
    setTimeout(() => {
      blurModal.style.display = "none";
      modalVideo.removeChild(modalVideo.children[1]);
    }, 300);
  };

  document.documentElement.classList.add("no-scroll");
  document.body.classList.add("no-scroll");
  let blurModal = document.querySelector(".container-blur-modal");
  blurModal.style.animation = "showModal 0.3s ease-in-out forwards";
  let modalVideo = document.querySelector(".modal-video-iframe");
  modalVideo.style.animation = "showVideo 0.3s ease-in-out forwards";
  let closeBtn = document.querySelector("#close-modal-video");

  let videoElement = document.createElement("video");
  videoElement.setAttribute("src", video.src);
  videoElement.setAttribute("controls", true);
  videoElement.setAttribute("controlsList", "nofullscreen");

  videoElement.play();

  modalVideo.appendChild(videoElement);
  blurModal.style.display = "flex";

  blurModal.addEventListener("click", (event) => {
    if (event.target !== modalVideo.children[1]) {
      handlelCloseModal();
    }
  });

  modalVideo.querySelector("video").addEventListener("ended", () => {
    modalVideo.querySelector("video").pause();
  });

  modalVideo.querySelector("video").addEventListener("click", (event) => {
    let isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isSafari) return;

    let videoElement = modalVideo.querySelector("video");
    if (videoElement.paused) {
      videoElement.play();
    } else {
      videoElement.pause();
    }
  });

  closeBtn.style.visibility = "visible";
  closeBtn.addEventListener("click", handlelCloseModal);
};

const initializeVideoHandlers = (containerSelector) => {
  const container = document.querySelector(containerSelector);
  if (!container) return;

  const videos = container.querySelectorAll(".testimonial-video video");
  const playBtns = container.querySelectorAll(
    ".testimonial-video .action-video"
  );

  videos.forEach((video) => {
    video.pause();
  });

  playBtns.forEach((btn, index) => {
    btn.addEventListener("click", () => {
      handleClickVideo(videos[index]);
    });
  });
};

const setupDesktopCarousel = () => {
  const MOVED_CLASS = "is-moved";

  const asyncSection = document.querySelector("#async-section");
  const desktopSection = document.querySelector(
    "#testimonial-carousel-desktop"
  );

  if (
    asyncSection &&
    desktopSection &&
    !desktopSection.classList.contains(MOVED_CLASS)
  ) {
    desktopSection.classList.add(MOVED_CLASS);
    asyncSection.insertAdjacentElement("afterend", desktopSection);

    const swiper = new Swiper(
      `#testimonial-carousel-desktop.${MOVED_CLASS} .testimonial-carousel.swiper`,
      {
        loop: false,
        spaceBetween: 12,
        slidesPerView: 4,
        pagination: {
          el: ".testimonial-swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".testimonial-swiper-button-next",
          prevEl: ".testimonial-swiper-button-prev",
        },
      }
    );
  }
};

setupDesktopCarousel();

initializeVideoHandlers("#testimonial-carousel-mobile");
initializeVideoHandlers("#testimonial-carousel-desktop");
