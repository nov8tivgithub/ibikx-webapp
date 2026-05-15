export default function Footer() {
  return (
    <footer className="hidden lg:block border-t border-slate-100 px-8 py-6 text-xs text-slate-400">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <span>&copy; 2026 Mobilix IdeasCaards</span>
          <a href="#" className="hover:text-slate-600">Privacy</a>
          <a href="#" className="hover:text-slate-600">Terms</a>
          <a href="#" className="hover:text-slate-600">Support</a>
        </div>
        <a
          href="https://swizzleup.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-slate-400 hover:text-slate-600 transition"
        >
          Powered by <span className="font-semibold">Swizzle</span>
        </a>
      </div>
    </footer>
  );
}
