import { useEffect, useRef, useState } from 'react';

// Coverflow-style carousel. `slides` is an array of React nodes; each one
// is wrapped in a .cover-slide. Active slide is centered and scaled up,
// neighbours fan out via the .pos-* classes (defined in index.css).
export default function CoverCarousel({ slides, ariaLabel = 'Carousel' }) {
  const n = slides.length;
  const [active, setActive] = useState(0);
  const [range, setRange] = useState(2);
  const rootRef = useRef(null);
  const draggingRef = useRef(false);
  const dragStartXRef = useRef(0);
  const dragDxRef = useRef(0);

  // Visible neighbours per side based on viewport width.
  useEffect(() => {
    function computeRange() {
      const w = window.innerWidth;
      let target = 2;
      if (w >= 1536) target = 4;
      else if (w >= 1280) target = 3;
      setRange(Math.min(target, Math.floor((n - 1) / 2)));
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

  function circOffset(i) {
    let off = i - active;
    if (off > n / 2) off -= n;
    if (off < -n / 2) off += n;
    return off;
  }

  function classFor(i) {
    const offset = circOffset(i);
    if (offset === 0) return 'pos-active';
    if (offset === -1) return 'pos-prev';
    if (offset === 1) return 'pos-next';
    if (offset === -2 && range >= 2) return 'pos-edge-l';
    if (offset === 2 && range >= 2) return 'pos-edge-r';
    if (offset === -3 && range >= 3) return 'pos-edge2-l';
    if (offset === 3 && range >= 3) return 'pos-edge2-r';
    if (offset === -4 && range >= 4) return 'pos-edge3-l';
    if (offset === 4 && range >= 4) return 'pos-edge3-r';
    return 'pos-hidden';
  }

  function next() { setActive((a) => (a + 1) % n); }
  function prev() { setActive((a) => (a - 1 + n) % n); }

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
    if (i !== active) { e.preventDefault(); setActive(i); }
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
      {slides.map((slide, i) => (
        <div
          key={i}
          className={`cover-slide ${classFor(i)}`}
          onClick={(e) => onSlideClick(e, i)}
        >
          {slide}
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
