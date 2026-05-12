import { useState } from 'react';

const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ml', label: 'Malayalam' },
  { code: 'ta', label: 'Tamil' },
  { code: 'gu', label: 'Gujarati' },
];

export default function LanguagePills({ defaultCode = 'en', onChange }) {
  const [active, setActive] = useState(defaultCode);
  function pick(code) {
    setActive(code);
    onChange?.(code);
  }
  return (
    <div className="flex flex-wrap gap-2">
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          data-lang={l.code}
          onClick={() => pick(l.code)}
          className={`px-4 py-1.5 rounded-full border border-slate-300 text-sm font-medium text-slate-700${active === l.code ? ' is-active' : ''}`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
