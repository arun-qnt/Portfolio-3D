/**
 * ANIMATIONS CONTROLLER — IntersectionObserver Reveals, Staggered Typography,
 * Multi-Layer Atmospheric Smoke Parallax, Desktop 3D Card Tilt, and Loader Transition
 */

class AnimationsController {
  constructor() {
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    this.observer = null;
    this.smokePlumes = Array.from(document.querySelectorAll(".smoke-plume[data-parallax-speed]"));
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetMouseX = 0;
    this.targetMouseY = 0;

    this.initStaggeredHeading();
    this.initIntersectionObserver();
    this.initMouseParallax();
    this.bindTiltCards();
  }

  /**
   * Splits the main hero name ("ARUN S") into staggered character spans
   */
  initStaggeredHeading() {
    const heroNameEl = document.getElementById("hero-stagger-name");
    if (!heroNameEl) return;

    const text = heroNameEl.textContent.trim();
    heroNameEl.innerHTML = "";

    Array.from(text).forEach((char, idx) => {
      const span = document.createElement("span");
      span.className = "char-stagger";
      span.style.setProperty("--char-index", idx);
      span.textContent = char === " " ? "\u00A0" : char;
      heroNameEl.appendChild(span);
    });
  }

  /**
   * Observes glass panels, timeline nodes, project cards, and skill cards
   */
  initIntersectionObserver() {
    const revealElements = Array.from(
      document.querySelectorAll(
        ".reveal-item, .timeline-card, .project-card, .skill-detail-card, .stat-card, .resume-card-shell"
      )
    );

    if (this.reducedMotion || !("IntersectionObserver" in window)) {
      revealElements.forEach((el) => el.classList.add("is-visible", "is-revealed"));
      return;
    }

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            if (entry.target.classList.contains("project-card")) {
              entry.target.classList.add("is-revealed");
            }
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -6% 0px",
        threshold: 0.08
      }
    );

    revealElements.forEach((el) => this.observer.observe(el));
  }

  /**
   * Subtle Mouse Parallax on Desktop for Atmospheric Smoke Layers
   */
  initMouseParallax() {
    if (this.reducedMotion) return;

    window.addEventListener(
      "mousemove",
      (e) => {
        if (window.innerWidth <= 1024) return;
        this.targetMouseX = (e.clientX / window.innerWidth - 0.5) * 2;
        this.targetMouseY = (e.clientY / window.innerHeight - 0.5) * 2;
      },
      { passive: true }
    );
  }

  /**
   * Updates multi-layer smoke parallax based on scrollY and desktop pointer
   */
  updateParallax(scrollY) {
    if (this.reducedMotion || this.smokePlumes.length === 0) return;
    if (window.innerWidth <= 768) return; // Keep mobile GPU ultra-light

    this.mouseX += (this.targetMouseX - this.mouseX) * 0.08;
    this.mouseY += (this.targetMouseY - this.mouseY) * 0.08;

    this.smokePlumes.forEach((plume, idx) => {
      const speed = parseFloat(plume.getAttribute("data-parallax-speed") || "0.04");
      const yOffset = scrollY * speed;
      const xMouse = this.mouseX * (18 + idx * 6);
      const yMouse = this.mouseY * (14 + idx * 5);
      plume.style.setProperty("--parallax-x", `${xMouse.toFixed(1)}px`);
      plume.style.setProperty("--parallax-y", `${(yOffset + yMouse).toFixed(1)}px`);
    });
  }

  /**
   * Subtle 3D Hover Tilt & Specular Highlight on Glass Project & Skill Cards (Desktop)
   */
  bindTiltCards() {
    if (this.reducedMotion) return;
    const cards = Array.from(document.querySelectorAll("[data-tilt-card]:not([data-tilt-bound])"));

    cards.forEach((card) => {
      card.setAttribute("data-tilt-bound", "true");

      card.addEventListener("mousemove", (e) => {
        if (window.innerWidth <= 1024) return;
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width;
        const relY = (e.clientY - rect.top) / rect.height;
        const rotateY = (relX - 0.5) * 4.5;
        const rotateX = (0.5 - relY) * 4.5;

        card.style.setProperty("--tilt-rx", `${rotateX.toFixed(2)}deg`);
        card.style.setProperty("--tilt-ry", `${rotateY.toFixed(2)}deg`);
        card.style.setProperty("--glow-x", `${(relX * 100).toFixed(1)}%`);
        card.style.setProperty("--glow-y", `${(relY * 100).toFixed(1)}%`);
      });

      card.addEventListener("mouseleave", () => {
        card.style.setProperty("--tilt-rx", "0deg");
        card.style.setProperty("--tilt-ry", "0deg");
      });
    });
  }

  /**
   * Dismisses the initial loading overlay smoothly
   */
  dismissLoader() {
    const loader = document.getElementById("page-loader");
    if (!loader || loader.classList.contains("is-hidden")) return;

    loader.classList.add("is-hidden");
    document.body.classList.add("is-loaded");

    setTimeout(() => {
      if (loader.parentNode) {
        loader.style.display = "none";
      }
    }, 650);
  }
}

window.AnimationsController = AnimationsController;
