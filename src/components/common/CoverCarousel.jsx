import { cloneElement, isValidElement, useEffect, useMemo, useRef, useState } from 'react';

// Coverflow-style carousel. `slides` is an array of React nodes; each one
// is wrapped in a .cover-slide. Active slide is centered and scaled up,
// neighbours fan out via the .pos-* classes (defined in index.css).
export default function CoverCarousel({ slides, ariaLabel = 'Carousel' }) {
  const [active, setActive] = useState(0);
  // Initial range is computed eagerly from the viewport so the first render
  // already matches the final layout. Without this, the carousel would mount
  // with range=2 and then jump to 3/4 in the next effect tick, producing a
  // visible self-scroll as every side slide animates into its new position.
  const [range, setRange] = useState(() => {
    if (typeof window === 'undefined') return 2;
    const w = window.innerWidth;
    if (w >= 1280) return 4;
    if (w >= 1024) return 3;
    return 2;
  });
  // If there are fewer real cards than visible slots for the current range,
  // pad the array by repeating cards (e.g. 7 cards on a 9-slot layout → cards
  // [0..6, 0, 1] so the side positions stay filled instead of leaving gaps).
  const paddedSlides = useMemo(() => {
    if (!slides.length) return slides;
    const min = range * 2 + 1;
    if (slides.length >= min) return slides;
    const out = [];
    for (let i = 0; i < min; i++) out.push(slides[i % slides.length]);
    return out;
  }, [slides, range]);
  const n = paddedSlides.length;
  // Indices whose offset wraps across the circular boundary on the current
  // transition (e.g. a slide jumping from far-left to far-right when there
  // are only 3 slides). Those get transition: none for one frame so they
  // snap to the new side instead of sliding across the carousel.
  const [skipTx, setSkipTx] = useState(() => new Set());
  const rootRef = useRef(null);
  const draggingRef = useRef(false);
  // null means "no drag in progress" — the pointer handlers below early-return
  // when this is null so plain mouse-hover events don't get mistaken for drags.
  const dragStartXRef = useRef(null);
  const dragDxRef = useRef(0);

  // Visible neighbours per side based on viewport width. We don't cap by the
  // raw slide count any more — paddedSlides duplicates cards to fill the slots
  // when there are too few. Below 3 unique cards we keep range small so the
  // user doesn't see the same card 3+ times on screen.
  useEffect(() => {
    function computeRange() {
      const w = window.innerWidth;
      let target = 2;
      if (w >= 1280) target = 4;        // 9 slots (active + 4 each side) on most laptops/desktops
      else if (w >= 1024) target = 3;   // 7 slots on tablets / smaller laptops
      const cap = slides.length >= 3
        ? target
        : Math.floor(Math.max(0, slides.length - 1) / 2);
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
  }, [slides.length]);

  function offsetFrom(i, base) {
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
    else cls = 'pos-hidden';
    return skipTx.has(i) ? `${cls} cover-skip-tx` : cls;
  }

  function setActiveSafely(newActive) {
    if (newActive === active) return;
    // Mark slides whose offset change is too large to animate cleanly — those
    // would otherwise fly across the carousel during a circular wrap.
    const wraps = new Set();
    for (let i = 0; i < n; i++) {
      const oldOff = offsetFrom(i, active);
      const newOff = offsetFrom(i, newActive);
      if (Math.abs(newOff - oldOff) > 1.5) wraps.add(i);
    }
    setSkipTx(wraps);
    setActive(newActive);
  }

  // After applying skipTx (no-transition snap), clear it next frame so the
  // affected slides resume normal transitions for the following move.
  useEffect(() => {
    if (skipTx.size === 0) return;
    const id = requestAnimationFrame(() =>
      requestAnimationFrame(() => setSkipTx(new Set()))
    );
    return () => cancelAnimationFrame(id);
  }, [skipTx]);

  function next() { setActiveSafely((active + 1) % n); }
  function prev() { setActiveSafely((active - 1 + n) % n); }

  // Drag handlers
  function onPointerDown(e) {
    if (e.target.closest('.cover-prev, .cover-next')) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    dragStartXRef.current = e.clientX;
    dragDxRef.current = 0;
    draggingRef.current = false;
  }
  function onPointerMove(e) {
    if (dragStartXRef.current === null) return;
    dragDxRef.current = e.clientX - dragStartXRef.current;
    if (!draggingRef.current && Math.abs(dragDxRef.current) > 8) {
      draggingRef.current = true;
      rootRef.current?.classList.add('is-dragging');
    }
  }
  function onPointerUp() {
    if (dragStartXRef.current === null) return;
    const dx = dragDxRef.current;
    dragStartXRef.current = null;
    rootRef.current?.classList.remove('is-dragging');
    if (Math.abs(dx) > 50) {
      dx < 0 ? next() : prev();
    }
    if (draggingRef.current) {
      // Block the click that may fire from the same pointer sequence.
      setTimeout(() => { draggingRef.current = false; }, 0);
    }
  }
  function onClickCapture(e) {
    if (draggingRef.current) { e.preventDefault(); e.stopPropagation(); }
  }
  function onSlideClick(e, i) {
    if (draggingRef.current) return;
    if (i !== active) { e.preventDefault(); setActiveSafely(i); }
  }

  return (
    <div
      ref={rootRef}
      className="cover-carousel mb-8"
      aria-label={ariaLabel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onPointerLeave={onPointerUp}
      onClickCapture={onClickCapture}
    >
      {paddedSlides.map((slide, i) => (
        <div
          key={i}
          className={`cover-slide ${classFor(i)}`}
          onClick={(e) => onSlideClick(e, i)}
        >
          {isValidElement(slide) ? cloneElement(slide, { isActive: i === active }) : slide}
        </div>
      ))}
      <button className="cover-prev" aria-label="Previous" onClick={(e) => { e.preventDefault(); prev(); }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button className="cover-next" aria-label="Next" onClick={(e) => { e.preventDefault(); next(); }}>
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
