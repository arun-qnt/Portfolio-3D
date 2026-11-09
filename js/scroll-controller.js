/**
 * SCROLL CONTROLLER — Synchronizes Window Scroll, Floating Navbar Active States,
 * Atmospheric Smoke Parallax, and Progressive Micro-Choreography
 */

class ScrollController {
  constructor(config, videoController, animationsController) {
    this.config = config;
    this.videoController = videoController;
    this.animationsController = animationsController;

    this.scrollProgressBar = document.getElementById("scroll-progress-bar");
    this.navLinks = Array.from(document.querySelectorAll(".nav-link[data-section]"));
    this.sectionDots = Array.from(document.querySelectorAll(".stage-dot[data-section]"));
    this.sections = Array.from(document.querySelectorAll(".portfolio-section[data-section-id]"));
    this.resumePullCard = document.getElementById("resume-pull-card");
    this.projectCards = Array.from(document.querySelectorAll(".project-card"));

    this.currentSectionId = "intro";
    this.rafId = null;

    this.bindEvents();
    this.updateScroll();
    this.startLoop();
  }

  bindEvents() {
    window.addEventListener("scroll", () => this.updateScroll(), { passive: true });
    window.addEventListener(
      "resize",
      () => {
        this.updateScroll();
        if (this.videoController) {
          this.videoController.applyStageTransform();
        }
      },
      { passive: true }
    );

    // Smooth navigation clicks (including #resume-pull-card and #contact-card-panel)
    const allTriggers = Array.from(document.querySelectorAll("[data-scroll-to]"));
    allTriggers.forEach((el) => {
      el.addEventListener("click", (e) => {
        const targetKey = el.getAttribute("data-scroll-to");
        let targetEl = null;
        if (targetKey === "resume") {
          targetEl = document.getElementById("resume-pull-card");
        } else if (targetKey === "contact") {
          targetEl = document.getElementById("contact-card-panel") || document.getElementById("section-contact");
        } else {
          targetEl = document.getElementById(`section-${targetKey}`);
        }

        if (targetEl) {
          e.preventDefault();
          const mobileNav = document.getElementById("mobile-nav-drawer");
          const menuBtn = document.getElementById("mobile-menu-btn");
          if (mobileNav && mobileNav.classList.contains("is-open")) {
            mobileNav.classList.remove("is-open");
            if (menuBtn) {
              menuBtn.classList.remove("is-active");
              menuBtn.setAttribute("aria-expanded", "false");
            }
          }

          if (targetKey === "intro") {
            window.scrollTo({ top: 0, behavior: "smooth" });
            return;
          }

          const rect = targetEl.getBoundingClientRect();
          const offset = targetKey === "resume" || targetKey === "contact" ? 92 : 0;
          const targetTop = Math.max(0, window.scrollY + rect.top - offset);
          window.scrollTo({
            top: targetTop,
            behavior: "smooth"
          });
        }
      });
    });
  }

  getGlobalScrollProgress() {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return 0;
    return Math.max(0, Math.min(1, window.scrollY / docHeight));
  }

  /**
   * Computes the active section and localProgress (0..1) directly from each
   * DOM section's actual offsetTop and offsetHeight.
   * Uses a proportional scrollProbe (scrollY + globalProgress * innerHeight)
   * so scrollY=0 maps to 0.00s of Clip 1 and scrollY=maxScroll maps to 100% of Clip 6!
   */
  getSectionScrollState() {
    const globalProgress = this.getGlobalScrollProgress();
    const scrollProbe = window.scrollY + globalProgress * window.innerHeight;
    const configSections = this.config.timeline.sections;

    for (let i = 0; i < this.sections.length; i++) {
      const domSec = this.sections[i];
      const secId = domSec.getAttribute("data-section-id");
      const cfgSec = configSections.find((s) => s.id === secId) || configSections[i];

      const top = domSec.offsetTop;
      const height = Math.max(1, domSec.offsetHeight);
      const bottom = top + height;

      if (scrollProbe >= top && (scrollProbe <= bottom || i === this.sections.length - 1)) {
        const localProgress = Math.max(0, Math.min(1, (scrollProbe - top) / height));
        return { activeSection: cfgSec, localProgress };
      }
    }

    if (window.scrollY <= 10) {
      return { activeSection: configSections[0], localProgress: 0 };
    }
    return {
      activeSection: configSections[configSections.length - 1],
      localProgress: 1
    };
  }

  updateScroll() {
    const progress = this.getGlobalScrollProgress();

    if (this.scrollProgressBar) {
      this.scrollProgressBar.style.transform = `scaleX(${progress.toFixed(4)})`;
    }

    if (this.videoController) {
      const domState = this.getSectionScrollState();
      const state = this.videoController.setSectionProgress(
        domState.activeSection,
        domState.localProgress
      );
      if (state && state.activeSection) {
        this.setActiveSection(state.activeSection.id, state.localProgress);
      }
    }
  }

  setActiveSection(sectionId, localProgress) {
    // Distinguish between "resume" (first half of Section 06) and "contact" (second half of Section 06) in the navbar
    let navSectionKey = sectionId;
    if (sectionId === "contact" && localProgress < 0.48) {
      navSectionKey = "resume";
    }

    this.navLinks.forEach((link) => {
      const linkSec = link.getAttribute("data-section");
      link.classList.toggle("is-active", linkSec === navSectionKey);
    });

    if (this.currentSectionId !== sectionId) {
      this.currentSectionId = sectionId;

      this.sectionDots.forEach((dot) => {
        const isMatch = dot.getAttribute("data-section") === sectionId;
        dot.classList.toggle("is-active", isMatch);
      });

      this.sections.forEach((sec) => {
        const isMatch = sec.getAttribute("data-section-id") === sectionId;
        sec.classList.toggle("is-current-section", isMatch);
      });

      document.body.setAttribute("data-active-scene", sectionId);
    }

    // Progressive choreography for Section 06 (Character raises hands & pulls down screen)
    if (this.resumePullCard) {
      if (sectionId === "contact") {
        const pullProgress = Math.max(0, Math.min(1, (localProgress - 0.05) / 0.32));
        this.resumePullCard.style.setProperty("--pull-progress", pullProgress.toFixed(3));
        this.resumePullCard.classList.toggle("is-pulled-down", pullProgress > 0.12);
      } else {
        this.resumePullCard.style.setProperty("--pull-progress", "1");
      }
    }
  }

  startLoop() {
    const loop = () => {
      if (this.videoController) {
        this.videoController.tick();
      }
      if (this.animationsController) {
        this.animationsController.updateParallax(window.scrollY);
      }
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }
}

window.ScrollController = ScrollController;
