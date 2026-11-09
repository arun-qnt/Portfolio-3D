/**
 * APP ENTRYPOINT — Initializes Dynamic Portfolio Content from config.js,
 * Interactive Category Filtering (Projects & Skills), Copy-to-Clipboard,
 * Direct Mailto Composer, and Bootstraps Video, Scroll, and Animation Controllers.
 */

(function () {
  "use strict";

  function populateFromConfig(config) {
    if (!config) return;

    // 1. Populate Hero Architecture Mini-Pills
    const archGrid = document.getElementById("hero-architecture-grid");
    if (archGrid && Array.isArray(config.architectureHighlights)) {
      archGrid.innerHTML = config.architectureHighlights
        .map(
          (item) => `
          <div class="arch-mini-pill">
            <span class="arch-mini-title">${item.title}</span>
            <span class="arch-mini-stack">${item.stack}</span>
          </div>
        `
        )
        .join("");
    }

    // 2. Populate 4 Key Metrics Strip
    const statsGrid = document.getElementById("about-stats-grid");
    if (statsGrid && Array.isArray(config.metrics)) {
      statsGrid.innerHTML = config.metrics
        .map(
          (stat, idx) => `
          <div class="stat-card glass-subpanel" style="--stagger-delay: ${idx * 80}ms">
            <div class="stat-top-line">
              <strong class="stat-value">${stat.value}</strong>
              <span class="stat-unit">${stat.unit}</span>
            </div>
            <span class="stat-label">${stat.label}</span>
            <span class="stat-sublabel">${stat.sublabel}</span>
          </div>
        `
        )
        .join("");
    }

    // 3. Populate 4 Capabilities & Expertise Cards
    const capGrid = document.getElementById("capabilities-grid");
    if (capGrid && config.about && Array.isArray(config.about.services)) {
      capGrid.innerHTML = config.about.services
        .map(
          (srv) => `
          <article class="capability-card glass-subpanel">
            <div class="capability-top">
              <span class="capability-num">${srv.id}</span>
              <span class="capability-sub">${srv.subtitle}</span>
            </div>
            <h4 class="capability-title">${srv.title}</h4>
            <p class="capability-desc">${srv.description}</p>
            <div class="capability-tags">
              ${srv.tags.map((t) => `<span class="tech-tag">${t}</span>`).join("")}
            </div>
          </article>
        `
        )
        .join("");
    }

    // 4. Populate Activities & Creative Interests
    const actGrid = document.getElementById("activities-list");
    if (actGrid && config.about && Array.isArray(config.about.activities)) {
      actGrid.innerHTML = config.about.activities
        .map(
          (act) => `
          <div class="activity-item glass-subpanel">
            <strong class="activity-name">${act.name}</strong>
            <p class="activity-desc">${act.description}</p>
          </div>
        `
        )
        .join("");
    }

    // 5. Populate Experience Timeline
    const timelineContainer = document.getElementById("experience-timeline");
    if (timelineContainer && config.experience && Array.isArray(config.experience.positions)) {
      timelineContainer.innerHTML = config.experience.positions
        .map(
          (pos, idx) => `
          <article class="timeline-card glass-panel reveal-item" style="--stagger-delay: ${idx * 110}ms">
            <div class="timeline-marker ${pos.current ? "is-current" : ""}"></div>
            <div class="timeline-card-inner">
              <div class="timeline-header">
                <span class="timeline-period">${pos.period}</span>
                <div class="timeline-badges-group">
                  <span class="timeline-type-badge">${pos.type}</span>
                  ${pos.current ? '<span class="timeline-badge">CURRENT</span>' : ""}
                </div>
              </div>
              <h4 class="timeline-role">${pos.role}</h4>
              <p class="timeline-company">${pos.company} <span class="timeline-dot">•</span> ${pos.location}</p>
              <ul class="timeline-list">
                ${pos.responsibilities.map((item) => `<li>${item}</li>`).join("")}
              </ul>
              <div class="timeline-tech-row">
                ${pos.technologies.map((t) => `<span class="tech-tag">${t}</span>`).join("")}
              </div>
            </div>
          </article>
        `
        )
        .join("");
    }

    // 6. Populate Project Filter Tabs & Asymmetric Project Cards
    const projectFilterBar = document.getElementById("project-filter-bar");
    const projectsGrid = document.getElementById("projects-grid");

    if (projectFilterBar && config.projects && Array.isArray(config.projects.categories)) {
      projectFilterBar.innerHTML = config.projects.categories
        .map(
          (cat, idx) => `
          <button type="button" class="filter-pill-btn ${idx === 0 ? "is-active" : ""}" data-project-filter="${cat.id}" role="tab" aria-selected="${idx === 0}">
            ${cat.label}
          </button>
        `
        )
        .join("");
    }

    if (projectsGrid && config.projects && Array.isArray(config.projects.items)) {
      const renderProjects = (filterId) => {
        const filtered =
          filterId === "all"
            ? config.projects.items
            : config.projects.items.filter((p) => p.category === filterId);

        projectsGrid.innerHTML = filtered
          .map(
            (proj, idx) => `
            <article class="project-card glass-panel reveal-item is-visible is-revealed ${
              proj.featuredSpan === "wide" && filterId === "all" ? "project-card-wide" : ""
            }" style="--stagger-delay: ${idx * 75}ms" data-tilt-card data-project-category="${proj.category}">
              <div class="project-card-top">
                <div class="project-meta-left">
                  <span class="project-number">0${idx + 1}</span>
                  <span class="project-category-pill">${proj.categoryLabel}</span>
                </div>
                <span class="project-org-tag">${proj.organization} • ${proj.period}</span>
              </div>
              <h4 class="project-title">${proj.title}</h4>
              <p class="project-description">${proj.summary}</p>
              <div class="project-highlights-box glass-subpanel">
                <span class="highlights-label">Key Engineering Highlights</span>
                <ul class="project-highlights-list">
                  ${proj.highlights.map((h) => `<li>${h}</li>`).join("")}
                </ul>
              </div>
              <div class="project-tags" aria-label="Technologies used">
                ${proj.technologies.map((tech) => `<span class="tech-tag">${tech}</span>`).join("")}
              </div>
            </article>
          `
          )
          .join("");

        if (window.portfolioAnimations) {
          window.portfolioAnimations.bindTiltCards();
        }
      };

      renderProjects("all");

      if (projectFilterBar) {
        projectFilterBar.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-project-filter]");
          if (!btn) return;
          const filterId = btn.getAttribute("data-project-filter");
          projectFilterBar.querySelectorAll(".filter-pill-btn").forEach((b) => {
            const active = b === btn;
            b.classList.toggle("is-active", active);
            b.setAttribute("aria-selected", String(active));
          });
          renderProjects(filterId);
          window.dispatchEvent(new Event("scroll"));
        });
      }
    }

    // 7. Populate Technical Skills Filter Tabs & Detailed Skill Cards
    const skillsFilterBar = document.getElementById("skills-filter-bar");
    const skillsGrid = document.getElementById("skills-categories-grid");

    if (skillsFilterBar && config.skills && Array.isArray(config.skills.filterTabs)) {
      skillsFilterBar.innerHTML = config.skills.filterTabs
        .map(
          (tab, idx) => `
          <button type="button" class="filter-pill-btn ${idx === 0 ? "is-active" : ""}" data-skill-filter="${tab.id}" role="tab" aria-selected="${idx === 0}">
            ${tab.label}
          </button>
        `
        )
        .join("");
    }

    if (skillsGrid && config.skills && Array.isArray(config.skills.items)) {
      const renderSkills = (filterId) => {
        const filtered =
          filterId === "all"
            ? config.skills.items
            : config.skills.items.filter((s) => s.category === filterId);

        skillsGrid.innerHTML = filtered
          .map(
            (skill, idx) => `
            <article class="skill-detail-card glass-panel reveal-item is-visible" style="--stagger-delay: ${idx * 45}ms" data-tilt-card>
              <div class="skill-card-top">
                <span class="skill-domain-tag">${skill.categoryLabel}</span>
              </div>
              <h4 class="skill-card-name">${skill.name}</h4>
              <p class="skill-card-desc">${skill.detail}</p>
            </article>
          `
          )
          .join("");

        if (window.portfolioAnimations) {
          window.portfolioAnimations.bindTiltCards();
        }
      };

      renderSkills("all");

      if (skillsFilterBar) {
        skillsFilterBar.addEventListener("click", (e) => {
          const btn = e.target.closest("[data-skill-filter]");
          if (!btn) return;
          const filterId = btn.getAttribute("data-skill-filter");
          skillsFilterBar.querySelectorAll(".filter-pill-btn").forEach((b) => {
            const active = b === btn;
            b.classList.toggle("is-active", active);
            b.setAttribute("aria-selected", String(active));
          });
          renderSkills(filterId);
          window.dispatchEvent(new Event("scroll"));
        });
      }
    }
  }

  function setupMobileMenu() {
    const menuBtn = document.getElementById("mobile-menu-btn");
    const mobileDrawer = document.getElementById("mobile-nav-drawer");
    if (!menuBtn || !mobileDrawer) return;

    menuBtn.addEventListener("click", () => {
      const isOpen = mobileDrawer.classList.toggle("is-open");
      menuBtn.classList.toggle("is-active", isOpen);
      menuBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  function setupCopyAndMailHandlers(config) {
    // Copy buttons for email & phone
    document.querySelectorAll("[data-copy-text]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-copy-text");
        if (!text) return;
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(text).then(() => {
            const orig = btn.textContent;
            btn.textContent = "Copied!";
            setTimeout(() => {
              btn.textContent = orig;
            }, 1600);
          });
        }
      });
    });

    // Direct Message mailto form
    const form = document.getElementById("contact-mail-form");
    if (form && config && config.personal) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const name = (document.getElementById("sender-name")?.value || "").trim();
        const email = (document.getElementById("sender-email")?.value || "").trim();
        const subject =
          (document.getElementById("sender-subject")?.value || "").trim() ||
          `Portfolio Inquiry from ${name || "Visitor"}`;
        const message = (document.getElementById("sender-message")?.value || "").trim();

        const bodyLines = [
          message,
          "",
          "---",
          `From: ${name}${email ? ` (${email})` : ""}`
        ];
        const mailtoUrl = `mailto:${config.personal.email}?subject=${encodeURIComponent(
          subject
        )}&body=${encodeURIComponent(bodyLines.join("\n"))}`;
        window.location.href = mailtoUrl;
      });
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const config = window.PORTFOLIO_CONFIG;
    populateFromConfig(config);
    setupMobileMenu();
    setupCopyAndMailHandlers(config);

    const animationsController = new window.AnimationsController();
    window.portfolioAnimations = animationsController;

    const videoController = new window.VideoController(config);
    const scrollController = new window.ScrollController(
      config,
      videoController,
      animationsController
    );

    // Dismiss loader once video frame 0 is ready
    document.addEventListener(
      "video:ready",
      () => {
        animationsController.dismissLoader();
        scrollController.updateScroll();
      },
      { once: true }
    );

    if (videoController.isReady) {
      animationsController.dismissLoader();
      scrollController.updateScroll();
    }

    // URL query support (?scroll=0.5) for automated visual verification of any scroll frame
    const params = new URLSearchParams(window.location.search);
    if (params.has("scroll")) {
      const pct = parseFloat(params.get("scroll"));
      if (!isNaN(pct)) {
        const applyQueryScroll = () => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          window.scrollTo(0, maxScroll * pct);
          scrollController.updateScroll();
          videoController.currentTime = videoController.targetTime;
          videoController.currentShiftX = videoController.targetShiftX;
          videoController.currentScale = videoController.targetScale;
          videoController.applyStageTransform();
          videoController.safeSeek(videoController.targetTime);
        };
        setTimeout(applyQueryScroll, 150);
        setTimeout(applyQueryScroll, 450);
      }
    }

    // Safety fallback to ensure loader always dismisses smoothly
    setTimeout(() => {
      animationsController.dismissLoader();
    }, 1800);
  });
})();
