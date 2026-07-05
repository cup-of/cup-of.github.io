// ============ Frog cursor ============
// A frog follows the mouse. It faces the direction of travel and shows the
// "sitting" gif when the pointer is idle.
const cursor = document.getElementById("frogCursor");

if (cursor) {
  const IDLE_GIF = "assets/cursor-stationary.gif";
  const MOVE_GIF = "assets/cursor-left.gif";
  let idleTimer;

  document.addEventListener("mousemove", (event) => {
    cursor.style.left = `${event.clientX}px`;
    cursor.style.top = `${event.clientY}px`;

    // face the direction of horizontal travel
    if (event.movementX > 0) {
      cursor.style.transform = "translate(-50%, -50%) scaleX(-1)";
    } else if (event.movementX < 0) {
      cursor.style.transform = "translate(-50%, -50%) scaleX(1)";
    }

    if (cursor.style.backgroundImage !== `url("${MOVE_GIF}")`) {
      cursor.style.backgroundImage = `url("${MOVE_GIF}")`;
    }

    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      cursor.style.backgroundImage = `url("${IDLE_GIF}")`;
    }, 150);
  });
}
