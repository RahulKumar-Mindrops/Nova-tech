/**
 * NovaTech — GSAP + Lenis + ScrollTrigger Animation Engine
 */
(function () {
  "use strict";

  const prefersReduced =
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile = window.matchMedia("(max-width: 900px)").matches;

  gsap.registerPlugin(ScrollTrigger);

  /* ------------------------------------------
     Utilities
  ------------------------------------------ */

  function splitText(el, type) {
    if (!el || el.dataset.splitDone) return;
    const text = el.textContent.trim();
    el.setAttribute("aria-label", text);
    el.textContent = "";

    if (type === "words") {
      const words = text.split(/\s+/);
      words.forEach((word, i) => {
        const wrap = document.createElement("span");
        wrap.className = "split-word";
        const inner = document.createElement("span");
        inner.textContent = word;
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < words.length - 1) {
          el.appendChild(document.createTextNode(" "));
        }
      });
    } else {
      // lines — approximate by wrapping whole text as one or split by punctuation/soft breaks
      const parts = text.split(/(?<=[.!?])\s+/);
      const lines = parts.length > 1 ? parts : [text];
      lines.forEach((line, i) => {
        const wrap = document.createElement("span");
        wrap.className = "split-line";
        wrap.style.display = "block";
        const inner = document.createElement("span");
        inner.textContent = line;
        wrap.appendChild(inner);
        el.appendChild(wrap);
        if (i < lines.length - 1) {
          // keep spacing via block display
        }
      });
    }
    el.dataset.splitDone = "true";
  }

  function prepareSplits() {
    document.querySelectorAll('[data-split="words"]').forEach((el) => {
      splitText(el, "words");
    });
    document.querySelectorAll('[data-split="lines"]').forEach((el) => {
      splitText(el, "lines");
    });
  }

  function revealImmediate() {
    document.querySelectorAll("[data-reveal], [data-split]").forEach((el) => {
      el.classList.add("reveal-done");
    });
    document.querySelectorAll(".split-word > span, .split-line > span").forEach((el) => {
      gsap.set(el, { y: 0 });
    });
  }

  /* ------------------------------------------
     Lenis smooth scroll
  ------------------------------------------ */

  let lenis = null;

  function initLenis() {
    if (prefersReduced || typeof Lenis === "undefined") return;

    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      touchMultiplier: 1.5,
    });

    lenis.on("scroll", ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        if (lenis) {
          lenis.scrollTo(target, { offset: -72, duration: 1.4 });
        } else {
          const top = target.getBoundingClientRect().top + window.scrollY - 72;
          window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
        }
        closeMobileNav();
      });
    });
  }

  function bindAnchorFallback() {
    if (lenis) return;
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      if (anchor.dataset.bound) return;
      anchor.dataset.bound = "1";
      anchor.addEventListener("click", (e) => {
        const id = anchor.getAttribute("href");
        if (!id || id === "#") return;
        const target = document.querySelector(id);
        if (!target) return;
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 72;
        window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
        closeMobileNav();
      });
    });
  }

  /* ------------------------------------------
     Preloader
  ------------------------------------------ */

  function runPreloader() {
    return new Promise((resolve) => {
      const preloader = document.getElementById("preloader");
      const progress = document.getElementById("preloaderProgress");
      const percent = document.getElementById("preloaderPercent");
      const brandText = document.querySelector(".preloader__brand-text");

      if (!preloader || prefersReduced) {
        if (preloader) preloader.remove();
        document.body.classList.remove("is-loading");
        resolve();
        return;
      }

      document.body.classList.add("is-loading");

      const tl = gsap.timeline({
        onComplete: () => {
          document.body.classList.remove("is-loading");
          preloader.classList.add("is-done");
          gsap.set(preloader, { display: "none" });
          resolve();
        },
      });

      tl.to(brandText, {
        clipPath: "inset(0 0% 0 0)",
        duration: 0.9,
        ease: "power3.out",
      });

      const counter = { value: 0 };
      tl.to(
        counter,
        {
          value: 100,
          duration: 1.6,
          ease: "power2.inOut",
          onUpdate: () => {
            const v = Math.round(counter.value);
            if (progress) progress.style.width = v + "%";
            if (percent) percent.textContent = v + "%";
          },
        },
        "-=0.4"
      );

      tl.to(
        preloader,
        {
          clipPath: "inset(0 0 100% 0)",
          duration: 1.05,
          ease: "power4.inOut",
        },
        "+=0.15"
      );
    });
  }

  /* ------------------------------------------
     Navigation
  ------------------------------------------ */

  function initNav() {
    const nav = document.getElementById("nav");
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (!nav) return;

    let lastY = 0;

    ScrollTrigger.create({
      start: 0,
      end: "max",
      onUpdate: (self) => {
        const y = self.scroll();
        if (y > 60) nav.classList.add("is-scrolled");
        else nav.classList.remove("is-scrolled");

        if (y > lastY + 4 && y > 120) nav.classList.add("is-hidden");
        else if (y < lastY - 4) nav.classList.remove("is-hidden");
        lastY = y;
      },
    });

    if (toggle && links) {
      toggle.addEventListener("click", () => {
        const open = toggle.classList.toggle("is-open");
        links.classList.toggle("is-open", open);
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
        document.body.style.overflow = open ? "hidden" : "";
      });

      links.querySelectorAll("a").forEach((a) => {
        a.addEventListener("click", closeMobileNav);
      });
    }
  }

  function closeMobileNav() {
    const toggle = document.getElementById("navToggle");
    const links = document.getElementById("navLinks");
    if (toggle) {
      toggle.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    if (links) links.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  /* ------------------------------------------
     Hero entrance
  ------------------------------------------ */

  function animateHero() {
    const titleWords = document.querySelectorAll(".hero__title .split-word > span");
    const eyebrow = document.querySelector(".hero__eyebrow");
    const desc = document.querySelector(".hero__desc");
    const ctas = document.querySelector(".hero__ctas");
    const scrollHint = document.querySelector(".hero__scroll");
    const bgImage = document.querySelector(".hero__bg-image");

    if (prefersReduced) {
      revealImmediate();
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (bgImage) {
      gsap.fromTo(bgImage, { scale: 1.2, opacity: 0.6 }, { scale: 1.08, opacity: 1, duration: 2, ease: "power2.out" });
    }

    if (eyebrow) {
      gsap.set(eyebrow, { opacity: 0, y: 20 });
      tl.to(eyebrow, { opacity: 1, y: 0, duration: 0.7 }, 0.1);
    }

    if (titleWords.length) {
      tl.to(
        titleWords,
        { y: 0, duration: 1.05, stagger: 0.08, ease: "power4.out" },
        0.2
      );
    }

    if (desc) {
      gsap.set(desc, { opacity: 0, y: 24 });
      tl.to(desc, { opacity: 1, y: 0, duration: 0.8 }, 0.55);
    }

    if (ctas) {
      gsap.set(ctas, { opacity: 0, y: 24 });
      tl.to(ctas, { opacity: 1, y: 0, duration: 0.8 }, 0.7);
    }

    if (scrollHint) {
      gsap.set(scrollHint, { opacity: 0 });
      tl.to(scrollHint, { opacity: 1, duration: 0.6 }, 1.0);
    }
  }

  /* ------------------------------------------
     Featured horizontal slider
  ------------------------------------------ */

  function initFeaturedSlider() {
    const wrap = document.querySelector(".featured-slider__wrap");
    const track = document.getElementById("featTrack");
    if (!wrap || !track) return;

    let currentX = 0;
    let targetX = 0;
    let maxScroll = 0;
    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    function measure() {
      maxScroll = Math.max(0, track.scrollWidth - wrap.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);

    function slideBy(dir) {
      const step = Math.min(400, wrap.clientWidth * 0.7);
      targetX = Math.min(0, Math.max(-maxScroll, targetX - dir * step));
    }

    const prev = document.getElementById("featPrev");
    const next = document.getElementById("featNext");
    prev && prev.addEventListener("click", () => slideBy(-1));
    next && next.addEventListener("click", () => slideBy(1));

    wrap.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      scrollLeft = targetX;
      wrap.setPointerCapture(e.pointerId);
    });
    wrap.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      targetX = Math.min(0, Math.max(-maxScroll, scrollLeft + (e.clientX - startX)));
    });
    wrap.addEventListener("pointerup", () => { isDown = false; });
    wrap.addEventListener("pointercancel", () => { isDown = false; });

    wrap.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          targetX = Math.min(0, Math.max(-maxScroll, targetX - e.deltaY));
        }
      },
      { passive: false }
    );

    // Entrance animation for slides
    if (!prefersReduced) {
      gsap.fromTo(
        track.children,
        { opacity: 0, y: 50, rotate: 2 },
        {
          opacity: 1,
          y: 0,
          rotate: 0,
          duration: 0.9,
          stagger: 0.08,
          ease: "power3.out",
          scrollTrigger: {
            trigger: wrap,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    function tick() {
      currentX += (targetX - currentX) * 0.12;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ------------------------------------------
     Scroll reveals
  ------------------------------------------ */

  function initScrollReveals() {
    if (prefersReduced) {
      revealImmediate();
      return;
    }

    // Fade reveals (skip hero + cards handled by stagger)
    gsap.utils
      .toArray('[data-reveal="fade"], [data-reveal="card"]')
      .filter(
        (el) =>
          !el.closest(".hero") &&
          !el.closest(".technology") &&
          !el.closest(".lifestyle") &&
          !el.classList.contains("cat-card") &&
          !el.classList.contains("feature-card")
      )
      .forEach((el) => {
        const isCard = el.getAttribute("data-reveal") === "card";
        gsap.fromTo(
          el,
          { opacity: 0, y: isCard ? 56 : 40 },
          {
            opacity: 1,
            y: 0,
            duration: isCard ? 0.95 : 0.85,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });

    // Clip-path image reveals (skip hero — handled in animateHero)
    gsap.utils.toArray('[data-reveal="clip"]').forEach((el) => {
      if (el.closest(".hero")) return;
      gsap.fromTo(
        el,
        { clipPath: "inset(12% 12% 12% 12% round 24px)", opacity: 0.4 },
        {
          clipPath: "inset(0% 0% 0% 0% round 0px)",
          opacity: 1,
          duration: 1.6,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    gsap.utils.toArray('[data-reveal="clip-left"]').forEach((el) => {
      const img = el.querySelector(".showcase__img, .clip-reveal-inner, img");
      gsap.fromTo(
        el,
        { clipPath: "inset(0 100% 0 0)" },
        {
          clipPath: "inset(0 0% 0 0)",
          duration: 1.55,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        }
      );
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12, x: -30 },
          {
            scale: 1,
            x: 0,
            duration: 1.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    gsap.utils.toArray('[data-reveal="clip-right"]').forEach((el) => {
      const img = el.querySelector(".showcase__img, img");
      gsap.fromTo(
        el,
        { clipPath: "inset(0 0 0 100%)" },
        {
          clipPath: "inset(0 0 0 0%)",
          duration: 1.55,
          ease: "expo.inOut",
          scrollTrigger: {
            trigger: el,
            start: "top 78%",
            toggleActions: "play none none none",
          },
        }
      );
      if (img) {
        gsap.fromTo(
          img,
          { scale: 1.12, x: 30 },
          {
            scale: 1,
            x: 0,
            duration: 1.9,
            ease: "expo.out",
            scrollTrigger: {
              trigger: el,
              start: "top 78%",
              toggleActions: "play none none none",
            },
          }
        );
      }
    });

    // Smooth image fades for lifestyle / category media
    gsap.utils.toArray(".cat-card__img, .lifestyle__media img, .feat-slide__media img").forEach((img) => {
      gsap.fromTo(
        img,
        { scale: 1.06, opacity: 0.85 },
        {
          scale: 1,
          opacity: 1,
          duration: 1.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: img.closest(".cat-card, .lifestyle__card, .feat-slide") || img,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Split lines / words on scroll
    document.querySelectorAll('[data-split="lines"], [data-split="words"]').forEach((el) => {
      if (el.closest(".hero")) return; // hero handled separately
      const inners = el.querySelectorAll(".split-word > span, .split-line > span");
      if (!inners.length) return;
      gsap.fromTo(
        inners,
        { y: "110%" },
        {
          y: "0%",
          duration: 1.15,
          stagger: 0.05,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    });
  }

  /* ------------------------------------------
     Parallax
  ------------------------------------------ */

  function initParallax() {
    if (prefersReduced || isMobile) return;

    ScrollTrigger.matchMedia({
      "(min-width: 901px)": function () {
        document.querySelectorAll("[data-parallax]").forEach((el) => {
          const speed = parseFloat(el.getAttribute("data-parallax")) || 0.2;
          const distance = speed * 120;
          gsap.to(el, {
            y: -distance,
            ease: "none",
            scrollTrigger: {
              trigger: el.closest("section") || el,
              start: "top bottom",
              end: "bottom top",
              scrub: 1,
            },
          });
        });

        // Soft parallax on hero background
        const heroBg = document.querySelector(".hero__bg-image");
        if (heroBg) {
          gsap.to(heroBg, {
            y: 80,
            ease: "none",
            scrollTrigger: {
              trigger: "#hero",
              start: "top top",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      },
    });
  }

  /* ------------------------------------------
     Technology pinned storytelling (no overlap)
  ------------------------------------------ */

  function initTechnology() {
    const section = document.getElementById("technology");
    if (!section) return;

    const headerBits = section.querySelectorAll(".technology__title, .technology__desc, .btn--ghost-light");
    const cards = section.querySelectorAll(".technology__card");

    if (prefersReduced) {
      gsap.set([headerBits, cards], { autoAlpha: 1, y: 0, clearProps: "transform" });
      return;
    }

    gsap.fromTo(
      headerBits,
      { autoAlpha: 0, y: 20 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.65,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );

    gsap.fromTo(
      cards,
      { autoAlpha: 0, y: 24 },
      {
        autoAlpha: 1,
        y: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: {
          trigger: section.querySelector(".technology__grid"),
          start: "top 88%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ------------------------------------------
     Horizontal explore drag
  ------------------------------------------ */

  function initExploreDrag() {
    const wrap = document.querySelector(".explore__track-wrap");
    const track = document.getElementById("exploreTrack");
    if (!wrap || !track) return;

    let isDown = false;
    let startX = 0;
    let scrollLeft = 0;

    // Use transform-based drag for smoother feel with Lenis
    let currentX = 0;
    let targetX = 0;
    let maxScroll = 0;

    function measure() {
      maxScroll = Math.max(0, track.scrollWidth - wrap.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);

    wrap.addEventListener("pointerdown", (e) => {
      isDown = true;
      startX = e.clientX;
      scrollLeft = targetX;
      wrap.setPointerCapture(e.pointerId);
    });

    wrap.addEventListener("pointermove", (e) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      targetX = Math.min(0, Math.max(-maxScroll, scrollLeft + dx));
    });

    wrap.addEventListener("pointerup", () => {
      isDown = false;
    });
    wrap.addEventListener("pointercancel", () => {
      isDown = false;
    });

    // Wheel horizontal
    wrap.addEventListener(
      "wheel",
      (e) => {
        if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
          e.preventDefault();
          targetX = Math.min(0, Math.max(-maxScroll, targetX - e.deltaY));
        }
      },
      { passive: false }
    );

    function tick() {
      currentX += (targetX - currentX) * 0.12;
      track.style.transform = `translate3d(${currentX}px, 0, 0)`;
      requestAnimationFrame(tick);
    }
    tick();
  }

  /* ------------------------------------------
     Category card stagger grouping
  ------------------------------------------ */

  function initCategoryStagger() {
    if (prefersReduced) return;
    const cards = gsap.utils.toArray(".categories__grid .cat-card");
    if (!cards.length) return;

    gsap.fromTo(
      cards,
      { opacity: 0, y: 60 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        stagger: 0.08,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".categories__grid",
          start: "top 80%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* ------------------------------------------
     Feature cards stagger
  ------------------------------------------ */

  function initFeatureStagger() {
    if (prefersReduced) return;
    const cards = gsap.utils.toArray(".feature-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 48 },
      {
        opacity: 1,
        y: 0,
        duration: 0.85,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".features__grid",
          start: "top 82%",
          toggleActions: "play none none none",
        },
      }
    );
  }

  /* Extra scroll motion — section headers, lifestyle, promo, CTA */
  function initExtraMotion() {
    if (prefersReduced) return;

    // Section eyebrows slide-in from left
    gsap.utils.toArray(".section__eyebrow").forEach((el) => {
      if (el.closest(".hero") || el.closest(".technology")) return;
      gsap.fromTo(
        el,
        { opacity: 0, x: -28 },
        {
          opacity: 1,
          x: 0,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 90%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Lifestyle — simple fade up (VIZIO-style)
    const lifestyleHeader = document.querySelector(".lifestyle__title");
    if (lifestyleHeader) {
      gsap.fromTo(
        lifestyleHeader,
        { autoAlpha: 0, y: 20 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.65,
          ease: "power2.out",
          scrollTrigger: {
            trigger: "#lifestyle",
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    gsap.utils.toArray(".lifestyle__card").forEach((item, i) => {
      gsap.fromTo(
        item,
        { autoAlpha: 0, y: 24 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.7,
          delay: i * 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: item,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Promo content scale + fade
    const promoInner = document.querySelector(".promo__inner");
    if (promoInner) {
      gsap.fromTo(
        promoInner.children,
        { opacity: 0, y: 36, scale: 0.96 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: promoInner,
            start: "top 80%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Explore tiles cascade
    const tiles = gsap.utils.toArray(".explore__tile");
    if (tiles.length) {
      gsap.fromTo(
        tiles,
        { opacity: 0, y: 50, rotateY: 8 },
        {
          opacity: 1,
          y: 0,
          rotateY: 0,
          duration: 0.85,
          stagger: 0.07,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".explore__track",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Final CTA buttons pop
    const ctaActions = document.querySelector(".final-cta__actions");
    if (ctaActions) {
      gsap.fromTo(
        ctaActions.querySelectorAll(".btn"),
        { opacity: 0, y: 24, scale: 0.92 },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          duration: 0.75,
          stagger: 0.1,
          ease: "back.out(1.4)",
          scrollTrigger: {
            trigger: ctaActions,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    }

    // Footer columns rise
    gsap.fromTo(
      ".footer__col",
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: "power3.out",
        scrollTrigger: {
          trigger: ".footer",
          start: "top 90%",
          toggleActions: "play none none none",
        },
      }
    );

    // Showcase chips polish
    document.querySelectorAll(".showcase__chips").forEach((list) => {
      const items = list.querySelectorAll("span");
      gsap.fromTo(
        items,
        { opacity: 0, y: 12 },
        {
          opacity: 1,
          y: 0,
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.out",
          scrollTrigger: {
            trigger: list,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        }
      );
    });

    // Soft scrub on section titles (desktop)
    if (!isMobile) {
      gsap.utils.toArray(".showcase__heading, .promo__title").forEach((title) => {
        gsap.to(title, {
          y: -18,
          ease: "none",
          scrollTrigger: {
            trigger: title,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          },
        });
      });
    }
  }

  /* ------------------------------------------
     Newsletter (UX only)
  ------------------------------------------ */

  function initNewsletter() {
    const form = document.getElementById("newsletterForm");
    if (!form) return;
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const input = document.getElementById("newsletterEmail");
      if (input && input.value) {
        input.value = "";
        input.placeholder = "Thanks — you're on the list";
      }
    });
  }

  function initStatsCount() {
    if (prefersReduced) {
      document.querySelectorAll(".stats__num[data-count]").forEach((el) => {
        el.textContent = el.getAttribute("data-count");
      });
      return;
    }

    const section = document.getElementById("stats");
    if (!section) return;

    const nums = section.querySelectorAll(".stats__num[data-count]");
    let played = false;

    ScrollTrigger.create({
      trigger: section,
      start: "top 80%",
      onEnter: () => {
        if (played) return;
        played = true;
        nums.forEach((el) => {
          const target = parseInt(el.getAttribute("data-count"), 10) || 0;
          const obj = { val: 0 };
          gsap.to(obj, {
            val: target,
            duration: 1.4,
            ease: "power2.out",
            onUpdate: () => {
              el.textContent = Math.round(obj.val);
            },
          });
        });
      },
    });
  }

  /* ------------------------------------------
     Boot
  ------------------------------------------ */

  async function boot() {
    prepareSplits();
    initNav();
    initLenis();
    bindAnchorFallback();
    initNewsletter();

    await runPreloader();

    animateHero();
    initFeaturedSlider();
    initScrollReveals();
    initParallax();
    initTechnology();
    initExploreDrag();
    initCategoryStagger();
    initFeatureStagger();
    initExtraMotion();
    initStatsCount();

    requestAnimationFrame(() => {
      ScrollTrigger.refresh();
    });
    window.addEventListener("load", () => ScrollTrigger.refresh());
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
