/**
 * NovaTech — Custom Cursor & Magnetic Interactions
 * Desktop only; disabled on touch / coarse pointers.
 */
(function () {
  "use strict";

  const isTouch =
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(max-width: 900px)").matches ||
    "ontouchstart" in window;

  if (isTouch) return;

  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduced) return;

  const cursor = document.getElementById("cursor");
  if (!cursor) return;

  const dot = cursor.querySelector(".cursor__dot");
  const ring = cursor.querySelector(".cursor__ring");
  const label = cursor.querySelector(".cursor__label");

  let mouseX = 0;
  let mouseY = 0;
  let ringX = 0;
  let ringY = 0;
  let rafId = null;

  document.body.classList.add("has-custom-cursor");
  cursor.classList.add("is-active");

  window.addEventListener(
    "mousemove",
    (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      if (dot) {
        dot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
      }
    },
    { passive: true }
  );

  function animateRing() {
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    if (ring) {
      ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    }
    if (label) {
      label.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
    }
    rafId = requestAnimationFrame(animateRing);
  }
  animateRing();

  function setLabel(text) {
    if (!label) return;
    if (text) {
      label.textContent = text;
      cursor.classList.add("has-label");
    } else {
      label.textContent = "";
      cursor.classList.remove("has-label");
    }
  }

  document.querySelectorAll("[data-cursor]").forEach((el) => {
    el.addEventListener("mouseenter", () => {
      cursor.classList.add("is-hover");
      setLabel(el.getAttribute("data-cursor"));
      if (el.getAttribute("data-cursor") === "Drag") {
        cursor.classList.add("is-drag");
      }
    });
    el.addEventListener("mouseleave", () => {
      cursor.classList.remove("is-hover", "is-drag", "has-label");
      setLabel("");
    });
  });

  document.querySelectorAll("a, button, .btn, .cat-card, .feature-card, .explore__tile").forEach((el) => {
    if (el.hasAttribute("data-cursor")) return;
    el.addEventListener("mouseenter", () => cursor.classList.add("is-hover"));
    el.addEventListener("mouseleave", () => cursor.classList.remove("is-hover"));
  });

  /* Magnetic buttons */
  document.querySelectorAll("[data-magnetic]").forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      el.style.transform = `translate3d(${x * 0.28}px, ${y * 0.28}px, 0)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "translate3d(0, 0, 0)";
    });
  });

  /* Soft 3D tilt on feature cards */
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      const rotX = (0.5 - y) * 10;
      const rotY = (x - 0.5) * 10;
      card.style.transform = `perspective(800px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.transform = "";
    });
  });

  window.addEventListener("beforeunload", () => {
    if (rafId) cancelAnimationFrame(rafId);
  });
})();
