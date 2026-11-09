/**
 * VIDEO CONTROLLER — Smooth Scroll-Synchronized HTML5 Video Scrubbing Engine
 * Supports Split-Stage Desktop Composition AND Full-Screen 100vw × 100dvh
 * Mobile/Tablet Background Video with Scene-Aware Object Positioning.
 */

class VideoController {
  constructor(config) {
    this.config = config;
    this.video = document.getElementById("character-video");
    this.stageInner = document.getElementById("video-stage-inner");

    this.targetTime = 0;
    this.currentTime = 0;
    this.isSeeking = false;
    this.pendingTime = null;
    this.isReady = false;
    this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Smooth stage transform values (desktop)
    this.targetShiftX = config.timeline.sections[0].stageShiftX;
    this.currentShiftX = this.targetShiftX;
    this.targetShiftY = config.timeline.sections[0].stageShiftY || 4;
    this.currentShiftY = this.targetShiftY;
    this.targetScale = config.timeline.sections[0].stageScale;
    this.currentScale = this.targetScale;
    this.currentMobilePos = config.timeline.sections[0].mobileObjectPos || "50% 18%";

    this.applyStageTransform();
    this.init();
  }

  init() {
    if (!this.video) return;

    this.video.pause();
    this.video.muted = true;
    this.video.playsInline = true;

    const onLoaded = () => {
      if (this.isReady) return;
      this.isReady = true;
      if (window.innerWidth > 1024) {
        this.video.currentTime = 0.01;
      }
      document.dispatchEvent(new CustomEvent("video:ready"));
    };

    if (window.innerWidth <= 1024 || this.video.readyState >= 2) {
      onLoaded();
    } else {
      this.video.addEventListener("loadeddata", onLoaded, { once: true });
      this.video.addEventListener("canplay", onLoaded, { once: true });
      setTimeout(onLoaded, 2200);
    }

    this.video.addEventListener("seeking", () => {
      this.isSeeking = true;
    });

    this.video.addEventListener("seeked", () => {
      this.isSeeking = false;
      if (this.pendingTime !== null && Math.abs(this.pendingTime - this.video.currentTime) > 0.025) {
        const nextTime = this.pendingTime;
        this.pendingTime = null;
        this.safeSeek(nextTime);
      }
    });
  }

  /**
   * Directly receives the active DOM section config and its localProgress (0..1)
   * so that the character's video clip and stage position never desynchronize
   * regardless of dynamic section heights across desktop, tablet, or mobile.
   */
  setSectionProgress(activeSection, localProgress) {
    const clampedLocal = Math.max(0, Math.min(1, localProgress));

    this.targetTime =
      activeSection.videoStart +
      clampedLocal * (activeSection.videoEnd - activeSection.videoStart);

    // Desktop dynamic stage offset so character & studio props stay in their dedicated visual lane
    if (activeSection.id === "skills") {
      const walkFactor = Math.min(1, Math.max(0, (clampedLocal - 0.25) / 0.45));
      this.targetShiftX = -28 + walkFactor * 1.5; // -28% -> -26.5% so character stays inside left border and chair stays left of cards
      this.targetShiftY = activeSection.stageShiftY || 3;
      this.targetScale = 0.85;
    } else if (activeSection.id === "experience") {
      const pullBackFactor = Math.min(1, clampedLocal / 0.32);
      this.targetShiftX = activeSection.stageShiftX;
      this.targetShiftY = activeSection.stageShiftY || 4;
      this.targetScale = 0.84 + pullBackFactor * 0.08;
    } else {
      this.targetShiftX = activeSection.stageShiftX;
      this.targetShiftY = activeSection.stageShiftY || 4;
      this.targetScale = activeSection.stageScale;
    }

    // Scene-specific mobile object-position so the character stays centered in portrait viewports
    if (activeSection.mobileObjectPos && activeSection.mobileObjectPos !== this.currentMobilePos) {
      this.currentMobilePos = activeSection.mobileObjectPos;
      if (this.video) {
        this.video.style.setProperty("--mobile-obj-pos", this.currentMobilePos);
      }
    }

    return {
      activeSection,
      localProgress: clampedLocal,
      targetTime: this.targetTime
    };
  }

  tick() {
    if (!this.video || window.innerWidth <= 1024) return;

    const timeDiff = this.targetTime - this.currentTime;
    if (Math.abs(timeDiff) > 0.004) {
      if (Math.abs(timeDiff) > 2.5 || this.reducedMotion) {
        this.currentTime = this.targetTime;
      } else {
        this.currentTime += timeDiff * 0.26;
      }

      // Skip the built-in cross-dissolve deadzone (38.05s – 39.84s) at the end of Clip 4
      if (this.currentTime > 38.05 && this.currentTime < 39.84) {
        this.currentTime = timeDiff >= 0 ? 39.84 : 38.05;
      }

      this.safeSeek(this.currentTime);
    }

    const shiftDiffX = this.targetShiftX - this.currentShiftX;
    const shiftDiffY = this.targetShiftY - this.currentShiftY;
    const scaleDiff = this.targetScale - this.currentScale;

    if (
      Math.abs(shiftDiffX) > 0.02 ||
      Math.abs(shiftDiffY) > 0.02 ||
      Math.abs(scaleDiff) > 0.001
    ) {
      this.currentShiftX += shiftDiffX * 0.14;
      this.currentShiftY += shiftDiffY * 0.14;
      this.currentScale += scaleDiff * 0.14;
      this.applyStageTransform();
    }
  }

  applyStageTransform() {
    if (!this.stageInner) return;
    const width = window.innerWidth;
    if (width > 1024) {
      this.stageInner.style.transform = `translate3d(${this.currentShiftX.toFixed(2)}%, ${this.currentShiftY.toFixed(2)}%, 0) scale(${this.currentScale.toFixed(3)})`;
    } else if (width > 768) {
      // Hybrid tablet layout: gentler horizontal shift so character and floating glass panels harmonize
      const tabletShift = this.currentShiftX * 0.45;
      this.stageInner.style.transform = `translate3d(${tabletShift.toFixed(2)}%, 3%, 0) scale(0.92)`;
    } else {
      // Full-screen 100vw x 100dvh mobile stage
      this.stageInner.style.transform = "translate3d(0, 0, 0) scale(1)";
    }
  }

  safeSeek(timeSeconds) {
    const clampedTime = Math.max(0.01, Math.min(59.70, timeSeconds));
    if (Math.abs(this.video.currentTime - clampedTime) < 0.02) {
      return;
    }

    if (this.isSeeking) {
      this.pendingTime = clampedTime;
      return;
    }

    try {
      this.video.currentTime = clampedTime;
    } catch (e) {}
  }
}

window.VideoController = VideoController;
