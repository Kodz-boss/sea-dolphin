// Replace with the company inbox before relying on the contact form.
// Leave blank until a real address is available. Do not use a guessed address.
const CONTACT_EMAIL = "";

const page = document.body.dataset.page;
document.querySelectorAll("[data-nav]").forEach((link) => {
  if (link.dataset.nav === page) {
    link.setAttribute("aria-current", "page");
  } else {
    link.removeAttribute("aria-current");
  }
});

document.querySelectorAll("[data-year]").forEach((node) => {
  node.textContent = String(new Date().getFullYear());
});

const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".site-nav");

function setNavOpen(open) {
  if (!toggle || !nav) return;
  nav.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open ? "true" : "false");
  const label = toggle.querySelector(".sr-only");
  if (label) label.textContent = open ? "Close menu" : "Menu";
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    setNavOpen(!nav.classList.contains("is-open"));
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => setNavOpen(false));
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setNavOpen(false);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 860) setNavOpen(false);
  });
}

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const revealItems = document.querySelectorAll(".reveal");

if (!reduceMotion && finePointer) {
  document.documentElement.classList.add("has-pointer");
  const glassSelector = ".card, .req, .stat-grid, .coverage, .disclaimer, .address-card, .form, .leader, .site-header, .band, .glance, .site-footer";
  document.addEventListener("pointermove", (event) => {
    document.documentElement.style.setProperty("--lx", event.clientX + "px");
    document.documentElement.style.setProperty("--ly", event.clientY + "px");
    const surface = event.target.closest(glassSelector);
    if (!surface) return;
    const rect = surface.getBoundingClientRect();
    surface.style.setProperty("--mx", event.clientX - rect.left + "px");
    surface.style.setProperty("--my", event.clientY - rect.top + "px");
  }, { passive: true });
}

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-in"));
} else {
  document.documentElement.classList.add("js");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.14, rootMargin: "0px 0px -40px 0px" }
  );
  revealItems.forEach((item) => observer.observe(item));
}

const form = document.querySelector("#enquiry-form");

if (form) {
  const status = document.querySelector("#form-status");

  const fields = {
    name: form.querySelector("#name"),
    organisation: form.querySelector("#organisation"),
    email: form.querySelector("#email"),
    message: form.querySelector("#message"),
  };

  function setFieldError(input, message) {
    const wrap = input.closest(".field");
    const error = wrap.querySelector(".error");
    input.setAttribute("aria-invalid", message ? "true" : "false");
    error.textContent = message;
  }

  function clearStatus() {
    status.textContent = "";
    status.className = "form-status";
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearStatus();

    const name = fields.name.value.trim();
    const organisation = fields.organisation.value.trim();
    const email = fields.email.value.trim();
    const message = fields.message.value.trim();
    let valid = true;

    if (name.length < 2) {
      setFieldError(fields.name, "Enter your name.");
      valid = false;
    } else {
      setFieldError(fields.name, "");
    }

    setFieldError(fields.organisation, "");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setFieldError(fields.email, "Enter a valid email address so the office can reply.");
      valid = false;
    } else {
      setFieldError(fields.email, "");
    }

    if (message.length < 12) {
      setFieldError(fields.message, "Write a short message (at least a sentence).");
      valid = false;
    } else {
      setFieldError(fields.message, "");
    }

    if (!valid) {
      status.textContent = "Please correct the highlighted fields.";
      status.className = "form-status is-error";
      const firstInvalid = form.querySelector("[aria-invalid='true']");
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ block: "center" });
      }
      return;
    }

    const inbox = CONTACT_EMAIL.trim();
    if (!inbox || inbox.includes("REPLACE")) {
      status.textContent =
        "Your message is complete, but this site does not yet have a company email configured, so nothing was sent. Please use the head office address on this page.";
      status.className = "form-status is-ok";
      status.scrollIntoView({ block: "nearest" });
      return;
    }

    const subject = encodeURIComponent("Enquiry for Sea Dolphins Security Services Ltd.");
    const body = encodeURIComponent(
      `Name: ${name}\nOrganisation: ${organisation || "—"}\nEmail: ${email}\n\n${message}`
    );
    window.location.href = `mailto:${inbox}?subject=${subject}&body=${body}`;
    status.textContent =
      "Your email application should open with this message. If it does not, write to the head office address above.";
    status.className = "form-status is-ok";
    status.scrollIntoView({ block: "nearest" });
  });
}
