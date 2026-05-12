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
      markAsFavouriteService({ templatekey: cardKey, value: next ? '1' : '0', type: 'cards' });
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
      {badge && (
        <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider ${badgeClass}`}>
          {badge}
        </span>
      )}
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
      <div className="absolute bottom-2 left-2 right-2 text-white text-sm font-semibold drop-shadow">{title}</div>
    </Link>
  );
}
