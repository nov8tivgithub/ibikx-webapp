import { useEffect, useRef, useState } from 'react';

// Horizontal scroll row with prev/next arrows that fade in on hover when
// more content exists off-screen, plus mouse drag-to-scroll. Touch keeps
// native overflow scrolling.
export default function ScrollRow({ children, className = '' }) {
  const rowRef = useRef(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const dragRef = useRef({ isDown: false, dragged: false, startX: 0, startScroll: 0 });

  function updateArrows() {
    const row = rowRef.current;
    if (!row) return;
    const max = row.scrollWidth - row.clientWidth;
    const canScroll = max > 4;
    setShowPrev(canScroll && row.scrollLeft > 4);
    setShowNext(canScroll && row.scrollLeft < max - 4);
  }

  useEffect(() => {
    updateArrows();
    const t1 = setTimeout(updateArrows, 150);
    const t2 = setTimeout(updateArrows, 600);
    window.addEventListener('resize', updateArrows);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', updateArrows);
    };
  }, []);

  function step() {
    const row = rowRef.current;
    if (!row) return 200;
    const child = row.firstElementChild;
    if (child) return child.offsetWidth + 16;
    return Math.max(row.clientWidth * 0.7, 200);
  }

  function scrollBy(dir) {
    rowRef.current?.scrollBy({ left: dir * step(), behavior: 'smooth' });
  }

  function onPointerDown(e) {
    if (e.pointerType !== 'mouse') return;
    if (e.button !== 0) return;
    if (e.target.closest('.scroll-row-arrow')) return;
    dragRef.current = {
      isDown: true,
      dragged: false,
      startX: e.clientX,
      startScroll: rowRef.current.scrollLeft,
    };
  }
  function onPointerMove(e) {
    const d = dragRef.current;
    if (!d.isDown) return;
    const dx = e.clientX - d.startX;
    if (!d.dragged && Math.abs(dx) > 5) {
      d.dragged = true;
      rowRef.current?.classList.add('is-dragging');
    }
    if (d.dragged) {
      rowRef.current.scrollLeft = d.startScroll - dx;
      e.preventDefault();
    }
  }
  function endDrag() {
    const d = dragRef.current;
    if (!d.isDown) return;
    d.isDown = false;
    rowRef.current?.classList.remove('is-dragging');
    if (d.dragged) setTimeout(() => { d.dragged = false; }, 0);
  }
  function onClickCapture(e) {
    if (dragRef.current.dragged) { e.preventDefault(); e.stopPropagation(); }
  }

  return (
    <div className="scroll-row-wrap">
      <div
        ref={rowRef}
        className={`scroll-row pb-2 ${className}`}
        onScroll={updateArrows}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onPointerLeave={endDrag}
        onClickCapture={onClickCapture}
      >
        {children}
      </div>
      <button
        type="button"
        className={`scroll-row-arrow scroll-row-arrow-prev${showPrev ? ' is-visible' : ''}`}
        aria-label="Scroll left"
        onClick={() => scrollBy(-1)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <button
        type="button"
        className={`scroll-row-arrow scroll-row-arrow-next${showNext ? ' is-visible' : ''}`}
        aria-label="Scroll right"
        onClick={() => scrollBy(1)}
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>
  );
}
