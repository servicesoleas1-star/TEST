import { useEffect, useState } from 'react';

/**
 * Preloads the country list in the background from `/api/countries`
 * (which reads the `country_config` table). If the table has no rows
 * configured yet, this resolves to an empty array — nothing is invented
 * client-side.
 */
export function useCountries() {
  const [countries, setCountries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/countries')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setCountries(data.ok ? data.countries : []);
      })
      .catch(() => {
        if (!cancelled) setCountries([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { countries, loading };
}
