import { Link } from 'react-router-dom';

export default function CategoryTile({ title, image, to }) {
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/15 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 text-white font-semibold text-base drop-shadow">
        {title}
      </div>
    </Link>
  );
}
