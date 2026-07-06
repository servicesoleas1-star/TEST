import { useEffect, useState } from 'react';

/**
 * Preloads payment operators in the background from `/api/payment-methods`
 * (which reads the `payment_methods` / Aggregator table). If nothing is
 * configured yet, this resolves to an empty array — no fallback list is
 * invented client-side. Each row is expected to carry a `logo_url` pointing
 * at the operator's real brand logo; the UI falls back to initials only if
 * that logo fails to load.
 */
export function usePaymentMethods() {
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/payment-methods')
      .then((r) => r.json())
      .then((data) => {
        if (!cancelled) setMethods(data.ok ? data.methods : []);
      })
      .catch(() => {
        if (!cancelled) setMethods([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { methods, loading };
}
