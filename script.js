/* Manchester Meet & Greet - client-side UX */

(() => {
  "use strict";

  const OFFICIAL_REG_URL = "https://www.stephenakintayo.com/manchester";
  const VIDEO_URL = ""; // Optional: put a YouTube embed URL or full URL here.

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  const mobileNavQuery = window.matchMedia("(max-width: 720px)");

  function setNavOpen(open) {
    if (!navMenu) return;
    navMenu.dataset.open = open ? "true" : "false";
    document.body.classList.toggle("nav-open", open);
    navToggle?.setAttribute("aria-expanded", open ? "true" : "false");
    if (open) navToggle?.setAttribute("aria-label", "Close navigation");
    else navToggle?.setAttribute("aria-label", "Open navigation");
  }

  navToggle?.addEventListener("click", () => {
    const isOpen = navMenu?.dataset.open === "true";
    setNavOpen(!isOpen);
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && navMenu?.dataset.open === "true") {
      setNavOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (!mobileNavQuery.matches) setNavOpen(false);
  });

  document.addEventListener("click", (e) => {
    if (navMenu?.dataset.open !== "true") return;
    const target = e.target;
    if (!(target instanceof Node)) return;
    if (navMenu.contains(target) || navToggle?.contains(target)) return;
    setNavOpen(false);
  });

  // Smooth scroll for internal anchor links.
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href") || "";
      const id = href.slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;

      e.preventDefault();
      const header = document.querySelector("[data-header]");
      const offset = header ? header.getBoundingClientRect().height + 10 : 90;
      const top = window.scrollY + target.getBoundingClientRect().top - offset;
      window.scrollTo({ top, behavior: "smooth" });
      setNavOpen(false);
    });
  });

  // FAQ accordion
  const accordionRoot = document.querySelector("[data-accordion]");
  if (accordionRoot) {
    const buttons = accordionRoot.querySelectorAll("[data-accordion-button]");

    buttons.forEach((btn) => {
      btn.addEventListener("click", () => {
        const item = btn.closest(".faq-item");
        const isOpen = item?.dataset.open === "true";

        // Close others.
        accordionRoot.querySelectorAll(".faq-item").forEach((other) => {
          if (other === item) return;
          other.dataset.open = "false";
          const otherBtn = other.querySelector("[data-accordion-button]");
          const panel = other.querySelector(".faq-panel");
          otherBtn?.setAttribute("aria-expanded", "false");
          if (panel) panel.hidden = true;
        });

        // Toggle clicked item.
        if (item) item.dataset.open = isOpen ? "false" : "true";
        const panel = item?.querySelector(".faq-panel");
        btn.setAttribute("aria-expanded", (!isOpen).toString());
        if (panel) panel.hidden = isOpen;
      });
    });
  }

  // Modals
  const modals = {
    reserve: document.getElementById("reserveModal"),
    vip: document.getElementById("vipModal"),
    video: document.getElementById("videoModal"),
  };

  function openModal(modal) {
    if (!modal) return;
    modal.hidden = false;
    document.body.style.overflow = "hidden";
    const firstFocusable =
      modal.querySelector("button, a[href], input, select, textarea, [tabindex]:not([tabindex='-1'])") || modal;
    firstFocusable.focus?.();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    document.body.style.overflow = "";
  }

  function wireModalClose(modal) {
    if (!modal) return;
    modal.addEventListener("click", (e) => {
      const target = e.target;
      if (target && target.matches("[data-modal-close]")) closeModal(modal);
    });

    window.addEventListener("keydown", (e) => {
      if (e.key !== "Escape") return;
      if (!modal.hidden) closeModal(modal);
    });
  }

  Object.values(modals).forEach(wireModalClose);

  // Open VIP modal
  document.querySelector("[data-open-vip]")?.addEventListener("click", () => {
    openModal(modals.vip);
  });

  // Open Video modal
  document.querySelector("[data-open-video]")?.addEventListener("click", () => {
    const container = document.getElementById("videoContainer");
    const fallback = document.getElementById("videoFallback");
    if (container) container.innerHTML = "";

    if (VIDEO_URL && container) {
      // If a YouTube watch URL was provided, convert to embed.
      let embedSrc = VIDEO_URL;
      if (/youtube\.com\/watch\?v=/.test(VIDEO_URL)) {
        const id = new URL(VIDEO_URL).searchParams.get("v");
        if (id) embedSrc = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      } else if (/youtu\.be\//.test(VIDEO_URL)) {
        const id = VIDEO_URL.split("youtu.be/")[1]?.split("?")[0];
        if (id) embedSrc = `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
      }

      const iframe = document.createElement("iframe");
      iframe.width = "560";
      iframe.height = "315";
      iframe.src = embedSrc;
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      container.appendChild(iframe);
      if (fallback) fallback.hidden = true;
    } else if (fallback) {
      fallback.hidden = false;
    }

    openModal(modals.video);
  });

  // Reserve seat form handling (client-side only)
  const form = document.getElementById("registrationForm");
  const reserveModalName = document.getElementById("reserveModalName");
  const reserveModalCompany = document.getElementById("reserveModalCompany");
  const reserveModalEmailLink = document.getElementById("reserveModalEmailLink");
  const reserveModalOfficialLink = document.getElementById("reserveModalOfficialLink");

  function setFieldError(fieldName, message) {
    const el = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (!el) return;
    el.textContent = message || "";
  }

  function getFieldValue(name) {
    const input = form?.querySelector(`[name="${name}"]`);
    return (input?.value || "").trim();
  }

  function validateEmail(email) {
    // Reasonable email validation for UI (not RFC-perfect).
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const fields = {
      fullName: getFieldValue("fullName"),
      email: getFieldValue("email"),
      phone: getFieldValue("phone"),
      company: getFieldValue("company"),
      industry: getFieldValue("industry"),
      country: getFieldValue("country"),
    };

    // Clear previous errors.
    Object.keys(fields).forEach((key) => setFieldError(key, ""));

    const errors = {};
    if (!fields.fullName || fields.fullName.length < 2) errors.fullName = "Please enter your full name.";
    if (!fields.email || !validateEmail(fields.email)) errors.email = "Please enter a valid email address.";
    if (!fields.phone || fields.phone.length < 7) errors.phone = "Please enter a valid phone number.";
    if (!fields.company) errors.company = "Please enter your company/business name.";
    if (!fields.industry) errors.industry = "Please enter your industry.";
    if (!fields.country) errors.country = "Please enter your country.";

    const hasErrors = Object.keys(errors).length > 0;
    if (hasErrors) {
      Object.entries(errors).forEach(([key, msg]) => setFieldError(key, msg));
      return;
    }

    // Populate modal summary.
    if (reserveModalName) reserveModalName.textContent = fields.fullName;
    if (reserveModalCompany) reserveModalCompany.textContent = fields.company;
    if (reserveModalOfficialLink) reserveModalOfficialLink.href = OFFICIAL_REG_URL;

    // Build mailto link with summary for convenience.
    const subject = "Manchester Meet & Greet - Reservation Request";
    const body = [
      "Hello Stephen Akintayo Foundation,",
      "",
      "I would like to reserve a seat for:",
      "Manchester CEOs & Founders' Meet & Greet",
      "Saturday, 26th July - 6:00 PM (BST)",
      "Manchester, United Kingdom",
      "",
      "Attendee details:",
      `Name: ${fields.fullName}`,
      `Email: ${fields.email}`,
      `Phone: ${fields.phone}`,
      `Company/Business: ${fields.company}`,
      `Industry: ${fields.industry}`,
      `Country: ${fields.country}`,
      "",
      "Please advise on next steps.",
      "",
      "Thank you,",
      fields.fullName,
    ].join("\n");

    const emailLink = `mailto:products@stephenakintayo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    if (reserveModalEmailLink) reserveModalEmailLink.href = emailLink;

    openModal(modals.reserve);
  });
})();

