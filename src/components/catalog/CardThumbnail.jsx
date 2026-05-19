import { useState } from 'react';
import { Link } from 'react-router-dom';
import { markAsFavouriteService } from '../../services/card.service';

export default function CardThumbnail({
  title, image, badge, badgeClass = 'badge-crown', to = '#',
  cardKey, isFavourite = false,
}) {
  const [fav, setFav] = useState(!!isFavourite);

  function onHeart(e) {
    e.preventDefault();
    e.stopPropagation();
    const next = !fav;
    setFav(next);
    if (cardKey) {
      markAsFavouriteService({ templatekey: cardKey, favourite: next ? '1' : '0', type: 'cards' });
    }
  }

  return (
    <Link
      to={to}
      className="thumb relative block aspect-[3/4] rounded-2xl overflow-hidden bg-slate-200 shadow-soft"
    >
      <img
        src={image}
        alt={title}
        className="w-full h-full object-cover"
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {badge === 'FREE' ? (
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${badgeClass || 'badge-free'}`}>
          FREE
        </span>
      ) : badge === 'CROWN' ? (
        <span className="absolute top-2 left-2 w-7 h-7 rounded-full bg-white shadow-soft flex items-center justify-center text-brand-gold" aria-label="Premium">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M5 16 2 7l5.5 4L12 4l4.5 7L22 7l-3 9H5zm-1 4h16v-2H4v2z" />
          </svg>
        </span>
      ) : null}
      <button
        type="button"
        className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-black/40 backdrop-blur flex items-center justify-center text-white${fav ? ' is-active' : ''}`}
        aria-label="Save to favourites"
        onClick={onHeart}
      >
        <svg className="w-4 h-4" fill={fav ? '#ef4444' : 'none'} stroke={fav ? '#ef4444' : 'currentColor'} strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      </button>
      {/* App-style solid bottom band matching CategoryTile — title sits on
          a translucent slate panel with a hint of blur. */}
      <div className="absolute inset-x-0 bottom-0 px-3 py-2 backdrop-blur-sm bg-slate-900/55">
        <p className="text-white font-semibold text-sm leading-tight truncate">
          {title}
        </p>
      </div>
    </Link>
  );
}
