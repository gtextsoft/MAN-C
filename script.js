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
})();

