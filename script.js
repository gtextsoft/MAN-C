/* Manchester Meet & Greet - client-side UX */

(() => {
  "use strict";

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

  // Validate locally, then let Collector handle the HTML POST and redirect.
  const form = document.getElementById("registrationForm");
  const submitBtn = form?.querySelector("[data-submit-btn]");
  const formStatus = document.getElementById("formStatus");
  const submitBtnDefaultLabel = submitBtn?.textContent || "Reserve your seat";

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
    submitBtn.textContent = isSubmitting ? "Reserving your seat..." : submitBtnDefaultLabel;
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
    if (!fields.fullName || fields.fullName.length < 2) errors.fullName = "Enter your full name.";
    if (!fields.email || !validateEmail(fields.email)) errors.email = "Enter a valid email address.";
    if (!fields.phone || fields.phone.length < 7) errors.phone = "Enter a valid phone number.";
    if (!fields.company) errors.company = "Enter your company or business name.";
    if (!fields.industry) errors.industry = "Enter your industry.";
    if (!fields.country) errors.country = "Enter your country.";

    const consent = form?.querySelector("#consent");
    if (consent && !consent.checked) {
      errors.consent = "Agree to be contacted about your registration.";
    }

    return errors;
  }

  form?.addEventListener("submit", (e) => {
    setFormStatus("");

    const fields = {
      fullName: getFieldValue("fullName"),
      email: getFieldValue("email"),
      phone: getFieldValue("phone"),
      company: getFieldValue("company"),
      industry: getFieldValue("industry"),
      country: getFieldValue("country"),
    };

    ["fullName", "email", "phone", "company", "industry", "country", "consent"].forEach((key) => {
      setFieldError(key, "");
    });

    const errors = validateFields(fields);
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      e.preventDefault();
      errorKeys.forEach((key) => setFieldError(key, errors[key]));
      const firstInvalid = form.querySelector('[aria-invalid="true"]');
      firstInvalid?.focus();
      if (errors.consent && !firstInvalid) {
        setFormStatus(errors.consent, "error");
        form.querySelector("#consent")?.focus();
      }
      return;
    }

    setSubmitting(true);
  });

  window.addEventListener("pageshow", () => setSubmitting(false));
})();

