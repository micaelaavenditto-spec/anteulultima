const title = document.querySelector("[data-kinetic]");
const header = document.querySelector(".site-header");

if (title) {
  const sourceLines = [...title.querySelectorAll(".kinetic-line")].map((line) => line.textContent.trim());
  const lines = sourceLines.length ? sourceLines : [title.textContent.trim()];
  title.textContent = "";

  lines.forEach((line) => {
    const lineSpan = document.createElement("span");
    lineSpan.className = "kinetic-line";
    const words = line.split(" ");

    words.forEach((word, wordIndex) => {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";

      for (const char of word) {
        const span = document.createElement("span");
        span.className = "char";
        span.textContent = char;
        wordSpan.appendChild(span);
      }

      lineSpan.appendChild(wordSpan);

      if (wordIndex < words.length - 1) {
        const spaceSpan = document.createElement("span");
        spaceSpan.className = "char space";
        spaceSpan.textContent = "\u00a0";
        lineSpan.appendChild(spaceSpan);
      }
    });

    title.appendChild(lineSpan);
  });

  const words = [...title.querySelectorAll(".word")];
  const section = title.closest(".kinetic-section");
  let titleTicking = false;

  const updateKineticTitle = () => {
    const rect = section.getBoundingClientRect();
    const start = window.innerHeight * 0.86;
    const distance = window.innerHeight * 0.62;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / distance));
    const overlap = 1.65;
    const range = words.length + overlap - 1;
    const colorStart = 184;
    const colorEnd = 17;

    words.forEach((word, index) => {
      const wordProgress = Math.min(1, Math.max(0, (progress * range - index) / overlap));
      const easedProgress = 1 - Math.pow(1 - wordProgress, 3);
      const channel = Math.round(colorStart + (colorEnd - colorStart) * easedProgress);
      word.style.color = `rgb(${channel}, ${channel}, ${channel})`;
    });

    titleTicking = false;
  };

  const requestKineticTitleUpdate = () => {
    if (titleTicking) return;
    titleTicking = true;
    requestAnimationFrame(updateKineticTitle);
  };

  const titleObserver = new IntersectionObserver((entries) => {
    const [entry] = entries;

    if (entry.isIntersecting) {
      window.addEventListener("scroll", requestKineticTitleUpdate, { passive: true });
      requestKineticTitleUpdate();
    } else {
      window.removeEventListener("scroll", requestKineticTitleUpdate);
      updateKineticTitle();
    }
  });

  titleObserver.observe(section);
}

if (header) {
  let lastScrollY = window.scrollY;
  let lastPointerY = 0;

  const showHeader = () => header.classList.remove("is-hidden");
  const hideHeader = () => {
    if (!header.classList.contains("menu-open")) header.classList.add("is-hidden");
  };
  const darkSections = [".hero", ".detail-band"];

  const updateHeaderContrast = () => {
    const headerLine = header.getBoundingClientRect().bottom + 8;
    const isOnDark = darkSections.some((selector) => {
      const section = document.querySelector(selector);
      if (!section) return false;

      const rect = section.getBoundingClientRect();
      return rect.top <= headerLine && rect.bottom >= headerLine;
    });

    header.classList.toggle("on-light", !isOnDark);
  };

  window.addEventListener("scroll", () => {
    const currentScrollY = window.scrollY;
    const scrollingDown = currentScrollY > lastScrollY;

    if (currentScrollY < 80 || !scrollingDown) {
      showHeader();
    } else {
      hideHeader();
    }

    lastScrollY = currentScrollY;
    updateHeaderContrast();
  });

  window.addEventListener("pointermove", (event) => {
    const movingUp = event.clientY < lastPointerY;

    if (event.clientY < 92 || movingUp) {
      showHeader();
    } else if (window.scrollY > 80 && event.clientY > 150) {
      hideHeader();
    }

    lastPointerY = event.clientY;
    updateHeaderContrast();
  });

  header.addEventListener("focusin", showHeader);
  updateHeaderContrast();
}

const navToggle = document.querySelector(".nav-toggle");
const mainNav = document.querySelector("#main-nav");

if (header && navToggle && mainNav) {
  const closeMobileMenu = () => {
    header.classList.remove("menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Abrir menú");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = header.classList.toggle("menu-open");
    header.classList.remove("is-hidden");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  });

  mainNav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMobileMenu));

  window.addEventListener("resize", () => {
    if (window.innerWidth > 767) closeMobileMenu();
  });
}

// Amphion scroll story
const experiences = [
  { title: "Control", image: "control.png" },
  { title: "Libertad", image: "libertad.png" },
  { title: "Desafíos", image: "desafios.png" },
  { title: "Compañía", image: "compañía.png" },
  { title: "En donde estés", image: "en donde estes.png" }
];

const story = document.querySelector(".amphion-story");

if (story) {
  const heading = story.querySelector(".amphion-story__heading");
  const media = story.querySelector(".amphion-story__media");
  const titleElements = [];
  const imageElements = [];
  let activeIndex = -1;
  let ticking = false;

  experiences.forEach((experience, index) => {
    const title = document.createElement("span");
    title.className = "amphion-story__title";
    title.textContent = experience.title;
    heading.appendChild(title);
    titleElements.push(title);

    const image = document.createElement("img");
    image.className = "amphion-story__image";
    image.src = experience.image;
    image.alt = `${experience.title}, experiencia Venzo Amphion`;
    if (index === 0) image.fetchPriority = "high";
    media.appendChild(image);
    imageElements.push(image);
  });

  const setActiveExperience = (index) => {
    if (index === activeIndex) return;

    imageElements.forEach((image, itemIndex) => {
      image.classList.toggle("is-active", itemIndex === index);
    });

    activeIndex = index;
  };

  const updateStory = () => {
    const rect = story.getBoundingClientRect();
    const scrollableDistance = Math.max(1, story.offsetHeight - window.innerHeight);
    const progress = Math.min(1, Math.max(0, -rect.top / scrollableDistance));
    const index = Math.min(experiences.length - 1, Math.floor(progress * experiences.length));
    const overlap = 1.65;
    const range = titleElements.length + overlap - 1;

    titleElements.forEach((title, titleIndex) => {
      const titleProgress = Math.min(1, Math.max(0, (progress * range - titleIndex) / overlap));
      const easedProgress = 1 - Math.pow(1 - titleProgress, 3);
      const red = Math.round(17 + (239 - 17) * easedProgress);
      const green = Math.round(17 + (238 - 17) * easedProgress);
      const blue = Math.round(17 + (225 - 17) * easedProgress);
      title.style.color = `rgb(${red}, ${green}, ${blue})`;
      title.toggleAttribute("aria-current", titleIndex === index);
    });

    setActiveExperience(index);
    ticking = false;
  };

  const requestStoryUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(updateStory);
  };

  window.addEventListener("scroll", requestStoryUpdate, { passive: true });
  window.addEventListener("resize", requestStoryUpdate);
  updateStory();
}

// Amphion color selector
const amphionColors = [
  { name: "Negro", image: "venzo negra.png", swatch: "#171717" },
  { name: "Gris", image: "venzo gris.png", swatch: "#9b9b9b" },
  { name: "Verde", image: "venzo verde.png", swatch: "#aadd00" },
  { name: "Rosa", image: "venzo_rosa.png", swatch: "#d84b9b" }
];

const colorSelector = document.querySelector(".amphion-colors");

if (colorSelector) {
  const slidesContainer = colorSelector.querySelector(".amphion-colors__slides");
  const swatchesContainer = colorSelector.querySelector(".amphion-colors__swatches");
  const previousButton = colorSelector.querySelector(".amphion-colors__arrow--prev");
  const nextButton = colorSelector.querySelector(".amphion-colors__arrow--next");
  const slides = [];
  const swatches = [];
  let currentColor = 0;

  amphionColors.forEach((color, index) => {
    const slide = document.createElement("figure");
    slide.className = "amphion-colors__slide";

    const image = document.createElement("img");
    image.src = color.image;
    image.alt = `Venzo Amphion color ${color.name}`;
    slide.appendChild(image);
    slidesContainer.appendChild(slide);
    slides.push(slide);

    const swatch = document.createElement("button");
    swatch.className = "amphion-colors__swatch";
    swatch.type = "button";
    swatch.style.backgroundColor = color.swatch;
    swatch.setAttribute("aria-label", color.name);
    swatch.addEventListener("click", () => updateColor(index));
    swatchesContainer.appendChild(swatch);
    swatches.push(swatch);
  });

  const updateColor = (index) => {
    currentColor = (index + amphionColors.length) % amphionColors.length;
    const previous = (currentColor - 1 + amphionColors.length) % amphionColors.length;
    const next = (currentColor + 1) % amphionColors.length;

    slides.forEach((slide, slideIndex) => {
      slide.classList.toggle("is-current", slideIndex === currentColor);
      slide.classList.toggle("is-previous", slideIndex === previous);
      slide.classList.toggle("is-next", slideIndex === next);
      slide.setAttribute("aria-hidden", slideIndex === currentColor ? "false" : "true");
    });

    swatches.forEach((swatch, swatchIndex) => {
      const isActive = swatchIndex === currentColor;
      swatch.classList.toggle("is-active", isActive);
      swatch.setAttribute("aria-pressed", String(isActive));
    });
  };

  previousButton.addEventListener("click", () => updateColor(currentColor - 1));
  nextButton.addEventListener("click", () => updateColor(currentColor + 1));
  updateColor(0);
}

// Capabilities title scroll reading
const capabilitiesTitle = document.querySelector("[data-capabilities-read]");

if (capabilitiesTitle) {
  const capabilityWords = [...capabilitiesTitle.querySelectorAll(".amphion-capabilities__word")];
  const capabilitiesSection = capabilitiesTitle.closest(".amphion-capabilities");
  let capabilitiesTicking = false;

  const updateCapabilitiesTitle = () => {
    const rect = capabilitiesSection.getBoundingClientRect();
    const start = window.innerHeight * 0.86;
    const distance = window.innerHeight * 0.62;
    const progress = Math.min(1, Math.max(0, (start - rect.top) / distance));
    const overlap = 1.65;
    const range = capabilityWords.length + overlap - 1;
    const colorStart = 184;
    const colorEnd = 17;

    capabilityWords.forEach((word, index) => {
      const wordProgress = Math.min(1, Math.max(0, (progress * range - index) / overlap));
      const easedProgress = 1 - Math.pow(1 - wordProgress, 3);
      const channel = Math.round(colorStart + (colorEnd - colorStart) * easedProgress);
      word.style.color = `rgb(${channel}, ${channel}, ${channel})`;
    });

    capabilitiesTicking = false;
  };

  const requestCapabilitiesUpdate = () => {
    if (capabilitiesTicking) return;
    capabilitiesTicking = true;
    requestAnimationFrame(updateCapabilitiesTitle);
  };

  const capabilitiesObserver = new IntersectionObserver((entries) => {
    const [entry] = entries;

    if (entry.isIntersecting) {
      window.addEventListener("scroll", requestCapabilitiesUpdate, { passive: true });
      requestCapabilitiesUpdate();
    } else {
      window.removeEventListener("scroll", requestCapabilitiesUpdate);
      updateCapabilitiesTitle();
    }
  });

  capabilitiesObserver.observe(capabilitiesSection);
}

const capabilitiesCarousel = document.querySelector(".amphion-capabilities__gallery");

if (capabilitiesCarousel) {
  const capabilitySlides = [...capabilitiesCarousel.querySelectorAll(".amphion-capabilities__media")];
  const capabilityNext = capabilitiesCarousel.querySelector(".amphion-capabilities__arrow");
  let capabilitySlideIndex = 0;

  const showCapabilitySlide = (index) => {
    capabilitySlideIndex = (index + capabilitySlides.length) % capabilitySlides.length;

    capabilitySlides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === capabilitySlideIndex;
      slide.classList.toggle("is-active", isActive);
      slide.setAttribute("aria-hidden", String(!isActive));
    });
  };

  capabilityNext.addEventListener("click", () => showCapabilitySlide(capabilitySlideIndex + 1));
  showCapabilitySlide(0);
}

// Team Venzo interactive stories
const teamVenzo = document.querySelector(".team-venzo");

if (teamVenzo) {
  const riders = [...teamVenzo.querySelectorAll(".team-venzo__rider")];
  const riderName = teamVenzo.querySelector(".team-venzo__name");
  const riderQuote = teamVenzo.querySelector(".team-venzo__quote");

  const showRiderStory = (rider) => {
    riders.forEach((item) => {
      const isActive = item === rider;
      item.classList.toggle("is-active", isActive);
      item.setAttribute("aria-pressed", String(isActive));
    });

    riderName.textContent = rider.dataset.name;
    riderQuote.textContent = `“${rider.dataset.quote}”`;
  };

  riders.forEach((rider) => {
    rider.addEventListener("pointerenter", () => showRiderStory(rider));
    rider.addEventListener("focus", () => showRiderStory(rider));
    rider.addEventListener("click", () => showRiderStory(rider));
  });

  const joinLink = teamVenzo.querySelector(".team-venzo__cta");

  const createJoinSection = () => {
    const section = document.createElement("section");
    section.className = "team-join";
    section.id = "unirme";
    section.setAttribute("aria-labelledby", "team-join-title");
    section.innerHTML = `
      <div class="team-join__inner">
        <div class="team-join__heading">
          <p class="team-join__eyebrow">TEAM VENZO</p>
          <h2 class="team-join__title" id="team-join-title">Sumate a la comunidad.</h2>
          <p class="team-join__subtitle">Completá tus datos y empezá a formar parte del Team Venzo.</p>
        </div>
        <form class="team-join__form">
          <label class="team-join__field">
            <span>Nombre</span>
            <input type="text" name="name" autocomplete="name" required>
          </label>
          <label class="team-join__field">
            <span>Edad</span>
            <input type="number" name="age" min="16" inputmode="numeric" required>
          </label>
          <label class="team-join__field">
            <span>Mail</span>
            <input type="email" name="email" autocomplete="email" required>
          </label>
          <button class="team-join__submit" type="submit">UNIRME</button>
          <p class="team-join__note" aria-live="polite">Te va a llegar al mail la confirmación para unirte al Team Venzo.</p>
        </form>
      </div>
    `;

    teamVenzo.insertAdjacentElement("afterend", section);
    const form = section.querySelector(".team-join__form");
    const submitButton = form.querySelector(".team-join__submit");
    const confirmation = form.querySelector(".team-join__note");

    form.addEventListener("submit", (event) => {
      event.preventDefault();
      if (submitButton.disabled) return;

      submitButton.disabled = true;
      confirmation.classList.add("is-visible");
    });
    return section;
  };

  joinLink.addEventListener("click", (event) => {
    event.preventDefault();
    const joinSection = document.querySelector("#unirme") || createJoinSection();
    requestAnimationFrame(() => joinSection.scrollIntoView({ behavior: "smooth", block: "start" }));
  });
}
