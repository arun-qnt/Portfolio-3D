# Arun S — Cinematic Liquid Glassmorphism Developer Portfolio

A modern, light-themed liquid glassmorphism and scroll-driven personal portfolio website built for **Arun S** (*Associate Software Engineer & Full-Stack Developer*). On desktop, a continuous studio character video (`portfolio-master.mp4`) scrubs smoothly forward and backward with scroll position while dynamically shifting across the stage so glass panels and typography never overlap the character.

---

## Technology Stack

* **HTML5** (`index.html`) — Semantic structure, accessible landmarks, preloaded poster image, and `<video>` stage.
* **CSS3** (`css/style.css`, `css/animations.css`, `css/responsive.css`) — Liquid glassmorphism surfaces (`backdrop-filter`), multi-layer flowing atmospheric smoke, 2D alpha `mask-image` video edge feathering, uniform `Plus Jakarta Sans` typographic hierarchy, and responsive tablet/mobile layout.
* **Vanilla JavaScript (ES6+)** (`js/config.js`, `js/video-controller.js`, `js/scroll-controller.js`, `js/animations.js`, `js/app.js`) — `requestAnimationFrame` DOM-locked scroll-to-video seeking engine, `IntersectionObserver` reveal choreography, interactive project/skill category filters, and centralized configuration.

---

## Project Structure

```text
.
├── index.html
├── README.md
├── css/
│   ├── style.css
│   ├── responsive.css
│   └── animations.css
├── js/
│   ├── app.js
│   ├── video-controller.js
│   ├── scroll-controller.js
│   ├── animations.js
│   └── config.js
└── assets/
    ├── videos/
    │   └── portfolio-master.mp4
    └── images/
        └── poster.jpg
```

---

## Running Locally & Deployment

Run with any static file server:

```bash
python3 -m http.server 8080
```

Then open `http://localhost:8080` in your browser. It can be deployed directly to **GitHub Pages**, **Netlify**, or **Vercel** with zero build steps.
