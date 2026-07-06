import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { flag } from '../../config/media';

/**
 * Searchable country dropdown — replaces the cramped tile grid with a single
 * button that opens a scrollable, filterable list. Much easier to scan once
 * the active-country list grows past a handful of entries.
 */
function CountrySelect({ countries, value, onChange }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const ref = useRef(null);

  useEffect(() => {
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const selected = countries.find((c) => c.country_code === value);
  const filtered = countries.filter((c) =>
    c.country_name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-3 h-14 rounded-xl border border-ink-200 px-4 text-left hover:border-primary/40 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40"
      >
        {selected ? (
          <>
            <img src={flag(selected.country_code.toLowerCase(), 40)} alt="" className="w-7 h-5 object-cover rounded shadow-sm" />
            <span className="font-semibold text-ink-900 text-sm">{selected.country_name}</span>
          </>
        ) : (
          <span className="text-sm text-ink-700">Sélectionnez un pays</span>
        )}
        <svg
          className={`ml-auto w-4 h-4 text-ink-700 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-20 mt-2 w-full rounded-xl border border-ink-200 bg-white shadow-xl overflow-hidden"
          >
            <div className="p-2 border-b border-ink-200">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full h-9 rounded-lg bg-ink-100/70 px-3 text-sm text-ink-900 focus:outline-none"
              />
            </div>
            <ul className="max-h-56 overflow-y-auto">
              {filtered.length === 0 && (
                <li className="px-4 py-3 text-sm text-ink-700">Aucun pays trouvé.</li>
              )}
              {filtered.map((c) => (
                <li key={c.country_code}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(c.country_code);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm hover:bg-ink-100 transition-colors ${
                      value === c.country_code ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-ink-900'
                    }`}
                  >
                    <img src={flag(c.country_code.toLowerCase(), 40)} alt="" className="w-6 h-4.5 object-cover rounded shadow-sm" />
                    {c.country_name}
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CountrySelect;
