/* ============================================================
   HERO — Cursor-follow parallax for cat image
   ============================================================ */
(function () {
  'use strict';

  const CAT_INNER = document.getElementById('catInner');
  const CAT_STAGE = document.getElementById('catStage');
  if (!CAT_INNER || !CAT_STAGE) return;

  let targetX = 0, targetY = 0;
  let currentX = 0, currentY = 0;
  let rafId = null;
  let isIdle = true;
  let idleTimer = null;

  /* Clamp helper */
  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  /* Linear interpolation */
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /* Convert mouse position → normalised offset from cat centre */
  function onMouseMove(e) {
    const rect = CAT_STAGE.getBoundingClientRect();
    if (rect.width === 0) return;

    const centreX = rect.left + rect.width  * 0.5;
    const centreY = rect.top  + rect.height * 0.38; // head is ~38% down

    /* Normalise to [-1, 1] relative to viewport half */
    const nx = (e.clientX - centreX) / (window.innerWidth  * 0.5);
    const ny = (e.clientY - centreY) / (window.innerHeight * 0.5);

    /* Limit travel: max ±16px horizontal, ±10px vertical */
    targetX = clamp(nx * 16, -16, 16);
    targetY = clamp(ny * 10, -10, 10);

    isIdle = false;
    clearTimeout(idleTimer);

    /* Return to centre after 3s of no movement */
    idleTimer = setTimeout(() => {
      isIdle = true;
      targetX = 0;
      targetY = 0;
    }, 3000);
  }

  /* Smooth animation loop */
  function tick() {
    const speed = isIdle ? 0.04 : 0.085;
    currentX = lerp(currentX, targetX, speed);
    currentY = lerp(currentY, targetY, speed);

    const tiltX = clamp(currentY * -0.4, -4, 4); // subtle tilt: mouse-up → nose-up
    const tiltY = clamp(currentX *  0.3, -4, 4);

    CAT_INNER.style.transform =
      `translate(${currentX.toFixed(2)}px, ${currentY.toFixed(2)}px)
       rotateX(${tiltX.toFixed(2)}deg)
       rotateY(${tiltY.toFixed(2)}deg)`;

    rafId = requestAnimationFrame(tick);
  }

  /* Touch / mobile: gentle idle float instead */
  function isTouchPrimary() {
    return window.matchMedia('(hover: none)').matches;
  }

  function initFloat() {
    CAT_INNER.style.animation = 'gentle-float 4s ease-in-out infinite';
  }

  /* Boot */
  if (isTouchPrimary()) {
    initFloat();
  } else {
    CAT_INNER.style.willChange = 'transform';
    CAT_INNER.style.transformStyle = 'preserve-3d';
    document.addEventListener('mousemove', onMouseMove, { passive: true });
    tick();
  }

  /* Pause when tab hidden */
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(rafId);
    } else if (!isTouchPrimary()) {
      tick();
    }
  });
})();
