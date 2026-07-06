// ============ Frog cursor ============
// A frog follows the mouse. It faces the direction of travel and shows the
// "sitting" gif when the pointer is idle.
const cursor = document.getElementById("frogCursor");

if (cursor) {
  const IDLE_GIF = 'url("assets/cursor-stationary.gif")';
  const MOVE_GIF = 'url("assets/cursor-left.gif")';
  let idleTimer;

  document.addEventListener("mousemove", (event) => {
    cursor.style.opacity = "1";
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;

    // face the direction of horizontal travel
    if (event.movementX > 0) {
      cursor.style.transform = "translate(-50%, -50%) scaleX(-1)";
    } else if (event.movementX < 0) {
      cursor.style.transform = "translate(-50%, -50%) scaleX(1)";
    }

    if (cursor.style.backgroundImage !== MOVE_GIF) {
      cursor.style.backgroundImage = MOVE_GIF;
    }

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      cursor.style.backgroundImage = IDLE_GIF;
    }, 150);
  });
}

// ============ Magnifier speech bubble (just for fun) ============
// Hovering (or focusing) the magnifier reveals the ostrich's speech bubble.
// Re-setting the gif src with a cache-busting query restarts its scroll-in.
const magnifier = document.getElementById("magnifierBtn");
const quote = document.getElementById("quote");
const quoteImg = document.getElementById("quoteImg");

if (magnifier && quote && quoteImg) {
  const SCROLL_GIF = "assets/quote-scrolling.gif";
  const IDLE_GIF = "assets/quote-stationary.gif";
  const SCROLL_MS = 1820; // full length of the scroll-in gif (26 frames)
  let swapTimer;

  const showQuote = () => {
    quote.hidden = false;
    // Restart the scroll-in from frame 0 (cache-bust forces a replay).
    quoteImg.src = `${SCROLL_GIF}?t=${Date.now()}`;
    // Once it has played through once, switch to the idle gif so the
    // scroll-in doesn't loop.
    clearTimeout(swapTimer);
    swapTimer = setTimeout(() => {
      quoteImg.src = IDLE_GIF;
    }, SCROLL_MS);
  };
  const hideQuote = () => {
    clearTimeout(swapTimer);
    quote.hidden = true;
  };

  magnifier.addEventListener("mouseenter", showQuote);
  magnifier.addEventListener("focus", showQuote);
  magnifier.addEventListener("mouseleave", hideQuote);
  magnifier.addEventListener("blur", hideQuote);
}

// ============ Wavy nav + dock-style hover magnification ============
// Each nav letter becomes its own span so we can (1) offset it along a sine
// wave to echo the band, and (2) scale it based on cursor proximity on hover
// (like the macOS dock). No library needed — just distance math + a falloff.
const navList = document.querySelector(".nav__list");
const navBand = document.querySelector(".nav-band");
const navWave = document.querySelector(".nav-band__wave");

if (navList) {
  // The band's SVG wave repeats 6 times across its width, and its quadratic
  // curves peak at ~0.2 of the wave element's rendered height. We derive the
  // text wave from those so the letters sit on the wave behind them.
  const WAVE_PERIODS = 6;
  const WAVE_AMP_RATIO = 0.2;
  const DOCK_MAX_SCALE = 1.65; // biggest a letter grows under the cursor
  const DOCK_RANGE = 95; // px of influence on either side of the cursor
  const DOCK_LIFT = 7; // px a magnified letter rises

  const chars = [];

  document.querySelectorAll(".nav__list a").forEach((link) => {
    const label = link.textContent;
    link.setAttribute("aria-label", label);
    link.textContent = "";

    for (const ch of label) {
      const span = document.createElement("span");
      span.className = "nav__char";
      span.setAttribute("aria-hidden", "true");
      span.textContent = ch === " " ? "\u00A0" : ch;
      link.appendChild(span);
      chars.push({ el: span, cx: 0, wx: 0, waveY: 0, waveAngle: 0, isDot: false });
    }
  });

  // Separator dots as real elements so they ride the wave with the letters.
  const items = [...navList.querySelectorAll("li")];
  items.forEach((li, i) => {
    if (i === items.length - 1) return;
    const dot = document.createElement("span");
    dot.className = "nav__dot";
    dot.setAttribute("aria-hidden", "true");
    li.appendChild(dot);
    chars.push({ el: dot, cx: 0, wx: 0, waveY: 0, waveAngle: 0, isDot: true });
  });

  const applyWave = (c) => {
    c.el.style.transform = `translateY(${c.waveY}px) rotate(${c.waveAngle}deg)`;
  };

  // Measure each letter's resting center, then place it on the same wave the
  // band draws. Rotation follows the wave's local slope so the text reads as a
  // curved ribbon that tracks the crests and troughs behind it.
  const layout = () => {
    const band = navBand
      ? navBand.getBoundingClientRect()
      : { left: 0, width: window.innerWidth };
    const width = band.width || window.innerWidth;
    const waveHeight = navWave ? navWave.getBoundingClientRect().height : 44;
    const omega = (WAVE_PERIODS * 2 * Math.PI) / width;
    const amp = WAVE_AMP_RATIO * waveHeight;

    chars.forEach((c) => (c.el.style.transform = "none"));
    chars.forEach((c) => {
      const rect = c.el.getBoundingClientRect();
      c.cx = rect.left + rect.width / 2; // viewport x, used by the dock effect
      c.wx = c.cx - band.left; // x within the band, used by the wave
    });
    chars.forEach((c) => {
      c.waveY = -amp * Math.sin(omega * c.wx);
      const slope = -amp * omega * Math.cos(omega * c.wx);
      c.waveAngle = (Math.atan(slope) * 180) / Math.PI;
      applyWave(c);
    });
  };

  const magnify = (pointerX) => {
    chars.forEach((c) => {
      if (c.isDot) {
        applyWave(c);
        return;
      }
      const t = Math.max(0, 1 - Math.abs(pointerX - c.cx) / DOCK_RANGE);
      const eased = t * t * (3 - 2 * t); // smoothstep falloff
      const scale = 1 + (DOCK_MAX_SCALE - 1) * eased;
      const lift = DOCK_LIFT * eased;
      c.el.style.transform = `translateY(${c.waveY - lift}px) rotate(${c.waveAngle}deg) scale(${scale})`;
    });
  };

  const resetMagnify = () => chars.forEach(applyWave);

  navList.addEventListener("pointermove", (e) => magnify(e.clientX));
  navList.addEventListener("pointerleave", resetMagnify);

  let resizeRaf;
  window.addEventListener("resize", () => {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(layout);
  });

  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(layout);
  }
  layout();
}

// ============ Footer year ============
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
