// components/PhoneCountrySelect.jsx
//
// Champ combiné : sélecteur de pays (drapeau + indicatif) accolé au champ
// de saisie du numéro. Les deux valeurs (code pays, numéro) sont remontées
// séparément au formulaire parent, pour correspondre exactement aux 2
// champs distincts du schéma UML : User.phone_country_code et User.phone.
//
// La liste couvre désormais tous les pays du monde (phoneCountriesConfig.js)
// -- un <select> natif reste utilisable mais devient pénible à parcourir à
// ~195 entrées, d'où ce menu déroulant maison avec une barre de recherche
// (par nom ou indicatif) plutôt qu'un simple <select>.

import { useEffect, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import { getPhoneCountries } from './config/phoneCountriesConfig';

/**
 * @param {{
 *   countryCode: string,
 *   phone: string,
 *   onCountryChange: (code: string) => void,
 *   onPhoneChange: (phone: string) => void,
 *   error?: string
 * }} props
 */
export default function PhoneCountrySelect({
  countryCode,
  phone,
  onCountryChange,
  onPhoneChange,
  error,
}) {
  const countries = getPhoneCountries();
  const selected = countries.find((c) => c.code === countryCode) ?? countries[0];
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const rootRef = useRef(null);
  const searchRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open) searchRef.current?.focus();
  }, [open]);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = normalizedQuery
    ? countries.filter(
        (c) =>
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.dialCode.includes(normalizedQuery) ||
          c.code.toLowerCase().includes(normalizedQuery)
      )
    : countries;

  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-[color:var(--color-ink,#0B1324)]">
        Téléphone
      </label>
      <div
        ref={rootRef}
        className={`relative flex overflow-visible rounded-lg border ${
          error ? 'border-red-400' : 'border-[color:var(--color-border,#E2E8F0)]'
        }`}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Choisir un pays"
          className="flex items-center gap-1 border-r border-[color:var(--color-border,#E2E8F0)] bg-[color:var(--color-surface,#F5F6F8)]
                     px-2 text-sm focus:outline-none whitespace-nowrap"
        >
          <span>{selected.flag}</span>
          <span>{selected.dialCode}</span>
        </button>
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="6XX XXX XXX"
          className="w-full px-3 py-2 focus:outline-none"
        />

        {open && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-30 w-72 max-w-[85vw] rounded-lg border border-[color:var(--color-border,#E2E8F0)] bg-white shadow-xl">
            <div className="flex items-center gap-2 border-b border-[color:var(--color-border,#E2E8F0)] px-2.5 py-2">
              <Search size={14} className="text-ink-400 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un pays..."
                className="w-full text-sm focus:outline-none"
              />
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-ink-400">Aucun pays trouvé.</p>
              ) : (
                filtered.map((c) => (
                  <button
                    type="button"
                    key={c.code}
                    onClick={() => {
                      onCountryChange(c.code);
                      setOpen(false);
                      setQuery('');
                    }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-[color:var(--color-surface,#F5F6F8)] ${
                      c.code === selected.code ? 'bg-[color:var(--color-surface,#F5F6F8)] font-semibold' : ''
                    }`}
                  >
                    <span>{c.flag}</span>
                    <span className="flex-1 truncate">{c.name}</span>
                    <span className="text-ink-400">{c.dialCode}</span>
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
