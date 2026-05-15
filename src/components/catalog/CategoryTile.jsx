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
      {/* App-style solid bottom band with a hint of blur — the title sits on
          a translucent slate panel rather than a smooth gradient, matching
          the mobile app's "My Videos / Free Videos" tile pattern. */}
      <div className="absolute inset-x-0 bottom-0 px-3 py-2 backdrop-blur-sm bg-slate-900/55">
        <p className="text-white font-semibold text-sm leading-tight truncate">
          {title}
        </p>
      </div>
    </Link>
  );
}
