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
  const QUOTE_GIF = "assets/quote-scrolling.gif";

  const showQuote = () => {
    quote.hidden = false;
    quoteImg.src = `${QUOTE_GIF}?t=${Date.now()}`;
  };
  const hideQuote = () => {
    quote.hidden = true;
  };

  magnifier.addEventListener("mouseenter", showQuote);
  magnifier.addEventListener("focus", showQuote);
  magnifier.addEventListener("mouseleave", hideQuote);
  magnifier.addEventListener("blur", hideQuote);
}

// ============ Footer year ============
const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}
