const nav = document.getElementById("nav");
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");
const navLinks = document.querySelectorAll(".nav-link");
const heroBg = document.getElementById("heroBg");
const reservationBg = document.getElementById("reservationBg");
const themeToggle = document.getElementById("themeToggle");
const backToTopBtn = document.getElementById("backToTop");
const menuSearch = document.getElementById("menu-search");
const cuisineDropdown = document.getElementById("cuisine-filter");
const filterBtns = document.querySelectorAll(".filter-btn");
const dietBtns = document.querySelectorAll(".diet-btn");
const menuItems = document.querySelectorAll("#menuItems .menu-item");
const menuResultCount = document.getElementById("menuResultCount");
const heroScroll = document.querySelector(".hero-scroll");
const reservationForm = document.getElementById("reservationForm");
const dateInput = document.getElementById("reservation-date");
const timeSelect = document.getElementById("time");
const reviewForm = document.getElementById("review-form");
const reviewMsg = document.getElementById("review-msg");
const starBtns = document.querySelectorAll("#star-input .star-btn");
const reviewRatingInput = document.getElementById("review-rating");

const STORAGE_KEY = "lighthouse_reviews";
const pinnedReview = {
  name: "Rasshi Srivastav",
  rating: 5,
  text:
    "Absolutely loved the food and ambience! Every dish was crafted with such care and the atmosphere was warm and elegant.",
  date: "14 May 2026",
};

let selectedRating = 0;
let activeDiet = "all";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function isTouchDevice() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

function setTheme(theme) {
  const isLight = theme === "light";
  document.body.classList.toggle("light-theme", isLight);
  localStorage.setItem("theme", theme);
  if (themeToggle) {
    themeToggle.textContent = isLight ? "☀️" : "🌙";
    themeToggle.setAttribute("aria-pressed", String(isLight));
  }
}

function updateAvailableTimes() {
  if (!dateInput || !timeSelect) return;

  const selectedDate = dateInput.value;
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];
  const currentHours = today.getHours();
  const currentMinutes = today.getMinutes();

  timeSelect.querySelectorAll("option").forEach((option) => {
    if (!option.value) return;

    const [hours, minutes] = option.value.split(":").map(Number);
    const isPastToday =
      selectedDate === todayStr &&
      (hours < currentHours || (hours === currentHours && minutes <= currentMinutes + 30));

    option.disabled = isPastToday;

    if (isPastToday && option.selected) {
      timeSelect.value = "";
    }
  });
}

function closeMobileMenu() {
  if (!navMenu || !navToggle) return;
  navMenu.classList.remove("active");
  navToggle.classList.remove("active");
  navToggle.setAttribute("aria-expanded", "false");
  document.body.style.overflow = "";
}

function toggleMobileMenu() {
  if (!navMenu || !navToggle) return;
  const isOpen = navMenu.classList.toggle("active");
  navToggle.classList.toggle("active", isOpen);
  navToggle.setAttribute("aria-expanded", String(isOpen));
  document.body.style.overflow = isOpen ? "hidden" : "";
}

function updateActiveNavLink() {
  const sections = document.querySelectorAll("section[id]");
  const scrollPosition = window.scrollY + 160;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;

    if (scrollPosition >= top && scrollPosition < bottom) {
      navLinks.forEach((link) => {
        link.classList.toggle("active", link.dataset.section === section.id);
      });
    }
  });
}

function handleScroll() {
  const currentScroll = window.scrollY;
  nav?.classList.toggle("scrolled", currentScroll > 40);

  if (!isTouchDevice()) {
    if (heroBg) {
      heroBg.style.transform = `translateY(${currentScroll * 0.18}px)`;
    }

    if (reservationBg) {
      const reservationSection = document.getElementById("reservation");
      if (reservationSection) {
        const sectionTop = reservationSection.offsetTop;
        const offset = Math.max(0, (currentScroll - sectionTop) * 0.15);
        reservationBg.style.transform = `translateY(${offset}px)`;
      }
    }
  }

  if (backToTopBtn) {
    backToTopBtn.classList.toggle("visible", currentScroll > 500);
  }

  updateActiveNavLink();
}

function smoothScroll(e) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;

  const target = document.querySelector(href);
  if (!target) return;

  e.preventDefault();
  window.scrollTo({
    top: target.offsetTop - 96,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });

  closeMobileMenu();
}

function getReviews() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

function renderReviews() {
  const grid = document.getElementById("reviews-grid");
  if (!grid) return;

  const allReviews = [pinnedReview, ...getReviews()];

  if (!allReviews.length) {
    grid.innerHTML = '<p class="review-empty">Be the first to share your experience.</p>';
    return;
  }

  grid.innerHTML = allReviews
    .map(
      (review) => `
        <article class="review-card">
          <div class="review-stars">${"★".repeat(review.rating)}${"☆".repeat(5 - review.rating)}</div>
          <p class="review-text">${review.text}</p>
          <div class="review-author">
            <div class="review-avatar">${review.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <span class="review-name">${review.name}</span>
              <span class="review-date">${review.date}</span>
            </div>
          </div>
        </article>`
    )
    .join("");
}

function isValidName(name) {
  return /^[A-Za-z\s'\-]{3,30}$/.test(name.trim());
}

function isMeaningfulReview(text) {
  const trimmed = text.trim();
  const words = trimmed.split(/\s+/);
  return words.length >= 3 && !/^(.)\1+$/.test(trimmed);
}

function updateStarState(value) {
  starBtns.forEach((btn) => {
    btn.classList.toggle("active", Number(btn.dataset.value) <= value);
  });
}

function updateMenuSummary(visibleCount, totalCount) {
  if (!menuResultCount) return;

  if (visibleCount === totalCount) {
    menuResultCount.textContent = `Showing all ${totalCount} dishes`;
  } else if (visibleCount === 0) {
    menuResultCount.textContent = "No dishes match your filters.";
  } else {
    menuResultCount.textContent = `Showing ${visibleCount} of ${totalCount} dishes`;
  }
}

function filterMenuItems() {
  const searchText = menuSearch?.value.trim().toLowerCase() || "";
  const cuisineFilter = cuisineDropdown?.value || "all";
  const categoryFilter = document.querySelector(".filter-btn.active")?.dataset.filter || "all";
  const currentDiet = activeDiet;

  let visibleCount = 0;

  menuItems.forEach((item) => {
    const title = item.querySelector("h3")?.textContent.toLowerCase() || "";
    const category = item.dataset.category || "all";
    const cuisine = item.dataset.cuisine || "all";
    const diet = item.dataset.diet || "all";

    const matchesSearch = title.includes(searchText);
    const matchesCategory = categoryFilter === "all" || category === categoryFilter;
    const matchesCuisine = cuisineFilter === "all" || cuisine === cuisineFilter;
    const matchesDiet = currentDiet === "all" || diet === currentDiet;

    const visible = matchesSearch && matchesCategory && matchesCuisine && matchesDiet;
    item.classList.toggle("hidden-item", !visible);
    item.classList.toggle("diet-hidden", !visible);

    if (visible) visibleCount += 1;
  });

  let emptyState = document.querySelector(".menu-result-empty");
  if (visibleCount === 0) {
    if (!emptyState) {
      emptyState = document.createElement("p");
      emptyState.className = "menu-result-empty";
      emptyState.textContent = "No dishes match the selected filters.";
      document.getElementById("menuItems")?.appendChild(emptyState);
    }
  } else if (emptyState) {
    emptyState.remove();
  }

  updateMenuSummary(visibleCount, menuItems.length);
}

function setupIntersectionObserver() {
  const targets = document.querySelectorAll(
    ".reveal, .about-content, .menu-controls, .menu-summary, .reservation-form, .location-info, .review-form-wrapper, .special-card, .review-card, .menu-item"
  );

  if (prefersReducedMotion()) {
    targets.forEach((el) => el.classList.add("visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.08, rootMargin: "0px 0px -80px 0px" }
  );

  targets.forEach((el) => observer.observe(el));
}

function setupReservationForm() {
  if (!reservationForm) return;

  reservationForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const requiredFields = reservationForm.querySelectorAll("input[required], select[required]");
    let isValid = true;

    reservationForm.querySelectorAll(".error-message").forEach((node) => node.remove());

    requiredFields.forEach((field) => {
      field.style.borderColor = "";
      if (!field.value) {
        field.style.borderColor = "#ef6a6a";
        isValid = false;
      }
    });

    const emailInput = document.getElementById("email");
    const phoneInput = document.getElementById("phone");
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (emailInput && !emailRegex.test(emailInput.value.trim())) {
      emailInput.style.borderColor = "#ef6a6a";
      isValid = false;
      const emailError = document.createElement("small");
      emailError.className = "error-message";
      emailError.style.color = "#ef6a6a";
      emailError.textContent = "Please enter a valid email address.";
      emailInput.parentElement?.appendChild(emailError);
    }

    if (phoneInput) {
      const digits = phoneInput.value.replace(/\D/g, "");
      if (digits.length !== 10) {
        phoneInput.style.borderColor = "#ef6a6a";
        isValid = false;
        const phoneError = document.createElement("small");
        phoneError.className = "error-message";
        phoneError.style.color = "#ef6a6a";
        phoneError.textContent = "Phone number must contain exactly 10 digits.";
        phoneInput.parentElement?.appendChild(phoneError);
      }
    }

    if (!isValid) return;

    const submitBtn = reservationForm.querySelector('button[type="submit"]');
    if (!submitBtn) return;

    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = "Reservation Requested!";

    setTimeout(() => {
      reservationForm.reset();
      updateAvailableTimes();
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 2400);
  });
}

function setupReviews() {
  if (!reviewForm) return;

  starBtns.forEach((btn) => {
    btn.addEventListener("mouseenter", () => updateStarState(Number(btn.dataset.value)));
    btn.addEventListener("mouseleave", () => updateStarState(selectedRating));
    btn.addEventListener("click", () => {
      selectedRating = Number(btn.dataset.value);
      if (reviewRatingInput) reviewRatingInput.value = String(selectedRating);
      updateStarState(selectedRating);
    });
  });

  reviewForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = document.getElementById("review-name")?.value.trim() || "";
    const reviewText = document.getElementById("review-text")?.value.trim() || "";

    if (!reviewMsg) return;
    reviewMsg.style.display = "block";

    if (!selectedRating) {
      reviewMsg.textContent = "Please select a star rating.";
      reviewMsg.style.color = "#ef6a6a";
      return;
    }

    if (!isValidName(name)) {
      reviewMsg.textContent = "Name should contain only letters and be 3–30 characters long.";
      reviewMsg.style.color = "#ef6a6a";
      return;
    }

    if (reviewText.length < 20) {
      reviewMsg.textContent = "Review must contain at least 20 characters.";
      reviewMsg.style.color = "#ef6a6a";
      return;
    }

    if (!isMeaningfulReview(reviewText)) {
      reviewMsg.textContent = "Please enter a meaningful review.";
      reviewMsg.style.color = "#ef6a6a";
      return;
    }

    const dateStr = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

    const newReview = {
      id: Date.now(),
      name,
      rating: selectedRating,
      text: reviewText,
      date: dateStr,
    };

    const reviews = getReviews();
    reviews.unshift(newReview);
    saveReviews(reviews);
    renderReviews();

    reviewForm.reset();
    selectedRating = 0;
    if (reviewRatingInput) reviewRatingInput.value = "0";
    updateStarState(0);

    reviewMsg.textContent = "Review submitted successfully!";
    reviewMsg.style.color = "#4dd28f";

    setTimeout(() => {
      reviewMsg.style.display = "none";
    }, 2500);
  });
}

function setupMenuFilters() {
  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      filterMenuItems();
    });
  });

  dietBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      dietBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      activeDiet = btn.dataset.diet || "all";
      filterMenuItems();
    });
  });

  menuSearch?.addEventListener("input", filterMenuItems);
  cuisineDropdown?.addEventListener("change", filterMenuItems);
}

function setupHeroScroll() {
  if (!heroScroll) return;

  heroScroll.addEventListener("click", () => {
    const nextSection = document.getElementById("about");
    if (!nextSection) return;

    window.scrollTo({
      top: nextSection.offsetTop - 84,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
  });
}

function setupNewsletter() {
  const form = document.querySelector(".newsletter-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const input = form.querySelector("input[type='email']");
    if (!input || !input.value.trim()) return;
    input.value = "";
    alert("Thanks for subscribing to The Lighthouse newsletter!");
  });
}

function init() {
  const savedTheme = localStorage.getItem("theme") || "dark";
  setTheme(savedTheme);

  if (dateInput) {
    const tomorrow = new Date(Date.now() + 86400000);
    const maxDate = new Date(Date.now() + 90 * 86400000);
    dateInput.min = tomorrow.toISOString().split("T")[0];
    dateInput.max = maxDate.toISOString().split("T")[0];
    dateInput.addEventListener("change", updateAvailableTimes);
  }

  handleScroll();
  renderReviews();
  filterMenuItems();
  updateAvailableTimes();
  setupIntersectionObserver();
  setupReservationForm();
  setupReviews();
  setupMenuFilters();
  setupHeroScroll();
  setupNewsletter();

  navToggle?.addEventListener("click", toggleMobileMenu);
  navLinks.forEach((link) => link.addEventListener("click", smoothScroll));

  document.querySelectorAll("a[href^='#']").forEach((link) => {
    if (!link.classList.contains("nav-link")) {
      link.addEventListener("click", smoothScroll);
    }
  });

  themeToggle?.addEventListener("click", () => {
    const isLight = document.body.classList.contains("light-theme");
    setTheme(isLight ? "dark" : "light");
  });

  backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
  });

  window.addEventListener("scroll", handleScroll, { passive: true });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) closeMobileMenu();
  });

  document.addEventListener("click", (e) => {
    if (!navMenu || !navToggle) return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (!navMenu.contains(target) && !navToggle.contains(target)) {
      closeMobileMenu();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMobileMenu();
  });
}

document.addEventListener("DOMContentLoaded", init);
