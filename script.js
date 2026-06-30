/* Manchester Meet & Greet - client-side UX */

(() => {
  "use strict";

  const OFFICIAL_REG_URL = "https://www.stephenakintayo.com/manchester";
  const FORMSPREE_URL = "https://formspree.io/f/xvzyvgoe";
  const THANK_YOU_URL = "thank-you.html";
  const VIDEO_URL = ""; // Optional: put a YouTube embed URL or full URL here.

  const navToggle = document.querySelector("[data-nav-toggle]");
  const navMenu = document.querySelector("[data-nav-menu]");

  const mobileNavQuery = window.matchMedia("(max-width: 960px)");

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

  // Registration form -> Formspree (AJAX) + success modal
  const form = document.getElementById("registrationForm");
  const submitBtn = form?.querySelector("[data-submit-btn]");
  const formStatus = document.getElementById("formStatus");

  const submitBtnDefaultLabel = submitBtn?.textContent || "Submit registration";

  function setFieldError(fieldName, message) {
    const el = document.querySelector(`[data-error-for="${fieldName}"]`);
    if (!el) return;
    el.textContent = message || "";
    const input = form?.querySelector(`[name="${fieldName}"]`);
    if (input) input.setAttribute("aria-invalid", message ? "true" : "false");
  }

  function setFormStatus(message, type) {
    if (!formStatus) return;
    if (!message) {
      formStatus.hidden = true;
      formStatus.textContent = "";
      formStatus.removeAttribute("data-type");
      return;
    }
    formStatus.hidden = false;
    formStatus.textContent = message;
    formStatus.dataset.type = type || "error";
  }

  function setSubmitting(isSubmitting) {
    if (!submitBtn) return;
    submitBtn.disabled = isSubmitting;
    submitBtn.textContent = isSubmitting ? "Submitting..." : submitBtnDefaultLabel;
    submitBtn.setAttribute("aria-busy", isSubmitting ? "true" : "false");
  }

  function getFieldValue(name) {
    const input = form?.querySelector(`[name="${name}"]`);
    return (input?.value || "").trim();
  }

  function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function validateFields(fields) {
    const errors = {};
    if (!fields.fullName || fields.fullName.length < 2) errors.fullName = "Please enter your full name.";
    if (!fields.email || !validateEmail(fields.email)) errors.email = "Please enter a valid email address.";
    if (!fields.phone || fields.phone.length < 7) errors.phone = "Please enter a valid phone number.";
    if (!fields.company) errors.company = "Please enter your company/business name.";
    if (!fields.industry) errors.industry = "Please enter your industry.";
    if (!fields.country) errors.country = "Please enter your country.";

    const consent = form?.querySelector("#consent");
    if (consent && !consent.checked) {
      errors.consent = "Please agree to be contacted about your registration.";
    }

    return errors;
  }

  async function submitToFormspree(fields) {
    const formData = new FormData(form);
    formData.set("_replyto", fields.email);
    formData.set("consent", form?.querySelector("#consent")?.checked ? "Yes" : "No");

    const response = await fetch(FORMSPREE_URL, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    });

    let payload = null;
    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    if (!response.ok) {
      const message =
        (payload && typeof payload.error === "string" && payload.error) ||
        "We could not send your registration. Please try again or use the official link.";
      const err = new Error(message);
      if (payload && Array.isArray(payload.errors)) {
        err.formspreeErrors = payload.errors;
      }
      throw err;
    }

    return payload;
  }

  function applyFormspreeFieldErrors(errors) {
    errors.forEach((item) => {
      const field = item.field || item.name;
      const message = item.message || "Please check this field.";
      if (field) setFieldError(field, message);
    });
  }

  function redirectToThankYou(fields) {
    const params = new URLSearchParams();
    if (fields.fullName) params.set("name", fields.fullName);
    if (fields.company) params.set("company", fields.company);
    const query = params.toString();
    window.location.href = query ? `${THANK_YOU_URL}?${query}` : THANK_YOU_URL;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setFormStatus("");

    const fields = {
      fullName: getFieldValue("fullName"),
      email: getFieldValue("email"),
      phone: getFieldValue("phone"),
      company: getFieldValue("company"),
      industry: getFieldValue("industry"),
      country: getFieldValue("country"),
    };

    ["fullName", "email", "phone", "company", "industry", "country"].forEach((key) => {
      setFieldError(key, "");
    });

    const errors = validateFields(fields);
    if (Object.keys(errors).length > 0) {
      Object.entries(errors).forEach(([key, msg]) => setFieldError(key, msg));
      if (errors.consent) {
        setFormStatus(errors.consent, "error");
      }
      return;
    }

    setSubmitting(true);

    try {
      await submitToFormspree(fields);
      redirectToThankYou(fields);
    } catch (err) {
      if (err.formspreeErrors) {
        applyFormspreeFieldErrors(err.formspreeErrors);
      }
      setFormStatus(err.message || "Something went wrong. Please try again.", "error");
    } finally {
      setSubmitting(false);
    }
  });
})();

