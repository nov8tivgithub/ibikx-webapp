import { cloneElement, isValidElement, useEffect, useRef, useState } from 'react';

// How many neighbours to show on each side of the active slide based on
// viewport width. Total visible slots = range * 2 + 1.
//   range 5 → 11 slots (≥1920)
//   range 4 →  9 slots (≥1280)
//   range 3 →  7 slots (≥1024)
//   range 2 →  5 slots (≥768)
//   range 1 →  3 slots (≥480)
//   range 0 →  1 slot  (mobile)
function rangeForViewport() {
  if (typeof window === 'undefined') return 2;
  const w = window.innerWidth;
  if (w >= 1920) return 5;
  if (w >= 1280) return 4;
  if (w >= 1024) return 3;
  if (w >=  768) return 2;
  if (w >=  480) return 1;
  return 0;
}

// Coverflow-style carousel. `slides` is an array of React nodes; each one
// is wrapped in a .cover-slide. Active slide is centered and scaled up,
// neighbours fan out via the .pos-* classes (defined in index.css).
//
// LOOPING: the carousel cycles through the available cards (active + 1 → ...
// → last → 0 again). It never duplicates a card to "fill" the layout — the
// range is capped at floor((n-1)/2) so e.g. 3 cards show as a 3-slot loop and
// 7 cards as a 7-slot loop.
export default function CoverCarousel({ slides, ariaLabel = 'Carousel' }) {
  const n = slides.length;
  const [active, setActive] = useState(0);
  // Initial range is computed eagerly from the viewport so the first render
  // already matches the final layout.
  const [range, setRange] = useState(() => rangeForViewport());
  // (No wrap-snap state any more — wraps animate naturally across the
  // carousel so the rotateY + translateX interpolation produces a circling
  // effect between sides.)
  const rootRef = useRef(null);
  const draggingRef = useRef(false);
  // null means "no drag in progress" — the pointer handlers below early-return
  // when this is null so plain mouse-hover events don't get mistaken for drags.
  const dragStartXRef = useRef(null);
  const dragDxRef = useRef(0);

  // Keep `active` in bounds if the slide count drops.
  useEffect(() => {
    if (n === 0) return;
    if (active >= n) setActive(0);
  }, [n, active]);

  // Range is the smaller of the viewport target and how many unique cards
  // we have on each side — so 3 cards never become a "7-with-repeats" loop.
  useEffect(() => {
    function computeRange() {
      const target = rangeForViewport();
      const cap = Math.floor(Math.max(0, n - 1) / 2);
      setRange(Math.max(0, Math.min(target, cap)));
    }
    computeRange();
    let timer;
    function onResize() {
      clearTimeout(timer);
      timer = setTimeout(computeRange, 120);
    }
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      clearTimeout(timer);
    };
  }, [n]);

  function offsetFrom(i, base) {
    if (n <= 1) return i - base;
    let off = i - base;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    return off;
  }
  function circOffset(i) { return offsetFrom(i, active); }

  function classFor(i) {
    const offset = circOffset(i);
    let cls;
    if (offset === 0) cls = 'pos-active';
    else if (offset === -1) cls = 'pos-prev';
    else if (offset === 1) cls = 'pos-next';
    else if (offset === -2 && range >= 2) cls = 'pos-edge-l';
    else if (offset === 2 && range >= 2) cls = 'pos-edge-r';
    else if (offset === -3 && range >= 3) cls = 'pos-edge2-l';
    else if (offset === 3 && range >= 3) cls = 'pos-edge2-r';
    else if (offset === -4 && range >= 4) cls = 'pos-edge3-l';
    else if (offset === 4 && range >= 4) cls = 'pos-edge3-r';
    else if (offset === -5 && range >= 5) cls = 'pos-edge4-l';
    else if (offset === 5 && range >= 5) cls = 'pos-edge4-r';
    else cls = 'pos-hidden';
    return cls;
  }

  function setActiveSafely(newActive) {
    if (newActive === active || n <= 1) return;
    setActive(newActive);
  }


  function next() { if (n > 1) setActiveSafely((active + 1) % n); }
  function prev() { if (n > 1) setActiveSafely((active - 1 + n) % n); }

  // Drag / swipe handlers. Pointer capture is intentionally deferred until
  // the gesture clears the 8px drag threshold — otherwise capture redirects
  // click target away from the inner <Link>, and taps stop navigating.
  // preventDefault on move (while dragging) keeps the browser from hijacking
  // the gesture for text selection / horizontal scroll.
  const capturedPointerRef = useRef(null);
  function onPointerDown(e) {
    if (e.target.closest('.cover-prev, .cover-next')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStartXRef.current = e.clientX;
    dragDxRef.current = 0;
    draggingRef.current = false;
    capturedPointerRef.current = null;
  }
  function onPointerMove(e) {
    if (dragStartXRef.current === null) return;
    dragDxRef.current = e.clientX - dragStartXRef.current;
    if (!draggingRef.current && Math.abs(dragDxRef.current) > 8) {
      draggingRef.current = true;
      rootRef.current?.classList.add('is-dragging');
      // Only NOW grab pointer capture — taps short-circuited before this so
      // the browser's normal click → <Link> path is preserved.
      try {
        rootRef.current?.setPointerCapture(e.pointerId);
        capturedPointerRef.current = e.pointerId;
      } catch { /* noop */ }
    }
    if (draggingRef.current) {
      // Stop the browser from interpreting this as a horizontal scroll /
      // selection. Cancelable check guards against passive-listener errors.
      if (e.cancelable) e.preventDefault();
    }
  }
  function onPointerUp(e) {
    if (dragStartXRef.current === null) return;
    const dx = dragDxRef.current;
    dragStartXRef.current = null;
    rootRef.current?.classList.remove('is-dragging');
    if (capturedPointerRef.current !== null) {
      try { rootRef.current?.releasePointerCapture(capturedPointerRef.current); } catch { /* noop */ }
      capturedPointerRef.current = null;
    }
    if (Math.abs(dx) > 40) {
      dx < 0 ? next() : prev();
    }
    if (draggingRef.current) {
      // Block the synthetic click that may fire from the same pointer sequence.
      setTimeout(() => { draggingRef.current = false; }, 0);
    }
  }
  function onClickCapture(e) {
    if (draggingRef.current) { e.preventDefault(); e.stopPropagation(); }
  }
  // Runs in the CAPTURE phase so it fires before any child <Link>/<a> click
  // handler. For non-active slides we cancel the click outright and just
  // focus that slide; only the active slide's click is allowed to bubble into
  // the Link and navigate to its detail page.
  function onSlideClickCapture(e, i) {
    if (draggingRef.current) return;
    if (i !== active) {
      e.preventDefault();
      e.stopPropagation();
      setActiveSafely(i);
    }
  }

  // Single-card shortcut: no arrows, no drag plumbing, just the slide.
  if (n === 1) {
    return (
      <div className="cover-carousel mb-4" aria-label={ariaLabel}>
        <div className="cover-slide pos-active">
          {isValidElement(slides[0]) ? cloneElement(slides[0], { isActive: true }) : slides[0]}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={rootRef}
      className="cover-carousel mb-4"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClickCapture={onClickCapture}
      // Stops the browser's built-in image/anchor drag ghost — without this
      // pressing on the active card triggers native drag and pointer events
      // stop flowing for the rest of the gesture.
      onDragStart={(e) => e.preventDefault()}
    >
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`cover-slide ${classFor(i)}`}
          onClickCapture={(e) => onSlideClickCapture(e, i)}
        >
          {isValidElement(slide) ? cloneElement(slide, { isActive: i === active }) : slide}
        </div>
      ))}
      {/* <button className="cover-prev" aria-label="Previous" onClick={(e) => { e.preventDefault(); prev(); }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="cover-next" aria-label="Next" onClick={(e) => { e.preventDefault(); next(); }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button> */}
    </div>
  );
}
